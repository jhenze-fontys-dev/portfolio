/**
 * -----------------------------------------------------------------------------
 * 🧩 TEMPLATE OPENAPI DOCUMENTATION
 * Copy this file when creating a new annotated API documentation.
 * Example: rename to `user.doc.js`, `product.doc.js`, etc.
 * -----------------------------------------------------------------------------
 * Replace placeholders:
 *   {entity}      → lowercase plural route (e.g. users, products)
 *   {Entity}      → singular PascalCase model name (e.g. User, Product)
 *   {EntityTag}   → tag name shown in Swagger UI (e.g. Users, Products)
 * -----------------------------------------------------------------------------
 */

/**
 * @openapi
 * /api/{entity}:
 *   get:
 *     summary: Get all {EntityTag}
 *     description: Retrieve a list of all {EntityTag}.
 *     tags: [{EntityTag}]
 *     parameters:
 *       - $ref: '#/components/parameters/PageQuery'
 *       - $ref: '#/components/parameters/LimitQuery'
 *       - $ref: '#/components/parameters/SortByQuery'
 *       - $ref: '#/components/parameters/OrderQuery'
 *     responses:
 *       '200':
 *         description: List of {EntityTag}
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/{Entity}'
 *       '500':
 *         $ref: '#/components/responses/ServerError'
 *
 *   post:
 *     summary: Create a new {Entity}
 *     description: Add a new {Entity} record to the database.
 *     tags: [{EntityTag}]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/{EntityCreate}'
 *     responses:
 *       '201':
 *         description: {Entity} created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/{Entity}'
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '500':
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/{entity}/search:
 *   get:
 *     summary: Search {EntityTag}
 *     description: Perform a filtered search among {EntityTag}.
 *     tags: [{EntityTag}]
 *     parameters:
 *       - name: query
 *         in: query
 *         required: false
 *         description: Search query string
 *         schema:
 *           type: string
 *       - $ref: '#/components/parameters/PageQuery'
 *       - $ref: '#/components/parameters/LimitQuery'
 *     responses:
 *       '200':
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/{Entity}'
 *       '500':
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/{entity}/{id}:
 *   get:
 *     summary: Get {Entity} by ID
 *     tags: [{EntityTag}]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       '200':
 *         description: {Entity} found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/{Entity}'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *       '500':
 *         $ref: '#/components/responses/ServerError'
 *
 *   put:
 *     summary: Update {Entity} by ID
 *     tags: [{EntityTag}]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/{EntityCreate}'
 *     responses:
 *       '200':
 *         description: {Entity} updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/{Entity}'
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *       '500':
 *         $ref: '#/components/responses/ServerError'
 *
 *   delete:
 *     summary: Delete {Entity} by ID
 *     tags: [{EntityTag}]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       '200':
 *         description: {Entity} deleted
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *       '500':
 *         $ref: '#/components/responses/ServerError'
 */
