// -----------------------------------------------------------------------------
// 🌐 API Data Service Template (CODEX Reference)
// -----------------------------------------------------------------------------
// Provides a unified interface for interacting with an external REST/HTTP API.
// Utilizes Axios for requests, supports configuration via environment variables.
// Designed for hybrid backends that may use SQL, JSON, MQTT, plus API data sources.
//
// CODEX copies this file to `/backend/data/api/apiDataService.js` when generating
// a new backend project.
//
// It handles:
//  - Initialization of HTTP client
//  - Base URL / authentication via .env
//  - Standard CRUD-like wrapper methods (get, post, put, delete)
//  - Graceful fallback in case of initialization or connectivity failure
// -----------------------------------------------------------------------------
//
// 📂 Location: dev/templates/codeTemplates/template.apiDataService.js
// -----------------------------------------------------------------------------

import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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
//   DATA_SOURCES=sql,json,api
//   API_BASE_URL=https://api.example.com
//   API_TOKEN=mysecrettoken
//   API_TIMEOUT_MS=5000
//
const API_BASE_URL = process.env.API_BASE_URL || '';
const API_TOKEN = process.env.API_TOKEN || '';
const API_TIMEOUT_MS = process.env.API_TIMEOUT_MS
  ? Number(process.env.API_TIMEOUT_MS)
  : 5000;

// -----------------------------------------------------------------------------
// 🧠 HTTP Client Setup
// -----------------------------------------------------------------------------
function createHttpClient() {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT_MS,
    headers: {
      Authorization: API_TOKEN ? `Bearer ${API_TOKEN}` : undefined,
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('[API] HTTP error:', error.message);
      return Promise.reject(error);
    }
  );

  return client;
}

// -----------------------------------------------------------------------------
// 🚀 Initialize API Data Service
// -----------------------------------------------------------------------------
export async function initializeApiDataService() {
  if (!API_BASE_URL) {
    console.warn('[API] No API_BASE_URL configured; skipping API data service.');
    return {
      client: null,
      get: async () => null,
      post: async () => null,
      put: async () => null,
      delete: async () => null,
    };
  }

  const client = createHttpClient();
  console.log(`[API] Initialized HTTP client for ${API_BASE_URL}`);

  return {
    client,
    get: async (path, config = {}) => (await client.get(path, config)).data,
    post: async (path, body = {}, config = {}) =>
      (await client.post(path, body, config)).data,
    put: async (path, body = {}, config = {}) =>
      (await client.put(path, body, config)).data,
    delete: async (path, config = {}) =>
      (await client.delete(path, config)).data,
  };
}

// -----------------------------------------------------------------------------
// 📦 Safe Default Export
// -----------------------------------------------------------------------------
let apiDataService = null;

try {
  apiDataService = await initializeApiDataService();
} catch (err) {
  console.error('[API] Initialization failed:', err.message);
  apiDataService = {
    client: null,
    get: async () => null,
    post: async () => null,
    put: async () => null,
    delete: async () => null,
  };
}

export default apiDataService;

// -----------------------------------------------------------------------------
// 🧠 CODEX Template Notes
// -----------------------------------------------------------------------------
// When CODEX generates a new backend project:
//
// 1️⃣ CODEX will copy this file to `/backend/data/api/apiDataService.js`.
// 2️⃣ It will add `axios` to the backend `package.json` dependencies.
// 3️⃣ CODEX will populate `.env` with these entries:
//
//      DATA_SOURCES=sql,json,api
//      API_BASE_URL=https://api.example.com
//      API_TOKEN=yourtoken
//      API_TIMEOUT_MS=5000
//
// 4️⃣ CODEX will automatically register this service inside
//     `/backend/data/factory/dataSourceRegistry.js`.
//
// 5️⃣ The generated backend will then provide consistent access to
//     external APIs alongside SQL, JSON, or MQTT data sources.
//
// -----------------------------------------------------------------------------
