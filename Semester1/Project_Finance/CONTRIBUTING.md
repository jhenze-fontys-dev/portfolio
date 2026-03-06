
# Contributing to Fullstack Studio

Thank you for considering contributing to this project.  
This document explains how to work with the repository, how to propose changes,
and how to keep your contributions aligned with the architecture and style.

---

## 1. Repository overview

At a high level the project is organized as:

- Root  
  - Orchestration (scripts in `package.json`)  
  - Documentation (`docs/`)  
  - Generator engine (`dev/`)  
- Backend  
  - Runtime Express app (`backend/`)  
  - Generated artifacts (models, services, controllers, routes, OpenAPI)  

The backend code is mostly **generated** from metadata.  
Manual edits should be made in:

- Generators (`dev/generators/**`)
- Handwritten tools (`dev/tools/**`)
- Backend wiring (`backend/server.js`, `backend/swagger.js`, `backend/config/**`)
- Documentation (`docs/**`)

Generated files (those marked with `AUTO-GENERATED FILE — DO NOT EDIT`)  
must not be edited directly. Instead, update the generator or template.

For more architectural details, see:

- `docs/backend/README.md`
- `docs/backend/architecture/overview.md`
- `docs/backend/generators.md`

---

## 2. Getting started

### 2.1. Prerequisites

- Node.js (LTS version recommended)
- npm
- SQLite (binary `sqlite3` on your PATH)
- Optionally: PostgreSQL (`psql`) if you want to use the Postgres dialect

### 2.2. Initial setup

From the repository root:

```bash
npm install
npm --prefix backend install
```

Then generate all backend artifacts:

```bash
npm run gen:all
```

Initialize the database(s):

```bash
npm run reset:db
```

Run the backend:

```bash
npm run dev:backend
```

You should see:

- Backend server running on `http://localhost:3000`
- Swagger UI available at `/api-docs`
- OpenAPI JSONs under `/openapi/*` and `docs/backend/generated/openapi/**`

If something fails on a fresh clone, please file an issue.

---

## 3. Working with generators

The code-generation system lives under:

- `dev/generators/**` – handwritten generator scripts
- `dev/templates/**` – Handlebars templates for generated code
- `docs/style/code-signature.md` – code header/footer rules
- `dev/generators/_logger.js` – shared logger

### 3.1. Core commands

From the root:

```bash
# Regenerate everything (env, metadata, SQL wiring, models, routes, OpenAPI)
npm run gen:all

# Run a specific generator
npm run gen:models
npm run gen:services
npm run gen:controllers
npm run gen:routes
npm run gen:route-registry
npm run gen:openapi
```

Before committing any changes that affect generators or templates:

1. Run `npm run gen:all`.
2. Check that generated files are updated and still compile.
3. Run the backend and smoke-test critical endpoints.

### 3.2. Editing templates and generators

When changing any of:

- `dev/generators/**`
- `dev/templates/**`
- `dev/tools/**`

please ensure:

1. **Headers and footers**

   - Generated files use the `AUTO-GENERATED FILE — DO NOT EDIT` header.
   - Handwritten scripts use the `HANDWRITTEN GENERATOR SCRIPT` or
     `HANDWRITTEN TOOL SCRIPT` header.
   - Footers follow the standard:  
     `End of auto-generated …` or  
     `End of generator script: …`  
     as defined in `docs/style/code-signature.md`.

2. **Logger usage**

   - Use `createStepLogger` from `dev/generators/_logger.js`.
   - Prefer the canonical action verbs:
     - `create` – new file created
     - `update` – existing file modified
     - `delete` – file removed
     - `rmdir` – directory removed
     - `run` – external process invoked (psql, sqlite3, node scripts)
     - `report` – report or index written under `docs/**`

3. **No hard-coded absolute paths**

   - Derive paths from `PROJECT_ROOT` using `path.resolve` / `path.join`.
   - Avoid OS-specific path assumptions.

4. **Deterministic output**

   - Do not include timestamps or environment-specific values in generated
     source files.
   - Use timestamps only in log files or report filenames under `docs/logs/**`
     and `docs/backend/testing/**`.

---

## 4. Code style and documentation style

### 4.1. Code style (JavaScript / Node)

