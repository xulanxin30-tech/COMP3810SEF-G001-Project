# Test Case Execution Record

All cases below were executed against the running server described in `../测试概述与测试环境/02-Test-Environment.md`. "Pass" means the observed response matched the README or the expected behaviour; "Fail" means a real defect was reproduced.

## A. Environment and setup (5 cases)

| ID | Case | Expected | Actual | Result |
| --- | --- | --- | --- | --- |
| S-01 | `npm install` | Dependencies install | 123 packages added | Pass |
| S-02 | `npm run seed` | 3 users + 3 books inserted | All six documents saved, collections cleared first | Pass |
| S-03 | Server start with `PORT=3111` | Listener starts | `Server running at http://localhost:3111` | Pass |
| S-04 | `GET /health` | 200 JSON ok | `{"status":"ok"}` | Pass |
| S-05 | `GET /api/items` (empty DB) | 200 JSON array | `[]` | Pass |

## B. Access control (5 cases)

| ID | Case | Expected | Actual | Result |
| --- | --- | --- | --- | --- |
| A-01 | `GET /books` without cookie | 302 to login | `/auth/login?next=%2Fbooks` | Pass |
| A-02 | `GET /books/new` without cookie | 302 to login | Redirect with `next=%2Fbooks%2Fnew` | Pass |
| A-03 | `GET /dashboard` without cookie | 302 to login | Redirect with `next=%2Fdashboard` | Pass |
| A-04 | `GET /auth/me` without cookie | 401 | `{"error":"Not logged in"}` | Pass |
| A-05 | `GET /auth/login` while logged in | 302 to dashboard | Redirect to `/dashboard` | Pass |

## C. Authentication and session (11 cases)

| ID | Case | Expected | Actual | Result |
| --- | --- | --- | --- | --- |
| U-01 | Login with `s0000001 / sz212345` (JSON) | 200 + user object | 200 `{"user":{"username":"s0000001","name":"Zhang San"}}` | Pass |
| U-02 | Wrong password (JSON) | 401 | `Invalid username or password.` | Pass |
| U-03 | `/auth/me` after login | 200 + user | Correct user returned | Pass |
| U-04 | `/dashboard` after login | 200, shows name | "Logged in as Zhang San" | Pass |
| U-05 | Duplicate sign-up | 409 | `This username is already taken.` | Pass |
| U-06 | Sign-up with 3-char username | 400, friendly message | Exactly-8-characters message | Pass |
| U-07 | Sign-up with valid new account | 201 + session | `s9999999` created and logged in | Pass |
| U-08 | POST logout with cookie write-back | Session cleared | `/auth/me` then returned 401 | Pass |
| U-09 | `GET /auth/login?next=/books` then submit form | Return to `/books` | Form has no hidden `next` field; redirect is lost | **Fail (D-06)** |
| U-10 | Sign-up password input type | `type="password"` | `type="text"` in `signup.ejs` | **Fail (D-08)** |
| U-11 | Forged session cookie using the fallback secret | 401 (forgery rejected) | 200 `/auth/me`, dashboard showed "Forged User" | **Fail (D-01, critical)** |

## D. Book web CRUD and search (12 cases)

| ID | Case | Expected | Actual | Result |
| --- | --- | --- | --- | --- |
| B-01 | `GET /books` after login | 3 books listed | 3 seeded titles rendered | Pass |
| B-02 | Search `type=title&q=networks. 2` | 1 match | `Found 1 book(s).` | Pass |
| B-03 | Search `type=bogus` | 400 | `Invalid search type` | Pass |
| B-04 | Search `publishYear=abc` | 400 | `Please enter a valid year` | Pass |
| B-05 | Create a valid book | 302 + appears in list | Redirected, list grew to 4 rows | Pass |
| B-06 | Create with empty title | 400 friendly error | **500** raw Mongoose error | **Fail (D-05)** |
| B-07 | Create with year 2099 | 400 validation message | **500** raw error | **Fail (D-05)** |
| B-08 | Edit an existing book | 302 + saved | "Edited Book" appeared in list | Pass |
| B-09 | `GET /books/notanid/edit` | 404 | **500** `Cast to ObjectId failed...` | **Fail (D-04)** |
| B-10 | `POST /books/notanid/delete` | 404 | **500** | **Fail (D-04)** |
| B-11 | Search `q=` with `(` | 400 or empty result | **500** `Regular expression is invalid` | **Fail (D-03)** |
| B-12 | Search with `<script>` payload | Escaped output | Rendered as `&lt;script&gt;` | Pass |

## E. RESTful API (12 cases)

| ID | Case | Expected | Actual | Result |
| --- | --- | --- | --- | --- |
| P-01 | `GET /api/items` | 200 | `[]` then populated after create | Pass |
| P-02 | `POST /api/items` | 201 + `id` | 201, real 24-char ObjectId | Pass |
| P-03 | `PUT /api/items/:id` | 200 updated | Name and `completed` updated, timestamps changed | Pass |
| P-04 | `POST /api/items` without `name` | 400 | `{"error":"Name is required"}` | Pass |
| P-05 | `PUT /api/items/badid` | 404 | `{"error":"Item not found"}` | Pass |
| P-06 | `DELETE /api/items/:id` | 204 | 204 empty body | Pass |
| P-07 | `DELETE` a well-formed but missing ID | 404 | `{"error":"Item not found"}` | Pass |
| P-08 | `GET /api/items` with DB disconnected | 503 clear message | 503 with setup hint | Pass |
| P-09 | `GET /api/unknown` with DB connected | 404 | `{"error":"Not found"}` | Pass |
| P-10 | `GET /api/unknown` with DB disconnected | 404 | **503** DB error instead | **Fail (D-07)** |
| P-11 | README's 18-char example ID in PUT | 200 or 404 | 404 (cannot ever match a real item) | **Fail (D-10)** |
| P-12 | API reachable without session | 200 | Reachable, as documented | Pass |

## Summary

- Total cases: **45**
- Passed: **35**
- Failed: **10** (covering 6 of the 13 defects; the other 7 came from code/documentation review)
- Pass rate: **77.8%**

Note on the numbers: ten cases failed, but they map to only six distinct runtime defects because some defects were reproduced by more than one case (D-04 by B-09 and B-10, D-05 by B-06 and B-07). The remaining seven defects — plain-text passwords, the package metadata, and the documentation items — were found by reading the source and the README rather than by a single HTTP request.
