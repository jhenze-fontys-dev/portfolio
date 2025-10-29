# Routes

## 🧩 Purpose
Defines all Express route mappings for the API endpoints.

## 📁 Folder Structure

backend/routes/
├── citizen.routes.js
├── user.routes.js
├── role.routes.js
├── event.routes.js
├── relation.routes.js
├── geneticResult.routes.js
├── planetData.routes.js
└── report.routes.js


## 📄 Main Components

- Each route file connects controller methods to Express routes.  
- Example: `/api/citizens` → `citizen.controller.js`.  
- Imported and mounted in `server.js`.  
- Supports RESTful operations (GET, POST, PUT, DELETE).


## ⚙️ Key Features

- Clear separation between routing and logic.  
- Routes automatically included in Swagger via annotations.  
- Uses `express.Router()` for modularity.  
- References centralized endpoint documentation.


## 💡 Example Usage
```js

// Example route
router.get('/', citizenController.getAllCitizens);
router.post('/', citizenController.createCitizen);

```

## 🧱 Developer Notes

- Do not define logic inside route files.  
- Always link controllers via import.  
- See `/docs/backend/apiEndpoints.README.md` for the full endpoint list.

