# COMP3810SEF-G001-Project
> A server-side web application for COMP3810SEF (Server-side Technologies And Cloud Computing), Group G001. Built with Node.js + Express + EJS + Mongoose scaffold to deliver a Student-Library Book Management System MVP.
> 
![Status](https://img.shields.io/badge/status-in%20progress-yellow)
![Course](https://img.shields.io/badge/course-COMP3810SEF-blue)

---

## Course Information

| Field | Value |
| --- | --- |
| Course Code | COMP3810SEF |
| Course Name | Server-side Technologies And Cloud Computing |
| Group | G001 |
| Academic Term | 2026 Autumn |
| Instructor |Dr. LIU Alin Yalin  |


---

## Project Overview
We are building a server-side web application for a student library book management system using Express.js, MongoDB, and EJS. It matters because it demonstrates practical server-side technologies, authentication, and RESTful API design. The system is designed for university students (as borrowers) and librarians (as administrators).

### Objectives

- [ ] Implement core CRUD operations for book records and borrowing management.
- [ ] Develop cookie-session based authentication with Admin and Student roles.
- [ ] Deploy the application on an Ubuntu virtual machine and provide RESTful APIs.

### Scope

**In scope**
- User authentication (cookie-session) for Admin (Librarian) and Student roles.
- Admin features: Book CRUD operations, viewing borrowing records, processing returns.
- Student features: Browsing books, borrowing, returning/renewing, and reserving out-of-stock books.
- Unauthenticated RESTful CRUD APIs for books (for curl testing).
- Deployment and demonstration on an Ubuntu virtual machine.

**Out of scope**
- Complex UI/UX designs or frontend frameworks (e.g., React/Vue).
- Advanced library features like fines/payments or automated email notifications.
- Authenticated RESTful APIs (only unauthenticated APIs are provided).
- Native mobile application development.

---

## 🧑‍💻 Team Members

| # | Name | Student ID | Role | Responsibilities |
| --- | --- | --- | --- | --- |
| 1 | XU Lanxin | 13744757 | Team Lead | Scaffolding, routing, session setup, integration |
| 2 | Chi Xuanyi | 13766798 | Developer | Login & sign-up, session, access-control middleware |
| 3 | Cao Fei | 13755803 | Developer | Mongoose schemas, seed data |
| 4 | Fong Chun Hung | 14282138 | Documentation | README, local launch check, zip packaging, demo PPT |
| 5 | Aw Chun Yin / Wong Ching Fung | 14282568 / 13886514 | QA / Testing | EJS templates, login page, CRUD pages & styling; API routes, HTTP methods, curl test commands |

---

## Tech Stack

| Layer | Choice |
| --- | --- |
| Programming Language | JavaScript (Node.js) |
| Framework / Libraries | Express, EJS, Mongoose |
| Database | MongoDB |
| Version Control | Git + GitHub |
| Project Management | GitHub Projects |
| Communication | WhatsApp |

---

## Repository Structure

```
COMP3810SEF-G001-Project/
├── docs/               # Requirements, design docs, meeting minutes, final report
├── src/                # Source code
├── tests/              # Test cases and test scripts
├── assets/             # Images, diagrams, screenshots
└── README.md           # This file
```

---

## Business Features Overview

### 👨‍🏫 Admin (Librarian)
1. Login and logout
2. Book CRUD: Add new books, modify book info, delete book records
3. View all student borrowing records
4. Process student book returns (update Borrow record status to returned, restore available book stock)

### 👨‍🎓 Student
1. Login and logout
2. Browse all books list
3. Borrow available books
4. View personal borrowings: display remaining return days, perform renewal
5. Submit a reservation when book stock is unavailable
6. View personal reservation records

---

## Development Workflow

1. Create a feature branch from `main` — naming convention: `feature/<short-name>`
2. Commit with clear messages, e.g. `feat: add login validation`
3. Open a Pull Request and request at least one teammate as reviewer
4. Merge into `main` only after review approval

### Branch Naming Convention

| Type | Pattern | Example |
| --- | --- | --- |
| Feature | `feature/<name>` | `feature/login-page` |
| Bug fix | `fix/<name>` | `fix/session-timeout` |
| Documentation | `docs/<name>` | `docs/update-readme` |

---


---

## License

This project is a group assignment for COMP3810SEF course for academic evaluation only.
All code within this project is for educational purposes. Redistribution, commercial usage is prohibited without group members’ permission.

---

## Acknowledgements

We would like to thank the lecturer and tutors of COMP3810SEF for project guidance and providing sample project code.
We refer to official documentation of Express.js, Mongoose‑MongoDB and EJS for implementation.
Some online technical tutorials are referenced for debugging and problem‑solving.
All core functionalities are implemented by our group members.

---

<!-- 
===========================================================
QUICK EDIT GUIDE
===========================================================
Every line starting with _TODO_ or inside an EDIT ME note is a placeholder.
Click the pencil icon at the top-right of this file on GitHub to edit it in the browser.
Recommended order: Course Information → Team Members → Project Overview → Tech Stack → Timeline.
===========================================================
-->
## API Testing (T26)
# GET all items
curl http://localhost:3000/api/items
# POST create a new item
curl -X POST http://localhost:3000/api/items -H "Content-Type: application/json" -d '{"name":"New Task","completed":false}'
# PUT update item with id=1
curl -X PUT http://localhost:3000/api/items/1 -H "Content-Type: application/json" -d '{"name":"Updated Task","completed":true}'
# DELETE item with id=1
curl -X DELETE http://localhost:3000/api/items/1
