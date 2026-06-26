# Aura AI — Backend Brief & Doc Index (Start Here)

Status (2026-06-23): the v1.0 backend has been built and audited. The audit verdict is **NO-GO / fix-first** — good scaffolding, but blocking defects (live-data deletion, broken auth verification, migrations never run, dropped DB constraints, moderation mis-tuning) plus unbuilt spec features and an absent test/eval loop. The job now is to **FIX**, not to rebuild from scratch.

**Authoritative backend status** = `planning/backend-fixlist-v1.md`. The old phase tracker (`planning/v1-tasklist.md`) over-claims "done" — trust the fixlist. The pre-audit version of this README is archived at `archive/README.pre-audit-2026-06.md`.

## What Aura AI is

An iOS AI-companion chat app (**18+, US-first**). Users chat 1:1 with vetted AI personas that remember facts across conversations; the differentiator is a **safety-first, regulation-aware** design. Monetized via a single **$9.99/month** premium subscription (free tier: 30 messages/day). The repo began as a Replit-Agent prototype; v1.0 rebuilt it on pnpm workspaces (`client` Expo + `server` Express 5 + `shared` `@aura/shared`), Clerk auth, RevenueCat, Drizzle/Neon, APNs.

---

## App name (resolved)

The name stays **Aura** (per coworker decision 2026-06-24). Five candidates were researched (Nosta, Lumine, Velara, Serein, Mellora) — see [`planning/app-name-research.md`](planning/app-name-research.md) for the full availability audit. Velara, Serein, and Mellora were blocked; the remaining candidates had domain/conflict concerns worse than staying with Aura.

---

## How to work this — in order

Work top to bottom; the phases are dependency-ordered (fixes and the test harness interleave — don't save all testing for the end). IDs reference the fixlist (Pn-n) and testing plan (Tn-n).

- **A — Scaffolding / unblockers:** migrate-on-boot (P0-3), the model-selection seam (T0-1), extract the turn processor (T0-3), install test infra (PGlite + coverage, T2-1).
- **B — P0 blockers + their contract tests (TDD):** retention purge (P0-1), Clerk verifyToken (P0-2; the red `auth.contract.test.ts` goes green), dropped UNIQUEs + turn transaction (P0-4), moderation input thresholds (P0-5), partial-degradation fail-open (P0-6), consolidation safety-skip (P0-7).
- **C — P1 security:** auth status filter, ban-evasion, IDOR, rate-limiters, Zod, webhook rawBody, indexes, admin→Clerk roles, RevenueCat trust (P1-1…P1-11).
- **D — P2 spec features + tests:** persona/traits assembly, datamarking, dedicated guard models, memory recency/floor, etc. (P2-*) + Tier-1 units (T1-*) + the moderation eval runner (T3-1).
- **E — Prompt-iteration loop:** run the moderation corpus → tune the moderation/safeguard prompts; then the generation runner + LLM judge (T3-2) → tune the persona/safety prompts. See `testing/testing-readiness-v1.md` — the prompts are unvalidated first drafts and there is no loop yet; the shortest path to start iterating is T0-1 → T3-1.
- **F — P3/P4 cleanup:** quality/types/silent-failures, config/docs, coverage to 80%, reports/verdicts.

**Acceptance per item:** `pnpm build && pnpm typecheck && pnpm lint && pnpm test` green (incl. new tests); a fresh-DB boot serves an authenticated chat turn end-to-end.

---

## The docs

### Specs — the agreed design ("what it should be"; conformance targets, don't relitigate)

| Doc | Location |
|-----|----------|
| Architecture & decisions (D1–D12) | `specs/v1-architecture.md` |
| DB schema & `@aura/shared` catalog | `specs/v1-schema.md` |
| Moderation pipeline (L0–L3) | `specs/moderation-pipeline.md` |
| Memory pipeline (async LLM consolidation) | `specs/memory-pipeline.md` |
| Generation pipeline (hardened prompt assembly) | `specs/generation-pipeline.md` |

### Testing — how we validate

| Doc | Location |
|-----|----------|
| 3-tier strategy (Vitest + PGlite + evals) | `testing/test-harness.md` |
| What's missing before you can iterate | `testing/testing-readiness-v1.md` |
| Eval criteria + report format | `testing/eval-safety-rubric.md` · `testing/eval-report-layout.md` |

**Jason owns the safety labels.** Coworker may build the eval runner and scale non-safety cases, but must not author or freeze safety labels.

### Planning — actionable / time-bound

| Doc | Location |
|-----|----------|
| Live backend work (P0→P4) | `planning/backend-fixlist-v1.md` |
| Original phase plan (history) | `planning/v1-tasklist.md` |
| Client/Expo build (frontend owner only) | `planning/frontend-todo.md` |
| Post-v1.0 deferred features (roadmap) | `planning/post-v1.0-roadmap.md` |

### Compliance — legal drafts (do NOT publish without sign-off)

| Doc | Location |
|-----|----------|
| Data retention policy | `compliance/data-retention-policy.md` |
| Privacy policy draft | `compliance/privacy-policy-draft.md` |

### Design

| Doc | Location |
|-----|----------|
| Client visual redesign | `redesign/` |

---

## Ownership

| Role | Person | Scope |
|------|--------|-------|
| **Backend / server** | Coworker (on Replit) | Work `planning/backend-fixlist-v1.md` then `testing/testing-readiness-v1.md`. Does NOT build the frontend — append client-affecting contract changes to `planning/frontend-todo.md` → "Backend-driven items." |
| **Frontend / client** | Jason (via Claude Code) | Expo app — `planning/frontend-todo.md` |
| **Safety labels / eval corpus** | Jason | The coworker may build the eval runner and scale non-safety cases, but must not author or freeze safety labels (`testing/eval-safety-rubric.md` §0). |
| **Contract boundary** | `@aura/shared` | Zod DTOs, enums, constants — the single source for client+server types. |

---

## Do NOT guess these — they're for legal counsel

- Exact **retention windows** (current numbers are defaults).
- Whether `safety_events.flagged_content` is **retained in full or scrubbed** to metadata (fixlist leaves a `TODO(legal)`).
- **Served jurisdictions** (US-only vs EEA/UK) and final **privacy-policy / data-retention** wording.

---

## Replit setup (for the coworker)

This workspace is the **server** (the iOS client needs Mac + Xcode + EAS — not buildable on Replit). The Agent reads `../replit.md` + `../AGENTS.md` each session; both now point here and to the fixlist. Custom Instructions (workspace settings) should say: work `docs/planning/backend-fixlist-v1.md` in order, one item at a time; after each — typecheck + tests pass, no console.*/secrets, then commit; backend only; don't guess the legal items. Hosting is Render (or an always-on Replit Reserved VM so RevenueCat webhooks deliver).
