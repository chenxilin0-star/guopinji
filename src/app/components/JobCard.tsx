'use client';

import Link from 'next/link';
import { MapPin, GraduationCap, Clock, Building2 } from 'lucide-react';

interface JobCardProps {
  job: {
    id: number;
    title: string;
    company_name?: string;
    province?: string;
    city?: string;
    education?: string;
    salary_text?: string;
    publish_date?: string;
    job_type?: string;
  };
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md hover:border-blue-200 transition-all"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
          <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
            <Building2 size={14} />
            <span>{job.company_name || '未知公司'}</span>
          </div>
        </div>
        {job.salary_text && (
          <span className="text-red-600 font-medium text-sm">{job.salary_text}</span>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <MapPin size={14} />
          {[job.province, job.city].filter(Boolean).join(' · ') || '全国'}
        </span>
        {job.education && (
          <span className="flex items-center gap-1">
            <GraduationCap size={14} />
            {job.education}
          </span>
        )}
        {job.job_type && (
          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{job.job_type}</span>
        )}
      </div>

      {job.publish_date && (
        <div className="flex items-center gap-1 text-xs text-gray-400 mt-3">
          <Clock size={12} />
          发布于 {job.publish_date}
        </div>
      )}
    </Link>
  );
}
