# 🧩 OpenAPI Schemas Overview

This document describes all **YAML schema files** used in the OpenAPI/Swagger documentation for the **New Planet Population Register** backend.

Each schema defines the data structure for entities exposed via the REST API.

---

## 📘 Location
```
docs/backend/schemas/
```

Each `.schema.yaml` file defines an OpenAPI-compatible schema under `#/components/schemas` and is referenced in the JSDoc annotations located in:
```
docs/backend/annotations/*.doc.js
```

---

## 🧍 Citizen Schema (`citizen.schema.yaml`)
Describes the structure of a citizen record in the population register.

| Field | Type | Description |
|--------|------|-------------|
| id | integer | Unique citizen ID |
| first_name | string | Given name |
| last_name | string | Family name |
| birth_date | string (date) | Date of birth |
| death_date | string (date) | Optional date of death |
| gender | string | Gender of the citizen |
| address | string | Home address |
| status | string | 'alive' or 'deceased' |
| createdAt | string (date-time) | Record creation timestamp |
| updatedAt | string (date-time) | Last updated timestamp |

---

## 👤 User Schema (`user.schema.yaml`)
Represents system user accounts linked to citizens.

| Field | Type | Description |
|--------|------|-------------|
| id | integer | User ID |
| email | string | Email address |
| password_hash | string | Hashed password |
| citizen_id | integer | Linked Citizen ID |
| role_id | integer | Assigned Role ID |
| createdAt | string (date-time) | Creation timestamp |
| updatedAt | string (date-time) | Last updated timestamp |

---

## 🧾 Role Schema (`role.schema.yaml`)
Defines user roles and access levels.

| Field | Type | Description |
|--------|------|-------------|
| id | integer | Role ID |
| name | string | Role name (`citizen`, `civilServant`, `admin`) |
| createdAt | string (date-time) | Creation timestamp |
| updatedAt | string (date-time) | Last updated timestamp |

---

## 🗓️ Event Schema (`event.schema.yaml`)
Represents key life events (birth, marriage, death).

| Field | Type | Description |
|--------|------|-------------|
| id | integer | Event ID |
| citizen_id | integer | Main citizen involved |
| type | string | 'birth', 'marriage', 'death' |
| date | string (date) | Event date |
| location | string | Event location |
| partner_id | integer | Partner ID (for marriage) |
| parent_a_id | integer | Parent A (for birth) |
| parent_b_id | integer | Parent B (for birth) |
| details | string | JSON or notes field |
| createdAt | string (date-time) | Created timestamp |
| updatedAt | string (date-time) | Updated timestamp |

---

## 🔗 Relation Schema (`relation.schema.yaml`)
Describes family and social connections between citizens.

| Field | Type | Description |
|--------|------|-------------|
| id | integer | Relation ID |
| type | string | 'parent', 'child', 'spouse' |
| citizen_id | integer | Primary citizen |
| related_citizen_id | integer | Related citizen |
| status | string | 'active', 'inactive', 'divorced', 'widowed' |
| start_date | string (date) | Start of relationship |
| end_date | string (date) | Optional end date |
| createdAt | string (date-time) | Created timestamp |
| updatedAt | string (date-time) | Updated timestamp |

---

## 🧬 GeneticResult Schema (`geneticResult.schema.yaml`)
Represents genetic comparison results between two citizens.

| Field | Type | Description |
|--------|------|-------------|
| id | integer | Result ID |
| citizen_a_id | integer | First citizen ID |
| citizen_b_id | integer | Second citizen ID |
| coefficient | number | Inbreeding coefficient value |
| threshold | number | Threshold for alerts |
| timestamp | string (date-time) | Calculation timestamp |

---

## 🌍 PlanetData Schema (`planetData.schema.yaml`)
Contains colony-wide environmental and capacity metrics.

| Field | Type | Description |
|--------|------|-------------|
| id | integer | Planet ID |
| name | string | Planet name |
| max_population | integer | Maximum sustainable population |
| current_population | integer | Current population |
| resource_capacity | number | Available resources |
| sustainability_factor | number | Environmental health metric |
| growth_rate | number | Annual growth rate (%) |
| createdAt | string (date-time) | Record creation timestamp |
| updatedAt | string (date-time) | Record last update |

---

## 📊 Report Schema (`report.schema.yaml`)
Defines administrative or statistical report data.

| Field | Type | Description |
|--------|------|-------------|
| id | integer | Report ID |
| type | string | Report type (`population`, `genetics`, `capacity`, etc.) |
| data | string | JSON data (report contents) |
| createdAt | string (date-time) | Creation timestamp |
| updatedAt | string (date-time) | Update timestamp |

---

## ⚙️ Shared Schema: `errorResponse.yaml`
Defines a reusable structure for API errors (used by all endpoints).

| Field | Type | Description |
|--------|------|-------------|
| status | integer | HTTP status code |
| message | string | Error description |
| details | object | Optional metadata |

---

## 🧾 Notes
- These schemas are loaded dynamically in `swagger.js` using `YAML.load()`.
- Each schema is referenced via `$ref` inside annotation files.
- Swagger UI will automatically include schema definitions in `/api-docs`.

---

**Author:** Jack Henze  
**Version:** 1.0.0  
**Updated:** October 2025
