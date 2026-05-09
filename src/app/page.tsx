'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/lib/validators';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SummerBackground from '@/components/SummerBackground';

export default function Home() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push('/dashboard');
        return;
      }

      const err = await res.json();
      setServerError(err.error || '登录失败，请重试');
    } catch {
      setServerError('网络错误，请检查网络连接');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SummerBackground>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">meitian 的邮箱</h1>
          <p className="text-white/80 text-sm mt-2 drop-shadow">登录您的账号</p>
        </div>
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                邮箱
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 bg-gray-50/50 focus:bg-white placeholder:text-gray-400"
                placeholder="请输入邮箱"
              />
              {errors.email && (
                <p className="text-rose-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                密码
              </label>
              <input
                id="password"
                type="password"
                {...register('password')}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 bg-gray-50/50 focus:bg-white placeholder:text-gray-400"
                placeholder="请输入密码"
              />
              {errors.password && (
                <p className="text-rose-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {serverError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 rounded-xl px-4 py-3 text-sm">
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-xl py-3 px-4 text-sm font-medium transition-all duration-200 hover:from-sky-500 hover:to-blue-600 hover:shadow-lg hover:shadow-sky-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100"
            >
              {isSubmitting ? '登录中...' : '登录'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-400">
            还没有账号？{' '}
            <Link href="/register" className="text-sky-500 hover:text-sky-600 font-medium">
              立即注册
            </Link>
          </p>
        </div>
      </div>
    </SummerBackground>
  );
}
