// -----------------------------------------------------------------------------
// 📊 Report SQL Service
// Provides CRUD and search/filter/sort logic for system reports
// (population, genetics, capacity, etc.).
// -----------------------------------------------------------------------------

import { Op } from 'sequelize';
import Report from '../models/report.model.js';
import PlanetData from '../models/planetData.model.js';

export const reportService = {
  /**
   * 🧾 Get all reports
   */
  async getAll(includeRelations = false) {
    const rows = await Report.findAll({
      include: includeRelations ? [{ model: PlanetData, as: 'planet' }] : [],
    });
    return rows.map((r) => r.toJSON());
  },

  /**
   * 🔍 Get a report by ID
   */
  async getById(id, includeRelations = false) {
    const row = await Report.findByPk(id, {
      include: includeRelations ? [{ model: PlanetData, as: 'planet' }] : [],
    });
    return row ? row.toJSON() : null;
  },

  /**
   * ➕ Create a new report
   */
  async create(payload) {
    const row = await Report.create(payload);
    return row.toJSON();
  },

  /**
   * ✏️ Update an existing report
   */
  async update(id, fields) {
    const row = await Report.findByPk(id);
    if (!row) return null;
    await row.update(fields);
    return row.toJSON();
  },

  /**
   * ❌ Delete a report
   */
  async remove(id) {
    const row = await Report.findByPk(id);
    if (!row) return null;
    await row.destroy();
    return { msg: 'Report deleted', id };
  },

  /**
   * 🔎 Search / Filter / Sort Reports
   *
   * Supports:
   * - Filtering by type or creation date
   * - Range filters (e.g., created_atMin/Max)
   * - Sorting by type or creation date
   *
   * Examples:
   *   /api/reports/search?type=population
   *   /api/reports/search?created_atMin=2100-01-01&sortBy=created_at&order=DESC
   */
  async search(params = {}, includeRelations = false) {
    const { sortBy, order = 'ASC', ...filters } = params;
    const where = {};

    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === '') continue;

      // 🎯 Handle date range filters (e.g., created_atMin / created_atMax)
      if (key.endsWith('Min') || key.endsWith('Max')) {
        const baseKey = key.replace(/Min|Max/, '');
        if (!where[baseKey]) where[baseKey] = {};

        if (key.endsWith('Min')) {
          where[baseKey][Op.gte] = value;
        } else {
          where[baseKey][Op.lte] = value;
        }
      }

      // 🧩 Handle text-based fields (LIKE)
      else if (typeof value === 'string') {
        where[key] = { [Op.like]: `%${value}%` };
      }

      // 🧩 Handle exact matches
      else {
        where[key] = value;
      }
    }

    // 🧩 Handle sorting
    const orderClause = sortBy ? [[sortBy, order.toUpperCase()]] : [];

    const rows = await Report.findAll({
      where,
      order: orderClause,
      include: includeRelations ? [{ model: PlanetData, as: 'planet' }] : [],
    });

    return rows.map((r) => r.toJSON());
  },

  /**
   * ⚙️ Generate a new report dynamically (e.g., population stats, genetics summary)
   *
   * @param {string} type - report type (population | genetics | capacity)
   * @param {object} data - computed data payload
   */
  async generate(type, data) {
    const payload = {
      type,
      data: JSON.stringify(data),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const report = await Report.create(payload);
    return report.toJSON();
  },

  /**
   * 🕐 Get the latest report by type
   */
  async getLatestByType(type) {
    const row = await Report.findOne({
      where: { type },
      order: [['created_at', 'DESC']],
    });
    return row ? row.toJSON() : null;
  },
};
