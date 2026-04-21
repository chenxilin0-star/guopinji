import { iguopinCrawler } from './iguopin';
import { mockCrawler } from './mock';
import type { Crawler, CrawlResult } from './types';

const crawlers: Crawler[] = [iguopinCrawler, mockCrawler];

/**
 * 执行所有爬虫任务
 */
export async function runAllCrawlers(env: {
  DB: D1Database;
  CACHE: KVNamespace;
  fetch: typeof fetch;
}): Promise<CrawlResult[]> {
  const results: CrawlResult[] = [];

  // 确保 job_sources 表有初始数据
  await initJobSources(env.DB);

  for (const crawler of crawlers) {
    try {
      const result = await crawler.crawl(env);
      results.push(result);
    } catch (e: any) {
      results.push({
        sourceName: crawler.name,
        total: 0,
        newJobs: 0,
        updatedJobs: 0,
        errors: [`未捕获异常: ${e.message}`],
      });
    }
  }

  // 清除缓存，让新数据生效
  await env.CACHE.delete('stats:home');
  await env.CACHE.delete('hot_jobs');

  return results;
}

/**
 * 初始化数据源表
 */
async function initJobSources(DB: D1Database) {
  const sources = [
    { id: 1, name: '国聘网', url: 'https://www.iguopin.com', type: 'api' },
    { id: 99, name: '模拟数据源', url: 'https://demo.guopinji.com', type: 'mock' },
  ];

  for (const s of sources) {
    await DB.prepare(
      `INSERT OR IGNORE INTO job_sources (id, name, url, source_type, is_active) VALUES (?, ?, ?, ?, 1)`
    ).bind(s.id, s.name, s.url, s.type).run();
  }
}

export { iguopinCrawler, mockCrawler };
export type { Crawler, CrawlResult, RawJob } from './types';
