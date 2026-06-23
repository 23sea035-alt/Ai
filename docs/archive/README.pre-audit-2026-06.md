# Aura AI — v1.0 Rebuild: Start Here

> ⚠️ **ARCHIVED SNAPSHOT (pre-audit, 2026-06).** Superseded by [../README.md](../README.md). Kept for history; the "build-from-scratch" guidance below is obsolete — the backend is built; see [../planning/backend-fixlist-v1.md](../planning/backend-fixlist-v1.md).

This folder is the **plan of record** for rebuilding the Aura AI companion app for an iOS-first v1.0.
Read this first, then the docs below. Everything here was decided deliberately — treat it as the spec,
and don't relitigate decisions without a real reason.

## What Aura AI is

An iOS AI-companion chat app (**18+, US-first**). Users chat 1:1 with vetted AI personas that remember
facts across conversations. The differentiator is a **safety-first, regulation-aware** design.
Monetized via a single **$9.99/month** premium subscription (free tier: **30 messages/day**).

> Context: the current repo is a Replit-Agent-generated **prototype** (beautiful UI over a thin
> backend, prototype-grade hygiene). These docs are the plan to rebuild it properly. Treat existing
> code as a reference/sketch, not a foundation.

## The docs (read in order)

1. **[v1-architecture.md](../specs/v1-architecture.md)** — the 12 locked decisions (D1–D12) + moderation
   pipeline, chat turn model, cost & data-retention models, server structure, deferred work. The "why."
2. **[v1-schema.md](../specs/v1-schema.md)** — the **8-table** Postgres/Drizzle schema (auth is Clerk-managed) + the `@aura/shared`
   enum/constant catalog + the deletion/retention model. Build the first migration from this.
3. **[v1-tasklist.md](../planning/v1-tasklist.md)** — the phased, dependency-ordered build plan + the **"Open
   implementation decisions & gaps"** punch list + the **server structure** reference.
4. **[frontend-todo.md](../planning/frontend-todo.md)** — the client/Expo build (frontend owner only).
5. **[privacy-policy-draft.md](../compliance/privacy-policy-draft.md)** + **[data-retention-policy.md](../compliance/data-retention-policy.md)**
   — counsel-review drafts. **Do NOT publish without legal sign-off.**

### Chat-pipeline build specs (backend)

The detailed **how** for the chat turn pipeline — read alongside `v1-tasklist.md` Phases 2–3 when
building moderation, memory, and chat (`v1-architecture.md` D1/D5/D6/D12 is the **why**):

- **[moderation-pipeline.md](../specs/moderation-pipeline.md)** — layered L0–L3 (prompt-guard ∥ omni →
  gpt-oss-safeguard), per-category thresholds, fail-closed orchestration, the `Moderator` seam + safeguard policy.
- **[memory-pipeline.md](../specs/memory-pipeline.md)** — async LLM consolidation (tool-call) + keyword retrieval
  scoring (Jaccard + importance + recency, floor + identity bypass).
- **[generation-pipeline.md](../specs/generation-pipeline.md)** — hardened prompt assembly, safety preamble,
  3×3×3 personas, 8B-appropriate injection defense.
- **[eval-safety-rubric.md](../testing/eval-safety-rubric.md)** — the hard/safety-tier eval criteria (8 dimensions,
  crisis-PASS-vs-block, SB 243). **Jason owns this + the safety corpus.**
- **[eval-report-layout.md](../testing/eval-report-layout.md)** — the human-in-the-loop eval report + the
  generation / consolidation / moderation cards.
- **[test-harness.md](../testing/test-harness.md)** — the test strategy: Vitest + PGlite contract tests, the DI
  fakes, the 10 turn-orchestration tests, coverage + CI.

## Ownership

- **Backend / server — coworker (on Replit):** the `v1-tasklist.md` phases (Express + Drizzle + Neon,
  moderation, memory, payments webhook, notifications, jobs, retention). **Does NOT build the frontend.**
