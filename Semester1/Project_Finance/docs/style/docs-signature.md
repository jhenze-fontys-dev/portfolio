# Documentation Signature Standard

This project uses a **consistent documentation signature** so every Markdown file looks like it belongs to the same system and contributes to a coherent knowledge architecture.

The signature defines **structure, metadata, tone, and formatting rules** for all project documentation.

---

## 1. Purpose

The goal of the documentation signature is to ensure that every document:

- is easy to read and navigate
- follows a predictable structure
- communicates intent and scope clearly
- scales across backend, tooling, testing, and future frontend areas
- works well both on **GitHub** and in a future **admin / documentation UI**

This signature acts as the **documentation equivalent** of the code‑signature standard.

---

## 2. Required Header Block

Every documentation file **must begin** with the following metadata block:

```md
---
Title: <Document Title>
Audience: <Developers | Contributors | Operators | Users>
Status: <Draft | Active | Deprecated>
Scope: <Backend | Generators | Tooling | Docs | Project | Multi-area>
Version: <x.y>
Last-Updated: <YYYY-MM-DD>
Owner: <Person or Role>
---
```

### Rules

- The header **must appear before any content**
- Values must be meaningful — not placeholders
- If ownership changes, the file must be updated
- Deprecated docs must explicitly say **Deprecated** in `Status`

---

## 3. Standard Document Structure

All documentation should follow this structure unless there is a strong reason not to:

```md
# Title

## 1. Purpose
Why this document exists.

## 2. Context
Background, relationships, dependencies, assumptions.

## 3. Scope
What this document *covers* — and what it does *not* cover.

## 4. Concepts & Definitions
Important terminology needed to understand the topic.

## 5. Structure / Architecture
How the thing is organized or composed.

## 6. Workflow / Usage
How to use, run, integrate, or operate it.

## 7. Inputs / Outputs
What it reads, writes, generates, or produces.

## 8. Examples
Examples, screenshots, commands, or flows.

## 9. Future Extensions
What may evolve later.

## 10. Related Documents
Links to ADRs, architecture docs, generators, or policies.
```

### Optional Sections

- Troubleshooting
- Known Limitations
- Migration Notes
- Security Considerations

---

## 4. Tone and Style Rules

- Write in **clear, professional, engineering-oriented language**
- Prefer **short paragraphs and bullet points**
- Avoid slang or conversational filler
- Use **present tense** (“The generator writes…”, not “The generator will write…”)
- Use **meaningful section titles**
- Avoid ambiguous phrases like *probably*, *maybe*, *kind of*
- Prefer **examples over abstract explanations**

### Visual Style Rules

- Do **not** use icons or emojis in documentation (titles, headings, or body text)
- Use plain Markdown headings (`#`, `##`, `###`) without decorative characters
- Keep line length reasonable for readability on GitHub and in code editors

---

## 5. File Placement Rules

Documentation is organized into:

```text
docs/
  backend/
  frontend/
  internal/
  guides/
  style/
  policies/
  decisions/
  testing/
```

Placement rules:

- `docs/style/` → documentation rules and standards
- `docs/policies/` → rules, contracts, governance
- `docs/decisions/` → ADRs
- `docs/backend/` → backend runtime and architecture docs
- `docs/internal/` → maintenance docs not intended for public users
- `docs/testing/` → testing tools and reports
- `docs/guides/` → how-to guides and walkthroughs

If a document does not clearly fit in one folder, **re-evaluate its scope**.

---

## 6. Auto-generated vs Hand-written Docs

Generated output must:

- include a clear header indicating **AUTO-GENERATED**
- never be edited manually
- link back to the generator or tool that produced it

Hand-written docs must:

- include the full metadata header
- indicate responsibility and scope
- follow the tone, style, and visual rules in this document

---

## 7. Validation Checklist

Before a document is accepted:

- [ ] Header metadata is present and correct
- [ ] Structure follows the documentation signature
- [ ] Scope and audience are clear
- [ ] Language is consistent and professional
- [ ] Links to related docs are included
- [ ] File is stored in the correct folder
- [ ] No duplicated content with another document
- [ ] No TODO placeholders remain
- [ ] No icons or emojis are used anywhere in the document

---

## 8. Outcome

By following this signature:

- documentation becomes **predictable and scalable**
- contributors can write docs **without guessing style**
- future automation (doc indexing, UI rendering, search) becomes easier and safer

This standard is considered **part of the architecture** and should be updated via ADRs when it evolves.
