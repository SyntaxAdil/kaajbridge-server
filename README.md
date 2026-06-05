<div align="center">

<img src="https://img.shields.io/badge/KaajBridge-API-4F46E5?style=for-the-badge&logoColor=white" alt="KaajBridge" />

# KaajBridge API

**A modern Job Portal REST API for diploma students**
Built with Node.js · Express.js · MongoDB · Better Auth

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![JWT](https://img.shields.io/badge/JWT-Auth-F59E0B?style=flat-square)](https://jwt.io)

</div>

---

## 📖 Overview

KaajBridge is a role-based job portal API where **Recruiters** can post and manage jobs, and **Seekers** can browse, apply, and save their favorite positions. Designed specifically for diploma-level students entering the job market.

---

## 🔗 Base URL

```
/api
```

---

## 🔐 Authentication & Roles

KaajBridge uses **JWT-based authentication** via Better Auth with two distinct roles:

| Role           | Access                                                 |
| -------------- | ------------------------------------------------------ |
| 👨‍💼 `recruiter` | Post jobs, manage company profile, review applications |
| 👨‍🎓 `seeker`    | Browse jobs, apply, save favorites, track applications |

**Middleware:**

- `authMiddleware` — Verifies the logged-in user via JWT
- `checkRoleMiddleware` — Enforces role-based access control

---

## 💼 Jobs API

| Method   | Endpoint            | Access        | Description                          |
| -------- | ------------------- | ------------- | ------------------------------------ |
| `GET`    | `/jobs`             | Public        | Get all jobs                         |
| `GET`    | `/jobs/latest-jobs` | Public        | Get latest job listings              |
| `GET`    | `/jobs/:id`         | Public / Auth | Get a single job                     |
| `POST`   | `/jobs`             | Recruiter     | Create a new job                     |
| `GET`    | `/jobs/my-jobs`     | Recruiter     | Get all jobs posted by the recruiter |
| `PATCH`  | `/jobs/my-jobs/:id` | Recruiter     | Update a specific job                |
| `DELETE` | `/jobs/my-jobs/:id` | Recruiter     | Delete a specific job                |

---

## 🏢 Company API

| Method   | Endpoint                  | Access        | Description                 |
| -------- | ------------------------- | ------------- | --------------------------- |
| `GET`    | `/company`                | Public        | Get all companies           |
| `GET`    | `/company/top-companies`  | Public        | Get top-rated companies     |
| `GET`    | `/company/:id`            | Public / Auth | Get a single company        |
| `POST`   | `/company`                | Recruiter     | Create a company profile    |
| `GET`    | `/company/my-company`     | Recruiter     | Get the recruiter's company |
| `PATCH`  | `/company/my-company/:id` | Recruiter     | Update company details      |
| `DELETE` | `/company/my-company/:id` | Recruiter     | Delete company profile      |

---

## 📄 Applications API

| Method   | Endpoint                       | Access             | Description                     |
| -------- | ------------------------------ | ------------------ | ------------------------------- |
| `POST`   | `/application`                 | Seeker             | Apply for a job                 |
| `GET`    | `/application/my-applications` | Seeker             | View all my applications        |
| `GET`    | `/application/:id`             | Seeker / Recruiter | Get a single application        |
| `GET`    | `/application/job/:jobId`      | Recruiter          | View all applications for a job |
| `PATCH`  | `/application/:id`             | Recruiter          | Update application status       |
| `DELETE` | `/application/:id`             | Seeker / Recruiter | Delete an application           |

---

## ⭐ Favorites API

| Method  | Endpoint         | Access | Description                 |
| ------- | ---------------- | ------ | --------------------------- |
| `POST`  | `/favorites`     | Seeker | Add a job to favorites      |
| `GET`   | `/favorites`     | Seeker | View all favorite jobs      |
| `PATCH` | `/favorites/:id` | Seeker | Remove a job from favorites |

---

## ⚡ Role Capabilities at a Glance

```
👨‍💼 Recruiter                     👨‍🎓 Seeker
─────────────────────────         ─────────────────────────
✅ Post & manage jobs              ✅ Browse all jobs
✅ Create & update company         ✅ Apply for jobs
✅ View & manage applications      ✅ Save favorite jobs
                                   ✅ Track own applications
```

---

## 🛠 Tech Stack

| Layer          | Technology         |
| -------------- | ------------------ |
| Runtime        | Node.js            |
| Framework      | Express.js         |
| Database       | MongoDB + Mongoose |
| Authentication | Better Auth (JWT)  |

---

<div align="center">

Made with ❤️ for diploma students by a diploma student [Abdur Rahman Adil].

</div>
