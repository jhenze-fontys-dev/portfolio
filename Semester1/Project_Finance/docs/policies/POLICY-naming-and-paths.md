# Policy — Naming and Paths

## Purpose

This policy establishes consistent naming and path conventions for the
project’s files, directories, and generated artifacts. The goal is to:

- make generated code predictable,
- keep the repository navigable,
- avoid collisions between handwritten and generated files.

## Scope

This policy applies to:

- Directory structure under `backend/` and `docs/backend/`
- File naming for models, services, controllers, routes, and OpenAPI
  artifacts
- Metadata keys that encode paths or names

It does **not** dictate variable names inside functions, except where
they directly represent metadata / entity concepts.

## General naming rules

1. **Project name**  
   - The product is branded as **Fullstack Studio**.
   - Use the full name “Fullstack Studio” in narrative docs.
   - Avoid abbreviations like “FS Studio” or “FSS” in user‑facing
     documentation.

2. **Source, dialect, and database names**  
   - Source types use lowercase, e.g. `sql`, `mqtt`, `httpapi`.
   - Dialects use lowercase, e.g. `sqlite`, `postgres`, `mysql`.
   - Database identifiers are represented as `<dbName>` placeholders in
     docs; concrete names are sample values (e.g. `fullstack_test`) and
     must be clearly labeled as examples.

3. **Entities and models**  
   - Entity names (tables/models) use PascalCase, e.g. `Users`,
     `TaskTags`.
   - Generated model filenames follow this pattern:

     ```text
     <dialect>.<dbName>.<Entity>.model.js
     ```

     Example:

     ```text
     sqlite.fullstack_test.Users.model.js
     ```

4. **Services**  
   - Service filenames mirror models:

     ```text
     <dialect>.<dbName>.<Entity>.service.js
     ```

5. **Controllers**  

   ```text
   <dialect>.<dbName>.<Entity>.controller.js
   ```

6. **Routes**  

   ```text
   <dialect>.<dbName>.<entity>.routes.js
   ```

   - Route filenames use lowerCamelCase for the final segment where
     appropriate (e.g. `taskTags.routes.js`), following the generator
     specification.

## Directory structure

Key backend directories:

```text
backend/
  config/
  data/
    sql/
      models/<dialect>/
      services/<dialect>/
  controllers/sql/<dialect>/
  routes/sql/<dialect>/
```

Key docs directories:

```text
docs/
  backend/
    generated/
      README.md
      openapi/
      api.md
      ...
    testing/
      README.md
      sqlscan/
    manual/
      README.md
```

Rules:

- Handwritten documentation lives under `docs/`, outside `generated/`.
- Generated docs and machine artifacts live under
  `docs/backend/generated/`.
- Testing artefacts (e.g. SQL injection reports) live under
  `docs/backend/testing/sqlscan/`.

## Path patterns for OpenAPI

OpenAPI outputs are written to:

```text
docs/backend/generated/openapi/
  openapi.manifest.json
  sql/
    sqlite.<dbName>.openapi.json
    postgres.<dbName>.openapi.json
```

Docs should use `<dbName>` as a placeholder, and sample values (like
`fullstack_test`) must be clearly identified as examples only.

## Reserved and generated folders

- Directories named `generated/` are reserved for generator outputs.
- Handwritten files must **not** be placed in `generated/` folders.
- Generators must not write into:
  - `docs/backend/manual/`
  - `docs/style/`
  - `docs/policies/`
  except where explicitly documented.

## Related documents

- `docs/policies/POLICY-generator-responsibilities.md`
- `docs/policies/POLICY-metadata-contract.md`
- `docs/backend/architecture/overview.md`
- `docs/backend/openapi.md`
