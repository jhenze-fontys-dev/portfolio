// -----------------------------------------------------------------------------
// 🔐 User Controller
// Handles HTTP requests for user management and authentication.
// Connects routes → userService methods through dataServiceFactory.
// -----------------------------------------------------------------------------

import { dataService } from '../data/dataServiceFactory.js';
import { createError } from '../middleware/errorResponse.js';

/**
 * USER LOGIN
 * Route: POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return next(createError('Email and password are required', 400));

    const user = await dataService.user.login(email, password);
    if (!user) return next(createError('Invalid email or password', 401));

    res.status(200).json({
      message: 'Login successful',
      user,
    });
  } catch (err) {
    next(createError('Failed to login', 500));
  }
};

/**
 * GET all users
 * Route: GET /api/users
 */
export const getAll = async (req, res, next) => {
  try {
    const includeRelations = req.query.include === 'true';
    const users = await dataService.user.getAll(includeRelations);
    res.status(200).json(users);
  } catch (err) {
    next(createError('Failed to load users', 500));
  }
};

/**
 * GET user by ID
 * Route: GET /api/users/:id
 */
export const getById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const includeRelations = req.query.include === 'true';
    const user = await dataService.user.getById(id, includeRelations);

    if (!user) return next(createError(`User with id ${id} not found`, 404));
    res.status(200).json(user);
  } catch (err) {
    next(createError('Failed to load user', 500));
  }
};

/**
 * GET current logged-in user (profile)
 * Route: GET /api/users/me
 */
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id; // set by authentication middleware
    if (!userId) return next(createError('Unauthorized', 401));

    const profile = await dataService.user.getById(userId, true);
    if (!profile) return next(createError('User not found', 404));

    res.status(200).json(profile);
  } catch (err) {
    next(createError('Failed to load profile', 500));
  }
};

/**
 * CREATE new user
 * Route: POST /api/users
 */
export const create = async (req, res, next) => {
  try {
    const payload = req.body;
    if (!payload || Object.keys(payload).length === 0)
      return next(createError('Request body cannot be empty', 400));

    const newUser = await dataService.user.create(payload);
    res.status(201).json(newUser);
  } catch (err) {
    next(createError('Failed to create user', 500));
  }
};

/**
 * UPDATE existing user
 * Route: PATCH /api/users/:id
 */
export const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const payload = req.body;

    const updatedUser = await dataService.user.update(id, payload);
    if (!updatedUser) return next(createError(`User with id ${id} not found`, 404));

    res.status(200).json(updatedUser);
  } catch (err) {
    next(createError('Failed to update user', 500));
  }
};

/**
 * DELETE user
 * Route: DELETE /api/users/:id
 */
export const remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const result = await dataService.user.remove(id);
    if (!result) return next(createError(`User with id ${id} not found`, 404));

    res.status(200).json(result);
  } catch (err) {
    next(createError('Failed to delete user', 500));
  }
};

/**
 * SEARCH users
 * Route: GET /api/users/search?field=value
 */
export const search = async (req, res, next) => {
  try {
    const filters = req.query;
    const includeRelations = filters.include === 'true';
    const results = await dataService.user.search(filters, includeRelations);
    res.status(200).json(results);
  } catch (err) {
    next(createError('Failed to search users', 500));
  }
};

/**
 * ASSIGN ROLE to user
 * Route: PATCH /api/users/:id/role
 */
export const assignRole = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { roleId } = req.body;

    if (!roleId) return next(createError('Role ID is required', 400));

    const updatedUser = await dataService.user.assignRole(id, roleId);
    if (!updatedUser)
      return next(createError(`User with id ${id} not found`, 404));

    res.status(200).json({
      message: 'Role assigned successfully',
      user: updatedUser,
    });
  } catch (err) {
    next(createError('Failed to assign role', 500));
  }
};
