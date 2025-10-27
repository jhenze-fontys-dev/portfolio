// backend/routes/relation.routes.js
// -----------------------------------------------------------------------------
// 🔗 Relation Router
// Defines routes for managing family and social relationships between citizens.
// -----------------------------------------------------------------------------
//
// Base route: /api/relations
// -----------------------------------------------------------------------------

import express from 'express';
import {
  getAll,
  getById,
  create,
  update,
  remove,
  search,
  getRelationsForCitizen,
} from '../controllers/relation.controller.js';

const router = express.Router();

// ## READ ##
router.get('/', getAll);                     // Get all relations
router.get('/:id', getById);                 // Get relation by ID
router.get('/citizen/:citizenId', getRelationsForCitizen); // Get relations for a citizen

// ## CREATE ##
router.post('/', create);                    // Create new relation

// ## UPDATE ##
router.patch('/:id', update);                // Update existing relation

// ## DELETE ##
router.delete('/:id', remove);               // Delete relation by ID

// ## SEARCH ##
router.get('/search', search);               // Advanced relation search/filter

export default router;
