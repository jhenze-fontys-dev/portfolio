# POLICY: Default Data Normalization

## Status
**Active**

## Scope
This policy applies to **all data sources**, including but not limited to:

- SQL databases (SQLite, PostgreSQL, MySQL, MariaDB)
- JSON files
- External APIs
- MQTT streams
- Any future data source added to the system

---

## Purpose

This project supports **multiple data sources and multiple dialects simultaneously**.  
Different sources often represent the same logical data in different physical formats.

Without explicit normalization rules, this leads to:
- source-specific logic leaking into controllers
- inconsistent API responses
- hard-to-diagnose bugs
- increased complexity when adding new sources

This policy defines **where and how normalization must occur** to ensure consistency across the system.

---

## Core Rule

> **All data returned by services MUST be normalized to a canonical format before being exposed to controllers or APIs.**

Normalization is **mandatory**, not optional.

---

## Responsibility Boundaries

### Models
- Models are **descriptive only**
- Models describe:
  - entity names
  - column names
  - types as reported by the source
- Models **MUST NOT**:
  - transform values
  - normalize formats
  - apply business logic

### Services
- Services are **responsible for normalization**
- Services **MUST**:
  - convert source-specific representations into canonical formats
  - ensure consistent output regardless of source or dialect

### Controllers
- Controllers **MUST assume normalized data**
- Controllers **MUST NOT**:
  - inspect dialects
  - apply formatting rules
  - perform normalization

---

## Canonical Data Formats

Unless explicitly stated otherwise by a future policy:

### Timestamps & Dates
- **Canonical format:** ISO 8601 string  
  Example:
  ```
  2025-01-01T12:00:00Z
  ```

### Booleans
- **Canonical format:** `true` / `false`
- Integer-based booleans (`0` / `1`) **MUST be converted**.

### Null / Empty Values
- **Canonical format:** `null`
- Magic values (e.g. empty strings, `-1`, `"N/A"`) **MUST NOT propagate** beyond the service layer.

### Identifiers
- Identifiers **MUST be consistent per entity**
- The chosen representation (string or number) must be applied uniformly per entity.

---

## Rationale

This policy ensures that:
- Adding a new SQL dialect does not affect controllers
- Adding non-SQL sources does not introduce special cases
- API responses remain stable over time
- Security tooling can rely on predictable data shapes

---

## Non-Compliance

Code that violates this policy:
- may appear to work initially
- will cause architectural drift over time
- is considered **incorrect by design**

Violations should be fixed at the **service layer**, not worked around elsewhere.

---

## Related Documents

- POLICY-metadata-contract.md
- POLICY-openapi-role.md
- ADR-002-metadata-source-of-truth.md
- ADR-001-no-primary-source.md

---

## Change Log
- Initial version created to formalize normalization rules for a multi-source backend.