- **Frontend / client — Jason (via Claude Code):** the Expo app — see `frontend-todo.md`.
- **Contract = `@aura/shared`** (Zod DTOs, enums, constants). When the backend changes the contract,
  the client follows the new shape; the coworker **appends client-affecting changes to
  `frontend-todo.md` → "Backend-driven items."**

## Headline decisions

- iOS-first, **text-only v1.0** (voice deferred); **18+** (self-attested DOB + Apple age signal).
- Monorepo (pnpm): **`client` (Expo) + `server` (Express 5) + `shared`**. DB on **Neon** (Postgres + Drizzle).
- Chat: **request/response + client typing animation** (true SSE deferred); **server-authoritative
  turn model** with client-minted `turn_id` (idempotency + reconciliation).
- **Layered server-side moderation** (deterministic → prompt-guard → OpenAI omni → gpt-oss-safeguard),
  **fail-closed**; **per-companion keyword memory** via an **async LLM consolidation** pass.
- **Auth: Clerk-managed** (email/password + Sign in with Apple + Google; reset/verification handled by
  Clerk), webhook-mirrored into `users.clerk_user_id` — no in-house credentials/JWT.
- **Payments: RevenueCat + StoreKit**, $9.99/mo (Apple Small Business Program 15%).
- **Hosting: Render** (`starter`/always-on so RevenueCat webhooks deliver).
- **3×3×3 personas** (3 vetted base personas + structured traits; tuning + extra companions are premium).

## Do NOT guess these — they're for legal counsel

- The exact **retention windows** (current numbers are defaults).
- Whether `safety_events.flagged_content` is **retained in full or scrubbed** to metadata.
- **Served jurisdictions** (US-only vs EEA/UK) — changes which laws apply.
- Final **privacy-policy + data-retention-policy** wording.

## Recommended first steps (backend)

1. **Phase 0:** restructure to `client/server/shared`; create `@aura/shared`; **author + commit the
   initial Drizzle migration** (all 8 tables from `v1-schema.md`); Zod **env validation** at boot
   (fail-closed, no secret fallbacks); add `render.yaml`.
2. Knock out the **P0 punch-list** items early (response/error envelope, `userId`→UUID, etc. — see
   `v1-tasklist.md` → "Open implementation decisions & gaps").
3. **Phase 1** auth → **Phase 2** moderation (build the `Moderator` interface) **before** **Phase 3**
   chat turn (they're co-dependent; build the interface first).

## Replit notes

- This workspace is the **server**. The **iOS client can't be built/tested on Replit** — it needs
  **Mac + Xcode + simulator + EAS**. (Server dev/host on Replit is fine.)
- The old `artifacts/*` + `.replit-artifact` structure is being **replaced** by `client/server/shared`;
  the existing `.replit` will need rewriting for the new layout.
- Hosting in the plan is **Render**. If you'd rather stay on Replit, use an **always-on Reserved VM**
  (not a sleeping instance) so webhook delivery (RevenueCat) is reliable.

## Replit setup (for the coworker)

Three Replit levers reinforce the plan — set them up before building:

1. **`replit.md`** (repo root) — the Agent reads it every session; it points here and states the build protocol.
2. **Skills** (already in `.agents/skills/`) — Replit auto-applies these when relevant:
   `incremental-backend-build` (the guardrail), `database-migrations`, `api-design`, `backend-patterns`,
   `cost-aware-llm-pipeline`, `ai-regression-testing`.
3. **Custom Instructions** (set once in Replit → workspace settings; auto-injected every session). Suggested:
   > Work the task list in `docs/v1-tasklist.md` ONE phase at a time. Do not build the whole backend in
   > one pass — each subsystem (moderation, chat turn pipeline, payments, memory) gets its own focused
   > effort. After each task: typecheck + tests pass, no `console.*` or hardcoded secrets, then commit.
   > Stop and confirm at the end of each phase. Backend/server only — do not build the frontend; append
   > client-affecting changes to `docs/frontend-todo.md`. Don't guess the legal-review items.

> **Why:** Replit Agent is designed to build whole apps in one pass; these three layers (plus the
> `incremental-backend-build` skill) push it to give each subsystem real depth instead of a diluted
> all-at-once scaffold.
