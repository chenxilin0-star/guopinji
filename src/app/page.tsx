'use client';

import { useEffect, useState } from 'react';
import { Search, TrendingUp, Building2, MapPin, ChevronRight } from 'lucide-react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import JobCard from './components/JobCard';

export default function HomePage() {
  const [stats, setStats] = useState({ total_jobs: 0, total_companies: 0, today_jobs: 0 });
  const [hotJobs, setHotJobs] = useState<any[]>([]);
  const router = typeof window !== 'undefined' ? require('next/navigation').useRouter() : { push: () => {} };

  useEffect(() => {
    fetch('/api/v1/stats/home').then((r) => r.json()).then((d) => setStats(d));
    fetch('/api/v1/jobs/hot').then((r) => r.json()).then((d) => setHotJobs(d.data || []));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">国聘集</h1>
          <p className="text-blue-100 text-lg mb-8">权威国企招聘信息聚合平台</p>
          <div className="max-w-2xl mx-auto">
            <SearchBar onSearch={(q) => router.push(`/jobs?q=${encodeURIComponent(q)}`)} />
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm text-blue-200">
            <span>🔥 国家电网</span>
            <span>🔥 中国移动</span>
            <span>🔥 中国石油</span>
            <span>🔥 中国建筑</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-3 gap-4 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total_jobs}+</div>
            <div className="text-xs text-gray-500 mt-1">聚合职位</div>
          </div>
          <div className="text-center border-x border-gray-100">
            <div className="text-2xl font-bold text-blue-600">{stats.total_companies}+</div>
            <div className="text-xs text-gray-500 mt-1">覆盖企业</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.today_jobs}</div>
            <div className="text-xs text-gray-500 mt-1">今日新增</div>
          </div>
        </div>
      </section>

      {/* Hot Jobs */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600" />
            最新职位
          </h2>
          <a href="/jobs" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
            查看更多 <ChevronRight size={16} />
          </a>
        </div>
        <div className="space-y-4">
          {hotJobs.slice(0, 5).map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>

      {/* Subscribe CTA */}
      <section className="bg-blue-900 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-3">不错过任何一个国企机会</h2>
          <p className="text-blue-200 mb-8">订阅推送，每日早上8点精准送达符合你条件的职位</p>
          <a
            href="/subscribe"
            className="inline-block px-8 py-3 bg-white text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            获取订阅
          </a>
        </div>
      </section>
    </div>
  );
}
