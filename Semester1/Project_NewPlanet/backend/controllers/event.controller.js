// -----------------------------------------------------------------------------
// 🗓️ Event Controller
// Handles HTTP requests for citizen events (birth, marriage, death, etc.).
// Connects routes → eventService methods through dataServiceFactory.
// -----------------------------------------------------------------------------

import { dataService } from '../data/dataServiceFactory.js';
import { createError } from '../middleware/errorResponse.js';

/**
 * GET all events
 * Route: GET /api/events
 */
export const getAll = async (req, res, next) => {
  try {
    const includeRelations = req.query.include === 'true';
    const items = await dataService.event.getAll(includeRelations);
    res.status(200).json(items);
  } catch (err) {
    next(createError('Failed to load events', 500));
  }
};

/**
 * GET single event by ID
 * Route: GET /api/events/:id
 */
export const getById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const includeRelations = req.query.include === 'true';
    const item = await dataService.event.getById(id, includeRelations);

    if (!item) return next(createError(`Event with id ${id} not found`, 404));
    res.status(200).json(item);
  } catch (err) {
    next(createError('Failed to load event', 500));
  }
};

/**
 * CREATE a new event
 * Route: POST /api/events
 */
export const create = async (req, res, next) => {
  try {
    const payload = req.body;
    if (!payload || Object.keys(payload).length === 0)
      return next(createError('Request body cannot be empty', 400));

    const newEvent = await dataService.event.create(payload);
    res.status(201).json(newEvent);
  } catch (err) {
    next(createError('Failed to create event', 500));
  }
};

/**
 * UPDATE an existing event
 * Route: PATCH /api/events/:id
 */
export const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const payload = req.body;

    const updatedEvent = await dataService.event.update(id, payload);
    if (!updatedEvent)
      return next(createError(`Event with id ${id} not found`, 404));

    res.status(200).json(updatedEvent);
  } catch (err) {
    next(createError('Failed to update event', 500));
  }
};

/**
 * DELETE an event
 * Route: DELETE /api/events/:id
 */
export const remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const result = await dataService.event.remove(id);
    if (!result) return next(createError(`Event with id ${id} not found`, 404));

    res.status(200).json(result);
  } catch (err) {
    next(createError('Failed to delete event', 500));
  }
};

/**
 * SEARCH events
 * Route: GET /api/events/search?field=value
 */
export const search = async (req, res, next) => {
  try {
    const filters = req.query;
    const includeRelations = filters.include === 'true';
    const results = await dataService.event.search(filters, includeRelations);
    res.status(200).json(results);
  } catch (err) {
    next(createError('Failed to search events', 500));
  }
};
