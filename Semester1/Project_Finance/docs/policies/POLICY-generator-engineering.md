# Generator Engineering Policy

Status: **Active**  
Applies to: `dev/generators/**`, `dev/templates/**`  
Last updated: 2025-12-14

## Purpose

Generators are part of the product. They must be predictable, repeatable, and safe to run on every machine and in CI. This policy defines the rules for how generators are written and how they evolve.

## Core principles

1. **Metadata is the single source of truth**
   - Only the metadata generator may introspect real sources directly.
   - All other generators (env, registry, models, services, controllers, routes, swagger, scanners) must consume `metadataStructure.json`.

2. **No “primary” source**
   - Multiple sources/dialects are equal citizens.
   - Generators must loop over `metadata.sources[]` and never assume a single database.

3. **Deterministic output**
   - Given the same inputs (`.env.startup`, metadata, templates), output must be identical.
   - Sorting rules are mandatory (tables, columns, files) to keep diffs stable.

4. **Generated files are disposable**
   - Every generated file must have an auto-generated header.
   - Manual edits to generated files are not supported.

5. **Separation of concerns**
   - One generator should have one responsibility and one output “domain”.
   - Templates must be dumb; logic belongs in generators.

## Error handling

### Strict mode
Generators must support a strict mode switch:

- `GEN_STRICT=true` → fail fast (exit non-zero) if any configured source cannot be introspected or written.
- `GEN_STRICT=false` (default) → allow partial output but log clearly.

### Logging
- Use consistent log prefixes: `[metadata]`, `[env]`, `[registry]`, etc.
- On failure, include:
  - sourceKey (e.g., `postgres.fullstack_test`)
  - the action that failed (connect, query, parse, write)
  - the exact command/tool invoked (sanitized)

## Metadata contract rules

### Defaults
Each column may contain:

- `defaultValue` — normalized value used by generators/services
- `defaultValueKind` — one of:
  - `none`, `scalar`, `literal_timestamp`, `token`, `generated`, `expression`, `source_defined`
- `defaultValueRaw` — source-native raw representation (for audit/debug only)

**Hard rule:** downstream code must never use `defaultValueRaw` for runtime logic.

### Identity / auto-generation
- Postgres identity columns must be classified as `defaultValueKind: "generated"` even when `column_default` is NULL.
- SQLite `INTEGER PRIMARY KEY` must be classified as `generated` even when `dflt_value` is NULL.
- MySQL/MariaDB `AUTO_INCREMENT` must be classified as `generated` (when implemented).

## Dialect adapter pattern

When adding a new SQL dialect, implement it as an adapter:

- `introspect<dialect>()` → returns `{ entities: [...] }`
- `classifyDefaultValue<dialect>()` → returns `{ defaultValue, defaultValueKind, defaultValueRaw }`

Then register it in a local map:

- `SQL_DIALECTS = { sqlite, postgres, mysql, mariadb }`

This avoids `if/else` growth.

## Template rules

- Templates must be “presentation only”.
- Prefer passing precomputed values to templates.
- Avoid complex conditionals in templates; handle branching in generators.
- Triple-mustache (`{{{ }}}`) may only be used for code-safe, generator-controlled strings.

## File naming & output layout

- Outputs must match the agreed multi-source path strategy:
  - `<dialect>/<databaseName>.<entity>.<type>.js`
- Generators must create required folders and never assume they exist.

## Change management

- Any breaking metadata contract change requires:
  - incrementing `metadata.version`
  - a migration note in docs (`docs/changelog.md` or `docs/policies/metadata-contract.md`)

## Checklist for new/updated generators

- [ ] Reads inputs only from `.env.startup` and metadata (except metadata generator itself)
- [ ] Deterministic ordering (stable diffs)
- [ ] Clear logs + strict mode support
- [ ] No hardcoded paths; uses projectRoot + env + metadata
- [ ] Does not introduce “primary” source assumptions
