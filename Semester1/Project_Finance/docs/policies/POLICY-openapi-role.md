# Policy — OpenAPI Role and Responsibilities

## Purpose

This policy defines the role of OpenAPI within the Fullstack Studio
project and how it interacts with:

- generators,
- controllers and routes,
- testing tools,
- documentation.

The goal is to make OpenAPI a reliable, central contract for the
backend HTTP API.

## Scope

This policy applies to:

- Generated OpenAPI artifacts under `docs/backend/generated/openapi/`
- Generators that produce or consume OpenAPI
- Tools that validate behavior against OpenAPI (e.g. testing tools)

It does **not** prescribe every detail of the HTTP API design, but
rather how OpenAPI is used to represent and enforce that design.

## OpenAPI as the API contract

1. **Single contract for HTTP APIs**  
   - For each HTTP‑exposed backend, there must be a corresponding
     OpenAPI description.
   - Controllers and routes must match the documented paths, methods,
     and parameter shapes, or the documentation and code must be
     brought back into alignment.

2. **Generated, not handwritten**  
   - OpenAPI JSON files are generated artifacts and live under:

     ```text
     docs/backend/generated/openapi/
       openapi.manifest.json
       sql/
         sqlite.<dbName>.openapi.json
         postgres.<dbName>.openapi.json
     ```

   - These files must **not** be hand‑edited.

3. **Manual docs live elsewhere**  
   - Any handwritten API descriptions, guides, or tutorials belong in
     `docs/backend/` or `docs/backend/manual/`, not inside
     `generated/openapi/`.

## Responsibilities of OpenAPI generators

Generators that produce OpenAPI must:

- Read from the same metadata that powers models, services, and routes.
- Represent all public HTTP endpoints accurately (paths, methods,
  parameters, schemas, status codes).
- Produce stable, deterministic output.
- Include enough information for downstream tools (test generators,
  documentation generators) to operate.

When the API surface changes (new routes, new entities, etc.), the
OpenAPI generator must be rerun so that the contract remains current.

## Consumers of OpenAPI

Several tools and features depend on OpenAPI, including but not limited
to:

1. **Documentation generators (future)**  
   - A future `generate.apiDocs.js` may consume OpenAPI and write
     human‑readable `api.md` under `docs/backend/generated/`.
   - This doc will present endpoints in a way that is easy for humans
     to scan while still staying in sync with the machine artifacts.

2. **Testing tools**  
   - SQL‑injection and other security tests may use OpenAPI to discover
     all endpoints and parameters.
   - These tools validate that the implementation is robust against
     malformed input and aligns with the contract.

3. **Client generators (future)**  
   - OpenAPI can be used to generate client SDKs or type definitions
     for frontend projects or external consumers.

## Location and structure

Generated OpenAPI lives exclusively under:

```text
docs/backend/generated/openapi/
```

Human‑readable, generated docs live at:

```text
docs/backend/generated/api.md
```

(plus future `models.md`, `routes.md`, `services.md` as needed).

Manual or conceptual docs live under:

```text
docs/backend/
docs/backend/manual/
```

SQL‑injection and other test artefacts live under:

```text
docs/backend/testing/sqlscan/
```

This separation ensures that:

- generated artefacts can be safely deleted and recreated,
- handwritten docs are never overwritten by generators,
- test artefacts stay grouped with other testing resources.

## Keeping OpenAPI in sync

Changes that affect the HTTP API surface (new routes, parameters,
status codes, or entities) must be accompanied by:

1. Generating updated backend code (models, services, controllers,
   routes), and
2. Regenerating OpenAPI via the appropriate generator script.

Teams should treat “OpenAPI is up to date” as a requirement for
releasing backend changes.

## Related documents

- `docs/backend/openapi.md`
- `docs/backend/generated/README.md`
- `docs/backend/testing/README.md`
- `docs/policies/POLICY-generator-responsibilities.md`
- `docs/policies/POLICY-naming-and-paths.md`
