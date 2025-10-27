// -----------------------------------------------------------------------------
// 🔐 User SQL Service
// Provides CRUD, authentication, and role assignment logic for users.
// -----------------------------------------------------------------------------

import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import User from '../models/user.model.js';
import Role from '../models/role.model.js';
import Citizen from '../models/citizen.model.js';

export const userService = {
  /**
   * 🧾 Get all users
   */
  async getAll(includeRelations = false) {
    const include = includeRelations
      ? [{ model: Role, as: 'role' }, { model: Citizen, as: 'citizen' }]
      : [];

    const rows = await User.findAll({ include });
    return rows.map((r) => r.toJSON());
  },

  /**
   * 🔍 Get user by ID
   */
  async getById(id, includeRelations = false) {
    const include = includeRelations
      ? [{ model: Role, as: 'role' }, { model: Citizen, as: 'citizen' }]
      : [];

    const row = await User.findByPk(id, { include });
    return row ? row.toJSON() : null;
  },

  /**
   * ➕ Create a new user
   */
  async create(payload) {
    // Hash password before saving
    if (payload.password) {
      payload.password_hash = await bcrypt.hash(payload.password, 10);
      delete payload.password;
    }

    const row = await User.create(payload);
    return row.toJSON();
  },

  /**
   * ✏️ Update existing user
   */
  async update(id, fields) {
    const row = await User.findByPk(id);
    if (!row) return null;

    // Re-hash password if changed
    if (fields.password) {
      fields.password_hash = await bcrypt.hash(fields.password, 10);
      delete fields.password;
    }

    await row.update(fields);
    return row.toJSON();
  },

  /**
   * ❌ Delete a user
   */
  async remove(id) {
    const row = await User.findByPk(id);
    if (!row) return null;

    await row.destroy();
    return { msg: 'User deleted', id };
  },

  /**
   * 🔍 Search users by filters (email, role, citizen, etc.)
   * Examples:
   *   /api/users/search?email=john
   *   /api/users/search?roleId=2
   *   /api/users/search?sortBy=email&order=ASC
   */
  async search(params = {}, includeRelations = false) {
    const { sortBy, order = 'ASC', ...filters } = params;

    const where = {};

    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === '') continue;

      if (typeof value === 'string') {
        where[key] = { [Op.like]: `%${value}%` };
      } else {
        where[key] = value;
      }
    }

    const orderClause = sortBy ? [[sortBy, order.toUpperCase()]] : [];

    const include = includeRelations
      ? [{ model: Role, as: 'role' }, { model: Citizen, as: 'citizen' }]
      : [];

    const rows = await User.findAll({ where, order: orderClause, include });
    return rows.map((r) => r.toJSON());
  },

  /**
   * 🔑 Authenticate user (login)
   * Verifies email & password and returns user if valid.
   */
  async login(email, password) {
    const user = await User.findOne({
      where: { email },
      include: [{ model: Role, as: 'role' }, { model: Citizen, as: 'citizen' }],
    });

    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return null;

    // Return sanitized user object
    const userData = user.toJSON();
    delete userData.password_hash;
    return userData;
  },

  /**
   * 🎭 Assign a new role to a user
   */
  async assignRole(userId, roleId) {
    const user = await User.findByPk(userId);
    if (!user) return null;

    const role = await Role.findByPk(roleId);
    if (!role) return null;

    user.role_id = roleId;
    await user.save();

    const updatedUser = await User.findByPk(userId, {
      include: [{ model: Role, as: 'role' }],
    });

    return updatedUser.toJSON();
  },
};
