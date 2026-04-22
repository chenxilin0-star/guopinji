import type { Crawler, CrawlResult, RawJob } from './types';

/**
 * 牛客网校招职位爬虫
 * 抓取方式：SSR 页面 HTML 中内嵌 window.__INITIAL_STATE__
 * 数据来源：https://www.nowcoder.com/jobs/school/jobs
 */
export const nowcoderJobsCrawler: Crawler = {
  name: '牛客网校招职位',
  sourceId: 5,
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
      const res = await fetch('https://www.nowcoder.com/jobs/school/jobs', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        },
      });

      if (!res.ok) {
        result.errors.push(`HTTP ${res.status}`);
        return result;
      }

      const html = await res.text();

      // 提取 window.__INITIAL_STATE__
      const match = html.match(/window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});\s*(?:\(function\(\)|<\/script>)/);
      if (!match) {
        result.errors.push('未找到 __INITIAL_STATE__');
        return result;
      }

      let state: any;
      try {
        state = JSON.parse(match[1]);
      } catch (e: any) {
        result.errors.push(`JSON 解析失败: ${e.message}`);
        return result;
      }

      // 提取职位列表
      const jobListData = state?.store?.interCenter?.jobListData || [];
      if (!Array.isArray(jobListData) || jobListData.length === 0) {
        result.errors.push('职位列表为空');
        return result;
      }

      const allJobs: RawJob[] = [];
      const seen = new Set<string>();

      for (const wrapper of jobListData) {
        const item = wrapper.data || wrapper;
        if (!item || !item.id) continue;

        const key = `${item.id}`;
        if (seen.has(key)) continue;
        seen.add(key);

        // 解析 ext 字段（JSON 字符串，包含职位描述和要求）
        let description = '';
        let requirements = '';
        if (item.ext) {
          try {
            const ext = typeof item.ext === 'string' ? JSON.parse(item.ext) : item.ext;
            description = ext.infos || '';
            requirements = ext.requirements || '';
          } catch {
            // 忽略解析错误
          }
        }

        // 学历映射
        const eduMap: Record<number, string> = {
          0: '不限',
          1000: '大专',
          5000: '本科',
          10000: '硕士',
          15000: '博士',
        };
        const education = eduMap[item.eduLevel as number] || '本科';

        // 薪资文本
        let salaryText = '薪资面议';
        if (item.salaryMin !== undefined && item.salaryMax !== undefined) {
          if (item.salaryMin > 0 && item.salaryMax > 0 && item.salaryMax < 9999999) {
            salaryText = `${item.salaryMin}-${item.salaryMax}K`;
            if (item.salaryMonth && item.salaryMonth > 12) {
              salaryText += `·${item.salaryMonth}薪`;
            }
          }
        }

        // 招聘类型
        const recruitTypeMap: Record<number, string> = {
          1: '校招',
          2: '实习',
          3: '社招',
        };
        const jobType = recruitTypeMap[item.recruitType as number] || '校招';

        // 毕业年份信息
        const gradYear = item.graduationYear || '';
        const jobTypeWithYear = gradYear ? `${jobType}(${gradYear})` : jobType;

        // 公司名称
        const companyName = item.recommendInternCompany?.companyName || '未知企业';

        // 城市列表
        const cityList = item.jobCityList || [item.jobCity].filter(Boolean);
        const city = cityList.join('、');

        const job: RawJob = {
          source_id: this.sourceId,
          title: item.jobName || '未知职位',
          company_name: companyName,
          job_type: jobTypeWithYear,
          department: item.companyCareersStr?.join('、') || '',
          education,
          experience: '应届生',
          major: item.jobKeys || '',
          salary_text: salaryText,
          work_location: city,
          province: '',
          city,
          description: `${description}\n\n毕业时间要求：${gradYear || '不限'}\n\n职位标签：${item.jobKeys || ''}`,
          requirements,
          publish_date: item.createTime ? new Date(item.createTime).toISOString().split('T')[0] : '',
          apply_end_date: item.deliverEnd ? new Date(item.deliverEnd).toISOString().split('T')[0] : '',
          source_url: `https://www.nowcoder.com/jobs/detail/${item.id}?deliverSource=2`,
          source_job_id: `nowcoder_${item.id}`,
        };

        allJobs.push(job);
      }

      result.total = allJobs.length;

      // 写入数据库
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
    ).bind(job.company_name, job.province || '', job.city || '', '民企/互联网').run();
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
