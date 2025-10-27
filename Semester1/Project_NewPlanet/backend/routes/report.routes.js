// backend/routes/report.routes.js
// -----------------------------------------------------------------------------
// 📊 Report Router
// Defines routes for managing system reports and analytics data.
// -----------------------------------------------------------------------------
//
// Base route: /api/reports
// -----------------------------------------------------------------------------

import express from 'express';
import {
  getAll,
  getById,
  create,
  update,
  remove,
  search,
} from '../controllers/report.controller.js';

const router = express.Router();

// ## READ ##
router.get('/', getAll);         // Get all reports
router.get('/:id', getById);     // Get report by ID

// ## CREATE ##
router.post('/', create);        // Create a new report

// ## UPDATE ##
router.patch('/:id', update);    // Update report data

// ## DELETE ##
router.delete('/:id', remove);   // Delete report

// ## SEARCH ##
router.get('/search', search);   // Search reports

export default router;
