# Test Overview

## What this project is

This is the final test pass for the COMP3810SEF Group G001 project. The course is *Server-side Technologies and Cloud Computing*, and the whole group project is built around server-side development: we wrote a Node.js/Express application that runs on a virtual machine and is reached over the network. The README on the `main` branch is the reference for everything we tested here — the setup steps, the routes, the seeded accounts and the curl commands all come from that file.

We kept this test focused on two things the course asks for:

- the server-side code has to do something meaningful (for us, that is student login plus a small library book-management system), and
- the project has to be deployable and demonstrable over HTTP, either on an Ubuntu VM or through a cloud URL, with curl commands ready for the RESTful API.

The PDF project brief (Appendix IV, pages 2-4) says the same thing in different words: build a server-side application with topic-related functionality, and hand in both the project files and a presentation. So the tests in this branch are mainly black-box HTTP checks against the running server, backed by a read-through of the code where a behaviour needed explaining.

## Scope of testing

| Area | Covered | Source of truth |
| --- | --- | --- |
| Setup and seed data | Yes | README "Operation guides" and "Environment Configuration" |
| Login / sign-up / logout / session | Yes | README "Use of Login/Logout pages" |
| Book list, create, edit, delete, search | Yes | README "Use of CRUD web pages" |
| RESTful `/api/items` CRUD | Yes | README "Use of RESTful CRUD pages" curl commands |
| Access control on protected pages | Yes | README Objectives and the `requireAuth` middleware comments |
| Error handling and invalid input | Yes | Derived from the code and normal QA practice |
| Security of session and credentials | Yes | Derived from a code review |
| Performance / load testing | No | Out of scope for a course MVP |
| Browser compatibility matrix | No | Only the README-documented browser was used |

## How the tests were run

We started the app with `npm start` after installing dependencies and seeding MongoDB, then sent requests with curl exactly in the form the README documents. Where a case needed a logged-in session we kept the cookie jar from a successful login. Both JSON requests (with `Accept: application/json`) and normal form posts were exercised, because the routers branch on the request type.

A short note on honesty: the README describes deploying on an Ubuntu VM at `http://<VM-IP>:3000`. For this final test we ran the same stack locally on a Windows host with an in-memory MongoDB standing in for the VM database, on port 3111 to avoid clashes. The application code, dependencies and routes are identical; only the host and the database endpoint changed. Anything that depends on the network layer (status codes, redirects, JSON bodies, cookies) behaves the same way. Details are in `02-Test-Environment.md`.

## What the README promised vs. what we checked

The README lists three seeded accounts (`s0000001`, `s1397832`, `s3780234`) with their passwords, a set of book CRUD pages, and four curl commands for `/api/items`. We checked every one of them. We also checked the access-control claim — the README says the dashboard and book pages are protected for logged-in users — and the API's documented "unauthenticated" behaviour.

The result is mixed. The mainstream flows work: login with a seeded account, viewing the three seeded books, searching by title, adding a book, and all four API calls. The problems show up around the edges — invalid input, malformed object IDs, and the way the session is signed. Those are written up in the other two folders.

## Reading guide

- `02-Test-Environment.md` — hardware, software, database and browser used.
- `03-README-Test-Reference.md` — the exact README items we turned into test cases.
- `../测试执行情况/` — the full case list, defect counts and charts.
- `../缺陷分析与测试结论建议/` — detailed severe defects, leftover issues and the final score.
