// -----------------------------------------------------------------------------
// HANDWRITTEN GENERATOR SCRIPT
//
// File       : dev/generators/generate.drivers.js
// Purpose    : Generates data-source driver modules per source type.
// Writes     : backend/data/sql/sql.driver.js, backend/data/json/json.driver.js, backend/data/mqtt/mqtt.driver.js, backend/data/api/api.driver.js
// Reads      : dev/config/metadataStructure.json, dev/templates/codeTemplates/template.*Driver.hbs
// Notes      : One driver per source type; output paths are stable and metadata-driven.
// -----------------------------------------------------------------------------

import { generateFromTemplate, loadJsonFromProject } from './generate.template.js';
import { createStepLogger } from './_logger.js';

const METADATA_PATH = 'dev/config/metadataStructure.json';

const TEMPLATES = {
  sql: 'dev/templates/codeTemplates/template.sqlDriver.hbs',
  json: 'dev/templates/codeTemplates/template.jsonDriver.hbs',
  mqtt: 'dev/templates/codeTemplates/template.mqttDriver.hbs',
  api: 'dev/templates/codeTemplates/template.apiDriver.hbs',
};

const OUTPUTS = {
  sql: 'backend/data/sql/sql.driver.js',
  json: 'backend/data/json/json.driver.js',
  mqtt: 'backend/data/mqtt/mqtt.driver.js',
  api: 'backend/data/api/api.driver.js',
};

export async function generateDrivers() {
  const log = createStepLogger({
    step: 'drivers',
    title: 'Drivers',
    generatorPath: 'dev/generators/generate.drivers.js',
  });

  try {
    const metadata = loadJsonFromProject(METADATA_PATH);
    const dataSources = Array.isArray(metadata?.dataSources) ? metadata.dataSources : [];

    log.kv('sources', dataSources.length ? dataSources.join(', ') : '(none)');

    if (!dataSources.length) {
      log.kv('warning', 'No dataSources declared in metadata; nothing to generate.');
      log.success();
      return;
    }

    for (const type of dataSources) {
      const key = String(type || '').trim().toLowerCase();
      const templateRelPath = TEMPLATES[key];
      const outputRelPath = OUTPUTS[key];

      if (!templateRelPath || !outputRelPath) {
        log.kv('warning', `No driver template/output registered for type "${key}"; skipping.`);
        continue;
      }

      // precise output line per type (no ** globs)
      log.kv('output', outputRelPath);
      log.template(templateRelPath);

      await generateFromTemplate({
        templateRelativePath: templateRelPath,
        targetRelativePath: outputRelPath,
        context: {},
        overwrite: true,
      });

      log.write(outputRelPath);
    }

    log.success();
  } catch (err) {
    log.failure(err);
    process.exit(1);
  }
}

generateDrivers().catch(() => process.exit(1));

// -----------------------------------------------------------------------------
// End of generator script: generate.drivers
// -----------------------------------------------------------------------------
