// -----------------------------------------------------------------------------
// HANDWRITTEN RUNTIME FILE
//
// File       : backend/swagger.js
// Purpose    : Builds an Express router that serves Swagger UI for generated OpenAPI specs.
// Owns       : Manifest loading/validation and Swagger UI configuration.
// Delegates  : Mounting location (base URL) to backend/server.js.
// Notes      : Reads docs/backend/generated/openapi/openapi.manifest.json.
// -----------------------------------------------------------------------------

import express from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// -----------------------------------------------------------------------------
// Paths
// -----------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root = one level above /backend
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Generated OpenAPI output location (repo-root based)
const OPENAPI_DIR = path.join(PROJECT_ROOT, 'docs', 'backend', 'generated', 'openapi');
const OPENAPI_MANIFEST_PATH = path.join(OPENAPI_DIR, 'openapi.manifest.json');

// -----------------------------------------------------------------------------
// Manifest loading
// -----------------------------------------------------------------------------

function loadOpenApiManifestOrThrow() {
  if (!fs.existsSync(OPENAPI_MANIFEST_PATH)) {
    throw new Error(
      `[openapi] Missing OpenAPI manifest at: ${OPENAPI_MANIFEST_PATH}\n` +
      `Run "npm run gen:openapi" first.`,
    );
  }

  const raw = fs.readFileSync(OPENAPI_MANIFEST_PATH, 'utf-8');
  const manifest = JSON.parse(raw);

  if (!manifest?.specs || !Array.isArray(manifest.specs) || manifest.specs.length === 0) {
    throw new Error('[openapi] Manifest is invalid or has no specs.');
  }

  return manifest;
}

// -----------------------------------------------------------------------------
// Router
// -----------------------------------------------------------------------------

const router = express.Router();

// Optional debug endpoint (safe to keep; does not affect baseline URLs)
router.get('/api-docs/openapi/manifest.json', (req, res) => {
  res.sendFile(OPENAPI_MANIFEST_PATH);
});

// Swagger UI (multi-spec dropdown)
try {
  const manifest = loadOpenApiManifestOrThrow();

  const urls = manifest.specs.map((s) => {
    // manifest.file is like: docs/backend/generated/openapi/sql/xxx.openapi.json
    // Server serves OPENAPI_DIR at /openapi, so compute relative to OPENAPI_DIR.
    const absoluteSpecFile = path.join(PROJECT_ROOT, s.file);
    const relativeToOpenapiDir = path.relative(OPENAPI_DIR, absoluteSpecFile).replace(/\\/g, '/');

    return {
      name: s.name || `${s.type}:${s.key}`,
      url: `/openapi/${relativeToOpenapiDir}`,
    };
  });

  router.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(null, {
      explorer: true,
      swaggerOptions: {
        urls,
        urlsPrimaryName: urls[0]?.name,
      },
    }),
  );
} catch (err) {
  console.error(String(err?.message || err));

  // Still mount Swagger UI route so the server doesn't crash;
  // UI will be empty until manifest exists.
  router.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(null, {
      explorer: true,
      swaggerOptions: {
        urls: [],
      },
    }),
  );
}

export default router;

// -----------------------------------------------------------------------------
// End of runtime router: swagger
// -----------------------------------------------------------------------------
