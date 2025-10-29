# SQL Models

## 🧩 Purpose
Defines all Sequelize ORM models for the Population Register database layer.

## 📁 Folder Structure

backend/data/sql/models/
├── citizen.model.js
├── relation.model.js
├── event.model.js
├── user.model.js
├── role.model.js
├── planetData.model.js
├── geneticResult.model.js
├── report.model.js
└── global.relations.js


## 📄 Main Components

- **citizen.model.js** — Core citizen data (name, gender, birth, etc.).  
- **relation.model.js** — Family/social relations between citizens.  
- **event.model.js** — Life events (birth, marriage, death).  
- **user.model.js** — User authentication and role references.  
- **role.model.js** — User roles and permissions.  
- **planetData.model.js** — Global sustainability and capacity data.  
- **geneticResult.model.js** — Genetic calculations and results.  
- **report.model.js** — Stores generated system reports.  
- **global.relations.js** — Centralized definition of model associations.


## ⚙️ Key Features

- Implements normalized relational schema via Sequelize.  
- Self-referential models (Citizen ↔ Relation).  
- Handles cascading relationships across multiple entities.  
- Optimized for SQLite but compatible with PostgreSQL/MySQL.


## 💡 Example Usage
```js

// Example association
Citizen.hasMany(Relation, { foreignKey: 'citizen_id', as: 'relations' });
Relation.belongsTo(Citizen, { foreignKey: 'related_citizen_id', as: 'relatedCitizen' });

```

## 🧱 Developer Notes

- Always import `global.relations.js` after defining all models.  
- Timestamps are manually controlled (string fields).  
- Relations must use unique aliases to prevent Sequelize errors.

