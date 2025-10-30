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

  // You can optionally add interceptors here:
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      // Simplify error structure, optionally log or transform
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

  // Return standard interface
  return {
    client,
    get: async (path, config = {}) => {
      const response = await client.get(path, config);
      return response.data;
    },
    post: async (path, body = {}, config = {}) => {
      const response = await client.post(path, body, config);
      return response.data;
    },
    put: async (path, body = {}, config = {}) => {
      const response = await client.put(path, body, config);
      return response.data;
    },
    delete: async (path, config = {}) => {
      const response = await client.delete(path, config);
      return response.data;
    },
  };
}

// -----------------------------------------------------------------------------
// 📦 Safe Default Export
// -----------------------------------------------------------------------------
// Ensures that import errors or HTTP initialization failures won’t crash the backend.

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
// When generating a new backend project, CODEX will:
//
// 1. Copy this file to `/backend/data/api/apiDataService.js`.
// 2. Add `axios` to the backend `package.json` dependencies.
// 3. Add `.env` configuration entries such as:
//
//      DATA_SOURCES=sql,json,api
//      API_BASE_URL=https://api.example.com
//      API_TOKEN=yourtoken
//      API_TIMEOUT_MS=5000
//
// 4. Register this service inside `/backend/data/factory/dataSourceRegistry.js`
//    so that it is discoverable and usable alongside other sources.
//
// -----------------------------------------------------------------------------
