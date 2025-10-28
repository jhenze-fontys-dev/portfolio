// -----------------------------------------------------------------------------
// 👨‍👩‍👧‍👦 Relation Controller
// Handles HTTP requests for family and relationship data between citizens.
// Connects routes → relationService methods through dataServiceFactory.
// -----------------------------------------------------------------------------

import { dataService } from '../data/dataServiceFactory.js';
import { createError } from '../middleware/errorResponse.js';

/**
 * GET all relations
 * Route: GET /api/relations
 */
export const getAll = async (req, res, next) => {
  try {
    const includeRelations = req.query.include === 'true';
    const items = await dataService.relation.getAll(includeRelations);
    res.status(200).json(items);
  } catch (err) {
    next(createError('Failed to load relations', 500));
  }
};

/**
 * GET relation by ID
 * Route: GET /api/relations/:id
 */
export const getById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const includeRelations = req.query.include === 'true';
    const item = await dataService.relation.getById(id, includeRelations);

    if (!item) return next(createError(`Relation with id ${id} not found`, 404));
    res.status(200).json(item);
  } catch (err) {
    next(createError('Failed to load relation', 500));
  }
};

/**
 * CREATE new relation
 * Route: POST /api/relations
 */
export const create = async (req, res, next) => {
  try {
    const payload = req.body;
    if (!payload || Object.keys(payload).length === 0)
      return next(createError('Request body cannot be empty', 400));

    const newRelation = await dataService.relation.create(payload);
    res.status(201).json(newRelation);
  } catch (err) {
    next(createError('Failed to create relation', 500));
  }
};

/**
 * UPDATE relation
 * Route: PATCH /api/relations/:id
 */
export const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const payload = req.body;

    const updatedRelation = await dataService.relation.update(id, payload);
    if (!updatedRelation)
      return next(createError(`Relation with id ${id} not found`, 404));

    res.status(200).json(updatedRelation);
  } catch (err) {
    next(createError('Failed to update relation', 500));
  }
};

/**
 * DELETE relation
 * Route: DELETE /api/relations/:id
 */
export const remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const result = await dataService.relation.remove(id);
    if (!result)
      return next(createError(`Relation with id ${id} not found`, 404));

    res.status(200).json(result);
  } catch (err) {
    next(createError('Failed to delete relation', 500));
  }
};

/**
 * SEARCH relations
 * Route: GET /api/relations/search?field=value
 */
export const search = async (req, res, next) => {
  try {
    const filters = req.query;
    const includeRelations = filters.include === 'true';
    const results = await dataService.relation.search(filters, includeRelations);
    res.status(200).json(results);
  } catch (err) {
    next(createError('Failed to search relations', 500));
  }
};

/**
 * GET all relations for a specific citizen (bidirectional)
 * Route: GET /api/relations/citizen/:citizenId
 */
export const getRelationsForCitizen = async (req, res, next) => {
  try {
    const citizenId = parseInt(req.params.citizenId);
    if (isNaN(citizenId))
      return next(createError('Invalid citizen ID', 400));

    const relations = await dataService.relation.getRelationsForCitizen(citizenId);
    if (!relations || relations.length === 0)
      return next(createError(`No relations found for citizen id ${citizenId}`, 404));

    res.status(200).json(relations);
  } catch (err) {
    next(createError('Failed to load relations for citizen', 500));
  }
};

/**
 * GET relation tree for visualization (family tree)
 * Route: GET /api/relations/tree/:citizenId
 */
export const getRelationTree = async (req, res, next) => {
  try {
    const citizenId = parseInt(req.params.citizenId);
    const tree = await dataService.relation.getRelationTree?.(citizenId);

    if (!tree)
      return next(createError(`Relation tree for citizen ${citizenId} not found`, 404));

    res.status(200).json(tree);
  } catch (err) {
    next(createError('Failed to generate relation tree', 500));
  }
};
