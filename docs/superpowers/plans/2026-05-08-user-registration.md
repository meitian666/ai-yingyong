# 用户注册模块实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现用户注册模块，包含注册页面和后端 API

**Architecture:** Next.js App Router 单体应用，Drizzle ORM + SQLite，前后端共用 Zod 校验

**Tech Stack:** Next.js 14+ (App Router), Drizzle ORM, SQLite (better-sqlite3), bcrypt, Zod, React Hook Form

---

### Task 1: 初始化 Next.js 项目

**Files:**

- Create: `c:\Users\Administrator\Desktop\ai` 目录下初始化

- [ ] **Step 1: 创建 Next.js 项目**

```bash
cd /c/Users/Administrator/Desktop/ai
npx create-next-app@latest . --typescript --app --src-dir --tailwind --eslint --import-alias "@/*" --use-npm --no-git
```

Expected: Next.js 项目创建成功，npm 依赖安装完成

- [ ] **Step 2: 安装项目依赖**

```bash
cd /c/Users/Administrator/Desktop/ai
npm install drizzle-orm better-sqlite3 bcryptjs zod react-hook-form @hookform/resolvers
npm install -D drizzle-kit @types/better-sqlite3 @types/bcryptjs
```

Expected: 所有依赖安装成功

- [ ] **Step 3: 创建目录结构**

```bash
mkdir -p src/lib src/components src/types
```

Expected: `src/lib`, `src/components`, `src/types` 目录创建完成

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "chore: 初始化 Next.js 项目并安装依赖"
```

---

### Task 2: 配置 Drizzle ORM + SQLite

**Files:**

- Create: `drizzle.config.ts`
- Create: `src/lib/db.ts`
- Create: `src/lib/schema.ts`
- Modify: `package.json` (添加 db 脚本)

- [ ] **Step 1: 创建 Drizzle 配置文件**

```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: './sqlite.db',
  },
} satisfies Config;
```

- [ ] **Step 2: 创建数据库 schema**

```typescript
// src/lib/schema.ts
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});
```

- [ ] **Step 3: 创建数据库连接**（使用 sql.js，因为 better-sqlite3 需要原生编译）

```typescript
// src/lib/db.ts
import initSqlJs, { type Database as SqlJsDatabase } from 'sql.js';
import { drizzle } from 'drizzle-orm/sql-js';
import * as schema from './schema';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const DB_PATH = 'sqlite.db';

let database: SqlJsDatabase;

async function initDb() {
  const SQL = await initSqlJs();
  if (existsSync(DB_PATH)) {
    const buffer = readFileSync(DB_PATH);
    database = new SQL.Database(buffer);
  } else {
    database = new SQL.Database();
  }
}

export function saveDb() {
  writeFileSync(DB_PATH, database.export());
}

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db) {
    await initDb();
    _db = drizzle(database, { schema });
  }
  return _db;
}
```

- [ ] **Step 4: 添加 db 脚本到 package.json**

找到 `package.json` 中的 `"scripts"` 字段，添加：

```json
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit push"
```

- [ ] **Step 5: 生成并应用数据库迁移**

```bash
cd /c/Users/Administrator/Desktop/ai
npx drizzle-kit generate
npx drizzle-kit push
```

Expected: `drizzle/` 目录生成迁移文件，SQLite 数据库创建成功

- [ ] **Step 6: 提交**

```bash
git add drizzle.config.ts src/lib/db.ts src/lib/schema.ts drizzle/ package.json
git commit -m "feat: 配置 Drizzle ORM 和 SQLite 数据库"
```

---

### Task 3: 实现 Zod 校验规则

**Files:**

- Create: `src/lib/validators.ts`

- [ ] **Step 1: 创建校验 schema**

```typescript
// src/lib/validators.ts
import { z } from 'zod';

export const registerSchema = z.object({
  email: z
    .string()
    .email('请输入有效的邮箱地址')
    .max(255, '邮箱地址不能超过 255 个字符'),
  password: z
    .string()
    .min(8, '密码至少需要 8 个字符'),
  name: z
    .string()
    .min(1, '请输入姓名')
    .max(50, '姓名不能超过 50 个字符'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
```

- [ ] **Step 2: 提交**

```bash
git add src/lib/validators.ts
git commit -m "feat: 添加注册表单 Zod 校验规则"
```

---

### Task 4: 实现密码工具函数

**Files:**

- Create: `src/lib/auth.ts`

- [ ] **Step 1: 创建密码工具函数**

```typescript
// src/lib/auth.ts
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function nowISO(): string {
  return new Date().toISOString();
}
```

- [ ] **Step 2: 提交**

```bash
git add src/lib/auth.ts
git commit -m "feat: 添加密码加密和工具函数"
```

---

### Task 5: 实现注册 API

**Files:**

- Create: `src/app/api/auth/register/route.ts`

- [ ] **Step 1: 创建注册 API 路由**

```typescript
// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { users } from '@/lib/schema';
import { registerSchema } from '@/lib/validators';
import { hashPassword, generateId, nowISO } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 校验输入
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      const details = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return NextResponse.json({ error: '输入校验失败', details }, { status: 400 });
    }

    const { email, password, name } = result.data;

    const db = await getDb();

    // 查重复邮箱
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .get();

    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 409 }
      );
    }

    // 创建用户
    const hashedPassword = await hashPassword(password);
    const now = nowISO();
    const user = {
      id: generateId(),
      email,
      password: hashedPassword,
      name,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(users).values(user);
    saveDb();

    // 返回不含密码的用户数据
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add src/app/api/auth/register/route.ts
git commit -m "feat: 实现注册 API 接口"
```

---

### Task 6: 实现频率限制

**Files:**

- Create: `src/lib/rate-limit.ts`
- Modify: `src/app/api/auth/register/route.ts`

- [ ] **Step 1: 创建限流工具**

```typescript
// src/lib/rate-limit.ts
const rateMap = new Map<string, { count: number; resetAt: number }>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1 小时

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: MAX_ATTEMPTS - entry.count };
}
```

- [ ] **Step 2: 将限流集成到注册 API**

在 `src/app/api/auth/register/route.ts` 开头添加限流检查。在 `try` 块的第一行插入：

```typescript
    // 频率限制
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    const { allowed, remaining } = checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: '请求过于频繁，请稍后再试' },
        { status: 429 }
      );
    }
