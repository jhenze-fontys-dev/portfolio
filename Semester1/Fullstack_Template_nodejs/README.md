# 🌟 Fullstack Template

A scalable **Node.js + Express + SQLite** template designed to quickly start and structure fullstack CRUD-based websites.

This template provides a clean, modular foundation that supports rapid development while remaining flexible enough for future scaling — from small prototypes to data-driven applications.

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/Fullstack_Template.git
cd Fullstack_Template
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Server
```bash
npm start
```
The app runs by default at: [http://localhost:3000](http://localhost:3000)

---

## 🧠 Project Overview

| Folder | Description |
|---------|--------------|
| **controllers/** | Business logic for handling CRUD operations (JSON + SQLite). |
| **data/** | Application data and database files. |
| **middleware/** | Centralized Express middleware (errors, logging, etc.). |
| **public/** | Static frontend assets (CSS, JS, images). |
| **routes/** | API endpoints routing logic. |
| **views/** | Templated frontend pages (EJS or similar). |
| **docs/** | Developer and API documentation (OpenAPI, JSDoc). |

---

## 🧩 Features

- Modular CRUD architecture (auto-extensible)
- Ready for JSON and SQLite data storage
- Organized by MVC principles
- Auto-generated Swagger (OpenAPI) documentation
- Production-ready middleware for errors and logging

---

## 🧭 Documentation

The `/docs` directory contains complete technical documentation:
- **/docs/backend** – backend API specs, architecture, and setup
- **/docs/frontend** – frontend integration and UI logic
- **/docs/system-overview.md** – fullstack architecture summary

To view API documentation:
```
http://localhost:3000/api-docs
```

---

## ⚙️ Environment

Create a `.env` file in the root directory with your configuration:
```bash
PORT=3000
DATA_SOURCE=json   # or sqlite
```

---

## 🧰 Tech Stack

- **Backend:** Node.js, Express
- **Database:** SQLite (default), JSON (simple mode)
- **Templating:** EJS
- **Docs:** Swagger UI + JSDoc-style annotations

---

## 🧱 Project Goals

This template serves as a foundation for scalable, documented fullstack websites.  
Use it as a starting point for new projects — just plug in your models, update routes, and you’re ready to build.
