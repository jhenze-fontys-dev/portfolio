// -----------------------------------------------------------------------------
// 🧬 GeneticResult Sequelize Model
// Represents the inbreeding coefficient between two citizens.
// -----------------------------------------------------------------------------

import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const GeneticResult = sequelize.define(
  'GeneticResult',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    citizen_a_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Citizen',
        key: 'id',
      },
    },

    citizen_b_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Citizen',
        key: 'id',
      },
    },

    coefficient: {
      type: DataTypes.FLOAT, // Wright’s F coefficient (0.0–1.0)
      allowNull: true,
    },

    threshold: {
      type: DataTypes.FLOAT, // Maximum allowed inbreeding level
      allowNull: true,
    },

    timestamp: {
      type: DataTypes.STRING, // When this result was calculated (ISO 8601)
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
    tableName: 'GeneticResult',
    timestamps: false, // Manual timestamp fields
    indexes: [
      {
        unique: true,
        fields: ['citizen_a_id', 'citizen_b_id'], // Prevent duplicate pairs
      },
    ],
  }
);

export default GeneticResult;
