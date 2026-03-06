// -----------------------------------------------------------------------------
// HANDWRITTEN GENERATOR SCRIPT
//
// File       : dev/tools/docs/generate.paths.js
// Purpose    : Generates a Markdown list of all project-relative paths.
// Writes     : docs/internal/pathStructure.md
// Reads      : filesystem only (no metadata)
// Notes      : Developer utility; output is deterministic and overwrite-safe.
// -----------------------------------------------------------------------------

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createStepLogger } from '../../generators/_logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Project root = three levels up from /dev/tools/docs
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

// Output location (documentation — internal, non-runtime)
const OUTPUT_FILE = path.resolve(PROJECT_ROOT, 'docs/internal/pathStructure.md');

// Folders intentionally excluded from the listing
const EXCLUDED = new Set([
  'node_modules',
  '.git',
  'dist',
  'build'
]);

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function collectPaths(dir, baseDir = PROJECT_ROOT, acc = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
    .filter(e => !EXCLUDED.has(e.name))
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const rel  = path.relative(baseDir, full);

    if (!rel) {
      continue;
    }

    if (entry.isDirectory()) {
      // Mark directories with a trailing separator for readability
      acc.push(rel + path.sep);
      collectPaths(full, baseDir, acc);
    } else {
      acc.push(rel);
    }
  }

  return acc;
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

export async function generatePathDoc() {
  const log = createStepLogger({
    step: 'docs',
    title: 'Path Structure',
    generatorPath: 'dev/tools/docs/generate.paths.js'
  });

  try {
    log.kv('root', PROJECT_ROOT);
    log.kv('output', 'docs/internal/pathStructure.md');

    const paths  = collectPaths(PROJECT_ROOT);
    const header = '# Project paths\n\n```\n';
    const body   = paths.join('\n');
    const footer = '\n```\n';

    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, header + body + footer, 'utf8');

    log.write('docs/internal/pathStructure.md');
    log.success();
  } catch (err) {
    log.failure(err);
    process.exit(1);
  }
}

// -----------------------------------------------------------------------------
// CLI entry
// -----------------------------------------------------------------------------

generatePathDoc().catch(() => process.exit(1));

// -----------------------------------------------------------------------------
// End of generator script: generate.paths
// -----------------------------------------------------------------------------
