// -----------------------------------------------------------------------------
// HANDWRITTEN GENERATOR SCRIPT
//
// File       : dev/generators/_logger.js
// Purpose    : Shared structured logger for generator steps (console blocks + JSONL events).
// Writes     : docs/logs/generator/<runId>.jsonl (optional, based on env)
// Reads      : process.env (.env), generator step metadata passed at runtime
// Notes      : Centralizes generator log formatting; generators should not implement custom log layouts.
// -----------------------------------------------------------------------------

import fs from 'fs';
import path from 'path';
import process from 'process';

const DEFAULT_LOG_DIR = 'docs/logs/generator';
const CURRENT_RUN_MARKER = '.current-run';

// Keys that represent filesystem paths when used via kv()
const PATH_KV_KEYS = new Set(['output', 'template', 'write']);

// Keep chunks small to avoid Windows terminal truncation.
// You can tune with LOG_CONSOLE_FLUSH_LINES=25 etc.
const DEFAULT_FLUSH_LINES = 50;

function padRight(s, width) {
  const str = String(s);
  return str.length >= width ? str : str + ' '.repeat(width - str.length);
}

function normalizeSlashes(p) {
  return String(p).replace(/\\/g, '/');
}

function nowIso() {
  return new Date().toISOString();
}

function todayFolder(isoTs) {
  return String(isoTs).slice(0, 10);
}

function safeMkdirp(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readTextIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf-8');
}

function writeText(filePath, text) {
  safeMkdirp(path.dirname(filePath));
  fs.writeFileSync(filePath, text, 'utf-8');
}

function appendLine(filePath, line) {
  safeMkdirp(path.dirname(filePath));
  fs.appendFileSync(filePath, line + '\n', 'utf-8');
}

function parseIntOr(value, fallback) {
  const n = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(n) ? n : fallback;
}

