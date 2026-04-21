-- 为 jobs 表添加 source_name 字段
ALTER TABLE jobs ADD COLUMN source_name TEXT;

-- 创建爬虫日志表
CREATE TABLE IF NOT EXISTS crawl_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,
    status TEXT NOT NULL,
    fetched_count INTEGER,
    inserted_count INTEGER,
    updated_count INTEGER,
    error_message TEXT,
    started_at TEXT DEFAULT CURRENT_TIMESTAMP,
    finished_at TEXT
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_crawl_logs_source ON crawl_logs(source);
CREATE INDEX IF NOT EXISTS idx_crawl_logs_started_at ON crawl_logs(started_at);
