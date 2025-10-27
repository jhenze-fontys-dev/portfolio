// -----------------------------------------------------------------------------
// 📈 Report Sequelize Model
// Stores generated analytical or statistical reports (population, genetics, etc.).
// -----------------------------------------------------------------------------

import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Report = sequelize.define(
  'Report',
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
        isIn: [['population', 'genetics', 'capacity', 'other']],
      },
    },

    data: {
      type: DataTypes.TEXT, // JSON string containing report data
      allowNull: true,
    },

    created_at: {
      type: DataTypes.STRING, // ISO 8601 timestamp
      allowNull: true,
    },

    updated_at: {
      type: DataTypes.STRING, // ISO 8601 timestamp
      allowNull: true,
    },
  },
  {
    tableName: 'Report',
    timestamps: false, // Manual time fields for flexibility
  }
);

export default Report;
