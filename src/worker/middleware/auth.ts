import { createMiddleware } from 'hono/factory';
import { verifyToken } from '../utils/jwt';
import type { Env } from '../db';
import type { JWTPayload } from '../types';

export interface AuthContext {
  user: JWTPayload;
}

export const authMiddleware = createMiddleware<{ Bindings: Env; Variables: { user: JWTPayload } }>(
  async (c, next) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: '未授权' }, 401);
    }
    const token = authHeader.slice(7);
    try {
      const payload = await verifyToken(token, c.env.JWT_SECRET);
      c.set('user', payload);
      await next();
    } catch {
      return c.json({ error: 'Token无效或已过期' }, 401);
    }
  }
);

export const optionalAuthMiddleware = createMiddleware<{ Bindings: Env; Variables: { user?: JWTPayload } }>(
  async (c, next) => {
    const authHeader = c.req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        const payload = await verifyToken(token, c.env.JWT_SECRET);
        c.set('user', payload);
      } catch {
        // ignore invalid token
      }
    }
    await next();
  }
);
