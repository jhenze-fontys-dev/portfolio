# CHANGELOG

Fullstack Studio • Version History

This project follows a simple, human-readable changelog format focused on clarity rather than automation.

---------------------------------------
2.0.0 — Structured Generator Release
---------------------------------------

Status: Finalized for initial public release

This is the first stable release of **Fullstack Studio** — a metadata-driven backend generation framework focused on structure, consistency, and repeatable architecture.

### Architecture & Generators

- Introduced metadata-driven backend generation
- Automatic creation of:
  - models
  - services
  - controllers
  - routes
  - SQL data layer drivers + registry
  - environment configuration
- OpenAPI generation pipeline added
- Shared generator logger introduced
- Reset tooling added for:
  - generated backend artifacts
  - development databases
- SQL injection testing utility added
- Internal documentation tools added:
  - treeStructure.md
  - pathStructure.md

### Documentation System

- Full documentation suite created under `docs/`
- Structured backend doc space:
  - `docs/backend/`
  - `docs/backend/architecture/`
  - `docs/backend/generated/`
  - `docs/backend/testing/`
- Policies and standards introduced in `docs/policies/`
- Documentation signature established for consistency
- Generated-docs structure defined:
  - `docs/backend/generated/README.md`
  - `openapi/` holds **artifacts only**
  - sqlscan reports remain in:
    - `docs/backend/testing/sqlscan/`
- Consolidated documentation review + cleanup completed

### Branding & Identity

- Project branding finalized as **Fullstack Studio**
- Repository naming and references aligned
- Branding signature added for future extensions

### Licensing Model

- Adopted **dual-license model**:
  - Business Source License 1.1 (BSL-1.1)
  - Commercial License for production / SaaS / hosted use
- Automatic transition to MIT after the defined change date
- CONTRIBUTING policy updated to reflect contributor licensing terms

### Frontend & Extensibility

- Added `frontend/` placeholder with scope definition
- Reserved future generator surfaces:
  - api.md / models.md / routes.md / services.md
  - MQTT and additional data-source expansion paths (planned)

### Stability & Cleanup

- Reset tooling aligned with final folder layout
- Generated paths and cleanup rules hardened
- Testing, docs, and paths made internally consistent

This release establishes the architectural foundation for future V2.1+ hardening and automation enhancements.

---------------------------------------
1.x — Early Prototypes
---------------------------------------

Status: Deprecated

- Experimental structure
- Hand-written routing and models
- Early SQL and generator experiments
- No unified logger or documentation architecture

These versions informed the design of 2.0.0 but should not be used.

---------------------------------------
Versioning Policy
---------------------------------------

This project uses semantic-style versioning:

MAJOR — structural or ecosystem changes  
MINOR — architecture or tooling improvements  
PATCH — bugfixes and behavior corrections  

---------------------------------------
End of changelog
---------------------------------------
