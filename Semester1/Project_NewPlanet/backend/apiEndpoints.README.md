# API Endpoints Reference

## 🧩 Purpose
Centralized documentation of all API routes for the Population Register project. This file replaces duplicated endpoint lists in other READMEs.

## 📁 Folder Structure

docs/backend/API_Endpoints.md
└── (Centralized overview of all routes)


## 📄 Main Components

| Entity | Base Route | Example Endpoints |
|---------|-------------|------------------|
| Citizen | `/api/citizens` | GET `/`, GET `/:id`, POST `/`, PUT `/:id`, DELETE `/:id` |
| User | `/api/users` | GET `/`, POST `/login`, PUT `/:id`, DELETE `/:id` |
| Role | `/api/roles` | GET `/`, POST `/`, PUT `/:id`, DELETE `/:id` |
| Event | `/api/events` | GET `/`, POST `/`, PUT `/:id`, DELETE `/:id` |
| Relation | `/api/relations` | GET `/`, POST `/`, PUT `/:id`, DELETE `/:id` |
| GeneticResult | `/api/genetics` | GET `/`, POST `/`, PUT `/:id`, DELETE `/:id` |
| PlanetData | `/api/planet` | GET `/`, PUT `/:id` |
| Report | `/api/reports` | GET `/`, POST `/`, DELETE `/:id` |


## ⚙️ Key Features

- All endpoints follow RESTful conventions.  
- Swagger docs: [http://localhost:3000/api-docs](http://localhost:3000/api-docs).  
- Each route is linked to controller and service logic.  
- Supports pagination, sorting, and filtering via query params.


## 💡 Example Usage
```js

// Example API call (fetch citizens)
fetch('/api/citizens')
  .then(res => res.json())
  .then(console.log);

```

## 🧱 Developer Notes

- Use this as the single source of truth for all endpoints.  
- Other READMEs should only reference this document.  
- Keep routes synchronized with Swagger annotations and schemas.

