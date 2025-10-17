# 🗒️ Annotations

This folder stores **JSDoc-style API annotations** that describe your Express routes.  
These annotations are parsed by Swagger to generate live API documentation.

### Example
```js
/**
 * @openapi
 * /api/items:
 *   get:
 *     summary: Retrieve all items
 *     responses:
 *       200:
 *         description: Successful response
 */
```

Each `.doc.js` file should mirror a route file and define its OpenAPI specification.
