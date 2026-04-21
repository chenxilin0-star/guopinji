'use client';
export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '../../components/Header';
import JobCard from '../../components/JobCard';

export default function CompanyPage() {
  const params = useParams();
  const id = params.id;
  const [company, setCompany] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/v1/companies/${id}`).then((r) => r.json()).then((d: any) => setCompany(d));
    fetch(`/api/v1/companies/${id}/jobs`).then((r) => r.json()).then((d: any) => setJobs(d.data || []));
  }, [id]);

  if (!company) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-gray-400">加载中...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{company.name}</h1>
          <div className="flex flex-wrap gap-2 text-sm text-gray-500">
            {company.company_type && <span className="px-2 py-0.5 bg-slate-100 rounded">{company.company_type}</span>}
            {company.industry && <span className="px-2 py-0.5 bg-slate-100 rounded">{company.industry}</span>}
            {company.province && <span className="px-2 py-0.5 bg-slate-100 rounded">{company.province}</span>}
          </div>
          {company.description && <p className="mt-4 text-gray-600 text-sm leading-relaxed">{company.description}</p>}
        </div>

        <h2 className="text-lg font-semibold text-gray-800 mb-4">在招职位（{jobs.length}）</h2>
        <div className="space-y-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
          {jobs.length === 0 && <p className="text-gray-400 text-center py-8">暂无在招职位</p>}
        </div>
      </main>
    </div>
  );
}
