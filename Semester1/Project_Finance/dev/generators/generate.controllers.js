// -----------------------------------------------------------------------------
// HANDWRITTEN GENERATOR SCRIPT
//
// File       : dev/generators/generate.controllers.js
// Purpose    : Generates controller modules per source + dialect + entity.
// Writes     : backend/controllers/<sourceType>/<dialect>/<sourceKey>.<Entity>.controller.js
// Reads      : dev/config/metadataStructure.json, dev/templates/codeTemplates/template.controller.hbs
// Notes      : Controllers handle HTTP only and delegate to services; no business logic is generated.
// -----------------------------------------------------------------------------

import {
  generateFromTemplate,
  loadJsonFromProject,
  METADATA_VERSION,
  assertMetadataVersion,
} from './generate.template.js';

import { createStepLogger } from './_logger.js';

const TEMPLATE_REL_PATH = 'dev/templates/codeTemplates/template.controller.hbs';
const METADATA_PATH = 'dev/config/metadataStructure.json';

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function normalizeSources(metadata) {
  return Array.isArray(metadata?.sources) ? metadata.sources : [];
}

function normalizeEntities(source) {
  return Array.isArray(source?.entities) ? source.entities : [];
}

function isSqlSource(source) {
  return (
    source &&
    String(source.type || '').trim().toLowerCase() === 'sql' &&
    typeof source.dialect === 'string' &&
    source.dialect.trim() &&
    typeof source.databaseName === 'string' &&
    source.databaseName.trim()
  );
}

function uniqueInOrder(arr) {
  const out = [];
  for (const v of arr) if (!out.includes(v)) out.push(v);
  return out;
}

/**
 * Concrete source key rules:
 * - SQL:    "<dialect>.<databaseName>"
 * - Others: source.key (if present) else source.type
 */
function getSourceKey(source) {
  const type = String(source?.type || '').trim().toLowerCase() || 'unknown';

  if (type === 'sql' && isSqlSource(source)) {
    const dialect = source.dialect.trim();
    const db = source.databaseName.trim();
    return `${dialect}.${db}`;
  }

  if (source?.key) return String(source.key).trim();

  // fallback (keeps generator runnable even for incomplete future sources)
  return type;
}

/**
 * Computes the correct import path for backend/middleware/errorResponse.js
 * based on where the generated controller file will live.
 *
 * Example:
 * - backend/controllers/sql/sqlite/... => ../../../middleware/errorResponse.js
 * - backend/controllers/<sourceType>/... => ../../middleware/errorResponse.js
 */
function getErrorImportPath({ dialect, databaseName }) {
  // When dialect+databaseName exist, our controllers go into:
  // backend/controllers/<sourceType>/<dialect>/
  if (dialect && databaseName) return '../../../middleware/errorResponse.js';

  // Otherwise controllers go into:
  // backend/controllers/<sourceType>/
  return '../../middleware/errorResponse.js';
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

export async function generateControllers() {
  const log = createStepLogger({
    step: 'controllers',
    title: 'Controllers',
    generatorPath: 'dev/generators/generate.controllers.js',
  });

  try {
    // -------------------------------------------------------------
    // 1) Load metadata
    // -------------------------------------------------------------
    const metadata = loadJsonFromProject(METADATA_PATH);
    assertMetadataVersion('controllers', metadata);

    const declaredSources = Array.isArray(metadata?.dataSources) ? metadata.dataSources : [];
    const sources = normalizeSources(metadata);

    // Precise output label (not glob noise)
    log.kv('output', 'backend/controllers/<sourceType>/');
    log.kv('sources', declaredSources.length ? declaredSources.join(', ') : '(none)');
    log.template(TEMPLATE_REL_PATH);

    // Helpful context for SQL (stable ordering)
    const sqlDialects = uniqueInOrder(
      sources.filter(isSqlSource).map((s) => s.dialect.trim()),
    );
    if (sqlDialects.length) log.kv('dialects', sqlDialects.join(', '));

    if (!sources.length) {
      log.kv('warning', 'No sources found; nothing to generate.');
      log.success();
      return;
    }

    // -------------------------------------------------------------
    // 2) Generate controllers per source + entity
    // -------------------------------------------------------------
    for (const source of sources) {
      const sourceType = String(source?.type || '').trim().toLowerCase() || 'unknown';

      const dialect = source?.dialect ? String(source.dialect).trim() : null;
      const databaseName = source?.databaseName ? String(source.databaseName).trim() : null;

      const sourceKey = getSourceKey(source);

      // ✅ New logger rule: source boundary
      log.source(sourceKey);

      const entities = normalizeEntities(source);

      for (const entity of entities) {
        const entityName = entity?.entityName ? String(entity.entityName).trim() : null;
        if (!entityName) continue;

        const controllerFileName = `${sourceKey}.${entityName}.controller.js`;

        const targetRelativePath =
          dialect && databaseName
            ? `backend/controllers/${sourceType}/${dialect}/${controllerFileName}`
            : `backend/controllers/${sourceType}/${controllerFileName}`;

        // Service paths follow your current convention:
        // backend/data/<sourceType>/services/<dialect?>/<sourceKey>.<entity>.service.js
        const serviceImportPath =
          dialect && databaseName
            ? `../../../data/${sourceType}/services/${dialect}/${sourceKey}.${entityName}.service.js`
            : `../../../data/${sourceType}/services/${sourceKey}.${entityName}.service.js`;

        const routeBase = `/api/${sourceType}/${sourceKey}/${entityName.toLowerCase()}`;

        // ✅ FIX: correct middleware import path for the controller location
        const errorImportPath = getErrorImportPath({ dialect, databaseName });

        const context = {
          metadataVersion: METADATA_VERSION,

          // source
          sourceType,
          sourceKey,
          dialect,
          databaseName,

          // entity
          entityName,

          // controller specifics
          serviceImportPath,
          serviceVarName: `${entityName.toLowerCase()}Service`,
          routeBase,

          // ✅ new template input
          errorImportPath,
        };

        await generateFromTemplate({
          templateRelativePath: TEMPLATE_REL_PATH,
          targetRelativePath,
          context,
          overwrite: true,
        });

        log.write(targetRelativePath);
      }
    }

    log.success();
  } catch (err) {
    log.failure(err);
    process.exit(1);
  }
}

// -----------------------------------------------------------------------------
// CLI entry
// -----------------------------------------------------------------------------

generateControllers().catch(() => process.exit(1));

// -----------------------------------------------------------------------------
// End of generator script: generate.controllers
// -----------------------------------------------------------------------------
