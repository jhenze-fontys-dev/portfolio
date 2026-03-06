
# Documentation — Index

This project uses a structured documentation workspace located in the `docs/` directory. 
The purpose of this index is to provide a single, high‑level entry point to all available documentation resources.

All documents in this folder follow the **Documentation Signature** guidelines defined in `docs/style/docs-signature.md`.

---

## Purpose of the Documentation Space

The documentation in this project is designed to:

- Support onboarding for new contributors
- Provide architectural insight for developers and reviewers
- Explain how code generation, back‑end structure, and tools work
- Serve as a long‑term reference for decisions and conventions
- Remain compatible across GitHub and future admin / documentation UI integrations

This directory intentionally separates **project documentation** from code, to keep the repository clean and maintainable.

---

## Structure of This Folder

The documentation workspace is organized into thematic areas.

### Backend Documentation

Located in `docs/backend/`

Covers everything related to the back‑end platform, including:

- Architecture and design concepts
- Generator system and responsibilities
- OpenAPI / API specification
- Testing and validation utilities

A dedicated index exists at:

`docs/backend/README.md`

---

### Decisions and Architecture Records

Located in `docs/decisions/`

Contains ADRs (Architectural Decision Records) documenting:
- Why structural and architectural choices were made
- Alternatives that were considered
- Long‑term technical direction

ADRs are treated as **permanent historical records**.

---

### Internal Structure Documentation

Located in `docs/internal/`

Contains generated introspection documents, including:

- `treeStructure.md`
- `pathStructure.md`

These files reflect the current repository structure and are refreshed automatically by tooling.

---

### Policies and Standards

Located in `docs/policies/`

These documents define the rules that govern the project architecture and tooling, including:

- Naming and path conventions
- Generator responsibility boundaries
- Metadata structure and validation expectations
- Normalization and structure requirements

Policies guide how new code, generators, and tools must be designed to remain consistent with the template.

---

### Style & Templates

Located in `docs/style/`

Contains standard authoring templates and guidelines, including:

- Documentation signature
- Formatting conventions
- Base templates for new documents

These ensure that documentation remains consistent across the project.

---

## How to Contribute to Documentation

Documentation is treated as a **first‑class part of the project**.

When adding or updating documentation:

1. Follow the rules in `docs/style/docs-signature.md`
2. Keep tone professional, neutral, and technical
3. Prefer clarity over decoration or visual noise
4. Document **why**, not just **how**
5. Avoid duplication — link to sources when possible

Future versions of the project will include tooling to assist with structured documentation generation.

---

## Status of Documentation

This documentation set is evolving. Some documents are static, while others will later be generated dynamically based on metadata or system introspection.

Documents currently prioritized include:

- Backend architecture overview
- Generator system explanation
- Testing documentation
- OpenAPI documentation overview

Additional documentation areas may be added as the project expands.

---

## Next Steps

If you are exploring this repository for the first time, a recommended reading path is:

1) `docs/backend/README.md`
2) `docs/backend/architecture/overview.md`
3) `docs/backend/generators.md`

These provide the best orientation for understanding the platform.

---
