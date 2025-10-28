/**
 * -----------------------------------------------------------------------------
 * 🧬 GeneticResult OpenAPI Documentation
 * Path base: /api/genetics
 * Schema: #/components/schemas/GeneticResult
 * -----------------------------------------------------------------------------
 */

/**
 * @openapi
 * /api/genetics:
 *   get:
 *     summary: Get all Genetic Results
 *     tags: [Genetics]
 *     responses:
 *       '200':
 *         description: List of genetic results
 *   post:
 *     summary: Create a Genetic Result record
 *     tags: [Genetics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/GeneticResult' }
 *     responses:
 *       '201': { description: Result created }
 *
 * /api/genetics/search:
 *   get:
 *     summary: Search Genetic Results
 *     tags: [Genetics]
 *     parameters:
 *       - name: citizen_a_id
 *         in: query
 *         schema: { type: integer }
 *       - name: citizen_b_id
 *         in: query
 *         schema: { type: integer }
 *     responses:
 *       '200': { description: Search results }
 *
 * /api/genetics/{id}:
 *   get:
 *     summary: Get Genetic Result by ID
 *     tags: [Genetics]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       '200': { description: Result found }
 *       '404': { $ref: '#/components/responses/NotFound' }
 *
 *   patch:
 *     summary: Update Genetic Result by ID
 *     tags: [Genetics]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/GeneticResult' }
 *     responses:
 *       '200': { description: Result updated }
 *
 *   delete:
 *     summary: Delete Genetic Result by ID
 *     tags: [Genetics]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       '200': { description: Result deleted }
 *
 * /api/genetics/calculate:
 *   post:
 *     summary: Calculate inbreeding coefficient for a pair
 *     tags: [Genetics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [citizen_a_id, citizen_b_id]
 *             properties:
 *               citizen_a_id: { type: integer }
 *               citizen_b_id: { type: integer }
 *     responses:
 *       '200': { description: Calculation complete }
 *
 * /api/genetics/check:
 *   get:
 *     summary: Check pairing coefficient against threshold
 *     tags: [Genetics]
 *     parameters:
 *       - name: partnerId
 *         in: query
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '200': { description: Pairing check result }
 */
