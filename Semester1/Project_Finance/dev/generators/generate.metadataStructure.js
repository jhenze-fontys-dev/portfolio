// -----------------------------------------------------------------------------
// HANDWRITTEN GENERATOR SCRIPT
//
// File       : dev/generators/generate.metadataStructure.js
// Purpose    : Builds unified metadata by introspecting configured sources.
// Writes     : dev/config/metadataStructure.json
// Reads      : .env (dialects/sources), source introspection (sql today), filesystem
// Notes      : Source-agnostic by design; appends per-source metadata into metadata.sources[].
// -----------------------------------------------------------------------------

import fs from 'fs';
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';
import { createStepLogger } from './_logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -----------------------------------------------------------------------------
// Environment + filesystem helpers
// -----------------------------------------------------------------------------

function resolveProjectRoot() {
  // Assumes script runs via `node dev/generators/...` from project root
  return process.cwd();
}

function readEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return {};
  const raw = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    env[key] = val;
  }
  return env;
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function safeJsonWrite(filePath, obj) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2), 'utf-8');
}

function getDialectList(env) {
  const raw = env.DB_DIALECT_LIST || 'sqlite';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function getMetadataOutPath(projectRoot, env) {
  const rel = env.METADATA_PATH || './dev/config/metadataStructure.json';
  return path.resolve(projectRoot, rel);
}

function execFileAsync(cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, options, (err, stdout, stderr) => {
      if (err) {
        const msg =
          (stderr && String(stderr).trim()) ||
          (stdout && String(stdout).trim()) ||
          err.message;
        reject(new Error(msg));
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

// -----------------------------------------------------------------------------
// Default parsing + normalization helpers (used by classifiers)
// -----------------------------------------------------------------------------

function stripOuterParens(s) {
  let out = String(s).trim();
  // strip redundant outer parentheses: ((x)) -> x
  while (out.startsWith('(') && out.endsWith(')')) {
    const inner = out.slice(1, -1).trim();
    if (!inner) break;
    out = inner;
  }
  return out;
}

function unescapeSqlSingleQuotes(s) {
  // SQL escapes single quotes by doubling them: '' -> '
  return String(s).replace(/''/g, "'");
}

function tryParseScalar(s) {
  const t = String(s).trim();

  // boolean
  if (t === 'true') return true;
  if (t === 'false') return false;

  // null
  if (t === 'null') return null;

  // number (int/float)
  if (/^[+-]?\d+(\.\d+)?$/.test(t)) {
    const n = Number(t);
    if (!Number.isNaN(n)) return n;
  }

  return undefined;
}

function toIsoIfTimestampLiteral(s) {
  // Accepts:
  //   2025-01-01 01:00:00+01
  //   2025-01-01 01:00:00+01:00
  //   2025-01-01T01:00:00+01
  //   2025-01-01T01:00:00+01:00
  //
  // Returns ISO string if it looks like a literal timestamp with an explicit offset,
  // otherwise returns undefined. We intentionally do NOT evaluate SQL functions/expressions.

  const t = String(s ?? '').trim();
  if (!t) return undefined;

  // Normalize separator to 'T'
  const normalized = t.replace(' ', 'T');

  // Require date + time + explicit offset (+HH, -HH, +HH:MM, -HH:MM)
  const m = normalized.match(
    /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})([+-]\d{2})(?::?(\d{2}))?$/,
  );
  if (!m) return undefined;

  const datePart = m[1];
  const timePart = m[2];
  const offH = m[3];
  const offM = m[4] ?? '00';

  const isoLike = `${datePart}T${timePart}${offH}:${offM}`;
  const d = new Date(isoLike);
  if (Number.isNaN(d.getTime())) return undefined;

  return d.toISOString();
}

function toIsoIfIsoZLiteral(s) {
  // Accepts ISO strings with trailing Z (UTC):
  //   2025-01-01T00:00:00Z
  //   2025-01-01T00:00:00.000Z
  // Returns a canonical ISO string (with milliseconds) or undefined.
  const t = String(s ?? '').trim();
  if (!t) return undefined;

  const m = t.match(
    /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})(?:\.(\d{1,3}))?Z$/,
  );
  if (!m) return undefined;

  const datePart = m[1];
  const timePart = m[2];
  const ms = (m[3] ?? '0').padEnd(3, '0');

  const isoLike = `${datePart}T${timePart}.${ms}Z`;
  const d = new Date(isoLike);
  if (Number.isNaN(d.getTime())) return undefined;

  return d.toISOString();
}

