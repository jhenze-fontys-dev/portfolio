// -----------------------------------------------------------------------------
// 📊 Report Controller
// Handles HTTP requests for system reports (population, genetics, capacity, etc.).
// Connects routes → reportService methods through dataServiceFactory.
// -----------------------------------------------------------------------------

import { dataService } from '../data/dataServiceFactory.js';
import { createError } from '../middleware/errorResponse.js';

/**
 * GET all reports
 * Route: GET /api/reports
 */
export const getAll = async (req, res, next) => {
  try {
    const items = await dataService.report.getAll();
    res.status(200).json(items);
  } catch (err) {
    next(createError('Failed to load reports', 500));
  }
};

/**
 * GET report by ID
 * Route: GET /api/reports/:id
 */
export const getById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const item = await dataService.report.getById(id);

    if (!item)
      return next(createError(`Report with id ${id} not found`, 404));
    res.status(200).json(item);
  } catch (err) {
    next(createError('Failed to load report', 500));
  }
};

/**
 * CREATE a new report
 * Route: POST /api/reports
 */
export const create = async (req, res, next) => {
  try {
    const payload = req.body;
    if (!payload || Object.keys(payload).length === 0)
      return next(createError('Request body cannot be empty', 400));

    const newReport = await dataService.report.create(payload);
    res.status(201).json(newReport);
  } catch (err) {
    next(createError('Failed to create report', 500));
  }
};

/**
 * UPDATE report
 * Route: PATCH /api/reports/:id
 */
export const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const payload = req.body;

    const updatedReport = await dataService.report.update(id, payload);
    if (!updatedReport)
      return next(createError(`Report with id ${id} not found`, 404));

    res.status(200).json(updatedReport);
  } catch (err) {
    next(createError('Failed to update report', 500));
  }
};

/**
 * DELETE report
 * Route: DELETE /api/reports/:id
 */
export const remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const result = await dataService.report.remove(id);

    if (!result)
      return next(createError(`Report with id ${id} not found`, 404));

    res.status(200).json(result);
  } catch (err) {
    next(createError('Failed to delete report', 500));
  }
};

/**
 * SEARCH reports
 * Route: GET /api/reports/search?field=value
 */
export const search = async (req, res, next) => {
  try {
    const filters = req.query;
    const results = await dataService.report.search(filters);
    res.status(200).json(results);
  } catch (err) {
    next(createError('Failed to search reports', 500));
  }
};

/**
 * GET the latest report (by created_at)
 * Route: GET /api/reports/latest
 */
export const getLatest = async (req, res, next) => {
  try {
    const latest = await dataService.report.getLatest();
    if (!latest) return next(createError('No reports found', 404));
    res.status(200).json(latest);
  } catch (err) {
    next(createError('Failed to load latest report', 500));
  }
};

/**
 * GET all reports by type (e.g., population, genetics, capacity)
 * Route: GET /api/reports/type/:type
 */
export const getByType = async (req, res, next) => {
  try {
    const type = req.params.type;
    const reports = await dataService.report.getByType(type);

    if (!reports || reports.length === 0)
      return next(createError(`No reports found for type "${type}"`, 404));

    res.status(200).json(reports);
  } catch (err) {
    next(createError('Failed to load reports by type', 500));
  }
};
