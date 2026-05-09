'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import SummerBackground from '@/components/SummerBackground';

type VerifyStatus = 'verifying' | 'success' | 'error';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<VerifyStatus>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('验证链接无效：缺少令牌');
      return;
    }

    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.error || '验证失败，请重试');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('网络错误，请稍后重试');
      });
  }, [searchParams]);

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center">
      {status === 'verifying' && (
        <>
          <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="animate-spin text-white text-3xl">⟳</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">验证中...</h1>
          <p className="text-gray-500 text-sm">正在验证您的邮箱地址</p>
        </>
      )}
      {status === 'success' && (
        <>
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200">
            <span className="text-white text-3xl">✓</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">邮箱已验证</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">{message}</p>
          <Link
            href="/"
            className="inline-block w-full bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-xl py-3 px-4 text-sm font-medium transition-all duration-200 hover:from-sky-500 hover:to-blue-600 hover:shadow-lg hover:shadow-sky-200"
          >
            前往登录
          </Link>
        </>
      )}
      {status === 'error' && (
        <>
          <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-200">
            <span className="text-white text-3xl">✕</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">验证失败</h1>
          <p className="text-gray-500 text-sm leading-relaxed">{message}</p>
        </>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="animate-spin text-white text-3xl">⟳</span>
      </div>
      <h1 className="text-xl font-bold text-gray-800 mb-2">加载中...</h1>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <SummerBackground>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">meitian 的邮箱</h1>
        </div>
        <Suspense fallback={<LoadingFallback />}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </SummerBackground>
  );
}
