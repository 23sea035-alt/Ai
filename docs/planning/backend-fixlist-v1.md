# Backend Fix List — v1.0 (post-merge audit of `f188165..f714457`)

Owner: backend (coworker) · Source: security-first + architecture-conformance audit of the 28-commit merge.
Format per item: **[ID] severity — `file:line` — problem → required fix.** Cite the spec where relevant.

## Decisions applied (from review)
- **Scope = combined pass:** defects *and* spec-completeness features are in this list.
- **Message retention = account-deletion only:** remove the global 90-day message purge; keep the grace-expiry purge.
- **Admin = Clerk roles:** drop the `is_admin` DB column; add a `requireAdmin` middleware reading Clerk org-role/JWT claims; harden the 3 admin endpoints.
- **Age assurance = self-declared + DOB sanity check** (no stronger assurance for v1.0).

## Verification gates (must pass when done)
- `pnpm install` ✓ · `pnpm build && pnpm typecheck` ✓ · `pnpm lint` ✓ · `pnpm test` ✓ (incl. the new `auth.contract.test.ts` going green).
- Fresh-DB boot applies migrations and serves an authenticated request end-to-end (chat turn → moderation → reply → memory job → push).

---

## P0 — Blockers (do first; nothing should rely on the backend until these land)

- **[P0-1] CRITICAL — `services/retention.ts:12-21` + `app.ts:101,112`** — `enforceRetention()` runs `DELETE FROM messages WHERE created_at < now−90d` for **all** users, hourly + on boot. Violates `data-retention-policy.md §3` (live messages purged only within 30 days of grace expiry). → **Delete `enforceRetention()` and its call.** Keep `enforceGraceExpiry()` (correct). Also remove `markInactiveUsers()` (see P1-11) — auto-inactivation is not part of the account-deletion-only policy.

- **[P0-2] CRITICAL — `services/auth/clerk.middleware.ts:20,51`** — `clerkVerifyToken(token, {})` with empty options → `@clerk/backend@1.34.0` returns `jwk-failed-to-resolve` for **every** token (it never reads `CLERK_SECRET_KEY` from env), so `requireAuth` 401s all authenticated requests. → **Pass the key:** `await clerkVerifyToken(token, { secretKey: getEnv().CLERK_SECRET_KEY })` at both sites. Commit the new `server/src/__tests__/auth.contract.test.ts` alongside this (it pins the contract; currently red).

- **[P0-3] CRITICAL — `index.ts` / `render.yaml` / `Dockerfile`** — migrations never run; fresh deploy crashes on first query. → **Run migrations on deploy:** add `migrate()` (drizzle-orm `migrator`) in `index.ts` before `server.listen()`, **or** a `db:migrate` predeploy step in `render.yaml`. Add a `db:migrate` script to `server/package.json`.

- **[P0-4] CRITICAL — `db/src/schema/messages.ts:16`, `db/src/schema/banned_identities.ts:13`** — composite UNIQUEs written as plain object literals → Drizzle silently ignores them → not in DB. → **Use builders:** `unique("uq_turn_id_role").on(t.turnId, t.role)` and `unique("uq_identifier_type_hash").on(t.identifierType, t.identifierHash)`; **regenerate the migration.** Then in `routes/chat.ts:150-195`: insert the user message `onConflictDoNothing({ target: [turnId, role] })` and wrap the user-insert + AI-insert + companion-update in a single `db.transaction`.

- **[P0-5] CRITICAL — `services/moderation/openai-omni.ts:35-41`** — `MODERATION_INPUT_THRESHOLDS` imported but unused; input moderation uses OpenAI default boolean flags, so the calibrated cutoffs (sexual/minors 0.10, self-harm 0.30, sexual 0.95…) are dead. → **Apply per-category `category_scores` thresholds on input**, mirroring the L3 output path (`moderation-pipeline.md §4/§11`).

- **[P0-6] CRITICAL (fail-open) — `services/llm/groq.ts:22`, `services/moderation/safeguard.ts`, `moderation-engine.ts:50-63,115-121`** — `?? ""` on an empty Groq completion → safeguard regex sees no `"flagged":true` → classified **safe** with `confidence:"low"` during partial degradation. → **Throw on empty completion** in `groq.ts`; in safeguard, treat empty/unparseable/low-confidence responses as **block**. Keep the both-backends-down path failing closed (already correct).

- **[P0-7] CRITICAL — `services/memory/consolidation.ts`** — no safety skip-rule; crisis/self-harm/flagged content gets memorized and re-injected into later prompts. → **Skip consolidation** for any source/content flagged crisis/self-harm/safety (`memory-pipeline.md §2.4`); gate health facts to neutral.

