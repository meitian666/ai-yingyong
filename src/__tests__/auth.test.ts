import { describe, it, expect } from 'vitest';
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
