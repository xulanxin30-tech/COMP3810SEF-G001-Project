# Defect Distribution and Module Improvement Points

This section looks at the same 13 defects from the angle of *which part of the repository produced them* and what each part needs to improve. It is also the closest thing this report has to a code-quality snapshot.

## Distribution at a glance

| Module | Defects | Quality signal |
| --- | --- | --- |
| Session configuration | 1 | One default secret left in source — a single high-impact mistake |
| Authentication and login views | 3 | Logic mostly right, but credential handling and form details are weak |
| Book CRUD and search | 3 | Happy paths solid, input handling missing |
| API routing | 1 | Middleware order issue only when the database is down |
| Documentation and configuration | 5 | Chronic drift from repeated small patches |

## Authentication and session

`config/session.js` signs cookies with `process.env.SESSION_SECRET || 'dev-fallback-key-min-32-chars-please-change'`. Because the fallback is public in the repository, anyone can mint a valid session cookie. We did exactly that during testing and were treated as logged in. This is the single defect that should block a real deployment.

`routes/auth.js` stores and compares passwords as plain text. The comment in the file says this is to match the shared schema and seed data, which is true, but it is not a defensible choice for any system with real users. `views/auth/signup.ejs` compounds it by using `type="text"` for the password field, so the password is visible on screen as it is typed.

**Improvement points:** hash passwords with bcrypt or argon2 in a schema pre-save hook and compare with a constant-time check; generate a random `SESSION_SECRET` at deploy time and fail to start if it is missing in production; switch the sign-up password input to `type="password"`; keep the friendly validation messages that already work.

## Book CRUD and search

`routes/index.js` is the most substantial router in the project and it shows. Listing, creating, editing and deleting with valid data all worked in our tests. The trouble starts with unexpected input:

- `q=(` in the search box is passed straight into a MongoDB `$regex`, producing a 500 and printing `Regular expression is invalid: missing closing parenthesis`.
- `Book.findById('notanid')` throws a Mongoose CastError that reaches the generic error handler, so `/books/notanid/edit` returns 500 with the raw message in the body.
- A book with a missing title or a year of 2099 fails schema validation, and since the route calls `next(error)` without a status, the result is again a 500.

The REST API router by contrast validates ObjectIds with `mongoose.Types.ObjectId.isValid` and returns clean 404s. The team already knows how to do this — the pattern just was not carried over to the web routes.

**Improvement points:** escape regex metacharacters or use a `$text` index; validate ObjectId before every `findById`; catch `ValidationError` and re-render the form with a 400 and the friendly messages already defined in `routes/auth.js`; add a shared helper so web and API routes behave consistently.

## API layer

`routes/api.js` is the most polished part of the codebase. It checks the database connection state, validates IDs, uses `runValidators: true` on updates, and returns sensible status codes (201, 400, 404, 204). The only defect is the order of the database guard: it is a `router.use`, so it runs even for paths the router does not handle. With the database down, `GET /api/unknown` returns the 503 database message instead of a 404.

**Improvement points:** move the connection check inside the four real route handlers, or add an early explicit 404 before the guard. Also replace the README's placeholder ObjectId with a real 24-character one so the documented curl commands are copy-pasteable.

## Documentation and configuration

Five of the thirteen defects live outside the running code: `package.json` points `main` at a non-existent `index.js`; `SECURITY.md` is the GitHub template with version numbers 5.1.x that this project never had; `.env.example` still talks about Facebook OAuth whose routes were deleted in earlier commits; the README's Scope section reads like a checklist of features but actually lists exclusions; and the curl examples use a fake ID.

These are not dramatic on their own, but together they make the repository look unfinished. Since the README is worth 50% of the deliverable together with the presentation, this is the area with the cheapest return on effort.

**Improvement points:** set `"main": "server.js"`; replace `SECURITY.md` with a short real statement; strip the OAuth block from `.env.example`; rewrite the Scope section as "In scope" / "Out of scope"; regenerate the curl examples from an actual POST response. One careful proofread pass would close all five.

## Overall code quality read

The good: clear directory layering (config → middleware → models → routes → views → public), meaningful comments that name the task each block belongs to, no secrets committed, a health endpoint, centralised 404/500 handlers, and an API that follows REST conventions. For a first server-side course project, the structure is genuinely above the minimum.

The not-so-good: error handling is inconsistent between the API and the web routes; validation happens in the browser and in Mongoose but nowhere in between; the session default is dangerous; and the commit history shows a pattern of many one-line patches merged without a follow-up sweep. The 76 merge commits against 230 total commits suggest the team collaborated heavily but reviewed lightly.

None of this is unusual for a student group working to a deadline. The fixes are small and well-localised — no redesign is needed, just a disciplined pass over input validation, secret handling and the written documentation.
