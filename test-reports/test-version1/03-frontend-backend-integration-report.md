# COMP3810SEF-G001 前后端功能联调报告（测试一）

> **分支**：`test-version1` ｜ **测试日期**：2026-11-18 ｜ **环境**：localhost:3000 ↔ MongoDB Atlas（云）
> **方法**：curl 模拟浏览器完整请求链（含 Cookie Jar 会话保持），逐项记录 HTTP 状态码、重定向与响应体关键内容

## 一、联调链路总览

```
浏览器/EJS 页面（前端）          Express 路由（后端）           MongoDB Atlas（云数据库）
─────────────────────────      ─────────────────────────      ─────────────────────────
home.ejs / books/*.ejs   ───►   routes/index.js  (/books CRUD)  ───►  books 集合
auth/login.ejs signup.ejs ───►  routes/auth.js   (/auth/*)     ───►  users 集合
dashboard.ejs            ───►   routes/dashboard.js (受保护)    ───►  （无直接 DB 访问）
curl（Operation Guide）  ───►   routes/api.js    (/api/items)   ───►  （内存数据）
OAuth 登录按钮            ───►   routes/oauth.js  (/auth/facebook/*) ──► Facebook（未配置）
```

- 前后端数据流全部走 **表单 POST / URL 查询串 GET → 路由 → Mongoose → Atlas**，EJS 服务端渲染，实测全链路连通。
- 静态资源（`/css/style.css`、`/css/auth.css`）随页面正常加载。

## 二、A 组：未登录页面联调明细（12 项）

| # | 请求 | 预期 | 实际 | 结果 |
| --- | --- | --- | --- | --- |
| A1 | `GET /` | 200 首页 | 200，navbar/功能列表/View Books 按钮正常渲染 | ✅ |
| A2 | `GET /health` | 200 `{"status":"ok"}` | 200，一致 | ✅ |
| A3 | `GET /books` | 200 图书列表 | 200，3 本种子书含 Edit/Delete 链接 | ✅⚠️ |
| A4 | `GET /books/new` | 200 添加表单 | 200，5 个字段渲染正常 | ✅⚠️ |
| A5 | `GET /books/search` | 200 搜索页 | 200，"Found 3 book(s)" | ✅ |
| A6 | `GET /books/search?q=networks&type=title` | 命中 3 本 | 200，命中 3 本 | ✅ |
| A7 | `GET /auth/login` | 200 登录页 | 200，username/password 表单正常，无 Facebook 按钮（未配置，符合预期） | ✅ |
| A8 | `GET /auth/signup` | 200 注册页 | 200，三字段表单 + pattern 校验 | ✅ |
| A9 | `GET /dashboard` | 302 → 登录页 | 302 → `/auth/login?next=%2Fdashboard` | ✅ |
| A10 | `GET /auth/me` | 401 | 401 `{"error":"Not logged in"}` | ✅ |
| A11 | `GET /auth/facebook` | 未配置降级 | 302 → `/auth/login?oauth=unconfigured` | ✅ |
| A12 | `GET /nonexistent` | 404 | 404 "404 Not Found" | ✅ |

> ⚠️ A3/A4：功能正常，但**未登录即可访问图书列表与添加页**（写操作实测可执行，见 E 组）——前端呈现正常、后端缺权限校验。

## 三、B 组：注册 / 登录 / 会话联调明细（7 项，全过）

| # | 操作 | 实际结果 | 结果 |
| --- | --- | --- | --- |
| B1 | `POST /auth/signup`（s9999999 / Test12345） | 302 → `/dashboard`，Set-Cookie 会话建立，Atlas users 集合新增记录 | ✅ |
| B2 | 携 Cookie `GET /dashboard` | 200，欢迎页（姓名/用户名正确） | ✅ |
| B3 | 已登录 `GET /auth/login` | 302 → `/dashboard`（requireGuest 生效） | ✅ |
| B4 | 携 Cookie `GET /auth/me` | `{"user":{"username":"s9999999","name":"Test User"}}` | ✅ |
| B5 | `POST /auth/login` 错误密码 | 401，登录页错误提示 | ✅ |
| B6 | `POST /auth/login`（种子账号 s0000001/sz212345） | 302 → `/dashboard`，Atlas 云端账号验证通过 | ✅ |
| B7 | `POST /auth/logout` → `GET /dashboard` | 302 → `/`；登出后 dashboard 302 → 登录页（会话已销毁） | ✅ |

## 四、C 组：图书 CRUD 网页联调明细（12 项）

