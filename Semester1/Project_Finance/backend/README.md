# Backend Overview

The backend is structured as a **metadata‑driven, generator‑backed system**. Runtime code is intentionally lightweight — most structural elements are created from metadata and conventions.

This section explains:

- how the backend is organized
- how generated artifacts fit together
- how the system should be extended safely
- which guarantees are enforced by convention

## What Lives in the Backend

- API runtime (Express)
- database drivers and adapters
- generated CRUD surfaces
- validation + service logic (V2.1 expansion)
- OpenAPI generation
- reset / tooling support

See the next chapters for details:

- Architecture → `architecture.md`
- Generators → `generators.md`
- Data Sources → `sources.md`
