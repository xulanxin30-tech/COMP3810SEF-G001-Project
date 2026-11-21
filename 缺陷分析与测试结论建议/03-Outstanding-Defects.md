# Outstanding Defects

This file lists every defect that is still open at the end of the final test pass. "Partially fixed" means an earlier commit tried to address it but the shipped state still does not meet the expectation.

| ID | Defect | Severity | Status | First observed | Note |
| --- | --- | --- | --- | --- | --- |
| D-01 | Hardcoded fallback session secret permits cookie forgery | Critical | Open | U-11 | Fallback key still in `config/session.js` |
| D-02 | Passwords stored and compared in plain text | High | Open | Code review, U-11 | Deliberate shortcut noted in source; still unsafe |
| D-03 | Raw regex from search box causes 500 | High | Open | B-11, B-12-adjacent | `q=(` and `q=[` both return 500 |
| D-04 | Invalid ObjectId on book pages returns 500 | High | Open | B-09, B-10 | Four handlers affected |
| D-05 | Book create validation errors surface as 500 | Medium | Open | B-06, B-07 | Missing title and future year both fail |
| D-06 | `next` redirect parameter dropped by login form | Medium | Open | U-09 | Route reads `next`, form never submits it |
| D-07 | `/api/*` DB guard precedes 404 routing | Low | Open | P-10 | Only visible with the database down |
| D-08 | Sign-up password field is `type="text"` | Low | Open | U-10 | `views/auth/signup.ejs` |
| D-09 | `package.json` `"main": "index.js"` has no matching file | Low | Open | Setup check | Actual entry point is `server.js` |
| D-10 | README curl examples use an 18-char fake ObjectId | Low | **Partially fixed** | P-11 | A docs commit claimed to use real IDs; the printed example is still invalid |
| D-11 | SECURITY.md is an untouched GitHub template | Low | Open | Documentation review | Lists versions 5.1.x / 5.0.x that do not exist here |
| D-12 | `.env.example` still documents removed Facebook OAuth | Low | **Partially fixed** | Config review | OAuth routes were deleted, the env block stayed |
| D-13 | README "Scope" section lists exclusions as features | Low | Open | Documentation review | Wording only, no functional impact |

## Defects that were fixed before this test pass

For context, earlier fixes that are confirmed working in our tests:

- `/books` routes now require login (`fix/protect-book-routes`); A-01 to A-03 all redirect correctly.
- Mongoose was bumped past a vulnerable range in the same fix; no issue observed.
- The MongoDB connection string was removed from source (`fix/secret-scanning-mongodb-uri`); `.env.example` has a placeholder only.
- The API router was wired correctly and duplicate broken files removed; P-01 to P-07 pass.
- The seed connection path was repaired and a database-unavailable guard added; S-02 and P-08 pass.
- The logout redirect was corrected; U-08 passes.
- A `max` attribute was added to the publish-year input in the create/edit forms; the client side now blocks future years in a browser. **However** a direct POST still returns 500 (D-05), so this is another partial fix — the UI was patched but the server was not.

## Defects not fixed and unlikely to be fixed within the course

These are the ones we would accept as known limitations for a student submission, with the reason stated:

- **D-09, D-11, D-12, D-13** — documentation/configuration cosmetics. Low risk, but four separate proofreading items that nobody picked up. They should be fixed, and the effort is small, so they are not really "accepted" — they are just still open at the deadline.
- **D-07** — only observable when MongoDB is disconnected, a state the demo will not normally hit. Acceptable for the presentation, easy to fix afterwards.
- **D-06** — the redirect still works, it just always lands on the dashboard. Acceptable for a single-page demo; annoying in real use.

## What should not be accepted

D-01 and D-02 between them mean the authentication layer cannot be trusted. Even in a coursework context, the group should fix these before the final presentation if there is time, because they are the first things an experienced marker will look for in the source. D-03 and D-04 are quick wins too — a few lines each, and they remove all five of the book-page failures in this report.
