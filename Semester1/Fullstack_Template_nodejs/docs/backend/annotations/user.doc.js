/**
 * -----------------------------------------------------------------------------
 * 👤 User OpenAPI Documentation
 * Path base: /api/users
 * Schema: #/components/schemas/User
 * -----------------------------------------------------------------------------
 */

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Get all Users
 *     tags: [Users]
 *     responses:
 *       '200':
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *
 *   post:
 *     summary: Create a new User
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       '201':
 *         description: User created
 *
 * /api/users/search:
 *   get:
 *     summary: Search Users
 *     tags: [Users]
 *     parameters:
 *       - name: email
 *         in: query
 *         schema: { type: string, format: email }
 *       - name: role_id
 *         in: query
 *         schema: { type: integer }
 *     responses:
 *       '200':
 *         description: Search results
 *
 * /api/users/{id}:
 *   get:
 *     summary: Get User by ID
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       '200':
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update User by ID
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       '200':
 *         description: User updated
 *
 *   delete:
 *     summary: Delete User by ID
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       '200':
 *         description: User deleted
 *
 * /api/users/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       '200':
 *         description: Login successful
 *
 * /api/users/{id}/role:
 *   patch:
 *     summary: Assign or update a user's role
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role_id]
 *             properties:
 *               role_id: { type: integer }
 *     responses:
 *       '200':
 *         description: Role updated
 */
