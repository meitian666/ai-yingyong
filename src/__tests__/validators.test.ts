import { describe, it, expect } from 'vitest';
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
