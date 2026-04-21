# 国聘集 — Cloudflare 全栈技术架构方案

## 技术栈映射

| 原方案 (PRD) | Cloudflare 全家桶 | 用途 |
|-------------|-------------------|------|
| Next.js SSR | **Cloudflare Pages** | 前端托管，支持 SSR/SSG |
| FastAPI | **Cloudflare Workers + Hono** | 边缘 API 服务 |
| PostgreSQL | **Cloudflare D1** | SQLite 关系型数据库 |
| Redis | **Cloudflare KV** | 缓存、会话、限流、搜索缓存 |
| 对象存储 | **Cloudflare R2** | 公司 Logo、爬虫快照 |
| Celery/Cron | **Cloudflare Cron Triggers + Queues** | 定时爬虫、异步推送 |
| 邮件服务 | **Resend API** (Workers 中调用) | 订阅推送邮件 |
| 全文搜索 | **D1 + D1 FTS5** + KV 缓存 | 职位搜索 |
| 认证 | **JWT + KV Session** | 用户登录态 |

## 架构图

```
用户 → Cloudflare CDN → [Pages 前端 (Next.js)]
              ↓
         [Workers API (Hono)]
              ↓
    ┌────────┼────────┬────────┐
    ↓        ↓        ↓        ↓
   D1      KV       R2     Queues
 (业务数据)(缓存/会话)(文件)(爬虫/邮件)
```

## D1 数据库 Schema（SQLite 兼容版）

```sql
-- 数据源
CREATE TABLE job_sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    source_type TEXT NOT NULL,
    crawl_config TEXT,
    is_active INTEGER DEFAULT 1,
    crawl_frequency TEXT,
    last_crawl_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 公司
CREATE TABLE companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    short_name TEXT,
    full_name TEXT,
    company_type TEXT,
    industry TEXT,
    province TEXT,
    city TEXT,
    description TEXT,
    website TEXT,
    logo_url TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 职位
CREATE TABLE jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id INTEGER NOT NULL,
    company_id INTEGER,
    title TEXT NOT NULL,
    job_type TEXT,
    department TEXT,
    education TEXT,
    experience TEXT,
    major TEXT,
    salary_min INTEGER,
    salary_max INTEGER,
    salary_text TEXT,
    work_location TEXT,
    province TEXT,
    city TEXT,
    description TEXT,
    requirements TEXT,
    publish_date TEXT,
    apply_end_date TEXT,
    source_url TEXT NOT NULL,
    source_job_id TEXT,
    status TEXT DEFAULT 'active',
    is_deleted INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 用户
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    nickname TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 订阅套餐
CREATE TABLE subscription_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code_prefix TEXT NOT NULL,
    duration_days INTEGER NOT NULL,
    price REAL NOT NULL
);

-- Code码
CREATE TABLE codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    plan_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    redeemed_by INTEGER,
    redeemed_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 用户订阅记录
CREATE TABLE user_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    code_id INTEGER NOT NULL,
    plan_id INTEGER NOT NULL,
    started_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    is_active INTEGER DEFAULT 1
);

-- 用户订阅条件
CREATE TABLE subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    keyword TEXT,
    industry TEXT,
    province TEXT,
    city TEXT,
    company_type TEXT,
    education TEXT,
    job_type TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 收藏
CREATE TABLE favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    job_id INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, job_id)
);
```

## Workers API 路由设计 (Hono)

```
/api/v1/
  ├── /auth
  │     POST /register
  │     POST /login
  │     POST /logout
  │     GET  /me
  ├── /jobs
  │     GET  /          (搜索+筛选)
  │     GET  /:id       (详情)
  │     POST /:id/favorite (收藏)
  ├── /companies
  │     GET  /
  │     GET  /:id
  │     GET  /:id/jobs
  ├── /codes
  │     POST /redeem    (兑换Code码)
  ├── /subscriptions
  │     GET  /          (我的订阅条件)
  │     POST /          (创建订阅)
  │     DELETE /:id     (取消订阅)
  ├── /admin
  │     POST /codes/generate
  │     GET  /codes
  │     GET  /stats
```

## KV 缓存策略

| Key 模式 | 用途 | TTL |
|---------|------|-----|
| `session:{token}` | 用户登录态 | 7天 |
| `search:{hash}` | 搜索结果缓存 | 5分钟 |
| `hot_jobs` | 热门职位 | 1小时 |
| `stats:home` | 首页统计 | 10分钟 |
| `rate_limit:{ip}` | 搜索限流 | 1天 |

## 异步任务 (Queues)

- `crawl_queue`: 爬虫任务（按数据源分片）
- `email_queue`: 邮件推送任务（新职位匹配通知）
- `expire_queue`: 过期职位检测

## Cron 定时任务

- `0 */6 * * *`: 全量爬虫（每6小时）
- `0 8 * * *`: 每日订阅推送（早上8点）
- `0 2 * * *`: 过期职位检测
