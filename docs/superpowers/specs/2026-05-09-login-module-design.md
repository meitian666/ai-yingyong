# 登录模块设计文档

**日期：** 2026-05-09
**技术栈：** Next.js (App Router) + Drizzle ORM + SQLite + TypeScript + jose (JWT)
**前置依赖：** 用户注册模块（2026-05-08）

## 一、整体架构

```
/src
├── app/
│   ├── login/page.tsx              # 登录页面（新增）
│   ├── dashboard/page.tsx          # 登录后静态面板（新增）
│   ├── api/auth/login/route.ts     # 登录 API（新增）
│   ├── api/auth/logout/route.ts    # 退出 API（新增）
│   └── middleware.ts               # JWT 路由保护中间件（新增）
├── lib/
│   └── auth.ts                     # 增加 JWT 签发/验证函数
```

## 二、数据模型

沿用现有的 `users` 表，无需新增字段。

## 三、API 接口

### POST /api/auth/login

**请求体：**
```json
{
  "email": "user@example.com",
  "password": "securePass123"
}
```

**成功响应 (200)：**
```json
{
  "message": "登录成功",
  "user": { "id": "uuid", "email": "user@example.com", "name": "张三" }
}
```
同时设置 HttpOnly Cookie（JWT）。

**错误响应：**
- `400 Bad Request` — 输入校验失败
- `401 Unauthorized` — 邮箱或密码错误（统一提示，不暴露具体）
- `403 Forbidden` — 邮箱未验证（预留，当前 schema 尚无此字段）

### POST /api/auth/logout

**成功响应 (200)：** 清除 JWT Cookie。

## 四、JWT & Cookie 策略

- **库：** `jose`（兼容 Edge Runtime）
- **密钥：** 环境变量 `JWT_SECRET`
- **载荷：** `{ userId, email, name, iat, exp }`
- **过期时间：** 7 天
- **Cookie 配置：** HttpOnly、SameSite=Lax，路径 `/`

## 五、路由保护

Next.js `middleware.ts` 拦截 `/dashboard` 路径：
- 读取 JWT Cookie
- 验证签名和有效期
- 无效/过期 → 重定向到 `/login`
- 有效 → 放行，并在 request header 中注入用户信息

## 六、前端页面

### `/login` 页面
- 邮箱 + 密码表单（使用 React Hook Form + Zod）
- 登录成功 → 重定向到 `/dashboard`
- 显示服务端错误提示
- 底部链接到 `/register`

### `/dashboard` 页面
- 静态功能面板模板
- 显示当前登录用户姓名（从 JWT 解析）
- 退出登录按钮
- 后续可扩展为实际功能页面

## 七、安全措施

- 密码验证使用 bcrypt（与注册一致）
- 登录失败不暴露具体原因（邮箱不存在/密码错误统一返回 401）
- JWT 使用 HttpOnly Cookie 防止 XSS 窃取
- 中间件保护防止未授权访问

## 八、测试策略

- **单元测试：** JWT 签发/验证函数
- **API 测试：** 登录成功/失败场景
- **集成测试：** 完整登录 → 访问 dashboard 流程

## 九、依赖变更

新增：`jose` — JWT 签发与验证
