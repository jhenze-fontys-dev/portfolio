# Schemas

## 🧩 Purpose
Defines OpenAPI (YAML) schemas for entities used in Swagger documentation.

## 📁 Folder Structure

docs/backend/schemas/
├── citizen.schema.yaml
├── user.schema.yaml
├── role.schema.yaml
├── event.schema.yaml
├── relation.schema.yaml
├── geneticResult.schema.yaml
├── planetData.schema.yaml
├── report.schema.yaml
└── shared/
    └── errorResponse.yaml


## 📄 Main Components

- Each YAML schema defines an OpenAPI component (e.g., Citizen, Role, Report).  
- Shared schemas include reusable response objects (like ErrorResponse).  
- Loaded dynamically by `swagger.js`.


## ⚙️ Key Features

- Ensures consistent API documentation structure.  
- Supports validation and reusability in Swagger.  
- Compatible with both annotations and direct OpenAPI rendering.


## 💡 Example Usage
```js
yaml
Citizen:
  type: object
  properties:
    id: { type: integer }
    first_name: { type: string }
    last_name: { type: string }

```

## 🧱 Developer Notes

- Every schema must have a top-level key matching its model name.  
- Keep data types in sync with Sequelize models.  
- Shared responses are loaded from `/schemas/shared/`.

