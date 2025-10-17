/**
 * @openapi
 * tags:
 *   name: CRUD
 *   description: CRUD operations for data items
 */

/**
 * @openapi
 * /api/crud:
 *   get:
 *     summary: Retrieve all CRUD items
 *     tags: [CRUD]
 *     responses:
 *       '200':
 *         description: List of all items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '../schemas/crud/item.yaml'
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '../schemas/shared/errorResponse.yaml'
 */

/**
 * @openapi
 * /api/crud/{id}:
 *   get:
 *     summary: Retrieve a single CRUD item by ID
 *     tags: [CRUD]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       '200':
 *         description: Successful response — returns the item
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '../schemas/crud/item.yaml'
 *       '404':
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '../schemas/shared/errorResponse.yaml'
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '../schemas/shared/errorResponse.yaml'
 */

/**
 * @openapi
 * /api/crud:
 *   post:
 *     summary: Create a new CRUD item
 *     tags: [CRUD]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '../schemas/crud/item.yaml'
 *           examples:
 *             NewItem:
 *               summary: Example of a new item
 *               value:
 *                 title: "New Item Title"
 *     responses:
 *       '201':
 *         description: Item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '../schemas/crud/item.yaml'
 *       '400':
 *         description: Missing or invalid title
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '../schemas/shared/errorResponse.yaml'
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '../schemas/shared/errorResponse.yaml'
 */

/**
 * @openapi
 * /api/crud/{id}:
 *   put:
 *     summary: Update an existing CRUD item by ID
 *     tags: [CRUD]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '../schemas/crud/item.yaml'
 *           examples:
 *             UpdateItem:
 *               summary: Example of updating an item
 *               value:
 *                 title: "Updated Title"
 *     responses:
 *       '200':
 *         description: Item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '../schemas/crud/item.yaml'
 *       '400':
 *         description: Missing or invalid title
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '../schemas/shared/errorResponse.yaml'
 *       '404':
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '../schemas/shared/errorResponse.yaml'
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '../schemas/shared/errorResponse.yaml'
 */

/**
 * @openapi
 * /api/crud/{id}:
 *   delete:
 *     summary: Delete a CRUD item by ID
 *     tags: [CRUD]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       '200':
 *         description: Item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Item deleted"
 *                 id:
 *                   type: integer
 *                   example: 1
 *       '404':
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '../schemas/shared/errorResponse.yaml'
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '../schemas/shared/errorResponse.yaml'
 */
