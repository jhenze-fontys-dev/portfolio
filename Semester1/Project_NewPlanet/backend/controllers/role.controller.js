// -----------------------------------------------------------------------------
// 🧩 Role Controller
// Handles HTTP requests for user roles (citizen, civilServant, admin).
// Connects routes → roleService methods through dataServiceFactory.
// -----------------------------------------------------------------------------

import { dataService } from '../data/dataServiceFactory.js';
import { createError } from '../middleware/errorResponse.js';

/**
 * GET all roles
 * Route: GET /api/roles
 */
export const getAll = async (req, res, next) => {
  try {
    const includeUsers = req.query.include === 'true';
    const items = await dataService.role.getAll(includeUsers);
    res.status(200).json(items);
  } catch (err) {
    next(createError('Failed to load roles', 500));
  }
};

/**
 * GET role by ID
 * Route: GET /api/roles/:id
 */
export const getById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const includeUsers = req.query.include === 'true';
    const item = await dataService.role.getById(id, includeUsers);

    if (!item)
      return next(createError(`Role with id ${id} not found`, 404));
    res.status(200).json(item);
  } catch (err) {
    next(createError('Failed to load role', 500));
  }
};

/**
 * CREATE a new role
 * Route: POST /api/roles
 */
export const create = async (req, res, next) => {
  try {
    const payload = req.body;
    if (!payload || Object.keys(payload).length === 0)
      return next(createError('Request body cannot be empty', 400));

    const newRole = await dataService.role.create(payload);
    res.status(201).json(newRole);
  } catch (err) {
    next(createError('Failed to create role', 500));
  }
};

/**
 * UPDATE existing role
 * Route: PATCH /api/roles/:id
 */
export const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const payload = req.body;

    const updatedRole = await dataService.role.update(id, payload);
    if (!updatedRole)
      return next(createError(`Role with id ${id} not found`, 404));

    res.status(200).json(updatedRole);
  } catch (err) {
    next(createError('Failed to update role', 500));
  }
};

/**
 * DELETE role
 * Route: DELETE /api/roles/:id
 */
export const remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const result = await dataService.role.remove(id);
    if (!result)
      return next(createError(`Role with id ${id} not found`, 404));

    res.status(200).json(result);
  } catch (err) {
    next(createError('Failed to delete role', 500));
  }
};

/**
 * SEARCH roles
 * Route: GET /api/roles/search?field=value
 */
export const search = async (req, res, next) => {
  try {
    const filters = req.query;
    const includeUsers = filters.include === 'true';
    const results = await dataService.role.search(filters, includeUsers);
    res.status(200).json(results);
  } catch (err) {
    next(createError('Failed to search roles', 500));
  }
};

/**
 * GET all users assigned to a specific role
 * Route: GET /api/roles/:id/users
 */
export const getUsersByRoleId = async (req, res, next) => {
  try {
    const roleId = parseInt(req.params.id);
    const users = await dataService.role.getUsersByRoleId(roleId);

    if (!users || users.length === 0)
      return next(createError(`No users found for role id ${roleId}`, 404));

    res.status(200).json(users);
  } catch (err) {
    next(createError('Failed to load users by role', 500));
  }
};

/**
 * GET role by name
 * Route: GET /api/roles/name/:name
 */
export const getByName = async (req, res, next) => {
  try {
    const name = req.params.name;
    const role = await dataService.role.getByName(name);

    if (!role)
      return next(createError(`Role "${name}" not found`, 404));

    res.status(200).json(role);
  } catch (err) {
    next(createError('Failed to load role by name', 500));
  }
};
