// -----------------------------------------------------------------------------
// 🧬 GeneticResult Controller
// Handles HTTP requests for genetic analysis results between citizens.
// Connects routes → geneticResultService methods through dataServiceFactory.
// -----------------------------------------------------------------------------

import { dataService } from '../data/dataServiceFactory.js';
import { createError } from '../middleware/errorResponse.js';

/**
 * GET all genetic results
 * Route: GET /api/genetics
 */
export const getAll = async (req, res, next) => {
  try {
    const includeRelations = req.query.include === 'true';
    const items = await dataService.geneticResult.getAll(includeRelations);
    res.status(200).json(items);
  } catch (err) {
    next(createError('Failed to load genetic results', 500));
  }
};

/**
 * GET single genetic result by ID
 * Route: GET /api/genetics/:id
 */
export const getById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const includeRelations = req.query.include === 'true';
    const item = await dataService.geneticResult.getById(id, includeRelations);

    if (!item)
      return next(createError(`Genetic result with id ${id} not found`, 404));
    res.status(200).json(item);
  } catch (err) {
    next(createError('Failed to load genetic result', 500));
  }
};

/**
 * CREATE a new genetic result
 * Route: POST /api/genetics
 */
export const create = async (req, res, next) => {
  try {
    const payload = req.body;
    if (!payload || Object.keys(payload).length === 0)
      return next(createError('Request body cannot be empty', 400));

    const newResult = await dataService.geneticResult.create(payload);
    res.status(201).json(newResult);
  } catch (err) {
    next(createError('Failed to create genetic result', 500));
  }
};

/**
 * CALCULATE genetic similarity / inbreeding coefficient
 * Route: POST /api/genetics/calculate
 * Example body: { "citizen_a_id": 1, "citizen_b_id": 2 }
 */
export const calculate = async (req, res, next) => {
  try {
    const { citizen_a_id, citizen_b_id } = req.body;

    if (!citizen_a_id || !citizen_b_id)
      return next(createError('citizen_a_id and citizen_b_id are required', 400));

    // Call the service layer
    const result = await dataService.geneticResult.calculate?.(citizen_a_id, citizen_b_id);

    if (!result)
      return next(createError('Failed to calculate genetic similarity', 500));

    res.status(201).json(result);
  } catch (err) {
    next(createError('Failed to calculate genetic result', 500));
  }
};

/**
 * UPDATE an existing genetic result
 * Route: PATCH /api/genetics/:id
 */
export const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const payload = req.body;

    const updatedResult = await dataService.geneticResult.update(id, payload);
    if (!updatedResult)
      return next(createError(`Genetic result with id ${id} not found`, 404));

    res.status(200).json(updatedResult);
  } catch (err) {
    next(createError('Failed to update genetic result', 500));
  }
};

/**
 * DELETE a genetic result
 * Route: DELETE /api/genetics/:id
 */
export const remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const result = await dataService.geneticResult.remove(id);
    if (!result)
      return next(createError(`Genetic result with id ${id} not found`, 404));

    res.status(200).json(result);
  } catch (err) {
    next(createError('Failed to delete genetic result', 500));
  }
};

/**
 * SEARCH genetic results
 * Route: GET /api/genetics/search?field=value
 */
export const search = async (req, res, next) => {
  try {
    const filters = req.query;
    const includeRelations = filters.include === 'true';
    const results = await dataService.geneticResult.search(filters, includeRelations);
    res.status(200).json(results);
  } catch (err) {
    next(createError('Failed to search genetic results', 500));
  }
};
