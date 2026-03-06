# Code Signature Standard (V2)

This document defines the **designer signature** for this repository:
how files identify themselves, how comments are written, and how consistency is enforced across handwritten code, generated code, and non-commentable artifacts.

This standard is **evidence-based**: it formalizes patterns already present in the codebase and removes accidental drift.

---

## 1. File classification (fundamental rule)

Every file in this repository belongs to **exactly one** of these categories:

1. **AUTO-GENERATED OUTPUT**
   - Overwritten by `npm run gen:*`
   - Derived from templates under `dev/templates/`
   - Examples: models, services, controllers, routes, registries, generated runtime modules

2. **HANDWRITTEN CODE**
   - Authored and maintained manually
   - Never overwritten by generators
   - Owns runtime behavior or system wiring
   - Examples: `server.js`, `swagger.js`, bootstrap code

3. **GENERATOR SCRIPTS**
   - Handwritten developer tooling
   - Invoked via `npm run gen:*`
   - Responsible for producing generated outputs
   - Examples: files under `dev/generators/`

4. **NON-COMMENT FILES**
   - Formats that do not support comments
   - Examples: JSON, `.env`, lock files

Rules for each category are defined below.

---

## 2. AUTO-GENERATED OUTPUT (JavaScript)

### 2.1 Header block (REQUIRED)

Every auto-generated JavaScript file **MUST** start with this header block:

```js
// -----------------------------------------------------------------------------
// AUTO-GENERATED FILE — DO NOT EDIT
//
// File       : <relative/path/from/repo/root>
// Generator  : <dev/generators/…>
// Template   : <dev/templates/…>
// Notes      : <purpose / constraints / guarantees>
//
// Source     : <sourceType> | <sourceKey>        (if applicable)
// Entity     : <EntityName>                       (if applicable)
//
// This file is auto-generated. Any manual changes will be overwritten.
// -----------------------------------------------------------------------------
```

**Rules**
- `File`, `Generator`, `Template`, and `Notes` are **always required**
- `Source` and `Entity` are included **only when meaningful**
- The wording **“AUTO-GENERATED” is reserved for outputs only**
- No timestamps are allowed in generated source files

---

### 2.2 Footer block (REQUIRED)

Every auto-generated JavaScript file **MUST** end with a footer:

```js
// -----------------------------------------------------------------------------
// End of auto-generated <artifact-type> for <EntityName or Purpose>
// -----------------------------------------------------------------------------
```

Examples:
- `End of auto-generated model for Projects`
- `End of auto-generated service for Users`
- `End of auto-generated route registry`

---

## 3. HANDWRITTEN RUNTIME CODE (JavaScript)

### 3.1 Header block (STANDARDIZED)

Handwritten runtime files **SHOULD** use this header block:

```js
// -----------------------------------------------------------------------------
// HANDWRITTEN FILE
//
// File  : <relative/path/from/repo/root>
// Notes : <what this file owns / why it exists>
// -----------------------------------------------------------------------------
```

Guidelines:
- Required for core system files
- Optional for small helpers

---

### 3.2 Footer block (REQUIRED)

All handwritten runtime JavaScript files **MUST** end with a footer block:

```js
// -----------------------------------------------------------------------------
// End of handwritten file: <short file identifier>
// -----------------------------------------------------------------------------
```

---

## 4. GENERATOR SCRIPTS (JavaScript)

### 4.1 Header block (REQUIRED)

Generator scripts **MUST** use this header block:

```js
// -----------------------------------------------------------------------------
// HANDWRITTEN GENERATOR SCRIPT
//
// File       : <relative/path/from/repo/root>
// Purpose    : <what this generator produces>
// Writes     : <files / folders written>
// Reads      : <inputs: metadata, templates, env>
// Notes      : <generator-specific invariants>
// -----------------------------------------------------------------------------
```

Rules:
- Generator scripts are handwritten tooling
- Do **not** use “AUTO-GENERATED” wording
- Notes must be generator-specific (no global rules)

---

### 4.2 Footer block (REQUIRED)

Every generator script **MUST** end with this footer:

```js
// -----------------------------------------------------------------------------
// End of generator script: <generator-name>
// -----------------------------------------------------------------------------
```

---

## 5. Comment policy (GLOBAL)

Comments must explain **why**, not **what**.

**Allowed:**
- invariants
- contracts
- ordering constraints
- edge cases
- environment assumptions

**Not allowed:**
- dated change notes
- migration history
- TODOs without context

History belongs in:
- ADRs
- Git commits
- CHANGELOG

---

## 6. Logging vocabulary (generators)

Generators SHOULD use a consistent key vocabulary:

```
generator
template
output
sources
dialects
source
write
result
```

Result values:
- `success`
- `skipped`
- `failed`

---

## 7. NON-COMMENT FILES (JSON, .env, lock files)

These files cannot carry a code signature internally.

Signature is defined by:
- folder semantics
- generator ownership
- deterministic structure
- documentation

Rules:
- No comments inside
- No timestamps
- Deterministic ordering preferred

---

## 8. Timestamp policy (GLOBAL)

- **No timestamps** in generated source files
- Allowed only in logs and manifests

---

## 9. Summary

This repository’s signature is defined by:
- consistent banner headers
- clear ownership by file category
- invariant-focused comments
- deterministic output
- history outside code

This document is the **single source of truth** for that signature.


### Comment accuracy rule (HANDWRITTEN CODE)

Comments in handwritten runtime files MUST describe capabilities and contracts,
not concrete generated instances.

Avoid:
- listing specific generated filenames
- implying fixed source keys or dialects
- asserting architectural ownership that is still an open decision (ADR Draft)

Prefer:
- wildcard or placeholder notation (e.g. `<sourceKey>`)
- capability-based descriptions (e.g. “serves generated OpenAPI artifacts”)
- neutral wording when responsibility may evolve