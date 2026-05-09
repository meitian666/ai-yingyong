# Login Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add login page, JWT-based auth, route protection, and a static dashboard.

**Architecture:** Next.js App Router with jose JWT in HttpOnly cookies. Middleware protects `/dashboard`. Login API verifies credentials against the existing users table.

**Tech Stack:** Next.js 16.2, Drizzle ORM, SQLite, jose, bcryptjs, Zod, React Hook Form

---

### Task 1: Install dependency and configure env

**Files:**
- Modify: `package.json`
- Create: `.env`

- [ ] **Step 1: Install jose**

Run: `npm install jose`

- [ ] **Step 2: Create .env with JWT_SECRET**

```bash
cat > .env << 'ENVEOF'
JWT_SECRET=login-module-dev-secret-do-not-use-in-production
ENVEOF
```

---

### Task 2: Add JWT functions to auth lib

**Files:**
- Modify: `src/lib/auth.ts`

- [ ] **Step 1: Add JWT sign/verify/verifyAndGetUser functions**

```typescript
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-dev-only'
);

const COOKIE_NAME = 'session';
const EXPIRES_IN = '7d';

export interface JwtPayload {
  userId: string;
  email: string;
  name: string;
}

export async function signJwt(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(JWT_SECRET);
}

export async function verifyJwt(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return payload as unknown as JwtPayload;
}

export { COOKIE_NAME };
```

---

### Task 3: Add login Zod schema

**Files:**
- Modify: `src/lib/validators.ts`

- [ ] **Step 1: Add loginSchema**

Add after existing `registerSchema`:

```typescript
export const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

---

### Task 4: Create login API route

**Files:**
- Create: `src/app/api/auth/login/route.ts`

- [ ] **Step 1: Create login API**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { loginSchema } from '@/lib/validators';
import { verifyPassword } from '@/lib/auth';
import { signJwt, COOKIE_NAME } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { users } from '@/lib/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '输入校验失败', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const db = await getDb();
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    const token = await signJwt({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.json({
      message: '登录成功',
      user: { id: user.id, email: user.email, name: user.name },
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
```

---

### Task 5: Create logout API route

**Files:**
- Create: `src/app/api/auth/logout/route.ts`

- [ ] **Step 1: Create logout API**

```typescript
import { NextResponse } from 'next/server';
import { COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ message: '已退出登录' });
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
```

---

### Task 6: Create login page

**Files:**
- Modify: `src/app/page.tsx` (update homepage with login/register links)
- Create: `src/app/login/page.tsx`

- [ ] **Step 1: Update homepage with navigation links**

```typescript
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black gap-8">
        <h1 className="text-4xl font-bold">欢迎</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-lg">
          请登录或注册以继续
        </p>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="inline-flex h-12 w-32 items-center justify-center rounded-full bg-foreground text-background hover:opacity-90"
          >
            登录
          </Link>
          <Link
            href="/register"
            className="inline-flex h-12 w-32 items-center justify-center rounded-full border border-solid border-black/[.08] hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
          >
            注册
          </Link>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Create login page**

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/lib/validators';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
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
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">用户登录</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              邮箱
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="w-full border rounded px-3 py-2"
              placeholder="请输入邮箱"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              密码
            </label>
            <input
              id="password"
              type="password"
              {...register('password')}
              className="w-full border rounded px-3 py-2"
              placeholder="请输入密码"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 text-sm">
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white rounded py-2 px-4 hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? '登录中...' : '登录'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-zinc-500">
          还没有账号？{' '}
          <Link href="/register" className="text-blue-600 hover:underline">
            立即注册
          </Link>
        </p>
      </div>
    </main>
  );
}
```

---

### Task 7: Create dashboard page

**Files:**
- Create: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Create dashboard page**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
```

---

### Task 8: Create /api/auth/me route and middleware

**Files:**
- Create: `src/app/api/auth/me/route.ts`
- Create: `src/middleware.ts`

- [ ] **Step 1: Create /api/auth/me route**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt, COOKIE_NAME } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  try {
    const payload = await verifyJwt(token);
    return NextResponse.json({
      user: {
        id: payload.userId,
        email: payload.email,
        name: payload.name,
      },
    });
  } catch {
    return NextResponse.json({ error: '登录已过期' }, { status: 401 });
  }
}
```

- [ ] **Step 2: Create middleware**

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwt, COOKIE_NAME } from '@/lib/auth';

const protectedPaths = ['/dashboard'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!protectedPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await verifyJwt(token);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

---

### Task 9: Run dev server and verify

- [ ] **Step 1:** Run `npm run dev`
- [ ] **Step 2:** Open browser and verify:
  - Homepage shows login/register links
  - /login page works, login with registered user succeeds
  - /dashboard shows after login with user info
  - Logout works and redirects to /login
  - Direct access to /dashboard without login redirects to /login