---

## P1 — Security & correctness (High)

- **[P1-1] `services/auth/auth.service.ts:5-11`** — `lookupLocalUser` has no status filter → soft-deleted/inactive users still authenticate during grace. → Filter `status = 'active'` (or 403 non-active in `requireAuth`).

- **[P1-2] `services/auth/auth.service.ts:46-54` + `webhooks/clerk.ts`** — `checkBan` hashes **email only**, and runs only on `user.created`. → Hash+check **email + apple_sub + google_sub**; re-run `checkBan` on `user.updated`; on hit, delete the Clerk-mirrored user and abort.

- **[P1-3] `routes/compliance.ts:101`, `routes/notifications.ts:44`** — IDOR: report fetches message by `id` only; device-token delete by `token` only. → Scope both queries by `userId`.

- **[P1-4] `middleware/rate-limit.ts:35,44`** — `authBruteForceLimiter` and `webhookLimiter` are defined but never applied. → Apply `webhookLimiter` to `routes/webhooks.ts` + the RevenueCat webhook in `routes/payments.ts`; apply `authBruteForceLimiter` to `routes/auth.ts`.

- **[P1-5] `routes/auth.ts:77`, `routes/companions.ts:28`, `routes/compliance.ts` (ban)** — mutating routes read `req.body` via `as` casts (no Zod). → Add `validate(schema)` with `z.enum(PERSONA_KEY)` etc.; for ban, validate `email` and store `identifierType: 'email_hash'` (not `"email"`).

- **[P1-6] `webhooks/clerk.ts:46`** — Svix verification runs on `JSON.stringify(req.body)` (re-serialized) instead of raw bytes. → Verify against `req.rawBody` (already captured at `app.ts:44`), as the RevenueCat webhook does.

- **[P1-7] schema files (`messages.ts`, `memories.ts`, `safety_events.ts`)** — all 6 documented indexes missing (`"indexes": {}` in snapshots). → Add `index(...)` defs per `v1-schema.md` (messages(companion_id,created_at), messages(user_id,role,created_at), memories(user_id,companion_id,importance DESC), safety_events(status,severity,created_at), safety_events(user_id,created_at)); regenerate migration.

- **[P1-8] ADMIN via Clerk roles — `routes/compliance.ts:125,144,174`, `db/src/schema/users.ts:15`, new migration** —
  - Add `middleware/require-admin.ts` that reads the Clerk role/claim (from the verified JWT payload / Clerk org role) and 403s non-admins.
  - Replace the per-endpoint `usersTable.isAdmin` lookups with `requireAdmin`.
  - **Drop the `is_admin` column** (new migration) → also resolves the 0001 schema-drift.
  - Harden the 3 endpoints: Zod-validate ban/unban bodies; store `identifierType:'email_hash'`; **paginate** `/admin/safety-events`; **don't log plaintext emails** (log the hash); consider field-limiting the safety-events payload (it exposes `flagged_content`/PII).

- **[P1-9] `services/payments/revenuecat.ts:66` + idempotency** — `app_user_id` used as `users.id` PK without confirming the user exists; no replay/staleness guard. → Look up the user by `app_user_id`; if absent, log+no-op. Track `event_timestamp_ms` per `original_transaction_id` and reject stale/replayed events.

- **[P1-10] `routes/chat.ts:164-173`** — memory appended to the **user message** (injection surface). → Move memory into the **system prompt**, fenced + datamarked (see P2-2).

- **[P1-11] `services/retention.ts:78-92`** — `markInactiveUsers` writes invalid `status:"inactive"` and stamps `deletedAt` on active users (latent immediate-purge). → **Remove it** (per account-deletion-only decision). If an inactivity lifecycle is later wanted, use a dedicated column and a valid status.

---

## P2 — Spec-completeness features (combined-pass scope)

- **[P2-1] Persona/traits assembly — `routes/chat.ts:210-335`, `services/llm/*`** — `companions.traits` is never read; persona resolved by name-substring; prototype canned `RESPONSES`/`detectIntent`/`detectPersona` is the live fallback. → Build the prompt from `persona_key` base voice + 3 trait snippets from `PersonaTraits` (`generation-pipeline.md §3`); **delete** the canned engine; LLM-failure fallback = one safe in-persona line (turn still persisted).

- **[P2-2] Instruction/data separation (datamarking) — `routes/chat.ts`** — `generation-pipeline.md §1[3],§4`: fence the memory block + wrap the current user message in a per-request random `{tag}` delimiter, inside the system prompt. → Implement datamarking; user text stays pure data.

