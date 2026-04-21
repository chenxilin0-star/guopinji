'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, BarChart3, Key } from 'lucide-react';
import Header from '../components/Header';

export default function AdminPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [codeCount, setCodeCount] = useState(10);
  const [planId, setPlanId] = useState(2);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) { router.push('/'); return; }
    setToken(t);
    fetch('/api/v1/admin/stats', { headers: { Authorization: `Bearer ${t}` } })
      .then((r) => r.json()).then((d) => setStats(d));
  }, [router]);

  const generateCodes = async () => {
    const res = await fetch('/api/v1/admin/codes/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ count: codeCount, plan_id: planId }),
    });
    const data: any = await res.json();
    if (data.codes) setGeneratedCodes(data.codes);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Shield size={24} className="text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">管理后台</h1>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<BarChart3 size={18} />} label="总职位数" value={stats?.total_jobs || 0} />
          <StatCard icon={<BarChart3 size={18} />} label="总用户数" value={stats?.total_users || 0} />
          <StatCard icon={<BarChart3 size={18} />} label="今日新增" value={stats?.today_jobs || 0} />
          <StatCard icon={<Key size={18} />} label="Code 码总数" value={stats?.total_codes || 0} />
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">生成 Code 码</h3>
          <div className="flex gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">数量</label>
              <input type="number" value={codeCount} onChange={(e) => setCodeCount(Number(e.target.value))} className="px-3 py-2 border rounded-md text-sm w-24" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">套餐</label>
              <select value={planId} onChange={(e) => setPlanId(Number(e.target.value))} className="px-3 py-2 border rounded-md text-sm">
                <option value={1}>7天体验 ¥6.9</option>
                <option value={2}>15天标准 ¥9.9</option>
                <option value={3}>30天尊享 ¥16.9</option>
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={generateCodes} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium">
                生成
              </button>
            </div>
          </div>
          {generatedCodes.length > 0 && (
            <div className="p-3 bg-slate-50 rounded-md">
              <p className="text-xs text-gray-500 mb-2">已生成 {generatedCodes.length} 个 Code 码：</p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {generatedCodes.map((c) => (
                  <code key={c} className="block text-xs bg-white px-2 py-1 rounded border">{c}</code>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 text-gray-500 mb-2">{icon}<span className="text-xs">{label}</span></div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}