function isTruthy(value) {
  const v = String(value ?? '').trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

// -----------------------------------------------------------------------------
// Run context (shared across generators)
// -----------------------------------------------------------------------------

function buildRunPaths({ projectRoot, logDir, runId, startedAtIso }) {
  const dateDir = todayFolder(startedAtIso);
  const baseDirAbs = path.resolve(projectRoot, logDir, dateDir);
  const fileName = `gen-run-${runId}.jsonl`;

  return {
    baseDirAbs,
    logFileAbs: path.join(baseDirAbs, fileName),
    markerAbs: path.resolve(projectRoot, logDir, CURRENT_RUN_MARKER),
  };
}

function loadExistingRunFromMarker(markerAbs) {
  const raw = readTextIfExists(markerAbs);
  if (!raw) return null;

  try {
    const obj = JSON.parse(raw);
    if (!obj?.runId || !obj?.logFileAbs || !obj?.lastEventAtIso) return null;
    if (!fs.existsSync(obj.logFileAbs)) return null;
    return obj;
  } catch {
    return null;
  }
}

function shouldReuseRun(existing, ttlMin) {
  try {
    const last = new Date(existing.lastEventAtIso).getTime();
    const now = Date.now();
    const ageMs = now - last;
    return ageMs >= 0 && ageMs <= ttlMin * 60_000;
  } catch {
    return false;
  }
}

function createNewRunId(startedAtIso) {
  return startedAtIso.replace(/:/g, '-');
}

function resolveRunContext(projectRoot) {
  const logDir = process.env.LOG_DIR || DEFAULT_LOG_DIR;
  const logFileEnabled = process.env.LOG_FILE == null ? true : isTruthy(process.env.LOG_FILE);
  const consoleEnabled = process.env.LOG_CONSOLE == null ? true : isTruthy(process.env.LOG_CONSOLE);

  const ttlMin = parseIntOr(process.env.GEN_RUN_TTL_MIN, 60);
  const reset = isTruthy(process.env.GEN_RUN_RESET);

  const forcedRunId = (process.env.GEN_RUN_ID || '').trim();
  const startedAtIso = nowIso();

  if (forcedRunId) {
    const paths = buildRunPaths({ projectRoot, logDir, runId: forcedRunId, startedAtIso });
    return {
      runId: forcedRunId,
      startedAtIso,
      logDir,
      logFileAbs: paths.logFileAbs,
      markerAbs: paths.markerAbs,
      logFileEnabled,
      consoleEnabled,
    };
  }

  const markerAbs = path.resolve(projectRoot, logDir, CURRENT_RUN_MARKER);
  const existing = !reset ? loadExistingRunFromMarker(markerAbs) : null;

  if (existing && shouldReuseRun(existing, ttlMin)) {
    return {
      runId: existing.runId,
      startedAtIso: existing.startedAtIso || startedAtIso,
      logDir,
      logFileAbs: existing.logFileAbs,
      markerAbs,
      logFileEnabled,
      consoleEnabled,
    };
  }

  const runId = createNewRunId(startedAtIso);
  const paths = buildRunPaths({ projectRoot, logDir, runId, startedAtIso });

  return {
    runId,
    startedAtIso,
    logDir,
    logFileAbs: paths.logFileAbs,
    markerAbs: paths.markerAbs,
    logFileEnabled,
    consoleEnabled,
  };
}

let _cachedRun = null;

function getRun(projectRoot = process.cwd()) {
  if (_cachedRun) return _cachedRun;

  const run = resolveRunContext(projectRoot);

  if (run.logFileEnabled) safeMkdirp(path.dirname(run.logFileAbs));
  safeMkdirp(path.dirname(run.markerAbs));

  writeText(
    run.markerAbs,
    JSON.stringify(
      {
        runId: run.runId,
        startedAtIso: run.startedAtIso,
        logFileAbs: run.logFileAbs,
        lastEventAtIso: nowIso(),
      },
      null,
      2,
    ),
  );

  if (run.logFileEnabled) {
    appendLine(
      run.logFileAbs,
      JSON.stringify({
        ts: nowIso(),
        runId: run.runId,
        level: 'info',
        event: 'runStart',
        startedAtIso: run.startedAtIso,
      }),
    );
  }

  _cachedRun = run;
  return run;
}

function touchMarker(run) {
  const payload = {
    runId: run.runId,
    startedAtIso: run.startedAtIso,
    logFileAbs: run.logFileAbs,
    lastEventAtIso: nowIso(),
  };
  writeText(run.markerAbs, JSON.stringify(payload, null, 2));
}

function emitEvent(run, event) {
  touchMarker(run);
  if (!run.logFileEnabled) return;
  appendLine(run.logFileAbs, JSON.stringify(event));
}

// -----------------------------------------------------------------------------
// Step logger (per generator)
// -----------------------------------------------------------------------------

export function createStepLogger({
  step,
  title,
  generatorPath,
  projectRoot = process.cwd(),
} = {}) {
  if (!step) throw new Error('createStepLogger requires { step }');
  if (!title) title = step;
  if (!generatorPath) generatorPath = '(unknown)';

  const run = getRun(projectRoot);
  const startedAt = Date.now();

  const sep = '------------------------------------------------------------';
  const labelWidth = 10;

  const flushLines = parseIntOr(process.env.LOG_CONSOLE_FLUSH_LINES, DEFAULT_FLUSH_LINES);

  let chunkLines = [];

  function flushChunk() {
    if (!run.consoleEnabled) {
      chunkLines = [];
      return;
    }
    if (!chunkLines.length) return;

    const text = chunkLines.join('\n') + '\n';
    try {
      fs.writeSync(1, text); // stdout fd
    } catch {
      process.stdout.write(text);
    }
    chunkLines = [];
  }

  function pushLine(line) {
    if (!run.consoleEnabled) return;
    chunkLines.push(String(line));

    // Auto-flush to avoid very large chunks being truncated by terminals.
    if (flushLines > 0 && chunkLines.length >= flushLines) {
      flushChunk();
    }
  }

  function kvLine(label, value) {
    pushLine(`${padRight(label, labelWidth)}: ${value}`);
  }

  // Helper for structured filesystem actions
  function action(eventName, label, rawPath, extra = {}) {
    const p = normalizeSlashes(rawPath);
    kvLine(label, p);

    emitEvent(run, {
      ts: nowIso(),
      runId: run.runId,
      level: 'info',
      step,
      event: eventName,
      path: p,
      ...extra,
    });
  }

  // Start block
  pushLine(sep);
  pushLine(title);
  pushLine(sep);
  kvLine('generator', generatorPath);

  emitEvent(run, {
    ts: nowIso(),
    runId: run.runId,
    level: 'info',
    step,
    event: 'start',
    title,
    generator: generatorPath,
  });

  return {
    // Generic key–value logging (non-action)
    kv: (key, value) => {
      const v = PATH_KV_KEYS.has(String(key)) ? normalizeSlashes(value) : value;
      kvLine(key, v);
      emitEvent(run, {
        ts: nowIso(),
        runId: run.runId,
        level: 'info',
        step,
        event: 'kv',
        key,
        value: v,
      });
    },

    template: (templatePath) => {
      const p = normalizeSlashes(templatePath);
      kvLine('template', p);
      emitEvent(run, {
        ts: nowIso(),
        runId: run.runId,
        level: 'info',
        step,
        event: 'template',
        template: p,
      });
    },

    introspect: (sourceKey, extra = {}) => {
      kvLine('introspect', sourceKey);
      emitEvent(run, {
        ts: nowIso(),
        runId: run.runId,
        level: 'info',
        step,
        event: 'introspect',
        sourceKey,
        ...extra,
      });
    },

    // Source boundary:
    // 1) flush anything pending
    // 2) print the source line
    // 3) flush immediately (so it cannot be lost inside a big chunk)
    source: (sourceKey, extra = {}) => {
      flushChunk();
      kvLine('source', sourceKey);
      flushChunk();

      emitEvent(run, {
        ts: nowIso(),
        runId: run.runId,
        level: 'info',
        step,
        event: 'source',
        sourceKey,
        ...extra,
      });
    },

    // -------------------------------------------------------------------------
    // Filesystem-style actions (normalized + structured)
    // -------------------------------------------------------------------------

    // Written/created output file (most generators use this)
    write: (outPath, extra = {}) => {
      action('write', 'write', outPath, extra);
    },

    // Explicit create (e.g., mkdir, touch) – available for future use
    create: (targetPath, extra = {}) => {
      action('create', 'create', targetPath, extra);
    },

    // Explicit update – available for future use
    update: (targetPath, extra = {}) => {
      action('update', 'update', targetPath, extra);
    },

    // Explicit delete (file) – used by reset tools
    delete: (targetPath, extra = {}) => {
      action('delete', 'delete', targetPath, extra);
    },

    // Explicit rmdir (directory) – used by reset tools
    rmdir: (targetPath, extra = {}) => {
      action('rmdir', 'rmdir', targetPath, extra);
    },

    // Explicit skip (e.g. “already up to date”) – available for future use
    skip: (targetPath, extra = {}) => {
      action('skip', 'skip', targetPath, extra);
    },

    // Explicit run (external command / script)
    // e.g. log.run(`"sqlite3" ".../data.db" < ".../schema.sql"`)
    run: (commandText, extra = {}) => {
      action('run', 'run', commandText, extra);
    },

    // -------------------------------------------------------------------------
    // Result markers
    // -------------------------------------------------------------------------

    success: () => {
      const durationMs = Date.now() - startedAt;
      kvLine('result', `success (${durationMs} ms)`);

      emitEvent(run, {
        ts: nowIso(),
        runId: run.runId,
        level: 'info',
        step,
        event: 'result',
        status: 'success',
        durationMs,
      });

      flushChunk();
      return { durationMs, runId: run.runId, logFileAbs: run.logFileAbs };
    },

    failure: (err, hint) => {
      const durationMs = Date.now() - startedAt;
      const message = err?.message ? String(err.message) : String(err);

      kvLine('result', `failed (${durationMs} ms)`);
      kvLine('error', message);
      if (hint) kvLine('hint', hint);

      const verbose = isTruthy(process.env.LOG_VERBOSE);
      emitEvent(run, {
        ts: nowIso(),
        runId: run.runId,
        level: 'error',
        step,
        event: 'error',
        status: 'failed',
        durationMs,
        message,
        hint: hint || undefined,
        stack: verbose ? (err?.stack || undefined) : undefined,
      });

      flushChunk();
      return { durationMs, runId: run.runId, logFileAbs: run.logFileAbs };
    },
  };
}

// Optional end-of-run marker
export function endRun({ projectRoot = process.cwd(), status = 'unknown', durationMs } = {}) {
  const run = getRun(projectRoot);
  emitEvent(run, {
    ts: nowIso(),
    runId: run.runId,
    level: 'info',
    event: 'runResult',
    status,
    durationMs,
  });
}

// -----------------------------------------------------------------------------
// End of generator script: _logger
// -----------------------------------------------------------------------------
