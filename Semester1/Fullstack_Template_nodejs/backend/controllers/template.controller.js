// backend/controllers/template.controller.js
// -----------------------------------------------------------------------------
// 🧩 TEMPLATE CONTROLLER
// Use this as a base for new controllers (e.g., user.controller.js, post.controller.js).
// Each controller maps HTTP routes to service functions in a consistent way.
// -----------------------------------------------------------------------------

import { dataService } from '../data/dataServiceFactory.js'; // Uses .env to pick JSON or SQL
import { createError } from '../middleware/errorResponse.js';

/**
 * GET all records
 * Route: GET /api/[entity]
 */
export const getAll = async (req, res, next) => {
  try {
    const items = await dataService.getAll();
    res.status(200).json(items);
  } catch (err) {
    next(createError('Failed to load data', 500));
  }
};

/**
 * GET single record by ID
 * Route: GET /api/[entity]/:id
 */
export const getById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const item = await dataService.getById(id);

    if (!item) return next(createError(`Record with id ${id} not found`, 404));
    res.status(200).json(item);
  } catch (err) {
    next(createError('Failed to load record', 500));
  }
};

/**
 * CREATE new record
 * Route: POST /api/[entity]
 */
export const create = async (req, res, next) => {
  try {
    const payload = req.body;
    if (!payload || Object.keys(payload).length === 0)
      return next(createError('Request body cannot be empty', 400));

    const newRecord = await dataService.create(payload);
    res.status(201).json(newRecord);
  } catch (err) {
    next(createError('Failed to create record', 500));
  }
};

/**
 * UPDATE existing record
 * Route: PUT /api/[entity]/:id
 */
export const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const payload = req.body;

    const updatedRecord = await dataService.update(id, payload);
    if (!updatedRecord) return next(createError(`Record with id ${id} not found`, 404));

    res.status(200).json(updatedRecord);
  } catch (err) {
    next(createError('Failed to update record', 500));
  }
};

/**
 * DELETE record
 * Route: DELETE /api/[entity]/:id
 */
export const remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const result = await dataService.remove(id);
    if (!result) return next(createError(`Record with id ${id} not found`, 404));

    res.status(200).json(result);
  } catch (err) {
    next(createError('Failed to delete record', 500));
  }
};

/**
 * SEARCH records
 * Route: GET /api/[entity]/search?field=value
 */
export const search = async (req, res, next) => {
  try {
    const filters = req.query;
    const results = await dataService.search(filters);
    res.status(200).json(results);
  } catch (err) {
    next(createError('Failed to search records', 500));
  }
};
