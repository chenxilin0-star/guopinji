import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import authRoutes from './routes/auth';
import jobsRoutes from './routes/jobs';
import companiesRoutes from './routes/companies';
import codesRoutes from './routes/codes';
import subscriptionsRoutes from './routes/subscriptions';
import adminRoutes from './routes/admin';
import type { Env } from './db';

import { runAllCrawlers } from './crawlers';

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({
  origin: ['https://guopinji.pages.dev', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use('*', logger());
app.use('*', prettyJSON());

// 健康检查
app.get('/health', (c) => c.json({ status: 'ok', time: new Date().toISOString() }));

// API 路由
app.route('/api/v1/auth', authRoutes);
app.route('/api/v1/jobs', jobsRoutes);
app.route('/api/v1/companies', companiesRoutes);
app.route('/api/v1/codes', codesRoutes);
app.route('/api/v1/subscriptions', subscriptionsRoutes);
app.route('/api/v1/admin', adminRoutes);

// 首页统计
app.get('/api/v1/stats/home', async (c) => {
  const cacheKey = 'stats:home';
  const cached = await c.env.CACHE.get(cacheKey);
  if (cached) return c.json(JSON.parse(cached));

  const { results: jobStats } = await c.env.DB.prepare('SELECT COUNT(*) as total FROM jobs WHERE is_deleted = 0').all();
  const { results: companyStats } = await c.env.DB.prepare('SELECT COUNT(*) as total FROM companies').all();
  const { results: todayJobs } = await c.env.DB.prepare(
    `SELECT COUNT(*) as total FROM jobs WHERE created_at >= date('now') AND is_deleted = 0`
  ).all();

  const result = {
    total_jobs: (jobStats?.[0] as any)?.total || 0,
    total_companies: (companyStats?.[0] as any)?.total || 0,
    today_jobs: (todayJobs?.[0] as any)?.total || 0,
  };

  await c.env.CACHE.put(cacheKey, JSON.stringify(result), { expirationTtl: 600 });
  return c.json(result);
});

// 404
app.notFound((c) => c.json({ error: 'Not Found' }, 404));

// 错误处理
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Internal Server Error', message: err.message }, 500);
});

// 管理员：手动触发爬虫
app.post('/api/v1/admin/crawl', async (c) => {
  try {
    const results = await runAllCrawlers({ DB: c.env.DB, CACHE: c.env.CACHE, fetch });
    return c.json({ success: true, results });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// Cron Trigger 处理
export default {
  fetch: app.fetch,
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    switch (event.cron) {
      case '0 */6 * * *':
        // 每6小时爬虫
        console.log('[Cron] 开始爬虫任务');
        ctx.waitUntil(
          runAllCrawlers({ DB: env.DB, CACHE: env.CACHE, fetch }).then((results) => {
            console.log('[Cron] 爬虫完成:', JSON.stringify(results));
          }).catch((err) => {
            console.error('[Cron] 爬虫失败:', err);
          })
        );
        break;
      case '0 8 * * *':
        // 每日8点推送
        await env.EMAIL_QUEUE.send({ type: 'daily_push', time: new Date().toISOString() });
        break;
      case '0 2 * * *':
        // 每日凌晨2点过期检测
        await env.DB.prepare(`UPDATE jobs SET status = 'expired' WHERE apply_end_date < date('now') AND status = 'active'`).run();
        await env.DB.prepare(`UPDATE user_subscriptions SET is_active = 0 WHERE expires_at < datetime('now') AND is_active = 1`).run();
        break;
    }
  },
  async queue(batch: MessageBatch<any>, env: Env, ctx: ExecutionContext) {
    for (const message of batch.messages) {
      if (batch.queue === 'crawl-queue') {
        // 爬虫任务处理
        console.log('[Queue] 爬虫任务:', message.body);
        ctx.waitUntil(
          runAllCrawlers({ DB: env.DB, CACHE: env.CACHE, fetch }).then((results) => {
            console.log('[Queue] 爬虫完成:', JSON.stringify(results));
            message.ack();
          }).catch((err) => {
            console.error('[Queue] 爬虫失败:', err);
            message.retry();
          })
        );
      } else if (batch.queue === 'email-queue') {
        // 邮件推送处理
        console.log('[Queue] 邮件任务:', message.body);
        message.ack();
      }
    }
  },
};
