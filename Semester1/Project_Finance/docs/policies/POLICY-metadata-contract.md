# Policy — Metadata Contract

## Purpose

This policy defines the contract for the project’s metadata layer,
primarily the structure and semantics of:

- `dev/config/metadataStructure.json`

The goal is to make metadata:

- the single source of truth for generators,
- stable and backwards compatible across versions,
- understandable for humans and safe to edit.

## Scope

This policy applies to:

- The shape and meaning of the metadata JSON files
- How generators use and trust metadata
- How changes to metadata are introduced and versioned

It does **not** define any particular domain model — only how that
model is expressed and consumed as metadata.

## Core principles

1. **Single source of truth**  
   - Metadata is the canonical definition of:
     - data sources,
     - entities (tables, models),
     - fields/columns,
     - relationships,
     - generated API surfaces.
   - No generator should hard‑code values that are already present in
     metadata.

2. **Human‑readable and diff‑friendly**  
   - Metadata must be structured so that diffs are meaningful.
   - Field and entity ordering should be stable where possible.
   - Naming and casing must follow the naming policy.

3. **Forward‑compatible design**  
   - New metadata fields should be added in a way that does not break
     older generators.
   - Deprecated fields should be clearly marked and only removed in a
     major version.

4. **Source‑agnostic abstraction**  
   - While metadata may include source‑specific details
     (e.g. `dialect`, connection hints), the core structure should work
     uniformly across SQL dialects and future sources (MQTT, HTTP APIs,
     etc.).

## Structure expectations

At a high level, `metadataStructure.json` is expected to contain:

- A list of **sources**:  
  `sql`, `mqtt`, `httpApi`, etc.

- For each source, one or more **dialects** / sub‑sources:  
  e.g. for `sql`:
  - `sqlite.<dbName>`
  - `postgres.<dbName>`

- For each dialect / database, a set of **entities**:  
  typically tables or views, e.g. `Users`, `Tasks`.

- For each entity:
  - fields (columns)
  - primary key definition
  - optional unique constraints
  - relationships (foreign keys)
  - flags or hints relevant for generation
    (e.g. read‑only, soft‑delete, audit logging).

Exact keys and shapes must be documented in a dedicated schema or
commented reference alongside the metadata file.

## Generator expectations

Generators that consume metadata must:

- Treat metadata as trustworthy but **validate** it before use
  (e.g. no missing primary keys, no unknown field types).
- Fail fast with a clear message if metadata violates the expected
  contract.
- Prefer lookups by key (e.g. `sourceKey`, `entityName`) instead of
  relying on numeric ordering.

Generators that produce or update metadata must:

- Preserve existing, valid structure where possible.
- Avoid destructive overwrites of human‑authored extensions.
- Emit logs describing any changes they apply.

## Changing the metadata contract

Any change that affects the contract must:

1. Be documented in a short ADR (e.g. `ADR-000x-metadata-change.md`).
2. Be reflected in this policy file (`POLICY-metadata-contract.md`).
3. Be reflected in generator docs (e.g. `docs/backend/generators.md`).

Breaking changes (e.g. renaming keys, removing fields) must be:

- released only in a new major version,
- accompanied by a migration note or script where feasible.

## Examples (illustrative only)

An example structure (simplified, not authoritative):

```jsonc
{
  "sources": {
    "sql": {
      "dialects": {
        "sqlite.<dbName>": {
          "entities": {
            "Users": {
              "fields": {
                "id": { "type": "integer", "primaryKey": true },
                "name": { "type": "string", "nullable": false }
              }
            }
          }
        }
      }
    }
  }
}
```

Actual keys, types, and nesting must follow the current implementation
and schema documented elsewhere in the project.

## Related documents

- `docs/policies/POLICY-generator-responsibilities.md`
- `docs/policies/POLICY-naming-and-paths.md`
- `docs/backend/generators.md`
- ADRs that mention metadata changes
