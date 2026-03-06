# Branding Signature — Fullstack Studio

This document defines the **official naming, tone, and brand-usage rules**
for the Fullstack Studio project.  
All documentation, tooling output, UI text and repository metadata must follow
these conventions unless explicitly stated otherwise.

This file is part of the shared documentation standards alongside
`docs-signature.md`.

---

## 1. Official Product Name

**Primary brand name**

Fullstack Studio

**Rules**

- Always capitalise: `Fullstack Studio`
- Do not write: `FullStackStudio`, `FullstackStudio`, `Full Stack Studio`,
  `Fullstack studio`, or `fullstack studio`
- Do not abbreviate as `FSS`, `FS Studio`, or `Studio`
- Never prefix with "The" — not: `The Fullstack Studio`

When referring to the project in text:

- ✓ “The Fullstack Studio project…”
- ✓ “Fullstack Studio generates…”
- ✗ “This tool (formerly Fullstack Template)…”
  — The old name should not appear in end-user docs.

---

## 2. Domain, Repository and Technical Names

The **brand name** is human-facing.  
Technical names may differ when necessary for compatibility or convention.

### 2.1 Domain

**Primary domain**

fullstackstudio.io


When referenced in documentation:

- Do not include `www.` unless context requires it.
- Write as inline text, not as an advertisement headline.

### 2.2 Repository & Package Identifiers

Allowed forms in code / package contexts:

- `fullstack-studio`
- `fullstack_studio`
- `fullstackstudio`

These are treated as **technical identifiers**, not brand expressions.

Do **not** mix casing such as `FullstackStudio` in identifiers.

---

## 3. Tone & Positioning

Fullstack Studio is positioned as:

- professional
- technical
- trustworthy
- engineering-focused

Avoid language that suggests:

- hobby tool
- personal experiment
- school project
- casual prototype

Prefer:

- “metadata-driven backend generation system”
- “structured developer tooling”

Avoid:

- “cool generator project”
- “fun playground”

---

## 4. Where Branding Applies

Brand rules apply to:

- documentation (all files under `docs/`)
- README files (root + internal)
- ADRs & architecture docs
- UI/log output visible to users
- generated documentation titles
- website and marketing pages

Brand rules do **not** restrict:

- internal code comments
- commit messages
- temporary developer notes

---

## 5. Legacy Name Policy

The former name **Fullstack Template**:

- must not appear in present-tense documentation
- may only appear in ADRs or migration notes when historically relevant
- must always be marked as **deprecated naming**

Example phrasing:

> “Prior to version 2.0, the project was called *Fullstack Template*.
> From 2.0 onward, the official name is **Fullstack Studio**.”

---

## 6. Future Extensions

If sub-brands are introduced (e.g., *Fullstack Studio Cloud*,
*Fullstack Studio CLI*) they must:

- inherit the same casing rules
- remain descriptive, not marketing-styled
- avoid acronym prefixes

Sub-brand examples (allowed):

- `Fullstack Studio CLI`
- `Fullstack Studio Core`

Not allowed:

- `FSX`
- `StudioX`
- `MetaStack`

---

## 7. Change Control

Branding rules may only be changed via:

- new ADR **or**
- explicit branding revision document

Informal edits are not allowed.

---

## 8. Status

Status: **Accepted & active**  
Applies from: **Version 2.0**

---
