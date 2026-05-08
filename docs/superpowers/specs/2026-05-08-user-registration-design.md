# 用户注册模块设计文档

**日期：** 2026-05-08
**技术栈：** Next.js (App Router) + Drizzle ORM + SQLite + TypeScript

## 一、整体架构

采用 Next.js 单体应用架构，前后端合并在一个项目中，减少部署运维成本。

```
/src
├── app/
│   ├── register/page.tsx         # 注册页面
│   ├── register/success/page.tsx # 注册成功页
│   └── api/auth/register/route.ts# 注册 API 接口
├── components/
│   └── RegisterForm.tsx          # 注册表单组件
├── lib/
│   ├── db.ts                     # 数据库连接配置
│   ├── auth.ts                   # 密码加密、工具函数
│   └── validators.ts             # Zod 校验规则
└── types/
    └── index.ts                  # 公共类型定义
```

## 二、数据模型

```
User {
  id:        string (UUID, 自动生成)
  email:     string (唯一索引)
  password:  string (bcrypt 哈希加密)
  name:      string
  createdAt: datetime (自动)
  updatedAt: datetime (自动)
}
```

数据库选用 SQLite + Drizzle ORM。部署时无需额外数据库服务，由 Drizzle Kit 管理迁移。

## 三、API 接口

### POST /api/auth/register

**请求体：**
```json
{
  "email": "user@example.com",
  "password": "securePass123",
  "name": "张三"
}
```

**成功响应 (201)：**
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "name": "张三",
  "createdAt": "2026-05-08T00:00:00.000Z"
}
```

**错误响应：**
- `400 Bad Request` — 校验失败（邮箱格式错误、密码太短、缺少字段）
- `409 Conflict` — 邮箱已被注册
- `429 Too Many Requests` — 请求频率过高

错误体格式：
```json
{
  "error": "错误描述",
  "details": [{ "field": "email", "message": "具体错误信息" }]
}
```

## 四、校验策略

- **前后端共用 Zod schema** — `lib/validators.ts` 作为唯一校验规则源
- **前端**：React Hook Form + zod resolver，实时行内错误提示
- **后端**：每次请求都执行相同 schema 校验
- **密码规则**：最少 8 位
- **邮箱规则**：合法邮箱格式，最长 255 字符

## 五、安全措施

- **密码存储**：bcrypt 加盐哈希，盐轮数 = 12
- **频率限制**：每 IP 每小时最多 5 次注册
- **防重复注册**：数据库唯一约束 + 业务层写入前查重
- **XSS/CSRF**：由 Next.js 内置机制防护
- **敏感数据**：响应中永不返回密码字段

## 六、测试策略

- **单元测试**：校验 Zod schema、密码哈希工具函数、限流逻辑
- **API 集成测试**：使用 supertest 测试 Next.js API 路由
  - 注册成功返回 201 及用户数据
  - 重复邮箱返回 409
  - 无效输入返回 400
  - 弱密码返回 400

## 七、部署方案

- **首选**：Vercel 零配置部署（SQLite 文件存储在临时磁盘或接入 Turso）
- **备选**：Docker 镜像内置 SQLite
- **基础部署无需外部数据库服务**

## 八、本次不实现

- 邮箱验证流程
- OAuth / 社交登录
- 密码重置
- 管理员用户管理
