// -----------------------------------------------------------------------------
// 🌍 PlanetData SQL Service
// Provides CRUD and search/filter/sort logic for planetary metrics
// (population, resources, sustainability, migration, etc.).
// -----------------------------------------------------------------------------

import { Op } from 'sequelize';
import PlanetData from '../models/planetData.model.js';

export const planetDataService = {
  /**
   * 🧾 Get all planet data entries
   */
  async getAll() {
    const rows = await PlanetData.findAll();
    return rows.map((r) => r.toJSON());
  },

  /**
   * 🔍 Get a specific planet data record by ID
   */
  async getById(id) {
    const row = await PlanetData.findByPk(id);
    return row ? row.toJSON() : null;
  },

  /**
   * ➕ Create a new planet data record
   */
  async create(payload) {
    const row = await PlanetData.create(payload);
    return row.toJSON();
  },

  /**
   * ✏️ Update an existing planet data record
   */
  async update(id, fields) {
    const row = await PlanetData.findByPk(id);
    if (!row) return null;
    await row.update(fields);
    return row.toJSON();
  },

  /**
   * ❌ Delete a planet data record
   */
  async remove(id) {
    const row = await PlanetData.findByPk(id);
    if (!row) return null;
    await row.destroy();
    return { msg: 'Planet data deleted', id };
  },

  /**
   * 🔎 Search / Filter / Sort Planet Data
   *
   * Supports:
   * - Filtering by numeric ranges (e.g., max_population, resource_capacity)
   * - Text search (by planet name)
   * - Sorting by any numeric or date column
   *
   * Examples:
   *   /api/planet/search?name=Nova
   *   /api/planet/search?max_populationMin=10000
   *   /api/planet/search?sortBy=current_population&order=DESC
   */
  async search(params = {}) {
    const { sortBy, order = 'ASC', ...filters } = params;
    const where = {};

    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === '') continue;

      // 🎯 Handle numeric range filters (e.g., max_populationMin / max_populationMax)
      if (key.endsWith('Min') || key.endsWith('Max')) {
        const baseKey = key.replace(/Min|Max/, '');
        if (!where[baseKey]) where[baseKey] = {};

        if (key.endsWith('Min')) {
          where[baseKey][Op.gte] = parseFloat(value);
        } else {
          where[baseKey][Op.lte] = parseFloat(value);
        }
      }

      // 🧩 Handle text-based fields (LIKE)
      else if (typeof value === 'string') {
        where[key] = { [Op.like]: `%${value}%` };
      }

      // 🧩 Handle exact matches (e.g., status or specific integer)
      else {
        where[key] = value;
      }
    }

    // 🧩 Handle sorting
    const orderClause = sortBy ? [[sortBy, order.toUpperCase()]] : [];

    const rows = await PlanetData.findAll({
      where,
      order: orderClause,
    });

    return rows.map((r) => r.toJSON());
  },
};
