import { createMiddleware } from 'hono/factory';
import type { Env } from '../db';

export const rateLimitMiddleware = createMiddleware<{ Bindings: Env; Variables: { user?: { userId: number; email: string } } }>(
  async (c, next) => {
    const user = c.get('user');
    const ip = c.req.header('CF-Connecting-IP') || 'unknown';
    const kv = c.env.CACHE;

    // 有效订阅用户不限流
    if (user) {
      const { results } = await c.env.DB.prepare(
        `SELECT id FROM user_subscriptions WHERE user_id = ? AND is_active = 1 AND expires_at > datetime('now')`
      ).bind(user.userId).all();
      if (results && results.length > 0) {
        return await next();
      }
    }

    const key = `rate_limit:${user ? `user:${user.userId}` : `ip:${ip}`}`;
    const limit = user ? 10 : 5;
    const ttl = 86400;

    const current = await kv.get(key);
    const count = current ? parseInt(current, 10) : 0;

    if (count >= limit) {
      return c.json({ error: '搜索次数已达今日上限，请登录或订阅以获取更多次数' }, 429);
    }

    await kv.put(key, String(count + 1), { expirationTtl: ttl });
    await next();
  }
);
