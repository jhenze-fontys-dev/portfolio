// -----------------------------------------------------------------------------
// 👥 Citizen Sequelize Model
// Represents an individual resident in the population registry.
// -----------------------------------------------------------------------------

import { DataTypes } from 'sequelize';
import sequelize from '../db.js';
import Relation from './relation.model.js';

const Citizen = sequelize.define(
  'Citizen',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    birth_date: {
      type: DataTypes.STRING, // Stored as TEXT (ISO 8601 date string)
      allowNull: false,
    },
    death_date: {
      type: DataTypes.STRING, // Nullable for living citizens
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isIn: [['alive', 'deceased']],
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
    tableName: 'Citizen',
    timestamps: false, // handled manually with created_at / updated_at
  }
);

// -----------------------------------------------------------------------------
// 🔗 Associations (for family tree and relation logic)
// -----------------------------------------------------------------------------

// A Citizen can have many relations where they are the source
Citizen.hasMany(Relation, {
  foreignKey: 'citizen_id',
  as: 'relations',
});

// A Citizen can also appear as the related person in other relations
Citizen.hasMany(Relation, {
  foreignKey: 'related_citizen_id',
  as: 'relatedRelations',
});

export default Citizen;
