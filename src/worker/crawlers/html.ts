import type { Crawler, CrawlResult, RawJob } from './types';

/**
 * 通用 HTML 解析爬虫
 * 用于抓取服务端渲染的招聘网页，通过配置选择器解析 HTML
 */

interface HtmlSourceConfig {
  name: string;
  sourceId: number;
  baseUrl: string;
  listUrl: string;
  selectors: {
    jobContainer: string;
    title?: string;
    company?: string;
    location?: string;
    date?: string;
    link?: string;
  };
  extractJob?: (element: Element) => RawJob | null;
}

/**
 * 中国公共招聘网配置（如果服务端渲染可用）
 */
const publicJobConfig: HtmlSourceConfig = {
  name: '中国公共招聘网',
  sourceId: 3,
  baseUrl: 'http://job.mohrss.gov.cn',
  listUrl: 'http://job.mohrss.gov.cn/ggzp/',
  selectors: {
    jobContainer: 'table tr',
  },
};

/**
 * 北京市人力资源局配置
 */
const bjrsjConfig: HtmlSourceConfig = {
  name: '北京市人力资源局',
  sourceId: 4,
  baseUrl: 'https://rsj.beijing.gov.cn',
  listUrl: 'https://rsj.beijing.gov.cn/xxgk/tzgg/',
  selectors: {
    jobContainer: '.list-item, .news-item, tr',
  },
};

/**
 * 通用 HTML 爬虫
 * 使用正则表达式解析 HTML，适用于简单的服务端渲染页面
 */
export const htmlCrawler: Crawler = {
  name: 'HTML解析爬虫',
  sourceId: 3,
  sourceUrl: 'https://job.mohrss.gov.cn',

  async crawl({ DB }) {
    const result: CrawlResult = {
      sourceName: this.name,
      total: 0,
      newJobs: 0,
      updatedJobs: 0,
      errors: [],
    };

    try {
      // 尝试抓取多个数据源
      const sources = [publicJobConfig, bjrsjConfig];

      for (const source of sources) {
        try {
          const jobs = await crawlHtmlSource(source);
          for (const job of jobs) {
            const { newCount, updateCount } = await saveJob(DB, job);
            result.newJobs += newCount;
            result.updatedJobs += updateCount;
          }
          result.total += jobs.length;
        } catch (e: any) {
          result.errors.push(`${source.name}: ${e.message}`);
        }
      }

      // 更新爬虫时间
      await DB.prepare(
        'UPDATE job_sources SET last_crawl_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).bind(this.sourceId).run();
    } catch (e: any) {
      result.errors.push(e.message);
    }

    return result;
  },
};

/**
 * 抓取单个 HTML 数据源
 */
async function crawlHtmlSource(config: HtmlSourceConfig): Promise<RawJob[]> {
  const jobs: RawJob[] = [];

  try {
    const response = await fetch(config.listUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // 使用正则表达式提取职位信息
    // 通用模式：寻找包含"招聘"、"招聘"、"人才"等关键词的链接
    const jobKeywords = /(?:招聘|招聘|人才|员工|岗位|支农|优培|积分落户|技师|劳动保障|事业单位)/i;
    const excludeKeywords = /(?:无障碍|政策文件|政务服务|政府信息|公开讲|点击进入|弹窗跳转|政务服务网|邮箱|登录|退出|首页|简|繁|EN|javascript:void)/i;

    const jobPatterns = [
      // 链接模式
      /<a[^>]*href="([^"]*job[^"]*)"[^>]*>([^<]*(?:招聘|招聘|人才|员工|岗位)[^<]*)<\/a>/gi,
      // 标题模式
      /<a[^>]*href="([^"]*)"[^>]*>([^<]*招聘[^<]*)<\/a>/gi,
      // 通用模式
      /<a[^>]*href="([^"]*)"[^>]*>([^<]{5,50})<\/a>/gi,
    ];

    const seen = new Set<string>();

    for (const pattern of jobPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const [_, href, text] = match;
        const title = text.trim();

        // 过滤无关链接
        if (title.length < 5 || title.length > 100) continue;
        if (seen.has(title)) continue;
        if (!/[一-龥]/.test(title)) continue;
        if (excludeKeywords.test(title)) continue;
        if (!jobKeywords.test(title) && !href.includes('job')) continue;

        seen.add(title);

        // 构建完整 URL
        let fullUrl = href;
        if (href.startsWith('/')) {
          fullUrl = config.baseUrl + href;
        } else if (!href.startsWith('http')) {
          fullUrl = config.baseUrl + '/' + href;
        }

        jobs.push({
          source_id: config.sourceId,
          title: title,
          company_name: '国企/政府机构',
          job_type: '社招',
          department: '',
          education: '本科及以上',
          experience: '1-3年',
          major: '',
          salary_text: '面议',
          work_location: '全国',
          province: '',
          city: '',
          description: `来源：${config.name}\n${title}`,
          requirements: '',
          publish_date: new Date().toISOString().split('T')[0],
          apply_end_date: '',
          source_url: fullUrl,
          source_job_id: `${config.sourceId}_${title.slice(0, 20)}`,
        });
      }
    }

    // 如果没有找到职位，尝试从页面中提取任何链接
    if (jobs.length === 0) {
      const linkPattern = /<a[^>]*href="([^"]*)"[^>]*>([^<]{10,60})<\/a>/gi;
      let match;
      while ((match = linkPattern.exec(html)) !== null) {
        const [_, href, text] = match;
        const title = text.trim();

        if (title.length < 10 || title.length > 60) continue;
        if (seen.has(title)) continue;
        if (excludeKeywords.test(title)) continue;
        if (!jobKeywords.test(title)) continue;

        seen.add(title);

        let fullUrl = href;
        if (href.startsWith('/')) {
          fullUrl = config.baseUrl + href;
        } else if (!href.startsWith('http')) {
          fullUrl = config.baseUrl + '/' + href;
        }

        jobs.push({
          source_id: config.sourceId,
          title: title,
          company_name: config.name,
          job_type: '社招',
          department: '',
          education: '本科及以上',
          experience: '1-3年',
          major: '',
          salary_text: '面议',
          work_location: '全国',
          province: '',
          city: '',
          description: `来源：${config.name}\n${title}`,
          requirements: '',
          publish_date: new Date().toISOString().split('T')[0],
          apply_end_date: '',
          source_url: fullUrl,
          source_job_id: `${config.sourceId}_${title.slice(0, 20)}`,
        });
      }
    }
  } catch (e: any) {
    console.error(`HTML crawl error for ${config.name}:`, e.message);
  }

  return jobs;
}

