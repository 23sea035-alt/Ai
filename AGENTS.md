# Aura AI — Agent Guide

> **Plan of record:** read [`docs/README.md`](docs/README.md) first, then
> [`docs/v1-architecture.md`](docs/v1-architecture.md), [`docs/v1-schema.md`](docs/v1-schema.md),
> [`docs/v1-tasklist.md`](docs/v1-tasklist.md). For backend/server work also see [`replit.md`](replit.md).
> Those docs are authoritative — follow them; don't relitigate decisions without a real reason.

## What this is

Aura AI — an iOS AI-companion chat app (**18+, US-first**). The current code is a Replit-Agent
**prototype** being rebuilt for v1.0 per `docs/`; treat existing code as a sketch, not a foundation.

## Ownership

- **Backend / server** (Express + Drizzle + Neon, moderation, memory, payments, jobs) — coworker, on
  Replit. See [`replit.md`](replit.md).
- **Frontend / client** (Expo app) — owned separately; tracked in
  [`docs/frontend-todo.md`](docs/frontend-todo.md). **Do not build frontend from the server side.**
- **Contract = `@aura/shared`** (Zod DTOs, enums, constants).

## Critical rules

- Follow `docs/`. **No hardcoded secrets** (env-validated, fail-closed). **Versioned migrations**, not `push`.
- **Legal-review items** in the docs (retention numbers, `safety_events.flagged_content`,
  jurisdictions, policy wording) are **NOT to be guessed**.
- Target structure is **`client` + `server` + `shared`** (replaces the prototype's `artifacts/*`).

---

_This file intentionally defers to `docs/` + `replit.md` to avoid drift. The previous contents
(a prototype build log) are in git history._
