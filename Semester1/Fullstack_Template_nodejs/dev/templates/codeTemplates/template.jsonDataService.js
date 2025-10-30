// -----------------------------------------------------------------------------
// 📄 JSON Data Service Template (CODEX Reference)
// -----------------------------------------------------------------------------
// Provides a unified interface for reading, writing, and managing structured
// JSON data files. Ideal for small apps, local development, or hybrid use
// alongside SQL, MQTT, or API data sources.
//
// CODEX copies this file to `/backend/data/json/jsonDataService.js`
// when generating a new backend project.
//
// It handles:
// - Dynamic loading of JSON files as data collections
// - Safe write and update operations
// - Auto-creation of missing files
// - Graceful fallback on initialization errors
// -----------------------------------------------------------------------------
//
// 📂 Location: dev/templates/codeTemplates/template.jsonDataService.js
// -----------------------------------------------------------------------------

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// -----------------------------------------------------------------------------
// 🌍 Environment Setup
// -----------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// -----------------------------------------------------------------------------
// ⚙️ Configuration
// -----------------------------------------------------------------------------
// Example .env entries:
//
//   DATA_SOURCES=sql,json
//   JSON_DATA_DIR=./data/json
//
const JSON_DATA_DIR = path.resolve(
  __dirname,
  process.env.JSON_DATA_DIR || './data/json'
);

// Ensure data directory exists
if (!fs.existsSync(JSON_DATA_DIR)) {
  fs.mkdirSync(JSON_DATA_DIR, { recursive: true });
}

// -----------------------------------------------------------------------------
// 🧩 Utility Functions
// -----------------------------------------------------------------------------
function getFilePath(collection) {
  return path.join(JSON_DATA_DIR, `${collection}.json`);
}

function readJsonFile(collection) {
  const filePath = getFilePath(collection);
  if (!fs.existsSync(filePath)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return Array.isArray(data) ? data : [data];
  } catch (err) {
    console.error(`[JSON] Failed to parse ${collection}.json:`, err.message);
    return [];
  }
}

function writeJsonFile(collection, data) {
  const filePath = getFilePath(collection);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// -----------------------------------------------------------------------------
// 🚀 Initialize JSON Data Service
// -----------------------------------------------------------------------------
// This function ensures all defined collections exist and are ready to use.

export async function initializeJsonDataService() {
  console.log('[JSON] Initializing JSON data service...');

  // Create default collections folder if needed
  if (!fs.existsSync(JSON_DATA_DIR)) {
    fs.mkdirSync(JSON_DATA_DIR, { recursive: true });
  }

  // Example default dataset creation (can be customized in CODEX)
  const defaultCollections = process.env.JSON_COLLECTIONS?.split(',') || [
    'settings',
    'users',
  ];

  defaultCollections.forEach((collection) => {
    const filePath = getFilePath(collection);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '[]', 'utf8');
      console.log(`[JSON] Created new collection: ${collection}.json`);
    }
  });

  console.log('[JSON] Data service initialized successfully');

  // Expose a unified CRUD-like interface
  return {
    getAll: (collection) => readJsonFile(collection),
    getById: (collection, id) =>
      readJsonFile(collection).find((item) => item.id === id),
    create: (collection, item) => {
      const data = readJsonFile(collection);
      data.push(item);
      writeJsonFile(collection, data);
      return item;
    },
    update: (collection, id, newData) => {
      const data = readJsonFile(collection);
      const index = data.findIndex((item) => item.id === id);
      if (index === -1) return null;
      data[index] = { ...data[index], ...newData };
      writeJsonFile(collection, data);
      return data[index];
    },
    remove: (collection, id) => {
      const data = readJsonFile(collection);
      const filtered = data.filter((item) => item.id !== id);
      writeJsonFile(collection, filtered);
      return data.length !== filtered.length;
    },
  };
}

// -----------------------------------------------------------------------------
// 📦 Safe Default Export
// -----------------------------------------------------------------------------
// Ensures the backend won’t crash if JSON initialization fails.

let jsonDataService = null;

try {
  jsonDataService = await initializeJsonDataService();
} catch (err) {
  console.error('[JSON] Initialization failed:', err.message);
  jsonDataService = {
    getAll: () => [],
    getById: () => null,
    create: () => null,
    update: () => null,
    remove: () => null,
  };
}

export default jsonDataService;

// -----------------------------------------------------------------------------
// 🧠 CODEX Template Notes
// -----------------------------------------------------------------------------
//
// When CODEX generates a backend project:
//
// 1️⃣ Copy this file to `/backend/data/json/jsonDataService.js`.
// 2️⃣ Ensure `/backend/data/json` exists.
// 3️⃣ Add `.env` entries such as:
//
//      DATA_SOURCES=sql,json
//      JSON_DATA_DIR=./data/json
//      JSON_COLLECTIONS=settings,users
//
// 4️⃣ Register this module inside `/backend/data/factory/dataSourceRegistry.js`.
// 5️⃣ Provide consistent access to all data collections as flat JSON arrays.
//
// -----------------------------------------------------------------------------
// 💡 Optional Enhancements
// -----------------------------------------------------------------------------
// - Add validation schemas for each collection.
// - Support subdirectories per collection type.
// - Implement file locking to prevent race conditions in heavy I/O use cases.
// - Integrate with WebSocket or MQTT for change broadcasting.
// -----------------------------------------------------------------------------
