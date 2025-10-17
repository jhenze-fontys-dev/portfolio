import express from 'express';
import { createItem, deleteItem, getItem, getItems, updateItem } from '../controllers/crud.controller.js.js'
const router = express.Router();

// ## CREATE ##
router.post('/', createItem);

// ## READ ##
// All Data
router.get('/', getItems);

// Single Data
router.get('/:id', getItem);

// ## UPDATE ##
router.put('/:id', updateItem);

// ## DELETE ##
router.delete('/:id', deleteItem);

export default router;