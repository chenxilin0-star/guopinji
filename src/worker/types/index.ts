export interface User {
  id: number;
  email: string;
  phone?: string;
  password_hash: string;
  nickname?: string;
  is_active: number;
  created_at: string;
}

export interface Company {
  id: number;
  name: string;
  short_name?: string;
  full_name?: string;
  company_type?: string;
  industry?: string;
  province?: string;
  city?: string;
  description?: string;
  website?: string;
  logo_url?: string;
  created_at: string;
}

export interface Job {
  id: number;
  source_id: number;
  company_id?: number;
  title: string;
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
  status: string;
  is_deleted: number;
  created_at: string;
  updated_at: string;
  company_name?: string;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  code_prefix: string;
  duration_days: number;
  price: number;
}

export interface Code {
  id: number;
  code: string;
  plan_id: number;
  status: 'pending' | 'redeemed' | 'expired';
  redeemed_by?: number;
  redeemed_at?: string;
  created_at: string;
}

export interface UserSubscription {
  id: number;
  user_id: number;
  code_id: number;
  plan_id: number;
  started_at: string;
  expires_at: string;
  is_active: number;
}

export interface Subscription {
  id: number;
  user_id: number;
  keyword?: string;
  industry?: string;
  province?: string;
  city?: string;
  company_type?: string;
  education?: string;
  job_type?: string;
  is_active: number;
  created_at: string;
}

export interface Favorite {
  id: number;
  user_id: number;
  job_id: number;
  created_at: string;
}

export interface JWTPayload {
  userId: number;
  email: string;
  iat: number;
  exp: number;
}
