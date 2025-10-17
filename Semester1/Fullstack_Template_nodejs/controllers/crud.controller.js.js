import fs from 'fs/promises';
import { createError } from '../middleware/errorResponse.js';

const DATA_FILE = 'data/data.json';
const loadData = async () => JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));
const saveData = async(data) => await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));

const getItems = async (req, res, next) => {
  try {
    const data = await loadData();
    res.status(200).json(data);
  } catch (err) {
    next(createError('Failed to load data', 500));
  }
}

const getItem = async (req, res, next) => {
  try {
    const data = await loadData();
    const id = parseInt(req.params.id);
    const item = data.find((item) => item.id === id);

    if (!item) return next(createError(`Item with id ${id} not found`, 404));

    return res.status(200).json(item);
  } catch (err) {
    next(createError('Failed to load data', 500));
  }
}

const createItem = async (req, res, next) => {
  try {
    const data = await loadData();
    const newId = data.length ? Math.max(...data.map(i => i.id)) + 1 : 1;
    const newItem = { id: newId, title: req.body.title };

    if (!newItem.title) return next(createError('Please include a title', 400));

    data.push(newItem);
    await saveData(data);
    res.status(201).json(newItem);
  } catch (err) {
    next(createError('Failed to create item', 500));
  }
}

const updateItem = async (req, res, next) => {
  try {
    const data = await loadData();
    const id = parseInt(req.params.id);
    const item = data.find((item) => item.id === id);

    if (!item) return next(createError(`Item with id ${id} not found`, 404));

    item.title = req.body.title;
    await saveData(data);
    return res
    .status(200).json(item);
  } catch (err) {
    next(createError('Failed to update item', 500));
  }
}

const deleteItem = async (req, res, next) => {
  try {
    let data = await loadData();
    const id = parseInt(req.params.id);
    const item = data.find((item) => item.id === id);

    if (!item) return next(createError(`Item with id ${id} not found`, 404));

    data = data.filter((item) => item.id !== id)
    await saveData(data)
    return res
    .status(200).json({ msg: "Item deleted", id });
  } catch (err) {
    next(createError('Failed to delete', 500));
  }
}

export { getItems, getItem, createItem, updateItem, deleteItem }