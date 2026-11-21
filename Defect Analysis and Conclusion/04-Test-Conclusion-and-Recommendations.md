# Test Conclusion and Recommendations

The project meets the brief in the PDF: it is a server-side application with a real topic, it runs on a VM and is reachable over HTTP, and it ships curl commands for the REST API. All the normal flows in the README passed. The failures came from negative tests we chose to run on purpose. The score below is honest rather than generous.

| Dimension | Weight | Score |
| --- | --- | --- |
| Core functionality | 35 | 30 |
| README and documentation | 25 | 19 |
| Code structure | 15 | 13 |
| Security | 15 | 5 |
| Testability | 10 | 7 |
| Total | 100 | 74 |

Fix the session secret and hash passwords first, then make error handling consistent across the web routes by copying the checks already in routes/api.js. After that, proofread the README, .env.example, SECURITY.md and package.json, and add an `npm test` script with Supertest and an in-memory database so this report can be re-run on every merge. Longer term, the API could move to /api/books with pagination and the VM could get TLS and a real health check.

What we learned is simple. A fallback secret is not harmless, validation belongs at the route and not only in Mongoose, and consistency matters — the group already knew how to check an ObjectId in the API but never carried it over to the web pages. We also learned that a repository is part of the deliverable: a good README loses value when it drifts from the code. Most of all, testing by hand found things that reading the code did not. The forged cookie, the regex 500 and the lost `next` parameter only showed up when we sent real requests, so a short test run at the end of each milestone would have caught them weeks earlier.
