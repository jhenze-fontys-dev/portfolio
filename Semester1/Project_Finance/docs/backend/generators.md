
# Backend Generators

## Purpose

This document describes the backend code‑generation pipeline used in the Fullstack Studio. Generators produce structural backend artifacts from metadata and conventions, ensuring consistency, repeatability, and maintainability across the codebase.

All generator scripts live in:

`dev/generators/`

Generators are *handwritten tools* that emit code — never edited output files manually.

---

## Code‑Signature

All generator scripts follow the shared documentation/code signature:

- Clear header comment (purpose, inputs, outputs, side‑effects)
- Read‑only inputs (metadata, filesystem)
- Deterministic outputs
- Logged actions via the shared logger (`_logger.js`)
- No hidden behavior or side effects
- Output must be reproducible after `reset:generated`

---

## Generator Workflow

Typical lifecycle when generating backend artifacts:

1. Parse metadata + configuration
2. Resolve database sources & dialects
3. Render Handlebars templates
4. Emit generated files to backend folders
5. Log all create / update operations
6. Refresh documentation views (tree + paths performed separately)

Generators never delete files — cleanup is handled by `reset:generated`.

---

## Generator Scripts

### `generate.metadataStructure.js`

Creates the canonical metadata structure file:

`dev/config/metadataStructure.json`

This file becomes the *single source of truth* for:
- entities
- fields & types
- relationships
- database mappings
- generator‑driven behavior

---

### `generate.env.js`

Produces a project‑scoped `.env` file based on metadata and conventions.

This file is **safe to regenerate** and **not handwritten**.

Values include:

- database dialects
- connection credentials
- driver + tooling runtime configuration

---

### `generate.sqlDatabase.js`

Builds foundational SQL wiring for each dialect, including:

- base database adapter
- connection helpers
- dialect‑aware abstractions

Generated files live under:

`backend/data/sql/`

---

### `generate.drivers.js`

Creates dialect‑specific driver adapters.

Drivers do **not** contain business logic — only transport / execution details.

Examples:

- SQLite driver
- Postgres driver

---

### `generate.dataSourceRegistry.js`

Outputs a registry describing all available data sources.

Used by services, controllers, and runtime bootstrapping.

---

### `generate.models.js`

Generates ORM‑style model representations per entity and dialect.

Models are intentionally lightweight and mapped directly from metadata.

Location:

`backend/data/sql/models/<dialect>/`

---

### `generate.services.js`

Creates service‑layer database access code.

In V2.1 this layer becomes responsible for:

- validating inputs
- enforcing constraints
- preventing invalid DB access

Location:

`backend/data/sql/services/<dialect>/`

---

### `generate.controllers.js`

Produces HTTP controllers mapped to service methods.

Controllers should remain thin:

- parse request input
- call service methods
- return structured responses

Location:

`backend/controllers/sql/<dialect>/`

---

### `generate.routes.js`

Generates route modules for each entity + dialect.

Combined registry output written to:

`backend/routes/generated.routes.js`

---

### `generate.routeRegistry.js`

Creates the runtime router registration file that composes all generated routes.

This file ensures route loading is deterministic and ordered.

---

### `generate.openAPI.js`

Builds the OpenAPI definition from metadata + routes.

Outputs:

`docs/backend/generated/openapi/`
- OpenAPI manifest
- Dialect‑specific API specs

This output is consumed by:

- testing tools
- documentation
- clients / SDKs

---

## Regeneration Flow (`gen:all`)

Recommended workflow when metadata changes:

```bash
npm run reset:generated
npm run gen:all
npm run doc:tree
npm run doc:paths
```

Generated output must always match metadata + environment state.

---

## Relationships to Reset & Testing

- `reset:generated` removes generator output files
- `reset:db` resets database state
- `test:sql-injection` validates surface integrity against OpenAPI

Generators should never assume database state or environment realities.

---

## Future Work (V2.1+)

- Metadata‑driven validation emitted into services
- Multi‑database instance awareness
- Consistent naming conventions across dialects
- Generator unit‑level smoke testing support

---
