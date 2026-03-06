# Policy — Generator Responsibilities

## Purpose

This policy defines what project generators are allowed to do, what they
must do, and what they must *never* do. It keeps the code-generation
layer predictable, safe, and easy to extend.

The rules in this document apply to all handwritten generator scripts
under `dev/generators/` and `dev/tools/` that write or modify project
files.

## Scope

This policy covers:

- Handwritten generators (e.g. `generate.*.js`)
- Support tools that behave like generators (e.g. doc tools, reset tools)
- The shared `createStepLogger` logging utility
- All generated outputs under:
  - `backend/`
  - `docs/backend/generated/`
  - other future `generated` folders

It does **not** cover:

- Runtime application behavior (Express handlers, services)
- External tools executed via CLI (SQLite, Postgres, etc.) — though
  generators that invoke them must still follow this policy.

## Core principles

1. **Single source of truth**  
   - Generators must treat the metadata and configuration files
     (e.g. `dev/config/metadataStructure.json`, `.env`) as the source
     of truth.
   - Generators must not hard‑code database table names, column names,
     or routes that are already defined in metadata.

2. **Deterministic output**  
   - Given the same inputs (metadata, templates, configuration),
     generators must produce the same outputs.
   - No random values, timestamps, or machine-specific paths may be
     baked into generated code or docs.

3. **Clear ownership of files**  
   - Every generated file must be clearly marked as such in its header.
   - No generator may overwrite a handwritten file unless explicitly
     documented in that file’s header and in the generator’s docs.
   - Handwritten and generated files should never be mixed in the same
     directory unless there is a clear, documented contract.

4. **Controlled side effects**  
   - Generators may only write within the directories that are part of
     the documented generation contract, such as:
     - `backend/data/sql/**`
     - `backend/controllers/**`
     - `backend/routes/**`
     - `docs/backend/generated/**`
   - Generators must **not** write to arbitrary locations such as:
     - project root (except explicitly documented cases)
     - `node_modules/`
     - `docs/backend/manual/`
     - `docs/style/`, `docs/policies/`, etc.

5. **No hidden runtime behavior**  
   - Generators must not start servers, open network ports, or run
     long‑lived background processes.
   - Short CLI calls (e.g. `sqlite3`, `psql`) are allowed when necessary
     for reset or introspection, but must be clearly logged and must
     fail fast.

6. **Consistent logging**  
   - All generators must use the shared `createStepLogger` utility.
   - Allowed log actions:
     - `create` — file created
     - `update` — file changed in-place
     - `delete` — file removed
     - `rmdir` — directory removed
     - `run` — external command executed
     - `report` — report or index written
   - `write` should not be used as a generic stand‑in for other actions.

## Responsibilities by generator type

### Metadata / configuration generators

Examples: `generate.metadataStructure.js`, `generate.env.js`

- Must read the current project state (e.g. SQL schema, configured
  sources).
- Must write stable, human‑readable configuration files.
- Must fail clearly if required inputs (DB, environment variables) are
  unavailable.

### Code generators (models, services, controllers, routes)

- Must derive all names, paths, and relationships from metadata.
- Must apply the shared code‑signature (headers, imports, structure).
- Must never embed environment‑specific details (ports, credentials).
- Must not implement business logic — only mechanical plumbing:
  - mapping HTTP → service methods
  - mapping service methods → data access
  - mapping models to table definitions

### Documentation generators

Examples: `generate.openAPI.js`, future `generate.apiDocs.js`

- Must not overwrite manual documentation outside the `generated`
  folders.
- Must produce outputs that match the live API surface:
  - controllers and routes must be aligned with OpenAPI.
- Where possible, documentation generators should be **read‑only**
  with respect to runtime code: they read code/metadata but do not
  modify it.

### Reset / maintenance tools

Examples: `reset.generated.js`, `reset.db.js`

- Must be clearly labeled as **destructive** tools.
- Must only delete artifacts that are safely regenerated.
- Must never delete user data or handwritten files.
- Should log all destructive actions via the shared logger.

## Failure behavior

- Generators must fail fast with a clear error message if required
  inputs are missing or inconsistent.
- Partial writes should be avoided; when unavoidable, the logs must
  make the state of the system unambiguous.
- Generators must exit with a non‑zero process code on failure.

## Related documents

- `docs/style/code-signature.md`
- `docs/style/docs-signature.md`
- `docs/policies/POLICY-metadata-contract.md`
- `docs/policies/POLICY-naming-and-paths.md`
