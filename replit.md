# Aura AI — Companion Chat (Backend / Server)

> **Read [`docs/README.md`](docs/README.md) first**, then [`docs/v1-architecture.md`](docs/v1-architecture.md),
> [`docs/v1-schema.md`](docs/v1-schema.md), and [`docs/v1-tasklist.md`](docs/v1-tasklist.md).
> Those docs are the **plan of record** for the v1.0 rebuild — follow them; don't relitigate the
> decisions without a real reason.

## What this is

Aura AI — an iOS AI-companion chat app (**18+, US-first**). Users chat 1:1 with vetted AI personas
that remember facts across conversations; safety-first design; **$9.99/month** premium (free tier
**30 msgs/day**). The current code is a **Replit-Agent prototype** being rebuilt per `docs/` — treat
existing code as a sketch, not a foundation.

**This workspace owns the BACKEND / SERVER.** The frontend (Expo app) is owned separately —
**do NOT build frontend here.** Backend changes that affect the client get appended to
[`docs/frontend-todo.md`](docs/frontend-todo.md) → "Backend-driven items."

## Stack (v1.0 target)

- Monorepo (pnpm): **`client`** (Expo/RN) + **`server`** (Express 5 + TS) + **`shared`**
  (`@aura/shared` — enums, Zod DTOs, constants = the client/server contract). (Replaces the prototype's
  `artifacts/*` + `lib/*` layout.)
- DB: PostgreSQL on **Neon** + Drizzle ORM — **versioned migrations, NOT `drizzle-kit push`**.
- LLM: **Groq** (Llama 3.1). Moderation: OpenAI omni + Groq gpt-oss-safeguard + prompt-guard
  (layered, server-side, fail-closed). Payments: **RevenueCat + StoreKit**. Notifications: APNs.
  Hosting: **Render** (or Replit always-on Reserved VM).

## Run & operate (after the Phase 0 restructure)

- `pnpm --filter @aura/shared run build` — build `shared` first (server depends on it)
- `pnpm --filter @aura/server run dev` — run the API server
- `pnpm --filter @aura/server run typecheck`
- DB: `drizzle-kit generate` → commit the SQL → `migrate` (see `docs/v1-schema.md`)
- Required env: see the env-var list in `docs/v1-tasklist.md` (validated at boot, fail-closed)

## Critical rules

- **Follow `docs/`** — the architecture, schema, and task list are deliberate decisions.
- **Don't build the frontend.** Append client-affecting changes to `docs/frontend-todo.md`.
- **No hardcoded secrets** — Zod-validate env at boot and fail closed (replace the prototype's
  `process.env.X ?? "fallback"` patterns; rename `SESSION_SECRET` → `JWT_SECRET`).
- **Versioned migrations**, never `push` in shared/prod.
- **Legal-review items** (retention numbers, `safety_events.flagged_content` retain-vs-scrub,
  jurisdictions, policy wording) are **NOT to be guessed** — leave the defaults + flags for counsel.
- Build the **`Moderator` interface (Phase 2) before the chat turn pipeline (Phase 3)** — they're
  co-dependent.

## Build protocol (work incrementally — do NOT build everything at once)

Replit Agent defaults to building whole apps in one pass; for this backend, **don't.**

- Work `docs/v1-tasklist.md` **in order, one phase (and one task) at a time.**
- Each subsystem (moderation, chat turn pipeline, payments/webhook, memory consolidation, auth) is
  substantial — give it **focused depth**, not a diluted all-at-once scaffold.
- **One task ≈ one commit.** Definition of Done before the next: typecheck passes, tests for that unit
  pass, no `console.*`/hardcoded secrets, committed.
- **Stop and confirm at the end of each phase.** Full rules: the `incremental-backend-build` skill.

## Skills & customization

- Project skills live in **`.agents/skills/`** (Replit applies them when relevant):
  `incremental-backend-build` (the guardrail), `database-migrations`, `api-design`, `backend-patterns`,
  `cost-aware-llm-pipeline`, `ai-regression-testing`.
- Also set **Custom Instructions** in your Replit workspace (always-on) — suggested text is in
  `docs/README.md` → "Replit setup."

## Where things live (target)

- `server/src/` — layered `route → controller → service → db (repositories)`; see the server-structure
  reference in `docs/v1-tasklist.md`. The chat turn pipeline + `Moderator`/`LLMProvider` interfaces
  live under `server/src/services/`.
- `server/eval/` — **already on disk + committed:** the synthetic chat-pipeline eval corpus
  (`cases/` + the to-be-compiled `rubrics/`). Read `server/eval/cases/README.md`. The eval *harness*
  is still to be built (this workspace); the cases/labels are the seed it runs against.
- `shared/` — `@aura/shared` enum/DTO/constant catalog (`docs/v1-schema.md`).
- `docs/` — the plan of record (start at `docs/README.md`).

## Gotchas

- The **iOS client can't be built/tested on Replit** (needs Mac + Xcode + simulator + EAS). This
  workspace is the server; client work happens elsewhere.
- The old `.replit` / `.replit-artifact/*` config targets the prototype's `artifacts/*` structure and
  **needs rewriting** for `client/server/shared`.
- **`server/` already exists** (it holds the committed `server/eval/` corpus). The Phase 0 restructure
  maps `artifacts/api-server`→`server/` — do that by adding `server/src/` + `server/package.json`
  **around** the existing tree; do **NOT** `rm`/recreate `server/` or move `api-server` to *become*
  `server/`, or you'll clobber `server/eval/`. Preserve it.
- If hosting on Replit instead of Render, use an **always-on Reserved VM** (not a sleeping instance)
  so RevenueCat webhooks deliver within their retry window.
