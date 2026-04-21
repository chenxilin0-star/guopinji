/**
 * 爬虫通用类型定义
 */

export interface RawJob {
  source_id: number;
  title: string;
  company_name: string;
  job_type?: string;
  department?: string;
  education?: string;
  experience?: string;
  major?: string;
  salary_min?: number;
  salary_max?: number;
  salary_text?: string;
  work_location?: string;
  province?: string;
  city?: string;
  description?: string;
  requirements?: string;
  publish_date?: string;
  apply_end_date?: string;
  source_url: string;
  source_job_id?: string;
  source_name?: string;
  company_type?: string;
  company_scale?: string;
  industry?: string;
  companyId?: string;
}

export interface CrawlResult {
  sourceName: string;
  total: number;
  newJobs: number;
  updatedJobs: number;
  errors: string[];
}

export interface Crawler {
  name: string;
  sourceId: number;
  sourceUrl: string;
  crawl(env: {
    DB: D1Database;
    CACHE: KVNamespace;
    fetch: typeof fetch;
  }): Promise<CrawlResult>;
}
