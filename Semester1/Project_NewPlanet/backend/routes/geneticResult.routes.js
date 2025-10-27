// backend/routes/geneticResult.routes.js
// -----------------------------------------------------------------------------
// 🧬 GeneticResult Router
// Defines routes for managing inbreeding coefficient calculations.
// -----------------------------------------------------------------------------
//
// Base route: /api/genetics
// -----------------------------------------------------------------------------

import express from 'express';
import {
  getAll,
  getById,
  create,
  update,
  remove,
  search,
  calculate,
  checkPairing,
} from '../controllers/geneticResult.controller.js';

const router = express.Router();

// ## READ ##
router.get('/', getAll);                // Get all results
router.get('/:id', getById);            // Get result by ID

// ## CREATE ##
router.post('/', create);               // Add new calculation result
router.post('/calculate', calculate);   // Run inbreeding calculation for a pair

// ## CHECK ##
router.get('/check', checkPairing);     // Check coefficient for a potential pairing

// ## UPDATE ##
router.patch('/:id', update);           // Update existing result

// ## DELETE ##
router.delete('/:id', remove);          // Delete result

// ## SEARCH ##
router.get('/search', search);          // Filter results by citizen or date range

export default router;
