# README Test Reference

This file maps each testable statement in the `main` branch README to what we actually did. It is the bridge between "what the project claims" and "what the test cases in `../测试执行情况/` check".

## Setup claims

| README statement | Test action | Outcome |
| --- | --- | --- |
| `npm install` installs required packages | Ran it | Pass — 123 packages |
| Copy `.env.example` to `.env`, fill in `MONGODB_URI` | Used environment variables directly | Pass — connection established |
| `npm run seed` creates test users and books | Ran it | Pass — 3 users, 3 books |
| `npm start`, app at `http://localhost:3000` | Ran with `PORT=3111` | Pass — server listened and `/health` returned ok |
| `node_modules` not included, install from `package.json` | Verified dependency list | Pass, but note: `package.json` sets `"main": "index.js"` while the real entry is `server.js` (see leftover defects) |

## Login / logout claims

| README statement | Test action | Outcome |
| --- | --- | --- |
| Seeded account `s0000001 / sz212345` logs in | POST `/auth/login` as JSON | Pass — 200 with user object |
| Session maintained by cookie-session | GET `/auth/me` and `/dashboard` with cookie jar | Pass |
| Wrong credentials show `Invalid username or password` | POST with wrong password | Pass — 401 with that message |
| Dashbaord shows account name | GET `/dashboard` after login | Pass — showed "Zhang San" |
| Logout clears the session | POST `/auth/logout` with cookie write-back | Pass — subsequent `/auth/me` returned 401 |

## Book CRUD page claims

| README statement | Test action | Outcome |
| --- | --- | --- |
| `/books` lists books | GET after login | Pass — 3 seeded books rendered |
| Search by title / author / category / publisher / year | GET `/books/search?type=title&q=...` | Pass for valid input |
| Add a book at `/books/new` | POST `/books` | Pass — redirect and book appeared in list |
| Edit a book | POST `/books/:id/edit` | Pass — change was saved |
| Delete a book | Route exercised through invalid-ID case | See defect list; invalid IDs return 500 |
| Pages require login | GET `/books`, `/books/new`, `/dashboard` without cookie | Pass — all redirected to login with `next` |

## RESTful API claims

| README curl command | Test action | Outcome |
| --- | --- | --- |
| `GET /api/items` | Ran it | Pass — 200 JSON |
| `POST /api/items` with `name` + `completed` | Ran it | Pass — 201, returned `id` |
| `PUT /api/items/6affd809c5180db126` | Ran with a real 24-char ObjectId | Pass — 200 with updated fields |
| `DELETE /api/items/6affd809c5180db126` | Ran with the created item's ID | Pass — 204 |
| API is unauthenticated by design | Called without cookies | Pass — reachable, as documented |

The README's PUT and DELETE examples use the ID `6affd809c5180db126`, which is only 18 characters. A MongoDB ObjectId is 24 hex characters. The calls work once a real ID is substituted, but the command as printed will always return 404. This is recorded as a low-severity documentation defect.

## Things the README implies but the code handles differently

- The README says the `next` query parameter sends a visitor back to the page they wanted after login. The login route reads it, but the login form has no hidden `next` field, so a normal browser login loses it and lands on `/dashboard`.
- The README lists "Complex UI/UX designs or frontend frameworks" and "Authenticated RESTful APIs" under **Scope** as if they were deliverables. The text that follows makes clear they are exclusions. This is confusing wording, not a functional bug.
- `.env.example` still carries a Facebook OAuth block left over from an earlier lecture, although the OAuth routes were deleted from the repository.
