// -----------------------------------------------------------------------------
// 🔗 Relation Sequelize Model
// Represents family or social relationships between citizens
// (e.g., parent–child, spouse–spouse).
// -----------------------------------------------------------------------------

import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Relation = sequelize.define(
  'Relation',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['parent', 'child', 'spouse']],
      },
    },

    citizen_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Citizen', // Reference by table name
        key: 'id',
      },
    },

    related_citizen_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Citizen', // Reference by table name
        key: 'id',
      },
    },

    status: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isIn: [['active', 'divorced', 'widowed', 'inactive']],
      },
    },

    start_date: {
      type: DataTypes.STRING, // ISO 8601 date string
      allowNull: true,
    },

    end_date: {
      type: DataTypes.STRING,
      allowNull: true,
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
    tableName: 'Relation',
    timestamps: false, // handled manually
  }
);

export default Relation;
