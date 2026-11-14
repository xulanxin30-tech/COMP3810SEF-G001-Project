# COMP3810SEF-G001-Project
> A server-side web application for COMP3810SEF (Server-side Technologies And Cloud Computing), Group G001. Built with Node.js + Express + EJS + Mongoose scaffold to deliver a Student-Library Book Management System MVP.
> 
![Status](https://img.shields.io/badge/status-in%20progress-yellow)
![Course](https://img.shields.io/badge/course-COMP3810SEF-blue)



## Course Information:

| Field | Value |
| --- | --- |
| Course Code | COMP3810SEF |
| Course Name | Server-side Technologies And Cloud Computing |
| Group | G001 |
| Academic Term | 2026 Autumn |
| Instructor |Dr. LIU Alin Yalin  |


## 👁️‍🗨️Project Overview:
We are building a server-side web application for a student library book management system using Express.js, MongoDB, and EJS. It matters because it demonstrates practical server-side technologies, authentication, and RESTful API design. The system is designed for university students (as borrowers) and librarians (as administrators).

### ➡️Objectives

- Implement core CRUD operations for book records and borrowing management.
- Develop cookie-session based authentication with Admin and Student roles.
- Deploy the application on an Ubuntu virtual machine and provide RESTful APIs.

### ➡️Scope

**In scope:**
- User authentication (cookie-session) for Student roles.
- Admin features: Book CRUD operations, viewing borrowing records, processing returns.
- Student features: Browsing books, borrowing, returning/renewing, and reserving out-of-stock books.
- Unauthenticated RESTful CRUD APIs for books (for curl testing).
- Deployment and demonstration on an Ubuntu virtual machine.

**Out of scope:**
- Complex UI/UX designs or frontend frameworks (e.g., React/Vue).
- Advanced library features like fines/payments or automated email notifications.
- Authenticated RESTful APIs (only unauthenticated APIs are provided).
- Native mobile application development.

### ➡️Business Features Overview:

**Student：**
1. Login and logout
2. Browse all books list
3. Borrow available books
4. View personal borrowings: display remaining return days, perform renewal
5. Submit a reservation when book stock is unavailable
6. View personal reservation records

## 🧑‍💻Team Members:

| # | Name | Student ID | Github Username | Role | Responsibilities |
|---|---|---|---|---|---|
| 1 | XU Lanxin | 13744757 | [@xulanxin30-tech](https://github.com/xulanxin30-tech) | Team Lead | Scaffolding, routing, session setup, integration |
| 2 | Chi Xuanyi | 13766798 | [@Felix13877](https://github.com/Felix13877) | Developer | Login & sign-up, session, access-control middleware |
| 3 | Cao Fei | 13755803 | [@caofei351-ops](https://github.com/caofei351-ops) | Developer | README,Mongoose schemas, seed data |
| 4 | Fong Chun Hung | 14282138 | [@thevincentfong](https://github.com/thevincentfong) | Documentation | local launch check, zip packaging, demo PPT |
| 5 | Aw Chun Yin | 14282568 | [@alvin-afk54](https://github.com/alvin-afk54) | QA | EJS templates, login page, CRUD pages & styling |
| 6 | Wong Ching Fung | 13886514 | [@PW](https://github.com/PW) | Testing | API routes, HTTP methods, curl test commands❔|



## 🚀Project file intro:
### ➡️(click here to ckeck file)[server.js](https://github.com/xulanxin30-tech/COMP3810SEF-G001-Project/blob/main/server.js):


### ➡️(click here to ckeck file)[package.json](https://github.com/xulanxin30-tech/COMP3810SEF-G001-Project/blob/main/package.json):


### ➡️(click here to ckeck file)[public](https://github.com/xulanxin30-tech/COMP3810SEF-G001-Project/tree/main/public):


### ➡️(click here to ckeck file)[views](https://github.com/xulanxin30-tech/COMP3810SEF-G001-Project/tree/main/views):


### ➡️(click here to ckeck file)[models](https://github.com/xulanxin30-tech/COMP3810SEF-G001-Project/tree/main/models):
This models file defines two Mongoose schemas and models: User (for user accounts) and Book (for book records)



## 🧪Operation guides:
### ➡️Use of Login/Logout pages:
### ➡️Use of CRUD web pages:
### ➡️Use of RESTful CRUD pages:
| Operation | CRUD | HTTP Method | URI | CURL Command |
| ---- | ---- | ---- | ---- | ---- |
| Get all items | Read | GET | `http://localhost:3000/api/items` | ```curl http://localhost:3000/api/items``` |
| Create new item | Create | POST | `http://localhost:3000/api/items` | ```curl -X POST http://localhost:3000/api/items -H "Content-Type: application/json" -d '{"name":"New Task","completed":false}'``` |
| Update item (id=1) | Update | PUT | `http://localhost:3000/api/items/1` | ```curl -X PUT http://localhost:3000/api/items/1 -H "Content-Type: application/json" -d '{"name":"Updated Task","completed":true}'``` |
| Delete item (id=1) | Delete | DELETE | `http://localhost:3000/api/items/1` | ```curl -X DELETE http://localhost:3000/api/items/1``` |


## 💙Acknowledgements

This project is a group assignment for COMP3810SEF course for academic evaluation only.All code within this project is for educational purposes. Redistribution, commercial usage is prohibited without group members’ permission.We would like to thank the lecturer and tutors of COMP3810SEF for project guidance and providing sample project code. We refer to official documentation of Express.js, Mongoose‑MongoDB and EJS for implementation. Some online technical tutorials are referenced for debugging and problem‑solving. All core functionalities are implemented by our group members.


<!-- 
===========================================================
QUICK EDIT GUIDE
===========================================================
Every line starting with _TODO_ or inside an EDIT ME note is a placeholder.
Click the pencil icon at the top-right of this file on GitHub to edit it in the browser.
Recommended order: Course Information → Team Members → Project Overview → Tech Stack → Timeline.
===========================================================
-->
