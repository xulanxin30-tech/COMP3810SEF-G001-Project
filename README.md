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
We are building a server-side web application for a student library management system.

### ➡️Objectives

- Implement core CRUD operations for book records and borrowing management.
- Develop cookie-session based authentication with Student roles.
- Deploy the application on an Ubuntu virtual machine and provide RESTful APIs.

### ➡️Scope

- User authentication (cookie-session) for Student roles.
- Student features: 重写.
- Unauthenticated RESTful CRUD APIs for books (for curl testing).
- Deployment and demonstration on an Ubuntu virtual machine.
- Complex UI/UX designs or frontend frameworks.
- Authenticated RESTful APIs (only unauthenticated APIs are provided).


### ➡️Business Features Overview:

**Student：**
1. Login and logout
2. see all books list
3. Borrow available books
4. View personal borrowings: display remaining return days, perform renewal
5. Submit a reservation when book stock is unavailable
6. View personal reservation records

## 🧑‍💻Team Members:

| # | Name | Student ID | Github Username | Role | Responsibilities |
|---|---|---|---|---|---|
| 1 | XU Lanxin | 13744757 | [@xulanxin30-tech](https://github.com/xulanxin30-tech) | Team Lead |Scaffolding, routing, session setup, integration, readme,curl test commands |
| 2 | Chi Xuanyi | 13766798 | [@Felix13877](https://github.com/Felix13877) | Developer | Login & sign-up, session, access-control middleware |
| 3 | Cao Fei | 13755803 | [@caofei351-ops](https://github.com/caofei351-ops) | Developer | Examine the code logic, README,Mongoose schemas, seed data |
| 4 | Fong Chun Hung | 14282138 | [@thevincentfong](https://github.com/thevincentfong) | Documentation | local launch check, zip packaging, demo PPT |
| 5 | Aw Chun Yin | 14282568 | [@alvin-afk54](https://github.com/alvin-afk54) | QA | EJS templates, login page, CRUD pages & styling |
| 6 | Wong Ching Fung | 13886514 | [@PW](https://github.com/PW) | Testing | API routes, HTTP methods|



## 🚀Project file intro:

The project is organized by directory layer, browsed top-down in the order **Root → config → middleware → models → routes → views → public**:

```text
COMP3810SEF-G001-Project/
├── server.js          # Startup entry: connect to MongoDB + start the listener
├── app.js             # Express app setup: view engine, sessions, route mounting
├── seeddata.js        # Seed data script (npm run seed)
├── config/            # Configuration layer: DB connection, session settings
├── middleware/        # Middleware layer: auth & access control, error handling
├── models/            # Data layer: Mongoose schemas (User, Book)
├── routes/            # Route layer: pages, auth, RESTful API, OAuth
├── views/             # View layer: EJS templates (grouped by page type)
└── public/            # Static assets: CSS stylesheets
```

### ➡️ Root

| File | Description |
| --- | --- |
| [server.js](https://github.com/xulanxin30-tech/COMP3810SEF-G001-Project/blob/main/server.js) | Startup entry: connects to the MongoDB database, then starts the Express listener (default port 3000). |
| [app.js](https://github.com/xulanxin30-tech/COMP3810SEF-G001-Project/blob/main/app.js) | Express app setup: EJS view engine, static assets, session, global middleware, and mounting of all routers (`/`, `/auth`, `/api`, `/dashboard`, OAuth). |
| [seeddata.js](https://github.com/xulanxin30-tech/COMP3810SEF-G001-Project/blob/main/seeddata.js) | Seed data script: run `npm run seed` to initialize test users and books. |
| [package.json](https://github.com/xulanxin30-tech/COMP3810SEF-G001-Project/blob/main/package.json) | Project metadata and dependencies; provides `start` / `dev` / `seed` scripts. |

<details>
<summary> 📦 dependencies</summary>

- cookie-session: ^2.1.1
- dotenv: ^18.0.9
- ejs: ^7.0.2
- express: ^5.3.0
- express-session: ^1.18.0
- mongoose: ^9.11.3
- passport: ^0.7.0
- passport-facebook: ^3.0.0


</details>

### ➡️[config](https://github.com/xulanxin30-tech/COMP3810SEF-G001-Project/tree/main/config):

Configuration layer: database connection and session settings.

| File | Description |
| --- | --- |
| [db.js](https://github.com/xulanxin30-tech/COMP3810SEF-G001-Project/blob/main/config/db.js) | Connects to MongoDB via Mongoose; the connection string is read from `MONGODB_URI` in `.env` (no secrets committed). |
| [session.js](https://github.com/xulanxin30-tech/COMP3810SEF-G001-Project/blob/main/config/session.js) | cookie-session configuration: 24-hour expiry, httpOnly, sameSite lax. |

### ➡️[middleware](https://github.com/xulanxin30-tech/COMP3810SEF-G001-Project/tree/main/middleware):

Middleware layer: session helpers, access control and error handling.

| File | Description |
| --- | --- |
| [auth.js](https://github.com/xulanxin30-tech/COMP3810SEF-G001-Project/blob/main/middleware/auth.js) | Session helpers and access control: `attachCurrentUser` (exposes the logged-in user to views), `requireAuth` (redirects unauthenticated visitors to login; 401 JSON for API calls), `requireGuest` (keeps logged-in users off the login/sign-up pages). |
| [errorHandler.js](https://github.com/xulanxin30-tech/COMP3810SEF-G001-Project/blob/main/middleware/errorHandler.js) | Unified 404 / 500 handling: JSON responses for `/api` paths, plain HTML otherwise. |

### ➡️[models](https://github.com/xulanxin30-tech/COMP3810SEF-G001-Project/tree/main/models):

Data layer: Mongoose schemas.

| File | Description |
| --- | --- |
| [schema.js](https://github.com/xulanxin30-tech/COMP3810SEF-G001-Project/blob/main/models/schema.js) | Defines two Mongoose models: **User** (username / password / name, with format validation) and **Book** (title / author / category / publisher / publishYear). |

### ➡️[routes](https://github.com/xulanxin30-tech/COMP3810SEF-G001-Project/tree/main/routes):

Route layer. Each router below is mounted in `app.js`.

| File | Description |
| --- | --- |
| [index.js](https://github.com/xulanxin30-tech/COMP3810SEF-G001-Project/blob/main/routes/index.js) | Homepage, `/health` check, and the book web CRUD routes: list / new / edit / delete / search under `/books`. |
| [auth.js](https://github.com/xulanxin30-tech/COMP3810SEF-G001-Project/blob/main/routes/auth.js) | Sign-up, login, logout and `/auth/me` (`who am I`) routes, with input validation. |
| [dashboard.js](https://github.com/xulanxin30-tech/COMP3810SEF-G001-Project/blob/main/routes/dashboard.js) | Protected user dashboard at `/dashboard` (requires login via `requireAuth`). |
| [api.js](https://github.com/xulanxin30-tech/COMP3810SEF-G001-Project/blob/main/routes/api.js) | Unauthenticated RESTful CRUD API for items at `/api/items` (in-memory data, for curl testing). |
| [oauth.js](https://github.com/xulanxin30-tech/COMP3810SEF-G001-Project/blob/main/routes/oauth.js) | Optional Facebook OAuth login (`/auth/facebook/*`); only enabled when `FACEBOOK_APP_ID` / `FACEBOOK_APP_SECRET` are set in `.env`. |

### ➡️[views](https://github.com/xulanxin30-tech/COMP3810SEF-G001-Project/tree/main/views):

View layer: EJS templates, grouped by page type.

| File / Folder | Description |
| --- | --- |
| [home.ejs](https://github.com/xulanxin30-tech/COMP3810SEF-G001-Project/blob/main/views/home.ejs) | Homepage: welcome text, feature list and a button to browse all books. |
| [dashboard.ejs](https://github.com/xulanxin30-tech/COMP3810SEF-G001-Project/blob/main/views/dashboard.ejs) | Logged-in dashboard: welcome message, logout button and link back to homepage. |
| 📂 [auth/](https://github.com/xulanxin30-tech/COMP3810SEF-G001-Project/tree/main/views/auth) | Login and sign-up pages. |
| 📂 [books/](https://github.com/xulanxin30-tech/COMP3810SEF-G001-Project/tree/main/views/books) | Book management pages (list / create / edit / delete / search). |
| 📂 [oauth/](https://github.com/xulanxin30-tech/COMP3810SEF-G001-Project/tree/main/views/oauth) |  The user information page after successful login |
| 📂 [partials/](https://github.com/xulanxin30-tech/COMP3810SEF-G001-Project/tree/main/views/partials) | a dynamic navigation bar and a footer for the library system |
<details>
<summary>📂 auth/ — login & sign-up pages</summary>

- **login.ejs** — Login form (username + password) with error messages on top; shows a Facebook login button only when OAuth is configured; links to the sign-up page.
- **signup.ejs** — Sign-up form (Full Name, Username, Password with format validation), POSTs to `/auth/signup`; links to the login page.

</details>

<details>
<summary>📂 books/ — book management pages</summary>

- **list.ejs** — All-books table (title / author / category / publisher / publish year) with Edit & Delete links, plus "Add New Book" and "Search Books" buttons.
- **create.ejs** — Add-book form: title (required), author (required), category, publisher, publish year (number input).
- **edit.ejs** — Edit-book form, pre-filled with the book's current data.
- **delete.ejs** — Delete confirmation page showing the book's details before removing it.
- **search.ejs** — Search by title / author / category / publisher / publish year; shows the number of matches.

</details>
<details>
<summary>📂 oauth/ — The user information page after successful login</summary>

- **content.ejs** — Show the signed-in user’s profile info (ID and name), provide a logout link for Facebook auth, and a link to return to the regular username/password login page.
</details>
<details>
<summary>📂 partials/ — a dynamic navigation bar and a footer for the library system.
</summary>

- **footer.ejs** — simple footer component for the Library Management System, displaying the system name.
- **navbar.ejs** — shows welcome + logout for logged-in users or login + signup links for guests, alongside home and books navigation entries for the library system.
</details>

### ➡️[public](https://github.com/xulanxin30-tech/COMP3810SEF-G001-Project/tree/main/public):

Static assets (CSS).

<details>
<summary>▫️ style.css</summary>
This is a CSS static file to style a simple book website.


- It makes a top navigation bar with the site name and links.
- It has a white box layout for main page content and login/signup forms.
- It styles input boxes, blue buttons, and a red delete button.
- It makes a table to show books, with links to edit or delete them.
- It adds red warning boxes for login errors, and a Facebook login button.
- It sets hover effects: links and buttons change colour or show underlines when you move your mouse over them.
- It also has a simple footer and dividing lines for the login page.
</details>

<details>
<summary>▫️ auth.css</summary>
This is a CSS file (static file) that makes login, sign-up and user pages look nice.


- It makes a white box in the middle of the screen for the form.
- It styles text boxes, labels and a blue submit button.
- It adds red boxes for error messages and green boxes for tips.
- It has a dividing line and a Facebook login button.
- It also styles links to switch between login and sign up.
</details>



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

This project is a group assignment for COMP3810SEF course for academic evaluation only. All code within this project is for educational purposes. Redistribution, commercial usage is prohibited without group members’ permission. 

We would like to thank the lecturer and tutors of COMP3810SEF for project guidance and providing sample project code. We refer to official documentation of Express.js, Mongoose‑MongoDB and EJS for implementation. Some online technical tutorials are referenced for debugging and problem‑solving. All core functionalities are implemented by our group members.


<!-- 
===========================================================
QUICK EDIT GUIDE
===========================================================
Every line starting with _TODO_ or inside an EDIT ME note is a placeholder.
Click the pencil icon at the top-right of this file on GitHub to edit it in the browser.
Recommended order: Course Information → Team Members → Project Overview → Tech Stack → Timeline.
===========================================================
-->
