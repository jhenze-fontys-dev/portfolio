import swaggerJsdoc from 'swagger-jsdoc';
import YAML from 'yamljs';

// Load external schemas
const itemSchema = YAML.load('../docs/backend/schemas/crud/item.yaml');
const errorSchema = YAML.load('../docs/backend/schemas/shared/errorResponse.yaml');

const options = {
  definition: {
    openapi: '3.1.0',
    info: { title: 'Fullstack Template API', version: '1.0.0' },
    components: {
      schemas: {
        Item: itemSchema.Item,
        ErrorResponse: errorSchema.ErrorResponse,
      },
    },
  },
  apis: ['../docs/backend/annotations/crud.doc.js'], 
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
