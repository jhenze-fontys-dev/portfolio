
# Fullstack Studio — Backend Generator Framework

[![License](https://img.shields.io/badge/license-BSL--1.1%20%2B%20Commercial-blue)]()
[![Status](https://img.shields.io/badge/version-2.0.0-green)]()
[![OpenAPI](https://img.shields.io/badge/openapi-generated-success)]()
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.x-brightgreen)]()

A professional, metadata‑driven backend template designed for scalable API projects.  
The project provides a **deterministic code‑generation pipeline** that produces database models, services, controllers, routes, and OpenAPI documentation — all from structured metadata.

This repository is built for **learning, experimentation, and real project scaffolding**, with a strong focus on:

- clean architecture & folder organization  
- reproducible generation (`gen:all`)  
- reset‑safe workflows  
- documentation‑first engineering  
- future‑ready extensibility (V2.1+ roadmap)

---

##  Features

- Metadata‑driven generators for backend artifacts  
- Deterministic output (`git clone → npm i → gen:all → dev`)  
- SQL dialect support (SQLite & PostgreSQL — extensible)  
- Reset tooling for generated code & databases  
- Internal documentation utilities (tree + path structure)  
- OpenAPI manifest + generated API documentation  
- Structured logging for generators, tools & testing  
- SQL‑Injection security test tool (reports stored in `/docs/backend/testing/sqlscan`)

---

## NPM Package

The `fullstack-studio` package name is currently reserved on npm.  
A minimal placeholder package is published while the first public
template release is under development.

You can already install it to verify the package and namespace:

```bash
npm install fullstack-studio
```

>  **Placeholder release:**  
> This version does not yet contain the Fullstack Studio framework or
> project template. A future release will provide the full development
> tooling and generated backend scaffolding.

---

## Repository Structure (High Level)

```
backend/        # Runtime API code
dev/            # Generators, tools, reset & testing utilities
docs/           # Documentation (human + generated)
frontend/       # Reserved for future UI/admin tooling
```

For a full up‑to‑date tree, see:
`docs/internal/treeStructure.md` and `docs/internal/pathStructure.md`

---

## Generator Pipeline (V2.0)

The backend is produced through a reproducible generation process:

```
npm run gen:metadata
npm run gen:env
npm run gen:sql-database
npm run gen:drivers
npm run gen:registry
npm run gen:models
npm run gen:services
npm run gen:controllers
npm run gen:routes
npm run gen:route-registry
npm run gen:openapi
```

Or simply:

```
npm run gen:all
```

Generated artifacts are clearly separated from handwritten code.

---

## Reset Tools

Reset generated artifacts:

```
npm run reset:generated
```

Reset database(s):

```
npm run reset:db
```

After reset, internal structure docs are refreshed automatically.

---

## Security & Testing

SQL‑Injection scanner tool:

```
npm run test:sql-injection
```

Reports are written to:

```
docs/backend/testing/sqlscan/
```

V2.1 roadmap strengthens validation at the **service layer** so invalid input
never reaches persistence.

See ADR‑0003 for details.

---

## Documentation

Primary documentation lives in:

```
docs/
 ├─ backend/
 ├─ internal/
 ├─ style/
 ├─ policies/
 ├─ decisions/
```

Professional developer docs include:

- Architecture overview
- Generator design & responsibilities
- Metadata contract
- Naming & path conventions
- ADR history
- OpenAPI workflow
- Contribution guidance

(These files are currently under development as part of “Doc Day”)

---

## Requirements

- Node.js ≥ 18
- npm
- SQLite (bundled)
- PostgreSQL (optional — only if configured in `.env`)

---

## Quick Start

```
git clone <repo>
cd fullstack-studio
npm install
npm run reset:db
npm run gen:all
npm run dev:backend
```

Backend runs at:

```
http://localhost:3000
```

Swagger / OpenAPI UI will be available if configured.

---

## Roadmap

- V2.1 — Service‑layer validation & security hardening
- V2.2 — Metadata‑aware DB discovery
- Future — Admin / frontend dashboard integration
- CI‑driven generation checks
- Automated documentation publishing

---

## Contributing

Contributions are welcome — improvements to:

- generators
- documentation
- testing tools
- architecture quality

…are especially encouraged.

Please read `CONTRIBUTING.md` for contribution guidelines.

---

## License

Fullstack Studio is released under a **dual-license model**:

- **Business Source License 1.1 (BSL-1.1)** — applies to current versions  
- **Automatic MIT conversion** after the Change Date (see `LICENSE.BSL-1.1`)
- **Commercial License** available for organizations who need immediate
  production or commercial usage — see `LICENSE.COMMERCIAL`

This approach allows:
- open development and collaboration
- protection during early-stage product evolution
- future transition to permissive MIT licensing

See the `LICENSE.*` files for full legal terms.

---

## Notes

This project is intentionally structured as a **learning‑grade professional codebase**.  
It demonstrates how real engineering workflows can be built around:

- generators
- documentation discipline
- testing automation
- consistency rules
- architectural evolution

The project will continue to evolve through structured ADRs and versioned milestones.
