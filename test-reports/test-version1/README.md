# Test 1 — Basic Integration Testing (test-version1)

> **COMP3810SEF-G001-Project** Student-Library Book Management System — first round of testing
> **Date**: 18 Nov 2026 | **Code under test**: `main` @ `2319dee` | **Database**: MongoDB Atlas (cloud)

## What's in this folder

| File | Contents |
| --- | --- |
| [01-test-report.md](./01-test-report.md) | **Test report**: 42 cases and results, issue list (P1–P3), theme-compliance check (focus 1), cloud features and user cases (focus 2), and what Test 2 should cover |
| [02-code-quality-report.md](./02-code-quality-report.md) | **Code quality report**: scoring across six dimensions, what's good, P1–P3 issues, style consistency check, and a suggested order of fixes |
| [03-frontend-backend-integration-report.md](./03-frontend-backend-integration-report.md) | **Frontend–backend integration report**: all 42 cases in groups A–E with raw responses, the integration chain, and reproduction steps |

## The short version

The core flows — authentication, book CRUD, the RESTful API, and the Atlas cloud database connection — all work. Two serious issues need fixing: **book writes have no login protection**, and **seeddata.js is broken**. Borrowing, renewal, returns, reservations and the Admin role haven't been built yet (2 of the 6 student features are done), and those go into the **Test 2** scope.

## Numbers

| Group | Scope | Passed / total |
| --- | --- | --- |
| A | Pages while logged out | 11/12 |
| B | Sign-up / login / session / logout | 7/7 |
| C | Book CRUD pages + input validation | 11/12 |
| D | RESTful API (curl straight from the Operation Guide) | 8/8 |
| E | Access control and security | 1/3 |
| **Total** | | **38/42 (90.5%)** |
