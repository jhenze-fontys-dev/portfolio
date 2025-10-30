/**
 * -----------------------------------------------------------------------------
 * 🧾 Role OpenAPI Documentation
 * Path base: /api/roles
 * Schema: #/components/schemas/Role
 * -----------------------------------------------------------------------------
 */

/**
 * @openapi
 * /api/roles:
 *   get:
 *     summary: Get all Roles
 *     tags: [Roles]
 *     responses:
 *       '200':
 *         description: List of roles
 *   post:
 *     summary: Create a new Role
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Role' }
 *     responses:
 *       '201':
 *         description: Role created
 *
 * /api/roles/search:
 *   get:
 *     summary: Search Roles
 *     tags: [Roles]
 *     parameters:
 *       - name: name
 *         in: query
 *         schema: { type: string, enum: [citizen, civilServant, admin] }
 *     responses:
 *       '200':
 *         description: Search results
 *
 * /api/roles/{id}:
 *   get:
 *     summary: Get Role by ID
 *     tags: [Roles]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       '200': { description: Role found }
 *       '404': { $ref: '#/components/responses/NotFound' }
 *
 *   patch:
 *     summary: Update Role by ID
 *     tags: [Roles]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Role' }
 *     responses:
 *       '200': { description: Role updated }
 *
 *   delete:
 *     summary: Delete Role by ID
 *     tags: [Roles]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       '200': { description: Role deleted }
 */
