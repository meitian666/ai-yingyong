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

export const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
});

export type LoginInput = z.infer<typeof loginSchema>;
