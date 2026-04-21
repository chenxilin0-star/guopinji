'use client';

import { useEffect, useState } from 'react';
import { Menu, X, User } from 'lucide-react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    setToken(localStorage.getItem('token') || '');
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const navLinks = [
    { href: '/', label: '首页' },
    { href: '/jobs', label: '职位' },
    { href: '/subscribe', label: '订阅' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <a href="/" className="text-xl font-bold text-blue-900">国聘集</a>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
              {link.label}
            </a>
          ))}
          {token ? (
            <div className="flex items-center gap-4">
              <a href="/profile" className="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-1">
                <User size={16} /> 个人中心
              </a>
              <button onClick={logout} className="text-sm text-gray-400 hover:text-red-600">退出</button>
            </div>
          ) : (
            <a href="/subscribe" className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md transition-colors">
              登录
            </a>
          )}
        </nav>

        <button className="md:hidden text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 px-4 py-3 space-y-2 bg-white">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="block text-sm text-gray-600 py-1">{link.label}</a>
          ))}
          {token ? (
            <>
              <a href="/profile" className="block text-sm text-gray-600 py-1">个人中心</a>
              <button onClick={logout} className="block text-sm text-red-600 py-1">退出</button>
            </>
          ) : (
            <a href="/subscribe" className="block text-sm text-blue-600 py-1">登录</a>
          )}
        </div>
      )}
    </header>
  );
}
