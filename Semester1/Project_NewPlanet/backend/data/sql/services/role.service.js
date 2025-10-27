// -----------------------------------------------------------------------------
// 🧩 Role SQL Service
// Provides CRUD, search/filter/sort logic for user roles
// (citizen, civilServant, admin).
// -----------------------------------------------------------------------------

import { Op } from 'sequelize';
import Role from '../models/role.model.js';
import User from '../models/user.model.js';

export const roleService = {
  /**
   * 🧾 Get all roles
   */
  async getAll(includeUsers = false) {
    const rows = await Role.findAll({
      include: includeUsers ? [{ model: User, as: 'users' }] : [],
    });
    return rows.map((r) => r.toJSON());
  },

  /**
   * 🔍 Get a role by ID
   */
  async getById(id, includeUsers = false) {
    const row = await Role.findByPk(id, {
      include: includeUsers ? [{ model: User, as: 'users' }] : [],
    });
    return row ? row.toJSON() : null;
  },

  /**
   * ➕ Create a new role
   */
  async create(payload) {
    const row = await Role.create(payload);
    return row.toJSON();
  },

  /**
   * ✏️ Update an existing role
   */
  async update(id, fields) {
    const row = await Role.findByPk(id);
    if (!row) return null;
    await row.update(fields);
    return row.toJSON();
  },

  /**
   * ❌ Delete a role
   */
  async remove(id) {
    const row = await Role.findByPk(id);
    if (!row) return null;
    await row.destroy();
    return { msg: 'Role deleted', id };
  },

  /**
   * 🔎 Search / Filter / Sort Roles
   *
   * Supports:
   * - Filtering by name
   * - Sorting by name or ID
   *
   * Examples:
   *   /api/roles/search?name=admin
   *   /api/roles/search?sortBy=name&order=ASC
   */
  async search(params = {}, includeUsers = false) {
    const { sortBy, order = 'ASC', ...filters } = params;

    const where = {};

    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === '') continue;

      // 🧩 Handle text search (LIKE)
      if (typeof value === 'string') {
        where[key] = { [Op.like]: `%${value}%` };
      }

      // 🧩 Handle exact matches
      else {
        where[key] = value;
      }
    }

    // 🧩 Handle sorting
    const orderClause = sortBy ? [[sortBy, order.toUpperCase()]] : [];

    const rows = await Role.findAll({
      where,
      order: orderClause,
      include: includeUsers ? [{ model: User, as: 'users' }] : [],
    });

    return rows.map((r) => r.toJSON());
  },

  /**
   * 👥 Get all users assigned to a specific role
   */
  async getUsersByRoleId(roleId) {
    const role = await Role.findByPk(roleId, {
      include: [{ model: User, as: 'users' }],
    });
    return role ? role.users.map((u) => u.toJSON()) : [];
  },

  /**
   * 🧠 Get role by name
   * Useful for middleware and authorization checks.
   */
  async getByName(name) {
    const role = await Role.findOne({ where: { name } });
    return role ? role.toJSON() : null;
  },
};
