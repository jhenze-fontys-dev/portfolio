// -----------------------------------------------------------------------------
// 📡 MQTT Data Service Template (CODEX Reference)
// -----------------------------------------------------------------------------
// Provides a unified interface for subscribing and publishing to MQTT topics.
// Designed for hybrid backends that combine MQTT with SQL, JSON, or API sources.
//
// CODEX copies this file to `/backend/data/mqtt/mqttDataService.js`
// during backend project generation.
//
// It handles:
//  - Broker connection using environment configuration
//  - Safe startup and reconnection
//  - Graceful fallback if the MQTT broker is offline
// -----------------------------------------------------------------------------
//
// 📂 Location: dev/templates/codeTemplates/template.mqttDataService.js
// -----------------------------------------------------------------------------

import mqtt from 'mqtt';
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
// ⚙️ MQTT Configuration
// -----------------------------------------------------------------------------
// Example .env entries:
//
//   DATA_SOURCES=sql,mqtt
//   MQTT_BROKER_URL=mqtt://localhost:1883
//   MQTT_USERNAME=user
//   MQTT_PASSWORD=secret
//   MQTT_CLIENT_ID=myAppClient
//
const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
const MQTT_USERNAME = process.env.MQTT_USERNAME || '';
const MQTT_PASSWORD = process.env.MQTT_PASSWORD || '';
const MQTT_CLIENT_ID = process.env.MQTT_CLIENT_ID || 'codex_mqtt_client';

// -----------------------------------------------------------------------------
// 🚀 Initialize MQTT Client
// -----------------------------------------------------------------------------
export async function initializeMqttDataService() {
  console.log('[MQTT] Initializing MQTT client...');

  return new Promise((resolve) => {
    try {
      const client = mqtt.connect(MQTT_BROKER_URL, {
        clientId: MQTT_CLIENT_ID,
        username: MQTT_USERNAME,
        password: MQTT_PASSWORD,
        reconnectPeriod: 2000,
      });

      client.on('connect', () => {
        console.log('[MQTT] Connected to broker at', MQTT_BROKER_URL);
        resolve({
          client,
          publish: (topic, message) =>
            client.publish(topic, JSON.stringify(message)),
          subscribe: (topic, handler) => {
            client.subscribe(topic);
            client.on('message', (receivedTopic, payload) => {
              if (receivedTopic === topic) {
                try {
                  handler(JSON.parse(payload.toString()));
                } catch {
                  handler(payload.toString());
                }
              }
            });
          },
        });
      });

      client.on('error', (err) => {
        console.error('[MQTT] Connection error:', err.message);
      });
    } catch (err) {
      console.error('[MQTT] Initialization failed:', err.message);
      resolve({
        client: null,
        publish: () => {},
        subscribe: () => {},
      });
    }
  });
}

// -----------------------------------------------------------------------------
// 📦 Safe Default Export
// -----------------------------------------------------------------------------
let mqttDataService = null;

try {
  mqttDataService = await initializeMqttDataService();
} catch (err) {
  console.error('[MQTT] Initialization failed:', err.message);
  mqttDataService = {
    client: null,
    publish: () => {},
    subscribe: () => {},
  };
}

export default mqttDataService;

// -----------------------------------------------------------------------------
// 🧠 CODEX Template Notes
// -----------------------------------------------------------------------------
// When CODEX generates a new backend project:
//
// 1️⃣ CODEX will copy this file to `/backend/data/mqtt/mqttDataService.js`.
// 2️⃣ It will ensure `mqtt` is included in `package.json` dependencies.
// 3️⃣ CODEX will populate `.env` with these entries:
//
//      DATA_SOURCES=sql,mqtt
//      MQTT_BROKER_URL=mqtt://localhost:1883
//      MQTT_USERNAME=user
//      MQTT_PASSWORD=secret
//      MQTT_CLIENT_ID=myAppClient
//
// 4️⃣ CODEX will automatically register this service inside
//     `/backend/data/factory/dataSourceRegistry.js`.
//
// 5️⃣ The generated backend will then support MQTT message streaming and
//     hybrid data integration alongside SQL, JSON, and API sources.
//
// -----------------------------------------------------------------------------
