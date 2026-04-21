'use client';
export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, MapPin, Building2, GraduationCap, Briefcase, ExternalLink, Bookmark } from 'lucide-react';
import Header from '../../components/Header';

export default function JobDetailPage() {
  const params = useParams();
  const id = params.id;
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/v1/jobs/${id}`)
      .then((r) => r.json())
      .then((d) => { setJob(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-gray-400">加载中...</div>;
  if (!job) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-gray-400">职位不存在</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <Building2 size={16} />
                <span>{job.company_name || job.company_id || '未知公司'}</span>
              </div>
            </div>
            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <Bookmark size={20} />
            </button>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            {job.province && <Badge icon={<MapPin size={14} />} text={job.province + (job.city ? ` · ${job.city}` : '')} />}
            {job.education && <Badge icon={<GraduationCap size={14} />} text={job.education} />}
            {job.job_type && <Badge icon={<Briefcase size={14} />} text={job.job_type} />}
            {job.apply_end_date && <Badge icon={<Calendar size={14} />} text={`截止 ${job.apply_end_date}`} color="red" />}
          </div>

          {job.salary_text && (
            <div className="mb-6 p-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
              薪资：{job.salary_text}
            </div>
          )}

          <div className="space-y-6 text-gray-700 leading-relaxed">
            {job.description && (
              <section>
                <h3 className="font-semibold text-gray-900 mb-2">职位描述</h3>
                <p className="whitespace-pre-wrap">{job.description}</p>
              </section>
            )}
            {job.requirements && (
              <section>
                <h3 className="font-semibold text-gray-900 mb-2">任职要求</h3>
                <p className="whitespace-pre-wrap">{job.requirements}</p>
              </section>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              来源：{job.source_name || '国聘网'}
            </div>
            <a
              href={job.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              去官网申请
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

function Badge({ icon, text, color }: { icon: React.ReactNode; text: string; color?: string }) {
  const colorClass = color === 'red' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700';
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
      {icon}
      {text}
    </span>
  );
}
