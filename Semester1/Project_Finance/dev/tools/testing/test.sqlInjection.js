#!/usr/bin/env node

// -----------------------------------------------------------------------------
// HANDWRITTEN TOOL SCRIPT
//
// File       : dev/tools/testing/test.sqlInjection.js
// Purpose    : CLI tool to probe API endpoints for basic SQL injection issues.
// Writes     : docs/backend/testing/sqlscan/sqlscan-*.json (per-run report)
//              docs/backend/testing/sqlscan/index.json (report index)
// Reads      : docs/backend/generated/openapi/sql/sqlite.fullstack_test.openapi.json
// Notes      : Teaching/demo utility, not a replacement for professional testing.
// -----------------------------------------------------------------------------

import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';
import url from 'url';
import { fileURLToPath } from 'url';
import { createStepLogger } from '../../generators/_logger.js';

// -----------------------------------------------------------------------------
// Paths / constants
// -----------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Repo root = three levels up from /dev/tools/testing
const ROOT_DIR   = path.resolve(__dirname, '..', '..', '..');

// Default base URL (can be overridden via CLI arg)
const DEFAULT_BASE_URL = 'http://localhost:3000';

// Directory for reports: docs/backend/testing/sqlscan
const REPORT_DIR = path.join(ROOT_DIR, 'docs', 'backend', 'testing', 'sqlscan');

// Some simple SQL injection payloads (you can extend this list)
const SQL_INJECTION_PAYLOADS = [
  "' OR '1'='1",
  "'; DROP TABLE Users; --",
  "' OR 1=1 --",
  "' UNION SELECT NULL --",
  "'; SELECT * FROM Users; --",
];

// HTTP methods we care about
const METHODS_WITH_BODY = ['post', 'put', 'patch'];

// Logger
const log = createStepLogger({
  step: 'test',
  title: 'SQL Injection Test',
  generatorPath: 'dev/tools/testing/test.sqlInjection.js',
  projectRoot: ROOT_DIR,
});

// -----------------------------------------------------------------------------
// Utility helpers
// -----------------------------------------------------------------------------

function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function parseArgs(argv) {
  const args = {
    baseUrl: DEFAULT_BASE_URL,
  };

  for (const arg of argv.slice(2)) {
    if (arg.startsWith('--baseUrl=')) {
      args.baseUrl = arg.substring('--baseUrl='.length);
    }
  }

  return args;
}

function printUsage() {
  console.log('SQL Injection Test (CLI)');
  console.log('------------------------');
  console.log(`Base URL : ${DEFAULT_BASE_URL}`);
  console.log('');
  console.log('Usage:');
  console.log('  npm run test:sql-injection');
  console.log('  npm run test:sql-injection -- --baseUrl=http://localhost:3000');
  console.log('');
}

// -----------------------------------------------------------------------------
// OpenAPI loading helpers
// -----------------------------------------------------------------------------

function loadJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function loadOpenApiSpecFromFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`OpenAPI file not found: ${filePath}`);
  }
  const spec = loadJson(filePath);
  if (!spec.paths) {
    throw new Error('OpenAPI spec missing "paths" section.');
  }
  return spec;
}

// -----------------------------------------------------------------------------
// HTTP request helper
// -----------------------------------------------------------------------------

function sendRequest(baseUrl, method, endpointPath, payload, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsedBase = new URL(baseUrl);
    const isHttps    = parsedBase.protocol === 'https:';
    const fullPath   = url.resolve(parsedBase.pathname, endpointPath);

    const options = {
      hostname: parsedBase.hostname,
      port: parsedBase.port || (isHttps ? 443 : 80),
      path: fullPath,
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const transport = isHttps ? https : http;
    const req = transport.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk.toString();
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (payload && METHODS_WITH_BODY.includes(method.toLowerCase())) {
      req.write(JSON.stringify(payload));
    }

    req.end();
  });
}

// -----------------------------------------------------------------------------
// Simple heuristics for spotting suspicious responses
// -----------------------------------------------------------------------------

