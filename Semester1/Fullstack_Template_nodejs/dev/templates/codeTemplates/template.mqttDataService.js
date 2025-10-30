// -----------------------------------------------------------------------------
// 📡 MQTT Data Service Template (CODEX Reference)
// -----------------------------------------------------------------------------
// Provides a standard interface for connecting to and interacting with an
// MQTT broker using the `mqtt` package. This template is fully compatible
// with the multi-source backend design (SQL + JSON + MQTT + API).
//
// CODEX copies this file to `/backend/data/mqtt/mqttDataService.js`
// when generating a new backend project.
//
// It handles:
// - Connection setup via environment variables
// - Topic subscriptions and message handling
// - Publishing messages
// - Graceful fallback on failure
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
// ⚙️ Configuration
// -----------------------------------------------------------------------------
// Example environment variables:
//
//   MQTT_HOST=localhost
//   MQTT_PORT=1883
//   MQTT_PROTOCOL=mqtt
//   MQTT_USERNAME=user
//   MQTT_PASSWORD=pass
//   MQTT_TOPICS=sensor/temperature,sensor/humidity
//
const MQTT_HOST = process.env.MQTT_HOST || 'localhost';
const MQTT_PORT = process.env.MQTT_PORT || '1883';
const MQTT_PROTOCOL = process.env.MQTT_PROTOCOL || 'mqtt';
const MQTT_USERNAME = process.env.MQTT_USERNAME || '';
const MQTT_PASSWORD = process.env.MQTT_PASSWORD || '';
const MQTT_TOPICS =
  process.env.MQTT_TOPICS?.split(',').map((t) => t.trim()) || [];

// -----------------------------------------------------------------------------
// 🧩 Connection Helper
// -----------------------------------------------------------------------------
export async function initializeMqttDataService() {
  const brokerUrl = `${MQTT_PROTOCOL}://${MQTT_HOST}:${MQTT_PORT}`;

  console.log(`[MQTT] Connecting to broker: ${brokerUrl}`);

  const client = mqtt.connect(brokerUrl, {
    username: MQTT_USERNAME || undefined,
    password: MQTT_PASSWORD || undefined,
  });

  return new Promise((resolve) => {
    client.on('connect', () => {
      console.log('[MQTT] Connected successfully');

      // Subscribe to predefined topics
      MQTT_TOPICS.forEach((topic) => {
        client.subscribe(topic, (err) => {
          if (err) {
            console.warn(`[MQTT] Failed to subscribe to ${topic}:`, err.message);
          } else {
            console.log(`[MQTT] Subscribed to topic: ${topic}`);
          }
        });
      });

      // Handle incoming messages
      client.on('message', (topic, message) => {
        console.log(`[MQTT] Message from ${topic}: ${message.toString()}`);
      });

      // Return unified service interface
      resolve({
        client,
        publish: (topic, payload) => client.publish(topic, payload),
        subscribe: (topic, callback) => {
          client.subscribe(topic);
          client.on('message', (msgTopic, msg) => {
            if (msgTopic === topic) callback(msg.toString());
          });
        },
        disconnect: () => client.end(),
      });
    });

    client.on('error', (err) => {
      console.error('[MQTT] Connection error:', err.message);
      resolve({ client: null, publish: () => {}, subscribe: () => {} });
    });
  });
}

// -----------------------------------------------------------------------------
// 📦 Safe Default Export
// -----------------------------------------------------------------------------
// Ensures that import errors or connection issues won’t crash the backend.

let mqttDataService = null;

try {
  mqttDataService = await initializeMqttDataService();
} catch (err) {
  console.error('[MQTT] Initialization failed:', err.message);
  mqttDataService = { client: null, publish: () => {}, subscribe: () => {} };
}

export default mqttDataService;

// -----------------------------------------------------------------------------
// 🧠 CODEX Template Notes
// -----------------------------------------------------------------------------
//
// When CODEX generates a new backend project:
//
// 1️⃣ Copy this file to `/backend/data/mqtt/mqttDataService.js`
// 2️⃣ Add `mqtt` to dependencies in `package.json`
// 3️⃣ Add `.env` configuration entries:
//
//      DATA_SOURCES=sql,json,mqtt
//      MQTT_HOST=localhost
//      MQTT_PORT=1883
//      MQTT_PROTOCOL=mqtt
//      MQTT_TOPICS=sensor/temp,sensor/humidity
//
// 4️⃣ Automatically register this service inside
//     `/backend/data/factory/dataSourceRegistry.js`
//
// -----------------------------------------------------------------------------
// 💡 Optional minor enhancement (not required):
// Add a convenience helper for future use:
//
// export function getDataSource(name) {
//   return dataRegistry[name] || null;
// }
//
// This will simplify controller access patterns later, but it’s optional.
// -----------------------------------------------------------------------------
