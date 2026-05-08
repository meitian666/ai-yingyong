import Link from 'next/link';

export default function RegisterSuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md text-center">
        <div className="text-green-500 text-5xl mb-4">✓</div>
        <h1 className="text-2xl font-bold mb-4">注册成功</h1>
        <p className="text-gray-600 mb-6">
          您的账号已创建成功，现在可以登录了。
        </p>
        <Link
          href="/register"
          className="inline-block bg-blue-600 text-white rounded py-2 px-4 hover:bg-blue-700"
        >
          返回注册
        </Link>
      </div>
    </main>
  );
}
