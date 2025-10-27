// -----------------------------------------------------------------------------
// 🗓️ Event SQL Service
// Provides CRUD and search/filter/sort logic for citizen life events
// (birth, marriage, death, migration).
// -----------------------------------------------------------------------------

import { Op } from 'sequelize';
import Event from '../models/event.model.js';
import Citizen from '../models/citizen.model.js';

export const eventService = {
  /**
   * 🧾 Get all events (optionally with related citizens)
   */
  async getAll(includeRelations = false) {
    const rows = await Event.findAll({
      include: includeRelations
        ? [
            { model: Citizen, as: 'citizen' },
            { model: Citizen, as: 'partner' },
            { model: Citizen, as: 'parentA' },
            { model: Citizen, as: 'parentB' },
          ]
        : [],
    });
    return rows.map((r) => r.toJSON());
  },

  /**
   * 🔍 Get an event by ID
   */
  async getById(id, includeRelations = false) {
    const row = await Event.findByPk(id, {
      include: includeRelations
        ? [
            { model: Citizen, as: 'citizen' },
            { model: Citizen, as: 'partner' },
            { model: Citizen, as: 'parentA' },
            { model: Citizen, as: 'parentB' },
          ]
        : [],
    });
    return row ? row.toJSON() : null;
  },

  /**
   * ➕ Create a new event
   */
  async create(payload) {
    const row = await Event.create(payload);
    return row.toJSON();
  },

  /**
   * ✏️ Update an existing event
   */
  async update(id, fields) {
    const row = await Event.findByPk(id);
    if (!row) return null;
    await row.update(fields);
    return row.toJSON();
  },

  /**
   * ❌ Delete an event
   */
  async remove(id) {
    const row = await Event.findByPk(id);
    if (!row) return null;
    await row.destroy();
    return { msg: 'Event deleted', id };
  },

  /**
   * 🔎 Search / Filter / Sort Events
   *
   * Examples:
   *   /api/events/search?type=marriage
   *   /api/events/search?dateMin=2100-01-01&dateMax=2125-12-31
   *   /api/events/search?location=Paris&sortBy=date&order=DESC
   */
  async search(params = {}, includeRelations = false) {
    const { sortBy, order = 'ASC', ...filters } = params;

    const where = {};

    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === '') continue;

      // 🎯 Handle date ranges (e.g., dateMin/dateMax)
      if (key.endsWith('Min') || key.endsWith('Max')) {
        const baseKey = key.replace(/Min|Max/, '');
        if (!where[baseKey]) where[baseKey] = {};

        if (key.endsWith('Min')) {
          where[baseKey][Op.gte] = value;
        } else {
          where[baseKey][Op.lte] = value;
        }
      }

      // 🧩 Handle text-based fields (LIKE search)
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

    const rows = await Event.findAll({
      where,
      order: orderClause,
      include: includeRelations
        ? [
            { model: Citizen, as: 'citizen' },
            { model: Citizen, as: 'partner' },
            { model: Citizen, as: 'parentA' },
            { model: Citizen, as: 'parentB' },
          ]
        : [],
    });

    return rows.map((r) => r.toJSON());
  },
};
