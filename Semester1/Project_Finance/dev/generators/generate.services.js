// -----------------------------------------------------------------------------
// HANDWRITTEN GENERATOR SCRIPT
//
// File       : dev/generators/generate.services.js
// Purpose    : Generates service modules per source + dialect + entity.
// Writes     : backend/data/sql/services/<dialect>/<sourceKey>.<Entity>.service.js (and future json/mqtt/api equivalents)
// Reads      : dev/config/metadataStructure.json, dev/templates/codeTemplates/template.service.hbs (plus type-specific templates when enabled)
// Notes      : Services implement safe CRUD and are the only layer that touches drivers directly.
// -----------------------------------------------------------------------------

import path from 'path';

import {
  generateFromTemplate,
  loadJsonFromProject,
  METADATA_VERSION,
  assertMetadataVersion,
} from './generate.template.js';

import { createStepLogger } from './_logger.js';

const METADATA_PATH = 'dev/config/metadataStructure.json';

// -----------------------------------------------------------------------------
// Templates per source type (future-ready)
// -----------------------------------------------------------------------------

const TEMPLATES = {
  sql: 'dev/templates/codeTemplates/template.service.hbs',
  json: 'dev/templates/codeTemplates/template.jsonService.hbs',
  mqtt: 'dev/templates/codeTemplates/template.mqttService.hbs',
  api: 'dev/templates/codeTemplates/template.apiService.hbs',
};

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function lowerFirst(s) {
  const str = String(s || '');
  if (!str) return str;
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function groupBy(arr, keyFn) {
  const m = new Map();
  for (const item of arr) {
    const k = keyFn(item);
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(item);
  }
  return m;
}

function uniqueInOrder(arr) {
  const out = [];
  for (const v of arr) if (!out.includes(v)) out.push(v);
  return out;
}

function isSqlSource(source) {
  return (
    source &&
    source.type === 'sql' &&
    typeof source.dialect === 'string' &&
    source.dialect.trim() &&
    typeof source.databaseName === 'string' &&
    source.databaseName.trim()
  );
}

function logOutputsForPresentTypes(log, sourcesByType) {
  // Model-led: log the *real* base path per type that exists in metadata.
  // No globs, no "**" noise.
  if (sourcesByType.has('sql')) log.kv('output', 'backend/data/sql/services/<dialect>/');
  if (sourcesByType.has('json')) log.kv('output', 'backend/data/json/services/');
  if (sourcesByType.has('mqtt')) log.kv('output', 'backend/data/mqtt/services/');
  if (sourcesByType.has('api')) log.kv('output', 'backend/data/api/services/');
}

/**
 * Build a stable relative import path (POSIX style) from one generated file
 * to another project-relative file.
 */
function relativeImportPath(fromFileRel, toFileRel) {
  const fromDir = path.posix.dirname(fromFileRel);
  let rel = path.posix.relative(fromDir, toFileRel);

  // Ensure it is a valid relative import in ESM (must start with ./ or ../)
  if (!rel.startsWith('.')) rel = `./${rel}`;

  return rel;
}

// -----------------------------------------------------------------------------
// Type-specific builders (future-ready)
//   - Each returns an array of "jobs": { targetRelativePath, context }
// -----------------------------------------------------------------------------

function buildSqlJobsForSource(source, log) {
  const dialect = source.dialect.trim();
  const databaseName = source.databaseName.trim();
  const sourceKey = `${dialect}.${databaseName}`;

  // log.source(...) defines the source boundary.
  log.source(sourceKey);

  const entities = Array.isArray(source.entities) ? source.entities : [];
  if (!entities.length) {
    log.kv('warning', `No entities for ${sourceKey}; skipping.`);
    return [];
  }

  const jobs = [];

  for (const entity of entities) {
    const entityName = entity?.entityName ? String(entity.entityName) : null;
    if (!entityName) {
      log.kv('warning', `Skipping entity without entityName in ${sourceKey}`);
      continue;
    }

    // Keep contract aligned with models: require primaryKey present in metadata
    const primaryKey = entity?.primaryKey ? String(entity.primaryKey) : null;
    if (!primaryKey) {
      log.kv('warning', `Skipping ${sourceKey}.${entityName} (no primaryKey)`);
      continue;
    }

    const serviceFileName = `${sourceKey}.${entityName}.service.js`;
    const targetRelativePath = `backend/data/sql/services/${dialect}/${serviceFileName}`;

    // Models are written as:
    // backend/data/sql/models/<dialect>/<sourceKey>.<entityName>.model.js
    const modelFileName = `${sourceKey}.${entityName}.model.js`;

    // IMPORTANT: services/<dialect>/ -> sql/ -> models/<dialect>/
    // backend/data/sql/services/sqlite/foo.service.js
    // => ../../models/sqlite/foo.model.js
    const modelImportPath = `../../models/${dialect}/${modelFileName}`;

    // Registry is at:
    // backend/data/factory/dataSourceRegistry.js
    const registryImportPath = relativeImportPath(
      targetRelativePath,
      'backend/data/factory/dataSourceRegistry.js',
    );

    const context = {
      metadataVersion: METADATA_VERSION,

      // universal identity (matches model template header fields)
      sourceType: 'sql',
      sourceKey,
      dialect,
      databaseName,

      entityName,
      entityNameLower: lowerFirst(entityName),

      // for template header consistency
      generatorPath: 'dev/generators/generate.services.js',
      templatePath: 'dev/templates/codeTemplates/template.service.hbs',

      // service imports the metadata model + registry
      modelImportPath,
      registryImportPath,

      // legacy/backwards compat (can be removed once template no longer needs them)
      modelName: entityName,
      primaryKey,
    };

    jobs.push({ targetRelativePath, context });
  }

  return jobs;
}

function buildJsonJobsForSource(source, log) {
  const sourceKey = source?.key ? String(source.key) : '(missing-key)';
  
  // log.source(...) defines the source boundary.
  log.source(sourceKey);
  log.kv('warning', 'json service generation not implemented yet; skipping.');
  return [];
}

function buildMqttJobsForSource(source, log) {
  const sourceKey = source?.key ? String(source.key) : '(missing-key)';

  // log.source(...) defines the source boundary.
  log.source(sourceKey);
  log.kv('warning', 'mqtt service generation not implemented yet; skipping.');
  return [];
}

function buildApiJobsForSource(source, log) {
  const sourceKey = source?.key ? String(source.key) : '(missing-key)';

  // log.source(...) defines the source boundary.
  log.source(sourceKey);
  log.kv('warning', 'api service generation not implemented yet; skipping.');
  return [];
}

const BUILDERS = {
  sql: buildSqlJobsForSource,
  json: buildJsonJobsForSource,
  mqtt: buildMqttJobsForSource,
  api: buildApiJobsForSource,
};

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

export async function generateServices(options = {}) {
  const log = createStepLogger({
    step: 'services',
    title: 'Services',
    generatorPath: 'dev/generators/generate.services.js',
  });

  try {
    const metadataPath = options.metadataPath || METADATA_PATH;

    const metadata = loadJsonFromProject(metadataPath);
    assertMetadataVersion('services', metadata);

    const declaredDataSources = Array.isArray(metadata.dataSources) ? metadata.dataSources : [];
    const sources = Array.isArray(metadata.sources) ? metadata.sources : [];

    log.kv('sources', declaredDataSources.length ? declaredDataSources.join(', ') : '(none)');

    if (!sources.length) {
      log.kv('warning', 'metadata.sources[] is empty; nothing to generate.');
      log.success();
      return;
    }

    const sourcesByType = groupBy(
      sources,
      (s) => String(s?.type || '').trim().toLowerCase() || 'unknown',
    );

    // Precise outputs: one per type that exists in metadata
    logOutputsForPresentTypes(log, sourcesByType);

    for (const [type, typeSources] of sourcesByType.entries()) {
      const templateRelPath = TEMPLATES[type];
      const builder = BUILDERS[type];

      // Unified wording — matches models
      if (!templateRelPath || !builder) {
        log.kv('warning', `No service generator registered for source type "${type}"; skipping.`);
        continue;
      }

      // Log template once per type (not per file)
      log.template(templateRelPath);

      // Optional: for SQL, show dialect list (useful context)
      if (type === 'sql') {
        const sqlSources = typeSources.filter(isSqlSource);
        const dialects = uniqueInOrder(sqlSources.map((s) => s.dialect.trim()));
        if (dialects.length) log.kv('dialects', dialects.join(', '));
      }

      for (const source of typeSources) {
        if (type === 'sql' && !isSqlSource(source)) {
          log.kv('warning', 'Skipping invalid SQL source entry.');
          continue;
        }

        // Builder logs source boundary + warnings
        const jobs = builder(source, log);

        for (const job of jobs) {
          await generateFromTemplate({
            templateRelativePath: templateRelPath,
            targetRelativePath: job.targetRelativePath,
            context: job.context,
            overwrite: true,
          });

          log.write(job.targetRelativePath);
        }
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

generateServices().catch(() => process.exit(1));

// -----------------------------------------------------------------------------
// End of generator script: generate.services
// -----------------------------------------------------------------------------
