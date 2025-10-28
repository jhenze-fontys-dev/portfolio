/**
 * -----------------------------------------------------------------------------
 * 🗓️ Event OpenAPI Documentation
 * Path base: /api/events
 * Schema: #/components/schemas/Event
 * -----------------------------------------------------------------------------
 */

/**
 * @openapi
 * /api/events:
 *   get:
 *     summary: Get all Events
 *     tags: [Events]
 *     responses:
 *       '200':
 *         description: List of events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Event' }
 *   post:
 *     summary: Create a generic Event
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Event' }
 *     responses:
 *       '201':
 *         description: Event created
 *
 * /api/events/search:
 *   get:
 *     summary: Search Events
 *     tags: [Events]
 *     parameters:
 *       - name: type
 *         in: query
 *         schema: { type: string, enum: [birth, marriage, death] }
 *       - name: citizen_id
 *         in: query
 *         schema: { type: integer }
 *     responses:
 *       '200': { description: Search results }
 *
 * /api/events/{id}:
 *   get:
 *     summary: Get Event by ID
 *     tags: [Events]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       '200':
 *         description: Event found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Event' }
 *       '404': { $ref: '#/components/responses/NotFound' }
 *
 *   patch:
 *     summary: Update Event by ID
 *     tags: [Events]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Event' }
 *     responses:
 *       '200': { description: Event updated }
 *
 *   delete:
 *     summary: Delete Event by ID
 *     tags: [Events]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       '200': { description: Event deleted }
 *
 * /api/events/birth:
 *   post:
 *     summary: Register a Birth event
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Event' }
 *     responses:
 *       '201': { description: Birth recorded }
 *
 * /api/events/marriage:
 *   post:
 *     summary: Register a Marriage event
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Event' }
 *     responses:
 *       '201': { description: Marriage recorded }
 *
 * /api/events/death:
 *   post:
 *     summary: Register a Death event
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Event' }
 *     responses:
 *       '201': { description: Death recorded }
 */
