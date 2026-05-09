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
