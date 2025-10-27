// -----------------------------------------------------------------------------
// 🔗 Relation SQL Service
// Provides CRUD, search, and filtering logic for citizen relationships
// (parent-child, spouse, etc.).
// -----------------------------------------------------------------------------

import { Op } from 'sequelize';
import Relation from '../models/relation.model.js';
import Citizen from '../models/citizen.model.js';

export const relationService = {
  /**
   * 🧾 Get all relations
   */
  async getAll(includeRelations = false) {
    const rows = await Relation.findAll({
      include: includeRelations
        ? [
            { model: Citizen, as: 'citizen' },
            { model: Citizen, as: 'relatedCitizen' },
          ]
        : [],
    });
    return rows.map((r) => r.toJSON());
  },

  /**
   * 🔍 Get a relation by ID
   */
  async getById(id, includeRelations = false) {
    const row = await Relation.findByPk(id, {
      include: includeRelations
        ? [
            { model: Citizen, as: 'citizen' },
            { model: Citizen, as: 'relatedCitizen' },
          ]
        : [],
    });
    return row ? row.toJSON() : null;
  },

  /**
   * ➕ Create a new relation
   */
  async create(payload) {
    const row = await Relation.create(payload);
    return row.toJSON();
  },

  /**
   * ✏️ Update an existing relation
   */
  async update(id, fields) {
    const row = await Relation.findByPk(id);
    if (!row) return null;
    await row.update(fields);
    return row.toJSON();
  },

  /**
   * ❌ Delete a relation
   */
  async remove(id) {
    const row = await Relation.findByPk(id);
    if (!row) return null;
    await row.destroy();
    return { msg: 'Relation deleted', id };
  },

  /**
   * 🔎 Search / Filter / Sort Relations
   *
   * Supports:
   * - Filtering by citizen_id or related_citizen_id
   * - Searching by relation type (spouse, parent, child)
   * - Date range filters (start_dateMin, end_dateMax)
   * - Sorting by date or type
   *
   * Examples:
   *   /api/relations/search?citizen_id=12
   *   /api/relations/search?type=spouse
   *   /api/relations/search?start_dateMin=2100-01-01&sortBy=start_date
   */
  async search(params = {}, includeRelations = false) {
    const { sortBy, order = 'ASC', ...filters } = params;

    const where = {};

    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === '') continue;

      // 🎯 Handle date range filters (start_dateMin / end_dateMax)
      if (key.endsWith('Min') || key.endsWith('Max')) {
        const baseKey = key.replace(/Min|Max/, '');
        if (!where[baseKey]) where[baseKey] = {};

        if (key.endsWith('Min')) {
          where[baseKey][Op.gte] = value;
        } else {
          where[baseKey][Op.lte] = value;
        }
      }

      // 🧩 Handle text-based search (e.g., type LIKE)
      else if (typeof value === 'string') {
        where[key] = { [Op.like]: `%${value}%` };
      }

      // 🧩 Handle exact matches (IDs, status, etc.)
      else {
        where[key] = value;
      }
    }

    // 🧩 Handle sorting
    const orderClause = sortBy ? [[sortBy, order.toUpperCase()]] : [];

    const rows = await Relation.findAll({
      where,
      order: orderClause,
      include: includeRelations
        ? [
            { model: Citizen, as: 'citizen' },
            { model: Citizen, as: 'relatedCitizen' },
          ]
        : [],
    });

    return rows.map((r) => r.toJSON());
  },

  /**
   * 👨‍👩‍👧 Get all relations for a given citizen (bidirectional)
   * Returns both incoming and outgoing relations for a complete view.
   */
  async getRelationsForCitizen(citizenId) {
    const rows = await Relation.findAll({
      where: {
        [Op.or]: [
          { citizen_id: citizenId },
          { related_citizen_id: citizenId },
        ],
      },
      include: [
        { model: Citizen, as: 'citizen' },
        { model: Citizen, as: 'relatedCitizen' },
      ],
    });
    return rows.map((r) => r.toJSON());
  },
};
