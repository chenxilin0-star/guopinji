'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';

interface Filters {
  province: string;
  city: string;
  industry: string;
  company_type: string;
  education: string;
  job_type: string;
}

interface FilterPanelProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const PROVINCES = ['北京', '上海', '广东', '江苏', '浙江', '山东', '四川', '湖北', '湖南', '河南', '河北', '福建', '安徽', '陕西', '重庆'];
const INDUSTRIES = ['能源', '电力', '通信', '金融', '交通', '建筑', '制造', '科技', '文化', '医药'];
const COMPANY_TYPES = ['央企', '省属国企', '市属国企', '区县国企', '国有控股'];
const EDUCATIONS = ['大专', '本科', '硕士', '博士', '不限'];
const JOB_TYPES = ['校招', '社招', '实习'];

export default function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const update = (key: keyof Filters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const hasActive = Object.values(filters).some((v) => v !== '');

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-gray-500" />
          <span className="font-medium text-gray-700">筛选条件</span>
          {hasActive && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">已筛选</span>}
        </div>
        <button onClick={() => setExpanded(!expanded)} className="text-gray-500 hover:text-gray-700">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FilterSelect label="省份" value={filters.province} options={PROVINCES} onChange={(v) => update('province', v)} />
          <FilterSelect label="行业" value={filters.industry} options={INDUSTRIES} onChange={(v) => update('industry', v)} />
          <FilterSelect label="企业性质" value={filters.company_type} options={COMPANY_TYPES} onChange={(v) => update('company_type', v)} />
          <FilterSelect label="学历要求" value={filters.education} options={EDUCATIONS} onChange={(v) => update('education', v)} />
          <FilterSelect label="岗位类型" value={filters.job_type} options={JOB_TYPES} onChange={(v) => update('job_type', v)} />

          <div className="flex items-end">
            <button
              onClick={() => onChange({ province: '', city: '', industry: '', company_type: '', education: '', job_type: '' })}
              className="text-sm text-gray-500 hover:text-red-600 underline"
            >
              重置筛选
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">全部</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
