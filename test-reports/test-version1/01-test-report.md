# COMP3810SEF-G001 测试报告（测试一 · 基础联调测试）

> **分支**：`test-version1` ｜ **测试日期**：2026-11-18（GMT+8） ｜ **测试人**：G001 测试组
> **测试性质**：基础测试（测试一），非最终验收测试

## 一、测试目的（本期重点）

1. **主题符合度检查**：检查项目代码是否符合项目初期要求，即是否符合「学生图书馆图书管理系统（Express.js + MongoDB + EJS）」的项目主题。
2. **云计算功能与用户用例检查**：根据项目涉及的技术文档，测试是否包含服务端云计算的相关功能，并对已实现的用户用例进行测试，同时给出第二步测试（测试二）所需测试的内容（用户角色、用户功能等）。

## 二、测试环境

| 项目 | 配置 |
| --- | --- |
| 操作系统 | Windows（Git Bash / curl 8.x） |
| Node.js / npm | v22.22.2 / 10.9.7 |
| 被测代码 | `main` 分支 @ `2319dee`（本分支 `test-version1` 的基线） |
| 服务器启动方式 | `npm start`（Express，端口 3000） |
| 数据库 | **MongoDB Atlas 云数据库**（连接信息由 `.env` 提供，不入库；数据库名 `library`） |
| 种子数据 | 3 个用户（s0000001 / s1397832 / s3780234）+ 3 本图书（Computer networks 1–3） |
| 测试工具 | curl（HTTP 请求 + Cookie Jar 会话模拟）、npm audit |

> 说明：`seeddata.js` 当前无法运行（详见 4.1），种子数据通过等效脚本写入 Atlas，数据内容与 `seeddata.js` 定义完全一致。

## 三、测试范围与执行结果总览

依据 README「Operation guides」章节（Login/Logout 页面、CRUD 网页、RESTful CRUD API）设计测试组 A–E，共 **39 项**测试用例。

| 测试组 | 内容 | 用例数 | 通过 | 未通过/发现 |
| --- | --- | --- | --- | --- |
| A | 未登录状态页面可达性 | 12 | 11 | 1 ⚠️（图书页未登录可访问） |
| B | 注册 / 登录 / 会话 / 登出 | 7 | 7 | — |
| C | 图书 CRUD 网页 + 输入校验 | 12 | 11 | 1 ⚠️（注册大小写校验不一致） |
| D | RESTful API（Operation Guide 原样 curl） | 8 | 8 | — |
| E | 权限边界与安全 | 3 | 1 | 2 🔴（匿名可增删图书） |
| **合计** | | **42** | **38** | **4** |

**结论：核心链路（认证、图书 CRUD、API）功能正常，云数据库联调成功；主要问题集中在「权限保护缺失」与「种子脚本损坏」。**

## 四、发现的问题清单（按严重程度排序）

### 🔴 严重（P1）

**4.1 `npm run seed` 无法运行**
- 现象：`Error: Cannot find module './schema.js'`
- 原因：`seeddata.js` 第 4 行 `require('./schema.js')`，但文件实际位于 `models/schema.js`；且第 5 行连接串硬编码为 `'***'` 占位符，不读取 `.env` 中的 `MONGODB_URI`。
- 影响：新成员按 README 指引无法一键初始化数据库。

**4.2 图书增删改写操作无登录保护**
- 现象（实测）：未登录（无任何 Cookie）直接 `POST /books` → 返回 302 且图书成功写入；未登录 `POST /books/:id/delete` → 图书被删除。
- 原因：`app.js` 中 `indexRouter` 挂载在 `/` 且未挂 `requireAuth`，`routes/index.js` 内部对 `/books` 系列路由无鉴权（代码注释 T12 已提示「Teammates protect their own CRUD routers」，但未落实）。
- 影响：任何匿名访问者可篡改/删除馆藏数据，不符合「Admin 管理图书」的设计意图。

### ⚠️ 中等（P2）

**4.3 注册功能前后端校验不一致（大写用户名）**
- 现象（实测）：`POST /auth/signup` 提交 `username=BADUSER` → 服务端将其静默转小写为 `baduser` 并注册成功（302）；而前端表单 `pattern="[a-z0-9]+"` 会直接拦截大写。
- 建议：服务端改为拒绝并返回 400，或前端提示「将自动转为小写」，二选一保持一致。

**4.4 密码明文存储**
- `routes/auth.js` 注释已声明「与课程共享 schema 及种子账号保持一致」，属于已知设计取舍；建议测试二阶段评估 bcrypt 哈希改造。

**4.5 依赖漏洞（npm audit：3 个）**
- 1 个 **high**：`mongoose 9.0.0 – 9.11.3`（运行 `npm audit fix` 可修复）
- 2 个 **moderate**：含 `minimatch 7.0.0 – 11.0.0`（DoS 风险）

### ℹ️ 低（P3）

**4.6 会话 Cookie 安全属性**
- 实测 `Set-Cookie`：`httponly` ✓、`samesite=lax` ✓；无 `Secure` 标志——因本地非生产环境（`NODE_ENV !== 'production'`），属预期行为，需在 Ubuntu 部署后复测。
- cookie 内容为 Base64（cookie-session 默认仅签名、不加密），登录后可解码出用户名与姓名，不含密码，风险可接受但应知晓。

**4.7 借阅/预约业务完全未实现**（详见第五节符合度评估）

## 五、重点 1：项目是否符合初期要求（主题符合度）

对照项目初期目标（README Project Overview / Objectives / Business Features Overview）：

### 5.1 技术栈符合度 —— ✅ 完全符合

