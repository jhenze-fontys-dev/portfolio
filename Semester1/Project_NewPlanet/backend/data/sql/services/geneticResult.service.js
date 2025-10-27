// -----------------------------------------------------------------------------
// 🧬 GeneticResult SQL Service
// Provides CRUD and search/filter/sort logic for genetic analysis results
// between two citizens (citizenA ↔ citizenB).
// -----------------------------------------------------------------------------

import { Op } from 'sequelize';
import GeneticResult from '../models/geneticResult.model.js';
import Citizen from '../models/citizen.model.js';

export const geneticResultService = {
  /**
   * 🧾 Get all genetic results
   */
  async getAll(includeRelations = false) {
    const rows = await GeneticResult.findAll({
      include: includeRelations
        ? [
            { model: Citizen, as: 'citizenA' },
            { model: Citizen, as: 'citizenB' },
          ]
        : [],
    });
    return rows.map((r) => r.toJSON());
  },

  /**
   * 🔍 Get a genetic result by ID
   */
  async getById(id, includeRelations = false) {
    const row = await GeneticResult.findByPk(id, {
      include: includeRelations
        ? [
            { model: Citizen, as: 'citizenA' },
            { model: Citizen, as: 'citizenB' },
          ]
        : [],
    });
    return row ? row.toJSON() : null;
  },

  /**
   * ➕ Create a new genetic result
   */
  async create(payload) {
    const row = await GeneticResult.create(payload);
    return row.toJSON();
  },

  /**
   * ✏️ Update an existing genetic result
   */
  async update(id, fields) {
    const row = await GeneticResult.findByPk(id);
    if (!row) return null;
    await row.update(fields);
    return row.toJSON();
  },

  /**
   * ❌ Delete a genetic result
   */
  async remove(id) {
    const row = await GeneticResult.findByPk(id);
    if (!row) return null;
    await row.destroy();
    return { msg: 'Genetic result deleted', id };
  },

  /**
   * 🔎 Search / Filter / Sort Genetic Results
   *
   * Supports:
   * - Filtering by citizen IDs
   * - Range queries for coefficient and threshold
   * - Sorting by timestamp or numeric values
   *
   * Examples:
   *   /api/genetics/search?citizen_a_id=1
   *   /api/genetics/search?coefficientMin=0.05&coefficientMax=0.1
   *   /api/genetics/search?sortBy=timestamp&order=DESC
   */
  async search(params = {}, includeRelations = false) {
    const { sortBy, order = 'ASC', ...filters } = params;

    const where = {};

    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === '') continue;

      // 🎯 Handle numeric ranges (e.g., coefficientMin / coefficientMax)
      if (key.endsWith('Min') || key.endsWith('Max')) {
        const baseKey = key.replace(/Min|Max/, '');
        if (!where[baseKey]) where[baseKey] = {};

        if (key.endsWith('Min')) {
          where[baseKey][Op.gte] = parseFloat(value);
        } else {
          where[baseKey][Op.lte] = parseFloat(value);
        }
      }

      // 🧩 Handle text or date fields (LIKE)
      else if (typeof value === 'string') {
        where[key] = { [Op.like]: `%${value}%` };
      }

      // 🧩 Handle exact matches (IDs or numeric fields)
      else {
        where[key] = value;
      }
    }

    // 🧩 Handle sorting
    const orderClause = sortBy ? [[sortBy, order.toUpperCase()]] : [];

    const rows = await GeneticResult.findAll({
      where,
      order: orderClause,
      include: includeRelations
        ? [
            { model: Citizen, as: 'citizenA' },
            { model: Citizen, as: 'citizenB' },
          ]
        : [],
    });

    return rows.map((r) => r.toJSON());
  },
};
