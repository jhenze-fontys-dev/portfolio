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

// Each User belongs to one Citizen (their personal identity)
User.belongsTo(Citizen, {
  foreignKey: 'citizen_id',
  as: 'citizen',
});

// Each Citizen can have zero or one User account
Citizen.hasOne(User, {
  foreignKey: 'citizen_id',
  as: 'user',
});

// Each User has one Role
User.belongsTo(Role, {
  foreignKey: 'role_id',
  as: 'role',
});

// Each Role can have many Users
Role.hasMany(User, {
  foreignKey: 'role_id',
  as: 'users',
});

// -----------------------------------------------------------------------------
// 🗓️ Citizen ↔ Event
// -----------------------------------------------------------------------------

// A Citizen can have many Events (birth, marriage, death, etc.)
Citizen.hasMany(Event, {
  foreignKey: 'citizen_id',
  as: 'events',
});

// Each Event belongs to one Citizen
Event.belongsTo(Citizen, {
  foreignKey: 'citizen_id',
  as: 'citizen',
});

// Optional partner (for marriage events)
Event.belongsTo(Citizen, {
  foreignKey: 'partner_id',
  as: 'partner',
});

// Optional parental links (for birth events)
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

// A Citizen can have many outgoing relations (e.g., as parent/spouse)
Citizen.hasMany(Relation, {
  foreignKey: 'citizen_id',
  as: 'relations',
});

// A Citizen can have many incoming relations (e.g., as relatedCitizen)
Citizen.hasMany(Relation, {
  foreignKey: 'related_citizen_id',
  as: 'relatedRelations',
});

// Each Relation connects two citizens
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

// A Citizen can appear in many GeneticResult entries
Citizen.hasMany(GeneticResult, {
  foreignKey: 'citizen_a_id',
  as: 'geneticResultsA',
});

Citizen.hasMany(GeneticResult, {
  foreignKey: 'citizen_b_id',
  as: 'geneticResultsB',
});

// Each GeneticResult belongs to two Citizens
GeneticResult.belongsTo(Citizen, {
  foreignKey: 'citizen_a_id',
  as: 'citizenA',
});

GeneticResult.belongsTo(Citizen, {
  foreignKey: 'citizen_b_id',
  as: 'citizenB',
});

// -----------------------------------------------------------------------------
// 🌍 PlanetData ↔ Report (Optional one-to-many)
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
// ✅ Notes:
// - This file MUST be imported after all model definitions are loaded.
// - Example: import './data/sql/models/global.relations.js'; in server.js
// - Keeps association logic centralized, preventing circular import issues.
// -----------------------------------------------------------------------------
