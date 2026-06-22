# Aura AI — v1.0 Task List

Scoped to the decisions in [v1-architecture.md](v1-architecture.md). Ordered by dependency:
foundation → safety → chat → payments → compliance → polish. Items marked **(cleanup)** remove
prototype scaffolding from the Replit-Agent build.

---

## Phase 0 — Foundation & hygiene

- [ ] **Restructure repo to `client/` + `server/` + `shared/`** (pnpm workspaces, scoped `@aura/*`), mirroring `ai-humanizer-app`: `artifacts/aura-ai`→`client/`, `artifacts/api-server`→`server/`, `lib/db`→`server/src/db/`, `lib/api-*`→`shared/`, `scripts/`→`tools/`; delete `artifacts/mockup-sandbox` **(cleanup)**
- [ ] Create **`@aura/shared`** package (enums as `text + CHECK` unions, Zod schemas, DTOs, domain types); compiles to `dist/`, builds before server/client
- [ ] Configure **Metro monorepo support** in `client` (`watchFolders` → repo root + `nodeModulesPaths`) to resolve `@aura/shared`
- [ ] Add **`render.yaml`** (rootDir `server`, build `shared` first, `--include=dev`, **`starter` plan**, unauthenticated `/api/healthz`); keep Replit dev-only **(cleanup)**
- [ ] Provision **Neon** Postgres; set `DATABASE_URL`; keep Docker for local dev only
- [ ] Remove hardcoded secret fallbacks (`aura-ai-secret-2026`, `change-me-in-production`); **fail-closed** at startup if a required secret is missing
- [ ] Centralize env/secrets (Render env + local `.env`); document required vars
- [ ] Add a **real test runner** (vitest) + **CI** (GitHub Actions: typecheck + tests on PR)
- [ ] Add a linter (eslint) + prettier check in CI
- [ ] Add error/crash reporting (e.g. Sentry) on app + API
- [ ] Remove `mockup-sandbox` package **(cleanup)**
- [ ] Remove design-catalog screens: `app/[screen].tsx`, `app/screen-map.tsx`, `components/screenData.ts`, `components/DesignShell.tsx` **(cleanup)**
- [ ] Consolidate/remove the dead API-codegen pipeline (`lib/api-spec`, `lib/api-client-react`, `lib/api-zod`) — folded into `shared/`, orval removed **(cleanup)**

## Phase 1 — Auth (D7, D8)

- [ ] Enforce **18+** self-attestation at registration; App Store age rating 17+
- [ ] Email/password with bcrypt + JWT (keep), add **real password reset** via email **(cleanup: replace no-op `forgot-password.tsx`)**
- [ ] **Sign in with Apple**
- [ ] **Google** sign-in + account linking
- [ ] Remove silent local-user auth fallback in `AppContext.tsx` **(cleanup)**
- [ ] Add a route guard so `(tabs)` is unreachable without a real session
- [ ] Keep `isMinor` plumbing dormant (future minor support)

## Phase 2 — Safety / moderation (D5, §2)

