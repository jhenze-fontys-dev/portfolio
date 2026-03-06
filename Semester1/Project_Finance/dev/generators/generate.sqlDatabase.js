// -----------------------------------------------------------------------------
// HANDWRITTEN GENERATOR SCRIPT
//
// File       : dev/generators/generate.sqlDatabase.js
// Purpose    : Generates the runtime SQL database connection module.
// Writes     : backend/data/sql/sqlDatabase.js
// Reads      : dev/config/metadataStructure.json, dev/templates/codeTemplates/template.sqlDatabase.hbs
// Notes      : Produces one shared module used by all SQL services and controllers.
// -----------------------------------------------------------------------------

import fs from 'fs';
import path from 'path';
import process from 'process';
import Handlebars from 'handlebars';
import { fileURLToPath } from 'url';

import { createStepLogger } from './_logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -----------------------------------------------------------------------------
// Logging helpers
// -----------------------------------------------------------------------------

function die(msg) {
  throw new Error(msg);
}

// -----------------------------------------------------------------------------
// File helpers
// -----------------------------------------------------------------------------

function resolveProjectRoot() {
  // Keep current behavior: generators run from project root via npm scripts
  return process.cwd();
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf-8');
}

function assertFileExists(filePath, label) {
  if (!fs.existsSync(filePath)) {
    die(`${label} not found at: ${filePath}`);
  }
}

// -----------------------------------------------------------------------------
// Metadata helpers
// -----------------------------------------------------------------------------

function pickSqlSources(metadata) {
  const sources = Array.isArray(metadata?.sources) ? metadata.sources : [];
  return sources.filter((s) => s?.type === 'sql' && s?.dialect && s?.databaseName);
}

function sanitizeEnvToken(s) {
  return String(s)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function makeSourceKey(src) {
  // Stable unique key used throughout the project
  return `${src.dialect}.${src.databaseName}`;
}

function envPrefixFor(src) {
  // Used to generate per-source env var names (supports many DBs per dialect)
  // Example: SQLITE_FULLSTACK_TEST / POSTGRES_FULLSTACK_TEST
  return sanitizeEnvToken(`${src.dialect}_${src.databaseName}`);
}

const DIALECT_ENV_BUILDERS = {
  sqlite: (prefix) => ({ dbFile: `${prefix}_DB_FILE` }),
  postgres: (prefix) => ({
    host: `${prefix}_DB_HOST`,
    port: `${prefix}_DB_PORT`,
    name: `${prefix}_DB_NAME`,
    user: `${prefix}_DB_USER`,
    password: `${prefix}_DB_PASSWORD`,
  }),
};

function buildEnvMap(src) {
  const prefix = envPrefixFor(src);
  const dialect = String(src.dialect).toLowerCase();
  const builder = DIALECT_ENV_BUILDERS[dialect];
  return builder ? builder(prefix) : {};
}

// -----------------------------------------------------------------------------
// Handlebars setup
// -----------------------------------------------------------------------------

// Helper for JSON embedding (kept for template compatibility)
Handlebars.registerHelper('json', (obj) => JSON.stringify(obj, null, 2));

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

async function main() {
  const projectRoot = resolveProjectRoot();

  const log = createStepLogger({
    step: 'sql-database',
    title: 'SQL Database',
    generatorPath: 'dev/generators/generate.sqlDatabase.js',
    projectRoot,
  });

  try {
    const metadataPath = path.resolve(projectRoot, 'dev/config/metadataStructure.json');
    const templatePath = path.resolve(
      projectRoot,
      'dev/templates/codeTemplates/template.sqlDatabase.hbs',
    );
    const outputPath = path.resolve(projectRoot, 'backend/data/sql/sqlDatabase.js');

    // Console block (Design 1)
    log.kv('output', path.relative(projectRoot, outputPath));
    log.kv('sources', 'sql');

    assertFileExists(metadataPath, 'Metadata file (metadataStructure.json)');
    assertFileExists(templatePath, 'Template file (template.sqlDatabase.hbs)');

    const metadata = readJson(metadataPath);
    const sqlSources = pickSqlSources(metadata);

    if (!sqlSources.length) {
      die(
        'No SQL sources found in metadataStructure.json.\n' +
          'Expected metadata.sources[] with { type:"sql", dialect, databaseName }.',
      );
    }

    // Keep dialect order as defined by metadata (first appearance)
    const dialects = [];
    for (const s of sqlSources) {
      const d = String(s.dialect);
      if (!dialects.includes(d)) dialects.push(d);
    }
    log.kv('dialects', dialects.join(', '));

    // Deterministic ordering so generated output is stable across runs
    const sources = sqlSources
      .map((src) => ({
        sourceKey: makeSourceKey(src),
        dialect: src.dialect,
        databaseName: src.databaseName,
        env: buildEnvMap(src),
      }))
      .sort((a, b) => a.sourceKey.localeCompare(b.sourceKey));

    const templateRaw = fs.readFileSync(templatePath, 'utf-8');
    const template = Handlebars.compile(templateRaw);

    log.template(path.relative(projectRoot, templatePath));

    const rendered = template({
      sources,
    });

    writeFile(outputPath, rendered);
    log.write(path.relative(projectRoot, outputPath));

    log.success();
  } catch (err) {
    log.failure(err);
    process.exit(1);
  }
}

main();

// -----------------------------------------------------------------------------
// End of generator script: generate.sqlDatabase
// -----------------------------------------------------------------------------
