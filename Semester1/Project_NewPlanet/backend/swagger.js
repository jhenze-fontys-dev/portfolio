// -----------------------------------------------------------------------------
// 📘 Swagger / OpenAPI Configuration
// -----------------------------------------------------------------------------
// Generates OpenAPI documentation from YAML schemas and JSDoc annotations.
// -----------------------------------------------------------------------------

import swaggerJsdoc from 'swagger-jsdoc';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve relative paths safely
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -----------------------------------------------------------------------------
// 🧩 Load Shared Schemas
// -----------------------------------------------------------------------------
const errorSchema = YAML.load(
  path.resolve(__dirname, '../docs/backend/schemas/shared/errorResponse.yaml')
);

// -----------------------------------------------------------------------------
// 🧍 Load Entity Schemas
// -----------------------------------------------------------------------------
const citizenSchema = YAML.load(
  path.resolve(__dirname, '../docs/backend/schemas/citizen.schema.yaml')
);
const userSchema = YAML.load(
  path.resolve(__dirname, '../docs/backend/schemas/user.schema.yaml')
);
const roleSchema = YAML.load(
  path.resolve(__dirname, '../docs/backend/schemas/role.schema.yaml')
);
const eventSchema = YAML.load(
  path.resolve(__dirname, '../docs/backend/schemas/event.schema.yaml')
);
const relationSchema = YAML.load(
  path.resolve(__dirname, '../docs/backend/schemas/relation.schema.yaml')
);
const geneticResultSchema = YAML.load(
  path.resolve(__dirname, '../docs/backend/schemas/geneticResult.schema.yaml')
);
const planetDataSchema = YAML.load(
  path.resolve(__dirname, '../docs/backend/schemas/planetData.schema.yaml')
);
const reportSchema = YAML.load(
  path.resolve(__dirname, '../docs/backend/schemas/report.schema.yaml')
);

// -----------------------------------------------------------------------------
// ⚙️ Swagger Configuration
// -----------------------------------------------------------------------------
const options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Population Register API',
      version: '1.0.0',
      description:
        'API documentation for the New Planet Population Registry project, auto-generated from JSDoc annotations and YAML schemas.',
    },
    components: {
      schemas: {
        // Shared
        ErrorResponse: errorSchema.ErrorResponse,

        // Entities
        Citizen: citizenSchema.Citizen,
        User: userSchema.User,
        Role: roleSchema.Role,
        Event: eventSchema.Event,
        Relation: relationSchema.Relation,
        GeneticResult: geneticResultSchema.GeneticResult,
        PlanetData: planetDataSchema.PlanetData,
        Report: reportSchema.Report,
      },
    },
  },

  // ---------------------------------------------------------------------------
  // 📂 Annotation Sources
  // ---------------------------------------------------------------------------
  apis: [
    path.resolve(__dirname, '../docs/backend/annotations/*.doc.js'),
  ],
};

// -----------------------------------------------------------------------------
// 🧾 Export Swagger Spec
// -----------------------------------------------------------------------------
const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
