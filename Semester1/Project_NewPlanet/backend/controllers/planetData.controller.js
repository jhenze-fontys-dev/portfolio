// -----------------------------------------------------------------------------
// 🌍 PlanetData Controller
// Handles HTTP requests for planetary data (capacity, population, sustainability, etc.).
// Connects routes → planetDataService methods through dataServiceFactory.
// -----------------------------------------------------------------------------

import { dataService } from '../data/dataServiceFactory.js';
import { createError } from '../middleware/errorResponse.js';

/**
 * GET all planet data records
 * Route: GET /api/planet
 */
export const getAll = async (req, res, next) => {
  try {
    const items = await dataService.planetData.getAll();
    res.status(200).json(items);
  } catch (err) {
    next(createError('Failed to load planet data', 500));
  }
};

/**
 * GET single planet data record by ID
 * Route: GET /api/planet/:id
 */
export const getById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const item = await dataService.planetData.getById(id);

    if (!item)
      return next(createError(`Planet data record with id ${id} not found`, 404));
    res.status(200).json(item);
  } catch (err) {
    next(createError('Failed to load planet data record', 500));
  }
};

/**
 * CREATE a new planet data record
 * Route: POST /api/planet
 */
export const create = async (req, res, next) => {
  try {
    const payload = req.body;
    if (!payload || Object.keys(payload).length === 0)
      return next(createError('Request body cannot be empty', 400));

    const newPlanetData = await dataService.planetData.create(payload);
    res.status(201).json(newPlanetData);
  } catch (err) {
    next(createError('Failed to create planet data record', 500));
  }
};

/**
 * UPDATE an existing planet data record
 * Route: PATCH /api/planet/:id
 */
export const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const payload = req.body;

    const updatedPlanetData = await dataService.planetData.update(id, payload);
    if (!updatedPlanetData)
      return next(createError(`Planet data record with id ${id} not found`, 404));

    res.status(200).json(updatedPlanetData);
  } catch (err) {
    next(createError('Failed to update planet data record', 500));
  }
};

/**
 * DELETE a planet data record
 * Route: DELETE /api/planet/:id
 */
export const remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const result = await dataService.planetData.remove(id);

    if (!result)
      return next(createError(`Planet data record with id ${id} not found`, 404));

    res.status(200).json(result);
  } catch (err) {
    next(createError('Failed to delete planet data record', 500));
  }
};

/**
 * SEARCH planet data
 * Route: GET /api/planet/search?field=value
 */
export const search = async (req, res, next) => {
  try {
    const filters = req.query;
    const results = await dataService.planetData.search(filters);
    res.status(200).json(results);
  } catch (err) {
    next(createError('Failed to search planet data', 500));
  }
};

/**
 * GET carrying capacity and sustainability overview
 * Route: GET /api/planet/capacity
 */
export const getCapacity = async (req, res, next) => {
  try {
    const result = await dataService.planetData.calculateCarryingCapacity?.();

    if (!result)
      return next(createError('Failed to retrieve carrying capacity data', 500));

    res.status(200).json(result);
  } catch (err) {
    next(createError('Error retrieving carrying capacity data', 500));
  }
};
