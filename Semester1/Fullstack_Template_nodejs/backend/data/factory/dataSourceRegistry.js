// -----------------------------------------------------------------------------
// 🧩 Data Source Registry
// -----------------------------------------------------------------------------
// Dynamically loads and manages all active data sources (SQL, JSON, MQTT, API).
// Supports hybrid mode: multiple sources can coexist (e.g., SQL + MQTT + JSON).
// -----------------------------------------------------------------------------
// 📂 Location: backend/data/factory/dataSourceRegistry.js
// -----------------------------------------------------------------------------

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// -----------------------------------------------------------------------------
// 🌍 Environment Setup
// -----------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// -----------------------------------------------------------------------------
// ⚙️ Source Configuration
// -----------------------------------------------------------------------------
const activeSources =
  process.env.DATA_SOURCES?.split(',').map((s) => s.trim().toLowerCase()) ||
  ['sqlite'];

// Registry object (will contain all loaded data services)
export const dataRegistry = {};

// -----------------------------------------------------------------------------
// 🗃️ SQL Source (Sequelize-based)
// -----------------------------------------------------------------------------
if (activeSources.includes('sqlite') || activeSources.includes('sql')) {
  try {
    const { default: sequelize } = await import('../sql/db.js');
    const { citizenService } = await import('../sql/services/citizen.service.js');
    const { userService } = await import('../sql/services/user.service.js');
    const { eventService } = await import('../sql/services/event.service.js');
    const { relationService } = await import('../sql/services/relation.service.js');
    const { geneticResultService } = await import('../sql/services/geneticResult.service.js');
    const { planetDataService } = await import('../sql/services/planetData.service.js');
    const { reportService } = await import('../sql/services/report.service.js');

    dataRegistry.sql = {
      sequelize,
      citizenService,
      userService,
      eventService,
      relationService,
      geneticResultService,
      planetDataService,
      reportService,
    };

    console.log('🗃️ [DataRegistry] SQL data services registered');
  } catch (err) {
    console.warn('⚠️ [DataRegistry] SQL source skipped:', err.message);
  }
}

// -----------------------------------------------------------------------------
// 📄 JSON Source
// -----------------------------------------------------------------------------
if (activeSources.includes('json')) {
  try {
    const { jsonDataService } = await import('../json/jsonDataService.js');
    dataRegistry.json = jsonDataService;
    console.log('📄 [DataRegistry] JSON data service registered');
  } catch (err) {
    console.warn('⚠️ [DataRegistry] JSON source skipped:', err.message);
  }
}

// -----------------------------------------------------------------------------
// 📡 MQTT Source
// -----------------------------------------------------------------------------
if (activeSources.includes('mqtt')) {
  try {
    const { mqttDataService } = await import('../mqtt/mqttDataService.js');
    dataRegistry.mqtt = mqttDataService;
    console.log('📡 [DataRegistry] MQTT data service registered');
  } catch (err) {
    console.warn('⚠️ [DataRegistry] MQTT source skipped:', err.message);
  }
}

// -----------------------------------------------------------------------------
// 🌐 External API Source
// -----------------------------------------------------------------------------
if (activeSources.includes('api')) {
  try {
    const { apiDataService } = await import('../api/apiDataService.js');
    dataRegistry.api = apiDataService;
    console.log('🌐 [DataRegistry] API data service registered');
  } catch (err) {
    console.warn('⚠️ [DataRegistry] API source skipped:', err.message);
  }
}

// -----------------------------------------------------------------------------
// 🧭 Export Unified Registry
// -----------------------------------------------------------------------------
export default dataRegistry;
