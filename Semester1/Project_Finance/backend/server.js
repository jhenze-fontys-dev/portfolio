// -----------------------------------------------------------------------------
// HANDWRITTEN RUNTIME FILE
//
// File       : backend/server.js
// Purpose    : Backend runtime entrypoint (Express app + middleware + route mounting).
// Owns       : Express app wiring, middleware order, OpenAPI static hosting.
// Delegates  : Swagger UI routing to backend/swagger.js, route mounting to generated registry.
// Notes      : Keep production-safe defaults; avoid generator logic in runtime.
// -----------------------------------------------------------------------------

import express from 'express';
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';

// Swagger UI router
import swaggerRouter from './swagger.js';

// IMPORTANT: envLoader does NOT export a default.
// It loads .env and prints the environment banner as a side effect.
import './config/envLoader.js';

import registerGeneratedRoutes from './routes/generated.routes.js';

// -----------------------------------------------------------------------------
// Paths
// -----------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// repo root = one level above /backend
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Generated OpenAPI output location (repo-root based)
const OPENAPI_DIR = path.join(
  PROJECT_ROOT,
  'docs',
  'backend',
  'generated',
  'openapi'
);

// -----------------------------------------------------------------------------
// App + middleware
// -----------------------------------------------------------------------------

const app = express();

// Basic middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// -----------------------------------------------------------------------------
// OpenAPI + Swagger
// -----------------------------------------------------------------------------

// Serve generated OpenAPI artifacts under /openapi/*
// Example endpoints:
//   /openapi/openapi.manifest.json
//   /openapi/sql/<sourceKey>.openapi.json
app.use('/openapi', express.static(OPENAPI_DIR));

// Swagger UI (via router)
app.use('/', swaggerRouter);

// -----------------------------------------------------------------------------
// Routes
// -----------------------------------------------------------------------------

// Mount generated routes
try {
  registerGeneratedRoutes(app);
  console.log('[routes] Mounted generated routes via backend/routes/generated.routes.js');
} catch (err) {
  console.error('[routes] Failed to mount generated routes:', String(err?.message || err));
  console.error('[routes] Run "npm run gen:route-registry" (and "npm run gen:routes") to generate routes.');
}

// -----------------------------------------------------------------------------
// Errors
// -----------------------------------------------------------------------------

// Basic 404 + error handler (kept simple)
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not Found', statusCode: 404 });
});

app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err?.statusCode || 500)
    .json({
      success: false,
      message: err?.message || 'Server Error',
      statusCode: err?.statusCode || 500,
    });
});

// -----------------------------------------------------------------------------
// Startup
// -----------------------------------------------------------------------------

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});

// -----------------------------------------------------------------------------
// End of runtime entrypoint: server
// -----------------------------------------------------------------------------