- **[P2-3] Dedicated moderation models — `services/moderation/prompt-guard.ts:12`, `safeguard.ts:53,83`** — both use generic `llama-3.1-8b-instant`. → Route L1 to `meta-llama/llama-prompt-guard-2-86m` and safeguard to `openai/gpt-oss-safeguard-20b` (`moderation-pipeline.md §3/§5`). **Confirm these models are enabled on the Groq account** before wiring.

- **[P2-4] Memory retrieval scoring — `services/memory.ts:91-110`** — recency term missing; no relevance floor / identity bypass; top-50-by-importance prefilter; non-deterministic sort. → Implement `0.7·Jaccard + 0.3·importance + 0.15·recency` (recency = `exp(−Δdays/30)` from `last_recalled_at`); eligibility floor `Jaccard>0.08` OR `importance≥0.85`; pull-all candidates; deterministic tie-break score→importance→id (`memory-pipeline.md §3`).

- **[P2-5] Consolidation correctness — `services/memory/consolidation.ts`** — model-chosen importance; UPDATE id not ownership-scoped; dedup cap 20 unordered; no retry; context excludes the assistant reply; no DI seam. → Category-derived importance via `MEMORY_IMPORTANCE_BY_CATEGORY`; validate UPDATE ids belong to `(user,companion)`; dedup cap 50 by importance desc; one retry then drop+log; include the assistant reply in context; extract a `MemoryConsolidator` DI seam.

- **[P2-6] Moderation timeouts — `services/moderation/moderation-engine.ts`** — `MODERATION_TIMEOUTS` unused; only a blanket 5s on Groq, none on omni. → Wrap each layer in its `MODERATION_TIMEOUTS` budget with `AbortSignal`; timeout → fail closed.

- **[P2-7] Moderation order + flagged-user band — `moderation-engine.ts:40-92`, `routes/chat.ts:124`** — injection block is checked before sexual/minors+self-harm; flagged users hard-blocked; `recentSafetyEvents` never populated (dead branch). → Evaluate `sexual/minors` + self-harm verdicts before the L1 injection block; for flagged users, **widen** the escalation band (still adjudicate) + rate-limit repeat offenders; populate `recentSafetyEvents` from `safety_events` before `screenInput`.

