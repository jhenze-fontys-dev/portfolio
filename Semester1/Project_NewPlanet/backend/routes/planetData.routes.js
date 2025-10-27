// backend/routes/planetData.routes.js
// -----------------------------------------------------------------------------
// 🌍 PlanetData Router
// Defines routes for accessing and updating planetary data and capacity metrics.
// -----------------------------------------------------------------------------
//
// Base route: /api/planet
// -----------------------------------------------------------------------------

import express from 'express';
import {
  getAll,
  getById,
  create,
  update,
  remove,
  search,
  getCapacity,
} from '../controllers/planetData.controller.js';

const router = express.Router();

// ## READ ##
router.get('/', getAll);               // Get planet data
router.get('/:id', getById);           // Get specific planet record
router.get('/capacity', getCapacity);  // Get carrying capacity calculation

// ## CREATE ##
router.post('/', create);              // Create new planet record (usually singleton)

// ## UPDATE ##
router.patch('/:id', update);          // Update planet data

// ## DELETE ##
router.delete('/:id', remove);         // Delete record

// ## SEARCH ##
router.get('/search', search);         // Filter by metrics or name

export default router;
