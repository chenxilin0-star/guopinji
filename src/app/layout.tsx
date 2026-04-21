import type { Metadata } from 'next';
import './globals.css';
import Header from './components/Header';

export const metadata: Metadata = {
  title: '国聘集 - 国企招聘信息聚合平台',
  description: '聚合国聘网、国资委、各省市人才网的权威国企招聘信息，Code码订阅制，精准推送',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <Header />
        <main className="min-h-screen">{children}</main>
        <footer className="bg-slate-800 text-slate-300 py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm">
            <p>国聘集 — 国企招聘信息聚合平台</p>
            <p className="mt-2 text-slate-400">数据来源于公开渠道，仅供求职参考</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
