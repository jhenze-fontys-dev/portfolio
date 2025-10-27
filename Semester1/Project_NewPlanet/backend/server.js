import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
import path from 'path';
import { logger, errorHandler, notFound } from './middleware/index.js'; 
import crudRoutes from './routes/crud.routes.js';
import { initDatabase } from './data/sql/db.js';
import Item from './data/sql/models/Item.js';

const PORT = process.env.PORT || 3000;
const app = express();

// Setup static folder
//app.use(express.static(path.join(__dirname, 'public')));


// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logger middleware: Use .env default (swagger)
app.use(logger()); // Or override with postman: app.use(createLogger('postman'));

// Routes
app.use('/api/crud', crudRoutes);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handler
app.use(notFound);
app.use(errorHandler);

// Auto-create DB tables before server starts
await initDatabase([Item]);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Swagger UI running on http://localhost:3000/api-docs');
});