function looksLikeSqlError(body) {
  if (!body) return false;

  const lower = body.toLowerCase();
  const patterns = [
    'sql syntax',
    'sqlite error',
    'sqlite3',
    'mysql server version',
    'postgresql',
    'syntax error at or near',
    'unclosed quotation mark',
    'odbc',
    'jdbc',
  ];

  return patterns.some((p) => lower.includes(p));
}

function looksLikeStackTrace(body) {
  if (!body) return false;

  const patterns = [
    'at Object.',
    'ReferenceError:',
    'TypeError:',
    'RangeError:',
    'Stack trace:',
  ];

  return patterns.some((p) => body.includes(p));
}

// -----------------------------------------------------------------------------
// OpenAPI → attack surface discovery
// -----------------------------------------------------------------------------

function extractOperationsFromOpenApi(spec) {
  const operations = [];

  for (const pathKey of Object.keys(spec.paths)) {
    const pathItem = spec.paths[pathKey];

    for (const methodKey of Object.keys(pathItem)) {
      const operation = pathItem[methodKey];
      const method    = methodKey.toLowerCase();

      if (!operation || typeof operation !== 'object') {
        continue;
      }

      const parameters       = operation.parameters || [];
      let requestBodySchema  = null;

      if (operation.requestBody && operation.requestBody.content) {
        const jsonContent =
          operation.requestBody.content['application/json'] ||
          operation.requestBody.content['application/*+json'];

        if (jsonContent && jsonContent.schema) {
          requestBodySchema = jsonContent.schema;
        }
      }

      operations.push({
        method,
        path: pathKey,
        parameters,
        requestBodySchema,
        operationId: operation.operationId || `${method.toUpperCase()} ${pathKey}`,
      });
    }
  }

  return operations;
}

// -----------------------------------------------------------------------------
// Payload generation
// -----------------------------------------------------------------------------

function generatePayloadForOperation(op) {
  const payloads = [];

  if (op.parameters && op.parameters.length > 0) {
    const targetParams = op.parameters.filter((p) => {
      if (p.in === 'query' || p.in === 'path') {
        return true;
      }
      return false;
    });

    for (const param of targetParams) {
      SQL_INJECTION_PAYLOADS.forEach((sqlPayload) => {
        payloads.push({
          type: 'param',
          location: param.in,
          name: param.name,
          value: sqlPayload,
        });
      });
    }
  }

  if (
    METHODS_WITH_BODY.includes(op.method) &&
    op.requestBodySchema &&
    op.requestBodySchema.type === 'object' &&
    op.requestBodySchema.properties
  ) {
    const bodyPayload = {};

    for (const [propName] of Object.entries(op.requestBodySchema.properties)) {
      SQL_INJECTION_PAYLOADS.forEach((sqlPayload) => {
        if (!bodyPayload[propName]) {
          bodyPayload[propName] = sqlPayload;
        }
      });
    }

    payloads.push({
      type: 'body',
      body: bodyPayload,
    });
  }

  return payloads;
}

// -----------------------------------------------------------------------------
// Core scanning logic
// -----------------------------------------------------------------------------

