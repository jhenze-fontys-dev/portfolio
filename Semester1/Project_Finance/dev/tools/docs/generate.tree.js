// -----------------------------------------------------------------------------
// HANDWRITTEN GENERATOR SCRIPT
//
// File       : dev/tools/docs/generate.tree.js
// Purpose    : Generates a Markdown tree view of the repository structure.
// Writes     : docs/internal/treeStructure.md
// Reads      : filesystem only (no metadata)
// Notes      : Developer utility; output is deterministic and overwrite-safe.
// -----------------------------------------------------------------------------

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createStepLogger } from '../../generators/_logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Project root = two levels up from /dev/tools
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

// Output location (documentation — internal, non-runtime)
const OUTPUT_FILE = path.resolve(PROJECT_ROOT, 'docs/internal/treeStructure.md');

// Folders intentionally excluded from the tree
const EXCLUDED = new Set([
  'node_modules',
  '.git',
  'dist',
  'build'
]);

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function buildTree(dir, prefix = '') {
  let result = '';

  const entries = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => !EXCLUDED.has(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Directories first, then files (both alphabetical)
  const dirs  = entries.filter((e) => e.isDirectory());
  const files = entries.filter((e) => !e.isDirectory());
  const ordered = [...dirs, ...files];

  const lastIndex = ordered.length - 1;

  ordered.forEach((entry, index) => {
    const isLast = index === lastIndex;
    const branch = isLast ? '└── ' : '├── ';
    const nextPrefix = prefix + (isLast ? '    ' : '│   ');
    const full = path.join(dir, entry.name);

    // Render tree entry for this item
    result += `${prefix}${branch}${entry.name}\n`;

    if (entry.isDirectory()) {
      // Recurse into folder
      result += buildTree(full, nextPrefix);

      // Spacer line after a directory block for readability
      result += `${nextPrefix}\n`;
    }
  });

  return result;
}

// Collapse consecutive spacer lines like "│   │   " / "│   " / "    "
function compressSpacerLines(treeText) {
  const lines = treeText.split('\n');
  const result = [];

  let previousWasSpacer = false;

  for (const line of lines) {
    // A spacer line: only pipes/spaces/tabs, no branch characters
    const isSpacer =
      line.trim() !== '' &&                 // not completely empty
      !line.includes('├') &&
      !line.includes('└') &&
      !line.includes('──') &&
      /^[\s│]+$/.test(line);               // only pipes + whitespace

    if (isSpacer) {
      if (previousWasSpacer) {
        // Skip extra spacer lines
        continue;
      }
      previousWasSpacer = true;
      result.push(line);
    } else {
      previousWasSpacer = false;
      result.push(line);
    }
  }

  // Remove trailing empty lines
  while (result.length && result[result.length - 1].trim() === '') {
    result.pop();
  }

  return result.join('\n');
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

export async function generateTreeDoc() {
  const log = createStepLogger({
    step: 'docs',
    title: 'Tree Structure',
    generatorPath: 'dev/tools/docs/generate.tree.js'
  });

  try {
    log.kv('root', PROJECT_ROOT);
    log.kv('output', 'docs/internal/treeStructure.md');

    const rawTree = buildTree(PROJECT_ROOT);
    const tree    = compressSpacerLines(rawTree);

    const header =
      `# Project structure\n\n\`\`\`\n${path.basename(PROJECT_ROOT)}\n`;
    const footer = '\n```';

    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, header + tree + footer, 'utf8');

    log.write('docs/internal/treeStructure.md');
    log.success();
  } catch (err) {
    log.failure(err);
    process.exit(1);
  }
}

// -----------------------------------------------------------------------------
// CLI entry
// -----------------------------------------------------------------------------

generateTreeDoc().catch(() => process.exit(1));

// -----------------------------------------------------------------------------
// End of generator script: generate.tree
// -----------------------------------------------------------------------------