- ES modules with `"type": "module"` in `package.json`.
- Use `import` / `export` rather than `require`.
- Keep imports grouped:

  1. Node core modules (`fs`, `path`, `url`, etc.)
  2. Third-party modules
  3. Local modules

- Prefer small pure functions where possible.
- Avoid inline magic strings for paths; use constants near the top of the file.

### 4.2. Documentation style

Documentation should follow:

- `docs/style/docs-signature.md` (this defines header conventions)
- `docs/style/docs-template.md` (suggested structure and tone)

Key points:

- Use Markdown.
- No emojis or decorative icons in headings or body.
- Use clear, neutral language.
- Prefer short sections with explicit “Inputs / Outputs / Steps” where helpful.

---

## 5. Testing and safety checks

### 5.1. SQL injection test

We maintain a CLI tool for testing basic SQL injection patterns against the API:

```bash
npm run test:sql-injection
```

This uses:

- `dev/tools/testing/test.sqlInjection.js`
- `docs/backend/generated/openapi/openapi.manifest.json`

The tool produces reports under:

- `docs/backend/testing/sqlscan/`

Before major backend or generator changes:

1. Regenerate (`npm run gen:all`).
2. Run the backend (`npm run dev:backend`).
3. Run `npm run test:sql-injection`.
4. Inspect the latest `sqlscan-*.json` if `sqlFindings` is non-zero.

### 5.2. Manual smoke test

At minimum:

- Confirm `/api-docs` loads.
- Confirm core CRUD endpoints for one entity (e.g. `Projects`) behave as expected.
- If you change routes or controllers, test both SQLite and Postgres if available.

---

## 6. Branching, commits, and pull requests

### 6.1. Branching

Suggested workflow:

- `main` – stable branch
- `v2.x` – release branches
- Feature branches: `feature/<short-description>`
- Fix branches: `fix/<short-description>`

### 6.2. Commit messages

Use descriptive commit messages. A simple pattern is:

- `feat: ...` – new feature
- `fix: ...` – bug fix
- `docs: ...` – documentation only
- `chore: ...` – tooling / scripts / non-functional changes
- `refactor: ...` – structural code changes without behaviour change

Include context when changing generators, for example:

- `refactor: normalize logger usage in generators`
- `fix: reset:db honours metadata dialect list`

### 6.3. Pull request expectations

A good pull request should:

1. Describe the problem and the proposed solution.
2. List any commands you ran (e.g. `npm run gen:all`, `npm run test:sql-injection`).
3. Note any breaking changes or behaviour changes.
4. Indicate which docs were updated (if relevant).

---

## 7. Adding new sources or entities (high-level)

Adding a new SQL database or entity typically involves:

1. Updating or extending the metadata (`dev/config/metadataStructure.json` via
   `npm run gen:metadata`).
2. Ensuring the SQL schema and seed exist under `dev/db/<dialect>/`.
3. Regenerating models/services/controllers/routes:
   `npm run gen:all`.
4. Validating that new endpoints appear in:
   - `backend/routes/**`
   - `docs/backend/generated/openapi/**`
5. Exercising the endpoints manually and via `npm run test:sql-injection`.

In V2.1 and later, additional validation and security checks will be enforced
based on ADR-0003.

---

## 8. Reporting issues and requesting changes

If you encounter:

- Generator inconsistencies
- Documentation gaps
- Security concerns (especially SQL-related)
- Problems with fresh clone → install → gen:all → dev:backend

please open an issue with:

- Your operating system and Node.js version
- Exact commands run
- Relevant console output (redacted if necessary)
- Any local changes (if not on a clean main branch)

---

## 9. License, contributions, and usage terms

This project uses a **dual-license model**:

- The default source license is **Business Source License 1.1 (BSL-1.1)**  
- A **Commercial License** is available for production / SaaS / hosted use cases  
- The code transitions to **MIT** automatically after the Change Date defined in `LICENSE.BSL-1.1`

By contributing to this repository you agree that:

1. Your contributions are provided under the same **dual-license model**
2. They may be distributed under:
   - **BSL-1.1** prior to the change date  
   - **MIT** after the change date  
   - or a **Commercial License** where applicable

If you intend to contribute code that must remain proprietary or separately licensed,  
please contact the maintainers **before submitting a PR**.

For full details, see:

- `LICENSE.BSL-1.1`
- `LICENSE.COMMERCIAL`

---

Thank you for helping improve **Fullstack Studio**.

---
