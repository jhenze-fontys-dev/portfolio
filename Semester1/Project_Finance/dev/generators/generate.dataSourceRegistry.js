// -----------------------------------------------------------------------------
// HANDWRITTEN GENERATOR SCRIPT
//
// File       : dev/generators/generate.dataSourceRegistry.js
// Purpose    : Generates the runtime registry that maps source types to driver modules.
// Writes     : backend/data/factory/dataSourceRegistry.js
// Reads      : dev/config/metadataStructure.json, dev/templates/codeTemplates/template.dataSourceRegistry.hbs
// Notes      : Registry is the single runtime entrypoint for resolving drivers by source.type.
// -----------------------------------------------------------------------------

import {
  generateFromTemplate,
  loadJsonFromProject,
  METADATA_VERSION,
  assertMetadataVersion,
} from './generate.template.js';

import { createStepLogger } from './_logger.js';

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const STEP = 'data-source-registry';

const TEMPLATE_REL_PATH =
  'dev/templates/codeTemplates/template.dataSourceRegistry.hbs';

const OUTPUT_REL_PATH =
  'backend/data/factory/dataSourceRegistry.js';

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function parseCommaList(value) {
  return String(value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function deriveDataSourcesFromMetadata(metadata) {
  if (
    metadata &&
    Array.isArray(metadata.dataSources) &&
    metadata.dataSources.length > 0
  ) {
    return metadata.dataSources;
  }
  return null;
}

function deriveDataSourcesFallback() {
  return parseCommaList(process.env.DATA_SOURCES || 'sql');
}

function buildFlags(dataSourcesArray) {
  return {
    hasSql: dataSourcesArray.includes('sql'),
    hasJson: dataSourcesArray.includes('json'),
    hasMqtt: dataSourcesArray.includes('mqtt'),
    hasApi: dataSourcesArray.includes('api'),
  };
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

export async function generateDataSourceRegistry() {
  const log = createStepLogger({
    step: STEP,
    title: 'Data Source Registry',
    generatorPath: 'dev/generators/generate.dataSourceRegistry.js',
  });

  try {
    log.kv('output', OUTPUT_REL_PATH);

    // 1) Try loading metadata
    let metadata = null;
    try {
      metadata = loadJsonFromProject('dev/config/metadataStructure.json');
      assertMetadataVersion(STEP, metadata);
    } catch {
      // intentional: silent fallback to env
    }

    // 2) Determine active data sources
    const fromMetadata = deriveDataSourcesFromMetadata(metadata);
    const dataSourcesArray = fromMetadata ?? deriveDataSourcesFallback();

    log.kv(
      'sources',
      dataSourcesArray.length ? dataSourcesArray.join(', ') : '(none)',
    );

    // 3) Build template context
    const flags = buildFlags(dataSourcesArray);
    const context = {
      metadataVersion: METADATA_VERSION,
      dataSources: dataSourcesArray,
      ...flags,
    };

    // 4) Render template
    log.template(TEMPLATE_REL_PATH);

    await generateFromTemplate({
      templateRelativePath: TEMPLATE_REL_PATH,
      targetRelativePath: OUTPUT_REL_PATH,
      context,
      overwrite: true,
    });

    log.write(OUTPUT_REL_PATH);
    log.success();
  } catch (err) {
    log.failure(err);
    process.exit(1);
  }
}

// -----------------------------------------------------------------------------
// CLI entry
// -----------------------------------------------------------------------------

generateDataSourceRegistry();

// -----------------------------------------------------------------------------
// End of generator script: generate.dataSourceRegistry
// -----------------------------------------------------------------------------
