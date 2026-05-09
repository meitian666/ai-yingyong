# 邮箱验证模块实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为现有注册流程添加邮箱验证功能，用户注册后需通过邮件验证邮箱地址

**Architecture:** 在现有 `users` 表追加 3 个字段（emailVerified、verificationToken、tokenExpiresAt），注册时生成 token 发送验证邮件，新增验证 API 和前端页面处理 token 验证。邮件通过 SMTP + nodemailer 发送。

**Tech Stack:** Next.js 16 (App Router) + Drizzle ORM + SQLite + nodemailer + Zod

---

## 文件映射

### 新增文件
| 文件 | 职责 |
|------|------|
| `src/lib/email.ts` | SMTP 邮件发送封装 |
| `src/app/api/auth/verify-email/route.ts` | 验证邮箱 API 路由 |
| `src/app/verify-email/page.tsx` | 验证结果展示页面 |
| `.env` | SMTP 配置环境变量 |

### 修改文件
| 文件 | 变更 |
|------|------|
| `src/lib/schema.ts` | users 表增加 3 个字段 |
| `src/app/api/auth/register/route.ts` | 生成 token、发送邮件 |
| `src/app/register/success/page.tsx` | 改为提示查看邮箱 |
| `package.json` | 新增 nodemailer 依赖 |

### 自动生成
| 文件 | 说明 |
|------|------|
| `drizzle/0001_*.sql` | 数据库迁移文件 |

---

### Task 1: 安装 nodemailer 依赖

- [ ] **Step 1: 安装 nodemailer 和类型定义**

```bash
npm install nodemailer
npm install -D @types/nodemailer
```

- [ ] **Step 2: 验证安装成功**

Run: `node -e "require('nodemailer'); console.log('ok')"`
Expected: `ok`

- [ ] **Step 3: 提交**

```bash
git add package.json package-lock.json
git commit -m "chore: add nodemailer dependency for email verification"
```

---

### Task 2: 扩展数据库 Schema + 生成迁移

- [ ] **Step 1: 修改 `src/lib/schema.ts`，添加 3 个字段**

在 `updatedAt` 字段之后添加：

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  emailVerified: integer('email_verified').notNull().default(0),
  verificationToken: text('verification_token'),
  tokenExpiresAt: text('token_expires_at'),
});
```

注意：`integer` 需要从 `drizzle-orm/sqlite-core` 导入。

- [ ] **Step 2: 生成迁移文件**

```bash
npx drizzle-kit generate
```

Expected: 在 `drizzle/` 目录下生成类似 `0001_some_name.sql` 的文件，包含 `ALTER TABLE` 语句。

- [ ] **Step 3: 验证迁移 SQL 内容**

```bash
cat drizzle/0001_*.sql
```

应包含三条 `ALTER TABLE users ADD COLUMN` 语句（email_verified, verification_token, token_expires_at）。

- [ ] **Step 4: 提交**

```bash
git add src/lib/schema.ts drizzle/
git commit -m "feat: add email verification fields to users table"
```

---

### Task 3: 创建邮件发送模块 `src/lib/email.ts`

- [ ] **Step 1: 创建文件 `src/lib/email.ts`**

```typescript
import nodemailer from 'nodemailer';

interface SendVerificationEmailParams {
  to: string;
  name: string;
  token: string;
}

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendVerificationEmail({
  to,
  name,
  token,
}: SendVerificationEmailParams): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

  const transporter = getTransporter();

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: '请验证您的邮箱地址',
    text: [
      `您好 ${name}，`,
      '',
      '请点击以下链接验证您的邮箱地址（24小时内有效）：',
      verificationUrl,
      '',
      '如果您没有注册，请忽略此邮件。',
    ].join('\n'),
    html: [
      '<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">',
      '  <h2>验证您的邮箱地址</h2>',
      `  <p>您好 ${name}，</p>`,
      '  <p>请点击下方按钮验证您的邮箱地址（24小时内有效）：</p>',
      `  <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">验证邮箱</a>`,
      '  <p style="color: #666; font-size: 14px;">如果按钮无法点击，请复制以下链接到浏览器：<br/>',
      `  ${verificationUrl}</p>`,
      '  <p style="color: #999; font-size: 12px;">如果您没有注册，请忽略此邮件。</p>',
      '</div>',
    ].join('\n'),
  });
}

export function generateVerificationToken(): string {
  return crypto.randomUUID();
}

export function getTokenExpiry(): string {
  return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
}
```

- [ ] **Step 2: 验证 TypeScript 编译**

Run: `npx tsc --noEmit src/lib/email.ts`
Expected: 无报错

- [ ] **Step 3: 提交**

```bash
git add src/lib/email.ts
git commit -m "feat: add email sending module with SMTP support"
```

---

### Task 4: 创建 `.env` 配置文件

- [ ] **Step 1: 创建 `.env`**

```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_FROM=noreply@example.com
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

- [ ] **Step 2: 确认 `.gitignore` 中包含 `.env`**

```bash
cat .gitignore | grep -q '\.env'
```

如果 `.gitignore` 不存在或没有 `.env` 条目，先确认 Next.js 默认模板已包含它。Next.js 16 默认在 `.gitignore` 中包含 `.env`。

- [ ] **Step 3: 提交**

```bash
git add .env
git commit -m "chore: add SMTP configuration template"
```

---

### Task 5: 创建验证 API 路由

