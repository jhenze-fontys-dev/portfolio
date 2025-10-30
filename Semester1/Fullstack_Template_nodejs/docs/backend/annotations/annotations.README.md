# Swagger Annotations

## 🧩 Purpose
JSDoc-based annotations used to generate OpenAPI documentation automatically from source code.

## 📁 Folder Structure

docs/backend/annotations/
├── citizen.doc.js
├── user.doc.js
├── role.doc.js
├── event.doc.js
├── relation.doc.js
├── geneticResult.doc.js
├── planetData.doc.js
└── report.doc.js


## 📄 Main Components

- Each file describes API paths and methods for its entity.  
- Linked directly to controllers and routes.  
- Used by `swagger-jsdoc` in `swagger.js` to build the full OpenAPI spec.


## ⚙️ Key Features

- Reduces redundancy by combining inline docs and YAML schemas.  
- Follows standard Swagger JSDoc syntax.  
- Simplifies maintenance across many endpoints.


## 💡 Example Usage
```js
js
/**
 * @openapi
 * /api/citizens:
 *   get:
 *     summary: Get all citizens
 *     responses:
 *       200:
 *         description: List of citizens
 */

```

## 🧱 Developer Notes

- Keep annotations synchronized with YAML schemas.  
- Avoid redefining response types already in shared schemas.  
- Swagger UI updates automatically after server restart.

