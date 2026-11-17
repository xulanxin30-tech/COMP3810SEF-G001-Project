# Frontend–Backend Integration Report — Test 1

> **Branch**: `test-version1` | **Date**: 18 Nov 2026 | **Environment**: localhost:3000 ↔ MongoDB Atlas (cloud)
> **Method**: curl playing the role of a browser, with a cookie jar to hold the session. For every case we recorded the HTTP status, any redirect, and the key parts of the response body.

## 1. The integration chain at a glance

```
Browser / EJS pages (frontend)     Express routes (backend)         MongoDB Atlas (cloud)
───────────────────────────      ──────────────────────────      ──────────────────────────
home.ejs / books/*.ejs    ───►    routes/index.js  (/books CRUD)  ───►  books collection
auth/login.ejs signup.ejs ───►    routes/auth.js   (/auth/*)      ───►  users collection
dashboard.ejs             ───►    routes/dashboard.js (protected)  ───►  (no direct DB access)
curl (Operation Guide)    ───►    routes/api.js    (/api/items)   ───►  (in-memory data)
OAuth login button        ───►    routes/oauth.js  (/auth/facebook/*) ──► Facebook (not configured)
```

All page traffic goes **form POST / query-string GET → routes → Mongoose → Atlas**, rendered server-side by EJS, and the whole chain worked. Static assets (`/css/style.css`, `/css/auth.css`) load fine alongside the pages.

## 2. Group A — pages while logged out (12 cases)

| # | Request | Expected | What happened | Result |
| --- | --- | --- | --- | --- |
| A1 | `GET /` | 200 homepage | 200, navbar / feature list / View Books button all render | Pass |
| A2 | `GET /health` | 200 `{"status":"ok"}` | 200, exactly that | Pass |
| A3 | `GET /books` | 200 book list | 200, 3 seed books with Edit/Delete links | Pass, with a note |
| A4 | `GET /books/new` | 200 add form | 200, all 5 fields render | Pass, with a note |
| A5 | `GET /books/search` | 200 search page | 200, "Found 3 book(s)" | Pass |
| A6 | `GET /books/search?q=networks&type=title` | 3 hits | 200, 3 hits | Pass |
| A7 | `GET /auth/login` | 200 login page | 200, username/password form, no Facebook button (not configured — expected) | Pass |
| A8 | `GET /auth/signup` | 200 signup page | 200, three fields with pattern validation | Pass |
| A9 | `GET /dashboard` | 302 to login | 302 → `/auth/login?next=%2Fdashboard` | Pass |
| A10 | `GET /auth/me` | 401 | 401 `{"error":"Not logged in"}` | Pass |
| A11 | `GET /auth/facebook` | graceful fallback | 302 → `/auth/login?oauth=unconfigured` | Pass |
| A12 | `GET /nonexistent` | 404 | 404 "404 Not Found" | Pass |

Note on A3/A4: the pages work, but the book list and the add-book form are reachable **without logging in** (and writes actually go through — see Group E). The frontend looks right; the backend just isn't checking anything.

## 3. Group B — sign-up / login / session (7 cases, all passed)

| # | Step | What happened | Result |
| --- | --- | --- | --- |
| B1 | `POST /auth/signup` (s9999999 / Test12345) | 302 → `/dashboard`, session cookie set, new record in the Atlas users collection | Pass |
| B2 | With cookie, `GET /dashboard` | 200, welcome page with the right name and username | Pass |
| B3 | Logged in, `GET /auth/login` | 302 → `/dashboard` (requireGuest doing its job) | Pass |
| B4 | With cookie, `GET /auth/me` | `{"user":{"username":"s9999999","name":"Test User"}}` | Pass |
| B5 | `POST /auth/login` with a wrong password | 401, error shown on the login page | Pass |
| B6 | `POST /auth/login` (seed account s0000001/sz212345) | 302 → `/dashboard` — the cloud-side account verifies fine | Pass |
| B7 | `POST /auth/logout`, then `GET /dashboard` | logout 302 → `/`; dashboard then 302 → login (session properly destroyed) | Pass |

## 4. Group C — book CRUD pages (12 cases)