// -----------------------------------------------------------------------------
// Default classifiers (the metadata contract)
// -----------------------------------------------------------------------------
// Returns: { defaultValue, defaultValueKind, defaultValueRaw }
//
// defaultValueKind ∈
//   none | scalar | literal_timestamp | token | generated | expression
// -----------------------------------------------------------------------------

function classifyDefaultValueSqlite(rawDefault, opts = {}) {
  const raw =
    rawDefault === undefined ||
    rawDefault === null ||
    String(rawDefault).trim() === ''
      ? null
      : String(rawDefault);

  // SQLite: INTEGER PRIMARY KEY is rowid-backed and auto-generated even when dflt_value is NULL.
  if (opts && opts.isIntegerPrimaryKey === true) {
    return { defaultValue: null, defaultValueKind: 'generated', defaultValueRaw: raw };
  }

  if (raw === null) {
    return { defaultValue: null, defaultValueKind: 'none', defaultValueRaw: null };
  }

  let d = String(raw).trim();
  d = stripOuterParens(d);

  // Tokens
  const upper = d.toUpperCase();
  if (
    upper === 'CURRENT_TIMESTAMP' ||
    upper === 'CURRENT_DATE' ||
    upper === 'CURRENT_TIME'
  ) {
    return { defaultValue: upper, defaultValueKind: 'token', defaultValueRaw: raw };
  }

  // quoted string
  const mSingle = d.match(/^'(.*)'$/s);
  if (mSingle) d = unescapeSqlSingleQuotes(mSingle[1]);

  const mDouble = d.match(/^"(.*)"$/s);
  if (mDouble) d = mDouble[1];

  // literal timestamp (UTC Z form) -> canonical ISO (with milliseconds)
  const isoZ = toIsoIfIsoZLiteral(d);
  if (isoZ) {
    return {
      defaultValue: isoZ,
      defaultValueKind: 'literal_timestamp',
      defaultValueRaw: raw,
    };
  }

  // scalar (number/boolean/null)
  const parsed = tryParseScalar(String(d).trim().toLowerCase());
  if (parsed !== undefined) {
    return { defaultValue: parsed, defaultValueKind: 'scalar', defaultValueRaw: raw };
  }

  // string literal -> scalar string
  if (mSingle || mDouble) {
    return { defaultValue: d, defaultValueKind: 'scalar', defaultValueRaw: raw };
  }

  // fallback expression-like string
  return { defaultValue: d, defaultValueKind: 'expression', defaultValueRaw: raw };
}

