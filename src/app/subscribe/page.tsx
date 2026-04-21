'use client';

import { useState, useEffect } from 'react';
import { Clock, Shield, Zap } from 'lucide-react';
import Header from '../components/Header';
import CodeRedeem from '../components/CodeRedeem';

const PLANS = [
  { id: 1, name: '7天体验版', days: 7, price: 6.9, icon: <Clock size={20} />, desc: '短期求职，快速体验' },
  { id: 2, name: '15天标准版', days: 15, price: 9.9, icon: <Zap size={20} />, desc: '常规求职周期，性价比之选', popular: true },
  { id: 3, name: '30天尊享版', days: 30, price: 16.9, icon: <Shield size={20} />, desc: '长期关注，最大优惠' },
];

export default function SubscribePage() {
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    const t = localStorage.getItem('token') || '';
    setToken(t);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">获取订阅</h1>
          <p className="text-gray-500">解锁无限搜索、职位收藏和每日推送服务</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-xl border p-6 text-center transition-all hover:shadow-lg ${
                plan.popular ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 bg-white'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                  最受欢迎
                </span>
              )}
              <div className="flex justify-center mb-4 text-blue-600">{plan.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{plan.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{plan.desc}</p>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                <span className="text-lg">¥</span>{plan.price}
              </div>
              <p className="text-xs text-gray-400 mb-6">有效期 {plan.days} 天</p>
              <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                获取 Code 码
              </button>
            </div>
          ))}
        </div>

        {token && (
          <div className="max-w-md mx-auto">
            <CodeRedeem token={token} />
          </div>
        )}

        <div className="mt-12 max-w-2xl mx-auto text-sm text-gray-500 space-y-2">
          <p>• Code 码可通过公众号、社群或第三方平台购买</p>
          <p>• 兑换后立即生效，有效期内享受全部订阅权益</p>
          <p>• 每个 Code 码仅限使用一次，不可退换</p>
        </div>
      </main>
    </div>
  );
}