async function runScan(baseUrl, openApiPath) {
  const spec = loadOpenApiSpecFromFile(openApiPath);

  log.kv('baseUrl', baseUrl);
  log.kv('openapi.title', spec.info?.title);
  log.kv('openapi.version', spec.info?.version);

  const operations = extractOperationsFromOpenApi(spec);
  log.kv('operations.count', operations.length);

  const findings      = [];
  let totalRequests   = 0;

  for (const op of operations) {
    const payloads = generatePayloadForOperation(op);

    for (const payload of payloads) {
      totalRequests += 1;

      let endpointPath = op.path;
      const queryParams = new URLSearchParams();

      if (payload.type === 'param' && payload.location === 'path') {
        endpointPath = endpointPath.replace(`{${payload.name}}`, encodeURIComponent(payload.value));
      }

      if (payload.type === 'param' && payload.location === 'query') {
        queryParams.set(payload.name, payload.value);
      }

      let bodyPayload = null;

      if (payload.type === 'body') {
        bodyPayload = payload.body;
      }

      if (Array.from(queryParams.keys()).length > 0) {
        const qs = queryParams.toString();
        endpointPath = endpointPath.includes('?')
          ? `${endpointPath}&${qs}`
          : `${endpointPath}?${qs}`;
      }

      try {
        const response = await sendRequest(baseUrl, op.method, endpointPath, bodyPayload);

        const statusCode = response.statusCode;
        const body       = response.body || '';

        let risk  = 'none';
        const notes = [];

        if (statusCode >= 500) {
          risk = 'high';
          notes.push('Server error (5xx) on SQL payload');
        }

        if (looksLikeSqlError(body)) {
          risk = 'high';
          notes.push('Response contains SQL error signature');
        }

        if (looksLikeStackTrace(body)) {
          if (risk === 'none') risk = 'medium';
          notes.push('Response looks like a stack trace');
        }

        if (risk !== 'none') {
          findings.push({
            method: op.method.toUpperCase(),
            path: op.path,
            effectivePath: endpointPath,
            operationId: op.operationId,
            payloadType: payload.type,
            payloadLocation: payload.location || null,
            payloadName: payload.name || null,
            payloadBody: payload.body || null,
            statusCode,
            risk,
            notes,
          });
        }
      } catch (err) {
        findings.push({
          method: op.method.toUpperCase(),
          path: op.path,
          effectivePath: endpointPath,
          operationId: op.operationId,
          payloadType: payload.type,
          payloadLocation: payload.location || null,
          payloadName: payload.name || null,
          payloadBody: payload.body || null,
          statusCode: null,
          risk: 'medium',
          notes: [`Request failed: ${err.message}`],
        });
      }
    }
  }

  return {
    totalRequests,
    findings,
  };
}

// -----------------------------------------------------------------------------
// Reporting
// -----------------------------------------------------------------------------

function writeReportSummary(baseUrl, openApiPath, result) {
  ensureDirExists(REPORT_DIR);

  const timestamp      = new Date().toISOString().replace(/[:.]/g, '-');
  const reportFileName = `sqlscan-${timestamp}.json`;
  const reportPath     = path.join(REPORT_DIR, reportFileName);

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    openApiPath,
    totalRequests: result.totalRequests,
    totalFindings: result.findings.length,
    findings: result.findings,
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');

  const indexPath = path.join(REPORT_DIR, 'index.json');
  let indexData   = { reports: [] };

  if (fs.existsSync(indexPath)) {
    try {
      const raw = fs.readFileSync(indexPath, 'utf-8');
      indexData = JSON.parse(raw);
      if (!Array.isArray(indexData.reports)) {
        indexData.reports = [];
      }
    } catch {
      indexData = { reports: [] };
    }
  }

  indexData.reports.push({
    file: reportFileName,
    generatedAt: report.generatedAt,
    baseUrl: report.baseUrl,
    openApiPath: report.openApiPath,
    totalRequests: report.totalRequests,
    totalFindings: report.totalFindings,
  });

  indexData.reports.sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));

  fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2), 'utf-8');

  const relReport = path.relative(ROOT_DIR, reportPath);
  const relIndex  = path.relative(ROOT_DIR, indexPath);

  log.write(`report   : ${relReport}`);
  log.write(`index    : ${relIndex}`);

  log.kv('totalRequests', result.totalRequests);
  log.kv('sqlFindings', result.findings.length);
}

// -----------------------------------------------------------------------------
// Main CLI entrypoint
// -----------------------------------------------------------------------------

async function main() {
  try {
    printUsage();

    const args    = parseArgs(process.argv);
    const baseUrl = args.baseUrl;

    const openApiPath = path.join(
      ROOT_DIR,
      'docs',
      'backend',
      'generated',
      'openapi',
      'sql',
      'sqlite.fullstack_test.openapi.json'
    );

    const result = await runScan(baseUrl, openApiPath);
    writeReportSummary(baseUrl, openApiPath, result);

    log.success();
  } catch (err) {
    log.failure(err);
    process.exit(1);
  }
}

main();

// -----------------------------------------------------------------------------
// End of tool script: test.sqlInjection
// -----------------------------------------------------------------------------
