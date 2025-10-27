// -----------------------------------------------------------------------------
// 🔗 Relation Sequelize Model
// Represents family or social relationships between citizens
// (e.g., parent–child, spouse–spouse).
// -----------------------------------------------------------------------------

import { DataTypes } from 'sequelize';
import sequelize from '../db.js';
import Citizen from './citizen.model.js';

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
        model: 'Citizen',
        key: 'id',
      },
    },

    related_citizen_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Citizen',
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
      type: DataTypes.STRING, // Stored as ISO 8601 string
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
    timestamps: false, // Manual timestamps
  }
);

// -----------------------------------------------------------------------------
// 👥 Associations (needed for family tree logic)
// -----------------------------------------------------------------------------

// A relation belongs to one citizen (the "source" of the relation)
Relation.belongsTo(Citizen, {
  foreignKey: 'citizen_id',
  as: 'citizen',
});

// A relation also belongs to another citizen (the "target" of the relation)
Relation.belongsTo(Citizen, {
  foreignKey: 'related_citizen_id',
  as: 'relatedCitizen',
});

export default Relation;
