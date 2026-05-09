import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { users } from '@/lib/schema';
import { checkRateLimit } from '@/lib/rate-limit';
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
