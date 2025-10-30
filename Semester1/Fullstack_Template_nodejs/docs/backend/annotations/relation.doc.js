/**
 * -----------------------------------------------------------------------------
 * 🔗 Relation OpenAPI Documentation
 * Path base: /api/relations
 * Schema: #/components/schemas/Relation
 * -----------------------------------------------------------------------------
 */

/**
 * @openapi
 * /api/relations:
 *   get:
 *     summary: Get all Relations
 *     tags: [Relations]
 *     responses:
 *       '200':
 *         description: List of relations
 *   post:
 *     summary: Create a new Relation
 *     tags: [Relations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Relation' }
 *     responses:
 *       '201': { description: Relation created }
 *
 * /api/relations/search:
 *   get:
 *     summary: Search Relations
 *     tags: [Relations]
 *     parameters:
 *       - name: type
 *         in: query
 *         schema: { type: string, enum: [parent, child, spouse] }
 *       - name: citizen_id
 *         in: query
 *         schema: { type: integer }
 *     responses:
 *       '200': { description: Search results }
 *
 * /api/relations/{id}:
 *   get:
 *     summary: Get Relation by ID
 *     tags: [Relations]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       '200': { description: Relation found }
 *       '404': { $ref: '#/components/responses/NotFound' }
 *
 *   patch:
 *     summary: Update Relation by ID
 *     tags: [Relations]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Relation' }
 *     responses:
 *       '200': { description: Relation updated }
 *
 *   delete:
 *     summary: Delete Relation by ID
 *     tags: [Relations]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       '200': { description: Relation deleted }
 *
 * /api/relations/citizen/{citizenId}:
 *   get:
 *     summary: Get Relations for a Citizen
 *     tags: [Relations]
 *     parameters:
 *       - name: citizenId
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '200': { description: Citizen relations returned }
 */
