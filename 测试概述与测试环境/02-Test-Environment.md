# Test Environment

## Hardware

The final test was run on a Windows x64 host machine. No dedicated physical server was used; the whole stack — Node.js process, MongoDB instance and curl client — ran on the same machine. Memory and CPU were never a limiting factor at this scale (three seeded users, three seeded books, a handful of API items), so no resource metrics were collected.

The intended deployment target is still the Ubuntu virtual machine described in the README. We did not re-provision the VM for this pass; instead we reproduced the same runtime locally. Anyone repeating the test on the VM should replace `localhost:3111` with the VM's IP and port 3000 (or whatever `PORT` is set to in `.env`).

## Software

| Component | Version / detail | Role in testing |
| --- | --- | --- |
| Operating system | Windows 11 x64 (host) | Ran the server, database and client |
| Node.js | v22.22.2 | Runtime for Express app and seed script |
| npm | 10.9.7 | Installed dependencies (`npm install`, 123 packages) |
| Express | ^5.3.0 | HTTP server and routing |
| EJS | ^7.0.2 | Server-side template rendering |
| Mongoose | ^9.11.3 | ODM between routes and MongoDB |
| cookie-session | ^2.1.1 | Session storage in signed cookies |
| MongoDB | In-memory instance via `mongodb-memory-server`, URI `mongodb://127.0.0.1:27019/g001test` | Stole nothing from production; used as a disposable test database |
| curl | Git Bash build | Sent all HTTP requests, kept cookie jars with `-c` / `-b` |
| Browser | Firefox (as documented in README) | Page rendering was verified by checking returned HTML; visual styling was not part of this functional pass |

The README's `.env.example` points at a MongoDB Atlas `mongodb+srv://` URI. We used a local in-memory server instead for two practical reasons: it keeps the test repeatable without anyone's personal connection string, and it still goes through the same Mongoose schema and query code. No personal credentials or real database were touched at any point.

## Configuration used

```text
PORT=3111
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27019/g001test
SESSION_SECRET left unset on purpose (falls back to the hardcoded default)
```

Leaving `SESSION_SECRET` unset was deliberate: one of the defects in this report is exactly that fallback behaviour, and we wanted to confirm it with a real request rather than only by reading the source. The forgery attempt is documented in `../缺陷分析与测试结论建议/02-Severe-Defects.md`.

## Setup sequence

1. `npm install` — succeeded, 123 packages added.
2. Started the in-memory MongoDB on port 27019.
3. `npm run seed` with `MONGODB_URI` pointing at the test database — cleared both collections and inserted 3 users and 3 books successfully.
4. `npm start` with `PORT=3111` — server reported `Server running at http://localhost:3111` and `MongoDB connected (g001test)`.
5. Confirmed readiness with `GET /health` → `200 {"status":"ok"}` and `GET /api/items` → `200 []`.

## Notes on the browser and the VM

The project is a server-rendered EJS app; there is no client-side framework and no JavaScript-driven API call in the pages. That means curl sees essentially what a browser sees in terms of status codes, redirects and data. We still checked the HTML of the home page, login page, sign-up page, dashboard, book list, search, create, edit and delete views to make sure templates render and that user input is escaped.

For the presentation demo, the README's route still applies: deploy on the Ubuntu VM, open `http://<VM-IP>:3000` in Firefox, and run the curl commands in a second terminal. Nothing in this test pass changes that workflow.
