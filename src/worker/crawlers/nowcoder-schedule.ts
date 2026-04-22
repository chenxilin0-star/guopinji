import type { Crawler, CrawlResult, RawJob } from './types';

/**
 * 牛客网校招日程爬虫
 * API: https://www.nowcoder.com/school/schedule/data
 * 返回公司级校招/春招/秋招/实习日程信息
 */
export const nowcoderScheduleCrawler: Crawler = {
  name: '牛客网校招日程',
  sourceId: 6,
  sourceUrl: 'https://www.nowcoder.com',

  async crawl({ DB, fetch }) {
    const result: CrawlResult = {
      sourceName: this.name,
      total: 0,
      newJobs: 0,
      updatedJobs: 0,
      errors: [],
    };

    try {
      const res = await fetch('https://www.nowcoder.com/school/schedule/data', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Referer': 'https://www.nowcoder.com/',
        },
      });

      if (!res.ok) {
        result.errors.push(`HTTP ${res.status}`);
        return result;
      }

      const data = (await res.json()) as any;
      if (data.code !== 0 || !data.data?.companyList) {
        result.errors.push(`API 错误: ${data.msg || '无效响应'}`);
        return result;
      }

      const companyList = data.data.companyList;
      const allJobs: RawJob[] = [];
      const seen = new Set<string>();

      for (const item of companyList) {
        const companyName = item.subject || '未知企业';
        const key = `schedule_${item.id}`;
        if (seen.has(key)) continue;
        seen.add(key);

        // 解析网申时间
        let applyBegin = '';
        let applyEnd = '';
        if (item.wangshenDate && Array.isArray(item.wangshenDate) && item.wangshenDate.length >= 2) {
          applyBegin = new Date(item.wangshenDate[0]).toISOString().split('T')[0];
          applyEnd = new Date(item.wangshenDate[1]).toISOString().split('T')[0];
        }

        // 城市列表
        const cities = item.cities || [];
        const city = cities.join('、');

        // 岗位类型列表
        const careers = item.companyCareersStr || [];
        const careerStr = careers.join('、');

        // 判断招聘批次类型
        let jobType = '校招';
        const subject = item.subject || '';
        if (subject.includes('春招') || item.specialWangshenText?.includes('春招')) {
          jobType = '春招';
        } else if (subject.includes('秋招')) {
          jobType = '秋招';
        } else if (subject.includes('实习') || item.interviewTime?.includes('实习')) {
          jobType = '实习';
        } else if (item.supplementHireTime || item.specialWangshenText === '投递链接') {
          // 有补招时间的一般是正式校招
          jobType = '校招';
        }

        // 官网链接
        const officialUrl = item.officalUrl || '';

        const description = [
          `【${jobType}】${companyName}`,
          careers.length > 0 ? `招聘方向：${careerStr}` : '',
          item.interviewTime ? `笔试/面试时间：${item.interviewTime}` : '',
          item.supplementHireTime ? `补招时间：${item.supplementHireTime}` : '',
          officialUrl ? `官网投递：${officialUrl}` : '',
          `数据来源：牛客网校招日程`,
        ].filter(Boolean).join('\n');

        const job: RawJob = {
          source_id: this.sourceId,
          title: `${companyName} ${jobType}`,
          company_name: companyName,
          job_type: jobType,
          department: careerStr,
          education: '本科及以上',
          experience: '应届生',
          major: careerStr,
          salary_text: '薪资面议',
          work_location: city || '全国',
          province: '',
          city,
          description,
          requirements: '',
          publish_date: applyBegin || new Date().toISOString().split('T')[0],
          apply_end_date: applyEnd || '',
          source_url: officialUrl || `https://www.nowcoder.com/enterprise/${item.id}`,
          source_job_id: `nc_schedule_${item.id}`,
        };

        allJobs.push(job);
      }

      result.total = allJobs.length;

      for (const job of allJobs) {
        job.source_name = this.name;
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
      await DB.prepare(
        'UPDATE job_sources SET fail_count = fail_count + 1 WHERE id = ?'
      ).bind(this.sourceId).run();
    }

    return result;
  },
};

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
    ).bind(job.company_name, job.province || '', job.city || '', '互联网/科技').run();
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
