'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@/lib/validators';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterInput) {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push('/register/success');
        return;
      }

      const err = await res.json();
      setServerError(err.error || '注册失败，请重试');
    } catch {
      setServerError('网络错误，请检查网络连接');
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 bg-gray-50/50 focus:bg-white placeholder:text-gray-400';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';
  const errorClass = 'text-rose-500 text-xs mt-1';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label htmlFor="name" className={labelClass}>
          姓名
        </label>
        <input
          id="name"
          {...register('name')}
          className={inputClass}
          placeholder="请输入姓名"
        />
        {errors.name && <p className={errorClass}>{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          邮箱
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className={inputClass}
          placeholder="请输入邮箱"
        />
        {errors.email && <p className={errorClass}>{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className={labelClass}>
          密码
        </label>
        <input
          id="password"
          type="password"
          {...register('password')}
          className={inputClass}
          placeholder="至少 8 位密码"
        />
        {errors.password && <p className={errorClass}>{errors.password.message}</p>}
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
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⟳</span>
            注册中...
          </span>
        ) : (
          '创建账号'
        )}
      </button>

      <p className="text-center text-xs text-gray-400">
        点击创建账号即表示同意我们的服务条款
      </p>
    </form>
  );
}
