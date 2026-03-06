// -----------------------------------------------------------------------------
// HANDWRITTEN GENERATOR SCRIPT
//
// File       : dev/generators/generate.routeRegistry.js
// Purpose    : Generates the central Express route registry that mounts all generated routes.
// Writes     : backend/routes/generated.routes.js
// Reads      : dev/config/metadataStructure.json, dev/templates/codeTemplates/template.routeRegistry.hbs
// Notes      : Produces one stable entrypoint; runtime does not scan the filesystem for routes.
// -----------------------------------------------------------------------------

import {
  generateFromTemplate,
  loadJsonFromProject,
  assertMetadataVersion,
  getProjectRoot,
} from './generate.template.js';

import { createStepLogger } from './_logger.js';

const TEMPLATE_REL_PATH = 'dev/templates/codeTemplates/template.routeRegistry.hbs';
const METADATA_REL_PATH = 'dev/config/metadataStructure.json';
const OUTPUT_REL_PATH = 'backend/routes/generated.routes.js';

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function isSqlSource(s) {
  return (
    s &&
    String(s.type || '').trim().toLowerCase() === 'sql' &&
    typeof s.dialect === 'string' &&
    s.dialect.trim() &&
    typeof s.databaseName === 'string' &&
    s.databaseName.trim()
  );
}

function getSourceKey(sqlSource) {
  return `${sqlSource.dialect.trim()}.${sqlSource.databaseName.trim()}`;
}

function lowerFirst(s) {
  const str = String(s || '');
  if (!str) return str;
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function makeImportVarName({ sourceType, sourceKey, routeName }) {
  // deterministic + readable, avoids collisions
  // e.g. r_sql_sqlite_fullstack_test_projects
  const safe = `${sourceType}_${sourceKey}_${routeName}`
    .replace(/[^\w]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
  return `r_${safe}`;
}

function buildSqlRouteImport({ dialect, sourceKey, entityName }) {
  const routeName = lowerFirst(entityName); // matches your routes generator naming
  const fileName = `${sourceKey}.${routeName}.routes.js`;

  // This registry file lives in: backend/routes/
  // Generated route file lives in: backend/routes/sql/<dialect>/<fileName>
  const importPath = `./sql/${dialect}/${fileName}`;

  const varName = makeImportVarName({
    sourceType: 'sql',
    sourceKey,
    routeName,
  });

  return { varName, importPath, sourceKey, dialect, entityName };
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

export async function generateRouteRegistry() {
  const projectRoot = getProjectRoot ? getProjectRoot() : process.cwd();

  const log = createStepLogger({
    step: 'route-registry',
    title: 'Route Registry',
    generatorPath: 'dev/generators/generate.routeRegistry.js',
    projectRoot,
  });

  try {
    const metadata = loadJsonFromProject(METADATA_REL_PATH);
    assertMetadataVersion('route-registry', metadata);

    const sources = Array.isArray(metadata.sources) ? metadata.sources : [];
    const sqlSources = sources.filter(isSqlSource);

    log.kv('output', OUTPUT_REL_PATH);
    log.kv('sources', (metadata.dataSources || ['sql']).join(', '));
    log.template(TEMPLATE_REL_PATH);

    const sqlRouteImports = [];

    for (const source of sqlSources) {
      const dialect = source.dialect.trim();
      const sourceKey = getSourceKey(source);

      // Source boundary (preferred)
      if (typeof log.source === 'function') log.source(sourceKey);
      else log.kv('source', sourceKey);

      const entities = Array.isArray(source.entities) ? source.entities : [];
      for (const entity of entities) {
        const entityName = entity?.entityName ? String(entity.entityName) : null;
        const primaryKey = entity?.primaryKey ? String(entity.primaryKey) : null;

        // Keep consistent with models/services/routes: skip entities without PK
        if (!entityName || !primaryKey) continue;

        sqlRouteImports.push(
          buildSqlRouteImport({ dialect, sourceKey, entityName }),
        );
      }
    }

    // Future-ready flags (template supports these)
    const context = {
      hasSql: sqlRouteImports.length > 0,
      hasJson: false,
      hasMqtt: false,
      hasApi: false,

      sqlRouteImports,
      jsonRouteImports: [],
      mqttRouteImports: [],
      apiRouteImports: [],
    };

    await generateFromTemplate({
      templateRelativePath: TEMPLATE_REL_PATH,
      targetRelativePath: OUTPUT_REL_PATH,
      context,
      overwrite: true,
    });

    log.write(OUTPUT_REL_PATH);
    log.success();
  } catch (err) {
    log.failure(err);
    process.exit(1);
  }
}

// -----------------------------------------------------------------------------
// CLI entry
// -----------------------------------------------------------------------------

generateRouteRegistry().catch(() => process.exit(1));

// -----------------------------------------------------------------------------
// End of generator script: generate.routeRegistry
// -----------------------------------------------------------------------------
