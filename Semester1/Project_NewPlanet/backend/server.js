// -----------------------------------------------------------------------------
// 🚀 Express Server - New Planet Population Register API
// -----------------------------------------------------------------------------

import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger, errorHandler, notFound } from './middleware/index.js';

// Database initialization
import { initDatabase } from './data/sql/db.js';

// Sequelize models
import Citizen from './data/sql/models/citizen.model.js';
import User from './data/sql/models/user.model.js';
import Role from './data/sql/models/role.model.js';
import Event from './data/sql/models/event.model.js';
import Relation from './data/sql/models/relation.model.js';
import GeneticResult from './data/sql/models/geneticResult.model.js';
import PlanetData from './data/sql/models/planetData.model.js';
import Report from './data/sql/models/report.model.js';

// Relations (must be imported AFTER models)
import './data/sql/models/global.relations.js';

// Express routes
import citizenRoutes from './routes/citizen.routes.js';
import userRoutes from './routes/user.routes.js';
import roleRoutes from './routes/role.routes.js';
import eventRoutes from './routes/event.routes.js';
import relationRoutes from './routes/relation.routes.js';
import geneticResultRoutes from './routes/geneticResult.routes.js';
import planetDataRoutes from './routes/planetData.routes.js';
import reportRoutes from './routes/report.routes.js';

// -----------------------------------------------------------------------------
// 🛠️ Setup
// -----------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logger middleware
app.use(logger());

// -----------------------------------------------------------------------------
// 📦 API Routes
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
// 🧱 Initialize Database and Start Server
// -----------------------------------------------------------------------------
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
  console.log(`\n✅ Server running on port ${PORT}`);
  console.log(`📘 Swagger UI available at: http://localhost:${PORT}/api-docs\n`);
});
