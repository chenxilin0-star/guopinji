import type { D1Database } from '@cloudflare/workers-types';

export interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  STORAGE: R2Bucket;
  CRAWL_QUEUE: Queue;
  EMAIL_QUEUE: Queue;
  JWT_SECRET: string;
  RESEND_API_KEY: string;
  APP_NAME: string;
  APP_URL: string;
}

export async function queryFirst<T>(db: D1Database, sql: string, params?: unknown[]): Promise<T | null> {
  const result = await db.prepare(sql).bind(...(params || [])).first<T>();
  return result || null;
}

export async function queryAll<T>(db: D1Database, sql: string, params?: unknown[]): Promise<T[]> {
  const { results } = await db.prepare(sql).bind(...(params || [])).all<T>();
  return results || [];
}

export async function run(db: D1Database, sql: string, params?: unknown[]): Promise<D1Result> {
  return db.prepare(sql).bind(...(params || [])).run();
}
