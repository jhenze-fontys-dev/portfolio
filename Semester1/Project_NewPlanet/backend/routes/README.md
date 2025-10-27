# 🚏 API Routes Overview

This document provides an overview of all **Express route modules** used in the **Population Register** project.  
Each route connects HTTP endpoints to controller logic and ultimately to Sequelize services.

---

## 👥 Citizen Routes

**File:** `citizen.routes.js`  
**Base URL:** `/api/citizens`

| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/` | Get all citizens |
| GET | `/:id` | Get citizen by ID |
| POST | `/` | Create new citizen |
| PATCH | `/:id` | Update citizen |
| DELETE | `/:id` | Delete citizen |
| GET | `/search` | Search/filter citizens |
| GET | `/family/tree` | Get hierarchical family tree |
| GET | `/family/tree/data` | Get graph-style family tree data |

---

## 🗓️ Event Routes

**File:** `event.routes.js`  
**Base URL:** `/api/events`

| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/` | Get all events |
| GET | `/:id` | Get event by ID |
| POST | `/` | Create generic event |
| POST | `/birth` | Register birth event |
| POST | `/marriage` | Register marriage event |
| POST | `/death` | Register death event |
| PATCH | `/:id` | Update event |
| DELETE | `/:id` | Delete event |
| GET | `/search` | Search/filter events |

---

## 🔗 Relation Routes

**File:** `relation.routes.js`  
**Base URL:** `/api/relations`

| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/` | Get all relations |
| GET | `/:id` | Get relation by ID |
| GET | `/citizen/:citizenId` | Get relations for a specific citizen |
| POST | `/` | Create new relation |
| PATCH | `/:id` | Update relation |
| DELETE | `/:id` | Delete relation |
| GET | `/search` | Search/filter relations |

---

## 🧬 GeneticResult Routes

**File:** `geneticResult.routes.js`  
**Base URL:** `/api/genetics`

| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/` | Get all genetic results |
| GET | `/:id` | Get genetic result by ID |
| POST | `/` | Create new genetic result record |
| POST | `/calculate` | Calculate new inbreeding coefficient |
| GET | `/check` | Check genetic pairing threshold |
| PATCH | `/:id` | Update genetic result |
| DELETE | `/:id` | Delete genetic result |
| GET | `/search` | Search/filter results |

---

## 🌍 PlanetData Routes

**File:** `planetData.routes.js`  
**Base URL:** `/api/planet`

| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/` | Get all planet data |
| GET | `/:id` | Get specific planet record |
| GET | `/capacity` | Get carrying capacity information |
| POST | `/` | Create new planet record |
| PATCH | `/:id` | Update planet data |
| DELETE | `/:id` | Delete record |
| GET | `/search` | Filter or search planet data |

---

## 📊 Report Routes

**File:** `report.routes.js`  
**Base URL:** `/api/reports`

| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/` | Get all reports |
| GET | `/:id` | Get report by ID |
| POST | `/` | Create new report |
| PATCH | `/:id` | Update report |
| DELETE | `/:id` | Delete report |
| GET | `/search` | Search/filter reports |

---

## 🧾 Role Routes

**File:** `role.routes.js`  
**Base URL:** `/api/roles`

| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/` | Get all roles |
| GET | `/:id` | Get role by ID |
| POST | `/` | Create new role |
| PATCH | `/:id` | Update role |
| DELETE | `/:id` | Delete role |
| GET | `/search` | Search/filter roles |

---

## 👤 User Routes

**File:** `user.routes.js`  
**Base URL:** `/api/users`

| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/auth/login` | Authenticate and log in a user |
| GET | `/` | Get all users |
| GET | `/:id` | Get user by ID |
| POST | `/` | Create new user |
| PATCH | `/:id` | Update user information |
| PATCH | `/:id/role` | Assign or update user role |
| DELETE | `/:id` | Delete user |
| GET | `/search` | Search/filter users |

---

## ⚙️ Integration Example

All routes are registered within the main Express application:

```js
import express from 'express';
import citizenRoutes from './routes/citizen.routes.js';
import eventRoutes from './routes/event.routes.js';
import relationRoutes from './routes/relation.routes.js';
import geneticResultRoutes from './routes/geneticResult.routes.js';
import planetDataRoutes from './routes/planetData.routes.js';
import reportRoutes from './routes/report.routes.js';
import roleRoutes from './routes/role.routes.js';
import userRoutes from './routes/user.routes.js';

const app = express();

app.use('/api/citizens', citizenRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/relations', relationRoutes);
app.use('/api/genetics', geneticResultRoutes);
app.use('/api/planet', planetDataRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);
```

---

**Author:** Jack Henze  
**Framework:** Express.js + Sequelize  
**Version:** 1.0.0  
**Updated:** October 2025  
