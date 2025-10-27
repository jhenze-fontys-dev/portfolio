# ⚙️ SQL Services Overview

This document provides an overview of all **Sequelize SQL Services** used in the **Population Register** project.  
Each service encapsulates database access logic (CRUD, search, domain rules) for a specific model.

These services form the **SQL data layer** used by controllers through the `dataServiceFactory`.

---

## 🧍 Citizen Service

**File:** `citizen.service.js`  
Handles data access for citizens and their related entities.

### Methods
| Method | Description |
|--------|-------------|
| `getAll(includeRelations)` | Returns all citizens (optionally with events, relations, etc.) |
| `getById(id, includeRelations)` | Returns a single citizen by ID |
| `create(payload)` | Creates a new citizen record |
| `update(id, fields)` | Updates existing citizen information |
| `remove(id)` | Deletes a citizen |
| `search(params)` | Searches citizens by name, date, gender, etc. |

### 🌳 Family Tree Extensions
| Method | Description |
|--------|-------------|
| `getFamilyTree(citizenId)` | Returns a hierarchical structure of the citizen and their family relations. |
| `getFamilyTreeData(citizenId)` | Returns graph-ready data (`nodes` and `edges`) for visual tree rendering. |

**Notes:**
- Uses `Relation` model associations (`citizen` ↔ `relatedCitizen`).
- Supports both direct and indirect relationships (parents, spouses, children).
- Used by `GET /api/family/tree` and `GET /api/family/tree/data`.

---

## 👤 User Service

**File:** `user.service.js`  
Handles authentication, account management, and role assignments.

### Methods
| Method | Description |
|--------|-------------|
| `getAll(includeRelations)` | Returns all users (with roles and linked citizen) |
| `getById(id, includeRelations)` | Fetches a specific user |
| `create(payload)` | Hashes password and creates a user |
| `update(id, fields)` | Updates user info, rehashes password if changed |
| `remove(id)` | Deletes a user |
| `search(params)` | Filters by email, role, etc. |
| `login(email, password)` | Validates credentials with bcrypt |
| `assignRole(userId, roleId)` | Assigns or changes a user’s role |

### Notes
- Passwords are hashed using **bcrypt**.  
- Integrates easily with JWT-based authentication.

---

## 🧾 Role Service

**File:** `role.service.js`  
Manages system roles and permissions.

### Methods
| Method | Description |
|--------|-------------|
| `getAll(includeUsers)` | Lists all roles, optionally with users |
| `getById(id, includeUsers)` | Fetches a role and its users |
| `create(payload)` | Creates a new role |
| `update(id, fields)` | Updates a role |
| `remove(id)` | Deletes a role |
| `search(params)` | Searches roles by name |
| `getUsersByRoleId(roleId)` | Returns all users assigned to a given role |
| `getByName(name)` | Fetches a role by its name |

---

## 🗓️ Event Service

**File:** `event.service.js`  
Manages citizen events (births, marriages, deaths).

### Methods
| Method | Description |
|--------|-------------|
| `getAll(includeRelations)` | Returns all events with optional linked citizens |
| `getById(id, includeRelations)` | Returns an event by ID |
| `create(payload)` | Creates a new event record |
| `update(id, fields)` | Updates an event |
| `remove(id)` | Deletes an event |
| `search(params)` | Filters by type, citizen, or date range |

### Notes
- Enforces event types (`birth`, `marriage`, `death`).  
- Optionally loads `partner`, `parent_a`, `parent_b` references.

---

## 🔗 Relation Service

**File:** `relation.service.js`  
Handles relationships between citizens (e.g., parent-child, spouse).

### Methods
| Method | Description |
|--------|-------------|
| `getAll(includeRelations)` | Returns all relations |
| `getById(id, includeRelations)` | Fetches a specific relation |
| `create(payload)` | Creates a new relation |
| `update(id, fields)` | Updates relation status or duration |
| `remove(id)` | Deletes a relation |
| `search(params)` | Searches by citizen or relation type |
| `getRelationsForCitizen(citizenId)` | Returns all relations (incoming and outgoing) for a citizen |

### Notes
- Ensures relational integrity (prevents self-relations and duplicates).  
- Supports **bidirectional** queries for both outgoing and incoming relations.  
- Provides foundation for **citizen family tree** generation (`getFamilyTree` and `getFamilyTreeData`).

---

## 🧬 GeneticResult Service

**File:** `geneticResult.service.js`  
Manages calculations and storage of inbreeding coefficients.

### Methods
| Method | Description |
|--------|-------------|
| `getAll()` | Lists all calculations |
| `getById(id)` | Fetches one calculation |
| `create(payload)` | Inserts a new result |
| `update(id, fields)` | Updates a stored result |
| `remove(id)` | Deletes a result |
| `search(params)` | Filters by citizens or date range |

### Notes
- Stores calculated coefficient and threshold.  
- Supports cross-citizen genetic comparisons.

---

## 🌍 PlanetData Service

**File:** `planetData.service.js`  
Handles planetary capacity data and sustainability metrics.

### Methods
| Method | Description |
|--------|-------------|
| `getAll()` | Returns the active planet data record |
| `getById(id)` | Fetches a specific planet record |
| `create(payload)` | Creates a new record (rare, usually singleton) |
| `update(id, fields)` | Updates capacity, population, or resources |
| `remove(id)` | Deletes a record |
| `search(params)` | Filters by name or capacity metrics |

### Notes
- Typically only **one record** exists.  
- Used by admin calculations (e.g., carrying capacity).

---

## 📊 Report Service

**File:** `report.service.js`  
Handles creation and retrieval of system reports.

### Methods
| Method | Description |
|--------|-------------|
| `getAll()` | Lists all reports |
| `getById(id)` | Retrieves a report by ID |
| `create(payload)` | Creates a new report entry |
| `update(id, fields)` | Updates an existing report |
| `remove(id)` | Deletes a report |
| `search(params)` | Searches by report type or date |

### Notes
- Report data stored as JSON string.  
- Often used for population, genetics, or resource analytics.

---

## ⚙️ Common Service Features

All services:
- Use **Sequelize ORM** with parameterized queries.
- Return plain JSON objects (via `.toJSON()`).
- Support:
  - **CRUD** (Create, Read, Update, Delete)
  - **Flexible search** with filters and sorting
- Are designed for modular use through:
  ```js
  import { dataService } from '../data/dataServiceFactory.js';
  ```

---

## 🧩 Example Service Factory Pattern

```js
// backend/data/dataServiceFactory.js
import { citizenService } from './sql/services/citizen.service.js';
import { userService } from './sql/services/user.service.js';
import { eventService } from './sql/services/event.service.js';
// ...other services

export const dataService = {
  citizen: citizenService,
  user: userService,
  event: eventService,
  // ...
};
```

---

**Author:** Jack Henze  
**Database Engine:** SQLite / Sequelize ORM  
**Version:** 1.1.0  
**Updated:** October 2025  
