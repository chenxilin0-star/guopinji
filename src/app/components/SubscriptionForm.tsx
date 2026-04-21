'use client';

import { useState } from 'react';
import { Bell, Plus, Trash2 } from 'lucide-react';

interface Subscription {
  id: number;
  keyword?: string;
  industry?: string;
  province?: string;
  city?: string;
  company_type?: string;
  education?: string;
  job_type?: string;
  is_active: number;
}

interface SubscriptionFormProps {
  token: string;
  subscriptions: Subscription[];
  onChange: () => void;
}

const PROVINCES = ['', '北京', '上海', '广东', '江苏', '浙江', '山东', '四川', '湖北', '湖南'];
const INDUSTRIES = ['', '能源', '电力', '通信', '金融', '交通', '建筑', '制造', '科技', '文化', '医药'];
const COMPANY_TYPES = ['', '央企', '省属国企', '市属国企', '区县国企', '国有控股'];
const EDUCATIONS = ['', '大专', '本科', '硕士', '博士', '不限'];
const JOB_TYPES = ['', '校招', '社招', '实习'];

export default function SubscriptionForm({ token, subscriptions, onChange }: SubscriptionFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    keyword: '',
    industry: '',
    province: '',
    city: '',
    company_type: '',
    education: '',
    job_type: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ keyword: '', industry: '', province: '', city: '', company_type: '', education: '', job_type: '' });
      setShowForm(false);
      onChange();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定取消这条订阅吗？')) return;
    const res = await fetch(`/api/v1/subscriptions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) onChange();
  };

  const formatSub = (sub: Subscription) => {
    const parts: string[] = [];
    if (sub.keyword) parts.push(`关键词：${sub.keyword}`);
    if (sub.industry) parts.push(sub.industry);
    if (sub.province) parts.push(sub.province);
    if (sub.company_type) parts.push(sub.company_type);
    if (sub.education) parts.push(sub.education);
    if (sub.job_type) parts.push(sub.job_type);
    return parts.join(' · ') || '全部职位';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell size={20} className="text-blue-600" />
          <h3 className="font-semibold text-gray-800">我的订阅条件</h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus size={16} />
          {showForm ? '取消' : '新增订阅'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-50 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input type="text" placeholder="关键词（可选）" value={form.keyword} onChange={(e) => setForm({ ...form, keyword: e.target.value })} className="px-3 py-2 border rounded-md text-sm" />
          <Select label="行业" value={form.industry} options={INDUSTRIES} onChange={(v) => setForm({ ...form, industry: v })} />
          <Select label="省份" value={form.province} options={PROVINCES} onChange={(v) => setForm({ ...form, province: v })} />
          <Select label="企业性质" value={form.company_type} options={COMPANY_TYPES} onChange={(v) => setForm({ ...form, company_type: v })} />
          <Select label="学历" value={form.education} options={EDUCATIONS} onChange={(v) => setForm({ ...form, education: v })} />
          <Select label="岗位类型" value={form.job_type} options={JOB_TYPES} onChange={(v) => setForm({ ...form, job_type: v })} />
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">取消</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md">保存订阅</button>
          </div>
        </form>
      )}

      {subscriptions.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">暂无订阅条件，点击上方新增</p>
      ) : (
        <div className="space-y-2">
          {subscriptions.map((sub) => (
            <div key={sub.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
              <span className="text-sm text-gray-700">{formatSub(sub)}</span>
              <button onClick={() => handleDelete(sub.id)} className="text-gray-400 hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="px-3 py-2 border rounded-md text-sm">
      <option value="">{label}（全部）</option>
      {options.filter(Boolean).map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}
