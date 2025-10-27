// backend/routes/event.routes.js
// -----------------------------------------------------------------------------
// 🗓️ Event Router
// Defines routes for managing life events of citizens (birth, marriage, death).
// -----------------------------------------------------------------------------
//
// Base route: /api/events
// -----------------------------------------------------------------------------
//
// Includes:
// - CRUD operations for events
// - Specialized endpoints for birth, marriage, and death events
// - Search and filtering
// -----------------------------------------------------------------------------

import express from 'express';
import {
  getAll,
  getById,
  create,
  update,
  remove,
  search,
  createBirth,
  createMarriage,
  createDeath,
} from '../controllers/event.controller.js';

const router = express.Router();

// ## READ ##
router.get('/', getAll);          // Get all events
router.get('/:id', getById);      // Get event by ID

// ## CREATE ##
router.post('/', create);         // Generic event creation
router.post('/birth', createBirth);     // Record birth event
router.post('/marriage', createMarriage); // Record marriage event
router.post('/death', createDeath);       // Record death event

// ## UPDATE ##
router.patch('/:id', update);     // Update existing event

// ## DELETE ##
router.delete('/:id', remove);    // Delete event by ID

// ## SEARCH ##
router.get('/search', search);    // Advanced event search/filter

export default router;
