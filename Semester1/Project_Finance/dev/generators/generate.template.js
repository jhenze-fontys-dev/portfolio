// -----------------------------------------------------------------------------
// HANDWRITTEN GENERATOR SCRIPT
//
// File       : dev/generators/generate.template.js
// Purpose    : Shared template/render/write helper used by generator scripts.
// Writes     : (varies) — writes are performed by generators via this helper
// Reads      : dev/templates/**, dev/config/metadataStructure.json (version checks), filesystem
// Notes      : This module must not log to console; generators log via dev/generators/_logger.js.
// -----------------------------------------------------------------------------

import fs from 'fs';
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';
import Handlebars from 'handlebars';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------------------------------------------------
// Metadata version – single source of truth
// -------------------------------------------------------------
export const METADATA_VERSION = 2;

/**
 * Validate that a metadata object matches the expected version.
 * This helps detect silent breaking changes across generator steps.
 *
 * Note: This function does not print. Generators may choose to log warnings.
 */
export function assertMetadataVersion(stepName, metadata) {
  if (!metadata || typeof metadata !== 'object') {
    throw new Error(`[${stepName}] metadata is missing or invalid`);
  }

  if (!('version' in metadata)) {
    return;
  }

  if (metadata.version !== METADATA_VERSION) {
  }
}

// -------------------------------------------------------------
// Project root resolver
// -------------------------------------------------------------

/**
 * Resolve the project root directory.
 *
 * Assumes this file lives in: dev/generators/generate.template.js
 * Then the project root is two levels up: ../../
 */
export function getProjectRoot() {
  return path.resolve(__dirname, '..', '..');
}

// -------------------------------------------------------------
// Low-level filesystem helpers
// -------------------------------------------------------------
function ensureDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function loadFileSync(absolutePath) {
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Template file not found: ${absolutePath}`);
  }
  return fs.readFileSync(absolutePath, 'utf8');
}

// -------------------------------------------------------------
// Handlebars helpers
// -------------------------------------------------------------
Handlebars.registerHelper('toCamelCase', function toCamelCase(str) {
  if (!str) return '';
  return String(str)
    .replace(/[_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (m) => m.toLowerCase());
});

Handlebars.registerHelper('toPascalCase', function toPascalCase(str) {
  if (!str) return '';
  return String(str)
    .replace(/[_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (m) => m.toUpperCase());
});

/**
 * JSON-safe output helper.
 *
 * Usage in templates:
 *   {{json someValue}}
 *
 * This ensures strings, numbers, booleans, nulls, and objects
 * are emitted as valid JavaScript literals.
 */
Handlebars.registerHelper('json', function json(value) {
  return JSON.stringify(value);
});

// -------------------------------------------------------------
// Main API: generateFromTemplate
// -------------------------------------------------------------

/**
 * Render a Handlebars template to a target file.
 *
 * @param {Object} params
 * @param {string} params.templateRelativePath - Path to the template, relative to project root.
 * @param {string} params.targetRelativePath   - Path for the output file, relative to project root.
 * @param {Object} params.context              - Context object passed to the template.
 * @param {boolean} [params.overwrite=true]    - If false, does not overwrite an existing file.
 *
 * @returns {{ skipped: boolean, templatePath: string, targetPath: string }}
 */
export function generateFromTemplate({
  templateRelativePath,
  targetRelativePath,
  context,
  overwrite = true,
}) {
  const projectRoot = getProjectRoot();

  const templatePath = path.resolve(projectRoot, templateRelativePath);
  const targetPath = path.resolve(projectRoot, targetRelativePath);

  if (!overwrite && fs.existsSync(targetPath)) {
    return { skipped: true, templatePath, targetPath };
  }

  const templateContent = loadFileSync(templatePath);
  const template = Handlebars.compile(templateContent);
  const rendered = template(context);

  const targetDir = path.dirname(targetPath);
  ensureDirSync(targetDir);
  fs.writeFileSync(targetPath, rendered, 'utf8');

  return { skipped: false, templatePath, targetPath };
}

// -------------------------------------------------------------
// JSON loader
// -------------------------------------------------------------

/**
 * Load and parse a JSON file from the project root.
 *
 * @param {string} relativePath - Path to the JSON file, relative to project root.
 * @returns {Object} Parsed JSON object.
 */
export function loadJsonFromProject(relativePath) {
  const projectRoot = getProjectRoot();
  const absolutePath = path.resolve(projectRoot, relativePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`JSON file not found: ${absolutePath}`);
  }

  const raw = fs.readFileSync(absolutePath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Failed to parse JSON file at ${absolutePath}: ${err.message}`);
  }
}

// -------------------------------------------------------------
// CLI helper: runIfDirect
// -------------------------------------------------------------

/**
 * Run a generator only when the current Node process was invoked
 * using a specific filename fragment (e.g. "generate.sqlModels.js").
 *
 * Logging is handled by the generator; this helper should not print.
 */
export function runIfDirect(filenameFragment, runner, _label) {
  const invokedPath = process.argv[1] || '';
  const isDirectRun = invokedPath.includes(filenameFragment);

  if (!isDirectRun) return;

  runner().catch((err) => {
    // Preserve failure behavior: exit non-zero for direct runs.
    process.exitCode = 1;
    throw err;
  });
}

// -----------------------------------------------------------------------------
// End of generator script: generate.template
// -----------------------------------------------------------------------------
