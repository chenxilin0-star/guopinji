import type { Crawler, CrawlResult, RawJob } from './types';

/**
 * 国聘网爬虫
 * 通过 gp-api.iguopin.com 获取职位数据
 */
export const iguopinCrawler: Crawler = {
  name: '国聘网',
  sourceId: 1,
  sourceUrl: 'https://www.iguopin.com',

  async crawl({ DB, fetch }) {
    const result: CrawlResult = {
      sourceName: this.name,
      total: 0,
      newJobs: 0,
      updatedJobs: 0,
      errors: [],
    };

    const API_BASE = 'https://gp-api.iguopin.com';
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://www.iguopin.com/',
      'Origin': 'https://www.iguopin.com',
    };

    try {
      // 尝试多个 API 端点获取数据
      const endpoints = [
        { path: '/api/jobs/v1/recom-job', method: 'POST', body: { page: 1, size: 50 } },
        { path: '/api/recruit/v1/search', method: 'POST', body: { page: 1, size: 50, keyword: '' } },
      ];

      let allJobs: RawJob[] = [];

      for (const endpoint of endpoints) {
        try {
          const res = await fetch(`${API_BASE}${endpoint.path}`, {
            method: endpoint.method,
            headers,
            body: JSON.stringify(endpoint.body),
          });

          if (!res.ok) continue;

          const data = await res.json() as any;
          if (data.code !== 200 || !data.data?.list) continue;

          const jobs = data.data.list.map((item: any): RawJob => ({
            source_id: this.sourceId,
            title: item.title || item.position_name || '未知职位',
            company_name: item.company_name || item.enterprise_name || '未知企业',
            job_type: item.job_type || item.type_name,
            department: item.department,
            education: item.education || item.education_requirement,
            experience: item.experience || item.experience_requirement,
            major: item.major,
            salary_text: item.salary || item.salary_text,
            work_location: item.work_location || item.address,
            province: item.province,
            city: item.city,
            description: item.description || item.job_description,
            requirements: item.requirements,
            publish_date: item.publish_date || item.created_at,
            apply_end_date: item.apply_end_date,
            source_url: item.source_url || `${this.sourceUrl}/job/${item.id}`,
            source_job_id: String(item.id || item.job_id),
          }));

          allJobs = allJobs.concat(jobs);
        } catch (e: any) {
          result.errors.push(`${endpoint.path}: ${e.message}`);
        }
      }

      // 去重
      const seen = new Set<string>();
      allJobs = allJobs.filter(j => {
        const key = `${j.source_job_id}-${j.title}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      result.total = allJobs.length;

      // 写入数据库
      for (const job of allJobs) {
        const { newCount, updateCount } = await saveJob(DB, job);
        result.newJobs += newCount;
        result.updatedJobs += updateCount;
      }

      // 更新爬虫时间
      await DB.prepare(
        'UPDATE job_sources SET last_crawl_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).bind(this.sourceId).run();

    } catch (e: any) {
      result.errors.push(`爬虫异常: ${e.message}`);
    }

    return result;
  },
};

/**
 * 保存职位到数据库
 */
async function saveJob(
  DB: D1Database,
  job: RawJob
): Promise<{ newCount: number; updateCount: number }> {
  let newCount = 0;
  let updateCount = 0;

  // 1. 检查是否存在公司
  let companyId: number | null = null;
  const existingCompany = await DB.prepare(
    'SELECT id FROM companies WHERE name = ? LIMIT 1'
  ).bind(job.company_name).first<{ id: number }>();

  if (existingCompany) {
    companyId = existingCompany.id;
  } else {
    const companyRes = await DB.prepare(
      'INSERT INTO companies (name, province, city) VALUES (?, ?, ?)'
    ).bind(job.company_name, job.province || '', job.city || '').run();
    companyId = companyRes.meta?.last_row_id || null;
  }

  // 2. 检查是否存在该职位
  const existingJob = await DB.prepare(
    'SELECT id FROM jobs WHERE source_job_id = ? AND source_id = ? LIMIT 1'
  ).bind(job.source_job_id || job.source_url, job.source_id).first<{ id: number }>();

  if (existingJob) {
    // 更新
    await DB.prepare(`
      UPDATE jobs SET
        title = ?, company_id = ?, job_type = ?, department = ?,
        education = ?, experience = ?, major = ?, salary_text = ?,
        work_location = ?, province = ?, city = ?, description = ?,
        requirements = ?, publish_date = ?, apply_end_date = ?,
        source_url = ?, status = 'active', is_deleted = 0
      WHERE id = ?
    `).bind(
      job.title, companyId, job.job_type || '', job.department || '',
      job.education || '', job.experience || '', job.major || '', job.salary_text || '',
      job.work_location || '', job.province || '', job.city || '', job.description || '',
      job.requirements || '', job.publish_date || '', job.apply_end_date || '',
      job.source_url, existingJob.id
    ).run();
    updateCount = 1;
  } else {
    // 新增
    await DB.prepare(`
      INSERT INTO jobs (
        source_id, company_id, title, job_type, department,
        education, experience, major, salary_text,
        work_location, province, city, description, requirements,
        publish_date, apply_end_date, source_url, source_job_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      job.source_id, companyId, job.title, job.job_type || '', job.department || '',
      job.education || '', job.experience || '', job.major || '', job.salary_text || '',
      job.work_location || '', job.province || '', job.city || '', job.description || '',
      job.requirements || '', job.publish_date || '', job.apply_end_date || '',
      job.source_url, job.source_job_id || ''
    ).run();
    newCount = 1;
  }

  return { newCount, updateCount };
}
