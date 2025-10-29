# Backend Overview

## 🧩 Purpose
This folder contains the entire backend logic for the New Planet Population Register API. It includes Express server setup, Sequelize models, service logic, routing, and documentation generation.

## 📁 Folder Structure

backend/
├── server.js
├── swagger.js
├── controllers/
├── routes/
├── data/
│   └── sql/
│       ├── models/
│       └── services/
└── docs/
    ├── backend/
    │   ├── schemas/
    │   ├── annotations/
    │   └── API_Endpoints.md


## 📄 Main Components

- **server.js** — Express app setup, database initialization, and route mounting.  
- **swagger.js** — Swagger/OpenAPI configuration and schema loading.  
- **controllers/** — Maps HTTP requests to services.  
- **routes/** — Defines API endpoints.  
- **data/sql/models/** — Sequelize model definitions.  
- **data/sql/services/** — CRUD and business logic.  
- **docs/backend/** — OpenAPI YAML schemas and Swagger annotations.


## ⚙️ Key Features

- Built with **Express**, **Sequelize**, and **SQLite**.  
- Modular folder structure allows scalable development.  
- Live API docs available at `/api-docs`.  
- All endpoints are centralized in `/docs/backend/apiEndpoints.README.md`.


## 💡 Example Usage
```js

// Start the backend server
npm run dev:backend

```

## 🧱 Developer Notes

- Import `global.relations.js` after all models are initialized.  
- Use environment variables from `.env` for database and server config.  
- Swagger UI runs automatically on startup.

