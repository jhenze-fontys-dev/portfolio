// -----------------------------------------------------------------------------
// 🚀 Express Server - New Planet Population Register API
// -----------------------------------------------------------------------------

import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger, errorHandler, notFound } from './middleware/index.js';

// -----------------------------------------------------------------------------
// 🧱 Database & Sequelize Models
// -----------------------------------------------------------------------------
import { initDatabase } from './data/sql/db.js';
import Citizen from './data/sql/models/citizen.model.js';
import User from './data/sql/models/user.model.js';
import Role from './data/sql/models/role.model.js';
import Event from './data/sql/models/event.model.js';
import Relation from './data/sql/models/relation.model.js';
import GeneticResult from './data/sql/models/geneticResult.model.js';
import PlanetData from './data/sql/models/planetData.model.js';
import Report from './data/sql/models/report.model.js';

// 🧩 Load Associations (must come AFTER all model imports)
import './data/sql/models/global.relations.js';

// -----------------------------------------------------------------------------
// 🛣️ Express Routes
// -----------------------------------------------------------------------------
import citizenRoutes from './routes/citizen.routes.js';
import userRoutes from './routes/user.routes.js';
import roleRoutes from './routes/role.routes.js';
import eventRoutes from './routes/event.routes.js';
import relationRoutes from './routes/relation.routes.js';
import geneticResultRoutes from './routes/geneticResult.routes.js';
import planetDataRoutes from './routes/planetData.routes.js';
import reportRoutes from './routes/report.routes.js';

// -----------------------------------------------------------------------------
// ⚙️ Setup Express App
// -----------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger());

// -----------------------------------------------------------------------------
// 📦 Register Routes
// -----------------------------------------------------------------------------
app.use('/api/citizens', citizenRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/relations', relationRoutes);
app.use('/api/genetics', geneticResultRoutes);
app.use('/api/planet', planetDataRoutes);
app.use('/api/reports', reportRoutes);

// -----------------------------------------------------------------------------
// 📘 Swagger Documentation
// -----------------------------------------------------------------------------
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// -----------------------------------------------------------------------------
// ⚠️ Error Handling
// -----------------------------------------------------------------------------
app.use(notFound);
app.use(errorHandler);

// -----------------------------------------------------------------------------
// 🧩 Server Initialization (wrapped in async IIFE)
// -----------------------------------------------------------------------------
(async () => {
  try {
    console.log('\n Initializing database and synchronizing models...');

    await initDatabase([
      Citizen,
      User,
      Role,
      Event,
      Relation,
      GeneticResult,
      PlanetData,
      Report,
    ]);

    app.listen(PORT, () => {
      console.log(`\n Server running on port ${PORT}`);
      console.log(`Swagger UI available at: http://localhost:${PORT}/api-docs`);
      console.log(`API root: http://localhost:${PORT}/api\n`);
    });
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
})();
