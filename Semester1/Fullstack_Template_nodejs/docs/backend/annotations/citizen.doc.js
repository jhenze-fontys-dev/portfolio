/**
 * -----------------------------------------------------------------------------
 * 👥 Citizen OpenAPI Documentation
 * Path base: /api/citizens
 * Schema: #/components/schemas/Citizen
 * -----------------------------------------------------------------------------
 */

/**
 * @openapi
 * /api/citizens:
 *   get:
 *     summary: Get all Citizens
 *     description: Retrieve a list of all citizens.
 *     tags: [Citizens]
 *     responses:
 *       '200':
 *         description: List of citizens
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Citizen'
 *       '500':
 *         $ref: '#/components/responses/ServerError'
 *
 *   post:
 *     summary: Create a new Citizen
 *     description: Add a new citizen record to the database.
 *     tags: [Citizens]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Citizen'
 *     responses:
 *       '201':
 *         description: Citizen created successfully
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '500':
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/citizens/search:
 *   get:
 *     summary: Search Citizens
 *     description: Perform filtered search among citizens.
 *     tags: [Citizens]
 *     parameters:
 *       - name: first_name
 *         in: query
 *         schema: { type: string }
 *       - name: last_name
 *         in: query
 *         schema: { type: string }
 *       - name: status
 *         in: query
 *         schema: { type: string, enum: [alive, deceased] }
 *     responses:
 *       '200':
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Citizen'
 *       '500':
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/citizens/{id}:
 *   get:
 *     summary: Get Citizen by ID
 *     tags: [Citizens]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       '200':
 *         description: Citizen found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Citizen'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update Citizen by ID
 *     tags: [Citizens]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Citizen'
 *     responses:
 *       '200':
 *         description: Citizen updated
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete Citizen by ID
 *     tags: [Citizens]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       '200':
 *         description: Citizen deleted
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *
 * /api/citizens/family/tree:
 *   get:
 *     summary: Get family tree (hierarchical)
 *     description: Returns hierarchical family structure for the current or specified citizen.
 *     tags: [Citizens]
 *     parameters:
 *       - name: citizenId
 *         in: query
 *         required: false
 *         description: Citizen ID or 'me'
 *         schema: { type: string }
 *     responses:
 *       '200':
 *         description: Family tree structure
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *
 * /api/citizens/family/tree/data:
 *   get:
 *     summary: Get family tree graph data
 *     description: Returns nodes and edges for visualization libraries.
 *     tags: [Citizens]
 *     parameters:
 *       - name: citizenId
 *         in: query
 *         required: false
 *         description: Citizen ID or 'me'
 *         schema: { type: string }
 *     responses:
 *       '200':
 *         description: Graph data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nodes: { type: array, items: { type: object } }
 *                 edges: { type: array, items: { type: object } }
 */
