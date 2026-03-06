// -----------------------------------------------------------------------------
// AUTO-GENERATED ENVIRONMENT LOADER
//
// Generator  : dev/generators/generate.env.js
// Template   : dev/templates/configTemplates/template.envLoader.js
//
// This file is auto-generated. Any manual changes will be overwritten.
// -----------------------------------------------------------------------------

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import YAML from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// IMPORTANT:
// This file runs from backend/config/envLoader.js after generation.
// From that location, the project root is two levels up: ../../
const ROOT_DIR = path.resolve(__dirname, '../..');
const ENV_PATH = path.resolve(ROOT_DIR, '.env');
const ENV_YAML_PATH = path.resolve(ROOT_DIR, '.env.yaml');

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

// Flatten nested YAML objects into SCREAMING_SNAKE_CASE environment keys.
// Example: { db: { host: 'x' } } → DB_HOST
function flattenYaml(obj, parentKey = '', result = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const newKey = parentKey ? `${parentKey}.${key}` : key;

    if (typeof value === 'object' && value !== null) {
      flattenYaml(value, newKey, result);
    } else {
      const envKey = newKey.replace(/\./g, '_').toUpperCase();
      result[envKey] = value;
    }
  }

  return result;
}

// -----------------------------------------------------------------------------
// Loader
// -----------------------------------------------------------------------------

export function loadEnvironmentConfig() {
  let source = 'none';
  let envConfig = {};

  // Prefer .env.yaml over .env if present
  if (fs.existsSync(ENV_YAML_PATH)) {
    try {
      const yamlContent = fs.readFileSync(ENV_YAML_PATH, 'utf8');
      const parsedYaml = YAML.parse(yamlContent) || {};
      const flatEnv = flattenYaml(parsedYaml);

      Object.assign(process.env, flatEnv);
      envConfig = flatEnv;
      source = '.env.yaml';
    } catch (err) {
      console.error('[env] Failed to parse .env.yaml:', err.message);
    }
  } else if (fs.existsSync(ENV_PATH)) {
    const result = dotenv.config({ path: ENV_PATH });

    if (result.error) {
      console.error('[env] Failed to load .env file:', result.error.message);
    } else {
      envConfig = result.parsed || {};
      source = '.env';
    }
  } else {
    console.warn('[env] No .env or .env.yaml found, using defaults.');
  }

  // ---------------------------------------------------------------------------
  // Startup summary
  // ---------------------------------------------------------------------------

  const dataSources = (process.env.DATA_SOURCES || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const dialects = (process.env.DB_DIALECT_LIST || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const nodeEnv = process.env.NODE_ENV || 'development';

  console.log('--------------------------------------------------');
  console.log(`Environment loaded from : ${source}`);
  console.log(`Node Environment        : ${nodeEnv}`);
  console.log(`SQL Dialects             : ${dialects.join(', ') || 'none'}`);
  console.log(
    `Active Data Sources     : ${dataSources.join(', ') || 'none'}`
  );
  console.log('--------------------------------------------------');

  return envConfig;
}

// -----------------------------------------------------------------------------
// Auto-load configuration on first import
// -----------------------------------------------------------------------------
try {
  loadEnvironmentConfig();
} catch (err) {
  console.error('[env] Critical configuration load failure:', err.message);
}

// -----------------------------------------------------------------------------
// End of auto-generated envLoader
// -----------------------------------------------------------------------------
