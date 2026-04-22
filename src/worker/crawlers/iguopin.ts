import type { Crawler, CrawlResult, RawJob } from './types';

/**
 * 国聘网爬虫 - 使用公开 v1 API
 * API 端点: https://gp-api.iguopin.com/api/jobs/v1/list
 * 无需签名认证，直接访问
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
      // 获取多页数据，每页20条
      const allJobs: RawJob[] = [];
      const maxPages = 3; // 减少页数以避免 Workers 子请求限制

      for (let page = 1; page <= maxPages; page++) {
        try {
          const res = await fetch(`${API_BASE}/api/jobs/v1/list`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              page: page,
              page_size: 20,
              keyword: '',
            }),
          });

          if (!res.ok) {
            result.errors.push(`Page ${page}: HTTP ${res.status}`);
            break;
          }

          const data = await res.json() as any;
          if (data.code !== 200 || !data.data?.list) {
            result.errors.push(`Page ${page}: 无效响应 ${data.msg || ''}`);
            break;
          }

          const list = data.data.list;
          if (!list.length) break; // 没有更多数据了

          for (const item of list) {
            // 提取地区信息
            let province = '';
            let city = '';
            let workLocation = '';
            if (item.district_list && item.district_list.length > 0) {
              const district = item.district_list[0];
              province = district.area_cn || '';
              city = district.city || '';
              workLocation = district.address || district.area_cn || '';
            }

            // 提取薪资文本
            let salaryText = '';
            if (item.is_negotiable) {
              salaryText = '薪资面议';
            } else if (item.min_wage || item.max_wage) {
              salaryText = `${item.min_wage || 0}-${item.max_wage || 0} ${item.wage_unit_cn || '元/月'}`;
            }

            // 提取公司类型（国企/央企等）
            const companyType = item.company_info?.nature_cn || '';
            const industry = item.company_info?.industry_cn || '';
            const companyScale = item.company_info?.scale_cn || '';

            const job: RawJob = {
              source_id: this.sourceId,
              title: item.job_name || '未知职位',
              company_name: item.company_name || '未知企业',
              job_type: item.recruitment_type_cn || item.nature_cn || '',
              department: item.department_cn || '',
              education: item.education_cn || '',
              experience: item.experience_cn || '',
              major: item.major_cn ? item.major_cn.join(', ') : '',
              salary_text: salaryText,
              work_location: workLocation,
              province: province,
              city: city,
              description: item.contents || '',
              requirements: '', // 职位描述中已包含任职要求
              publish_date: item.create_time || item.start_time || '',
              apply_end_date: item.end_time || '',
              source_url: `${this.sourceUrl}/job/${item.job_id}`,
              source_job_id: String(item.job_id || ''),
              // 额外字段（用于数据库扩展）
              company_type: companyType,
              industry: industry,
              company_scale: companyScale,
            };

            allJobs.push(job);
          }

          // 如果这页不满，说明没有更多数据了
          if (list.length < 20) break;

        } catch (e: any) {
          result.errors.push(`Page ${page}: ${e.message}`);
          break;
        }
      }

      // 去重
      const seen = new Set<string>();
      const uniqueJobs = allJobs.filter(j => {
        const key = `${j.source_job_id}-${j.title}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      result.total = uniqueJobs.length;

      // 写入数据库
      for (const job of uniqueJobs) {
        const { newCount, updateCount } = await saveJob(DB, job);
        result.newJobs += newCount;
        result.updatedJobs += updateCount;
      }

      // 更新爬虫时间
      await DB.prepare(
        'UPDATE job_sources SET last_crawl_at = CURRENT_TIMESTAMP, last_success_at = CURRENT_TIMESTAMP, success_count = success_count + 1 WHERE id = ?'
      ).bind(this.sourceId).run();

    } catch (e: any) {
      result.errors.push(`爬虫异常: ${e.message}`);
      // 记录失败
      await DB.prepare(
        'UPDATE job_sources SET fail_count = fail_count + 1 WHERE id = ?'
      ).bind(this.sourceId).run();
    }

    return result;
  },
};

/**
 * 保存职位到数据库
 */
async function saveJob(
  DB: D1Database,
  job: RawJob & { company_type?: string; industry?: string; company_scale?: string }
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
    // 更新公司信息
    await DB.prepare(`
      UPDATE companies SET
        industry = COALESCE(NULLIF(?, ''), industry),
        scale = COALESCE(NULLIF(?, ''), scale),
        company_type = COALESCE(NULLIF(?, ''), company_type),
        is_state_owned = 1
      WHERE id = ?
    `).bind(job.industry || '', job.company_scale || '', job.company_type || '', companyId).run();
  } else {
    const companyRes = await DB.prepare(`
      INSERT INTO companies (name, industry, scale, company_type, province, city, is_state_owned)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).bind(
      job.company_name,
      job.industry || '',
      job.company_scale || '',
      job.company_type || '',
      job.province || '',
      job.city || ''
    ).run();
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
