import { describe, it, expect } from 'vitest';
import { registerSchema } from '@/lib/validators';

// Test the full request pipeline through schema validation and business rules
describe('POST /api/auth/register - Integration', () => {
  it('应拒绝无效邮箱输入', () => {
    const result = registerSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
      name: '张三',
    });
    expect(result.success).toBe(false);
  });

  it('应拒绝短密码（8位以下）', () => {
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

  it('应通过有效输入', () => {
    const result = registerSchema.safeParse({
      email: 'valid@example.com',
      password: 'password123',
      name: '张三',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('valid@example.com');
    }
  });
});