| 初期要求 | 实测结果 |
| --- | --- |
| Express.js 服务端 | ✓ Express 5.3，路由分层清晰（routes/ 5 个模块） |
| MongoDB + Mongoose | ✓ 实测连通 Atlas 云数据库，读写正常 |
| EJS 模板 | ✓ 页面均正常渲染（home / auth / books / dashboard） |
| cookie-session 认证 | ✓ 注册/登录/登出/会话保持全部通过 |
| RESTful API（免鉴权，供 curl 测试） | ✓ `/api/items` CRUD 8 项全部通过 |
| Facebook OAuth（Lecture 9 可选项） | ✓ 未配置时优雅降级（302 → `oauth=unconfigured`），不报错 |

### 5.2 业务功能符合度 —— ⚠️ 部分符合（约 1/3）

对照 README「Business Features Overview」的 6 项学生功能：

| # | 学生功能 | 状态 | 实测依据 |
| --- | --- | --- | --- |
| 1 | Login and logout | ✅ 已实现 | B1–B7 全部通过 |
| 2 | Browse all books list | ✅ 已实现 | A 组 `/books` 200，3 本种子书正常展示（含搜索） |
| 3 | Borrow available books | ❌ 未实现 | 无 Borrowing 模型/路由/页面 |
| 4 | View personal borrowings（剩余天数/续借） | ❌ 未实现 | 同上 |
| 5 | 缺货时提交预约 | ❌ 未实现 | 无 Reservation 模型/路由 |
| 6 | 查看个人预约记录 | ❌ 未实现 | 同上 |

另：Admin（图书管理、处理归还）角色未实现——`User` schema 无 `role` 字段；图书管理目前对所有用户（含匿名）开放（问题 4.2）。

### 5.3 结论

项目**方向与主题完全一致**，已完成「图书管理 + 用户认证 + RESTful API」的 MVP 底座，工程质量整体良好；但**图书馆核心业务（借阅/续借/归还/预约）与角色权限体系尚未开始**，距离初期规划的业务范围尚有约 2/3 差距。当前状态与 README 徽章 `status: in progress` 相符。

## 六、重点 2：云计算相关功能与用户用例

### 6.1 服务端云计算相关功能检查

| 能力 | 状态 | 实测依据 |
| --- | --- | --- |
| 云数据库（DBaaS）接入 | ✅ | Atlas SRV 连接串实测连通，读写/建库/种子全部成功 |
| 环境变量配置（12-factor） | ✅ | dotenv + `.env.example` 模板齐全；`config/db.js` 从 `MONGODB_URI` 读取，无秘钥入库（`.env` 在 `.gitignore` 中） |
| 健康检查端点 | ✅ | `GET /health` → `{"status":"ok"}`，可供云平台探活 |
| 生产环境适配 | ⚠️ 部分 | `app.set('trust proxy', 1)` 已设置；session `secure` 仅在 `NODE_ENV=production` 启用（本地未生效，需部署后复测） |
| 云端部署（Ubuntu VM） | ❌ 未见 | 仓库无部署脚本/文档（无 Dockerfile / systemd / nginx 说明），课程目标中的 Ubuntu 部署尚未落地 |

### 6.2 用户用例测试结果

- **访客用例**：浏览首页/图书列表/搜索 ✅；访问受保护页被引导至登录页 ✅
- **学生用例**：注册→自动登录→进入仪表盘 ✅；错误密码拒绝 ✅；登出后会话失效 ✅；重复用户名拒绝（409）✅
- **异常用例**：非法搜索字段 400 ✅；非法年份 400 ✅；不存在的图书/路径 404 ✅；API 缺参 400 / 无效 id 404 ✅

## 七、第二步测试（测试二）范围建议

以下内容建议在对应功能开发完成后，作为「测试二」的测试范围：

1. **用户角色（User Roles）**
   - User schema 增加 `role` 字段后的注册/种子数据回归
   - Admin 与 Student 的访问控制矩阵：图书增删改仅 Admin 可用；学生端仅浏览/借阅
   - 回归验证本报告问题 4.2（匿名写操作）修复后所有图书路由的鉴权行为
2. **用户功能（User Features，对应 Business Features 3–6）**
   - 借书流程：可借库存扣减、无库存时禁止借出
   - 个人借阅列表：剩余归还天数计算、到期/逾期边界
   - 续借：次数限制、逾期后禁止续借
   - 预约：缺货预约提交、预约记录查看、到书通知逻辑（若实现）
   - Admin 处理归还流程
3. **安全加固回归**
   - 图书路由挂载 `requireAuth` + Admin 角色校验
   - 密码哈希（bcrypt）改造后登录/注册/种子账号回归
   - `npm audit fix` 后依赖漏洞清零
   - 修复 `seeddata.js`（require 路径 + 连接串读取 .env）后一键初始化回归
   - 注册大小写校验一致性（问题 4.3）
4. **云端部署测试（课程目标）**
   - Ubuntu VM 部署：Node 运行时、进程守护（systemd/pm2）、防火墙
   - 反向代理（nginx）与 HTTPS，复测 Secure Cookie
   - `NODE_ENV=production` 下错误信息脱敏（errorHandler 已实现，需实测）
   - Atlas Network Access 最小化（从 0.0.0.0/0 收敛为服务器 IP）
   - `/health` 作为负载探活的可用性验证

## 八、附件

- 测试明细数据（A–E 组 42 项用例逐项结果与原始响应）：见 [03-frontend-backend-integration-report.md](./03-frontend-backend-integration-report.md)
- 代码质量评估：见 [02-code-quality-report.md](./02-code-quality-report.md)
