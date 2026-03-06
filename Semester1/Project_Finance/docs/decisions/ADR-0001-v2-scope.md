# ADR-0001: V2 Prep — Freeze Scope and Baseline

Status: Accepted

## Context
We are preparing a V2 cleanup (structure, generators, signatures, documentation).
To avoid regressions, we freeze a known-good baseline.

## Decision
The following baseline is locked for V2 preparation:

- `npm install`
- `npm run gen:all`
- `npm run dev:backend`

Expected result:
- Backend starts successfully
- Swagger UI is available at `/api-docs`

## Out of Scope (Phase 0)
- No folder moves or renames
- No generator or template changes
- No runtime behavior changes

## Rationale
Refactoring without a frozen baseline causes regressions.
This ADR defines the stable reference point.
