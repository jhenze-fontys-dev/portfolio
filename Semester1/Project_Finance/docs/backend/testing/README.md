
# Backend Testing — Overview

This document describes how backend testing works in the template, what tools exist,
and how to run them in a consistent, repeatable way.

It follows the shared documentation signature defined in `docs/style/docs-signature.md`.

---

## 1. Purpose

The goal of the backend testing setup is to:

- give you fast feedback while developing
- catch security and data‑integrity regressions early
- keep the project safe to evolve while generators grow more powerful

The focus in V2.0 is on:

- database reset tooling (`reset:db`)
- SQL‑injection testing against real running endpoints (`test:sql-injection`)

Higher‑level tests (contract tests, integration suites, etc.) can be added on top.

---

## 2. Types of Backend Tests

At a high level, the backend can support several types of tests:

1. **Smoke tests**  
   - Simple checks that the server starts and basic endpoints respond.
   - Good for CI “is the build alive?” checks.

2. **Contract / API tests**  
   - Validate that responses conform to the OpenAPI specification.
   - Ensure breaking changes are detected before deployment.

3. **Security tests**  
   - SQL‑injection checks (current focus in this template).
   - Later: auth / authorization behavior, rate‑limiting, etc.

4. **Data‑integrity tests**  
   - Verify constraints, relationships, and seed data consistency across dialects.

V2.0 ships with a specialized **SQL Injection Test** CLI, described below.

---

## 3. Database Reset for Tests

Before running any meaningful backend tests, you typically want a known database state.

The command:

```bash
npm run reset:db
```

will:

- remove and recreate the SQLite DB (`backend/data/sql/data.db`)
- recreate and reseed the Postgres DB (`<dbName>`, e.g. `fullstack_test`)  
  using the credentials from `.env`
- log the operations using the shared generator logger

This ensures that subsequent tests see **predictable data** and **schema**.

> The DB names and credentials are configured via `.env`.  
> The example database name in this template is `fullstack_test`; in your own
> project this will match your configured `<dbName>`.

---

## 4. SQL Injection Test (CLI)

The core security‑focused tool is:

```bash
npm run test:sql-injection
```

This runs `dev/tools/testing/test.sqlInjection.js`, which:

- reads the generated OpenAPI manifest from  
  `docs/backend/generated/openapi/openapi.manifest.json`
- discovers SQL‑backed endpoints and HTTP operations
- sends crafted “suspicious” inputs to those endpoints
- records how the API responds (status codes, error messages, etc.)
- writes a JSON report into `docs/backend/generated/sqlscan/`

Key behaviors:

- It does **not** attempt to exploit the database; it focuses on how the API
  validates and rejects dangerous input.
- It can be run locally or in CI against a running backend.

---

## 5. How to Run the SQL Injection Test

1. Ensure the backend is running (in another terminal):

   ```bash
   npm run dev:backend
   ```

2. Ensure OpenAPI documents are generated:

   ```bash
   npm run gen:all
   ```

3. Run the test:

   ```bash
   npm run test:sql-injection
   ```

   Optionally, you can override the base URL:

   ```bash
   npm run test:sql-injection -- --baseUrl=http://localhost:3000
   ```

---

## 6. Where Results Are Stored

SQL‑injection test results are written under:

```text
docs/backend/generated/sqlscan/
  index.json                  # overview of all runs
  sqlscan-<timestamp>.json    # detailed report per run
```

Each `sqlscan-*.json` file contains:

- which operations were tested
- which inputs were used
- which responses came back
- how many findings were classified as potential issues

These reports are meant to be:

- human‑inspectable (for security review)
- machine‑readable (for CI dashboards or future visual tools)

---

## 7. Interpreting SQL‑Injection Findings

The SQL‑injection tester will:

- record all requests and responses
- highlight combinations that look suspicious, e.g.:
  - 500‑class errors for malformed IDs
  - inconsistent validation between similar endpoints
  - error messages that expose internal details

For **generated service methods**, V2.1 will introduce stricter input validation
so that invalid values are rejected **before** they reach the database layer.

For now, when reviewing findings:

- treat any 500 status code as a bug to be investigated
- treat any “raw SQL error” message as a security risk
- aim for consistent 4xx responses with clear, generic error messages

---

## 8. Future Work (Planned for V2.1+)

Planned enhancements include:

- metadata‑driven input validation in services
- richer classification of findings (severity, endpoint grouping)
- optional HTML / Markdown reports generated from `sqlscan-*.json`
- wiring into CI pipelines as a required safety gate

---

## 9. Related Documents

- `docs/backend/README.md` — backend overview  
- `docs/backend/openapi.md` — how OpenAPI is generated and used  
- `docs/backend/generated/README.md` — index of generated backend docs  
- `docs/style/docs-signature.md` — documentation style and rules  
