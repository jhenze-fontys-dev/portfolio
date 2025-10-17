# 🧩 Controllers

This folder contains the **business logic** for the application.

Each controller defines how the app interacts with data (either JSON or SQLite) and structures the responses returned to routes.

### Files
- **controllerCrudJson.js** – Handles CRUD operations using a JSON file as the data source.
- **controllerCrudSql.js** – Handles CRUD operations using a SQLite database.

### Purpose
Controllers are designed to stay independent from the database implementation. Each can call shared logic, making it easy to switch between JSON or SQL-based storage without rewriting routes.
