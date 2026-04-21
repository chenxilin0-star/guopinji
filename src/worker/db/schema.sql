-- 数据源
CREATE TABLE IF NOT EXISTS job_sources (
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
CREATE TABLE IF NOT EXISTS companies (
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
CREATE TABLE IF NOT EXISTS jobs (
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

-- 职位全文搜索索引 (FTS5)
CREATE VIRTUAL TABLE IF NOT EXISTS jobs_fts USING fts5(
    title,
    description,
    requirements,
    content='jobs',
    content_rowid='id'
);

-- 用户
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    nickname TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 订阅套餐
CREATE TABLE IF NOT EXISTS subscription_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code_prefix TEXT NOT NULL,
    duration_days INTEGER NOT NULL,
    price REAL NOT NULL
);

-- Code码
CREATE TABLE IF NOT EXISTS codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    plan_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    redeemed_by INTEGER,
    redeemed_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 用户订阅记录
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    code_id INTEGER NOT NULL,
    plan_id INTEGER NOT NULL,
    started_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    is_active INTEGER DEFAULT 1
);

-- 用户订阅条件
CREATE TABLE IF NOT EXISTS subscriptions (
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
CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    job_id INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, job_id)
);

-- 初始化订阅套餐
INSERT OR IGNORE INTO subscription_plans (id, name, code_prefix, duration_days, price) VALUES
(1, '7天体验', '7D', 7, 6.9),
(2, '15天标准', '15D', 15, 9.9),
(3, '30天尊享', '30D', 30, 16.9);

-- 触发器：jobs 更新时自动更新 updated_at
CREATE TRIGGER IF NOT EXISTS jobs_updated_at
AFTER UPDATE ON jobs
BEGIN
    UPDATE jobs SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- 触发器：jobs 插入时同步 fts5
CREATE TRIGGER IF NOT EXISTS jobs_fts_insert
AFTER INSERT ON jobs
BEGIN
    INSERT INTO jobs_fts(rowid, title, description, requirements)
    VALUES (NEW.id, NEW.title, NEW.description, NEW.requirements);
END;

-- 触发器：jobs 更新时同步 fts5
CREATE TRIGGER IF NOT EXISTS jobs_fts_update
AFTER UPDATE ON jobs
BEGIN
    INSERT INTO jobs_fts(jobs_fts, rowid, title, description, requirements)
    VALUES ('delete', OLD.id, OLD.title, OLD.description, OLD.requirements);
    INSERT INTO jobs_fts(rowid, title, description, requirements)
    VALUES (NEW.id, NEW.title, NEW.description, NEW.requirements);
END;

-- 触发器：jobs 删除时同步 fts5
CREATE TRIGGER IF NOT EXISTS jobs_fts_delete
AFTER DELETE ON jobs
BEGIN
    INSERT INTO jobs_fts(jobs_fts, rowid, title, description, requirements)
    VALUES ('delete', OLD.id, OLD.title, OLD.description, OLD.requirements);
END;