```

并更新 import 添加 `checkRateLimit`:

```typescript
import { checkRateLimit } from '@/lib/rate-limit';
```

- [ ] **Step 3: 提交**

```bash
git add src/lib/rate-limit.ts src/app/api/auth/register/route.ts
git commit -m "feat: 实现注册频率限制"
```

---

### Task 7: 编写测试

**Files:**

- Create: `src/__tests__/validators.test.ts`
- Create: `src/__tests__/auth.test.ts`

- [ ] **Step 1: 创建校验器测试**

```typescript
// src/__tests__/validators.test.ts
import { registerSchema } from '@/lib/validators';

describe('registerSchema', () => {
  it('应通过有效输入', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
      name: '张三',
    });
    expect(result.success).toBe(true);
  });

  it('应拒绝无效邮箱', () => {
    const result = registerSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
      name: '张三',
    });
    expect(result.success).toBe(false);
  });

  it('应拒绝短密码', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: '1234567',
      name: '张三',
    });
    expect(result.success).toBe(false);
  });

  it('应拒绝空姓名', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
      name: '',
    });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: 创建密码工具测试**

```typescript
// src/__tests__/auth.test.ts
import { hashPassword, verifyPassword, generateId, nowISO } from '@/lib/auth';

describe('auth utils', () => {
  it('hashPassword 和 verifyPassword 应正常工作', async () => {
    const password = 'testPassword123';
    const hash = await hashPassword(password);
    expect(hash).not.toBe(password);

    const valid = await verifyPassword(password, hash);
    expect(valid).toBe(true);

    const invalid = await verifyPassword('wrong', hash);
    expect(invalid).toBe(false);
  });

  it('generateId 应返回 UUID 格式字符串', () => {
    const id = generateId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });

  it('nowISO 应返回 ISO 格式日期', () => {
    const now = nowISO();
    expect(() => new Date(now)).not.toThrow();
  });
});
```

- [ ] **Step 3: 运行测试验证通过**

```bash
cd /c/Users/Administrator/Desktop/ai
npx jest src/__tests__/validators.test.ts src/__tests__/auth.test.ts --verbose
```

Expected: 所有测试通过

- [ ] **Step 4: 提交**

```bash
git add src/__tests__/
git commit -m "test: 添加校验器和密码工具单元测试"
```

---

### Task 8: 实现注册页面

**Files:**

- Create: `src/components/RegisterForm.tsx`
- Create: `src/app/register/page.tsx`
- Create: `src/app/register/success/page.tsx`

- [ ] **Step 1: 创建注册表单组件**

```tsx
// src/components/RegisterForm.tsx
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          姓名
        </label>
        <input
          id="name"
          {...register('name')}
          className="w-full border rounded px-3 py-2"
          placeholder="请输入姓名"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

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
          placeholder="请输入密码（至少 8 位）"
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
        {isSubmitting ? '注册中...' : '注册'}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: 创建注册页面**

```tsx
// src/app/register/page.tsx
import RegisterForm from '@/components/RegisterForm';

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">用户注册</h1>
        <RegisterForm />
      </div>
    </main>
  );
}
```

- [ ] **Step 3: 创建注册成功页面**

```tsx
// src/app/register/success/page.tsx
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
```

- [ ] **Step 4: 提交**

```bash
git add src/components/RegisterForm.tsx src/app/register/page.tsx src/app/register/success/page.tsx
git commit -m "feat: 实现注册页面和表单组件"
```

---

### Task 9: 验证功能

- [ ] **Step 1: 启动开发服务器**

```bash
cd /c/Users/Administrator/Desktop/ai
npm run dev
```

Expected: 开发服务器启动成功

- [ ] **Step 2: 访问注册页面**

打开浏览器访问 `http://localhost:3000/register`

Expected: 注册表单正常显示

- [ ] **Step 3: 测试注册流程**

在表单中填写姓名、邮箱和密码，提交。

Expected: 注册成功后跳转到成功页面

- [ ] **Step 4: 测试重复邮箱**

使用相同的邮箱再次注册。Expected: 返回错误提示"该邮箱已被注册"

- [ ] **Step 5: 测试校验**

提交空表单或无效邮箱。

Expected: 表单显示对应的校验错误信息
