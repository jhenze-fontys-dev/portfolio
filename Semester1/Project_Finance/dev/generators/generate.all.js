// dev/generators/generate.all.js

// 1) Imports
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRunLogger } from './_logger.js'; // optional, if you extend it

// 2) Resolve project root (so it works from anywhere)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// 3) Define the ordered generator steps
const steps = [
  { name: 'metadata',       script: 'dev/generators/generate.metadataStructure.js' },
  { name: 'env',            script: 'dev/generators/generate.env.js' },
  { name: 'sql-database',   script: 'dev/generators/generate.sqlDatabase.js' },
  { name: 'drivers',        script: 'dev/generators/generate.drivers.js' },
  { name: 'registry',       script: 'dev/generators/generate.dataSourceRegistry.js' },
  { name: 'models',         script: 'dev/generators/generate.models.js' },
  { name: 'services',       script: 'dev/generators/generate.services.js' },
  { name: 'controllers',    script: 'dev/generators/generate.controllers.js' },
  { name: 'routes',         script: 'dev/generators/generate.routes.js' },
  { name: 'route-registry', script: 'dev/generators/generate.routeRegistry.js' },
  { name: 'openapi',        script: 'dev/generators/generate.openAPI.js' },
];



///Helper to run a single step
async function runStep(step, runLogger) {
  const startedAt = Date.now();

  // optional: log "start" to JSON log
  runLogger?.logStepStart(step.name);

  return new Promise((resolve) => {
    const child = spawn('node', [step.script], {
      cwd: PROJECT_ROOT,
      stdio: 'inherit', // show child output directly in console
      shell: process.platform === 'win32', // nicer on Windows
    });

    child.on('exit', (code) => {
      const durationMs = Date.now() - startedAt;
      const success = code === 0;

      // optional: log to JSON log
      runLogger?.logStepEnd(step.name, { success, durationMs });

      resolve({ 
        name: step.name,
        success,
        durationMs,
        exitCode: code,
      });
    });
  });
}


///Orchestrator: run all steps in order
async function runAll() {
  const runId = new Date().toISOString().replace(/[:.]/g, '-');
  const runLogger = createRunLogger?.(runId); // depends on how you extend _logger.js

  console.log('------------------------------------------------------------');
  console.log('Generator Orchestrator');
  console.log('------------------------------------------------------------');
  console.log(`runId   : ${runId}`);
  console.log(`steps   : ${steps.map((s) => s.name).join(', ')}`);
  console.log('------------------------------------------------------------');

  const results = [];

  for (const step of steps) {
    console.log(`\n[gen:all] Starting step: ${step.name}`);
    const result = await runStep(step, runLogger);
    results.push(result);

    if (!result.success) {
      console.error(`[gen:all] Step FAILED: ${step.name} (exitCode=${result.exitCode})`);
      // depending on policy: break here or continue to try remaining steps
      break;
    }
  }

  // Print summary
  console.log('\n------------------------------------------------------------');
  console.log('Generator run summary');
  console.log('------------------------------------------------------------');

  let allSuccess = true;

  for (const r of results) {
    const status = r.success ? 'success' : 'FAILED';
    console.log(
      `${r.name.padEnd(14)} : ${status} (${r.durationMs} ms)${
        r.success ? '' : ` [exitCode=${r.exitCode}]`
      }`
    );
    if (!r.success) {
      allSuccess = false;
    }
  }

  console.log('------------------------------------------------------------');
  console.log(`Result  : ${allSuccess ? 'SUCCESS' : 'FAILED'}`);
  console.log('------------------------------------------------------------');

  process.exit(allSuccess ? 0 : 1);
}


///Entry point
runAll().catch((err) => {
  console.error('[gen:all] Orchestrator error:', err);
  process.exit(1);
});



///How npm run gen:all would look in V2.1

// "gen:all": "npm run gen:metadata && npm run gen:env && ..."
// "gen:all": "node dev/generators/generate.all.js"


/*

4. How future UI would use this
Later, for a web-based admin/dashboard:


UI calls an endpoint: POST /admin/generators/run-all


Backend endpoint:


spawns node dev/generators/generate.all.js


returns a runId




UI polls:


GET /admin/generators/runs/:runId which reads from your JSON logs and returns:


per-step status


start/end times


errors






Because generate.all.js is already emitting structured events to your _logger (once you hook it in), the UI doesn’t need to parse console output.

5. What to do now (V2 vs V2.1)
For V2 (right now):


keep current npm run gen:all


keep this pseudocode somewhere (e.g. docs/backend/generators.md or a “V2.1 ideas” section)


For V2.1:


implement dev/generators/generate.all.js using this skeleton


adjust npm run gen:all


optionally extend _logger.js with:


createRunLogger(runId)


logStepStart(stepName)


logStepEnd(stepName, { success, durationMs })





If you want, I can also help you draft a short “Future ADR” snippet that says:

“In V2.1, gen:all will move to a dedicated orchestrator script to support UI integration and richer feedback.”

So you don’t lose this idea.

*/