- **[P2-8] L0 encoding + crisis regex — `services/moderation/deterministic.ts:2-20`** — `normalizeEncoding` is lossy/destructive and skips base64/hex; crisis regex over-broad. → Decode known encodings into a separate buffer and scan as data (don't mutate in place); add base64/hex; narrow the crisis regex to high-precision phrases.

- **[P2-9] Safety preamble — `routes/chat.ts:287-296`** — omits the 988/self-harm-routing line and the professional-deferral line. → Restore both per `generation-pipeline.md §2`.

- **[P2-10] Generation constants — `services/llm/groq.ts:18-19`** — hardcodes `temperature:0.8`/`max_tokens:512`. → Import and use `GENERATION_TEMPERATURE (0.7)` / `GENERATION_MAX_TOKENS` from `@aura/shared`.

- **[P2-11] Free-tier daily count — `routes/chat.ts:37-49`** — counts all `role='user'` rows. → Add `status='complete'` so blocked inputs don't consume quota (`v1-schema.md §4`).

- **[P2-12] Persist blocked-input turns — `routes/chat.ts:126-131`** — block path returns without persisting. → Persist the turn (assistant `status='failed'`/blocked) so it never dangles (`moderation-pipeline.md §8`).

- **[P2-13] Age DOB sanity check — `routes/auth.ts`** — self-declared DOB accepts impossible/future dates. → Add a plausibility check (reject future dates and pre-1900; compute 18+ server-side). Keep self-attestation.

---

## P3 — Quality (Medium)

- **[P3-1] Response envelope — `routes/auth.ts:57-108`, `webhooks/clerk.ts`, `routes/webhooks.ts`, `middleware/rate-limit.ts`, `app.ts:36`** — raw `res.json({error})`. → Route all responses through `sendSuccess`/`sendError`.
- **[P3-2] Shared-contract single source — `shared/src/index.ts` + consumers** — drift: remove `"inactive"` usage; use shared enums for safety/subscription/device/persona; `identifierType` → `email_hash`; fix client `ApiUser.id`/`ApiMessage.id` to `string` (uuid); decide `DEVICE_PLATFORM` (`ios` only — drop `"android"` from the notifications Zod enum or add to shared).
- **[P3-3] Type safety — `routes/chat.ts:72-83` (ChatTurnResult `null as any`), `services/retention.ts:57,102` (non-null `!` on nullable cols), `services/moderation/openai-omni.ts:33` (double-cast OpenAI types), `routes/chat.ts:52` (untyped `logSafetyEvent` params)** — → discriminated-union result; drop `!` (use `isNotNull` guards); type external SDK responses; type safety params from `@aura/shared`.
- **[P3-4] Silent failures — `routes/auth.ts:69,107`, `clerk.middleware.ts:60`, `revenuecat.ts:39`, `consolidation.ts` parse catch, `chat.ts:318` `generateAIReply` catch** — bare `catch {}` swallowing. → Bind `(err)` and log; for the consolidation keyword fallback, mark a distinguishable `degraded` state rather than `processed`.
- **[P3-5] Job worker robustness — `services/jobs/worker.ts`** — no in-progress claim (double-process on restart), no retry counter, batch errors only logged. → Atomically claim jobs (`UPDATE … SET status='processing' … RETURNING`), add a retry counter + cap, isolate per-job errors.
- **[P3-6] APNs — `services/notifications/apns.ts`, `routes/notifications.ts:26`** — hardcoded `environment:"sandbox"`; `readFileSync` on the token-refresh hot path; accepts `"android"`; silent skip when token null. → Use `getEnv().APNS_ENVIRONMENT`; cache the key bytes at init; restrict to `ios`; log skipped pushes.
- **[P3-7] Retention rowCount logging — `services/retention.ts:20,31,45,91`** — `(x as any).rowCount ?? 0` always logs 0 → compliance audits show 0 deletes. → Use a typed delete count (or `.returning()` length).
- **[P3-8] Floating promises — `app.ts:90,112`, `routes/chat.ts:201`** — unguarded init + fire-and-forget. → Add `.catch(err => logger.error(...))`.
- **[P3-9] App boot side-effects — `app.ts:75-115` + `index.ts`** — LLM/worker/retention start at module import, before `validateEnv()`. → Move into an explicit `start()` called from `index.ts` after `validateEnv()`.

---

## P4 — Low / config / docs / tooling

- **[P4-1] `package.json` (root) / tsconfig** — `pnpm typecheck` fails on a clean tree (shared not built). → Make `typecheck` depend on `build` (or use TS project references); consider re-enabling `strictFunctionTypes`.
- **[P4-2] Eval harness — `server/eval/cases/*`** — JSON datasets are inert (no runner). → Add a runner that executes the cases against the moderation/memory/generation pipelines (wire to `pnpm` + CI) per `test-harness.md`.
- **[P4-3] Coverage** — only 2 unit test files; far below 80%. → Add tests for routes/auth/webhooks/retention/payments/memory-retrieval; set a coverage threshold and ratchet toward 80%.
- **[P4-4] `app.ts:67` CORS** — open `cors()`. → Assuming mobile-only this is low-risk; add an explicit origin allowlist if any web/admin client exists.
- **[P4-5] `app.ts`** — no JSON 404 catch-all. → Add `app.use((_req,res)=>res.status(404).json(...))` before `errorHandler`.
- **[P4-6] `render.yaml` / `docker-compose.yml`** — `LOG_LEVEL` missing. → Add it.
- **[P4-7] `docs/specs/v1-schema.md` + schema** — document `memory_jobs` (9th table); add enum `CHECK` constraints; `date_of_birth` → `date`. UUIDv7 vs v4 = optional/deferred (index-locality only).
- **[P4-8] `services/payment.ts` + `users.stripe_customer_id` / `subscriptions.stripe_*`** — dead Stripe code referencing non-schema columns and `process.env.STRIPE_*`. → Delete the file; drop the unused stripe columns (or quarantine + document as deferred).
- **[P4-9] `db/src/schema/subscriptions.ts` `entitlement`** — never written. → Populate from the RC webhook or drop the column.
- **[P4-10] `pnpm audit`** — 2 HIGH in dev deps (vite/vitest, undici/expo). → Patch when convenient (no server-runtime exposure).

---

## Leave as-is (correct deviations — do NOT "fix")
- Removed voice routes/service; removed `summaries` table; JWT/bcrypt→Clerk; removed SESSION_SECRET/Stripe env vars; WebSocket→HTTP-POST-only; forward-only migrations; `index.ts`/`app.ts` split; the `memory_jobs` table itself (only the doc needs updating, P4-7).

## Flagged — not coded now (policy/legal)
- **`safety_events.flagged_content` raw storage** — pending counsel's T1/T2/T3 retention windows (`data-retention-policy.md §3`). Leave behavior as-is with a `// TODO(legal)` marker; do not implement a scrub tier until windows are set.
- **Stronger age assurance** — out of scope for v1.0 (self-declared + DOB check chosen).
