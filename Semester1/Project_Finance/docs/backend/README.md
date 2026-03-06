
# Backend Documentation — Overview

## Purpose

This section documents the **backend runtime and generator-driven architecture** of the Fullstack Studio project. It explains how the backend is structured, how generated artifacts are produced, and how developers should extend or maintain backend functionality in a consistent and reliable way.

This documentation is intended for:
- Developers working on backend runtime code
- Contributors modifying or extending generators
- Reviewers validating structure, conventions, or outputs

## Scope of this documentation

This backend documentation covers:

- Runtime structure and folder layout
- Data source and SQL backend architecture
- Code‑generation pipeline (models, services, controllers, routes)
- OpenAPI generation and serving
- Testing and reset tooling (high‑level overview)
- Conventions, naming rules, and responsibilities

It does **not** cover:

- Frontend runtime or UI architecture
- Business‑domain specifications
- DevOps or deployment workflows
- Database design theory (only implementation‑relevant aspects)

## Relationship to other documentation

| Area | Purpose |
|------|--------|
| Root README | High‑level project overview |
| docs/internal | Generated structure views (tree + paths) |
| docs/backend/architecture | Deep‑dive architectural explanations |
| docs/backend/testing | Backend testing & verification tools |
| docs/style | Code + documentation conventions |

The backend README acts as **the entry point** for backend‑specific documentation.

## How the backend is organized

The backend follows a **source‑first, generator‑driven structure**:

- Hand‑written framework + infrastructure code lives in `backend/`
- Metadata and templates live in `dev/`
- Generators output runtime artifacts into structured locations
- Reset tools safely remove generated outputs
- OpenAPI artifacts are generated and stored under documentation paths

A detailed explanation of the structure is available in:

> `docs/backend/architecture/overview.md`

## Contribution expectations

Changes to the backend must respect:

- The generator responsibility model
- Code‑signature conventions
- Naming and path consistency rules
- Documentation alignment

When modifying behavior, prefer:

1. Updating metadata or templates
2. Regenerating artifacts
3. Validating outputs and updating documentation if needed

Manual edits to generated files are **not allowed**.

## Next steps

Continue reading to explore backend internals:

- Architecture overview — `docs/backend/architecture/overview.md`
- Generators — `docs/backend/generators.md`
- OpenAPI — `docs/backend/openapi.md`
- Testing — `docs/backend/testing/README.md`
