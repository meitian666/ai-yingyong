import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { users } from '@/lib/schema';
import { registerSchema } from '@/lib/validators';
import { hashPassword, generateId, nowISO } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = registerSchema.safeParse(body);
    if (!result.success) {
      const issues = (result.error as any).issues || [];
      const details = issues.map((e: any) => ({
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
