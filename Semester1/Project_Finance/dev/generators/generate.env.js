// -----------------------------------------------------------------------------
// HANDWRITTEN GENERATOR SCRIPT
//
// File       : dev/generators/generate.env.js
// Purpose    : Generates runtime environment configuration artifacts.
// Writes     : .env, backend/config/envLoader.js
// Reads      : .env.startup, dev/config/metadataStructure.json, dev/templates/configTemplates/template.envLoader.js
// Notes      : Produces a stable .env merged from startup + metadata-driven defaults.
// -----------------------------------------------------------------------------

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createStepLogger } from './_logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root = dev/generators -> dev -> project root
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

const STARTUP_ENV_PATH = path.join(PROJECT_ROOT, '.env.startup');
const OUTPUT_ENV_PATH = path.join(PROJECT_ROOT, '.env');

const METADATA_PATH_DEFAULT = './dev/config/metadataStructure.json';
const METADATA_PATH_ABS = path.join(PROJECT_ROOT, 'dev', 'config', 'metadataStructure.json');

const ENV_LOADER_TEMPLATE_PATH = path.join(
  PROJECT_ROOT,
  'dev',
  'templates',
  'configTemplates',
  'template.envLoader.js'
);
const ENV_LOADER_OUTPUT_PATH = path.join(PROJECT_ROOT, 'backend', 'config', 'envLoader.js');

// -----------------------------------------------------------------------------
// Generic helpers
// -----------------------------------------------------------------------------

