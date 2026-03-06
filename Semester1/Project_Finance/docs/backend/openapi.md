
# Backend OpenAPI — Generation and Usage

This document explains how OpenAPI specifications are generated, where they live
in the repository, and how they are used by tools such as the SQL‑injection test.

It follows the shared documentation signature defined in `docs/style/docs-signature.md`.

---

## 1. Purpose

The OpenAPI layer serves three roles:

- **Contract** — formal description of your HTTP API.
- **Source of truth** for tooling — test runners, clients, documentation.
- **Bridge** between metadata‑driven generators and external systems.

All OpenAPI artifacts are **generated**, not handwritten.

---

## 2. Where OpenAPI Files Live

Generated OpenAPI files are stored under:

```text
docs/backend/generated/openapi/
  openapi.manifest.json
  sql/
    sqlite.<dbName>.openapi.json
    postgres.<dbName>.openapi.json
```

- `<dbName>` is the database name for the source (for example `fullstack_test`
  in this template).  
- The `sql/` folder groups SQL‑driven APIs by dialect.

The `openapi.manifest.json` file is a **hub** that lists:

- which OpenAPI documents exist,
- their source keys (e.g. `sqlite.<dbName>`, `postgres.<dbName>`),
- their relative paths.

Tools should consult the manifest instead of hard‑coding paths.

---

## 3. How OpenAPI Is Generated

The generator:

```bash
npm run gen:openapi
```

runs `dev/generators/generate.openAPI.js`, which:

- reads metadata from `dev/config/metadataStructure.json`
- inspects configured SQL sources
- emits one OpenAPI document per SQL source into `docs/backend/generated/openapi/sql/`
- writes or updates `docs/backend/generated/openapi/openapi.manifest.json`

Typically, OpenAPI is also included in the full generation pipeline:

```bash
npm run gen:all
```

which ensures that models, services, controllers, routes, and OpenAPI stay in sync.

---

## 4. How Tools Use OpenAPI

Several tools rely on the generated OpenAPI layer, for example:

- **SQL Injection Test**  
  `dev/tools/testing/test.sqlInjection.js` reads:
  - `docs/backend/generated/openapi/openapi.manifest.json`
  - the specific `sqlite.<dbName>.openapi.json` / `postgres.<dbName>.openapi.json`
  to discover operations and parameters.

- **Future client generators** (V2.1+)  
  will be able to generate strongly‑typed clients from the same specs.

When adding new tools, prefer:

- reading the manifest
- resolving paths relative to it

rather than hard‑coding filenames.

---

## 5. Generated Docs vs. OpenAPI Artifacts

The folder:

```text
docs/backend/generated/
```

is the **root index** for all generated backend documentation artifacts.

Its structure is designed to be:

```text
docs/backend/generated/
  README.md          # static index for generated docs
  openapi/           # machine-readable OpenAPI artifacts only
    openapi.manifest.json
    sql/
      sqlite.<dbName>.openapi.json
      postgres.<dbName>.openapi.json
  sqlscan/           # JSON reports from SQL-injection tests
    sqlscan-*.json
  api.md             # (future) generated endpoint overview
  models.md          # (future) generated model overview
  routes.md          # (future) generated routes overview
  services.md        # (future) generated services overview
```

Important rules:

- `openapi/` contains **artifacts only** (JSON/YAML), no narrative docs.
- Human‑readable, generated documentation (e.g. `api.md`) lives alongside
  `openapi/` under `docs/backend/generated/`.
- Manual edits belong outside `generated/`, typically under:
  - `docs/backend/` (conceptual docs)
  - `docs/backend/manual/` (handwritten API notes, if needed)

---

## 6. Manual API Notes (Optional)

If you need handwritten API documentation that should **not** be overwritten,
use:

```text
docs/backend/manual/
  README.md      # placeholder, can be expanded as needed
  ...            # any other manual API docs
```

This keeps a clear separation:

- `docs/backend/generated/` → machine‑generated, safe to delete + regenerate
- `docs/backend/manual/`   → human‑maintained, never touched by generators

---

## 7. Future Work (V2.1+)

Planned enhancements include:

- a `generate.apiDocs.js` script that:
  - reads metadata + OpenAPI
  - writes `docs/backend/generated/api.md` and related summaries
- optional HTML rendering or a small docs UI
- stricter validation that generated routes and OpenAPI specs remain in sync

---

## 8. Related Documents

- `docs/backend/README.md` — backend overview  
- `docs/backend/generators.md` — generator responsibilities  
- `docs/backend/generated/README.md` — generated docs index  
- `docs/backend/testing/README.md` — SQL‑injection and other backend tests  
- `docs/style/docs-signature.md` — documentation style and rules  
