/**
 * -----------------------------------------------------------------------------
 * 📊 Report OpenAPI Documentation
 * Path base: /api/reports
 * Schema: #/components/schemas/Report
 * -----------------------------------------------------------------------------
 */

/**
 * @openapi
 * /api/reports:
 *   get:
 *     summary: Get all Reports
 *     tags: [Reports]
 *     responses:
 *       '200':
 *         description: List of reports
 *   post:
 *     summary: Create a new Report
 *     tags: [Reports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Report' }
 *     responses:
 *       '201': { description: Report created }
 *
 * /api/reports/search:
 *   get:
 *     summary: Search Reports
 *     tags: [Reports]
 *     parameters:
 *       - name: type
 *         in: query
 *         schema: { type: string }
 *     responses:
 *       '200': { description: Search results }
 *
 * /api/reports/{id}:
 *   get:
 *     summary: Get Report by ID
 *     tags: [Reports]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       '200': { description: Report found }
 *       '404': { $ref: '#/components/responses/NotFound' }
 *
 *   patch:
 *     summary: Update Report by ID
 *     tags: [Reports]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Report' }
 *     responses:
 *       '200': { description: Report updated }
 *
 *   delete:
 *     summary: Delete Report by ID
 *     tags: [Reports]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       '200': { description: Report deleted }
 */
