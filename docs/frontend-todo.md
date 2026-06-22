# Aura AI — Frontend To-Do (client / Expo app)

> **Frontend owner:** you (client, via Claude Code). **Backend owner:** coworker (server, via Replit).
> **The coworker does NOT build the frontend.** As backend work lands that implies frontend changes
> (new/changed endpoints, DTOs, error codes, flows), the coworker **appends an item under
> "Backend-driven items"** below so the frontend side is captured.
>
> Companion docs: [v1-architecture.md](v1-architecture.md), [v1-schema.md](v1-schema.md),
> [v1-tasklist.md](v1-tasklist.md) (backend build).

## Coordination

- **Contract boundary = `@aura/shared`** (Zod DTOs, enums, constants like `FREE_DAILY_LIMIT`,
  `MAX_MESSAGE_CHARS`, `PersonaTraits`). The client validates/consumes these; when the backend
  changes the contract, the client follows the new shape.
- The backend `v1-tasklist.md` is the server build; **this file is the client build.** Items tagged
  **[both]** there have a frontend half here, coordinated via `@aura/shared`.
- You'll also re-audit the coworker's backend changes with Claude Code — this file is the lightweight
  written trail so nothing frontend-affecting slips through.

## Planned v1.0 frontend (from the rebuild plan)

- [ ] **Monorepo wiring** — Metro config to resolve `@aura/shared` (`watchFolders` → repo root + `nodeModulesPaths`)
- [ ] **Auth UI** — login/register, **real** forgot-password, **Sign in with Apple + Google** buttons; remove the silent local-user auth fallback in `AppContext`
- [ ] **Age gate & onboarding** — DOB picker (18+), AI-disclosure screen, first/last-name capture; flow ends in atomic account creation
- [ ] **Chat list** — wire to **real** companions (remove the hardcoded `CHATS` array + the id mismatch with `chat/[id]`)
- [ ] **Chat conversation** — client-side **typing animation** on the (already-moderated) reply; render break-reminders, crisis responses, and the AI-disclosure banner; optimistic bubble keyed by `turn_id`, reconcile on re-fetch
- [ ] **Input cap** — live char counter (count code points, not UTF-16) + block-send at `MAX_MESSAGE_CHARS`
- [ ] **Companions** — create/customize UI (3×3×3 trait selectors: warmth/energy/verbosity), persona-name auto-numbering ("Aurora 2"); **premium-gate** trait tuning + creation; **downgrade = lock-not-delete** UX
- [ ] **Memory** — view/delete memories UI
- [ ] **Premium / paywall** — render the price **from StoreKit/RevenueCat** (remove the hardcoded `$19.99`), **"Restore Purchases"** button, RevenueCat SDK integration
- [ ] **Safety/UGC** — report/flag an AI message (Apple Guideline 1.2)
- [ ] **Account** — in-app account deletion + data export UI
- [ ] **Notifications** — APNs registration + handling ("your companion replied")
- [ ] **Cleanup** — delete `mockup-sandbox` + the design-catalog screens (`app/[screen].tsx`, `screen-map.tsx`, `components/screenData.ts`, `DesignShell.tsx`)

> Note: iOS client work needs **Mac + Xcode + simulator + EAS** — it can't be built/tested on Replit.

## Backend-driven items (coworker appends as work lands)

_(none yet — append `- [ ] <what changed on the backend> → <frontend implication>` here)_
