// backend/data/sql/models/template.model.js
// -----------------------------------------------------------------------------
// 🧩 TEMPLATE SEQUELIZE MODEL
// Copy this file when creating a new model (e.g., user.model.js, product.model.js).
// Replace `Template` and adjust the fields to match your table structure.
// -----------------------------------------------------------------------------

import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

// Example Sequelize model definition
const Template = sequelize.define(
  'Template', // 👈 Model name (used internally by Sequelize)
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // Example column — replace or extend as needed
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // Add more fields below as your database grows
    // exampleField: {
    //   type: DataTypes.STRING,
    //   allowNull: true,
    //   defaultValue: null,
    // },
  },
  {
    tableName: 'Templates', // 👈 Change to match your SQL table name
    timestamps: false,      // Set true if you want createdAt/updatedAt
  }
);

export default Template;
