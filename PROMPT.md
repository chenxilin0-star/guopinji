# 国聘集 — 国企招聘信息聚合平台

## 项目介绍
国聘集是国内首个聚合权威国企招聘信息的专业平台，采用 Code码订阅制。

## 核心功能
1. 多源聚合：聚合国聘网、国资委、各省市人才网公开数据
2. 职位搜索：按行业、地区、企业性质、岗位类型筛选
3. Code码订阅系统：用户购买/兑换Code码激活订阅权限
4. 订阅推送：用户定制条件，匹配新职位时推送
5. 用户系统：注册/登录/收藏/订阅管理

## 技术栈（Cloudflare 全家桶）
- 前端：Next.js 14 + App Router + TypeScript + Tailwind CSS → Cloudflare Pages
- 后端：Hono.js + TypeScript → Cloudflare Workers
- 数据库：Cloudflare D1 (SQLite)
- 缓存：Cloudflare KV
- 对象存储：Cloudflare R2
- 消息队列：Cloudflare Queues
- 定时任务：Cloudflare Cron Triggers
- 邮件服务：Resend API

## 需要创建的目录结构

```
guopinji-cloudflare/
├── wrangler.toml              # Workers/Pages/D1/KV/R2/Queues 配置
├── package.json               # 项目依赖
├── tsconfig.json
├── ┌─── src/
│   ├─── worker/              # Cloudflare Workers 后端
│   │   ├─── index.ts         # 主入口，Hono 应用
│   │   ├─── routes/
│   │   │   ├─── auth.ts      # 登录/注册/JWT
│   │   │   ├─── jobs.ts      # 职位搜索/详情/收藏
│   │   │   ├─── companies.ts # 公司相关
│   │   │   ├─── codes.ts     # Code码兑换/订阅
│   │   │   ├─── subscriptions.ts # 订阅条件管理
│   │   │   └─── admin.ts     # 管理后台
│   │   ├─── middleware/
│   │   │   ├─── auth.ts      # JWT 验证中间件
│   │   │   └─── rateLimit.ts # 限流中间件
│   │   ├─── db/
│   │   │   ├─── index.ts     # D1 数据库工具函数
│   │   │   └─── schema.sql   # D1 数据库初始化脚本
│   │   ├─── types/
│   │   │   └─── index.ts     # 类型定义
│   │   └─── utils/
│   │       ├─── jwt.ts         # JWT 工具
│   │       ├─── code.ts        # Code码生成验证
│   │       └─── hash.ts        # 密码加密
│   └─── app/                 # Next.js 前端
│       ├─── layout.tsx
│       ├─── page.tsx         # 首页
│       ├─── globals.css
│       ├─── jobs/
│       │   ├─── page.tsx     # 搜索结果页
│       │   └─── [id]/
│       │       └─── page.tsx # 职位详情页
│       ├─── companies/
│       │   └─── [id]/
│       │       └─── page.tsx # 公司详情页
│       ├─── subscribe/
│       │   └─── page.tsx     # 订阅/兑换页面
│       ├─── profile/
│       │   └─── page.tsx     # 个人中心
│       ├─── admin/
│       │   └─── page.tsx     # 管理后台
│       └─── components/      # 共用组件
│           ├─── Header.tsx
│           ├─── JobCard.tsx
│           ├─── SearchBar.tsx
│           ├─── FilterPanel.tsx
│           ├─── SubscriptionForm.tsx
│           └─── CodeRedeem.tsx
└─── └─── scripts/
    ├─── crawl.ts             # 爬虫脚本（Workers 调用）
    └─── seed.ts              # 初始化数据
```

## 核心业务逻辑需求

### Code码系统
- 格式: `GP-{TYPE}-{RANDOM}` 如 `GP-7D-A3F9K2M8`
- 三档套餐: 7天￥6.9 / 15天￥9.9 / 30天￥16.9
- 兑换后计算有效期，存入 user_subscriptions

### 搜索限流
- 未登录: 5次/天
- 登录无订阅: 10次/天
- 有效订阅: 无限制

### 订阅推送
- 用户设置条件（行业/地区/学历/企业性质）
- 新职位匹配时邮件推送
- 每日早上8点定时扫描

## 开发要求
1. 先创建完整目录结构和配置文件
2. 实现 Workers 后端 API（使用 Hono）
3. 实现 D1 数据库操作封装
4. 实现 Next.js 前端页面
5. 所有代码要可直接部署到 Cloudflare

## 特别注意
- 使用 `@cloudflare/next-on-pages` 适配器让 Next.js 运行在 Pages 上
- Workers 使用 Hono 框架，兼容 D1/KV/R2/Queues 绑定
- 密码使用 bcrypt 散列（需要 Web Crypto API 兼容版）
- JWT 使用 jose 库（兼容 Workers 环境）
