// backend/data/sql/db.js
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config({ path: '../.env', quiet: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use path from .env or default fallback
const dbPath = path.resolve(__dirname, process.env.DB_STORAGE || 'data.db');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false,
});

// Auto-initialize if missing
export async function initDatabase(models) {
  try {
    // Sync all imported models (create tables if needed)
    await sequelize.sync();
    console.log('Database synced successfully');
  } catch (err) {
    console.error('Database initialization failed:', err.message);
  }
}

export default sequelize;
