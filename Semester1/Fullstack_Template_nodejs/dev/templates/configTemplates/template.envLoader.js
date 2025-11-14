// -----------------------------------------------------------------------------
// 🌍 Environment Loader Template (CODEX Reference)
// -----------------------------------------------------------------------------
// Loads environment variables for CODEX-generated projects.
// Supports both `.env` and `.env.yaml` formats for flexible configuration.
//
// When CODEX generates a backend project, this file becomes:
//   `/backend/config/envLoader.js`
//
// It ensures:
//   - `.env.yaml` is parsed first (if present)
//   - Falls back to `.env` using dotenv
//   - Flattens YAML keys into process.env for consistency
//   - Logs active data sources and environment info
// -----------------------------------------------------------------------------
//
// 📂 Location: dev/templates/codeTemplates/template.envLoader.js
// -----------------------------------------------------------------------------

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import YAML from "yaml";

// -----------------------------------------------------------------------------
// 📁 Path Setup
// -----------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, "../../../");
const ENV_PATH = path.resolve(ROOT_DIR, ".env");
const ENV_YAML_PATH = path.resolve(ROOT_DIR, ".env.yaml");

// -----------------------------------------------------------------------------
// 🧩 YAML Loader Helper
// -----------------------------------------------------------------------------
// Flattens nested YAML objects into dot-notation env keys (e.g. sql.host → SQL_HOST)
function flattenYaml(obj, parentKey = "", result = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const newKey = parentKey ? `${parentKey}.${key}` : key;
    if (typeof value === "object" && value !== null) {
      flattenYaml(value, newKey, result);
    } else {
      const envKey = newKey.replace(/\./g, "_").toUpperCase();
      result[envKey] = value;
    }
  }
  return result;
}

// -----------------------------------------------------------------------------
// 🚀 Load Environment Configuration
// -----------------------------------------------------------------------------
export function loadEnvironmentConfig() {
  let source = "none";
  let envConfig = {};

  // Prefer YAML over .env
  if (fs.existsSync(ENV_YAML_PATH)) {
    try {
      const yamlContent = fs.readFileSync(ENV_YAML_PATH, "utf8");
      const parsedYaml = YAML.parse(yamlContent);
      const flatEnv = flattenYaml(parsedYaml);
      Object.assign(process.env, flatEnv);
      envConfig = flatEnv;
      source = ".env.yaml";
    } catch (err) {
      console.error("[ENV] Failed to parse .env.yaml:", err.message);
    }
  } else if (fs.existsSync(ENV_PATH)) {
    const result = dotenv.config({ path: ENV_PATH });
    if (result.error) {
      console.error("[ENV] Failed to load .env file:", result.error.message);
    } else {
      envConfig = result.parsed || {};
      source = ".env";
    }
  } else {
    console.warn("[ENV] No .env or .env.yaml found, using defaults.");
  }

  // Display summary
  const dataSources = (process.env.DATA_SOURCES || "").split(",").map(s => s.trim()).filter(Boolean);
  const dialect = process.env.DB_DIALECT || "unknown";
  const nodeEnv = process.env.NODE_ENV || "development";

  console.log("--------------------------------------------------");
  console.log(`Environment loaded from: ${source}`);
  console.log(`Node Environment: ${nodeEnv}`);
  console.log(`Database Dialect: ${dialect}`);
  console.log(`Active Data Sources: ${dataSources.join(", ") || "none"}`);
  console.log("--------------------------------------------------");

  return envConfig;
}

// -----------------------------------------------------------------------------
// 🧩 Safe Initialization on Import
// -----------------------------------------------------------------------------
try {
  loadEnvironmentConfig();
} catch (err) {
  console.error("[ENV] Critical configuration load failure:", err.message);
}

// -----------------------------------------------------------------------------
// 🧠 CODEX Template Notes
// -----------------------------------------------------------------------------
// When CODEX generates a new backend project:
//
// 1️⃣ This file will be copied to `/backend/config/envLoader.js`.
// 2️⃣ The generated project will support both `.env` and `.env.yaml` configs.
// 3️⃣ If `.env.yaml` exists, it takes precedence over `.env`.
// 4️⃣ The loader flattens nested YAML structures to `process.env` keys.
// 5️⃣ Logs summary information (environment, dialect, sources) at startup.
// 6️⃣ Future CODEX versions may extend this loader to support environment
//     profiles (e.g. `.env.development.yaml`, `.env.production.yaml`).
// -----------------------------------------------------------------------------
