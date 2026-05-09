'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  name: string;
  email: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then((data) => setUser(data.user))
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>加载中...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">功能面板</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:underline"
            >
              退出登录
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-medium mb-2">欢迎，{user?.name}</h2>
          <p className="text-zinc-500 text-sm">{user?.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-medium mb-2">功能一</h3>
            <p className="text-sm text-zinc-500">功能开发中...</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-medium mb-2">功能二</h3>
            <p className="text-sm text-zinc-500">功能开发中...</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-medium mb-2">功能三</h3>
            <p className="text-sm text-zinc-500">功能开发中...</p>
          </div>
        </div>
      </div>
    </main>
  );
}
