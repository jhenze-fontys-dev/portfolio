# 🧩 Sequelize Models Overview

This document describes all Sequelize models used in the **Population Register** project.  
Each model maps directly to a database table in **SQLite** (or MySQL during export).  
The schema is normalized and optimized for relational integrity and extensibility.

---

## 🧍 Citizen

Stores core information about each registered resident.

| Field | Type | Description |
|-------|------|-------------|
| id (PK) | INTEGER | Unique citizen identifier |
| first_name | TEXT | Given name |
| last_name | TEXT | Family name |
| birth_date | TEXT | Date of birth (ISO 8601) |
| death_date | TEXT (nullable) | Date of death |
| gender | TEXT | Gender identifier |
| address | TEXT | Current address |
| status | TEXT | `alive` or `deceased` |
| created_at | TEXT | Record creation timestamp |
| updated_at | TEXT | Record last update timestamp |

**Relations**
- `Citizen` **hasMany** `Event`
- `Citizen` **hasMany** `Relation` (as `citizen` or `related_citizen`)
- `Citizen` **belongsToMany** `Citizen` through `Relation`
- `Citizen` **hasMany** `GeneticResult`
- `Citizen` **belongsTo** `User` (optional account link)

**Family Tree Support**
- Citizens can be queried recursively through the `Relation` model.
- Used by `getFamilyTree` and `getFamilyTreeData` in the Citizen service.
- Enables building dynamic hierarchical and graph-based family views.

---

## 👤 User

Represents a system account linked to a `Citizen` and assigned a `Role`.

| Field | Type | Description |
|-------|------|-------------|
| id (PK) | INTEGER | Unique user identifier |
| email | TEXT (unique) | Login email address |
| password_hash | TEXT | Securely hashed password (bcrypt) |
| citizen_id (FK → Citizen.id) | INTEGER | Associated citizen |
| role_id (FK → Role.id) | INTEGER | Assigned role |
| created_at | TEXT | Record creation timestamp |
| updated_at | TEXT | Record last update timestamp |

**Relations**
- `User` **belongsTo** `Citizen`
- `User` **belongsTo** `Role`

---

## 🧾 Role

Defines system roles and access levels.

| Field | Type | Description |
|-------|------|-------------|
| id (PK) | INTEGER | Unique role identifier |
| name | TEXT | Role name (`citizen`, `civilServant`, `admin`) |
| created_at | TEXT | Record creation timestamp |
| updated_at | TEXT | Record last update timestamp |

**Relations**
- `Role` **hasMany** `User`

---

## 🗓️ Event

Tracks life events for citizens (birth, marriage, death).

| Field | Type | Description |
|-------|------|-------------|
| id (PK) | INTEGER | Unique event ID |
| citizen_id (FK → Citizen.id) | INTEGER | Main citizen involved |
| type | TEXT | `birth`, `marriage`, or `death` |
| date | TEXT | Event date |
| location | TEXT | Event location |
| partner_id (FK → Citizen.id) | INTEGER (nullable) | Partner (for marriage) |
| parent_a_id (FK → Citizen.id) | INTEGER (nullable) | Parent A (for birth) |
| parent_b_id (FK → Citizen.id) | INTEGER (nullable) | Parent B (for birth) |
| details | TEXT | Additional event data (JSON or notes) |
| created_at | TEXT | Created timestamp |
| updated_at | TEXT | Updated timestamp |

**Relations**
- `Event` **belongsTo** `Citizen` (main)
- `Event` **belongsTo** `Citizen` as `partner`
- `Event` **belongsTo** `Citizen` as `parent_a`
- `Event` **belongsTo** `Citizen` as `parent_b`

---

## 🔗 Relation

Defines direct relationships between citizens (e.g., parent-child, spouse).

| Field | Type | Description |
|-------|------|-------------|
| id (PK) | INTEGER | Unique relation identifier |
| type | TEXT | Relationship type (`parent`, `child`, `spouse`) |
| citizen_id (FK → Citizen.id) | INTEGER | Primary citizen |
| related_citizen_id (FK → Citizen.id) | INTEGER | Linked citizen |
| status | TEXT | Active or historical |
| start_date | TEXT | Start date of relationship |
| end_date | TEXT (nullable) | End date (if applicable) |
| created_at | TEXT | Record creation timestamp |
| updated_at | TEXT | Record last update timestamp |

