/**
 * -----------------------------------------------------------------------------
 * 🌍 PlanetData OpenAPI Documentation
 * Path base: /api/planet
 * Schema: #/components/schemas/PlanetData
 * -----------------------------------------------------------------------------
 */

/**
 * @openapi
 * /api/planet:
 *   get:
 *     summary: Get Planet Data
 *     tags: [Planet]
 *     responses:
 *       '200':
 *         description: List of planet data records
 *   post:
 *     summary: Create Planet Data record
 *     tags: [Planet]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PlanetData' }
 *     responses:
 *       '201': { description: Planet data created }
 *
 * /api/planet/search:
 *   get:
 *     summary: Search Planet Data
 *     tags: [Planet]
 *     parameters:
 *       - name: name
 *         in: query
 *         schema: { type: string }
 *     responses:
 *       '200': { description: Search results }
 *
 * /api/planet/{id}:
 *   get:
 *     summary: Get Planet Data by ID
 *     tags: [Planet]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       '200': { description: Planet data found }
 *       '404': { $ref: '#/components/responses/NotFound' }
 *
 *   patch:
 *     summary: Update Planet Data by ID
 *     tags: [Planet]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PlanetData' }
 *     responses:
 *       '200': { description: Planet data updated }
 *
 *   delete:
 *     summary: Delete Planet Data by ID
 *     tags: [Planet]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       '200': { description: Planet data deleted }
 *
 * /api/planet/capacity:
 *   get:
 *     summary: Get carrying capacity
 *     tags: [Planet]
 *     responses:
 *       '200':
 *         description: Carrying capacity calculation result
 */
