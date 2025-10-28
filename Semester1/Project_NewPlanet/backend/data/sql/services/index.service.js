// -----------------------------------------------------------------------------
// 🧠 SQL Services Index
// Central export hub for all Sequelize-based entity services.
// -----------------------------------------------------------------------------

import { citizenService } from './citizen.service.js';
import { userService } from './user.service.js';
import { roleService } from './role.service.js';
import { eventService } from './event.service.js';
import { relationService } from './relation.service.js';
import { geneticResultService } from './geneticResult.service.js';
import { planetDataService } from './planetData.service.js';
import { reportService } from './report.service.js';

// Unified export object
export const sqlDataService = {
  citizen: citizenService,
  user: userService,
  role: roleService,
  event: eventService,
  relation: relationService,
  geneticResult: geneticResultService,
  planetData: planetDataService,
  report: reportService,
};
