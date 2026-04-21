import { iguopinCrawler } from './iguopin';
import { mockCrawler } from './mock';
import { htmlCrawler } from './html';
import { nowcoderJobsCrawler } from './nowcoder-jobs';
import { nowcoderScheduleCrawler } from './nowcoder-schedule';
import { bocAnnouncementsCrawler } from './boc-announcements';
import type { Crawler, CrawlResult } from './types';

const crawlers: Crawler[] = [
  iguopinCrawler,
  mockCrawler,
  htmlCrawler,
  nowcoderJobsCrawler,
  nowcoderScheduleCrawler,
  bocAnnouncementsCrawler,
];

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
    const startedAt = new Date().toISOString();
    let crawlStatus = 'success';
    let errorMessage = '';
    let result: CrawlResult;

    try {
      result = await crawler.crawl(env);
      results.push(result);
      if (result.errors.length > 0 && result.total === 0) {
        crawlStatus = 'failed';
        errorMessage = result.errors.join('; ');
      } else if (result.errors.length > 0) {
        crawlStatus = 'partial';
        errorMessage = result.errors.join('; ');
      }
    } catch (e: any) {
      crawlStatus = 'failed';
      errorMessage = `未捕获异常: ${e.message}`;
      result = {
        sourceName: crawler.name,
        total: 0,
        newJobs: 0,
        updatedJobs: 0,
        errors: [errorMessage],
      };
      results.push(result);
    }

    // 记录爬虫日志
    try {
      await env.DB.prepare(`
        INSERT INTO crawl_logs (source, status, fetched_count, inserted_count, updated_count, error_message, started_at, finished_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        crawler.name,
        crawlStatus,
        result.total,
        result.newJobs,
        result.updatedJobs,
        errorMessage || null,
        startedAt,
        new Date().toISOString()
      ).run();
    } catch (logErr: any) {
      console.error(`[CrawlLog] 记录失败: ${logErr.message}`);
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
    { id: 3, name: 'HTML解析爬虫', url: 'https://job.mohrss.gov.cn', type: 'html' },
    { id: 5, name: '牛客网校招职位', url: 'https://www.nowcoder.com/jobs/school/jobs', type: 'api' },
    { id: 6, name: '牛客网校招日程', url: 'https://www.nowcoder.com/school/schedule', type: 'api' },
    { id: 7, name: '中国银行招聘公告', url: 'https://www.boc.cn/aboutboc/bi4/', type: 'html' },
    { id: 99, name: '种子数据源', url: 'https://demo.guopinji.com', type: 'mock' },
  ];

  for (const s of sources) {
    await DB.prepare(
      `INSERT OR IGNORE INTO job_sources (id, name, url, source_type, is_active) VALUES (?, ?, ?, ?, 1)`
    ).bind(s.id, s.name, s.url, s.type).run();
  }
}

export { iguopinCrawler, mockCrawler, htmlCrawler };
export type { Crawler, CrawlResult, RawJob } from './types';