function ensureDirForFile(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const raw = fs.readFileSync(filePath, 'utf-8');
  const env = {};

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;

    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();

    env[key] = val;
  }
  return env;
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`metadataStructure.json not found at: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function getPostgresField(key, startupEnv, fallback) {
  return startupEnv[key] || process.env[key] || fallback;
}

// -----------------------------------------------------------------------------
// Metadata extraction
// -----------------------------------------------------------------------------

function extractSqlDialects(metadata) {
  if (Array.isArray(metadata.sources)) {
    const sqlSources = metadata.sources.filter(s => s && s.type === 'sql' && s.dialect);
    // preserve first appearance
    const out = [];
    for (const s of sqlSources) {
      const d = String(s.dialect).trim();
      if (d && !out.includes(d)) out.push(d);
    }
    return out;
  }
  if (metadata?.database?.dialect) return [String(metadata.database.dialect).trim()];
  return [];
}

function extractSqliteDbFile(metadata, startupEnv) {
  if (Array.isArray(metadata.sources)) {
    const sqlite = metadata.sources.find(
      s => s && s.type === 'sql' && String(s.dialect).toLowerCase() === 'sqlite'
    );
    const file = sqlite?.storage?.file;
    if (file) return String(file);
  }

  if (metadata?.database?.storage) return String(metadata.database.storage);
  if (startupEnv.SQLITE_DB_FILE) return startupEnv.SQLITE_DB_FILE;
  return './backend/data/sql/databases/fullstack_test.db';
}

// -----------------------------------------------------------------------------
// Multi-source env helpers
// -----------------------------------------------------------------------------

function sanitizeEnvToken(s) {
  return String(s)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function envPrefixForSource(src) {
  return sanitizeEnvToken(`${src.dialect}_${src.databaseName}`);
}

function getSqlSources(metadata) {
  const sources = Array.isArray(metadata?.sources) ? metadata.sources : [];
  return sources.filter(s => s && s.type === 'sql' && s.dialect && s.databaseName);
}

function renderPerSourceSqlEnvLines({ metadata, startupEnv, sqliteDbFile }) {
  const lines = [];
  const sqlSources = getSqlSources(metadata);

  for (const src of sqlSources) {
    const dialect = String(src.dialect).toLowerCase();
    const dbName = String(src.databaseName);
    const prefix = envPrefixForSource({ dialect, databaseName: dbName });

    if (dialect === 'sqlite') {
      const file = src?.storage?.file ? String(src.storage.file) : sqliteDbFile;
      lines.push(`${prefix}_DB_FILE=${file}`);
      continue;
    }

    if (dialect === 'postgres') {
      const host =
        (src?.connection?.host ? String(src.connection.host) : null) ||
        getPostgresField('POSTGRES_DB_HOST', startupEnv, 'localhost');

      const port =
        (src?.connection?.port ? String(src.connection.port) : null) ||
        getPostgresField('POSTGRES_DB_PORT', startupEnv, '5432');

      const name =
        (src?.databaseName ? String(src.databaseName) : null) ||
        getPostgresField('POSTGRES_DB_NAME', startupEnv, 'fullstack_test');

      const user = getPostgresField('POSTGRES_DB_USER', startupEnv, 'postgres');
      const password = getPostgresField('POSTGRES_DB_PASSWORD', startupEnv, 'YOUR_PASSWORD');

      lines.push(`${prefix}_DB_HOST=${host}`);
      lines.push(`${prefix}_DB_PORT=${port}`);
      lines.push(`${prefix}_DB_NAME=${name}`);
      lines.push(`${prefix}_DB_USER=${user}`);
      lines.push(`${prefix}_DB_PASSWORD=${password}`);
      continue;
    }
  }

  return lines;
}

// -----------------------------------------------------------------------------
// .env rendering
// -----------------------------------------------------------------------------

function renderEnvFile({ startupEnv, metadata, dialects, sqliteDbFile, includePostgres, metadataPath }) {
  const nodeEnv = startupEnv.NODE_ENV || 'development';
  const port = startupEnv.PORT || '3000';
  const logScheme = startupEnv.LOG_SCHEME || 'swagger';

  const dataSources = startupEnv.DATA_SOURCES || (metadata?.dataSources?.join(',') ?? 'sql');

  const lines = [];

  lines.push(`NODE_ENV=${nodeEnv}`);
  lines.push(`PORT=${port}`);
  lines.push(`LOG_SCHEME=${logScheme}`);
  lines.push('');
  lines.push(`DATA_SOURCES=${dataSources}`);
  lines.push(`DB_DIALECT_LIST=${dialects.length ? dialects.join(',') : ''}`);

  if (dialects.includes('sqlite')) {
    lines.push('');
    lines.push(`SQLITE_DB_FILE=${sqliteDbFile}`);
  }

  lines.push('');
  lines.push(`METADATA_PATH=${metadataPath}`);

  if (includePostgres) {
    lines.push(`POSTGRES_DB_HOST=${getPostgresField('POSTGRES_DB_HOST', startupEnv, 'localhost')}`);
    lines.push(`POSTGRES_DB_PORT=${getPostgresField('POSTGRES_DB_PORT', startupEnv, '5432')}`);
    lines.push(`POSTGRES_DB_NAME=${getPostgresField('POSTGRES_DB_NAME', startupEnv, 'fullstack_test')}`);
    lines.push(`POSTGRES_DB_USER=${getPostgresField('POSTGRES_DB_USER', startupEnv, 'postgres')}`);
    lines.push(`POSTGRES_DB_PASSWORD=${getPostgresField('POSTGRES_DB_PASSWORD', startupEnv, 'YOUR_PASSWORD')}`);
    lines.push(
      `POSTGRES_PSQL_BIN=${getPostgresField(
        'POSTGRES_PSQL_BIN',
        startupEnv,
        'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe'
      )}`
    );
  }

  const perSourceLines = renderPerSourceSqlEnvLines({ metadata, startupEnv, sqliteDbFile });
  if (perSourceLines.length) {
    lines.push('');
    lines.push('# Per-source SQL env vars (generated from metadata.sources[])');
    lines.push(...perSourceLines);
  }

  lines.push('');
  return lines.join('\n');
}

// -----------------------------------------------------------------------------
// envLoader.js generation (template copy)
// -----------------------------------------------------------------------------

function generateEnvLoader() {
  if (!fs.existsSync(ENV_LOADER_TEMPLATE_PATH)) {
    throw new Error(`envLoader template not found at: ${ENV_LOADER_TEMPLATE_PATH}`);
  }

  const content = fs.readFileSync(ENV_LOADER_TEMPLATE_PATH, 'utf-8');
  ensureDirForFile(ENV_LOADER_OUTPUT_PATH);
  fs.writeFileSync(ENV_LOADER_OUTPUT_PATH, content, 'utf-8');

  return ENV_LOADER_OUTPUT_PATH;
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

async function main() {
  const log = createStepLogger({
    step: 'env',
    title: 'Environment',
    generatorPath: 'dev/generators/generate.env.js',
    projectRoot: PROJECT_ROOT,
  });

  try {
    if (!fs.existsSync(STARTUP_ENV_PATH)) {
      log.kv('warning', `missing ${path.relative(PROJECT_ROOT, STARTUP_ENV_PATH)}`);
    }

    const startupEnv = parseEnvFile(STARTUP_ENV_PATH);
    const metadata = readJson(METADATA_PATH_ABS);

    const dialects = extractSqlDialects(metadata);
    const sqliteDbFile = extractSqliteDbFile(metadata, startupEnv);
    const includePostgres = dialects.includes('postgres');

    const dataSources = startupEnv.DATA_SOURCES || (metadata?.dataSources?.join(',') ?? 'sql');

    log.kv('output', path.relative(PROJECT_ROOT, OUTPUT_ENV_PATH));
    log.kv('sources', dataSources || '(none)');
    log.kv('dialects', dialects.length ? dialects.join(', ') : '(none)');

    const envText = renderEnvFile({
      startupEnv,
      metadata,
      dialects,
      sqliteDbFile,
      includePostgres,
      metadataPath: METADATA_PATH_DEFAULT,
    });

    fs.writeFileSync(OUTPUT_ENV_PATH, envText, 'utf-8');
    log.write(path.relative(PROJECT_ROOT, OUTPUT_ENV_PATH));

    log.template(path.relative(PROJECT_ROOT, ENV_LOADER_TEMPLATE_PATH));
    const loaderOut = generateEnvLoader();
    log.write(path.relative(PROJECT_ROOT, loaderOut));

    log.success();
  } catch (err) {
    log.failure(err);
    process.exit(1);
  }
}

main().catch(() => process.exit(1));

// -----------------------------------------------------------------------------
// End of generator script: generate.env
// -----------------------------------------------------------------------------
