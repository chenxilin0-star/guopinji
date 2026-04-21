import { Hono } from 'hono';
import { hashPassword, verifyPassword } from '../utils/hash';
import { createToken } from '../utils/jwt';
import { queryFirst, run } from '../db';
import type { Env } from '../db';
import type { User } from '../types';

const app = new Hono<{ Bindings: Env }>();

// 注册
app.post('/register', async (c) => {
  const { email, password, nickname, phone } = await c.req.json<{ email: string; password: string; nickname?: string; phone?: string }>();

  if (!email || !password) {
    return c.json({ error: '邮箱和密码必填' }, 400);
  }
  if (password.length < 6) {
    return c.json({ error: '密码至少6位' }, 400);
  }

  const existing = await queryFirst<User>(c.env.DB, 'SELECT id FROM users WHERE email = ?', [email]);
  if (existing) {
    return c.json({ error: '邮箱已被注册' }, 409);
  }

  const password_hash = await hashPassword(password);
  const result = await run(c.env.DB,
    'INSERT INTO users (email, phone, password_hash, nickname) VALUES (?, ?, ?, ?)',
    [email, phone || null, password_hash, nickname || null]
  );

  const userId = result.meta.last_row_id;
  const token = await createToken({ userId, email }, c.env.JWT_SECRET);

  return c.json({ token, user: { id: userId, email, nickname: nickname || null } }, 201);
});

// 登录
app.post('/login', async (c) => {
  const { email, password } = await c.req.json<{ email: string; password: string }>();

  if (!email || !password) {
    return c.json({ error: '邮箱和密码必填' }, 400);
  }

  const user = await queryFirst<User>(c.env.DB, 'SELECT * FROM users WHERE email = ? AND is_active = 1', [email]);
  if (!user) {
    return c.json({ error: '用户不存在或已被禁用' }, 401);
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return c.json({ error: '密码错误' }, 401);
  }

  const token = await createToken({ userId: user.id, email: user.email }, c.env.JWT_SECRET);
  return c.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      phone: user.phone,
    },
  });
});

// 登出
app.post('/logout', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    await c.env.CACHE.delete(`session:${token}`);
  }
  return c.json({ message: '已登出' });
});

// 获取当前用户
app.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: '未授权' }, 401);
  }
  const token = authHeader.slice(7);

  try {
    const { jwtVerify } = await import('jose');
    const secretKey = new TextEncoder().encode(c.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secretKey, { clockTolerance: 60 });
    const userId = payload.userId as number;

    const user = await queryFirst<User>(c.env.DB, 'SELECT id, email, nickname, phone, created_at FROM users WHERE id = ?', [userId]);
    if (!user) {
      return c.json({ error: '用户不存在' }, 404);
    }

    // 查询有效订阅
    const sub = await queryFirst(c.env.DB,
      `SELECT expires_at FROM user_subscriptions WHERE user_id = ? AND is_active = 1 AND expires_at > datetime('now') ORDER BY expires_at DESC LIMIT 1`,
      [userId]
    );

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        phone: user.phone,
        created_at: user.created_at,
        subscription_expires_at: sub ? (sub as { expires_at: string }).expires_at : null,
      },
    });
  } catch {
    return c.json({ error: 'Token无效或已过期' }, 401);
  }
});

export default app;
