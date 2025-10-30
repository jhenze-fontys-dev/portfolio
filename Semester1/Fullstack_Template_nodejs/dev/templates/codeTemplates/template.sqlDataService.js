// -----------------------------------------------------------------------------
// 💾 SQL Data Service Template (CODEX Reference)
// -----------------------------------------------------------------------------
// Provides a unified interface for interacting with Sequelize model services.
// CODEX uses this template to generate `/backend/data/sql/sqlDataService.js`
// during project creation.
//
// This file dynamically loads all services from `/services` and registers them
// in a single exportable `sqlDataService` object for controllers or middleware.
//
// ⚠️ Do NOT import or execute this file directly — it is a template only.
// -----------------------------------------------------------------------------
//
// 📂 Location: dev/templates/codeTemplates/template.sqlDataService.js
// -----------------------------------------------------------------------------

import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import sequelize, { initSqlDatabase } from './sqlDatabase.js';

// -----------------------------------------------------------------------------
// 🧭 Path Setup
// -----------------------------------------------------------------------------
// CODEX automatically sets paths relative to backend structure.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const servicesDir = path.resolve(__dirname, './services');
const modelsDir = path.resolve(__dirname, './models');

// -----------------------------------------------------------------------------
// 🧩 Dynamic Model Loader
// -----------------------------------------------------------------------------
// Automatically imports all model definitions in `/models`.
// This allows the app to register all Sequelize models before initialization.

export async function loadModels() {
  const models = [];

  if (!fs.existsSync(modelsDir)) {
    console.warn('No models directory found at:', modelsDir);
    return models;
  }

  const files = fs.readdirSync(modelsDir).filter((f) => f.endsWith('.js'));
  for (const file of files) {
    const { default: model } = await import(path.join(modelsDir, file));
    models.push(model);
  }

  return models;
}

// -----------------------------------------------------------------------------
// ⚙️ Dynamic Service Loader
// -----------------------------------------------------------------------------
// Imports all SQL-based service files (e.g., userService, orderService)
// and registers them in a single object. Each service is expected to
// export an object with CRUD-like methods.

export async function loadSqlServices() {
  const sqlServices = {};

  if (!fs.existsSync(servicesDir)) {
    console.warn('No services directory found at:', servicesDir);
    return sqlServices;
  }

  const files = fs.readdirSync(servicesDir).filter((f) => f.endsWith('.js'));

  for (const file of files) {
    const { default: service } = await import(path.join(servicesDir, file));

    // Derive service name from filename (e.g., "user.service.js" → "user")
    const serviceName = file
      .replace(/\.service\.js$/, '')
      .replace(/\.js$/, '')
      .toLowerCase();

    sqlServices[serviceName] = service;
  }

  return sqlServices;
}

// -----------------------------------------------------------------------------
// 🚀 Initialize Data Layer
// -----------------------------------------------------------------------------
// Combines model registration and service exposure into one startup process.
// Called during backend initialization to set up Sequelize and attach services.

export async function initializeSqlDataService() {
  const models = await loadModels();
  await initSqlDatabase(models);

  const services = await loadSqlServices();

  console.log('SQL Data Service initialized');
  return { sequelize, services };
}

// -----------------------------------------------------------------------------
// 📦 Export Default Interface
// -----------------------------------------------------------------------------
// The default export provides a unified interface for controllers to access
// registered SQL services. CODEX ensures that this pattern is consistent
// across all generated projects.

const sqlDataService = await initializeSqlDataService();

export default sqlDataService;

// -----------------------------------------------------------------------------
// 🧠 CODEX Template Notes
// -----------------------------------------------------------------------------
// When generating a new backend project, CODEX will:
//
// 1. Copy this file to `/backend/data/sql/sqlDataService.js`
// 2. Ensure `sqlDatabase.js` is present (from its template)
// 3. Create `/backend/data/sql/models` and `/backend/data/sql/services` folders
// 4. Populate model/service templates based on schema definitions
// 5. Adjust import paths if the backend structure differs
//
// Each service file should export an object of CRUD-like functions, for example:
//
//   export default {
//     getAll: async () => await Model.findAll(),
//     getById: async (id) => await Model.findByPk(id),
//     create: async (data) => await Model.create(data),
//     update: async (id, data) => await Model.update(data, { where: { id } }),
//     remove: async (id) => await Model.destroy({ where: { id } }),
//   };
//
// -----------------------------------------------------------------------------
