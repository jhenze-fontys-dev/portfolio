// -----------------------------------------------------------------------------
// HANDWRITTEN GENERATOR SCRIPT
//
// File       : dev/generators/generate.openAPI.js
// Purpose    : Generates OpenAPI JSON specs and a manifest for Swagger multi-spec selection.
// Writes     : docs/backend/generated/openapi/sql/<sourceKey>.openapi.json, docs/backend/generated/openapi/openapi.manifest.json
// Reads      : dev/config/metadataStructure.json
// Notes      : No template is used because outputs must be valid JSON (no comments).
// -----------------------------------------------------------------------------

import fs from 'fs';
import path from 'path';
import process from 'process';
import { createStepLogger } from './_logger.js';

// -----------------------------------------------------------------------------
// Paths
// -----------------------------------------------------------------------------

const METADATA_REL = 'dev/config/metadataStructure.json';
const OUT_DIR_REL = 'docs/backend/generated/openapi';
const OUT_SQL_DIR_REL = 'docs/backend/generated/openapi/sql';
const MANIFEST_REL = 'docs/backend/generated/openapi/openapi.manifest.json';

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function toPosix(p) {
  return String(p).replace(/\\/g, '/');
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJsonOrThrow(absPath, friendlyName) {
  if (!fs.existsSync(absPath)) {
    throw new Error(`${friendlyName} missing at: ${absPath}`);
  }
  const raw = fs.readFileSync(absPath, 'utf8');
  return JSON.parse(raw);
}

function safeWriteJson(absPath, obj) {
  ensureDir(path.dirname(absPath));
  fs.writeFileSync(absPath, JSON.stringify(obj, null, 2), 'utf8');
}

function isSqlSource(s) {
  return (
    s &&
    s.type === 'sql' &&
    typeof s.dialect === 'string' &&
    s.dialect.trim() &&
    typeof s.databaseName === 'string' &&
    s.databaseName.trim() &&
    typeof s.dialect === 'string'
  );
}

function lowerFirst(str) {
  const s = String(str || '');
  if (!s) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function titleCase(s) {
  const x = String(s || '').trim();
  if (!x) return x;
  return x.charAt(0).toUpperCase() + x.slice(1);
}

// Very small plural safety: if your entityName is already plural (Attachments, Projects)
// this won’t change it; if not, it will still be fine for route grouping.
// Route generator already produces filenames like: attachments.routes.js, auditLog.routes.js
function entityRouteSegment(entityName) {
  return lowerFirst(entityName);
}

function mapSqlTypeToOpenApi(typeRaw) {
  const t = String(typeRaw || '').toLowerCase();

  // integers
  if (t.includes('int') || t.includes('serial') || t.includes('bigint') || t.includes('smallint')) {
    return { type: 'integer' };
  }

  // numeric/decimal/float
  if (
    t.includes('decimal') ||
    t.includes('numeric') ||
    t.includes('real') ||
    t.includes('double') ||
    t.includes('float')
  ) {
    return { type: 'number' };
  }

  // boolean
  if (t.includes('bool')) {
    return { type: 'boolean' };
  }

  // json
  if (t.includes('json')) {
    return { type: 'object' };
  }

  // date/time (best-effort)
  if (t.includes('date') || t.includes('time')) {
    return { type: 'string', format: 'date-time' };
  }

  // default string
  return { type: 'string' };
}

function buildEntitySchema(entity) {
  const columns = Array.isArray(entity?.columns) ? entity.columns : [];
  const props = {};
  const required = [];

  for (const col of columns) {
    const name = String(col?.name || '').trim();
    if (!name) continue;

    props[name] = mapSqlTypeToOpenApi(col?.type);

    // keep required conservative: notNull true -> required
    if (col?.notNull === true) required.push(name);
  }

  const schema = {
    type: 'object',
    properties: props,
  };

  if (required.length) schema.required = Array.from(new Set(required));

  return schema;
}

function buildCrudPaths({ sourceKey, entity, schemaRef }) {
  const entityName = String(entity?.entityName || entity?.tableName || '').trim();
  const pk = String(entity?.primaryKey || '').trim();
  const segment = entityRouteSegment(entityName);

  // Match your generated route base pattern:
  // /api/sql/<sourceKey>/<entitySegment>
  const base = `/api/sql/${sourceKey}/${segment}`;

  const tag = entityName; // dropdown per table/entity in Swagger UI
  const idParam = {
    name: 'id',
    in: 'path',
    required: true,
    schema: { type: 'integer' },
  };

  // if pk isn’t numeric you can improve later; controller currently validates numeric id anyway.
  const paths = {};

  // GET all + POST create
  paths[base] = {
    get: {
      tags: [tag],
      summary: `List ${entityName}`,
      operationId: `${sourceKey}.${entityName}.getAll`,
      responses: {
        200: {
          description: 'OK',
          content: {
            'application/json': {
              schema: { type: 'array', items: { $ref: schemaRef } },
            },
          },
        },
      },
    },
    post: {
      tags: [tag],
      summary: `Create ${entityName}`,
      operationId: `${sourceKey}.${entityName}.create`,
      requestBody: {
        required: true,
        content: {
          'application/json': { schema: { $ref: schemaRef } },
        },
      },
      responses: {
        201: {
          description: 'Created',
          content: {
            'application/json': { schema: { $ref: schemaRef } },
          },
        },
      },
    },
  };

  // GET by id + PUT + DELETE
  paths[`${base}/{id}`] = {
    get: {
      tags: [tag],
      summary: `Get ${entityName} by id`,
      operationId: `${sourceKey}.${entityName}.getById`,
      parameters: [idParam],
      responses: {
        200: {
          description: 'OK',
          content: {
            'application/json': { schema: { $ref: schemaRef } },
          },
        },
        404: { description: 'Not Found' },
      },
    },
    put: {
      tags: [tag],
      summary: `Update ${entityName} by id`,
      operationId: `${sourceKey}.${entityName}.update`,
      parameters: [idParam],
      requestBody: {
        required: true,
        content: {
          'application/json': { schema: { $ref: schemaRef } },
        },
      },
      responses: {
        200: {
          description: 'OK',
          content: {
            'application/json': { schema: { $ref: schemaRef } },
          },
        },
        404: { description: 'Not Found' },
      },
    },
    delete: {
      tags: [tag],
      summary: `Delete ${entityName} by id`,
      operationId: `${sourceKey}.${entityName}.remove`,
      parameters: [idParam],
      responses: {
        200: { description: 'OK' },
        404: { description: 'Not Found' },
      },
    },
  };

  // Search (controller supports /search with querystring)
  paths[`${base}/search`] = {
    get: {
      tags: [tag],
      summary: `Search ${entityName}`,
      operationId: `${sourceKey}.${entityName}.search`,
      responses: {
        200: {
          description: 'OK',
          content: {
            'application/json': {
              schema: { type: 'array', items: { $ref: schemaRef } },
            },
          },
        },
      },
    },
  };

  return { paths, tag, pk };
}

function buildOpenApiForSqlSource(source) {
  const dialect = source.dialect.trim();
  const databaseName = source.databaseName.trim();
  const sourceKey = `${dialect}.${databaseName}`;

  const entities = Array.isArray(source.entities) ? source.entities : [];

  const components = { schemas: {} };
  const tags = [];
  const paths = {};

  for (const entity of entities) {
    const entityName = String(entity?.entityName || entity?.tableName || '').trim();
    if (!entityName) continue;

    const schemaName = entityName; // keep schema names stable + readable
    const schema = buildEntitySchema(entity);

    components.schemas[schemaName] = schema;

    const schemaRef = `#/components/schemas/${schemaName}`;
    const { paths: entityPaths, tag } = buildCrudPaths({ sourceKey, entity, schemaRef });

    tags.push({ name: tag, description: `Endpoints for ${tag}` });

    for (const [p, spec] of Object.entries(entityPaths)) {
      paths[p] = spec;
    }
  }

  // Deduplicate tags (in case of weird entity duplication)
  const tagsUnique = [];
  const seen = new Set();
  for (const t of tags) {
    if (!seen.has(t.name)) {
      tagsUnique.push(t);
      seen.add(t.name);
    }
  }

  // Sort tags to keep stable output
  tagsUnique.sort((a, b) => a.name.localeCompare(b.name));

  // Stable sorting for paths output (optional, but nice)
  const sortedPaths = {};
  for (const k of Object.keys(paths).sort((a, b) => a.localeCompare(b))) {
    sortedPaths[k] = paths[k];
  }

  const openapi = {
    openapi: '3.0.3',
    info: {
      title: `API — ${sourceKey}`,
      version: '1.0.0',
      description: `Auto-generated OpenAPI spec for source ${sourceKey}`,
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local dev server' },
    ],
    tags: tagsUnique,
    paths: sortedPaths,
    components,
  };

  return { sourceKey, openapi };
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

export async function generateOpenAPI() {
  const projectRoot = process.cwd();

  const log = createStepLogger({
    step: 'openapi',
    title: 'OpenAPI',
    generatorPath: 'dev/generators/generate.openAPI.js',
    projectRoot,
  });

  try {
    const metadataAbs = path.resolve(projectRoot, METADATA_REL);
    const metadata = readJsonOrThrow(metadataAbs, 'metadataStructure.json');

    const sources = Array.isArray(metadata.sources) ? metadata.sources : [];
    const sqlSources = sources.filter(isSqlSource);

    log.kv('sources', (Array.isArray(metadata.dataSources) ? metadata.dataSources.join(', ') : 'sql') || 'sql');
    log.kv('output', toPosix(OUT_DIR_REL));
    log.kv('template', 'none');

    if (!sqlSources.length) {
      log.kv('warning', 'No SQL sources found; no OpenAPI specs generated.');
      log.success();
      return;
    }

    const outDirAbs = path.resolve(projectRoot, OUT_SQL_DIR_REL);
    ensureDir(outDirAbs);

    const manifest = {
      generatedAt: new Date().toISOString(),
      specs: [],
    };

    for (const source of sqlSources) {
      const { sourceKey, openapi } = buildOpenApiForSqlSource(source);

      log.source(sourceKey);

      const outFileRel = `${OUT_SQL_DIR_REL}/${sourceKey}.openapi.json`;
      const outFileAbs = path.resolve(projectRoot, outFileRel);

      safeWriteJson(outFileAbs, openapi);
      log.write(toPosix(outFileRel));

      manifest.specs.push({
        type: 'sql',
        key: sourceKey,
        file: toPosix(outFileRel),
        // nice display name for Swagger UI urls dropdown
        name: `sql:${sourceKey}`,
      });
    }

    // Stable order in manifest
    manifest.specs.sort((a, b) => a.name.localeCompare(b.name));

    const manifestAbs = path.resolve(projectRoot, MANIFEST_REL);
    safeWriteJson(manifestAbs, manifest);
    log.write(toPosix(MANIFEST_REL));

    log.success();
  } catch (err) {
    log.failure(err);
    process.exit(1);
  }
}

// -----------------------------------------------------------------------------
// CLI entry
// -----------------------------------------------------------------------------

generateOpenAPI().catch(() => process.exit(1));

// -----------------------------------------------------------------------------
// End of generator script: generate.openAPI
// -----------------------------------------------------------------------------
