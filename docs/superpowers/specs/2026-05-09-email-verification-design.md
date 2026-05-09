# 邮箱验证模块设计文档

**日期：** 2026-05-09
**技术栈：** Next.js (App Router) + Drizzle ORM + SQLite + TypeScript + SMTP (nodemailer)
**前置依赖：** 用户注册模块（2026-05-08）

## 一、背景

现有的注册模块（详见 2026-05-08-user-registration-design.md）在用户注册后直接创建账号，缺少邮箱验证环节。本设计为注册流程增加邮箱验证，确保用户邮箱的真实性。

## 二、数据模型变更

在现有的 `users` 表（`src/lib/schema.ts`）中增加三个字段：

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `emailVerified` | `integer` (0/1) | `0` | 是否已验证邮箱 |
| `verificationToken` | `text` (nullable) | `null` | UUID 验证令牌，验证后清空 |
| `tokenExpiresAt` | `text` (nullable) | `null` | ISO 时间戳，24 小时有效期 |

不新建表，保持 schema 简单。

## 三、完整流程

```
用户填写注册表单
        │
        ▼
POST /api/auth/register
        │
        ├─ 校验输入（Zod schema）
        ├─ 检查频率限制
        ├─ 检查邮箱是否已注册
        ├─ 写入 users 表（emailVerified = false）
        ├─ 生成 verificationToken + 24h 过期时间
        ├─ 发送验证邮件（nodemailer SMTP）
        │
        ▼
注册成功页（"请查收验证邮件"）
        │
        │  用户点击邮件中的链接
        ▼
/verify-email?token=xxx （前端页面）
        │
        ▼
POST /api/auth/verify-email { token }
        │
        ├─ 查找匹配 token 且未过期的用户
        ├─ 设置 emailVerified = true
        ├─ 清空 verificationToken / tokenExpiresAt
        │
        ▼
验证成功页（"邮箱已验证，可以登录了"）
```

## 四、API 接口

### 4.1 POST /api/auth/register（修改）

**新增行为：** 注册成功后创建「未验证」账号，发送验证邮件。

成功响应 (201) 增加字段：
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "张三",
  "createdAt": "...",
  "emailVerified": false
}
```

错误响应不变（400、409、429）。

### 4.2 POST /api/auth/verify-email（新增）

**请求体：**
```json
{
  "token": "uuid-string"
}
```

**成功响应 (200)：**
```json
{
  "message": "邮箱验证成功"
}
```

**错误响应：**
- `400 Bad Request` — 令牌缺失或格式错误
- `404 Not Found` — 令牌无效或已过期（统一返回 404 不暴露具体原因）

## 五、新增文件

### 5.1 `src/lib/email.ts` — 邮件发送模块

职责：通过 SMTP 发送验证邮件。使用 `nodemailer`。

```typescript
// 对外接口
interface SendVerificationEmailParams {
  to: string;
  name: string;
  token: string;
}

async function sendVerificationEmail(params: SendVerificationEmailParams): Promise<void>
```

SMTP 配置读取环境变量：`SMTP_HOST`、`SMTP_PORT`、`SMTP_USER`、`SMTP_PASS`、`SMTP_FROM`。

邮件包含纯文本和 HTML 两个版本。

### 5.2 `src/app/api/auth/verify-email/route.ts` — 验证 API

处理 POST 请求，根据 token 查找并验证用户。

### 5.3 `src/app/verify-email/page.tsx` — 验证页面

获取 URL 参数 `token`，页面加载时自动调用 `POST /api/auth/verify-email`，展示验证结果。

### 5.4 `.env` — SMTP 配置

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_FROM=noreply@example.com
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 六、修改文件

| 文件 | 变更内容 |
|------|----------|
| `src/lib/schema.ts` | `users` 表增加 `emailVerified`、`verificationToken`、`tokenExpiresAt` 字段 |
| `src/app/api/auth/register/route.ts` | 生成 token、计算过期时间、发送验证邮件 |
| `src/app/register/success/page.tsx` | 改为提示"已发送验证邮件，请检查收件箱" |

## 七、前端页面

### 7.1 `/verify-email?token=xxx` 页面（新增）

- 获取 URL 参数 `token`
- 页面加载时自动调用 `POST /api/auth/verify-email`
- 显示验证中 → 验证成功 / 验证失败
- 成功后显示"邮箱已验证"提示

### 7.2 注册成功页（修改）

文案从"注册成功，现在可以登录了"改为"注册成功！一封验证邮件已发送至您的邮箱，请查收并点击验证链接"。

## 八、安全注意事项

- 验证链接中的 token 使用 `crypto.randomUUID()` 生成，不可预测
- 24 小时过期限制
- 验证成功后立即清空 token，防止重复使用
- 验证失败时不暴露具体原因（统一 404）
- 使用环境变量管理 SMTP 凭据，不硬编码

## 九、测试策略

- **单元测试**：`email.ts` 中邮件内容生成逻辑
- **API 测试**：验证 token 有效/无效/过期场景
- **集成测试**：注册 → 获取 token（测试内部）→ 验证 → 确认 emailVerified 状态

## 十、依赖变更

新增依赖：
- `nodemailer` — SMTP 邮件发送
- `@types/nodemailer` — 类型定义
