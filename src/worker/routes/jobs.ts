import { Hono } from 'hono';
import { queryAll, queryFirst } from '../db';
import { optionalAuthMiddleware, authMiddleware } from '../middleware/auth';
import { rateLimitMiddleware } from '../middleware/rateLimit';
import type { Env } from '../db';
import type { Job } from '../types';

const app = new Hono<{ Bindings: Env; Variables: { user?: { userId: number; email: string } } }>();

// 搜索职位
app.get('/', optionalAuthMiddleware, rateLimitMiddleware, async (c) => {
  const q = c.req.query('q') || '';
  const province = c.req.query('province') || '';
  const city = c.req.query('city') || '';
  const industry = c.req.query('industry') || '';
  const companyType = c.req.query('company_type') || '';
  const education = c.req.query('education') || '';
  const jobType = c.req.query('job_type') || '';
  const page = Math.max(1, parseInt(c.req.query('page') || '1', 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(c.req.query('pageSize') || '20', 10)));
  const offset = (page - 1) * pageSize;

  const cacheKey = `search:${q}:${province}:${city}:${industry}:${companyType}:${education}:${jobType}:${page}:${pageSize}`;
  const cached = await c.env.CACHE.get(cacheKey);
  if (cached) {
    return c.json(JSON.parse(cached));
  }

  let where = 'j.is_deleted = 0 AND j.status = \'active\'';
  const params: unknown[] = [];

  if (q) {
    where += ` AND (j.title LIKE ? OR j.description LIKE ? OR j.requirements LIKE ?)`;
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  if (province) {
    where += ' AND j.province = ?';
    params.push(province);
  }
  if (city) {
    where += ' AND j.city = ?';
    params.push(city);
  }
  if (industry) {
    where += ' AND c.industry = ?';
    params.push(industry);
  }
  if (companyType) {
    where += ' AND c.company_type = ?';
    params.push(companyType);
  }
  if (education) {
    where += ' AND j.education = ?';
    params.push(education);
  }
  if (jobType) {
    where += ' AND j.job_type = ?';
    params.push(jobType);
  }

  const countSql = `SELECT COUNT(*) as total FROM jobs j LEFT JOIN companies c ON j.company_id = c.id WHERE ${where}`;
  const countResult = await queryFirst<{ total: number }>(c.env.DB, countSql, params);
  const total = countResult?.total || 0;

  const sql = `
    SELECT j.*, c.name as company_name, c.company_type, c.industry
    FROM jobs j
    LEFT JOIN companies c ON j.company_id = c.id
    WHERE ${where}
    ORDER BY j.publish_date DESC, j.created_at DESC
    LIMIT ? OFFSET ?
  `;
  const jobs = await queryAll<Job & { company_name: string; company_type: string; industry: string }>(c.env.DB, sql, [...params, pageSize, offset]);

  const result = {
    data: jobs,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };

  await c.env.CACHE.put(cacheKey, JSON.stringify(result), { expirationTtl: 300 });
  return c.json(result);
});

// 职位详情
app.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  if (isNaN(id)) return c.json({ error: '无效ID' }, 400);

  const job = await queryFirst<Job & { company_name: string; company_type: string; industry: string; company_description: string; company_website: string; company_logo_url: string }>(c.env.DB, `
    SELECT j.*,
      c.name as company_name, c.company_type, c.industry,
      c.description as company_description, c.website as company_website, c.logo_url as company_logo_url
    FROM jobs j
    LEFT JOIN companies c ON j.company_id = c.id
    WHERE j.id = ? AND j.is_deleted = 0
  `, [id]);

  if (!job) return c.json({ error: '职位不存在' }, 404);
  return c.json(job);
});

// 收藏职位
app.post('/:id/favorite', authMiddleware, async (c) => {
  const user = c.get('user');
  const jobId = parseInt(c.req.param('id'), 10);
  if (isNaN(jobId)) return c.json({ error: '无效ID' }, 400);

  const job = await queryFirst(c.env.DB, 'SELECT id FROM jobs WHERE id = ?', [jobId]);
  if (!job) return c.json({ error: '职位不存在' }, 404);

  try {
    await c.env.DB.prepare('INSERT INTO favorites (user_id, job_id) VALUES (?, ?)').bind(user.userId, jobId).run();
    return c.json({ message: '收藏成功' });
  } catch (e: any) {
    if (e.message && e.message.includes('UNIQUE constraint failed')) {
      return c.json({ message: '已收藏' });
    }
    throw e;
  }
});

// 取消收藏
app.delete('/:id/favorite', authMiddleware, async (c) => {
  const user = c.get('user');
  const jobId = parseInt(c.req.param('id'), 10);
  await c.env.DB.prepare('DELETE FROM favorites WHERE user_id = ? AND job_id = ?').bind(user.userId, jobId).run();
  return c.json({ message: '已取消收藏' });
});

// 我的收藏
app.get('/favorites/mine', authMiddleware, async (c) => {
  const user = c.get('user');
  const page = Math.max(1, parseInt(c.req.query('page') || '1', 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(c.req.query('pageSize') || '20', 10)));
  const offset = (page - 1) * pageSize;

  const sql = `
    SELECT j.*, c.name as company_name
    FROM favorites f
    JOIN jobs j ON f.job_id = j.id
    LEFT JOIN companies c ON j.company_id = c.id
    WHERE f.user_id = ? AND j.is_deleted = 0
    ORDER BY f.created_at DESC
    LIMIT ? OFFSET ?
  `;
  const jobs = await queryAll<Job & { company_name: string }>(c.env.DB, sql, [user.userId, pageSize, offset]);
  return c.json({ data: jobs });
});

export default app;
