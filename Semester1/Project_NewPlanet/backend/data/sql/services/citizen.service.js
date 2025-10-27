// -----------------------------------------------------------------------------
// 👥 Citizen SQL Service
// Provides CRUD, search, and filtering logic for the Citizen model.
// -----------------------------------------------------------------------------

import { Op } from 'sequelize';
import Citizen from '../models/citizen.model.js';
import Relation from '../models/relation.model.js';

export const citizenService = {
  /**
   * 🧾 Get all citizens
   */
  async getAll() {
    const rows = await Citizen.findAll();
    return rows.map((r) => r.toJSON());
  },

  /**
   * 🔍 Get a citizen by ID
   */
  async getById(id) {
    const row = await Citizen.findByPk(id);
    return row ? row.toJSON() : null;
  },

  /**
   * ➕ Create a new citizen
   */
  async create(payload) {
    const row = await Citizen.create(payload);
    return row.toJSON();
  },

  /**
   * ✏️ Update an existing citizen
   */
  async update(id, fields) {
    const row = await Citizen.findByPk(id);
    if (!row) return null;
    await row.update(fields);
    return row.toJSON();
  },

  /**
   * ❌ Delete a citizen
   */
  async remove(id) {
    const row = await Citizen.findByPk(id);
    if (!row) return null;
    await row.destroy();
    return { msg: 'Citizen deleted', id };
  },

  /**
   * 🔎 Search / Filter / Sort Citizens
   * Supports partial matches (LIKE) for names, date ranges for birth/death,
   * and sorting by any field.
   *
   * Example:
   *   /api/citizens/search?first_name=John&status=alive&sortBy=birth_date&order=DESC
   */
  async search(params = {}) {
    const { sortBy, order = 'ASC', ...filters } = params;

    const where = {};

    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === '') continue;

      // 🎯 Handle numeric / date range filters (e.g., birth_dateMin / birth_dateMax)
      if (key.endsWith('Min') || key.endsWith('Max')) {
        const baseKey = key.replace(/Min|Max/, '');
        if (!where[baseKey]) where[baseKey] = {};

        if (key.endsWith('Min')) {
          where[baseKey][Op.gte] = value;
        } else {
          where[baseKey][Op.lte] = value;
        }
      }

      // 🧩 Handle text fields (case-insensitive partial match)
      else if (typeof value === 'string') {
        where[key] = { [Op.like]: `%${value}%` };
      }

      // 🧩 Handle exact matches (e.g., status=alive)
      else {
        where[key] = value;
      }
    }

    // 🧩 Handle sorting
    const orderClause = sortBy ? [[sortBy, order.toUpperCase()]] : [];

    const rows = await Citizen.findAll({
      where,
      order: orderClause,
    });

    return rows.map((r) => r.toJSON());
  },

  // ---------------------------------------------------------------------------
  // 👨‍👩‍👧 FAMILY TREE LOGIC
  // ---------------------------------------------------------------------------

  /**
   * 🌳 Get a citizen's family tree (hierarchical)
   * Route: GET /api/family/tree?citizenId=me
   */
  async getFamilyTree(citizenId) {
    // Load citizen and direct relations
    const citizen = await Citizen.findByPk(citizenId, {
      include: [
        {
          model: Relation,
          as: 'relations',
          include: [{ model: Citizen, as: 'relatedCitizen' }],
        },
      ],
    });

    if (!citizen) return null;

    // Build a structured family object
    const data = citizen.toJSON();
    const familyTree = {
      citizen: {
        id: data.id,
        name: `${data.first_name} ${data.last_name}`,
      },
      relations: data.relations?.map((r) => ({
        type: r.type,
        relatedCitizen: {
          id: r.relatedCitizen?.id,
          name: `${r.relatedCitizen?.first_name ?? ''} ${r.relatedCitizen?.last_name ?? ''}`.trim(),
        },
      })),
    };

    return familyTree;
  },

  /**
   * 🕸️ Get family tree data (nodes & edges) for visualization
   * Route: GET /api/family/tree/data
   */
  async getFamilyTreeData(citizenId) {
    // Fetch all relations where this citizen is involved
    const relations = await Relation.findAll({
      where: {
        [Op.or]: [{ citizen_id: citizenId }, { related_citizen_id: citizenId }],
      },
    });

    // Build graph structure
    const nodes = new Set();
    const edges = [];

    relations.forEach((r) => {
      edges.push({
        from: r.citizen_id,
        to: r.related_citizen_id,
        type: r.type,
      });

      nodes.add(r.citizen_id);
      nodes.add(r.related_citizen_id);
    });

    // Fetch node details (names)
    const nodeDetails = await Citizen.findAll({
      where: { id: { [Op.in]: Array.from(nodes) } },
    });

    const formattedNodes = nodeDetails.map((n) => ({
      id: n.id,
      label: `${n.first_name} ${n.last_name}`,
    }));

    return { nodes: formattedNodes, edges };
  },
};