function classifyDefaultValuePostgres(rawDefault, opts = {}) {
  const raw =
    rawDefault === undefined ||
    rawDefault === null ||
    String(rawDefault).trim() === ''
      ? null
      : String(rawDefault);

  // Identity columns (GENERATED ... AS IDENTITY) may have NULL column_default in Postgres.
  if (opts && opts.isIdentity === true) {
    return {
      defaultValue: null,
      defaultValueKind: 'generated',
      defaultValueRaw: raw ?? 'IDENTITY',
    };
  }

  if (raw === null) {
    return { defaultValue: null, defaultValueKind: 'none', defaultValueRaw: null };
  }

  let d = String(raw).trim();
  d = stripOuterParens(d);

  // generated/sequence
  if (/^nextval\s*\(/i.test(d)) {
    return { defaultValue: null, defaultValueKind: 'generated', defaultValueRaw: raw };
  }

  // Tokens
  if (/^now\s*\(\s*\)\s*$/i.test(d) || /^current_timestamp$/i.test(d)) {
    return {
      defaultValue: 'CURRENT_TIMESTAMP',
      defaultValueKind: 'token',
      defaultValueRaw: raw,
    };
  }
  if (/^current_date$/i.test(d)) {
    return { defaultValue: 'CURRENT_DATE', defaultValueKind: 'token', defaultValueRaw: raw };
  }
  if (/^current_time$/i.test(d)) {
    return { defaultValue: 'CURRENT_TIME', defaultValueKind: 'token', defaultValueRaw: raw };
  }

  // Strip cast suffix ::type
  const castIdx = d.indexOf('::');
  if (castIdx !== -1) {
    d = d.slice(0, castIdx).trim();
    d = stripOuterParens(d);
  }

  // quoted string literal
  const mSingle = d.match(/^'(.*)'$/s);
  if (mSingle) d = unescapeSqlSingleQuotes(mSingle[1]);

  // literal timestamp with explicit offset -> ISO
  const iso = toIsoIfTimestampLiteral(d);
  if (iso) {
    return {
      defaultValue: iso,
      defaultValueKind: 'literal_timestamp',
      defaultValueRaw: raw,
    };
  }

  // scalar (number/boolean/null)
  const parsed = tryParseScalar(String(d).trim().toLowerCase());
  if (parsed !== undefined) {
    return { defaultValue: parsed, defaultValueKind: 'scalar', defaultValueRaw: raw };
  }

  // string literal -> scalar string
  if (mSingle) {
    return { defaultValue: d, defaultValueKind: 'scalar', defaultValueRaw: raw };
  }

  // fallback expression-like string
  return { defaultValue: d, defaultValueKind: 'expression', defaultValueRaw: raw };
}

// -----------------------------------------------------------------------------
// SQLite introspection
// -----------------------------------------------------------------------------
async function introspectSqlite(sqliteDbFile) {
  // Uses the `sqlite3` npm package (not the sqlite CLI).
  let sqlite3;
  try {
    sqlite3 = (await import('sqlite3')).default;
  } catch (e) {
    throw new Error(
      `Missing npm package "sqlite3". Install it in the project root:\n` +
        `  npm i sqlite3\n` +
        `Details: ${e?.message || e}`,
    );
  }

  if (!sqliteDbFile || !fs.existsSync(sqliteDbFile)) {
    throw new Error(`SQLite database file not found at: ${sqliteDbFile}`);
  }

  const db = new sqlite3.Database(sqliteDbFile);

  const all = (sql, params = []) =>
    new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
    });

  const tables = await all(`
    SELECT name
    FROM sqlite_master
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
    ORDER BY name;
  `);

  const entities = [];

  for (const t of tables) {
    const tableName = t.name;

    const cols = await all(`PRAGMA table_info(${JSON.stringify(tableName)});`);
    const pkCols = cols.filter((c) => c.pk === 1 || c.pk === true).map((c) => c.name);

    // We REQUIRE a primary key for codegen (models/services/routes)
    if (!pkCols.length) continue;

    const columns = cols.map((c) => {
      const isIntegerPrimaryKey =
        (c.pk === 1 || c.pk === true) && /int/i.test(String(c.type || ''));

      const dv = classifyDefaultValueSqlite(c.dflt_value, { isIntegerPrimaryKey });

      return {
        name: c.name,
        type: c.type || 'TEXT',
        notNull: !!c.notnull,
        defaultValue: dv.defaultValue,
        defaultValueKind: dv.defaultValueKind,
        defaultValueRaw: dv.defaultValueRaw,
        primaryKey: c.pk === 1 || c.pk === true,
      };
    });

    entities.push({
      entityName: tableName,
      tableName,
      primaryKey: pkCols[0], // single PK assumption for now
      columns,
    });
  }

  db.close();

  return entities;
}

