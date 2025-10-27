// -----------------------------------------------------------------------------
// 🌍 PlanetData Sequelize Model
// Stores overall planetary metrics like population, resources, and sustainability.
// -----------------------------------------------------------------------------

import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const PlanetData = sequelize.define(
  'PlanetData',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    max_population: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    resource_capacity: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    sustainability_factor: {
      type: DataTypes.FLOAT, // Value between 0 and 1
      allowNull: true,
      validate: {
        min: 0,
        max: 1,
      },
    },

    area_km2: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    current_population: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    migration_in: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },

    migration_out: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },

    avg_resource_use: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    growth_rate: {
      type: DataTypes.FLOAT, // Annual growth rate (%)
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
    tableName: 'PlanetData',
    timestamps: false, // We handle created_at / updated_at manually
  }
);

export default PlanetData;
