// -----------------------------------------------------------------------------
// 🧩 Data Source Registry Template (CODEX Reference)
// -----------------------------------------------------------------------------
// This file defines a dynamic registry that loads all available data services
// (SQL, JSON, MQTT, API, etc.) based on `.env` configuration.
//
// CODEX copies this file to `/backend/data/factory/dataSourceRegistry.js`
// when generating a new project.
//
// It does NOT include project-specific logic — all sources are discovered
// dynamically from the backend's folder structure.
// -----------------------------------------------------------------------------
//
// 📂 Location: dev/templates/codeTemplates/template.dataSourceRegistry.js
// -----------------------------------------------------------------------------

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// -----------------------------------------------------------------------------
// 🌍 Environment Setup
// -----------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// -----------------------------------------------------------------------------
// ⚙️ Active Sources
// -----------------------------------------------------------------------------
// Expected format in .env: DATA_SOURCES=sql,json,mqtt,api
const activeSources =
  process.env.DATA_SOURCES?.split(',').map((s) => s.trim().toLowerCase()) || [
    'sql',
  ];

export const dataRegistry = {};

// -----------------------------------------------------------------------------
// 🧠 Generic Dynamic Import Helper
// -----------------------------------------------------------------------------
async function tryImport(label, importPath) {
  try {
    const module = await import(importPath);
    dataRegistry[label] = module.default || module;
    console.log(`[DataRegistry] Registered ${label.toUpperCase()} source`);
  } catch (err) {
    console.warn(
      `[DataRegistry] Skipped ${label.toUpperCase()} source: ${err.message}`
    );
  }
}

// -----------------------------------------------------------------------------
// 🗃️ Load SQL Source
// -----------------------------------------------------------------------------
if (activeSources.includes('sql')) {
  const sqlPath = path.resolve(__dirname, '../sql/sqlDataService.js');
  if (fs.existsSync(sqlPath)) {
    await tryImport('sql', sqlPath);
  } else {
    console.warn('[DataRegistry] SQL data service not found.');
  }
}

// -----------------------------------------------------------------------------
// 📄 Load JSON Source
// -----------------------------------------------------------------------------
if (activeSources.includes('json')) {
  const jsonPath = path.resolve(__dirname, '../json/jsonDataService.js');
  if (fs.existsSync(jsonPath)) {
    await tryImport('json', jsonPath);
  }
}

// -----------------------------------------------------------------------------
// 📡 Load MQTT Source
// -----------------------------------------------------------------------------
if (activeSources.includes('mqtt')) {
  const mqttPath = path.resolve(__dirname, '../mqtt/mqttDataService.js');
  if (fs.existsSync(mqttPath)) {
    await tryImport('mqtt', mqttPath);
  }
}

// -----------------------------------------------------------------------------
// 🌐 Load External API Source
// -----------------------------------------------------------------------------
if (activeSources.includes('api')) {
  const apiPath = path.resolve(__dirname, '../api/apiDataService.js');
  if (fs.existsSync(apiPath)) {
    await tryImport('api', apiPath);
  }
}

// -----------------------------------------------------------------------------
// 🧭 Export Unified Registry
// -----------------------------------------------------------------------------
export default dataRegistry;

// -----------------------------------------------------------------------------
// 💡 Optional minor enhancement
// -----------------------------------------------------------------------------
// Convenience helper for controller-level access.
// Example: const sql = getDataSource('sql');
export function getDataSource(name) {
  return dataRegistry[name] || null;
}

// -----------------------------------------------------------------------------
// 🧠 CODEX Template Notes
// -----------------------------------------------------------------------------
// When CODEX generates a backend project, it will:
//
// 1. Copy this file to `/backend/data/factory/dataSourceRegistry.js`.
// 2. Populate `.env` with the correct DATA_SOURCES (e.g. sql,json,mqtt).
// 3. Generate empty folders for each source type under `/backend/data/`:
//       - /sql/sqlDataService.js
//       - /json/jsonDataService.js
//       - /mqtt/mqttDataService.js
//       - /api/apiDataService.js
// 4. Ensure this registry dynamically loads only the available modules.
// 5. Keep it compatible with hybrid data access (SQL + MQTT + JSON + API).
//
// Example .env configuration:
//   DATA_SOURCES=sql,json,mqtt
//
// -----------------------------------------------------------------------------
