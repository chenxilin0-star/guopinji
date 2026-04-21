import type { Crawler, CrawlResult, RawJob } from './types';

/**
 * 模拟数据爬虫
 * 用于 MVP 阶段填充展示数据，后续可替换为真实爬虫
 */
export const mockCrawler: Crawler = {
  name: '模拟数据源',
  sourceId: 99,
  sourceUrl: 'https://demo.guopinji.com',

  async crawl({ DB }) {
    const result: CrawlResult = {
      sourceName: this.name,
      total: 0,
      newJobs: 0,
      updatedJobs: 0,
      errors: [],
    };

    const mockJobs: RawJob[] = [
      {
        source_id: this.sourceId,
        title: '软件工程师（Java方向）',
        company_name: '国家电网有限公司',
        job_type: '校招',
        department: '信息通信部',
        education: '本科及以上',
        experience: '应届生',
        major: '计算机科学与技术、软件工程',
        salary_text: '15-25万/年',
        work_location: '北京市朝阳区',
        province: '北京',
        city: '北京',
        description: '负责电网信息系统的开发与维护，参与智能电网建设。',
        requirements: '1. 计算机相关专业本科及以上学历\n2. 熟悉Java、Spring Boot框架\n3. 良好的沟通能力和团队协作精神',
        publish_date: '2026-04-20',
        apply_end_date: '2026-05-20',
        source_url: 'https://www.iguopin.com/job/100001',
        source_job_id: 'MOCK_001',
      },
      {
        source_id: this.sourceId,
        title: '电气工程师',
        company_name: '中国石油天然气集团有限公司',
        job_type: '校招',
        department: '生产运营部',
        education: '本科及以上',
        experience: '应届生',
        major: '电气工程及其自动化',
        salary_text: '12-20万/年',
        work_location: '天津市滨海新区',
        province: '天津',
        city: '天津',
        description: '负责石油钻井平台的电气设备维护与管理。',
        requirements: '1. 电气工程专业本科及以上\n2. 熟悉PLC编程\n3. 能适应海上工作环境',
        publish_date: '2026-04-18',
        apply_end_date: '2026-05-15',
        source_url: 'https://www.iguopin.com/job/100002',
        source_job_id: 'MOCK_002',
      },
      {
        source_id: this.sourceId,
        title: '财务管理岗',
        company_name: '中国建筑集团有限公司',
        job_type: '社招',
        department: '财务部',
        education: '本科及以上',
        experience: '1-3年',
        major: '会计学、财务管理',
        salary_text: '10-18万/年',
        work_location: '上海市浦东新区',
        province: '上海',
        city: '上海',
        description: '负责项目财务核算、成本管理和资金运营工作。',
        requirements: '1. 会计或财务管理专业\n2. 持有会计从业资资证书\n3. 1-3年相关工作经验',
        publish_date: '2026-04-15',
        apply_end_date: '2026-05-10',
        source_url: 'https://www.iguopin.com/job/100003',
        source_job_id: 'MOCK_003',
      },
      {
        source_id: this.sourceId,
        title: '人力资源专员',
        company_name: '中国移动通信集团有限公司',
        job_type: '校招',
        department: '人力资源部',
        education: '本科及以上',
        experience: '应届生',
        major: '人力资源管理、心理学',
        salary_text: '14-22万/年',
        work_location: '广东省广州市',
        province: '广东',
        city: '广州',
        description: '负责员工招聘、培训与绩效管理工作。',
        requirements: '1. 人力资源管理专业\n2. 熟练使用Office软件\n3. 良好的人际交往能力',
        publish_date: '2026-04-19',
        apply_end_date: '2026-05-25',
        source_url: 'https://www.iguopin.com/job/100004',
        source_job_id: 'MOCK_004',
      },
      {
        source_id: this.sourceId,
        title: '通信工程师（5G方向）',
        company_name: '中国联合网络通信有限公司',
        job_type: '校招',
        department: '网络部',
        education: '硕士及以上',
        experience: '应届生',
        major: '通信工程、信息与通信工程',
        salary_text: '18-30万/年',
        work_location: '浙江省杭州市',
        province: '浙江',
        city: '杭州',
        description: '负责5G网络规划、优化与建设工作。',
        requirements: '1. 通信工程相关专业硕士\n2. 熟悉5G标准和协议\n3. 有相关项目经验优先',
        publish_date: '2026-04-17',
        apply_end_date: '2026-05-30',
        source_url: 'https://www.iguopin.com/job/100005',
        source_job_id: 'MOCK_005',
      },
      {
        source_id: this.sourceId,
        title: '飞行器设计工程师',
        company_name: '中国商飞飞机有限责任公司',
        job_type: '校招',
        department: '研发中心',
        education: '硕士及以上',
        experience: '应届生',
        major: '航空航天工程、飞行器设计',
        salary_text: '20-35万/年',
        work_location: '上海市闵行区',
        province: '上海',
        city: '上海',
        description: '参与民机飞行器的气动设计与优化工作。',
        requirements: '1. 航空航天专业\n2. 熟练使用CATIA等设计软件\n3. 良好的英语能力',
        publish_date: '2026-04-16',
        apply_end_date: '2026-06-01',
        source_url: 'https://www.iguopin.com/job/100006',
        source_job_id: 'MOCK_006',
      },
      {
        source_id: this.sourceId,
        title: '银行客户经理',
        company_name: '中国工商银行股份有限公司',
        job_type: '社招',
        department: '零售金融部',
        education: '本科及以上',
        experience: '1-3年',
        major: '金融学、经济学',
        salary_text: '15-28万/年',
        work_location: '四川省成都市',
        province: '四川',
        city: '成都',
        description: '负责企业客户的金融服务开发与关系维护。',
        requirements: '1. 金融经济相关专业\n2. 持有银行从业资质证书\n3. 良好的客户开发能力',
        publish_date: '2026-04-14',
        apply_end_date: '2026-05-20',
        source_url: 'https://www.iguopin.com/job/100007',
        source_job_id: 'MOCK_007',
      },
      {
        source_id: this.sourceId,
        title: '大数据分析师',
        company_name: '中国人寿保险集团公司',
        job_type: '社招',
        department: '数字化部',
        education: '本科及以上',
        experience: '2-5年',
        major: '数据科学、统计学、计算机',
        salary_text: '20-40万/年',
        work_location: '深圳市南山区',
        province: '广东',
        city: '深圳',
        description: '负责保险业务数据分析、模型构建和精准营销。',
        requirements: '1. 数据分析相关专业\n2. 熟练使用Python、SQL\n3. 有金融/保险行业经验优先',
        publish_date: '2026-04-13',
        apply_end_date: '2026-05-18',
        source_url: 'https://www.iguopin.com/job/100008',
        source_job_id: 'MOCK_008',
      },
      {
        source_id: this.sourceId,
        title: '土木工程师',
        company_name: '中国交通建设股份有限公司',
        job_type: '校招',
        department: '工程部',
        education: '本科及以上',
        experience: '应届生',
        major: '土木工程、道桥工程',
        salary_text: '12-18万/年',
        work_location: '湖南省长沙市',
        province: '湖南',
        city: '长沙',
        description: '参与基础设施建设项目的规划与管理工作。',
        requirements: '1. 土木工程相关专业\n2. 能适应野外工作环境\n3. 良好的团队协作能力',
        publish_date: '2026-04-12',
        apply_end_date: '2026-05-15',
        source_url: 'https://www.iguopin.com/job/100009',
        source_job_id: 'MOCK_009',
      },
      {
        source_id: this.sourceId,
        title: '市场营销经理',
        company_name: '中国中化集团有限公司',
        job_type: '社招',
        department: '营销部',
        education: '本科及以上',
        experience: '3-5年',
        major: '市场营销、国际贸易',
        salary_text: '18-30万/年',
        work_location: '江苏省南京市',
        province: '江苏',
        city: '南京',
        description: '负责化工产品的市场开拓与客户关系维护。',
        requirements: '1. 营销相关专业\n2. 3-5年化工/材料行业销售经验\n3. 良好的英语沟通能力',
        publish_date: '2026-04-11',
        apply_end_date: '2026-05-10',
        source_url: 'https://www.iguopin.com/job/100010',
        source_job_id: 'MOCK_010',
      },
      {
        source_id: this.sourceId,
        title: '法律顾问',
        company_name: '中国石油化工集团有限公司',
        job_type: '社招',
        department: '法律部',
        education: '本科及以上',
        experience: '3-5年',
        major: '法学',
        salary_text: '18-28万/年',
        work_location: '北京市朝阳区',
        province: '北京',
        city: '北京',
        description: '负责公司合同审核、法律风险控制和争议解决。',
        requirements: '1. 法学专业\n2. 持有律师执业证\n3. 3-5年企业法务经验',
        publish_date: '2026-04-10',
        apply_end_date: '2026-05-08',
        source_url: 'https://www.iguopin.com/job/100011',
        source_job_id: 'MOCK_011',
      },
      {
        source_id: this.sourceId,
        title: '新能源技术研究员',
        company_name: '国家电投集团有限公司',
        job_type: '校招',
        department: '研发中心',
        education: '硕士及以上',
        experience: '应届生',
        major: '电气工程、能源动力工程',
        salary_text: '16-25万/年',
        work_location: '重庆市渝中区',
        province: '重庆',
        city: '重庆',
        description: '参与光伏、风电等新能源项目的技术研究。',
        requirements: '1. 新能源相关专业\n2. 熟悉光伏技术原理\n3. 有相关论文或专利优先',
        publish_date: '2026-04-09',
        apply_end_date: '2026-05-20',
        source_url: 'https://www.iguopin.com/job/100012',
        source_job_id: 'MOCK_012',
      },
      {
        source_id: this.sourceId,
        title: '港口机械工程师',
        company_name: '中国港湾集团有限公司',
        job_type: '校招',
        department: '技术部',
        education: '本科及以上',
        experience: '应届生',
        major: '机械工程、港口机械与海洋工程',
        salary_text: '13-20万/年',
        work_location: '天津市塘沽区',
        province: '天津',
        city: '天津',
        description: '负责港口装卸设备的维护与技术改造工作。',
        requirements: '1. 机械工程相关专业\n2. 熟悉CAD绘图\n3. 能适应港口工作环境',
        publish_date: '2026-04-08',
        apply_end_date: '2026-05-15',
        source_url: 'https://www.iguopin.com/job/100013',
        source_job_id: 'MOCK_013',
      },
      {
        source_id: this.sourceId,
        title: '航运管理岗',
        company_name: '中国远洋海运集团有限公司',
        job_type: '校招',
        department: '运营部',
        education: '本科及以上',
        experience: '应届生',
        major: '航运管理、物流管理',
        salary_text: '14-22万/年',
        work_location: '上海市浦东新区',
        province: '上海',
        city: '上海',
        description: '负责远洋货运的调度与管理工作。',
        requirements: '1. 航运或物流管理专业\n2. 良好的英语能力\n3. 适应海上工作环境',
        publish_date: '2026-04-07',
        apply_end_date: '2026-05-12',
        source_url: 'https://www.iguopin.com/job/100014',
        source_job_id: 'MOCK_014',
      },
      {
        source_id: this.sourceId,
        title: '铁路信号工程师',
        company_name: '中国铁路工程集团有限公司',
        job_type: '校招',
        department: '信号工程部',
        education: '本科及以上',
        experience: '应届生',
        major: '通信工程、铁路信号控制',
        salary_text: '12-18万/年',
        work_location: '河南省郑州市',
        province: '河南',
        city: '郑州',
        description: '参与高铁信号系统的设计与施工监理工作。',
        requirements: '1. 通信或铁路信号专业\n2. 熟悉铁路信号系统\n3. 能适应野外施工',
        publish_date: '2026-04-06',
        apply_end_date: '2026-05-10',
        source_url: 'https://www.iguopin.com/job/100015',
        source_job_id: 'MOCK_015',
      },
    ];

    try {
      for (const job of mockJobs) {
        const { newCount, updateCount } = await saveJob(DB, job);
        result.newJobs += newCount;
        result.updatedJobs += updateCount;
      }
      result.total = mockJobs.length;

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
    ).bind(job.company_name, job.province || '', job.city || '', '央企').run();
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