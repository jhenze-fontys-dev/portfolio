// backend/data/sql/services/template.service.js
// -----------------------------------------------------------------------------
// 🧩 TEMPLATE SQL SERVICE — ADVANCED VERSION WITH SEARCH, FILTERS & SORTING
// Copy this file when creating a new SQL-based service (e.g., user.service.js).
// Replace `TemplateModel` with your actual Sequelize model.
// -----------------------------------------------------------------------------

import { Op } from 'sequelize';
import TemplateModel from '../models/TemplateModel.js'; // 👈 Replace with your model

export const templateService = {
  /**
   * Get all records
   */
  async getAll() {
    const rows = await TemplateModel.findAll();
    return rows.map((r) => r.toJSON());
  },

  /**
   * Get a record by ID
   */
  async getById(id) {
    const row = await TemplateModel.findByPk(id);
    return row ? row.toJSON() : null;
  },

  /**
   * Create a new record
   */
  async create(payload) {
    const row = await TemplateModel.create(payload);
    return row.toJSON();
  },

  /**
   * Update a record
   */
  async update(id, fields) {
    const row = await TemplateModel.findByPk(id);
    if (!row) return null;
    await row.update(fields);
    return row.toJSON();
  },

  /**
   * Delete a record
   */
  async remove(id) {
    const row = await TemplateModel.findByPk(id);
    if (!row) return null;
    await row.destroy();
    return { msg: 'Record deleted', id };
  },

  /**
   * 🔍 Search / Filter / Sort
   * Supports flexible querying for text, numeric ranges, and sorting.
   *
   * Example queries:
   *   /api/items/search?title=foo
   *   /api/items/search?priceMin=10&priceMax=100
   *   /api/items/search?status=active&sortBy=createdAt&order=DESC
   */
  async search(params = {}) {
    const { sortBy, order = 'ASC', ...filters } = params;

    const where = {};

    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === '') continue;

      // 🧩 Handle numeric range filters like priceMin / priceMax
      if (key.endsWith('Min') || key.endsWith('Max')) {
        const baseKey = key.replace(/Min|Max/, '');
        if (!where[baseKey]) where[baseKey] = {};

        if (key.endsWith('Min')) {
          where[baseKey][Op.gte] = parseFloat(value);
        } else {
          where[baseKey][Op.lte] = parseFloat(value);
        }
      }

      // 🧩 Handle text search (case-insensitive LIKE)
      else if (typeof value === 'string') {
        where[key] = { [Op.like]: `%${value}%` };
      }

      // 🧩 Handle exact matches for non-text fields
      else {
        where[key] = value;
      }
    }

    // 🧩 Handle sorting
    const orderClause = sortBy ? [[sortBy, order.toUpperCase()]] : [];

    const rows = await TemplateModel.findAll({
      where,
      order: orderClause,
    });

    return rows.map((r) => r.toJSON());
  },
};
