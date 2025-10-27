// backend/routes/role.routes.js
// -----------------------------------------------------------------------------
// 🧾 Role Router
// Defines routes for managing system roles and permissions.
// -----------------------------------------------------------------------------
//
// Base route: /api/roles
// -----------------------------------------------------------------------------

import express from 'express';
import {
  getAll,
  getById,
  create,
  update,
  remove,
  search,
} from '../controllers/role.controller.js';

const router = express.Router();

// ## READ ##
router.get('/', getAll);         // Get all roles
router.get('/:id', getById);     // Get role by ID

// ## CREATE ##
router.post('/', create);        // Create new role

// ## UPDATE ##
router.patch('/:id', update);    // Update existing role

// ## DELETE ##
router.delete('/:id', remove);   // Delete role

// ## SEARCH ##
router.get('/search', search);   // Search roles

export default router;
