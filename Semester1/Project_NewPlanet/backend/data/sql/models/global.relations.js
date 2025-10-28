// -----------------------------------------------------------------------------
// 🌐 Population Registry — Sequelize Relations (Global Association Loader)
// Defines all model relationships AFTER all models are initialized.
// -----------------------------------------------------------------------------

import Citizen from './citizen.model.js';
import User from './user.model.js';
import Role from './role.model.js';
import Event from './event.model.js';
import Relation from './relation.model.js';
import GeneticResult from './geneticResult.model.js';
import PlanetData from './planetData.model.js';
import Report from './report.model.js';

// -----------------------------------------------------------------------------
// 👥 User ↔ Citizen ↔ Role
// -----------------------------------------------------------------------------

User.belongsTo(Citizen, {
  foreignKey: 'citizen_id',
  as: 'citizen',
});

Citizen.hasOne(User, {
  foreignKey: 'citizen_id',
  as: 'user',
});

User.belongsTo(Role, {
  foreignKey: 'role_id',
  as: 'role',
});

Role.hasMany(User, {
  foreignKey: 'role_id',
  as: 'users',
});

// -----------------------------------------------------------------------------
// 🗓️ Citizen ↔ Event
// -----------------------------------------------------------------------------

Citizen.hasMany(Event, {
  foreignKey: 'citizen_id',
  as: 'events',
});

Event.belongsTo(Citizen, {
  foreignKey: 'citizen_id',
  as: 'citizen',
});

Event.belongsTo(Citizen, {
  foreignKey: 'partner_id',
  as: 'partner',
});

Event.belongsTo(Citizen, {
  foreignKey: 'parent_a_id',
  as: 'parentA',
});

Event.belongsTo(Citizen, {
  foreignKey: 'parent_b_id',
  as: 'parentB',
});

// -----------------------------------------------------------------------------
// 🔗 Citizen ↔ Relation (Self-referential)
// -----------------------------------------------------------------------------

// Citizen as the source of the relation (e.g., parent or spouse)
Citizen.hasMany(Relation, {
  foreignKey: 'citizen_id',
  as: 'relationsAsSource', // ✅ unique alias
});

// Citizen as the target of the relation (e.g., child or partner)
Citizen.hasMany(Relation, {
  foreignKey: 'related_citizen_id',
  as: 'relationsAsTarget', // ✅ unique alias
});

// Each Relation links back to both sides
Relation.belongsTo(Citizen, {
  foreignKey: 'citizen_id',
  as: 'citizen',
});

Relation.belongsTo(Citizen, {
  foreignKey: 'related_citizen_id',
  as: 'relatedCitizen',
});

// -----------------------------------------------------------------------------
// 🧬 Citizen ↔ GeneticResult (Self-referential pair)
// -----------------------------------------------------------------------------

Citizen.hasMany(GeneticResult, {
  foreignKey: 'citizen_a_id',
  as: 'geneticResultsA',
});

Citizen.hasMany(GeneticResult, {
  foreignKey: 'citizen_b_id',
  as: 'geneticResultsB',
});

GeneticResult.belongsTo(Citizen, {
  foreignKey: 'citizen_a_id',
  as: 'citizenA',
});

GeneticResult.belongsTo(Citizen, {
  foreignKey: 'citizen_b_id',
  as: 'citizenB',
});

// -----------------------------------------------------------------------------
// 🌍 PlanetData ↔ Report
// -----------------------------------------------------------------------------

PlanetData.hasMany(Report, {
  foreignKey: 'planet_id',
  as: 'reports',
});

Report.belongsTo(PlanetData, {
  foreignKey: 'planet_id',
  as: 'planet',
});

// -----------------------------------------------------------------------------
// ✅ Export all models for centralized imports
// -----------------------------------------------------------------------------

export {
  Citizen,
  User,
  Role,
  Event,
  Relation,
  GeneticResult,
  PlanetData,
  Report,
};

// -----------------------------------------------------------------------------
// 📝 Notes:
// - Must be imported AFTER all model definitions.
// - Example: import './data/sql/models/global.relations.js' in server.js
// - Prevents circular dependencies and ensures unique aliases.
// -----------------------------------------------------------------------------
