# Testing Readiness & Build Plan — v1.0

Companion to `test-harness.md` (the spec) and `../planning/backend-fixlist-v1.md` (the code fixes).
Question answered here: **can the coworker start iterating on the prompts right away?** → **No.** The
eval *corpus* is ready, but the *engine* to run it — and the seams the engine needs — don't exist yet.
This doc lists the revisions required, in dependency order.
(Docs are grouped under `docs/<area>/`.)

## Verdict
- **Data side: ready.** `server/eval/cases/*` is schema-locked, labeled, and explicitly runner-shaped
  (`{callType, cases:[…]}` with `expected.action/category/layer`, `expectedOps`, `expectedTopN`,
  `rubricFocus`). Authored by us in `a5a5edc` — the coworker neither built nor touched it.
- **Engine side: absent.** No runner, no model-selection seam, no DI fakes, no PGlite, no reports/verdicts
  plumbing, no LLM judge. `test-harness.md` Tiers 2 and 3 are essentially unbuilt.
- **Net:** prompts are unvalidated first drafts (see audit) and there is **no loop to validate them**.

## Readiness snapshot (spec → state)
| Tier (test-harness.md) | Spec | Built? | Gap |
|---|---|---|---|
| 1 — units | pure fns, vitest | ⚠ partial | L0/crisis/break-reminder/keywords/Jaccard done; scoring+recency+floor, retrieval-ranking, per-category threshold map, prompt-assembly **missing** |
| 2 — contract | turn processor + **PGlite** + DI fakes | ❌ none | no PGlite, no programmatic `migrate()` in tests, no fakes, turn logic not extracted from the route, 0/10 contract tests |
| 3 — eval | **runner** over corpus, real models, scored, reports/verdicts | ❌ none | corpus exists; **runner, judge, model-seam, reports/verdicts all missing** |
| deps | vitest, `@electric-sql/pglite`, `@vitest/coverage-v8` | ⚠ | only `vitest` installed |
| coverage | 80% gate | ❌ | ~2 files; no threshold set |

## Shortest path to "start iterating the prompts" (do these first)
The moderation cases are **label-matching** (confusion matrix), not prose-judged — so the moderation
prompts can be put under measurement fastest. Minimum unblock:
1. **T0-1 model-selection seam** (below) — without it the pipeline can't run the spec's L1/safeguard models.
2. **T3-1 moderation eval runner** — feed `moderation/*.json` `input` → `Moderator` → compare
   `action/category/layer` vs `expected`; emit a confusion matrix. This is the iteration loop for the
   moderation + safeguard prompts and needs no persona assembly or judge.
3. Then **T3-2 generation runner** (needs persona/traits assembly `fixlist P2-1` + an LLM judge) and
   **T3-3 consolidation/retrieval runners**.

## Required revisions

### T0 — Unblockers (shared by tests and the fixes)
- **T0-1 — Model-selection seam — `services/llm/index.ts`** — `LLMProvider.generateReply` takes only
  `{systemPrompt, messages}`; no `model`. So L1 prompt-guard, the safeguard, and generation all route
  through one hardcoded Groq model (`groq.ts`). → Add an optional `model`/`params` arg (temperature,
  max_tokens, response_format) so the runner can exercise `prompt-guard-2-86m` / `gpt-oss-safeguard-20b`
  / `llama-3.1-8b-instant`. (Pairs with `fixlist P2-3`.)
- **T0-2 — Programmatic `migrate()`** — needed by both deploy (`fixlist P0-3`) and Tier-2 (`drizzle-orm/pglite/migrator`). Build once, reuse.
- **T0-3 — Extract the turn processor — `routes/chat.ts`** — turn logic is inline in the route, so the 10
  contract tests can't target it. → Extract a `processTurn(deps)` unit taking the `LLMProvider` /
  `Moderator` / `MemoryConsolidator` seams (pairs with `fixlist` arch cleanup).

### T1 — Tier-3 eval harness (the prompt-iteration loop)
- **T3-1 — Moderation runner** — read `cases/moderation/*.json`, run each `input` (+ `draftReply` for
  output-side) through the real `Moderator`, score `action/category/layer` vs `expected`, output a
  confusion matrix + per-case pass/fail. Label-match only; no judge.
- **T3-2 — Generation runner + LLM judge** — assemble the real persona/traits prompt (depends on
  `fixlist P2-1`), generate via real Groq, judge against `rubricFocus` with an LLM-judge prompt; safety
  cases assert `expectedOutcome`.
- **T3-3 — Consolidation + retrieval runners** — consolidation: op-match vs `expectedOps` (needs the
  `MemoryConsolidator` seam, `fixlist P2-5`); retrieval is deterministic — fold into Tier-1 (T2-4).
- **T3-4 — Reports/verdicts plumbing** — create `server/eval/reports/` (gitignored, regenerable) and
  `server/eval/verdicts/` (kept) per `eval-report-layout.md` §0; runner writes both.
- **T3-5 — Eval entrypoint + keys + cost guard** — a `pnpm eval` script (real OpenAI/Groq keys),
  **excluded from CI**, run pre-release/scheduled; batch/limit to control cost.

### T2 — Tier-2 contract tests (trust the pipeline the prompts run inside)
- **T2-1 — Install + wire PGlite** (`@electric-sql/pglite`); fresh instance per file + `TRUNCATE … RESTART IDENTITY CASCADE` per test; programmatic `migrate()` (T0-2); pin PG17.
- **T2-2 — DI fakes** — `LLMProvider` fake that **records the prompt** (assert preamble-first, memory
  fenced+datamarked, user message delimited); `Moderator` fake (`allow/crisis/block/escalated/throws`);
  `MemoryConsolidator` fake. (`moderator` is currently a hardcoded singleton — make it injectable.)
- **T2-3 — The 10 turn-orchestration tests** (test-harness §5): turnId idempotency, ordering, no-dangle,
  crisis/blocked/output short-circuits, fail-safe vs fail-closed asymmetry, free-tier, break-reminder,
  memory-in-system-prompt.
- **T2-4 — Factories** — `createTestUser/createTestCompanion/seedMessages`.

### T3 — Tier-1 unit gaps
- **T1-1** — memory scoring + recency + floor/identity-bypass + deterministic tie-break (after `fixlist P2-4`).
- **T1-2** — retrieval ranking against `cases/retrieval/*.json` (deterministic; gates CI).
- **T1-3** — per-category omni threshold mapping (after `fixlist P0-5`).
- **T1-4** — prompt assembly (preamble present+first, memory fenced+datamarked, user delimited).

### T4 — CI / coverage
- **T4-1** — add `@vitest/coverage-v8`; set the 80% line/branch threshold on business logic.
- **T4-2** — CI gates Tier 1+2 only (build shared → typecheck → lint → tier1/2 + coverage); **Tier 3
  excluded** from CI (needs keys + cost).

## Dependencies & ownership
- **Prompt iteration depends on fixes:** moderation-prompt iteration needs **T0-1** (+ `fixlist P2-3`
  models); generation-prompt iteration needs **fixlist P2-1** (persona/traits assembly) + the judge;
  consolidation needs **fixlist P2-5**. Build the harness scaffolding in parallel with those fixes, then iterate.
- **Safety labels:** Jason owns the safety-tier labels/rubric (corpus README §⚠, `eval-safety-rubric.md` §0).
  The coworker may build the runner and scale **non-safety** cases, but **must not author or freeze safety
  labels** — those promote into the regression gate only after sign-off.
