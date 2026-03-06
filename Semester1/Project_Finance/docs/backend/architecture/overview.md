
# Backend Architecture — Overview

## Purpose

This document explains the backend architecture of the Fullstack Studio project. It focuses on how metadata, generators, runtime code, and developer tools work together to produce a consistent, scalable backend.

This document follows the project documentation signature guidelines.

---

## High-Level Architecture

The backend is built around a **generator‑driven pipeline**. Instead of writing models, services, controllers, and routes manually, these components are generated from metadata and database sources.

At a high level:

1. Metadata + database structure define the source of truth
2. Generators transform metadata into runtime code
3. The backend executes only generated + handwritten supporting code
4. Documentation and tools are aligned with the same structure

This approach ensures:

- Consistency across all entities and dialects
- Ability to regenerate safely
- Predictable structure for scaling
- Separation of handwritten vs generated artifacts

---

## Core Components

### 1) Metadata Layer

The metadata layer describes:

- Entities
- Fields
- Relations
- Dialects
- Source configuration

Metadata is used by generators to create runtime code.

> In V2.1 and beyond, metadata becomes the source of validation rules as well.

---

### 2) Generator Layer

Generators live in:

`dev/generators/`

They are responsible for creating:

- Models
- Services
- Controllers
- Routes
- SQL adapters
- Environment and registry wiring
- OpenAPI documentation artifacts

Generators follow:

- Code signature rules
- Logging conventions
- Deterministic output expectations

Generators produce **generated files that must NOT be edited manually**.

---

### 3) Runtime Layer (Backend Code)

Generated runtime code lives in:

- `backend/data/`
- `backend/controllers/`
- `backend/routes/`

Supporting handwritten runtime code lives alongside, but never mixed with generated files.

Runtime responsibilities include:

- Database connectivity
- Request handling
- Business logic (when present)
- Service orchestration
- OpenAPI serving

---

### 4) Documentation & Testing Layer

Related components include:

- OpenAPI output under `docs/backend/generated/openapi/`
- SQL‑injection testing tools
- Internal docs such as tree and path maps
- ADRs and architecture references

The documentation system is designed to match:

- Generator output
- Runtime structure
- Reset & regeneration flows

---

## Execution & Lifecycle

### Development Flow

1. Reset generated artifacts (optional)
2. Run generators
3. Run backend
4. Optionally run testing tools
5. Commit only handwritten + generated results

### Reset & Regenerate

- Reset tools remove generated artifacts
- Generators rebuild them deterministically
- Documentation tools update structural views

This guarantees reproducibility and consistency.

---

## Design Principles

The backend architecture is guided by:

- Deterministic generation over manual duplication
- Metadata as system truth
- Clear boundaries between:
  - handwritten code
  - generated code
  - runtime artifacts
- Tooling that reinforces structure
- Security and validation advancement in V2.1+

---

## Roadmap Notes

V2.1 introduces:

- Service‑layer validation derived from metadata
- Stronger reset + tooling architecture
- Testing tools aligned with OpenAPI

Future directions include:

- Multi‑source database awareness
- Schema‑driven documentation extension
- Frontend admin alignment

---

## Related Documents

- `docs/backend/README.md`
- `docs/backend/generators.md`
- `docs/backend/openapi.md`
- ADR‑0003 (V2.1 Scope)

---

## Status

This architecture description reflects the current validated design as of V2.0 — with forward‑looking notes for V2.1 evolution.
