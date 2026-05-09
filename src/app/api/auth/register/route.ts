import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { users } from '@/lib/schema';
import { registerSchema } from '@/lib/validators';
import { hashPassword, generateId, nowISO } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { sendVerificationEmail, generateVerificationToken, getTokenExpiry } from '@/lib/email';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    const { allowed } = checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: '请求过于频繁，请稍后再试' },
        { status: 429 }
      );
    }

    const body = await request.json();

    const result = registerSchema.safeParse(body);
    if (!result.success) {
      const details = result.error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return NextResponse.json({ error: '输入校验失败', details }, { status: 400 });
    }

    const { email, password, name } = result.data;

    const db = await getDb();

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
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