**Relations**
- `Relation` **belongsTo** `Citizen` (as `citizen`)
- `Relation` **belongsTo** `Citizen` (as `related_citizen`)

**Notes**
- Bidirectional structure allows querying both directions (parent → child and child → parent).
- Prevents invalid self-relations or duplicates.
- Foundation for the Family Tree API.

---

## 🧬 GeneticResult

Stores inbreeding coefficient calculations between two citizens.

| Field | Type | Description |
|-------|------|-------------|
| id (PK) | INTEGER | Unique calculation ID |
| citizen_a_id (FK → Citizen.id) | INTEGER | First citizen |
| citizen_b_id (FK → Citizen.id) | INTEGER | Second citizen |
| coefficient | REAL | Inbreeding coefficient value |
| threshold | REAL | Warning threshold |
| timestamp | TEXT | Calculation timestamp |

**Relations**
- `GeneticResult` **belongsTo** `Citizen` (as `citizen_a`)
- `GeneticResult` **belongsTo** `Citizen` (as `citizen_b`)

---

## 🌍 PlanetData

Holds data about the colony planet and its capacity metrics.

| Field | Type | Description |
|-------|------|-------------|
| id (PK) | INTEGER | Unique record ID |
| name | TEXT | Planet name |
| max_population | INTEGER | Maximum sustainable population |
| resource_capacity | REAL | Total available resource units |
| sustainability_factor | REAL | Environmental health factor |
| area_km2 | REAL | Planet area (optional) |
| current_population | INTEGER | Current number of residents |
| migration_in | INTEGER | Number of migrants in |
| migration_out | INTEGER | Number of migrants out |
| avg_resource_use | REAL | Average resource use per person |
| growth_rate | REAL | Annual growth percentage |
| created_at | TEXT | Record creation timestamp |
| updated_at | TEXT | Record last update timestamp |

**Relations**
- No direct foreign keys (singleton record, global scope)

---

## 📊 Report

Stores analytical or statistical reports for administrative purposes.

| Field | Type | Description |
|-------|------|-------------|
| id (PK) | INTEGER | Unique report identifier |
| type | TEXT | Report type (`population`, `genetics`, `capacity`, etc.) |
| data | TEXT | JSON-encoded report data |
| created_at | TEXT | Creation timestamp |
| updated_at | TEXT | Last updated timestamp |

**Relations**
- Standalone (reports reference system-wide data)

---

## ⚙️ Notes on Implementation

- All timestamps (`created_at`, `updated_at`) are stored as ISO 8601 text strings.  
- Passwords are **hashed using bcrypt** before storage in `User.password_hash`.  
- Relationships are defined in `populationRegister.relations.js`.  
- Planet data typically contains only **one active record** (singleton pattern).  
- Family tree and relation logic is handled primarily in `citizen.service.js` and `relation.service.js`.  
- Use Sequelize’s `timestamps: true` to auto-manage created/updated fields if preferred.

---

## 🧱 ERD Summary

```
Citizen 1 ─< Event >─1 Citizen (as partner/parent)
Citizen 1 ─< Relation >─1 Citizen
Citizen 1 ─< GeneticResult >─1 Citizen
Citizen 1 ─1 User 1─< Role
PlanetData (singleton)
Report (standalone)
```

---

## 🧰 Directory Layout

```
backend/
├── data/
│   └── sql/
│       ├── models/
│       │   ├── citizen.model.js
│       │   ├── user.model.js
│       │   ├── role.model.js
│       │   ├── event.model.js
│       │   ├── relation.model.js
│       │   ├── geneticResult.model.js
│       │   ├── planetData.model.js
│       │   ├── report.model.js
│       │   └── populationRegister.relations.js
│       └── services/
│           ├── citizen.service.js
│           ├── user.service.js
│           └── ...
└── controllers/
    └── ...
```

---

**Author:** Jack Henze  
**Database Engine:** SQLite / Sequelize ORM  
**Version:** 1.1.0  
**Updated:** October 2025  
