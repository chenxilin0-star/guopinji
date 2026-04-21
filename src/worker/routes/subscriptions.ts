import { Hono } from 'hono';
import { queryAll, queryFirst, run } from '../db';
import { authMiddleware } from '../middleware/auth';
import type { Env } from '../db';
import type { Subscription } from '../types';

const app = new Hono<{ Bindings: Env; Variables: { user: { userId: number; email: string } } }>();

// 获取我的订阅条件
app.get('/', authMiddleware, async (c) => {
  const user = c.get('user');
  const subs = await queryAll<Subscription>(c.env.DB,
    'SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC',
    [user.userId]
  );
  return c.json({ data: subs });
});

// 创建订阅条件
app.post('/', authMiddleware, async (c) => {
  const user = c.get('user');
  const body = await c.req.json<Partial<Subscription>>();

  const result = await run(c.env.DB,
    `INSERT INTO subscriptions (user_id, keyword, industry, province, city, company_type, education, job_type)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user.userId,
      body.keyword || null,
      body.industry || null,
      body.province || null,
      body.city || null,
      body.company_type || null,
      body.education || null,
      body.job_type || null,
    ]
  );

  const sub = await queryFirst<Subscription>(c.env.DB,
    'SELECT * FROM subscriptions WHERE id = ?',
    [result.meta.last_row_id]
  );

  return c.json({ data: sub }, 201);
});

// 更新订阅条件
app.put('/:id', authMiddleware, async (c) => {
  const user = c.get('user');
  const id = parseInt(c.req.param('id'), 10);
  const body = await c.req.json<Partial<Subscription>>();

  const existing = await queryFirst<Subscription>(c.env.DB,
    'SELECT * FROM subscriptions WHERE id = ? AND user_id = ?',
    [id, user.userId]
  );
  if (!existing) return c.json({ error: '订阅不存在' }, 404);

  await run(c.env.DB,
    `UPDATE subscriptions SET
      keyword = COALESCE(?, keyword),
      industry = COALESCE(?, industry),
      province = COALESCE(?, province),
      city = COALESCE(?, city),
      company_type = COALESCE(?, company_type),
      education = COALESCE(?, education),
      job_type = COALESCE(?, job_type)
     WHERE id = ?`,
    [
      body.keyword, body.industry, body.province, body.city,
      body.company_type, body.education, body.job_type, id,
    ]
  );

  const sub = await queryFirst<Subscription>(c.env.DB, 'SELECT * FROM subscriptions WHERE id = ?', [id]);
  return c.json({ data: sub });
});

// 删除/取消订阅
app.delete('/:id', authMiddleware, async (c) => {
  const user = c.get('user');
  const id = parseInt(c.req.param('id'), 10);

  await run(c.env.DB,
    'DELETE FROM subscriptions WHERE id = ? AND user_id = ?',
    [id, user.userId]
  );

  return c.json({ message: '已取消订阅' });
});

export default app;
