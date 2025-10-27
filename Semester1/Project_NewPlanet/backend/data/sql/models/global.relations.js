// -----------------------------------------------------------------------------
// 🌐 Population Registry — Sequelize Relations
// Defines all associations between database models.
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

// Each User belongs to one Citizen (their personal profile)
User.belongsTo(Citizen, {
  foreignKey: 'citizen_id',
  as: 'citizen',
});

// Each Citizen can have zero or one linked User account
Citizen.hasOne(User, {
  foreignKey: 'citizen_id',
  as: 'user',
});

// Each User has one Role
User.belongsTo(Role, {
  foreignKey: 'role_id',
  as: 'role',
});

// Each Role can be assigned to many Users
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

// Each Event belongs to a primary Citizen
Event.belongsTo(Citizen, {
  foreignKey: 'citizen_id',
  as: 'citizen',
});

// Optional: partner relationship for marriage
Event.belongsTo(Citizen, {
  foreignKey: 'partner_id',
  as: 'partner',
});

// Optional: parental relationships for births
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

// A Citizen can have many relations (children, spouses, etc.)
Citizen.hasMany(Relation, {
  foreignKey: 'citizen_id',
  as: 'relations',
});

// Each relation links back to a Citizen
Relation.belongsTo(Citizen, {
  foreignKey: 'citizen_id',
  as: 'citizen',
});

// The related citizen (the other party in the relation)
Relation.belongsTo(Citizen, {
  foreignKey: 'related_citizen_id',
  as: 'relatedCitizen',
});

// -----------------------------------------------------------------------------
// 🧬 Citizen ↔ GeneticResult (Self-referential pair)
// -----------------------------------------------------------------------------

// A Citizen can be part of many genetic results (as A or B)
Citizen.hasMany(GeneticResult, {
  foreignKey: 'citizen_a_id',
  as: 'geneticResultsA',
});

Citizen.hasMany(GeneticResult, {
  foreignKey: 'citizen_b_id',
  as: 'geneticResultsB',
});

// Each GeneticResult belongs to two citizens
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

// Currently reports are global, but if you later link them:
PlanetData.hasMany(Report, {
  foreignKey: 'planet_id',
  as: 'reports',
});

Report.belongsTo(PlanetData, {
  foreignKey: 'planet_id',
  as: 'planet',
});

// -----------------------------------------------------------------------------
// ✅ Export all models (so they can be imported elsewhere easily)
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
