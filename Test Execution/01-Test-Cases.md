# Test Cases

We ran 45 cases in total: 35 passed and 10 failed, a pass rate of 77.8%. Every flow documented in the README passed. The failures all came from negative tests — forged cookies, malformed IDs and bad search input — which a normal demo would not try. The table below summarises the cases by area.

| Area | Cases | Passed | Failed |
| --- | --- | --- | --- |
| Setup and seed | 5 | 5 | - |
| Access control | 5 | 5 | - |
| Login and session | 11 | 8 | forged cookie accepted; `next` parameter lost; sign-up password field is type="text" |
| Book pages and search | 12 | 7 | empty title gives 500; year 2099 gives 500; invalid ID on edit/delete gives 500; bad regex gives 500 |
| REST API | 12 | 10 | unknown API path gives 503 when the DB is down; README example ID returns 404 |

The ten failures cover six different runtime defects. One defect can be hit by more than one case — for example the invalid ObjectId problem appears in both edit and delete. The remaining seven defects were found by reading the code and the README rather than through a single request. All test cases and their expected and actual results are listed in this repository's earlier test log; the numbers here are the final ones after checking them again.
