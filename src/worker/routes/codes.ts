import { Hono } from 'hono';
import { queryFirst, run } from '../db';
import { authMiddleware } from '../middleware/auth';
import type { Env } from '../db';

const app = new Hono<{ Bindings: Env; Variables: { user: { userId: number; email: string } } }>();

// 兑换 Code 码
app.post('/redeem', authMiddleware, async (c) => {
  const user = c.get('user');
  const { code } = await c.req.json<{ code: string }>();

  if (!code || !/^GP-(7D|15D|30D)-[A-HJ-NP-Z2-9]{8}$/.test(code)) {
    return c.json({ error: 'Code码格式不正确' }, 400);
  }

  const codeRecord = await queryFirst<{ id: number; plan_id: number; status: string }>(c.env.DB,
    'SELECT id, plan_id, status FROM codes WHERE code = ?',
    [code]
  );

  if (!codeRecord) {
    return c.json({ error: 'Code码不存在' }, 404);
  }

  if (codeRecord.status !== 'pending') {
    return c.json({ error: 'Code码已被使用或已过期' }, 400);
  }

  const plan = await queryFirst<{ duration_days: number }>(c.env.DB,
    'SELECT duration_days FROM subscription_plans WHERE id = ?',
    [codeRecord.plan_id]
  );

  if (!plan) {
    return c.json({ error: '套餐不存在' }, 500);
  }

  const now = new Date();
  const startedAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + plan.duration_days * 24 * 60 * 60 * 1000).toISOString();

  // 更新 code 状态
  await run(c.env.DB,
    'UPDATE codes SET status = \'redeemed\', redeemed_by = ?, redeemed_at = ? WHERE id = ?',
    [user.userId, startedAt, codeRecord.id]
  );

  // 创建用户订阅
  await run(c.env.DB,
    `INSERT INTO user_subscriptions (user_id, code_id, plan_id, started_at, expires_at)
     VALUES (?, ?, ?, ?, ?)`,
    [user.userId, codeRecord.id, codeRecord.plan_id, startedAt, expiresAt]
  );

  return c.json({
    message: '兑换成功',
    subscription: {
      started_at: startedAt,
      expires_at: expiresAt,
      duration_days: plan.duration_days,
    },
  });
});

export default app;
