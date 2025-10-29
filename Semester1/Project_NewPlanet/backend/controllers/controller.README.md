# Controllers

## 🧩 Purpose
Controllers bridge HTTP requests with the data service layer. Each controller validates input and handles responses.

## 📁 Folder Structure

backend/controllers/
├── citizen.controller.js
├── user.controller.js
├── role.controller.js
├── event.controller.js
├── relation.controller.js
├── geneticResult.controller.js
├── planetData.controller.js
└── report.controller.js


## 📄 Main Components

- Each controller imports its corresponding service (e.g., `citizenService`).  
- Follows consistent CRUD naming (getAll, getById, create, update, remove).  
- Handles HTTP responses, errors, and validation.  
- Linked to Express routes in `/backend/routes/`.


## ⚙️ Key Features

- Minimal logic: delegates all heavy work to services.  
- Implements clean HTTP 200/400/404/500 responses.  
- JSON-only output for consistency with Swagger.  
- Uses centralized error handling middleware.


## 💡 Example Usage
```js

// Example controller
export const getAllCitizens = async (req, res, next) => {
  try {
    const citizens = await citizenService.getAll(true);
    res.json(citizens);
  } catch (err) { next(err); }
};

```

## 🧱 Developer Notes

- Always use async/await with try/catch.  
- Do not access Sequelize directly in controllers.  
- Endpoints are documented in `/docs/backend/apiEndpoints.README.md`.

