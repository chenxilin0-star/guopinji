import type { Crawler, CrawlResult, RawJob } from './types';

/**
 * 中国银行招聘公告爬虫
 * 抓取方式：解析 HTML 公告列表页
 * 数据来源：https://www.boc.cn/aboutboc/bi4/
 */
export const bocAnnouncementsCrawler: Crawler = {
  name: '中国银行招聘公告',
  sourceId: 7,
  sourceUrl: 'https://www.boc.cn/aboutboc/bi4/',

  async crawl({ DB, fetch }) {
    const result: CrawlResult = {
      sourceName: this.name,
      total: 0,
      newJobs: 0,
      updatedJobs: 0,
      errors: [],
    };

    try {
      const res = await fetch(this.sourceUrl, {
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

      // 提取公告链接和标题
      // 格式：<a href="./202603/t20260311_25654054.html" title="...">...</a>
      const announcementPattern = /<a[^>]*href="(\.\/[^"]*)"[^>]*title="([^"]*)"[^>]*>([^<]*)<\/a>/gi;

      const allJobs: RawJob[] = [];
      const seen = new Set<string>();
      let match;

      while ((match = announcementPattern.exec(html)) !== null) {
        const [_, href, titleAttr, text] = match;
        const title = (titleAttr || text || '').trim();

        if (!title || title.length < 5 || title.length > 200) continue;
        if (seen.has(title)) continue;

        // 只保留招聘相关公告
        const isRecruitment = /(?:招聘|公告|公示|招收|招募|校招|春招|秋招|实习)/i.test(title);
        if (!isRecruitment) continue;

        seen.add(title);

        // 构建完整 URL
        const fullUrl = href.startsWith('http')
          ? href
          : 'https://www.boc.cn/aboutboc/bi4/' + href.replace(/^\.\//, '');

        // 从文件名提取日期 (t20260311_25654054.html → 2026-03-11)
        let publishDate = '';
        const dateMatch = href.match(/t(\d{4})(\d{2})(\d{2})/);
        if (dateMatch) {
          publishDate = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
        }

        // 判断招聘类型
        let jobType = '社招';
        if (title.includes('春招')) {
          jobType = '春招';
        } else if (title.includes('秋招') || title.includes('校园')) {
          jobType = '校招';
        } else if (title.includes('实习')) {
          jobType = '实习';
        } else if (title.includes('社会') || title.includes('高层次')) {
          jobType = '社招';
        }

        const job: RawJob = {
          source_id: this.sourceId,
          title,
          company_name: '中国银行',
          job_type: jobType,
          department: '',
          education: '本科及以上',
          experience: jobType === '校招' || jobType === '春招' || jobType === '实习' ? '应届生' : '1-3年',
          major: '',
          salary_text: '薪资面议',
          work_location: '全国',
          province: '',
          city: '',
          description: `【${jobType}】${title}\n\n来源：中国银行官网招聘公告\n公告链接：${fullUrl}`,
          requirements: '',
          publish_date: publishDate,
          apply_end_date: '',
          source_url: fullUrl,
          source_job_id: `boc_${href.match(/t\d+_(\d+)\.html/)?.[1] || title.slice(0, 30)}`,
        };

        allJobs.push(job);
      }

      // 如果正则没匹配到，尝试更宽松的模式
      if (allJobs.length === 0) {
        const loosePattern = /<a[^>]*href="(\.\/\d{6}\/t\d+_\d+\.html)"[^>]*>([^<]{10,100})<\/a>/gi;
        while ((match = loosePattern.exec(html)) !== null) {
          const [_, href, text] = match;
          const title = text.trim();
          if (!/招聘|公告|公示|校招|春招|实习/i.test(title)) continue;
          if (seen.has(title)) continue;
          seen.add(title);

          const fullUrl = 'https://www.boc.cn/aboutboc/bi4/' + href.replace(/^\.\//, '');
          const dateMatch = href.match(/t(\d{4})(\d{2})(\d{2})/);
          const publishDate = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : '';

          const job: RawJob = {
            source_id: this.sourceId,
            title,
            company_name: '中国银行',
            job_type: '招聘',
            department: '',
            education: '本科及以上',
            experience: '应届生',
            major: '',
            salary_text: '薪资面议',
            work_location: '全国',
            province: '',
            city: '',
            description: `来源：中国银行官网招聘公告\n公告链接：${fullUrl}`,
            requirements: '',
            publish_date: publishDate,
            apply_end_date: '',
            source_url: fullUrl,
            source_job_id: `boc_${href.match(/t\d+_(\d+)\.html/)?.[1] || title.slice(0, 20)}`,
          };
          allJobs.push(job);
        }
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
    ).bind(job.company_name, job.province || '', job.city || '', '国有银行').run();
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
      job.source_url, existingJob.id
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
      job.source_url, job.source_job_id || ''
    ).run();
    newCount = 1;
  }

  return { newCount, updateCount };
}
