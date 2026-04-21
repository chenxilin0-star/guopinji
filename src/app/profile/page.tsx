'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Calendar, Heart } from 'lucide-react';
import Header from '../components/Header';
import CodeRedeem from '../components/CodeRedeem';
import SubscriptionForm from '../components/SubscriptionForm';

export default function ProfilePage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) { router.push('/'); return; }
    setToken(t);
    fetch('/api/v1/auth/me', { headers: { Authorization: `Bearer ${t}` } })
      .then((r) => r.json()).then((d) => setUser(d));
    fetch('/api/v1/codes/status', { headers: { Authorization: `Bearer ${t}` } })
      .then((r) => r.json()).then((d) => setSubscription(d));
    fetch('/api/v1/subscriptions', { headers: { Authorization: `Bearer ${t}` } })
      .then((r) => r.json()).then((d) => setSubscriptions(d.data || []));
    fetch('/api/v1/jobs/favorites', { headers: { Authorization: `Bearer ${t}` } })
      .then((r) => r.json()).then((d) => setFavorites(d.data || []));
  }, [router]);

  if (!token) return null;

  const daysLeft = subscription?.expires_at
    ? Math.max(0, Math.ceil((new Date(subscription.expires_at).getTime() - Date.now()) / 86400000))
    : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <User size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{user?.nickname || user?.email || '用户'}</h1>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <StatCard icon={<Calendar size={18} />} label="订阅状态" value={subscription?.is_active ? `剩余 ${daysLeft} 天` : '未订阅'} color={subscription?.is_active ? 'green' : 'gray'} />
          <StatCard icon={<Heart size={18} />} label="收藏职位" value={`${favorites.length} 个`} color="blue" />
          <StatCard icon={<Calendar size={18} />} label="推送订阅" value={`${subscriptions.length} 条`} color="purple" />
        </div>

        {(!subscription?.is_active) && (
          <div className="mb-6">
            <CodeRedeem token={token} onSuccess={() => window.location.reload()} />
          </div>
        )}

        <div className="mb-6">
          <SubscriptionForm token={token} subscriptions={subscriptions} onChange={() => window.location.reload()} />
        </div>

        {favorites.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">我的收藏</h3>
            <div className="space-y-3">
              {favorites.map((f) => (
                <div key={f.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                  <a href={`/jobs/${f.job_id}`} className="text-sm text-blue-600 hover:underline">{f.title}</a>
                  <span className="text-xs text-gray-400">{f.company_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    green: 'bg-green-50 text-green-700',
    blue: 'bg-blue-50 text-blue-700',
    purple: 'bg-purple-50 text-purple-700',
    gray: 'bg-gray-50 text-gray-600',
  };
  return (
    <div className={`rounded-lg p-4 ${colors[color] || colors.gray}`}>
      <div className="flex items-center gap-2 mb-1 opacity-80">{icon}<span className="text-xs font-medium">{label}</span></div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}
