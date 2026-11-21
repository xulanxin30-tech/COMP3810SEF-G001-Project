# Project Status and Gap Analysis

## Where the project stands now

The main branch is a working MVP of a Student-Library Management System. It has cookie-session login, a dashboard, book listing/search/create/edit/delete pages, and a separate RESTful `/api/items` API for curl demonstrations. Setup is documented, seed data is provided, and the app runs on a VM or locally with a single `npm install` / `npm run seed` / `npm start` sequence. In our test run every happy path described in the README worked.

That is a solid result for a course group of five active members. The gaps below are not about missing the brief — they are about the distance between this MVP and a properly built cloud server-side system.

## Gap 1 — Credential and session handling

This is the largest gap. Production systems hash passwords with bcrypt/argon2, keep the session signing key in a secret manager or environment variable, rotate that key, and set cookie flags deliberately (`Secure`, `HttpOnly`, `SameSite`, short expiry). Here passwords are plain text and the signing key falls back to a string committed in the source. We proved in testing that a forged cookie is accepted.

The sample projects in the course PDF use similarly simple session code for teaching, so this is understandable in context. But a released system would never ship this way. Closing this gap is a matter of a few hours, not a redesign.

## Gap 2 — Input validation and error responses

A mature service never lets a malformed ID or a stray parenthesis produce a 500 with a raw stack message. It validates at the edge, returns a structured 4xx with a stable error code, and logs the details server-side. Our API router is close to this — it checks ObjectIds and returns JSON errors — but the web routes are not. The two halves of the same application currently give different answers to the same bad input.

A published system would also have a request schema layer (Joi/Zod or similar) instead of relying on Mongoose validators to fire at save time.

## Gap 3 — Data model and API design

`/api/items` is a generic task-style endpoint (`name`, `completed`) that does not connect to the Book domain the rest of the app uses. It exists to satisfy the curl-testing part of the course, and it does that well. A real library service would expose `/api/books` and `/api/auth` with the same models the web pages use, consistent versioning (`/api/v1/...`), pagination on list endpoints, and proper HTTP semantics.

There is also no database index or query optimisation. Fine at three books, less fine at three hundred thousand.

## Gap 4 — Deployment and operations

The README describes an Ubuntu VM deployment, which meets the brief. A production-grade cloud service would add: a process manager (`systemd` or `pm2`), a reverse proxy with TLS (nginx), centralised logs, health checks that reflect database connectivity rather than only process liveness, environment-specific configuration, and automated backup for MongoDB. Our `/health` returns `ok` even when the database is down — a real orchestrator would take the instance out of rotation.

## Gap 5 — Automated testing and CI

Everything in this report was executed by hand with curl. There is no test suite, no CI workflow, and no coverage tracking. Similar published systems normally have unit tests for models and middleware plus integration tests for routes, often with Supertest and an in-memory database — the same tooling we used for this final pass, just not committed. Adding `npm test` with a handful of route tests would be the single biggest maturity step after fixing the security defects.

## Gap 6 — Documentation hygiene

The README is detailed and friendly, which is a strength. Its problems are drift: exclusions listed as scope, a fake ObjectId in the curl examples, a leftover OAuth block in `.env.example`, a template `SECURITY.md`. A released project keeps these in sync with code. Given that the project files and presentation together make up the whole mark, polishing the written side is worth real effort.

## Gap 7 — Team composition and workload

The PDF is explicit that the group must have 4–6 members with a clear role each, and that a free rider scores zero. The README lists six members but marks one as a free rider with no responsibilities. That is an honest disclosure, but it also means the project is effectively a five-person effort and sits close to the minimum group size. The remaining members covered scaffolding, auth, schema/seed data, documentation and QA, so the required roles were filled. Going forward, the lesson is to assign and record a concrete deliverable to every member early, then check it at each milestone.

## Room for progress, ranked

1. Fix the session secret and password storage — the only blocking issue.
2. Add validation and consistent 4xx errors across the web routes.
3. Clean up the README, `.env.example`, `SECURITY.md` and `package.json`.
4. Commit an automated test suite using Supertest plus an in-memory MongoDB.
5. Align the REST API with the Book domain and add pagination.
6. Harden deployment with TLS, a process manager and a real health check.

The first three are small changes. The point of listing the later ones is to show what "more like a released cloud service" would actually mean, not to suggest the course project should have done them all.