// -----------------------------------------------------------------------------
// PostgreSQL introspection (via psql)
// -----------------------------------------------------------------------------
async function introspectPostgres({
  psqlBin,
  host,
  port,
  user,
  password,
  database,
  schema = 'public',
}) {
  // Pull column + PK info in one query; output TSV for robust parsing.
  const safeSchema = schema.replace(/'/g, "''");

  const sql = `
    SELECT
      c.table_schema,
      c.table_name,
      c.column_name,
      c.ordinal_position,
      c.is_nullable,
      c.column_default,
      c.is_identity,
      c.identity_generation,
      c.data_type,
      CASE WHEN tc.constraint_type = 'PRIMARY KEY' THEN 1 ELSE 0 END AS is_pk
    FROM information_schema.columns c
    LEFT JOIN information_schema.key_column_usage kcu
      ON c.table_schema = kcu.table_schema
     AND c.table_name = kcu.table_name
     AND c.column_name = kcu.column_name
    LEFT JOIN information_schema.table_constraints tc
      ON kcu.constraint_name = tc.constraint_name
     AND kcu.table_schema = tc.table_schema
     AND kcu.table_name = tc.table_name
    WHERE c.table_schema = '${safeSchema}'
    ORDER BY c.table_schema, c.table_name, c.ordinal_position;
  `.trim();

  const args = [
    '-h',
    host,
    '-p',
    String(port),
    '-U',
    user,
    '-d',
    database,
    '-X', // do not read ~/.psqlrc
    '-A', // unaligned
    '-t', // tuples only
    '-F',
    '\t', // field separator
    '-c',
    sql,
  ];

  const env = { ...process.env, PGPASSWORD: password };

  const { stdout } = await execFileAsync(psqlBin, args, { env });

  const lines = String(stdout)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // Group by table
  // key: schema.table, val: { tableName, columnsByName: Map, pkCols: [] }
  const tableMap = new Map();

  for (const line of lines) {
    const parts = line.split('\t');

    // Expected 10 fields:
    // schema, table, column, ordinal, nullable, default, is_identity, identity_generation, type, is_pk
    if (parts.length < 10) continue;

    const tableSchema = parts[0];
    const tableName = parts[1];
    const columnName = parts[2];
    const ordinal = Number(parts[3] || '0');
    const isNullable = parts[4]; // 'YES'/'NO'
    const colDefaultRaw = parts[5] === '' ? null : parts[5];
    const isIdentity = parts[6] === 'YES';
    const identityGeneration = parts[7] || null; // kept for future use
    const dataType = parts[8] || 'text';
    const isPk = parts[9] === '1';

    const key = `${tableSchema}.${tableName}`;
    if (!tableMap.has(key)) {
      tableMap.set(key, { tableName, columnsByName: new Map(), pkCols: [] });
    }

    const entry = tableMap.get(key);

    // NOTE: Postgres introspection joins (columns + constraints) can produce multiple
    // result rows for the *same* physical column (e.g. a column that is both PK and FK,
    // or participates in multiple constraints). A table can never have duplicate column
    // names, so we must collapse/merge these duplicate *rows* into a single column entry.
    const dv = classifyDefaultValuePostgres(colDefaultRaw, { isIdentity });

    const existingCol = entry.columnsByName.get(columnName);
    if (!existingCol) {
      entry.columnsByName.set(columnName, {
        name: columnName,
        type: dataType,
        notNull: isNullable === 'NO',
        defaultValue: dv.defaultValue,
        defaultValueKind: dv.defaultValueKind,
        defaultValueRaw: dv.defaultValueRaw,
        primaryKey: isPk,
        _ordinal: ordinal, // internal sort key
      });
    } else {
      // Defensive merge: keep stable column facts, but OR-in constraint-derived flags.
      existingCol.primaryKey = existingCol.primaryKey || isPk;

      // If the join produced inconsistent values (shouldn't happen), prefer "stricter" ones.
      existingCol.notNull = existingCol.notNull || isNullable === 'NO';

      if (existingCol.type == null || existingCol.type === '') existingCol.type = dataType;

      // Preserve an existing normalized default if present; otherwise take this row's.
      if (existingCol.defaultValue === undefined || existingCol.defaultValue === null) {
        existingCol.defaultValue = dv.defaultValue;
        existingCol.defaultValueKind = dv.defaultValueKind;
        existingCol.defaultValueRaw = dv.defaultValueRaw;
      }

      // Keep lowest ordinal for deterministic ordering.
      existingCol._ordinal = Math.min(existingCol._ordinal ?? ordinal, ordinal);
    }

    if (isPk) {
      const alreadyPk = entry.pkCols.some((pk) => pk.name === columnName);
      if (!alreadyPk) entry.pkCols.push({ name: columnName, ordinal });
    }
  }

  // Convert into entities (require PK like sqlite path)
  const entities = [];

  for (const [, entry] of tableMap.entries()) {
    const columns = Array.from(entry.columnsByName.values());
    columns.sort((a, b) => (a._ordinal ?? 0) - (b._ordinal ?? 0));
    for (const c of columns) delete c._ordinal;

    entry.pkCols.sort((a, b) => (a.ordinal ?? 0) - (b.ordinal ?? 0));
    const primaryKey = entry.pkCols[0]?.name || null;

    if (!primaryKey) continue;

    entities.push({
      entityName: entry.tableName,
      tableName: entry.tableName,
      primaryKey,
      columns,
    });
  }

  entities.sort((a, b) => a.tableName.localeCompare(b.tableName));
  return entities;
}

// -----------------------------------------------------------------------------
// Dialect adapters (behavior unchanged; logging routed via logger)
// -----------------------------------------------------------------------------
async function buildSqliteSource(projectRoot, env, log) {
  const sqliteDbFile = env.SQLITE_DB_FILE
    ? path.resolve(projectRoot, env.SQLITE_DB_FILE)
    : path.resolve(projectRoot, './backend/data/sql/databases/fullstack_test.db');

  const databaseName = path.basename(sqliteDbFile).replace(/\.(db|sqlite)$/i, '');

  let entities = [];
  try {
    entities = await introspectSqlite(sqliteDbFile);
  } catch (e) {
    // Preserve behavior: continue with empty entities, but log via structured logger
    log.kv('warning', `sqlite introspect failed: ${e?.message || e}`);
  }

  return {
    type: 'sql',
    dialect: 'sqlite',
    databaseName,
    storage: {
      file: env.SQLITE_DB_FILE || './backend/data/sql/databases/fullstack_test.db',
    },
    entities,
  };
}

async function buildPostgresSource(projectRoot, env, log) {
  const psqlBin = env.POSTGRES_PSQL_BIN || 'psql';
  const host = env.POSTGRES_DB_HOST || 'localhost';
  const port = Number(env.POSTGRES_DB_PORT || '5432');
  const databaseName = env.POSTGRES_DB_NAME || 'fullstack_test';
  const user = env.POSTGRES_DB_USER || 'postgres';
  const password = env.POSTGRES_DB_PASSWORD || '';

  let entities = [];
  try {
    entities = await introspectPostgres({
      psqlBin,
      host,
      port,
      user,
      password,
      database: databaseName,
      schema: 'public',
    });
  } catch (e) {
    // Preserve behavior: continue with empty entities, but log via structured logger
    log.kv('warning', `postgres introspect failed: ${e?.message || e}`);
  }

  return {
    type: 'sql',
    dialect: 'postgres',
    databaseName,
    connection: { host, port },
    entities,
  };
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------
async function main() {
  const projectRoot = resolveProjectRoot();

  const log = createStepLogger({
    step: 'metadata',
    title: 'Metadata',
    generatorPath: 'dev/generators/generate.metadataStructure.js',
    projectRoot,
  });

  try {
    const bootstrapEnvPath = path.resolve(projectRoot, '.env.startup');
    const env = readEnvFile(bootstrapEnvPath);

    const dataSources = (env.DATA_SOURCES || 'sql')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const dialects = getDialectList(env);
    const metadataPath = getMetadataOutPath(projectRoot, env);

    log.kv('output', path.relative(projectRoot, metadataPath));
    log.kv('sources', dataSources.join(', ') || '(none)');
    log.kv('dialects', dialects.join(', ') || '(none)');

    const metadata = {
      version: 2,
      dataSources,
      sources: [],
    };

    const SQL_ADAPTERS = {
      sqlite: buildSqliteSource,
      postgres: buildPostgresSource,
    };

    // --- SQL sources ---
    if (dataSources.includes('sql')) {
      for (const dialect of dialects) {
        const adapter = SQL_ADAPTERS[dialect];

        if (adapter) {
          const source = await adapter(projectRoot, env, log);
          const sourceKey = `${source.dialect}.${source.databaseName}`;

          // Per-source event (console + JSONL)
          log.introspect(sourceKey, {
            dialect: source.dialect,
            databaseName: source.databaseName,
            entitiesCount: Array.isArray(source.entities) ? source.entities.length : 0,
          });

          metadata.sources.push(source);
        } else {
          // future dialects: mysql, mariadb, mssql, oracle, etc.
          const source = {
            type: 'sql',
            dialect,
            databaseName: `${dialect}_default`,
            entities: [],
          };

          log.introspect(`${dialect}.${source.databaseName}`, {
            dialect,
            databaseName: source.databaseName,
            entitiesCount: 0,
          });

          metadata.sources.push(source);
        }
      }
    }

    safeJsonWrite(metadataPath, metadata);
    log.write(path.relative(projectRoot, metadataPath));

    log.success();
  } catch (err) {
    log.failure(err);
    process.exit(1);
  }
}

main().catch(() => process.exit(1));

// -----------------------------------------------------------------------------
// End of generator script: generate.metadataStructure
// -----------------------------------------------------------------------------
 