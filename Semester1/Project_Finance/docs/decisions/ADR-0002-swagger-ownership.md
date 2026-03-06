# ADR-0002: Swagger ownership (current baseline)

Status: Draft

## Context
At the Phase 0 baseline, Swagger UI loads and OpenAPI JSON is served from generated output.

## Current baseline behavior (AS-IS)
- Backend starts via `npm run dev:backend`
- Swagger UI loads at `/api-docs`
- OpenAPI JSON files are served at `/openapi/*`
- A manifest file exists at: `/openapi/openapi.manifest.json`

## Current baseline implementation (AS-IS)
- Swagger UI wiring is implemented in: backend/server.js
- backend/swagger.js exists in the repo, but is not the canonical path in the baseline (yet)

## Goal for Phase 1+
Make Swagger UI a router module (swagger.js) that server.js mounts in dev only,
WITHOUT changing any routes or URLs.
