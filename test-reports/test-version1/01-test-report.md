# Test Report — Test 1 (Basic Integration Testing)

> **Branch**: `test-version1` | **Date**: 18 Nov 2026 (GMT+8) | **Tested by**: G001 testing
> **Type**: Basic testing (Test 1), not the final acceptance test.

## 1. Purpose of this round

Two things we wanted to check in this round:

1. **Theme compliance.** Does the current code actually match what we set out to build at the start — a Student-Library Book Management System on Express.js + MongoDB + EJS?
2. **Cloud / server-side features and user cases.** Based on the technical documents we've been given, check whether the project includes the server-side cloud computing features we're supposed to have, run the user cases that exist today, and write down what Test 2 should cover (user roles, user features, and so on).

## 2. Test environment

| Item | Setup |
| --- | --- |
| OS | Windows (Git Bash / curl 8.x) |
| Node.js / npm | v22.22.2 / 10.9.7 |
| Code under test | `main` @ `2319dee` (the base of this branch) |
| How the server was started | `npm start` (Express, port 3000) |
| Database | **MongoDB Atlas** (cloud; connection info comes from `.env`, never committed; database name `library`) |
| Seed data | 3 users (s0000001 / s1397832 / s3780234) and 3 books (Computer networks 1–3) |
| Tools | curl (HTTP + cookie jar to keep a session), npm audit |

Note: `seeddata.js` doesn't currently run (see 4.1), so we loaded the seed data with an equivalent script. The data itself is exactly what `seeddata.js` defines.

## 3. What we tested and the overall result

We built test groups A–E from the README "Operation guides" section (Login/Logout pages, CRUD web pages, RESTful CRUD API), 42 test cases in total.

| Group | What it covers | Cases | Passed | Issues found |
| --- | --- | --- | --- | --- |
| A | Pages while logged out | 12 | 11 | 1 (book pages open to anonymous users) |
| B | Sign-up / login / session / logout | 7 | 7 | — |
| C | Book CRUD pages + input validation | 12 | 11 | 1 (username case handling inconsistent) |
| D | RESTful API (curl commands straight from the Operation Guide) | 8 | 8 | — |
| E | Access control and security | 3 | 1 | 2 (anonymous users can add/delete books) |
| **Total** | | **42** | **38** | **4** |

**Bottom line: the core flows (authentication, book CRUD, the API, and the Atlas connection) all work. The real problems are missing access control on the book routes and a broken seed script.**

## 4. Issues found (ordered by severity)

### P1 — Serious

**4.1 `npm run seed` doesn't run.**
`Error: Cannot find module './schema.js'`. Line 4 of `seeddata.js` does `require('./schema.js')` but the file lives at `models/schema.js`. On top of that, line 5 hardcodes the connection string as `'***'` instead of reading `MONGODB_URI` from `.env`. Anyone following the README right now cannot set up the database in one step.

**4.2 Book create/edit/delete has no login protection.**
Verified by hand: with no cookie at all, `POST /books` returns 302 and the book is actually created; `POST /books/:id/delete` deletes the book. The cause is that `app.js` mounts `indexRouter` at `/` without `requireAuth`, and the `/books` routes inside `routes/index.js` don't check the session either. There is a comment in the code (T12) saying teammates should protect their own CRUD routers, but it never happened. Any anonymous visitor can wipe the catalogue, which is clearly not what we designed.

### P2 — Medium

**4.3 Sign-up validation differs between front end and back end (uppercase usernames).**
`POST /auth/signup` with `username=BADUSER` goes through — the server silently lowercases it to `baduser` and returns 302, while the form's `pattern="[a-z0-9]+"` would have blocked it in the browser. Either reject it server-side with a 400, or tell the user it will be lowercased. Right now the two ends disagree.

**4.4 Passwords are stored in plain text.**
The comment in `routes/auth.js` says this is intentional to stay consistent with the shared course schema and the seeded accounts. We think it's fine for now, but it should be re-looked at in Test 2 (bcrypt).

**4.5 Dependency vulnerabilities (npm audit: 3 found).**
One **high**: `mongoose 9.0.0 – 9.11.3` (fix with `npm audit fix`). Two moderate, including `minimatch 7.0.0 – 11.0.0` (DoS via glob amplification).

### P3 — Minor

