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

    if (!user.emailVerified) {
      return NextResponse.json(
        { error: '请先验证邮箱后再登录' },
        { status: 403 }
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
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
