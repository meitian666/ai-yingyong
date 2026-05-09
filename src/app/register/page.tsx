import Link from 'next/link';
import RegisterForm from '@/components/RegisterForm';
import SummerBackground from '@/components/SummerBackground';

export default function RegisterPage() {
  return (
    <SummerBackground>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">meitian 的邮箱</h1>
        </div>
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-bold text-center mb-1 text-gray-800">创建账号</h2>
          <p className="text-gray-500 text-center mb-6 text-sm">注册您的邮箱账号</p>
          <RegisterForm />
          <p className="text-center mt-6 text-sm text-gray-400">
            已有账号？{' '}
            <Link href="/" className="text-sky-500 hover:text-sky-600 font-medium">
              返回登录
            </Link>
          </p>
        </div>
      </div>
    </SummerBackground>
  );
}
