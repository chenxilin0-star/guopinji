'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import JobCard from '../components/JobCard';

interface Filters {
  province: string;
  city: string;
  industry: string;
  company_type: string;
  education: string;
  job_type: string;
}

function JobsContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<Filters>({
    province: '', city: '', industry: '', company_type: '', education: '', job_type: ''
  });
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchJobs = async (reset = false) => {
    setLoading(true);
    const p = reset ? 1 : page;
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (filters.province) params.set('province', filters.province);
    if (filters.industry) params.set('industry', filters.industry);
    if (filters.company_type) params.set('company_type', filters.company_type);
    if (filters.education) params.set('education', filters.education);
    if (filters.job_type) params.set('job_type', filters.job_type);
    params.set('page', String(p));

    try {
      const res = await fetch(`/api/v1/jobs?${params.toString()}`);
      const data = await res.json();
      const list = data.data || data.jobs || [];
      if (reset) {
        setJobs(list);
        setPage(2);
      } else {
        setJobs((prev) => [...prev, ...list]);
        setPage(p + 1);
      }
      setHasMore(list.length >= 20);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(true);
  }, []);

  const handleSearch = (q: string) => {
    setQuery(q);
    fetchJobs(true);
  };

  const handleFilterChange = (f: Filters) => {
    setFilters(f);
    fetchJobs(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <SearchBar initialQuery={query} onSearch={handleSearch} />
        </div>
        <div className="mb-6">
          <FilterPanel filters={filters} onChange={handleFilterChange} />
        </div>
        <div className="space-y-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
          {jobs.length === 0 && !loading && (
            <div className="text-center py-16 text-gray-400">暂无匹配职位</div>
          )}
        </div>
        {hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={() => fetchJobs()}
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? '加载中...' : '加载更多'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-gray-400">加载中...</div>}>
      <JobsContent />
    </Suspense>
  );
}
