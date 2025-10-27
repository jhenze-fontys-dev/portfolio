// -----------------------------------------------------------------------------
// 🧾 Role Sequelize Model
// Defines system access roles: citizen, civilServant, and admin.
// -----------------------------------------------------------------------------

import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Role = sequelize.define(
  'Role',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isIn: [['citizen', 'civilServant', 'admin']],
      },
    },

    created_at: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    updated_at: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'Role',
    timestamps: false, // Manual timestamp fields
  }
);

export default Role;
