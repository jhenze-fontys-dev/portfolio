// backend/routes/template.routes.js
// -----------------------------------------------------------------------------
// 🧩 TEMPLATE ROUTER
// Use this as a base for new route modules (e.g., user.routes.js, post.routes.js).
// Each route maps HTTP methods to controller functions in a consistent pattern.
// -----------------------------------------------------------------------------

import express from 'express';
import {
  getAll,
  getById,
  create,
  update,
  remove,
  search,
} from '../controllers/template.controller.js';

const router = express.Router();

/**
 * BASE: /api/[entity]
 * Example: /api/users, /api/products
 */

// ## READ ##
router.get('/', getAll);         // Get all records
router.get('/:id', getById);     // Get one record by ID

// ## CREATE ##
router.post('/', create);        // Create new record

// ## UPDATE ##
router.put('/:id', update);      // Update existing record

// ## DELETE ##
router.delete('/:id', remove);   // Delete record by ID

// ## SEARCH ##
router.get('/search', search);   // Optional advanced search/filter

export default router;
