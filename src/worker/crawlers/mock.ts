import type { Crawler, CrawlResult, RawJob } from './types';

/**
 * 种子数据爬虫
 * 基于真实国企招聘信息构建，覆盖央企、金融机构、能源、建筑、航天、电信等多行业
 */
export const mockCrawler: Crawler = {
  name: '种子数据源',
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
      // === 能源电力 ===
      { source_id: this.sourceId, title: '软件工程师（Java方向）', company_name: '国家电网有限公司', job_type: '校招', department: '信息通信部', education: '本科及以上', experience: '应届生', major: '计算机科学与技术、软件工程', salary_text: '15-25万/年', work_location: '北京市朝阳区', province: '北京', city: '北京', description: '负责电网信息系统的开发与维护，参与智能电网建设。', requirements: '1. 计算机相关专业本科及以上学历\n2. 熟悉Java、Spring Boot框架\n3. 良好的沟通能力和团队协作精神', publish_date: '2026-04-20', apply_end_date: '2026-05-20', source_url: 'https://www.iguopin.com/job/100001', source_job_id: 'MOCK_001' },
      { source_id: this.sourceId, title: '电气工程师', company_name: '中国石油天然气集团有限公司', job_type: '校招', department: '生产运营部', education: '本科及以上', experience: '应届生', major: '电气工程及其自动化', salary_text: '12-20万/年', work_location: '天津市滨海新区', province: '天津', city: '天津', description: '负责石油钻井平台的电气设备维护与管理。', requirements: '1. 电气工程专业本科及以上\n2. 熟悉PLC编程\n3. 能适应海上工作环境', publish_date: '2026-04-18', apply_end_date: '2026-05-15', source_url: 'https://www.iguopin.com/job/100002', source_job_id: 'MOCK_002' },
      { source_id: this.sourceId, title: '石油地质勘探工程师', company_name: '中国石油天然气集团有限公司', job_type: '校招', department: '勘探开发部', education: '硕士及以上', experience: '应届生', major: '石油地质、地质学', salary_text: '15-25万/年', work_location: '新疆克拉玛依市', province: '新疆', city: '克拉玛依', description: '参与油气田地质勘探数据分析与储层评价工作。', requirements: '1. 地质/石油工程专业\n2. 能适应野外工作\n3. 熟练使用Petrel等软件', publish_date: '2026-04-16', apply_end_date: '2026-05-20', source_url: 'https://www.iguopin.com/job/100021', source_job_id: 'MOCK_021' },
      { source_id: this.sourceId, title: '化工工艺工程师', company_name: '中国石油化工集团有限公司', job_type: '社招', department: '生产技术部', education: '本科及以上', experience: '2-5年', major: '化学工程、化工工艺', salary_text: '15-28万/年', work_location: '山东省淄博市', province: '山东', city: '淄博', description: '负责炼油装置的工艺优化与技术改造。', requirements: '1. 化工工艺专业\n2. 2-5年石化行业经验\n3. 熟悉HYSYS/Aspen', publish_date: '2026-04-15', apply_end_date: '2026-05-15', source_url: 'https://www.iguopin.com/job/100022', source_job_id: 'MOCK_022' },
      { source_id: this.sourceId, title: '核电工程师', company_name: '中国核电工程集团有限公司', job_type: '校招', department: '设计部', education: '硕士及以上', experience: '应届生', major: '核工程与核技术、热能动力', salary_text: '18-30万/年', work_location: '福建省福州市', province: '福建', city: '福州', description: '参与核电站核心系统的设计与安全分析工作。', requirements: '1. 核工程专业\n2. 通过核安全基础考试\n3. 身体健康', publish_date: '2026-04-14', apply_end_date: '2026-06-01', source_url: 'https://www.iguopin.com/job/100023', source_job_id: 'MOCK_023' },
      { source_id: this.sourceId, title: '风电场站运维工程师', company_name: '中国华能集团有限公司', job_type: '社招', department: '运维部', education: '本科及以上', experience: '1-3年', major: '电气工程、机械工程', salary_text: '12-20万/年', work_location: '内蒙古呼和浩特市', province: '内蒙古', city: '呼和浩特', description: '负责风电场的运行维护与故障排查。', requirements: '1. 电气/机械专业\n2. 能适应高海拔环境\n3. 有高压电工证优先', publish_date: '2026-04-13', apply_end_date: '2026-05-20', source_url: 'https://www.iguopin.com/job/100024', source_job_id: 'MOCK_024' },
      { source_id: this.sourceId, title: '太阳能研究员', company_name: '国家能源投资集团有限公司', job_type: '校招', department: '研发中心', education: '博士', experience: '应届生', major: '材料科学、光电工程', salary_text: '20-35万/年', work_location: '江苏省南京市', province: '江苏', city: '南京', description: '开展高效太阳能电池技术研究与应用。', requirements: '1. 材料/光电博士\n2. 有相关研究论文\n3. 良好的英文写作能力', publish_date: '2026-04-12', apply_end_date: '2026-05-30', source_url: 'https://www.iguopin.com/job/100025', source_job_id: 'MOCK_025' },

      // === 建筑工程 ===
      { source_id: this.sourceId, title: '财务管理岗', company_name: '中国建筑集团有限公司', job_type: '社招', department: '财务部', education: '本科及以上', experience: '1-3年', major: '会计学、财务管理', salary_text: '10-18万/年', work_location: '上海市浦东新区', province: '上海', city: '上海', description: '负责项目财务核算、成本管理和资金运营工作。', requirements: '1. 会计或财务管理专业\n2. 持有会计从业资资证书\n3. 1-3年相关工作经验', publish_date: '2026-04-15', apply_end_date: '2026-05-10', source_url: 'https://www.iguopin.com/job/100003', source_job_id: 'MOCK_003' },
      { source_id: this.sourceId, title: '房建工程项目经理', company_name: '中国中铁股份有限公司', job_type: '社招', department: '项目管理部', education: '本科及以上', experience: '5-8年', major: '工程管理、土木工程', salary_text: '25-45万/年', work_location: '广东省广州市', province: '广东', city: '广州', description: '负责轨道交通项目的全流程管理。', requirements: '1. 工程管理专业\n2. 一级建造师资质\n3. 5年以上铁路/轨道项目经验', publish_date: '2026-04-11', apply_end_date: '2026-05-15', source_url: 'https://www.iguopin.com/job/100026', source_job_id: 'MOCK_026' },
      { source_id: this.sourceId, title: 'BIM工程师', company_name: '中国建筑第八工程局有限公司', job_type: '社招', department: '设计院', education: '本科及以上', experience: '2-4年', major: '建筑学、工程管理', salary_text: '15-25万/年', work_location: '河南省郑州市', province: '河南', city: '郑州', description: '负责建筑项目BIM建模与协同管理。', requirements: '1. 建筑/土木专业\n2. 精通Revit/Navisworks\n3. 有BIM一级证书', publish_date: '2026-04-10', apply_end_date: '2026-05-10', source_url: 'https://www.iguopin.com/job/100027', source_job_id: 'MOCK_027' },
      { source_id: this.sourceId, title: '安全工程师', company_name: '中国交建集团有限公司', job_type: '社招', department: '安全监督部', education: '本科及以上', experience: '3-5年', major: '安全工程、水利工程', salary_text: '18-30万/年', work_location: '湖南省长沙市', province: '湖南', city: '长沙', description: '负责水利工程的安全监督与风险评估。', requirements: '1. 安全工程专业\n2. 注册安全工程师\n3. 3年以上水利/交通安全管理经验', publish_date: '2026-04-09', apply_end_date: '2026-05-08', source_url: 'https://www.iguopin.com/job/100028', source_job_id: 'MOCK_028' },
      { source_id: this.sourceId, title: '土木工程师', company_name: '中国交通建设股份有限公司', job_type: '校招', department: '工程部', education: '本科及以上', experience: '应届生', major: '土木工程、道桥工程', salary_text: '12-18万/年', work_location: '湖南省长沙市', province: '湖南', city: '长沙', description: '参与基础设施建设项目的规划与管理工作。', requirements: '1. 土木工程相关专业\n2. 能适应野外工作环境\n3. 良好的团队协作能力', publish_date: '2026-04-12', apply_end_date: '2026-05-15', source_url: 'https://www.iguopin.com/job/100009', source_job_id: 'MOCK_009' },
      { source_id: this.sourceId, title: '轨道车辆工程师', company_name: '中国中车集团有限公司', job_type: '校招', department: '车辆研究所', education: '硕士及以上', experience: '应届生', major: '机械工程、车辆工程', salary_text: '16-26万/年', work_location: '湖南省株洲市', province: '湖南', city: '株洲', description: '参与高铁车辆的设计与研发工作。', requirements: '1. 机械/车辆专业\n2. 精通SolidWorks/ANSYS\n3. 有相关实习经验', publish_date: '2026-04-08', apply_end_date: '2026-05-20', source_url: 'https://www.iguopin.com/job/100029', source_job_id: 'MOCK_029' },
      { source_id: this.sourceId, title: '船舶设计工程师', company_name: '中国船舶集团有限公司', job_type: '校招', department: '设计院', education: '硕士及以上', experience: '应届生', major: '船舶与海洋工程、流体力学', salary_text: '18-28万/年', work_location: '上海市浦东新区', province: '上海', city: '上海', description: '参与民用船舶的结构设计与性能优化。', requirements: '1. 船舶/海洋工程专业\n2. 熟练使用TRIBON/AM\n3. 英语CET-6以上', publish_date: '2026-04-07', apply_end_date: '2026-06-01', source_url: 'https://www.iguopin.com/job/100030', source_job_id: 'MOCK_030' },
      { source_id: this.sourceId, title: '港口机械工程师', company_name: '中国港湾集团有限公司', job_type: '校招', department: '技术部', education: '本科及以上', experience: '应届生', major: '机械工程、港口机械与海洋工程', salary_text: '13-20万/年', work_location: '天津市塘沽区', province: '天津', city: '天津', description: '负责港口装卸设备的维护与技术改造工作。', requirements: '1. 机械工程相关专业\n2. 熟悉CAD绘图\n3. 能适应港口工作环境', publish_date: '2026-04-08', apply_end_date: '2026-05-15', source_url: 'https://www.iguopin.com/job/100013', source_job_id: 'MOCK_013' },

      // === 航天科技 ===
      { source_id: this.sourceId, title: '飞行器设计工程师', company_name: '中国商飞飞机有限责任公司', job_type: '校招', department: '研发中心', education: '硕士及以上', experience: '应届生', major: '航空航天工程、飞行器设计', salary_text: '20-35万/年', work_location: '上海市闵行区', province: '上海', city: '上海', description: '参与民机飞行器的气动设计与优化工作。', requirements: '1. 航空航天专业\n2. 熟练使用CATIA等设计软件\n3. 良好的英语能力', publish_date: '2026-04-16', apply_end_date: '2026-06-01', source_url: 'https://www.iguopin.com/job/100006', source_job_id: 'MOCK_006' },
      { source_id: this.sourceId, title: '航天控制系统工程师', company_name: '中国航天科技集团有限公司', job_type: '校招', department: '控制系统部', education: '硕士及以上', experience: '应届生', major: '自动化、控制科学与工程', salary_text: '20-35万/年', work_location: '北京市海淀区', province: '北京', city: '北京', description: '参与卫星姿态控制系统的设计与模拟。', requirements: '1. 自动化/控制专业\n2. 熟练使用MATLAB/Simulink\n3. 通过政审', publish_date: '2026-04-06', apply_end_date: '2026-05-30', source_url: 'https://www.iguopin.com/job/100031', source_job_id: 'MOCK_031' },
      { source_id: this.sourceId, title: '导航系统工程师', company_name: '中国航空工业集团有限公司', job_type: '校招', department: '航电部', education: '硕士及以上', experience: '应届生', major: '电子信息工程、导航工程', salary_text: '18-30万/年', work_location: '陕西省西安市', province: '陕西', city: '西安', description: '参与飞机综合导航系统的研发与测试。', requirements: '1. 电子/导航专业\n2. 熟练使用C/C++\n3. 良好的数学基础', publish_date: '2026-04-05', apply_end_date: '2026-05-25', source_url: 'https://www.iguopin.com/job/100032', source_job_id: 'MOCK_032' },
      { source_id: this.sourceId, title: '火箭推进系统设计', company_name: '中国航天科技集团有限公司', job_type: '社招', department: '总体设计部', education: '博士', experience: '3-5年', major: '航天推进、流体力学', salary_text: '30-50万/年', work_location: '北京丰台区', province: '北京', city: '北京', description: '参与新一代运载火箭推进系统的改进与优化。', requirements: '1. 航天推进博士\n2. 3年以上火箭研发经验\n3. 有重大项目经历', publish_date: '2026-04-04', apply_end_date: '2026-06-15', source_url: 'https://www.iguopin.com/job/100033', source_job_id: 'MOCK_033' },
      { source_id: this.sourceId, title: '航空发动机研究员', company_name: '中国航发动机集团有限公司', job_type: '校招', department: '研发中心', education: '硕士及以上', experience: '应届生', major: '动力工程、航空航天', salary_text: '20-32万/年', work_location: '四川省成都市', province: '四川', city: '成都', description: '参与航发动机的组件设计与测试验证。', requirements: '1. 动力/航空专业\n2. 熟练使用CFD软件\n3. 良好的英文写作', publish_date: '2026-04-03', apply_end_date: '2026-05-20', source_url: 'https://www.iguopin.com/job/100034', source_job_id: 'MOCK_034' },
      { source_id: this.sourceId, title: '航天复合材料工程师', company_name: '中国航空工业集团有限公司', job_type: '校招', department: '材料研究所', education: '硕士及以上', experience: '应届生', major: '材料科学与工程', salary_text: '18-28万/年', work_location: '北京市昌平区', province: '北京', city: '北京', description: '参与飞机复合材料的研发与工艺优化。', requirements: '1. 材料专业\n2. 熟练使用SEM/XRD等设备\n3. 有相关研究经历', publish_date: '2026-04-02', apply_end_date: '2026-05-18', source_url: 'https://www.iguopin.com/job/100035', source_job_id: 'MOCK_035' },

      // === 电信互联网 ===
      { source_id: this.sourceId, title: '通信工程师（5G方向）', company_name: '中国联合网络通信有限公司', job_type: '校招', department: '网络部', education: '硕士及以上', experience: '应届生', major: '通信工程、信息与通信工程', salary_text: '18-30万/年', work_location: '浙江省杭州市', province: '浙江', city: '杭州', description: '负贴5G网络规划、优化与建设工作。', requirements: '1. 通信工程相关专业硕士\n2. 熟悉5G标准和协议\n3. 有相关项目经验优先', publish_date: '2026-04-17', apply_end_date: '2026-05-30', source_url: 'https://www.iguopin.com/job/100005', source_job_id: 'MOCK_005' },
      { source_id: this.sourceId, title: '云计算架构师', company_name: '中国移动通信集团有限公司', job_type: '社招', department: '云能力中心', education: '本科及以上', experience: '3-5年', major: '计算机科学与技术', salary_text: '25-45万/年', work_location: '广东省深圳市', province: '广东', city: '深圳', description: '负责移动云基础设施的架构设计与优化。', requirements: '1. 计算机专业\n2. 精通Kubernetes/Docker\n3. 有大型云平台设计经验', publish_date: '2026-04-01', apply_end_date: '2026-05-15', source_url: 'https://www.iguopin.com/job/100036', source_job_id: 'MOCK_036' },
      { source_id: this.sourceId, title: 'AI算法工程师', company_name: '中国联合网络通信有限公司', job_type: '社招', department: '人工智能中心', education: '硕士及以上', experience: '2-4年', major: '计算机科学、人工智能', salary_text: '25-50万/年', work_location: '浙江省杭州市', province: '浙江', city: '杭州', description: '负责智能客服、网络优化等AI模型的研发与部署。', requirements: '1. 计算机/人工智能专业\n2. 精通TensorFlow/PyTorch\n3. 有NLP或CV项目经验', publish_date: '2026-03-31', apply_end_date: '2026-05-10', source_url: 'https://www.iguopin.com/job/100037', source_job_id: 'MOCK_037' },
      { source_id: this.sourceId, title: '网络安全工程师', company_name: '中国电信集团有限公司', job_type: '社招', department: '网络安全部', education: '本科及以上', experience: '2-5年', major: '网络安全、信息安全', salary_text: '20-35万/年', work_location: '北京市西城区', province: '北京', city: '北京', description: '负责电信核心网络的安全防护与威胁检测。', requirements: '1. 网络安全专业\n2. 持有CISSP/CISP证书\n3. 有渗透测试经验', publish_date: '2026-03-30', apply_end_date: '2026-05-08', source_url: 'https://www.iguopin.com/job/100038', source_job_id: 'MOCK_038' },
      { source_id: this.sourceId, title: '产品经理（智能硬件）', company_name: '中国电信集团有限公司', job_type: '社招', department: '智能终端部', education: '本科及以上', experience: '3-5年', major: '电子信息工程、计算机', salary_text: '22-38万/年', work_location: '上海市浦东新区', province: '上海', city: '上海', description: '负责智能家居、可穿戴设备等产品的规划与管理。', requirements: '1. 电子/计算机专业\n2. 3年以上硬件产品经理经验\n3. 熟练使用Axure/Sketch', publish_date: '2026-03-29', apply_end_date: '2026-05-05', source_url: 'https://www.iguopin.com/job/100039', source_job_id: 'MOCK_039' },
      { source_id: this.sourceId, title: '数据库管理工程师', company_name: '中国移动通信集团有限公司', job_type: '社招', department: '信息技术部', education: '本科及以上', experience: '2-4年', major: '计算机科学、软件工程', salary_text: '18-32万/年', work_location: '广东省广州市', province: '广东', city: '广州', description: '负责大数据平台的数据库架构设计与性能优化。', requirements: '1. 计算机专业\n2. 精通MySQL/PostgreSQL/Oracle\n3. 有分布式数据库经验', publish_date: '2026-03-28', apply_end_date: '2026-05-01', source_url: 'https://www.iguopin.com/job/100040', source_job_id: 'MOCK_040' },

      // === 金融机构 ===
      { source_id: this.sourceId, title: '银行客户经理', company_name: '中国工商银行股份有限公司', job_type: '社招', department: '零售金融部', education: '本科及以上', experience: '1-3年', major: '金融学、经济学', salary_text: '15-28万/年', work_location: '四川省成都市', province: '四川', city: '成都', description: '负责企业客户的金融服务开发与关系维护。', requirements: '1. 金融经济相关专业\n2. 持有银行从业资质证书\n3. 良好的客户开发能力', publish_date: '2026-04-14', apply_end_date: '2026-05-20', source_url: 'https://www.iguopin.com/job/100007', source_job_id: 'MOCK_007' },
      { source_id: this.sourceId, title: '大数据分析师', company_name: '中国人寿保险集团公司', job_type: '社招', department: '数字化部', education: '本科及以上', experience: '2-5年', major: '数据科学、统计学、计算机', salary_text: '20-40万/年', work_location: '深圳市南山区', province: '广东', city: '深圳', description: '负责保险业务数据分析、模型构建和精准营销。', requirements: '1. 数据分析相关专业\n2. 熟练使用Python、SQL\n3. 有金融/保险行业经验优先', publish_date: '2026-04-13', apply_end_date: '2026-05-18', source_url: 'https://www.iguopin.com/job/100008', source_job_id: 'MOCK_008' },
      { source_id: this.sourceId, title: '管培生（金融科技方向）', company_name: '中国工商银行股份有限公司', job_type: '校招', department: '金融科技部', education: '硕士及以上', experience: '应届生', major: '计算机科学、金融工程', salary_text: '18-28万/年', work_location: '北京市西城区', province: '北京', city: '北京', description: '参与银行核心系统的研发与架构设计，推动金融科技创新。', requirements: '1. 计算机或金融工程专业\n2. 精通Java/Python\n3. 对金融业务有浓厚兴趣', publish_date: '2026-04-21', apply_end_date: '2026-05-25', source_url: 'https://www.iguopin.com/job/100016', source_job_id: 'MOCK_016' },
      { source_id: this.sourceId, title: '风险管理岗', company_name: '中国农业银行股份有限公司', job_type: '社招', department: '风险管理部', education: '硕士及以上', experience: '3-5年', major: '金融学、统计学', salary_text: '25-40万/年', work_location: '上海市浦东新区', province: '上海', city: '上海', description: '负责信贷风险评估与管理，建立风险预警模型。', requirements: '1. 金融/统计专业\n2. 3-5年银行风险管理经验\n3. 熟练使用SAS/R/Python', publish_date: '2026-04-20', apply_end_date: '2026-05-20', source_url: 'https://www.iguopin.com/job/100017', source_job_id: 'MOCK_017' },
      { source_id: this.sourceId, title: '投资银行分析师', company_name: '中信证券股份有限公司', job_type: '社招', department: '投行部', education: '硕士及以上', experience: '2-4年', major: '金融学、会计学', salary_text: '30-60万/年', work_location: '深圳市福田区', province: '广东', city: '深圳', description: '参与IPO、并购等投行项目的尽职调查与执行。', requirements: '1. 金融/会计专业\n2. 持有CPA/CFA证书\n3. 有投行实习经验', publish_date: '2026-04-19', apply_end_date: '2026-05-18', source_url: 'https://www.iguopin.com/job/100018', source_job_id: 'MOCK_018' },
      { source_id: this.sourceId, title: '保险精算师', company_name: '中国人寿保险（集团）公司', job_type: '社招', department: '精算部', education: '本科及以上', experience: '1-3年', major: '精算学、数学', salary_text: '18-30万/年', work_location: '北京市东城区', province: '北京', city: '北京', description: '负责保险产品定价、责任准备金评估和利润测试。', requirements: '1. 精算/数学专业\n2. 通过精算师考试\n3. 熟练使用Excel和精算软件', publish_date: '2026-04-18', apply_end_date: '2026-05-15', source_url: 'https://www.iguopin.com/job/100019', source_job_id: 'MOCK_019' },
      { source_id: this.sourceId, title: '银行业务培训生', company_name: '中国银行股份有限公司', job_type: '校招', department: '人力资源部', education: '本科及以上', experience: '应届生', major: '不限', salary_text: '12-18万/年', work_location: '沈阳市和平区', province: '辽宁', city: '沈阳', description: '通过系统培训后，分配至各业务部门轮岗。', requirements: '1. 本科及以上学历\n2. 良好的学习能力\n3. 语言表达能力强', publish_date: '2026-04-17', apply_end_date: '2026-05-30', source_url: 'https://www.iguopin.com/job/100020', source_job_id: 'MOCK_020' },

      // === 交通运输 ===
      { source_id: this.sourceId, title: '航运管理岗', company_name: '中国远洋海运集团有限公司', job_type: '校招', department: '运营部', education: '本科及以上', experience: '应届生', major: '航运管理、物流管理', salary_text: '14-22万/年', work_location: '上海市浦东新区', province: '上海', city: '上海', description: '负责远洋货运的调度与管理工作。', requirements: '1. 航运/物流管理专业\n2. 良好的英语能力\n3. 适应海上工作环境', publish_date: '2026-04-07', apply_end_date: '2026-05-12', source_url: 'https://www.iguopin.com/job/100014', source_job_id: 'MOCK_014' },
      { source_id: this.sourceId, title: '铁路信号工程师', company_name: '中国铁路工程集团有限公司', job_type: '校招', department: '信号工程部', education: '本科及以上', experience: '应届生', major: '通信工程、铁路信号控制', salary_text: '12-18万/年', work_location: '河南省郑州市', province: '河南', city: '郑州', description: '参与高铁信号系统的设计与施工监理工作。', requirements: '1. 通信或铁路信号专业\n2. 熟悉铁路信号系统\n3. 能适应野外施工', publish_date: '2026-04-06', apply_end_date: '2026-05-10', source_url: 'https://www.iguopin.com/job/100015', source_job_id: 'MOCK_015' },
      { source_id: this.sourceId, title: '高铁运营管理岗', company_name: '中国国家铁路集团有限公司', job_type: '校招', department: '运营部', education: '本科及以上', experience: '应届生', major: '运输管理、交通运输', salary_text: '12-18万/年', work_location: '河北省石家庄市', province: '河北', city: '石家庄', description: '参与高铁运营组织与调度管理工作。', requirements: '1. 运输/交通专业\n2. 良好的沟通协调能力\n3. 能适应倒班', publish_date: '2026-03-27', apply_end_date: '2026-04-30', source_url: 'https://www.iguopin.com/job/100041', source_job_id: 'MOCK_041' },
      { source_id: this.sourceId, title: '民航飞行员培养生', company_name: '中国国际航空股份有限公司', job_type: '校招', department: '飞行部', education: '本科及以上', experience: '应届生', major: '不限', salary_text: '15-25万/年', work_location: '北京市顺义区', province: '北京', city: '北京', description: '通过系统培训后，成为国航客运飞行员。', requirements: '1. 本科及以上学历\n2. 身体健康，视力达标\n3. 英语CET-4以上', publish_date: '2026-03-26', apply_end_date: '2026-05-20', source_url: 'https://www.iguopin.com/job/100042', source_job_id: 'MOCK_042' },
      { source_id: this.sourceId, title: '氧船舶管理岗', company_name: '中远海运输股份有限公司', job_type: '校招', department: '船舶管理部', education: '本科及以上', experience: '应届生', major: '航运管理、海事管理', salary_text: '18-28万/年', work_location: '上海市浦东新区', province: '上海', city: '上海', description: '负责远洋货轮的运营管理与船舶调度。', requirements: '1. 航运/海事管理专业\n2. 适应长期海上生活\n3. 英语CET-6优先', publish_date: '2026-03-25', apply_end_date: '2026-05-15', source_url: 'https://www.iguopin.com/job/100043', source_job_id: 'MOCK_043' },
      { source_id: this.sourceId, title: '交通规划师', company_name: '中国交通建设股份有限公司', job_type: '社招', department: '规划设计院', education: '硕士及以上', experience: '3-5年', major: '交通运输工程、交通规划', salary_text: '20-35万/年', work_location: '四川省成都市', province: '四川', city: '成都', description: '参与城市交通规划与基础设施项目设计。', requirements: '1. 交通规划专业\n2. 注册交通规划师\n3. 3年以上项目经验', publish_date: '2026-03-24', apply_end_date: '2026-05-10', source_url: 'https://www.iguopin.com/job/100044', source_job_id: 'MOCK_044' },
      { source_id: this.sourceId, title: '物流管理岗', company_name: '中国邮政集团有限公司', job_type: '校招', department: '物流部', education: '本科及以上', experience: '应届生', major: '物流管理、供应链管理', salary_text: '10-16万/年', work_location: '江苏省南京市', province: '江苏', city: '南京', description: '参与邮政快递物流网络的优化与管理工作。', requirements: '1. 物流/供应链专业\n2. 良好的数据分析能力\n3. 适应倒班工作', publish_date: '2026-03-23', apply_end_date: '2026-05-01', source_url: 'https://www.iguopin.com/job/100045', source_job_id: 'MOCK_045' },

      // === 人力资源 ===
      { source_id: this.sourceId, title: '人力资源专员', company_name: '中国移动通信集团有限公司', job_type: '校招', department: '人力资源部', education: '本科及以上', experience: '应届生', major: '人力资源管理、心理学', salary_text: '14-22万/年', work_location: '广东省广州市', province: '广东', city: '广州', description: '负责员工招聘、培训与绩效管理工作。', requirements: '1. 人力资源管理专业\n2. 熟练使用Office软件\n3. 良好的人际交往能力', publish_date: '2026-04-19', apply_end_date: '2026-05-25', source_url: 'https://www.iguopin.com/job/100004', source_job_id: 'MOCK_004' },

      // === 市场营销 ===
      { source_id: this.sourceId, title: '市场营销经理', company_name: '中国中化集团有限公司', job_type: '社招', department: '营销部', education: '本科及以上', experience: '3-5年', major: '市场营销、国际贸易', salary_text: '18-30万/年', work_location: '江苏省南京市', province: '江苏', city: '南京', description: '负责化工产品的市场开拓与客户关系维护。', requirements: '1. 营销相关专业\n2. 3-5年化工/材料行业销售经验\n3. 良好的英语沟通能力', publish_date: '2026-04-11', apply_end_date: '2026-05-10', source_url: 'https://www.iguopin.com/job/100010', source_job_id: 'MOCK_010' },

      // === 法律 ===
      { source_id: this.sourceId, title: '法律顾问', company_name: '中国石油化工集团有限公司', job_type: '社招', department: '法律部', education: '本科及以上', experience: '3-5年', major: '法学', salary_text: '18-28万/年', work_location: '北京市朝阳区', province: '北京', city: '北京', description: '负责公司合同审核、法律风险控制和争议解决。', requirements: '1. 法学专业\n2. 持有律师执业证\n3. 3-5年企业法务经验', publish_date: '2026-04-10', apply_end_date: '2026-05-08', source_url: 'https://www.iguopin.com/job/100011', source_job_id: 'MOCK_011' },

      // === 地方国企 ===
      { source_id: this.sourceId, title: '城市规划师', company_name: '北京市基础设施投资集团有限公司', job_type: '社招', department: '规划部', education: '硕士及以上', experience: '3-5年', major: '城市规划、建筑学', salary_text: '20-35万/年', work_location: '北京市东城区', province: '北京', city: '北京', description: '参与城市基础设施和公共建筑的规划与设计。', requirements: '1. 城规/建筑专业\n2. 注册城乡规划师\n3. 有大型项目经验', publish_date: '2026-03-22', apply_end_date: '2026-04-30', source_url: 'https://www.iguopin.com/job/100046', source_job_id: 'MOCK_046' },
      { source_id: this.sourceId, title: '公共交通运营管理', company_name: '上海申通地铁集团有限公司', job_type: '校招', department: '运营部', education: '本科及以上', experience: '应届生', major: '交通运输、工程管理', salary_text: '12-18万/年', work_location: '上海市何浦区', province: '上海', city: '上海', description: '参与地铁运营组织与客流分析工作。', requirements: '1. 交通/运输专业\n2. 良好的服务意识\n3. 适应倒班', publish_date: '2026-03-21', apply_end_date: '2026-04-28', source_url: 'https://www.iguopin.com/job/100047', source_job_id: 'MOCK_047' },
      { source_id: this.sourceId, title: '水务工程师', company_name: '广州自来水有限公司', job_type: '社招', department: '工程部', education: '本科及以上', experience: '2-4年', major: '给排水科学与工程、环境工程', salary_text: '12-20万/年', work_location: '广东省广州市', province: '广东', city: '广州', description: '负责自来水厂的运行管理与工艺优化。', requirements: '1. 环工/给排水专业\n2. 有注册环保工程师证优先\n3. 2年以上相关经验', publish_date: '2026-03-20', apply_end_date: '2026-04-25', source_url: 'https://www.iguopin.com/job/100048', source_job_id: 'MOCK_048' },
      { source_id: this.sourceId, title: '城市环卫管理岗', company_name: '深圳市环卫集团有限公司', job_type: '校招', department: '环卫管理部', education: '本科及以上', experience: '应届生', major: '环境科学、城市管理', salary_text: '10-16万/年', work_location: '深圳市南山区', province: '广东', city: '深圳', description: '参与城市环卫作业的规划与日常监管。', requirements: '1. 环工/城市管理专业\n2. 能适应户外工作\n3. 有驾照优先', publish_date: '2026-03-19', apply_end_date: '2026-04-20', source_url: 'https://www.iguopin.com/job/100049', source_job_id: 'MOCK_049' },
      { source_id: this.sourceId, title: '文化旅游运营', company_name: '杭州西湖文旅集团有限公司', job_type: '社招', department: '运营部', education: '本科及以上', experience: '2-4年', major: '旅游管理、文化产业管理', salary_text: '12-20万/年', work_location: '浙江省杭州市', province: '浙江', city: '杭州', description: '负责西湖景区旅游项目的运营与市场推广。', requirements: '1. 旅游/文化产业专业\n2. 熟悉旅游市场\n3. 有文案策划能力', publish_date: '2026-03-18', apply_end_date: '2026-04-18', source_url: 'https://www.iguopin.com/job/100050', source_job_id: 'MOCK_050' },
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
