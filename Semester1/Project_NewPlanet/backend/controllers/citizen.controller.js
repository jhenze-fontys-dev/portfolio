// -----------------------------------------------------------------------------
// 👥 Citizen Controller
// Handles HTTP requests for citizen resources.
// Connects routes → citizenService methods through dataServiceFactory.
// -----------------------------------------------------------------------------

import { dataService } from '../data/dataServiceFactory.js'; // Uses env to select JSON or SQL
import { createError } from '../middleware/errorResponse.js';

/**
 * GET all citizens
 * Route: GET /api/citizens
 */
export const getAll = async (req, res, next) => {
  try {
    const items = await dataService.citizen.getAll();
    res.status(200).json(items);
  } catch (err) {
    next(createError('Failed to load citizens', 500));
  }
};

/**
 * GET single citizen by ID
 * Route: GET /api/citizens/:id
 */
export const getById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const item = await dataService.citizen.getById(id);

    if (!item) return next(createError(`Citizen with id ${id} not found`, 404));
    res.status(200).json(item);
  } catch (err) {
    next(createError('Failed to load citizen', 500));
  }
};

/**
 * CREATE a new citizen
 * Route: POST /api/citizens
 */
export const create = async (req, res, next) => {
  try {
    const payload = req.body;
    if (!payload || Object.keys(payload).length === 0)
      return next(createError('Request body cannot be empty', 400));

    const newCitizen = await dataService.citizen.create(payload);
    res.status(201).json(newCitizen);
  } catch (err) {
    next(createError('Failed to create citizen', 500));
  }
};

/**
 * UPDATE an existing citizen
 * Route: PATCH /api/citizens/:id
 */
export const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const payload = req.body;

    const updatedCitizen = await dataService.citizen.update(id, payload);
    if (!updatedCitizen)
      return next(createError(`Citizen with id ${id} not found`, 404));

    res.status(200).json(updatedCitizen);
  } catch (err) {
    next(createError('Failed to update citizen', 500));
  }
};

/**
 * DELETE a citizen
 * Route: DELETE /api/citizens/:id
 */
export const remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const result = await dataService.citizen.remove(id);

    if (!result)
      return next(createError(`Citizen with id ${id} not found`, 404));

    res.status(200).json(result);
  } catch (err) {
    next(createError('Failed to delete citizen', 500));
  }
};

/**
 * SEARCH citizens
 * Route: GET /api/citizens/search?field=value
 */
export const search = async (req, res, next) => {
  try {
    const filters = req.query;
    const results = await dataService.citizen.search(filters);
    res.status(200).json(results);
  } catch (err) {
    next(createError('Failed to search citizens', 500));
  }
};

/**
 * GET family tree for a specific citizen
 * Route: GET /api/family/tree?citizenId=me
 */
export const getFamilyTree = async (req, res, next) => {
  try {
    const citizenId = req.query.citizenId === 'me' ? req.user?.citizenId : parseInt(req.query.citizenId);
    if (!citizenId) return next(createError('Missing citizenId', 400));

    const tree = await dataService.citizen.getFamilyTree(citizenId);
    res.status(200).json(tree);
  } catch (err) {
    next(createError('Failed to load family tree', 500));
  }
};

/**
 * GET family tree data (nodes and edges for visualization)
 * Route: GET /api/family/tree/data
 */
export const getFamilyTreeData = async (req, res, next) => {
  try {
    const citizenId = req.query.citizenId === 'me' ? req.user?.citizenId : parseInt(req.query.citizenId);
    if (!citizenId) return next(createError('Missing citizenId', 400));

    const data = await dataService.citizen.getFamilyTreeData(citizenId);
    res.status(200).json(data);
  } catch (err) {
    next(createError('Failed to load family tree data', 500));
  }
};
