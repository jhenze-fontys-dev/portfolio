// backend/routes/citizen.routes.js
// -----------------------------------------------------------------------------
// 👥 Citizen Router
// Defines routes for citizen-related operations (CRUD, search, family tree).
// -----------------------------------------------------------------------------
//
// Base route: /api/citizens
// -----------------------------------------------------------------------------
//
// Includes:
// - Standard CRUD operations
// - Search / filter support
// - Family tree endpoints for hierarchical and graph data
// -----------------------------------------------------------------------------

import express from 'express';
import {
  getAll,
  getById,
  create,
  update,
  remove,
  search,
  getFamilyTree,
  getFamilyTreeData,
} from '../controllers/citizen.controller.js';

const router = express.Router();

// ## READ ##
router.get('/', getAll);                   // Get all citizens
router.get('/:id', getById);               // Get a single citizen by ID

// ## CREATE ##
router.post('/', create);                  // Create new citizen

// ## UPDATE ##
router.patch('/:id', update);              // Update existing citizen

// ## DELETE ##
router.delete('/:id', remove);             // Delete citizen by ID

// ## SEARCH ##
router.get('/search', search);             // Advanced search/filter

// ## FAMILY TREE ##
router.get('/family/tree', getFamilyTree);         // Get family tree (hierarchical)
router.get('/family/tree/data', getFamilyTreeData); // Get graph-ready tree data

export default router;