**4.6 Session cookie flags.**
From the actual `Set-Cookie` header: `httponly` is on, `samesite=lax` is on. There's no `Secure` flag, which is expected locally since `NODE_ENV` isn't `production` — we need to re-check this after deploying to the Ubuntu VM. Also worth knowing: the cookie body is just Base64 (cookie-session signs but doesn't encrypt), so the username and display name can be decoded after login. No password inside, so the risk is acceptable, but everyone should be aware of it.

**4.7 Borrowing / reservation features are entirely missing.** Covered in section 5.

## 5. Focus 1: does the project meet the original requirements?

Checked against the README's Project Overview / Objectives / Business Features Overview.

### 5.1 Tech stack — yes, fully on track

| Requirement | Result |
| --- | --- |
| Express.js server | Yes — Express 5.3, routes split into 5 modules under routes/ |
| MongoDB + Mongoose | Yes — connected to Atlas and read/write works |
| EJS templates | Yes — home / auth / books / dashboard all render fine |
| cookie-session auth | Yes — sign-up, login, logout and session persistence all passed |
| Unauthenticated RESTful API (for curl) | Yes — all 8 cases on `/api/items` passed |
| Facebook OAuth (Lecture 9, optional) | Yes — degrades gracefully when not configured (302 to `oauth=unconfigured`), no crash |

### 5.2 Business features — only partly there (roughly a third)

Against the six student features listed in the README:

| # | Student feature | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Login and logout | Done | B1–B7 all passed |
| 2 | Browse all books list | Done | Group A, `/books` returns 200 with the 3 seed books (search works too) |
| 3 | Borrow available books | Not started | No Borrowing model, route, or page |
| 4 | View personal borrowings (days left, renewal) | Not started | Same |
| 5 | Reserve when out of stock | Not started | No Reservation model or route |
| 6 | View reservation records | Not started | Same |

The Admin side (managing books, handling returns) isn't implemented either — the `User` schema has no `role` field, and book management is currently open to everyone including anonymous visitors (issue 4.2).

### 5.3 Conclusion

The project is firmly on theme and has a solid MVP base: book management, user authentication, and a RESTful API, with decent code quality overall. But the actual library business logic — borrowing, renewal, returns, reservations — and the role system haven't been started, so we're about two thirds away from what we planned. This matches the `status: in progress` badge in the README.

## 6. Focus 2: cloud-related features and user cases

### 6.1 Server-side / cloud features check

| Capability | Status | Evidence |
| --- | --- | --- |
| Cloud database (DBaaS) | Yes | Atlas SRV connection worked; reads, writes and seeding all fine |
| Environment-based config (12-factor) | Yes | dotenv + `.env.example` template; `config/db.js` reads `MONGODB_URI`; no secrets in the repo (`.env` is gitignored) |
| Health check endpoint | Yes | `GET /health` returns `{"status":"ok"}` — usable for cloud probes |
| Production readiness | Partly | `app.set('trust proxy', 1)` is set; the session `secure` flag only turns on with `NODE_ENV=production`, so it hasn't been exercised yet |
| Cloud deployment (Ubuntu VM) | Not there yet | No deployment script or docs in the repo (no Dockerfile / systemd / nginx notes); the Ubuntu deployment from the course objectives is still to do |

### 6.2 User case results

- Visitor: browsing the homepage / book list / search works; protected pages redirect to login. Passed.
- Student: register → auto login → dashboard passed; wrong password rejected; logout kills the session; duplicate username rejected (409). Passed.
- Edge cases: bad search field 400; bad year 400; missing book / unknown path 404; API missing field 400, bad id 404. All passed.

## 7. What Test 2 should cover

Once the corresponding features are built, we suggest Test 2 includes:

1. **User roles**
   - Regression on registration and seed data after the `role` field is added to the User schema
   - An access-control matrix for Admin vs Student: book add/edit/delete should be Admin-only; students only browse and borrow
   - Re-test issue 4.2 on every book route after the fix lands
2. **User features (Business Features 3–6)**
   - Borrowing: stock goes down, out-of-stock books can't be borrowed
   - Personal borrowing list: remaining-days calculation, due/overdue boundaries
   - Renewal: limits on how many times, no renewal after overdue
   - Reservations: submit when out of stock, view records, notification if implemented
   - Admin handling returns
3. **Security regression**
   - Book routes behind `requireAuth` + Admin role check
   - Login/registration/seed regression after moving to bcrypt
   - Dependency vulnerabilities cleared after `npm audit fix`
   - `seeddata.js` fixed (require path + reading the URI from `.env`), then re-run the one-step setup
   - The username case-handling inconsistency (4.3)
4. **Cloud deployment testing (course objective)**
   - Ubuntu VM: Node runtime, process manager (systemd/pm2), firewall
   - nginx reverse proxy + HTTPS, then re-check the Secure cookie flag
   - Error message sanitising under `NODE_ENV=production` (errorHandler already supports it, needs a live check)
   - Tighten Atlas Network Access from 0.0.0.0/0 down to the server IP
   - Confirm `/health` works as a liveness probe

## 8. Attachments

- Full case-by-case results with raw responses: [03-frontend-backend-integration-report.md](./03-frontend-backend-integration-report.md)
- Code quality review: [02-code-quality-report.md](./02-code-quality-report.md)