- [ ] **Step 1: 创建 `src/app/api/auth/verify-email/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: '验证令牌缺失' }, { status: 400 });
    }

    const db = await getDb();

    const user = await db
      .select()
      .from(users)
      .where(eq(users.verificationToken, token))
      .get();

    if (!user) {
      return NextResponse.json({ error: '验证链接无效或已过期' }, { status: 404 });
    }

    if (user.tokenExpiresAt && new Date(user.tokenExpiresAt) < new Date()) {
      return NextResponse.json({ error: '验证链接已过期' }, { status: 404 });
    }

    await db
      .update(users)
      .set({
        emailVerified: 1,
        verificationToken: null,
        tokenExpiresAt: null,
      })
      .where(eq(users.id, user.id));
    saveDb();

    return NextResponse.json({ message: '邮箱验证成功' });
  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
```

- [ ] **Step 2: 验证编译**

Run: `npm run build`
Expected: 编译通过

- [ ] **Step 3: 提交**

```bash
git add src/app/api/auth/verify-email/route.ts
git commit -m "feat: add email verification API endpoint"
```

---

### Task 6: 修改注册 API 路由

- [ ] **Step 1: 修改 `src/app/api/auth/register/route.ts`**

导入新增的模块：
```typescript
import { sendVerificationEmail, generateVerificationToken, getTokenExpiry } from '@/lib/email';
```

修改用户创建部分，在 `hashPassword` 调用之后生成 token 和过期时间：

```typescript
const hashedPassword = await hashPassword(password);
const verificationToken = generateVerificationToken();
const tokenExpiresAt = getTokenExpiry();
const now = nowISO();
const user = {
  id: generateId(),
  email,
  password: hashedPassword,
  name,
  createdAt: now,
  updatedAt: now,
  emailVerified: 0,
  verificationToken,
  tokenExpiresAt,
};

await db.insert(users).values(user);
saveDb();

// 非阻塞发送验证邮件
sendVerificationEmail({ to: email, name, token: verificationToken }).catch(
  (err) => console.error('Failed to send verification email:', err)
);

const { password: _, ...userWithoutPassword } = user;
return NextResponse.json(
  { ...userWithoutPassword, emailVerified: false },
  { status: 201 }
);
```

注意：`sendVerificationEmail` 不 await，即使邮件发送失败也不影响注册成功响应。

- [ ] **Step 2: 验证编译**

Run: `npm run build`
Expected: 编译通过

- [ ] **Step 3: 测试注册流程**

Run: `npm test`
Expected: 11 tests passed (原有测试不受影响)

- [ ] **Step 4: 提交**

```bash
git add src/app/api/auth/register/route.ts
git commit -m "feat: generate verification token on registration"
```

---

### Task 7: 修改注册成功页面

- [ ] **Step 1: 修改 `src/app/register/success/page.tsx`**

```tsx
import Link from 'next/link';

export default function RegisterSuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md text-center">
        <div className="text-green-500 text-5xl mb-4">✓</div>
        <h1 className="text-2xl font-bold mb-4">注册成功</h1>
        <p className="text-gray-600 mb-6">
          一封验证邮件已发送至您的邮箱，请查收并点击验证链接完成验证。
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

- [ ] **Step 2: 验证编译**

Run: `npm run build`
Expected: 编译通过

- [ ] **Step 3: 提交**

```bash
git add src/app/register/success/page.tsx
git commit -m "feat: update registration success page to prompt email verification"
```

---

### Task 8: 创建验证邮箱前端页面

- [ ] **Step 1: 创建目录并添加页面 `src/app/verify-email/page.tsx`**

```tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type VerifyStatus = 'verifying' | 'success' | 'error';

export default function VerifyEmailPage() {
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
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md text-center">
        {status === 'verifying' && (
          <>
            <div className="animate-spin text-blue-500 text-5xl mb-4">⟳</div>
            <h1 className="text-2xl font-bold mb-4">验证中...</h1>
            <p className="text-gray-600">正在验证您的邮箱地址</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h1 className="text-2xl font-bold mb-4">邮箱已验证</h1>
            <p className="text-gray-600 mb-6">{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-red-500 text-5xl mb-4">✕</div>
            <h1 className="text-2xl font-bold mb-4">验证失败</h1>
            <p className="text-gray-600 mb-6">{message}</p>
          </>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: 验证编译**

Run: `npm run build`
Expected: 编译通过

- [ ] **Step 3: 提交**

```bash
git add src/app/verify-email/page.tsx
git commit -m "feat: add email verification result page"
```

---

### Task 9: 编写测试

- [ ] **Step 1: 在 `src/__tests__/auth.test.ts` 中增加 email 模块测试**

添加 import 和测试用例：

```typescript
import { generateVerificationToken, getTokenExpiry } from '@/lib/email';

// 在现有 describe 块内/外添加
describe('email verification utils', () => {
  it('generateVerificationToken 应返回 UUID 格式字符串', () => {
    const token = generateVerificationToken();
    expect(token).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });

  it('getTokenExpiry 应返回 24 小时后的 ISO 时间', () => {
    const before = Date.now();
    const expiry = getTokenExpiry();
    const expiryTime = new Date(expiry).getTime();
    const after = Date.now();

    // 应该在 23.9 ~ 24.1 小时之间
    expect(expiryTime - before).toBeGreaterThan(23.5 * 60 * 60 * 1000);
    expect(expiryTime - after).toBeLessThan(24.5 * 60 * 60 * 1000);
  });
});
```

- [ ] **Step 2: 运行测试确认通过**

Run: `npm test`
Expected: 15 tests passed（原有 11 + 新增 4）

- [ ] **Step 3: 提交**

```bash
git add src/__tests__/auth.test.ts
git commit -m "test: add token generation and expiry tests"
```

---

### Task 10: 全量验证收尾

- [ ] **Step 1: 运行全部测试**

Run: `npm test`
Expected: 所有测试通过

- [ ] **Step 2: 运行构建**

Run: `npm run build`
Expected: 编译成功

- [ ] **Step 3: 最终提交**

```bash
git add -A
git commit -m "chore: finalize email verification implementation"
```
