# COMP3810SEF-G001 代码质量报告（测试一）

> **分支**：`test-version1` ｜ **评审日期**：2026-11-18 ｜ **评审基线**：`main` @ `2319dee`
> **评审方式**：全量代码走读（app.js / server.js / config / middleware / models / routes / views / public / seeddata.js）+ npm audit 依赖审计 + 语法级检查

## 一、总体评价

| 维度 | 评分（5 分制） | 说明 |
| --- | --- | --- |
| 项目结构 | ★★★★★ | 分层清晰（config / middleware / models / routes / views / public），职责单一，符合 Express 最佳实践 |
| 代码可读性 | ★★★★☆ | 命名规范，注释充分（含任务编号 T08–T25 与 Lecture 引用） |
| 安全性 | ★★☆☆☆ | 鉴权中间件已备好但关键路由未挂载；密码明文；依赖存在 high 漏洞 |
| 健壮性 | ★★★★☆ | try/catch + 统一 errorHandler 覆盖良好；错误响应区分 API/页面 |
| 可维护性 | ★★★★☆ | 模块化良好，但缺自动化测试、seeddata 损坏 |
| **综合** | **★★★★☆** | **MVP 阶段质量良好，主要短板在安全落地与工具链** |

## 二、优点（值得保持）

1. **结构分层规范**：`app.js` 只做装配、`server.js` 只做启动，路由按域拆分为 5 个模块（index / auth / dashboard / api / oauth），便于并行开发与定位。
2. **中间件设计周到**：`middleware/auth.js` 提供 `attachCurrentUser / requireAuth / requireGuest` 三件套，`requireAuth` 能区分 API（401 JSON）与页面（302 跳登录 + next 回跳），设计成熟；`errorHandler` 同样区分 JSON/HTML 且生产环境脱敏。
3. **秘钥治理正确**：无任何秘钥入库（`db.js` 注释明确说明），`.env` / `.env.local` / `*.log` 均在 `.gitignore`；提供 `.env.example` 模板；仓库配有 `SECURITY.md` 与 `CODEOWNERS`。
4. **OAuth 降级处理优雅**：`routes/oauth.js` 在未配置 Facebook 凭据时将策略注册完全跳过，路由层重定向 `oauth=unconfigured`，并在登录页按 `facebookConfigured` 标志条件渲染按钮，不会抛错。
5. **注释工程化**：关键代码标注任务编号（T08–T25）与课件出处（Lecture 9 p.57-61），可追溯性好。
6. **双会话隔离**：cookie-session（业务）与 express-session（仅 OAuth）互不干扰，注释说明清楚。

## 三、问题清单

### 🔴 P1-1 图书路由未挂载鉴权（安全缺陷）

- `app.js`：`app.use('/', indexRouter)` —— `/books` 全部 CRUD 挂在 index 路由下且无 `requireAuth`。
- 代码注释（app.js T12、middleware/auth.js 头部）均提示「teammates protect their own CRUD routers」，说明设计意图存在但未落地。
- **实测影响**：匿名用户可任意增删改馆藏（见测试报告 4.2）。
- **修复建议**：将图书路由拆分为独立 router 并挂载 `app.use('/books', requireAuth, booksRouter)`，后续再加 Admin 角色校验。

### 🔴 P1-2 `seeddata.js` 损坏

- `require('./schema.js')` 路径错误（实际在 `models/schema.js`）；`mongoose.connect('***')` 硬编码占位符且不读取 `.env`；文件头注释「把 views 文件夹里的 package.json 和 seeddata.js…放进同一文件夹」与 `npm run seed` 脚本自相矛盾。
- **修复建议**：改为 `require('./models/schema')` + `require('dotenv').config()` + `process.env.MONGODB_URI`，并加 `User.deleteMany({}) / Book.deleteMany({})` 幂等处理。

### ⚠️ P2-1 密码明文存储

- `routes/auth.js` 明文比对（注释已声明与课程 schema/种子数据保持一致，属已知取舍）。
- **建议**：测试二阶段引入 `bcrypt`（注册时哈希、登录时 `compare`），同步更新种子数据。

### ⚠️ P2-2 注册校验前后端不一致

- 服务端将用户名 `.toLowerCase()` 后再校验（BADUSER → baduser 注册成功），前端 `pattern` 则直接拦截。前端校验形同虚设时后端行为应与其意图一致（拒绝或明确提示）。

### ⚠️ P2-3 依赖漏洞（npm audit：3 个，含 1 high）

| 依赖 | 严重度 | 修复方式 |
| --- | --- | --- |
| mongoose 9.0.0 – 9.11.3 | **high** | `npm audit fix` |
| minimatch 7.0.0 – 11.0.0（glob 放大 DoS） | moderate | 需 `npm audit fix --force`（评估后执行） |
| 另 1 个 | moderate | `npm audit fix` |

### ℹ️ P3-1 其他小问题

1. **无自动化测试**：无 test 脚本、无测试框架（建议 jest + supertest，至少覆盖 auth 与 api 路由）。
2. **`package.json` description 仍是 TODO 占位符**，`main: index.js` 与实际入口 `server.js` 不符。
3. **views 文件夹存在零散文件**：部分模板缺少共享 navbar（login/signup 使用 auth-container 布局，风格不完全统一，可接受）。
4. **`routes/api.js` 使用内存数组**（课程要求的免鉴权演示 API，符合范围声明，但建议 README 注明数据非持久化，避免误解）。
5. **`config/session.js` 会话密钥 dev 回退值固定**：`'dev-fallback-key-min-32-chars-please-change'`——本地开发可接受，生产必须强制设置 `SESSION_SECRET`（建议启动时缺失即退出）。

## 四、代码风格一致性抽查

| 检查项 | 结果 |
| --- | --- |
| 缩进 | `routes/index.js` 4 空格，其余文件 2 空格（不一致，建议统一 2 空格并配 .editorconfig/Prettier） |
| 引号 | 单引号为主，`api.js` 混用双引号 |
| 分号 | 大部分无分号，`api.js` 带分号（不一致） |
| 命名 | 驼峰命名统一 ✓ |
| EJS 模板 | 结构统一（navbar/footer 复用）✓ |

> 建议在仓库根添加 Prettier 配置（`.prettierrc`）统一风格，属于低优先级改进项。

## 五、改进优先级路线图（供开发排期参考）

| 优先级 | 事项 | 对应测试二回归项 |
| --- | --- | --- |
| 🔴 立即 | 图书路由挂 `requireAuth`；修复 seeddata.js | 权限矩阵、一键初始化 |
| 🟠 短期 | `npm audit fix`；bcrypt 密码哈希；role 字段 | 安全回归 |
| 🟡 中期 | 借阅/预约模型与路由；Admin 权限中间件 | 业务功能用例 |
| 🟢 低 | Prettier 统一风格；补 package.json 描述；jest 冒烟测试 | CI 回归 |

## 六、结论

代码架构与工程习惯**高于课程作业平均水准**（分层、注释、秘钥治理、错误处理均规范），当前最需要补齐的是**把已写好的鉴权中间件真正挂到图书路由上**、修复种子脚本，以及按课程目标推进借阅业务与角色体系，为测试二做好准备。
