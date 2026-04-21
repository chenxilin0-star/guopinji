import { Hono } from 'hono';
import { queryAll, queryFirst, run } from '../db';
import { authMiddleware } from '../middleware/auth';
import { generateCode } from '../utils/code';
import type { Env } from '../db';

const app = new Hono<{ Bindings: Env; Variables: { user: { userId: number; email: string } } }>();

// 简单的管理员检查中间件
const adminMiddleware = async (c: any, next: any) => {
  const user = c.get('user');
  // 这里简单约定：id <= 10 的用户为管理员，生产环境应使用 roles 字段
  if (user.userId > 10) {
    return c.json({ error: '无权访问' }, 403);
  }
  await next();
};

// 生成 Code 码
app.post('/codes/generate', authMiddleware, adminMiddleware, async (c) => {
  const { plan_id, count = 1 } = await c.req.json<{ plan_id: number; count?: number }>();

  if (!plan_id || count < 1 || count > 100) {
    return c.json({ error: '参数错误' }, 400);
  }

  const plan = await queryFirst<{ code_prefix: string }>(c.env.DB,
    'SELECT code_prefix FROM subscription_plans WHERE id = ?',
    [plan_id]
  );
  if (!plan) return c.json({ error: '套餐不存在' }, 404);

  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    let code: string;
    let exists = true;
    let attempts = 0;
    do {
      code = generateCode(plan.code_prefix);
      const row = await queryFirst(c.env.DB, 'SELECT id FROM codes WHERE code = ?', [code]);
      exists = !!row;
      attempts++;
    } while (exists && attempts < 10);

    if (exists) {
      return c.json({ error: '生成Code码失败，请重试' }, 500);
    }

    await run(c.env.DB,
      'INSERT INTO codes (code, plan_id) VALUES (?, ?)',
      [code, plan_id]
    );
    codes.push(code);
  }

  return c.json({ data: codes, count: codes.length });
});

// Code 码列表
app.get('/codes', authMiddleware, adminMiddleware, async (c) => {
  const status = c.req.query('status') || '';
  const page = Math.max(1, parseInt(c.req.query('page') || '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(c.req.query('pageSize') || '20', 10)));
  const offset = (page - 1) * pageSize;

  let where = '1=1';
  const params: unknown[] = [];
  if (status) {
    where += ' AND status = ?';
    params.push(status);
  }

  const countResult = await queryFirst<{ total: number }>(c.env.DB, `SELECT COUNT(*) as total FROM codes WHERE ${where}`, params);
  const total = countResult?.total || 0;

  const codes = await queryAll(c.env.DB,
    `SELECT c.*, p.name as plan_name, p.duration_days, p.price
     FROM codes c
     JOIN subscription_plans p ON c.plan_id = p.id
     WHERE ${where}
     ORDER BY c.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );

  return c.json({
    data: codes,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
});

// 统计数据
app.get('/stats', authMiddleware, adminMiddleware, async (c) => {
  const userCount = await queryFirst<{ count: number }>(c.env.DB, 'SELECT COUNT(*) as count FROM users');
  const jobCount = await queryFirst<{ count: number }>(c.env.DB, 'SELECT COUNT(*) as count FROM jobs WHERE is_deleted = 0');
  const companyCount = await queryFirst<{ count: number }>(c.env.DB, 'SELECT COUNT(*) as count FROM companies');
  const activeSubCount = await queryFirst<{ count: number }>(c.env.DB,
    `SELECT COUNT(*) as count FROM user_subscriptions WHERE is_active = 1 AND expires_at > datetime('now')`
  );
  const todayRedeem = await queryFirst<{ count: number }>(c.env.DB,
    `SELECT COUNT(*) as count FROM codes WHERE status = 'redeemed' AND redeemed_at >= date('now')`
  );

  return c.json({
    users: userCount?.count || 0,
    jobs: jobCount?.count || 0,
    companies: companyCount?.count || 0,
    active_subscriptions: activeSubCount?.count || 0,
    today_redeemed: todayRedeem?.count || 0,
  });
});

export default app;
