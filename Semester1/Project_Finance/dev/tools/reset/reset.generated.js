// -----------------------------------------------------------------------------
// HANDWRITTEN GENERATOR SCRIPT
//
// File       : dev/tools/reset/reset.generated.js
// Purpose    : Resets all generated backend artifacts to a clean state.
// Writes     : (none) – removes generated files/directories so generators can rebuild them.
// Reads      : Filesystem only (no metadata or database access).
// Notes      : Uses the shared generator logger for structured, machine-readable output.
// -----------------------------------------------------------------------------

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createStepLogger } from '../../generators/_logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Project root = three levels up from /dev/tools/reset
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

const log = createStepLogger({
  step: 'reset',
  title: 'Reset Generated Artifacts',
  generatorPath: 'dev/tools/reset/reset.generated.js',
  projectRoot: PROJECT_ROOT,
});

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function safeUnlink(absPath) {
  if (!fs.existsSync(absPath)) return;
  fs.unlinkSync(absPath);
  log.delete(path.relative(PROJECT_ROOT, absPath) || absPath);
}

function safeRemoveDir(absPath) {
  if (!fs.existsSync(absPath)) return;

  for (const entry of fs.readdirSync(absPath)) {
    const child = path.join(absPath, entry);
    const stat  = fs.lstatSync(child);

    if (stat.isDirectory()) {
      safeRemoveDir(child);
    } else {
      safeUnlink(child);
    }
  }

  fs.rmdirSync(absPath);
  log.rmdir(path.relative(PROJECT_ROOT, absPath) || absPath);
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

function main() {
  try {
    log.kv('root', PROJECT_ROOT);

    // -------------------------------------------------------------------------
    // Delete generated files (single-file artifacts)
    // -------------------------------------------------------------------------
    const filesToDelete = [
      // Metadata + env
      'dev/config/metadataStructure.json',
      '.env',
      'backend/config/envLoader.js',

      // SQL wiring
      'backend/data/factory/dataSourceRegistry.js',
      'backend/data/sql/sqlDatabase.js',
      'backend/data/sql/sql.driver.js',

      // Route registry
      'backend/routes/generated.routes.js',

      // Generated documentation (single-file docs)
      'docs/backend/generated/api.md',
      'docs/backend/generated/models.md',
      'docs/backend/generated/routes.md',
      'docs/backend/generated/services.md',
    ];

    for (const rel of filesToDelete) {
      safeUnlink(path.resolve(PROJECT_ROOT, rel));
    }

    // -------------------------------------------------------------------------
    // Delete generated directories (recursive)
    // -------------------------------------------------------------------------
    const dirsToRemove = [
      // Data layer
      'backend/data/sql/models',
      'backend/data/sql/services',

      // API surface
      'backend/controllers',
      'backend/routes',

      // Generated OpenAPI artifacts ONLY
      'docs/backend/generated/openapi',

      // Legacy swagger artefacts (if still present)
      'docs/backend/generated/swagger',
    ];

    for (const rel of dirsToRemove) {
      safeRemoveDir(path.resolve(PROJECT_ROOT, rel));
    }

    // NOTE — we intentionally DO NOT delete:
    // - docs/backend/generated/README.md   (handwritten index)
    // - docs/backend/testing/sqlscan/      (test artefacts, not generated docs)
    // - docs/backend/manual/               (handwritten docs)
    // - docs/internal / logs / ADRs etc.

    log.success();
  } catch (err) {
    log.failure(err);
    process.exit(1);
  }
}

main();

// -----------------------------------------------------------------------------
// End of generator script: reset.generated
// -----------------------------------------------------------------------------
