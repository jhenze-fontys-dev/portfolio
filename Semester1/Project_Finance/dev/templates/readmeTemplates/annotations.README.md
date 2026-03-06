# 🧩 OpenAPI Annotations Overview

This document describes all **OpenAPI JSDoc annotation files** used in the **New Planet Population Register** backend.

Each annotation file documents the REST API endpoints for one entity (e.g., Citizen, User, Event).  
They define operations, request/response types, and references to schemas (`#/components/schemas/...`).

---

## 📂 Location
```
docs/backend/annotations/
```

Each file follows the format `{entity}.doc.js`, for example:
```
citizen.doc.js
user.doc.js
event.doc.js
...
```

These annotations are automatically loaded by Swagger via the configuration in:
```
swagger.js
```

---

## 🧱 Common Structure

Each file uses **JSDoc-style comments** with `@openapi` to describe routes.

Example snippet:
```js
/**
 * @openapi
 * /api/citizens:
 *   get:
 *     summary: Get all citizens
 *     description: Retrieve all citizens in the population register.
 *     tags: [Citizens]
 *     responses:
 *       '200':
 *         description: List of citizens
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Citizen'
 */
```

---

## 🧍 Citizen Annotations (`citizen.doc.js`)
**Endpoints covered:**
- `GET /api/citizens`
- `GET /api/citizens/{id}`
- `POST /api/citizens`
- `PATCH /api/citizens/{id}`
- `DELETE /api/citizens/{id}`
- `GET /api/citizens/search`
- `GET /api/family/tree?citizenId={id}`

**Schema used:** `Citizen`

---

## 👤 User Annotations (`user.doc.js`)
**Endpoints covered:**
- `POST /api/auth/login`
- `GET /api/users`
- `GET /api/users/{id}`
- `PATCH /api/users/{id}/role`

**Schemas used:** `User`, `Role`

---

## 🧾 Role Annotations (`role.doc.js`)
**Endpoints covered:**
- `GET /api/roles`
- `GET /api/roles/{id}`
- `POST /api/roles`
- `PATCH /api/roles/{id}`
- `DELETE /api/roles/{id}`

**Schema used:** `Role`

---

## 🗓️ Event Annotations (`event.doc.js`)
**Endpoints covered:**
- `POST /api/events/birth`
- `POST /api/events/marriage`
- `POST /api/events/death`

**Schema used:** `Event`

---

## 🔗 Relation Annotations (`relation.doc.js`)
**Endpoints covered:**
- `POST /api/relations`
- `GET /api/relations/search`
- `PATCH /api/relations/{id}`
- `DELETE /api/relations/{id}`

**Schema used:** `Relation`

---

## 🧬 GeneticResult Annotations (`geneticResult.doc.js`)
**Endpoints covered:**
- `GET /api/genetics/check?partnerId={id}`
- `POST /api/genetics/calculate`

**Schema used:** `GeneticResult`

---

## 🌍 PlanetData Annotations (`planetData.doc.js`)
**Endpoints covered:**
- `GET /api/planet/capacity`

**Schema used:** `PlanetData`

---

## 📊 Report Annotations (`report.doc.js`)
**Endpoints covered:**
- `GET /api/reports`
- `POST /api/reports`

**Schema used:** `Report`

---

## ⚙️ Shared Responses
All endpoints can reference reusable response components:
- `#/components/responses/BadRequest`
- `#/components/responses/NotFound`
- `#/components/responses/ServerError`

Defined in:
```
docs/backend/schemas/shared/errorResponse.yaml
```

---

## 🧾 Notes
- These annotation files are **automatically included** by Swagger via:
  ```js
  apis: ['../docs/backend/annotations/*.doc.js']
  ```
- Each annotation maps directly to controller functions in `/backend/controllers/`.
- They use `$ref` links to connect to the corresponding YAML schemas.

---

**Author:** Jack Henze  
**Version:** 1.0.0  
**Updated:** October 2025
