'use client';

import { useState } from 'react';
import { Gift, CheckCircle, AlertCircle } from 'lucide-react';

interface CodeRedeemProps {
  token: string;
  onSuccess?: () => void;
}

export default function CodeRedeem({ token, onSuccess }: CodeRedeemProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/v1/codes/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ success: true, message: '兑换成功！', data: data.subscription });
        setCode('');
        onSuccess?.();
      } else {
        setResult({ success: false, message: data.error || '兑换失败' });
      }
    } catch {
      setResult({ success: false, message: '网络错误，请重试' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Gift size={20} className="text-amber-500" />
        <h3 className="font-semibold text-gray-800">Code码兑换</h3>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="输入Code码，如 GP-7D-A3F9K2M8"
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          {loading ? '兑换中...' : '兑换'}
        </button>
      </form>

      {result && (
        <div className={`mt-4 p-3 rounded-lg flex items-start gap-2 text-sm ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {result.success ? <CheckCircle size={16} className="mt-0.5 shrink-0" /> : <AlertCircle size={16} className="mt-0.5 shrink-0" />}
          <div>
            <p>{result.message}</p>
            {result.data && (
              <p className="mt-1 text-xs text-green-600">
                有效期至：{new Date(result.data.expires_at).toLocaleDateString('zh-CN')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