| # | 操作 | 实际结果 | 结果 |
| --- | --- | --- | --- |
| C1 | `POST /books` 新建（Test Book Alpha） | 302 → `/books`，Atlas books 新增 | ✅ |
| C2 | `GET /books` 确认 | 列表出现新书（计数 1） | ✅ |
| C3 | `GET /books/search?q=Alpha&type=title` | 200，"Found 1 book(s)" | ✅ |
| C4 | `GET /books/:id/edit` | 200，表单回填当前数据 | ✅ |
| C5 | `POST /books/:id/edit` 改名 v2 | 302 → `/books`，列表确认更新 | ✅ |
| C6 | `GET /books/:id/delete` → `POST` 确认 | 确认页 200；删除 302，列表中消失 | ✅ |
| C7 | 搜索 `type=invalid` | 400 "Invalid search type"（后端白名单校验生效） | ✅ |
| C8 | 搜索 `type=publishYear&q=abc` | 400 "Please enter a valid year" | ✅ |
| C9 | 注册 `username=BADUSER` | **302 注册成功（被转为 baduser）**——前端 pattern 拦截、后端静默转小写，**不一致** | ⚠️ |
| C10 | 注册纯字母密码 | 400，错误提示 | ✅ |
| C11 | 重复用户名 s0000001 | 409 "This username is already taken." | ✅ |
| C12 | 编辑不存在的图书 id | 404 "Book not found" | ✅ |

## 五、D 组：RESTful API 联调明细（8 项，按 Operation Guide 原命令）

| # | 操作（Operation Guide 原样 curl） | 实际响应 | 结果 |
| --- | --- | --- | --- |
| D1 | `GET /api/items` | 200 `[{"id":1,"name":"Task example","completed":false}]` | ✅ |
| D2 | `POST /api/items` `{"name":"New Task","completed":false}` | 201 `{"id":2,...}` | ✅ |
| D3 | `PUT /api/items/1` `{"name":"Updated Task","completed":true}` | 200，字段已更新 | ✅ |
| D4 | `DELETE /api/items/1` | 204 No Content | ✅ |
| D5 | `GET /api/items` 复查 | 200，id=1 已移除 | ✅ |
| D6 | `POST` 缺 name | 400 `{"error":"Name is required"}` | ✅ |
| D7 | `PUT /api/items/999` | 404 `{"error":"Item not found"}` | ✅ |
| D8 | `DELETE /api/items/999` | 404 同上 | ✅ |

> API 行为与 README「Use of RESTful CRUD pages」表格**完全一致**；注意 `/api/items` 为内存数据（重启即重置），不落 Atlas。

## 六、E 组：权限边界与安全联调明细

| # | 操作 | 实际结果 | 结果 |
| --- | --- | --- | --- |
| E1 | **无 Cookie** `POST /books` 创建 "HACKED BOOK" | **302 创建成功，出现在列表中** | 🔴 |
| E2 | **无 Cookie** `POST /books/:id/delete` | **302 删除成功**（种子书被删，已恢复） | 🔴 |
| E3 | 登录响应 `Set-Cookie` | `httponly` ✓ `samesite=lax` ✓；无 `Secure`（本地非生产，预期）；内容 Base64 仅签名 | ⚠️ |

**E1/E2 复现步骤**（供开发验证修复）：

```bash
# 未携带任何会话 Cookie：
curl -X POST http://localhost:3000/books \
  --data "title=HACKED BOOK&author=Anon&category=X&publisher=X&publishYear=2026"
# 预期（修复后）：302 -> /auth/login；实际：302 -> /books 且写入成功

curl -X POST http://localhost:3000/books/<id>/delete   # 匿名删除同样成功
```

## 七、前后端联调综合结论

1. **数据链路健康**：EJS 页面 → Express 路由 → Mongoose → Atlas 云库的全链路读写实测畅通，前后端字段（title/author/category/publisher/publishYear、username/password/name）完全对齐，无序列化/类型问题。
2. **认证链路健康**：注册/登录/登出/会话劫持防护（requireGuest、next 回跳）全部符合设计。
3. **API 链路健康**：与 Operation Guide 文档行为 100% 一致。
4. **主要短板**：后端权限校验未覆盖图书路由（前端虽有「未登录只能看」的页面引导，但后端裸奔），以及注册大小写校验前后端不一致——两处均已在《测试报告》列为 P1/P2 问题。
5. 测试产生的临时数据（HACKED BOOK、Test Book、测试用户 s9999999/baduser）已全部清理，Atlas 恢复为 3 用户 + 3 图书的种子状态。

## 八、原始测试环境快照（复现用）

```bash
# 1) 配置 .env（参照 .env.example，MONGODB_URI 指向 Atlas）
# 2) 安装并启动
npm install && npm start          # Server running at http://localhost:3000
# 3) 冒烟
curl http://localhost:3000/health # {"status":"ok"}
# 4) 登录（种子账号）
curl -c jar.txt -X POST http://localhost:3000/auth/login \
  --data "username=s0000001&password=sz212345"   # 302 -> /dashboard
# 5) API（Operation Guide）
curl http://localhost:3000/api/items             # 200
```

> 注：`npm run seed` 当前不可用（见代码质量报告 P1-2），复现时需手动准备种子数据。
