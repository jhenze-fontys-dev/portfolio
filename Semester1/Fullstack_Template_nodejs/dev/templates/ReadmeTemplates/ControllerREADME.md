# 🧩 Controllers Overview

This document provides an overview of all **controllers** used in the **Population Register** project.  
Each controller connects **HTTP endpoints** to the appropriate **Sequelize service**, managing request validation, responses, and error handling.

---

## ⚙️ Controller Structure

Every controller follows a consistent structure:

| Section | Description |
|----------|--------------|
| `getAll` | Fetch all records from a model. |
| `getById` | Fetch one record by ID. |
| `create` | Insert a new record. |
| `update` | Modify an existing record by ID. |
| `remove` | Delete a record by ID. |
| `search` | Query with filters, pagination, and sorting. |
| `custom` | Specialized endpoints (e.g., Family Tree, Genetic Check). |

Each controller imports:
```js
import { dataService } from '../data/dataServiceFactory.js';
import { createError } from '../middleware/errorResponse.js';
```

This allows dynamic resolution of the correct SQL/JSON service based on environment configuration.

---

## 👥 Citizen Controller

**File:** `citizen.controller.js`  
Manages CRUD operations, search, and family tree logic for citizens.

### Responsibilities
- Handle `/api/citizens` endpoints.
- Manage citizen creation, updates, and deletions.
- Support search and filtering.
- Provide endpoints for family tree and data visualization.

### Example Routes
| Method | Endpoint | Description |
|--------|-----------|-------------|
| `GET` | `/api/citizens` | List all citizens |
| `GET` | `/api/citizens/:id` | Get a specific citizen |
| `POST` | `/api/citizens` | Add a new citizen |
| `PATCH` | `/api/citizens/:id` | Update an existing citizen |
| `DELETE` | `/api/citizens/:id` | Delete a citizen |
| `GET` | `/api/citizens/search` | Search citizens by query parameters |
| `GET` | `/api/family/tree?citizenId=me` | Get full family tree for a citizen |
| `GET` | `/api/family/tree/data` | Retrieve structured nodes and edges for visualization |

---

## 👤 User Controller

**File:** `user.controller.js`  
Handles user account creation, authentication, and management.

### Responsibilities
- Manage `/api/users` and `/api/auth` routes.
- Use bcrypt for password validation.
- Return JWT tokens or session data (if implemented).

### Example Routes
| Method | Endpoint | Description |
|--------|-----------|-------------|
| `POST` | `/api/auth/login` | Authenticate user and return token |
| `GET` | `/api/users` | List all users |
| `PATCH` | `/api/users/:id/role` | Update user role |
| `DELETE` | `/api/users/:id` | Delete user account |

---

## 🧾 Role Controller

**File:** `role.controller.js`  
Manages user roles and system permissions.

### Example Routes
| Method | Endpoint | Description |
|--------|-----------|-------------|
| `GET` | `/api/roles` | List all roles |
| `POST` | `/api/roles` | Create a new role |
| `PATCH` | `/api/roles/:id` | Update role |
| `DELETE` | `/api/roles/:id` | Remove role |

---

## 🗓️ Event Controller

**File:** `event.controller.js`  
Handles CRUD operations for birth, marriage, and death events.

### Example Routes
| Method | Endpoint | Description |
|--------|-----------|-------------|
| `GET` | `/api/events` | List all events |
| `POST` | `/api/events/birth` | Register a birth |
| `POST` | `/api/events/marriage` | Register a marriage |
| `POST` | `/api/events/death` | Register a death |
| `PATCH` | `/api/events/:id` | Update event data |
| `DELETE` | `/api/events/:id` | Delete event |

---

## 🔗 Relation Controller

**File:** `relation.controller.js`  
Manages family and relationship links between citizens.

### Example Routes
| Method | Endpoint | Description |
|--------|-----------|-------------|
| `GET` | `/api/relations` | List all relations |
| `POST` | `/api/relations` | Create a new relation |
| `PATCH` | `/api/relations/:id` | Update relation |
| `DELETE` | `/api/relations/:id` | Delete relation |

---

## 🧬 GeneticResult Controller

**File:** `geneticResult.controller.js`  
Provides endpoints for calculating and viewing inbreeding coefficients.

### Example Routes
| Method | Endpoint | Description |
|--------|-----------|-------------|
| `GET` | `/api/genetics/results` | List all genetic results |
| `POST` | `/api/genetics/calculate` | Compute a new inbreeding coefficient |
| `GET` | `/api/genetics/check?partnerId={id}` | Check compatibility between citizens |

---

## 🌍 PlanetData Controller

**File:** `planetData.controller.js`  
Handles planetary population and sustainability metrics.

### Example Routes
| Method | Endpoint | Description |
|--------|-----------|-------------|
| `GET` | `/api/planet` | Get active planet data |
| `PATCH` | `/api/planet/:id` | Update sustainability or capacity data |
| `GET` | `/api/planet/capacity` | Calculate carrying capacity |

---

## 📊 Report Controller

**File:** `report.controller.js`  
Manages creation and retrieval of analytical reports.

### Example Routes
| Method | Endpoint | Description |
|--------|-----------|-------------|
| `GET` | `/api/reports` | List all reports |
| `POST` | `/api/reports` | Generate a new report |
| `GET` | `/api/reports/:id` | Fetch a specific report |

---

## ⚙️ Common Controller Behavior

All controllers:
- Use centralized `createError()` for consistent API error handling.
- Respond with proper HTTP codes (`200`, `201`, `400`, `404`, `500`).
- Validate incoming payloads (via middleware or manual checks).
- Automatically call the corresponding SQL service.

### Example Error Handling
```js
if (!item) return next(createError(`Record not found`, 404));
```

### Example Success Response
```js
res.status(201).json({ message: 'Citizen created successfully', citizen });
```

---

## 🧩 Directory Structure

```
backend/
├── controllers/
│   ├── citizen.controller.js
│   ├── user.controller.js
│   ├── role.controller.js
│   ├── event.controller.js
│   ├── relation.controller.js
│   ├── geneticResult.controller.js
│   ├── planetData.controller.js
│   └── report.controller.js
└── data/
    └── sql/
        └── services/
```

---

**Author:** Jack Henze 
**Database Engine:** SQLite / Sequelize ORM  
**Version:** 1.0.1  
**Updated:** October 2025 — *Includes Family Tree Endpoints*
