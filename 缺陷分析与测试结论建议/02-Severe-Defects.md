# Severe Defect Details

Four defects are serious enough to describe in full: one critical (D-01) and three high (D-02, D-03, D-04). Each entry gives the reproduction steps, the expected and actual results, the teammate whose area owns the fix, and a concrete suggestion. Ownership is taken from the role table in the main README.

---

## D-01 — Hardcoded fallback session secret permits session forgery (Critical)

**Location:** `config/session.js`, the `keys` array.
**Owner:** XU Lanxin (Team Lead — session setup and integration).

The middleware signs session cookies with `process.env.SESSION_SECRET || 'dev-fallback-key-min-32-chars-please-change'`. The fallback is in a public repository. Anyone who reads the code knows the signing key.

### Reproduction steps

1. Start the server with `SESSION_SECRET` unset, as our test environment did.
2. Base64url-encode a fake session object, for example `{"user":{"username":"s9999999","name":"Forged User"}}`.
3. Sign the string `comp3810_session=<payload>` with keygrip using the fallback key `dev-fallback-key-min-32-chars-please-change`.
4. Send a request with two cookies: `comp3810_session=<payload>` and `comp3810_session.sig=<signature>`.
5. Call `GET /auth/me` and `GET /dashboard` with those cookies.

### Expected result

401 Not logged in, or a redirect to the login page. A cookie signed with a key that is not configured must be rejected.

### Actual result

`GET /auth/me` returned `200 {"user":{"username":"s9999999","name":"Forged User"}}` and the dashboard rendered "Logged in as Forged User". The forged identity passed every downstream check, including `requireAuth` and `requireGuest`.

### Impact

Full authentication bypass. An attacker can impersonate any username without a password, reach every protected book page, and make the application attribute actions to the wrong user. This is the one defect that should be fixed before any deployment.

### Suggested fix

Remove the fallback entirely. At startup, require `SESSION_SECRET` to be present and at least 32 random characters; throw on missing in production. Use a different value per environment, store it outside the repository, and document rotation. Keep `httpOnly`, `sameSite: lax` and `secure` in production as they are.

---

## D-02 — Passwords stored and compared as plain text (High)

**Location:** `models/schema.js` (User schema), `routes/auth.js` (sign-up and login), `seeddata.js`.
**Owner:** Chi Xuanyi (login and sign-up) and Cao Fei (Mongoose schemas and seed data).

### Reproduction steps

1. Run `npm run seed`, or sign up a new account through `/auth/signup`.
2. Read the `users` collection directly, or inspect the schema and the `user.save()` call in `routes/auth.js`.
3. Observe the password field holding the literal string, for example `sz212345`.
4. Note that login compares `user.password === password` in `routes/auth.js`.

### Expected result

The database stores a salted hash. Login verifies the submitted password against that hash using a constant-time comparison. Neither the application logs nor the database exposes the original password.

### Actual result

Passwords are stored verbatim and compared with `===`. The source comment explains this was done to match the shared schema and seeded accounts, so it is a deliberate shortcut rather than an accident — but the consequence is that any database read leaks every user's credentials.

### Impact

A single database disclosure compromises all accounts, and password reuse extends the damage to other systems. It also fails the basic expectation users have of a login form.

### Suggested fix

Add a `pre('save')` hook on the User schema to hash the password with bcrypt (cost factor 10 or higher). Change login to `bcrypt.compare`. Update `seeddata.js` to store hashes, or let the schema hook do it on `save()`. Add a one-off migration for any existing plain-text records. Combine with D-01 for a meaningful security baseline.

---

## D-03 — Raw regex from the search box returns 500 (High)

**Location:** `routes/index.js`, `GET /books/search`.
**Owner:** XU Lanxin (Team Lead — routing).

### Reproduction steps

1. Log in and open `/books/search`.
2. Set search type to `title` and enter `(` as the keyword, or request `/books/search?type=title&q=%28` directly.
3. Observe the response.

### Expected result

A 400 with a message such as "Invalid search pattern", or an empty result set. The user should never see a server error from typing a character.

### Actual result

HTTP 500 with the body `Regular expression is invalid: missing closing parenthesis`. The same happens with `[` and other unmatched metacharacters. The value of `q` is interpolated directly into `{ $regex: searchText, $options: 'i' }`.

### Impact

Any logged-in user can trigger a 500 at will. More seriously, unescaped user-controlled regex opens the door to catastrophic backtracking (ReDoS): a crafted pattern over a large book collection can hold the Node.js event loop and degrade the whole service.

### Suggested fix

Escape regex metacharacters before building the query (for example with `escape-string-regexp`), cap the keyword length, and wrap the query in a try/catch that returns 400 for invalid patterns. Better still, use a MongoDB text index with `$text` for full-text search, which avoids regex entirely.

---

## D-04 — Invalid ObjectId on book pages returns 500 with a raw error (High)

**Location:** `routes/index.js`, `GET /books/:id/edit`, `POST /books/:id/edit`, `GET /books/:id/delete`, `POST /books/:id/delete`.
**Owner:** XU Lanxin (Team Lead — routing).

### Reproduction steps

1. Log in.
2. Request `GET /books/notanid/edit`.
3. Observe the response. Repeat with `POST /books/notanid/delete`.

### Expected result

404 Not Found, matching the behaviour of `PUT /api/items/badid` in the API router.

### Actual result

HTTP 500 and the body `Cast to ObjectId failed for value "notanid" (type string) at path "_id" for model "Book"`. The Mongoose CastError is passed to `next(error)` and the generic handler renders it directly because `NODE_ENV` is not production.

### Impact

Two problems at once. Bad URLs look like server crashes to the user, and in development the raw error message leaks internal model and field names. In production the message would be replaced by "Something went wrong", but the 500 status would remain and the underlying issue would still be logged as a server fault.

### Suggested fix

Call `mongoose.Types.ObjectId.isValid(req.params.id)` at the start of each of the four handlers and return 404 before querying — the same guard already used in `routes/api.js`. Add a router-level `router.param('id', ...)` so the check is written once. In the generic error handler, map `CastError` to 404 rather than 500.
