// backend/routes/user.routes.js
// -----------------------------------------------------------------------------
// 👤 User Router
// Defines routes for user authentication and account management.
// -----------------------------------------------------------------------------
//
// Base route: /api/users
// -----------------------------------------------------------------------------

import express from 'express';
import {
  getAll,
  getById,
  create,
  update,
  remove,
  search,
  login,
  assignRole,
} from '../controllers/user.controller.js';

const router = express.Router();

// ## AUTH ##
router.post('/auth/login', login);           // User login

// ## READ ##
router.get('/', getAll);                     // Get all users
router.get('/:id', getById);                 // Get user by ID

// ## CREATE ##
router.post('/', create);                    // Create new user

// ## UPDATE ##
router.patch('/:id', update);                // Update user data
router.patch('/:id/role', assignRole);       // Assign or change user role

// ## DELETE ##
router.delete('/:id', remove);               // Delete user

// ## SEARCH ##
router.get('/search', search);               // Search/filter users

export default router;
