import { D1Database } from '@cloudflare/workers-types';

async function seed() {
  const db = (globalThis as any).__D1_BETA__ as D1Database;
  if (!db) {
    console.error('D1 database not available. Run with: wrangler d1 execute guopinji-db --file=./src/worker/db/schema.sql');
    process.exit(1);
  }

  // Insert sample companies
  await db.prepare(`
    INSERT OR IGNORE INTO companies (id, name, company_type, industry, province, city, description) VALUES
    (1, '国家电网', '央企', '电力', '北京', '北京', '全球最大的公用事业企业'),
    (2, '中国移动', '央企', '通信', '北京', '北京', '中国领先的移动通信运营商'),
    (3, '中国建筑', '央企', '建筑', '北京', '北京', '全球最大的建筑投资建设集团')
  `).run();

  // Insert sample jobs
  await db.prepare(`
    INSERT OR IGNORE INTO jobs (id, source_id, company_id, title, job_type, education, province, city, description, requirements, source_url, status) VALUES
    (1, 1, 1, '电力工程师', '校招', '本科', '北京', '北京', '负责电力系统运维', '电气工程相关专业', 'https://iguopin.com/job/1', 'active'),
    (2, 1, 2, '通信技术岗', '校招', '本科', '上海', '上海', '5G网络优化', '通信工程相关专业', 'https://iguopin.com/job/2', 'active'),
    (3, 1, 3, '项目管理岗', '社招', '硕士', '广东', '深圳', '大型工程项目管理', '工程管理+3年经验', 'https://iguopin.com/job/3', 'active')
  `).run();

  console.log('Seed data inserted successfully!');
}

seed().catch(console.error);
