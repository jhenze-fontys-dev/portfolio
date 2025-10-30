// -----------------------------------------------------------------------------
// 🗃️ SQL Database Template (CODEX Reference)
// -----------------------------------------------------------------------------
// This file defines the default Sequelize database initialization logic for
// any CODEX-generated backend project. It supports all major SQL dialects:
//   - SQLite
//   - PostgreSQL
//   - MySQL / MariaDB
//   - MSSQL
//
// CODEX copies this template into `/backend/data/sql/sqlDatabase.js`
// during project setup and injects values based on `.env` configuration.
//
// ⚠️ Do NOT execute this file directly — it serves as a generation blueprint.
// -----------------------------------------------------------------------------
//
// 📂 Location: dev/templates/codeTemplates/template.sqlDatabase.js
// -----------------------------------------------------------------------------

import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

// -----------------------------------------------------------------------------
// 🌍 Environment Setup
// -----------------------------------------------------------------------------
// CODEX ensures `.env` exists before generation.
// Adjust the relative path here if the final project uses a different structure.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// -----------------------------------------------------------------------------
// ⚙️ Database Configuration
// -----------------------------------------------------------------------------
// These settings are automatically adjusted based on user inputs or `.env`.
// Supported dialects: sqlite | postgres | mysql | mariadb | mssql

const DIALECT = process.env.DB_DIALECT || 'sqlite';
const LOGGING = process.env.DB_LOGGING === 'true';
const STORAGE = process.env.DB_STORAGE || './data/app.sqlite';

const sequelizeConfig = {
  dialect: DIALECT,
  logging: LOGGING,
};

// SQLite configuration (local file-based database)
if (DIALECT === 'sqlite') {
  sequelizeConfig.storage = path.resolve(__dirname, STORAGE);
}

// Network-based configuration (Postgres, MySQL, etc.)
else {
  sequelizeConfig.host = process.env.DB_HOST || 'localhost';
  sequelizeConfig.username = process.env.DB_USER || 'root';
  sequelizeConfig.password = process.env.DB_PASS || '';
  sequelizeConfig.database = process.env.DB_NAME || 'app_database';
  sequelizeConfig.port = process.env.DB_PORT
    ? Number(process.env.DB_PORT)
    : undefined;
}

// -----------------------------------------------------------------------------
// 🚀 Initialize Sequelize Instance
// -----------------------------------------------------------------------------
// CODEX injects this into `/backend/data/sql/sqlDatabase.js` in the generated
// project. Models will be registered dynamically at runtime.

export const sequelize = new Sequelize(sequelizeConfig);

// -----------------------------------------------------------------------------
// 🧩 Database Initialization Helper
// -----------------------------------------------------------------------------
// Called by the backend’s startup logic (e.g., inside `server.js` or
// `sqlDataService.js`) to test the connection and sync models.

export async function initSqlDatabase(models = []) {
  try {
    await sequelize.authenticate();
    console.log(`Connected to ${DIALECT.toUpperCase()} database`);

    if (models.length > 0) {
      await sequelize.sync();
      console.log('All models synced successfully');
    }

    // -------------------------------------------------------------------------
    // ⚙️ Minor suggestion
    // -------------------------------------------------------------------------
    // Optionally return the Sequelize instance to allow advanced setups or
    // programmatic control after initialization.
    return sequelize;
  } catch (err) {
    console.error('Database initialization failed:', err.message);
  }
}

export default sequelize;

// -----------------------------------------------------------------------------
// 🧠 CODEX Template Notes
// -----------------------------------------------------------------------------
// CODEX will perform the following actions when generating a new backend:
//
// 1. Copy this file to `/backend/data/sql/sqlDatabase.js`.
// 2. Generate a `.env` file if missing, populating these keys:
//      DB_DIALECT=sqlite
//      DB_STORAGE=./data/app.sqlite
//      DB_HOST=localhost
//      DB_PORT=5432
//      DB_USER=app_user
//      DB_PASS=secret
//      DB_NAME=app_database
//      DB_LOGGING=false
// 3. Detect dialect automatically based on user setup (SQLite for local dev).
// 4. Adjust relative paths as needed depending on the backend layout.
// 5. Connect and sync all Sequelize models during the first boot.
//
// -----------------------------------------------------------------------------
// 🧩 Future Extensions
// -----------------------------------------------------------------------------
// This file is designed to support additional data connectors in the future,
// including JSON, API, or MQTT data sources. When multi-source support is
// enabled, the `sqlDatabase.js` module can safely coexist with others under:
//
//   /backend/data/json/jsonDataService.js
//   /backend/data/mqtt/mqttDataService.js
//
// Each layer will be orchestrated by `dataSourceRegistry.js` to unify access.
// -----------------------------------------------------------------------------