async function saveJob(
  DB: D1Database,
  job: RawJob
): Promise<{ newCount: number; updateCount: number }> {
  let newCount = 0;
  let updateCount = 0;

  let companyId: number | null = null;
  const existingCompany = await DB.prepare(
    'SELECT id FROM companies WHERE name = ? LIMIT 1'
  ).bind(job.company_name).first<{ id: number }>();

  if (existingCompany) {
    companyId = existingCompany.id;
  } else {
    const companyRes = await DB.prepare(
      'INSERT INTO companies (name, province, city, company_type) VALUES (?, ?, ?, ?)'
    ).bind(job.company_name, job.province || '', job.city || '', '国企').run();
    companyId = companyRes.meta?.last_row_id || null;
  }

  const existingJob = await DB.prepare(
    'SELECT id FROM jobs WHERE source_job_id = ? AND source_id = ? LIMIT 1'
  ).bind(job.source_job_id || job.source_url, job.source_id).first<{ id: number }>();

  if (existingJob) {
    await DB.prepare(`
      UPDATE jobs SET
        title = ?, company_id = ?, job_type = ?, department = ?,
        education = ?, experience = ?, major = ?, salary_text = ?,
        work_location = ?, province = ?, city = ?, description = ?,
        requirements = ?, publish_date = ?, apply_end_date = ?,
        source_url = ?, source_name = ?, status = 'active', is_deleted = 0
      WHERE id = ?
    `).bind(
      job.title, companyId, job.job_type || '', job.department || '',
      job.education || '', job.experience || '', job.major || '', job.salary_text || '',
      job.work_location || '', job.province || '', job.city || '', job.description || '',
      job.requirements || '', job.publish_date || '', job.apply_end_date || '',
      job.source_url, job.source_name || '', existingJob.id
    ).run();
    updateCount = 1;
  } else {
    await DB.prepare(`
      INSERT INTO jobs (
        source_id, company_id, title, job_type, department,
        education, experience, major, salary_text,
        work_location, province, city, description, requirements,
        publish_date, apply_end_date, source_url, source_job_id, source_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      job.source_id, companyId, job.title, job.job_type || '', job.department || '',
      job.education || '', job.experience || '', job.major || '', job.salary_text || '',
      job.work_location || '', job.province || '', job.city || '', job.description || '',
      job.requirements || '', job.publish_date || '', job.apply_end_date || '',
      job.source_url, job.source_job_id || '', job.source_name || ''
    ).run();
    newCount = 1;
  }

  return { newCount, updateCount };
}
