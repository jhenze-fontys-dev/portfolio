// -----------------------------------------------------------------------------
// HANDWRITTEN GENERATOR SCRIPT
//
// File       : dev/generators/generate.routes.js
// Purpose    : Generates Express route modules per source + dialect + entity.
// Writes     : backend/routes/sql/<dialect>/<sourceKey>.<entity>.routes.js
// Reads      : dev/config/metadataStructure.json, dev/templates/codeTemplates/template.routes.hbs
// Notes      : Emits routing modules only; mounting is handled by the route registry generator.
// -----------------------------------------------------------------------------

import {
  generateFromTemplate,
  loadJsonFromProject,
  assertMetadataVersion,
} from './generate.template.js';

import { createStepLogger } from './_logger.js';

const METADATA_PATH = 'dev/config/metadataStructure.json';
const TEMPLATE_REL_PATH = 'dev/templates/codeTemplates/template.routes.hbs';

const ROUTES_BASE_DIR = 'backend/routes';

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function lowerFirst(s) {
  const str = String(s || '');
  if (!str) return str;
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function pluralize(name) {
  return name.endsWith('s') ? name : `${name}s`;
}

function isSqlSource(s) {
  return (
    s &&
    s.type === 'sql' &&
    typeof s.dialect === 'string' &&
    s.dialect.trim() &&
    typeof s.databaseName === 'string' &&
    s.databaseName.trim()
  );
}

function uniqueInOrder(arr) {
  const out = [];
  for (const v of arr) if (!out.includes(v)) out.push(v);
  return out;
}

function safeFileKey(s) {
  return String(s).replace(/[^a-zA-Z0-9_.-]/g, '_');
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

export async function generateRoutes(options = {}) {
  const log = createStepLogger({
    step: 'routes',
    title: 'Routes',
    generatorPath: 'dev/generators/generate.routes.js',
  });

  try {
    const metadataPath = options.metadataPath || METADATA_PATH;

    const metadata = loadJsonFromProject(metadataPath);
    assertMetadataVersion('routes', metadata);

    const sources = Array.isArray(metadata.sources) ? metadata.sources : [];
    const sqlSources = sources.filter(isSqlSource);

    log.kv('output', 'backend/routes/sql/<dialect>/');
    log.kv('sources', 'sql');
    log.template(TEMPLATE_REL_PATH);

    if (!sqlSources.length) {
      log.kv('warning', 'No SQL sources found; nothing to generate.');
      log.success();
      return;
    }

    const dialects = uniqueInOrder(sqlSources.map(s => s.dialect.trim()));
    if (dialects.length) log.kv('dialects', dialects.join(', '));

    for (const source of sqlSources) {
      const dialect = source.dialect.trim();
      const databaseName = source.databaseName.trim();
      const sourceKey = `${dialect}.${databaseName}`;

      // log.source(...) defines the source boundary.
      log.source(sourceKey);

      const entities = Array.isArray(source.entities) ? source.entities : [];
      if (!entities.length) {
        log.kv('warning', `No entities for ${sourceKey}; skipping.`);
        continue;
      }

      for (const entity of entities) {
        const entityName = entity?.entityName ? String(entity.entityName) : null;
        if (!entityName) {
          log.kv('warning', `Skipping entity without entityName in ${sourceKey}`);
          continue;
        }

        const primaryKey = entity?.primaryKey ? String(entity.primaryKey) : null;
        if (!primaryKey) {
          // Keep consistent with models/services/controllers: PK required for CRUD
          log.kv('warning', `Skipping ${sourceKey}.${entityName} (no primaryKey)`);
          continue;
        }

        const entityLower = lowerFirst(entityName);
        const plural = pluralize(entityLower);

        // Controller filename convention (matches your controllers generator):
        // backend/controllers/sql/<dialect>/<sourceKey>.<entityLower>.controller.js
        const fileKey = safeFileKey(sourceKey);
        const controllerFileName = `${fileKey}.${entityLower}.controller.js`;

        // Route filename convention:
        // backend/routes/sql/<dialect>/<sourceKey>.<entityLower>.routes.js
        const routesFileName = `${fileKey}.${entityLower}.routes.js`;
        const targetRelativePath = `${ROUTES_BASE_DIR}/sql/${dialect}/${routesFileName}`;

        // From backend/routes/sql/<dialect>/ -> backend/controllers/sql/<dialect>/
        const controllerImportPath = `../../../controllers/sql/${dialect}/${controllerFileName}`;

        // IMPORTANT: routeBase includes sourceKey so routing is explicit
        const routeBase = `/api/sql/${sourceKey}/${plural}`;

        const context = {
          // identity
          sourceType: 'sql',
          sourceKey,
          dialect,
          databaseName,

          entityName,
          entityNameLower: entityLower,
          primaryKey,

          // routes
          routesFileName,
          controllerImportPath,
          routeBase,
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

generateRoutes().catch(() => process.exit(1));

// -----------------------------------------------------------------------------
// End of generator script: generate.routes
// -----------------------------------------------------------------------------
