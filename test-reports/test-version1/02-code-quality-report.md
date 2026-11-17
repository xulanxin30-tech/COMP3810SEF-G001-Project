# Code Quality Report — Test 1

> **Branch**: `test-version1` | **Review date**: 18 Nov 2026 | **Baseline**: `main` @ `2319dee`
> **How we reviewed**: read every file by hand (app.js / server.js / config / middleware / models / routes / views / public / seeddata.js), ran npm audit, and checked syntax along the way.

## 1. Overall impression

| Area | Score (out of 5) | Comment |
| --- | --- | --- |
| Project structure | 5 | Clean layering (config / middleware / models / routes / views / public), one job per module, follows Express conventions |
| Readability | 4 | Good naming, plenty of comments (task IDs T08–T25 and lecture references included) |
| Security | 2 | Auth middleware exists but isn't attached to the routes that need it; plain-text passwords; one high dependency vulnerability |
| Robustness | 4 | try/catch everywhere with a central errorHandler; responses differ correctly for API vs pages |
| Maintainability | 4 | Well modularised, but no automated tests and the seed script is broken |
| **Overall** | **4** | **Good quality for an MVP stage; the weak spots are security wiring and tooling** |

## 2. What's good (worth keeping)

1. **Sensible layering.** `app.js` only wires things up, `server.js` only boots, and routes are split by domain into five modules (index / auth / dashboard / api / oauth). Easy to work in parallel and easy to find things.
2. **Thoughtful middleware.** `middleware/auth.js` gives us `attachCurrentUser / requireAuth / requireGuest`, and `requireAuth` knows the difference between an API call (401 JSON) and a page (302 to login with a `next` bounce-back). The errorHandler does the same JSON/HTML split and hides details in production. More mature than most course projects.
3. **Secrets handled properly.** Nothing sensitive is committed (there's a clear comment in `db.js` about it), `.env` / `.env.local` / `*.log` are gitignored, we have `.env.example` as a template, and the repo even carries SECURITY.md and CODEOWNERS.
4. **OAuth degrades gracefully.** When Facebook credentials are missing, `routes/oauth.js` simply doesn't register the strategy, the routes redirect to `oauth=unconfigured`, and the login page only shows the button when `facebookConfigured` is true. No crashes anywhere.
5. **Traceable comments.** Key code is tagged with task numbers (T08–T25) and lecture slides (Lecture 9 p.57-61), which makes review much easier.
6. **Two sessions, kept apart.** cookie-session for the app and express-session only for OAuth, with a comment explaining why. Nothing leaks between them.

## 3. Issues

### P1-1 Book routes have no auth attached (security defect)

`app.js` does `app.use('/', indexRouter)` — every `/books` CRUD route hangs off the index router with no `requireAuth`. The comments in app.js (T12) and at the top of `middleware/auth.js` both say teammates should protect their own CRUD routers, so the intention was there; it just never got wired up. In practice (we tested this), an anonymous visitor can add or delete books. Fix: split the book routes into their own router and mount it as `app.use('/books', requireAuth, booksRouter)`, then add the Admin role check later.

### P1-2 `seeddata.js` is broken

`require('./schema.js')` points at the wrong place (the file is at `models/schema.js`), and `mongoose.connect('***')` hardcodes a placeholder instead of reading `.env`. The comment at the top even tells you to manually copy files into one folder, which contradicts the `npm run seed` script in package.json. Fix: use `require('./models/schema')`, add `require('dotenv').config()`, read `process.env.MONGODB_URI`, and clear the collections first so re-running is safe.

### P2-1 Passwords in plain text

`routes/auth.js` compares passwords directly, and the comment says this is deliberate to match the shared course schema and the seeded accounts. Fair enough for now — but Test 2 should revisit it with bcrypt (hash on signup, `compare` on login, and updated seed data).

### P2-2 Sign-up validation disagrees between front and back end

The server lowercases the username before validating, so `BADUSER` becomes `baduser` and signs up fine, while the browser-side `pattern` would have blocked it. The two ends should agree — either reject or clearly tell the user what happens.

### P2-3 Dependency vulnerabilities (npm audit: 3, one high)

| Package | Severity | Fix |
| --- | --- | --- |
| mongoose 9.0.0 – 9.11.3 | **high** | `npm audit fix` |
| minimatch 7.0.0 – 11.0.0 (glob amplification DoS) | moderate | needs `npm audit fix --force` (check first) |
| one more | moderate | `npm audit fix` |

### P3-1 Smaller things

1. **No automated tests.** No test script and no framework. Even a small jest + supertest setup covering the auth and api routes would help.
2. **package.json** still has a TODO placeholder in `description`, and `main: index.js` doesn't match the real entry point `server.js`.
3. The login/signup pages use a slightly different layout (auth-container) from the rest — acceptable, just noting it isn't fully uniform.
4. **`routes/api.js` keeps data in memory.** That's what the course asks for (unauthenticated demo API), but the README should probably say the data doesn't survive a restart, so nobody gets confused.
5. **Dev fallback session key** in `config/session.js` is a fixed string. Fine locally; in production the app should refuse to start without a real `SESSION_SECRET`.

## 4. Style consistency check

| Check | Result |
| --- | --- |
| Indentation | `routes/index.js` uses 4 spaces, everything else 2 — pick one (we'd go with 2) and add .editorconfig or Prettier |
| Quotes | Mostly single; `api.js` mixes in doubles |
| Semicolons | Most files omit them; `api.js` keeps them |
| Naming | Consistent camelCase |
| EJS templates | Consistent structure, navbar/footer shared |

Low priority, but a `.prettierrc` at the repo root would settle all of this.

## 5. Suggested order of fixes

| Priority | Item | Test 2 regression |
| --- | --- | --- |
| Now | Attach `requireAuth` to book routes; fix seeddata.js | Access-control matrix, one-step setup |
| Short term | `npm audit fix`; bcrypt; add the role field | Security regression |
| Mid term | Borrowing / reservation models and routes; Admin middleware | Business feature cases |
| Whenever | Prettier config; package.json description; a few jest smoke tests | CI regression |

## 6. Conclusion

The architecture and working habits are above the usual standard for a course project — clean layering, good comments, secrets kept out of git, and solid error handling. What's missing is mostly wiring: the auth middleware that's already written needs to actually sit in front of the book routes, the seed script needs fixing, and then the borrowing features and role system need building so Test 2 has something to bite into.
