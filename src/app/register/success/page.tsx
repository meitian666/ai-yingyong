import Link from 'next/link';
import SummerBackground from '@/components/SummerBackground';

export default function RegisterSuccessPage() {
  return (
    <SummerBackground>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">meitian 的邮箱</h1>
        </div>
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200">
            <span className="text-white text-3xl">✓</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">注册成功</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            一封验证邮件已发送至您的注册邮箱，<br />
            请查收并点击验证链接完成邮箱验证。
          </p>
          <Link
            href="/"
            className="inline-block w-full bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-xl py-3 px-4 text-sm font-medium transition-all duration-200 hover:from-sky-500 hover:to-blue-600 hover:shadow-lg hover:shadow-sky-200"
          >
            返回登录
          </Link>
        </div>
      </div>
    </SummerBackground>
  );
}
