
# Documentation Style Guide

## Purpose

This document defines the writing and formatting standards used across the project documentation. The goal is to ensure clarity, consistency, and long‑term maintainability.

All documentation must follow these rules unless explicitly overridden for a valid technical reason.

---

## Scope

These conventions apply to:

- Project documentation under `docs/`
- Backend and tooling reference material
- Generated technical reference content
- Contributor documentation

They do not apply to README files authored by users inside their own projects.

---

## Writing Style

### Tone

Documentation must be:

- Clear and precise
- Professional but approachable
- Technically accurate
- Free of slang or conversational filler

Do not use humor, emojis, decorative icons, or informal expressions.

### Audience Assumption

Assume the reader:

- Has basic development knowledge
- May be unfamiliar with this project
- Should not be required to read source code to understand behavior

Avoid unexplained abbreviations and implicit assumptions.

---

## Formatting Rules

### Headings

Use structured, meaningful headings:

- One H1 per document
- Logical section hierarchy
- No decorative prefixes

### Paragraphs

- Keep paragraphs short
- Use one idea per paragraph
- Avoid long narrative blocks

### Lists

Use lists when describing:

- Concepts
- Steps
- Requirements
- Outcomes

Avoid deeply nested lists.

---

## Code and Examples

- Use fenced code blocks where applicable
- Prefer minimal examples that demonstrate intent
- Do not embed screenshots for content that should be described in text

---

## Cross‑Referencing

When referring to other documents:

- Prefer relative links
- Reference sections by heading if necessary
- Do not duplicate content across files

---

## File Conventions

Documentation files must:

- Use `.md` extension
- Follow one topic per file
- Use predictable naming

Generated documentation must clearly indicate generation source.

---

## Versioning and Updates

When updating documentation:

- Update related references where needed
- Avoid rewriting history unless clarifying
- Changes must remain consistent with architecture decisions

Major documentation structural changes should be reviewed.

---

## Compliance

Any new documentation added to the project must conform to this style guide.
Non‑compliant files should be refactored when encountered.

---
