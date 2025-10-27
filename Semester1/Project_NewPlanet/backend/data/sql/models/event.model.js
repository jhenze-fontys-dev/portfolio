// -----------------------------------------------------------------------------
// 🗓️ Event Sequelize Model
// Represents an event in a citizen's life (birth, marriage, death, migration).
// -----------------------------------------------------------------------------

import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Event = sequelize.define(
  'Event',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    citizen_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Citizen',
        key: 'id',
      },
    },

    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['birth', 'marriage', 'death', 'migration']],
      },
    },

    date: {
      type: DataTypes.STRING, // Stored as ISO 8601 string (TEXT)
      allowNull: false,
    },

    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    partner_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Citizen',
        key: 'id',
      },
    },

    parent_a_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Citizen',
        key: 'id',
      },
    },

    parent_b_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Citizen',
        key: 'id',
      },
    },

    details: {
      type: DataTypes.TEXT, // Can hold JSON-like text for event details
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
    tableName: 'Event',
    timestamps: false, // Using manual created_at/updated_at fields
  }
);

export default Event;
