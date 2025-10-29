# SQL Services

## 🧩 Purpose
Encapsulates all data access logic for Sequelize models, providing CRUD, search, and authentication logic.

## 📁 Folder Structure

backend/data/sql/services/
├── citizen.service.js
├── user.service.js
├── role.service.js
├── event.service.js
├── relation.service.js
├── geneticResult.service.js
├── planetData.service.js
└── report.service.js


## 📄 Main Components

- Each service file manages one model's database operations.  
- **user.service.js** uses Node's crypto module for password hashing (bcrypt removed).  
- Services are accessed via the `dataServiceFactory`.  
- Common methods: `getAll`, `getById`, `create`, `update`, `remove`, `search`.


## ⚙️ Key Features

- Provides clean separation between data logic and controllers.  
- Supports dynamic filters and flexible search queries.  
- Crypto hashing used for secure password storage.  
- Fully JSON-based data return using `.toJSON()`.


## 💡 Example Usage
```js

// Example: Create a new user
await userService.create({ email: 'jack@example.com', password: 'mypassword' });

```

## 🧱 Developer Notes

- Each service handles validation and sanitization.  
- Use `dataServiceFactory` for centralized service access.  
- Password logic replaced with Node crypto hashing.

