// -----------------------------------------------------------------------------
// HANDWRITTEN GENERATOR SCRIPT
//
// File       : dev/generators/generate.models.js
// Purpose    : Generates metadata-only model modules per source + entity.
// Writes     : backend/data/sql/models/<dialect>/<sourceKey>.<Entity>.model.js (and future json/mqtt/api equivalents)
// Reads      : dev/config/metadataStructure.json, dev/templates/codeTemplates/template.model.hbs
// Notes      : Models are metadata artifacts (not ORM models); services/controllers depend on this contract.
// -----------------------------------------------------------------------------

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
  sql:  'dev/templates/codeTemplates/template.model.hbs',
  json: 'dev/templates/codeTemplates/template.jsonModel.hbs',
  mqtt: 'dev/templates/codeTemplates/template.mqttModel.hbs',
  api:  'dev/templates/codeTemplates/template.apiModel.hbs',
};

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

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

function normalizeSqlColumns(entity) {
  const cols = Array.isArray(entity?.columns) ? entity.columns : [];
  const pk = entity?.primaryKey ? String(entity.primaryKey) : null;

  return cols.map((c) => {
    const name = String(c.name);
    const primaryKey = c.primaryKey === true || (pk && name === pk);

    return {
      name,
      type: c.type ?? 'text',
      notNull: Boolean(c.notNull) || primaryKey,
      primaryKey,
      defaultValue: c.defaultValue ?? null,
    };
  });
}

// -----------------------------------------------------------------------------
// Builders (future-ready)
// -----------------------------------------------------------------------------

function buildSqlJobsForSource(source, log) {
  const dialect = source.dialect.trim();
  const databaseName = source.databaseName.trim();
  const sourceKey = `${dialect}.${databaseName}`;

  log.source(sourceKey);

  const entities = Array.isArray(source.entities) ? source.entities : [];
  if (!entities.length) {
    log.kv('warning', `No entities for ${sourceKey}; skipping.`);
    return [];
  }

  const jobs = [];

  for (const entity of entities) {
    const entityName = entity?.entityName ? String(entity.entityName) : null;
    const tableName = entity?.tableName ? String(entity.tableName) : entityName;
    const primaryKey = entity?.primaryKey ? String(entity.primaryKey) : null;

    if (!entityName || !tableName) {
      log.kv('warning', `Skipping entity with missing entityName/tableName in ${sourceKey}`);
      continue;
    }

    if (!primaryKey) {
      log.kv('warning', `Skipping ${sourceKey}.${entityName} (no primaryKey)`);
      continue;
    }

    const columns = normalizeSqlColumns(entity);
    if (!columns.some((c) => c.primaryKey)) {
      log.kv('warning', `Skipping ${sourceKey}.${entityName} (no PK column detected)`);
      continue;
    }

    const context = {
      metadataVersion: METADATA_VERSION,

      sourceType: 'sql',
      sourceKey,

      dialect,
      databaseName,

      entityName,

      isSql: true,
      tableName,
      primaryKey,
      columns,
    };

    const fileName = `${sourceKey}.${entityName}.model.js`;
    const targetRelativePath = `backend/data/sql/models/${dialect}/${fileName}`;

    jobs.push({ targetRelativePath, context });
  }

  return jobs;
}

function buildJsonJobsForSource(source, log) {
  const sourceKey = source?.key ? String(source.key) : '(missing-key)';
  log.source(sourceKey);
  log.kv('warning', 'json model generation not implemented yet; skipping.');
  return [];
}

function buildMqttJobsForSource(source, log) {
  const sourceKey = source?.key ? String(source.key) : '(missing-key)';
  log.source(sourceKey);
  log.kv('warning', 'mqtt model generation not implemented yet; skipping.');
  return [];
}

function buildApiJobsForSource(source, log) {
  const sourceKey = source?.key ? String(source.key) : '(missing-key)';
  log.source(sourceKey);
  log.kv('warning', 'api model generation not implemented yet; skipping.');
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

export async function generateModels(options = {}) {
  const log = createStepLogger({
    step: 'models',
    title: 'Models',
    generatorPath: 'dev/generators/generate.models.js',
  });

  try {
    const metadataPath = options.metadataPath || METADATA_PATH;

    const metadata = loadJsonFromProject(metadataPath);
    assertMetadataVersion('models', metadata);

    const declaredSources = Array.isArray(metadata.dataSources)
      ? metadata.dataSources
      : [];
    const sources = Array.isArray(metadata.sources) ? metadata.sources : [];

    // Precise output (no glob noise)
    log.kv('output', 'backend/data/sql/models/<dialect>/');
    log.kv('sources', declaredSources.length ? declaredSources.join(', ') : '(none)');

    if (!sources.length) {
      log.kv('warning', 'metadata.sources[] is empty; nothing to generate.');
      log.success();
      return;
    }

    const sourcesByType = groupBy(
      sources,
      (s) => String(s?.type || '').trim().toLowerCase() || 'unknown',
    );

    for (const [type, typeSources] of sourcesByType.entries()) {
      const templateRelPath = TEMPLATES[type];
      const builder = BUILDERS[type];

      if (!templateRelPath || !builder) {
        log.kv('warning', `No model generator registered for source type "${type}"; skipping.`);
        continue;
      }

      log.template(templateRelPath);

      if (type === 'sql') {
        const dialects = uniqueInOrder(
          typeSources.filter(isSqlSource).map((s) => s.dialect.trim()),
        );
        if (dialects.length) log.kv('dialects', dialects.join(', '));
      }

      for (const source of typeSources) {
        if (type === 'sql' && !isSqlSource(source)) {
          log.kv('warning', 'Skipping invalid SQL source entry.');
          continue;
        }

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

generateModels().catch(() => process.exit(1));

// -----------------------------------------------------------------------------
// End of generator script: generate.models
// -----------------------------------------------------------------------------
