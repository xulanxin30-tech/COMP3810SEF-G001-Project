# Test Conclusion and Recommendations

## Overall assessment of the main branch

The main branch is a functional, well-organised course project. Every flow documented in the README worked in our tests: a seeded user can log in, view the three books, search them, add and edit a book, and drive the RESTful API with curl. The directory structure is clean, setup is reproducible, no secrets are committed, and the API router in particular is written with sensible status codes and ID validation.

The weak side is defensive behaviour. When input is exactly what the README describes, the app behaves. When input is slightly wrong — a malformed ID, a stray regex character, a missing title — several routes return 500 with raw error text. Beneath that, the session layer has a design flaw that lets a forged cookie bypass login entirely. A final pass that fixes four defects (D-01 to D-04) would remove every high-severity finding in this report.

## Score: 74 / 100

| Dimension | Weight | Score | Reasoning |
| --- | --- | --- | --- |
| Core functionality | 35 | 30 | All documented happy paths pass; CRUD, search, auth and API work. Lose 5 for 500s on invalid input (D-03, D-04, D-05). |
| Repository introduction and documentation | 25 | 19 | README is detailed, has setup steps, role table, file guide and curl commands. Lose 6 for the scope wording, fake ObjectId, template SECURITY.md and stale OAuth notes. |
| Code organisation and structure | 15 | 13 | Clear config/middleware/models/routes/views/public layering, centralised error handlers, meaningful comments. Lose 2 for inconsistent error handling between web and API routes. |
| Security | 15 | 5 | Plain-text passwords and a forgeable session are serious. No personal secrets committed and cookie flags are mostly correct, which is why this is not lower. |
| Testability and quality assurance | 10 | 7 | Health endpoint, seed script and curl-friendly API make manual testing easy. No automated test suite, so the rest is lost. |
| **Total** | **100** | **74** | A solid MVP with one blocking security issue and a documentation tail. |

The score is intentionally honest rather than generous. If the course marker weights the demo and the written report equally, the functional half is close to full marks; the deductions are concentrated in the parts that are invisible in a five-minute walkthrough.

## Testing conclusion

The project meets the technical brief on pages 2-4 of the project samples: it is a server-side application, its topic is meaningful (student library management), it can run on an Ubuntu VM and be reached over the network, and it ships curl commands for RESTful testing. The two deliverables the PDF asks for — project files and presentation — are both supported by what is in the repository.

The 77.8% pass rate should be read with context. It includes deliberate negative tests that a demo would skip. Setup, access control and all README happy paths passed. The failures are repeatable, small and well understood, and each has a suggested fix in this branch.

## Recommendations, in order

1. **Fix the session secret (D-01).** Remove the fallback key, require `SESSION_SECRET` in the environment, and rotate it. This is the only blocking item.
2. **Hash passwords (D-02).** A bcrypt pre-save hook plus `bcrypt.compare` closes the credential gap without changing the API.
3. **Normalise error handling (D-03, D-04, D-05).** Validate ObjectIds, escape regex input, and convert Mongoose validation errors to 400s. Reuse the pattern already present in `routes/api.js`.
4. **Proofread the written side (D-09 to D-13).** One afternoon of edits makes the repository look as careful as the code actually is.
5. **Add `npm test`.** Supertest with an in-memory MongoDB — the same setup used for this pass — would turn this one-off report into a repeatable check for every future merge.
6. **Align the API with the domain.** Expose `/api/books` backed by the Book model, add pagination, and keep `/api/items` only if the course needs a separate curl sandbox.
7. **Harden the deployment.** Process manager, TLS, and a health check that also reports database connectivity.

## What we learned from the course

Building and then testing this project made several things concrete that lectures only describe. Session cookies are only as safe as the key that signs them — a fallback constant is not a harmless convenience. Validation belongs at the boundary, not just in the database schema, because otherwise bad input becomes a 500. Consistency matters: the team already knew how to validate an ObjectId in the API router, but that knowledge did not travel to the web router until we wrote it down here.

We also learned that a repository is part of the deliverable. A detailed README is an asset, but drift between code and docs quietly costs marks. The high number of small merge commits taught us to review the whole file after a patch, not just the three lines that changed.

Finally, testing by hand found things that reading the code did not. The forged cookie, the regex 500 and the dropped `next` parameter all became obvious only when we sent real requests. That is the main takeaway from this pass: a short, repeatable test run at the end of each milestone would have caught most of these defects weeks earlier.

---

*Prepared for COMP3810SEF Group G001, 2026 Autumn. All tests were run against the `main` branch; this report lives on the `Final-Test-Report` branch so the original project files stay untouched.*