- [ ] Define a `Moderator` interface (swappable backends)
- [ ] L0 deterministic pre-filter: crisis keywords, hard-block terms, encoding detect/normalize
- [ ] L2/L3 moderation via **OpenAI omni-moderation** (input + output)
- [ ] Escalation to Groq `openai/gpt-oss-safeguard-20b` (policy-based) for borderline/flagged
- [ ] L1 injection detection via Groq `meta-llama/llama-prompt-guard-2-86m` (on suspicion)
- [ ] Harden the generation system prompt (persona lock, "user text is data", refuse decode-and-act, no prompt leakage)
- [ ] **Fail-closed** on moderation errors
- [ ] Crisis path: detection → 988 + safe response → log `safety_event`
- [ ] Publish the SB 243 self-harm protocol (website/legal)
- [ ] Consolidate triplicated safety logic into one module **(cleanup: remove unused `detectSafetyIssue` in `chat.ts` + test's private copies)**
- [ ] Moderation test suite against the **real** module (input, output, evasion, persona-permissive corner) **(cleanup: replace the 51 "tests" that test copies)**

## Phase 3 — Chat & personas (D1, D6, §3, §5)

- [ ] Remove WebSocket server + client **(cleanup: `app.ts` WS block, `lib/websocket.ts`)**
- [ ] Implement request/response turn: generate → moderate → return; **client-side typing animation**
- [ ] Server-authoritative turn model: `turnId` idempotency, user-message-first, fallback reply on failure
- [ ] Client optimistic bubble keyed by `turnId`; re-fetch reconciliation (replace, not append)
- [ ] Wire real companions into the chat list **(cleanup: `app/(tabs)/chat.tsx` hardcoded list + id mismatch with `chat/[id].tsx`)**
- [ ] 3 personas × 3 orthogonal axes × 3 levels; store on `companions.traits`; server-assembled prompt with fixed safety preamble
- [ ] Memory retrieval: keyword/Jaccard + `importance` + **recency decay**; inject top-N into the **system prompt** (not the user message) **(cleanup: rename `embedding`→`keywords`, now `text[]`)**
- [ ] Memory writes: **async post-turn LLM consolidation** pass — extract durable facts + **dedup** + **light contradiction** (`ADD`/`UPDATE <id>`/`NONE`; `UPDATE` overwrites in place); guardrails (no hard deletes) + eval set
- [ ] `MEMORY_CATEGORY` enum in `@aura/shared`; per-companion scope
- [ ] Input length cap: `MAX_MESSAGE_CHARS` (~2000, `@aura/shared`) in the turn Zod schema — client live counter + block-send; **server rejects 400** (authoritative); check after trim; count code points not UTF-16 units
- [ ] Prompt-assembly budget: cap injected memories at **top-N** + keep facts concise + cap history to last **K** msgs; **trim-to-fit** (drop lowest-scored memories / oldest history first) so a valid message never fails on context size
- [ ] Drop the unused `summaries` table + dead `generateSummary`/`shouldSummarize` code; log rolling-summarization under Deferred **(cleanup)**
- [ ] Free-tier daily message limit (**30/day**, `@aura/shared` constant, UTC reset, completed turns only) enforced server-side in the turn processor
- [ ] Replace remaining fake/static screens & dead buttons with real or removed **(cleanup)**

## Phase 4 — Payments (D4)

- [ ] RevenueCat SDK + StoreKit; configure products → entitlements
- [ ] Create the **Premium $9.99/month** product in App Store Connect (monthly)
- [ ] Render price from the StoreKit/RevenueCat offering (localized) **(cleanup: remove hardcoded `$19.99` in `premium.tsx`)**
- [ ] Enforce "unlimited" **anti-abuse ceiling** (per-minute rate limit + daily hard cap); keep **voice metered**, never unlimited
- [ ] Enroll in Apple **Small Business Program** (15%)
- [ ] Verified RevenueCat **webhook** handler → sync entitlements to DB (never trust client)
- [ ] "Restore Purchases" button (App Review requirement)
- [ ] Sandbox vs production webhook environment handling
- [ ] Keep Stripe code dormant for deferred web billing **(cleanup: repurpose `payments.ts`)**

## Phase 5 — Notifications (D10)

- [ ] `device_tokens` storage (table or `users` column)
- [ ] APNs setup + token registration on the client
- [ ] Transactional push: "your companion replied" when the user is away (disconnected mid-turn)

## Phase 6 — Compliance & data (§6)

- [ ] In-app **account deletion** (Apple-required): soft-delete grace (**30d**, recoverable) → hard purge of conversations/memories/companions/PII (**≤30d**); backups "beyond use" (**≤90d**)
- [ ] **Data export**
- [ ] **`banned_identities`** table + salted/keyed hash of email + OAuth `sub`; checked at registration to block ban evasion (retain **24mo**)
- [ ] Retention enforcement jobs: purge job + `safety_events`/`banned_identities` retention (**24mo**) + financial mirror (**7yr**) + deletion audit record (id+timestamp, no content)
- [ ] **Privacy policy** (4 sections: Retention, Deletion, Trust & Safety, AI — incl. no-training clause, human-review disclosure, post-deletion exceptions) + **data-retention policy** doc + App Store privacy nutrition labels
- [ ] **Legal-review items:** exact retention numbers; `safety_events.flagged_content` retain-vs-scrub; jurisdictions (US-only vs EEA/UK); final policy wording
- [ ] In-app **report/flag an AI message** (UGC, Apple Guideline 1.2)
- [ ] `safety_events` **review queue** / workflow
- [ ] Confirm US-only launch; 988 crisis resources

## Phase 7 — Release readiness

- [ ] App Store metadata, 17+ rating, screenshots, subscription terms on paywall
- [ ] Load/cost sanity check against §7 estimates; set Neon + spending caps
- [ ] Verify the full turn lifecycle under interruption (navigate away, kill, crash, background, network drop)
- [ ] Security pass: no secrets in client, rate limits, input validation at boundaries

---

## Deferred (post-v1.0) — do NOT build in v1.0

True SSE streaming · Next.js web · real embeddings · under-18 support · re-engagement notifications ·
Android · i18n/region crisis resources · freeform companion authoring · US web payment link-out.