| # | Step | What happened | Result |
| --- | --- | --- | --- |
| C1 | `POST /books` (Test Book Alpha) | 302 → `/books`, new document in Atlas | Pass |
| C2 | `GET /books` check | New book shows up in the list | Pass |
| C3 | `GET /books/search?q=Alpha&type=title` | 200, "Found 1 book(s)" | Pass |
| C4 | `GET /books/:id/edit` | 200, form pre-filled with current data | Pass |
| C5 | `POST /books/:id/edit` rename to v2 | 302 → `/books`, list confirms the change | Pass |
| C6 | `GET /books/:id/delete` then `POST` to confirm | Confirm page 200; delete 302; book gone from the list | Pass |
| C7 | Search with `type=invalid` | 400 "Invalid search type" (the server-side whitelist works) | Pass |
| C8 | Search `type=publishYear&q=abc` | 400 "Please enter a valid year" | Pass |
| C9 | Sign-up with `username=BADUSER` | **302 — accepted, silently lowercased to `baduser`.** The browser pattern would block it, the server doesn't. The two ends disagree | Issue |
| C10 | Sign-up with an all-letters password | 400 with an error message | Pass |
| C11 | Duplicate username s0000001 | 409 "This username is already taken." | Pass |
| C12 | Edit a book id that doesn't exist | 404 "Book not found" | Pass |

## 5. Group D — RESTful API (8 cases, curl exactly as in the Operation Guide)

| # | Command (from the Operation Guide) | Response | Result |
| --- | --- | --- | --- |
| D1 | `GET /api/items` | 200 `[{"id":1,"name":"Task example","completed":false}]` | Pass |
| D2 | `POST /api/items` `{"name":"New Task","completed":false}` | 201 `{"id":2,...}` | Pass |
| D3 | `PUT /api/items/1` `{"name":"Updated Task","completed":true}` | 200, fields updated | Pass |
| D4 | `DELETE /api/items/1` | 204 No Content | Pass |
| D5 | `GET /api/items` again | 200, id=1 gone | Pass |
| D6 | `POST` without a name | 400 `{"error":"Name is required"}` | Pass |
| D7 | `PUT /api/items/999` | 404 `{"error":"Item not found"}` | Pass |
| D8 | `DELETE /api/items/999` | 404, same | Pass |

The API behaves exactly as documented in the README's "Use of RESTful CRUD pages" table. Just remember `/api/items` is in-memory — restart the server and it resets; nothing goes to Atlas.

## 6. Group E — access control and security

| # | Step | What happened | Result |
| --- | --- | --- | --- |
| E1 | **No cookie**, `POST /books` creating "HACKED BOOK" | **302, created successfully, visible in the list** | Fail (serious) |
| E2 | **No cookie**, `POST /books/:id/delete` | **302, deleted** (a seed book — we restored it afterwards) | Fail (serious) |
| E3 | `Set-Cookie` from a login response | `httponly` on, `samesite=lax` on; no `Secure` (expected locally, not production); body is Base64, signed but not encrypted | Note |

How to reproduce E1/E2 so the fix can be verified:

```bash
# With no session cookie at all:
curl -X POST http://localhost:3000/books \
  --data "title=HACKED BOOK&author=Anon&category=X&publisher=X&publishYear=2026"
# Expected after the fix: 302 -> /auth/login. What we got: 302 -> /books, and the book exists.

curl -X POST http://localhost:3000/books/<id>/delete   # anonymous delete works too
```

## 7. Overall integration verdict

1. **The data path is healthy.** EJS pages → Express routes → Mongoose → Atlas worked end to end for both reads and writes. Fields line up on both sides (title/author/category/publisher/publishYear, username/password/name) with no serialisation or type surprises.
2. **The auth path is healthy.** Sign-up, login, logout, the guest guard and the `next` bounce-back all behave as designed.
3. **The API path is healthy.** 100% consistent with the Operation Guide.
4. **The weak point** is that backend permission checks never made it onto the book routes — the frontend politely steers logged-out users around, but the backend itself accepts anything — plus the username-case disagreement between the form and the server. Both are logged as P1/P2 in the test report.
5. All test data created during this round (HACKED BOOK, the test books, test users s9999999 and baduser) has been cleaned up. Atlas is back to 3 users and 3 books, exactly the seed state.

## 8. Environment snapshot (for reproducing)

```bash
# 1) Set up .env (copy .env.example; MONGODB_URI points at Atlas)
# 2) Install and start
npm install && npm start          # Server running at http://localhost:3000
# 3) Smoke test
curl http://localhost:3000/health # {"status":"ok"}
# 4) Log in (seed account)
curl -c jar.txt -X POST http://localhost:3000/auth/login \
  --data "username=s0000001&password=sz212345"   # 302 -> /dashboard
# 5) API (Operation Guide)
curl http://localhost:3000/api/items             # 200
```

Heads up: `npm run seed` currently doesn't work (see the code quality report, P1-2), so seed the data by hand when reproducing.
