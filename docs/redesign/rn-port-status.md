# RN Port Status — Aura "Warm Sanctuary"

Tracks the Expo React Native port of the web-prototyped Warm Sanctuary redesign. Source of
truth for what's done / pending across sessions. The design **decks are frozen** — this doc
tracks the **code** port, not design decisions.

## Approach

- **Reference repo:** `../Amibroke` (a landed Expo RN redesign). Lift nav-agnostic primitives
  and adapt them to our theme; do **not** copy its navigation.
- **Theme:** keep our `useTheme()` dual light/dark (`client/constants/design.ts` `COLORS`) —
  NOT Amibroke's dark-only stateless constants. Every lifted component reads `useTheme()`.
- **Navigation:** keep `expo-router` (Amibroke uses React Navigation — components reuse only).
- **Tokens:** `design.ts` (color/space/type/shadow) + `motion.ts` (timing/easing/spring).
  No hardcoded hex / ms / bezier / px in components.
- **Conventions:** named exports (except `BottomSheet`/`ConfirmSheet`, default); motion prims
  under `components/motion/` (barrel `index.ts`); reduce-motion honored everywhere.

## Decisions (locked)

- Legacy-migration-first → rewrite screens → delete cosmic last.
- Broad primitive kit ported up front; screen-specific widgets on-demand (YAGNI).
- **Slim Phase 2:** migrate only persist-as-is screens now; rewrite-covered screens drop
  cosmic when rewritten in Phase 3; delete cosmic theme/components at the very end.

## Done

### Phase 0 — Foundation
- `client/constants/motion.ts` — DURATION / EASING / SPRING / DISTANCE / SCALE / STAGGER_MS.
- Fonts: added `@expo-google-fonts/newsreader` + `@expo-google-fonts/hanken-grotesk`, loaded
  in `app/_layout.tsx` (Sora/Manrope still loaded for cosmic screens; removed at Phase 3-end).

### Phase 1 — Primitive kit (all `useTheme()`, token-driven, reduce-motion)
- `utils/haptics.ts` — settings-gated `expo-haptics` wrapper (`selection`/`impact`/`notify`).
- `components/motion/` — `PressableScale`, `CountUp`, `entrances` (+ `index` barrel).
- `components/` — `BottomSheet`, `ConfirmSheet` (modal pair); `Button`, `Card`, `TextField`,
  `SectionLabel`, `Toggle`, `Toast`, `Skeleton`; `EmptyState`, `ErrorState`, `LoadingState`.
- `components/onboarding/StoryProgress.tsx` — carousel auto-advance mechanism (scenes built
  per-screen in Phase 3, not speculatively).

### Phase 2 (slim)
- Migrated `components/ErrorFallback.tsx` + `app/+not-found.tsx` → `useTheme()` (alias map).
- Deleted `constants/colors.ts` + `hooks/useColors.ts` (cosmic-color subsystem, orphaned).
- `pnpm typecheck` green throughout.

## Pending

### Stale — delete at Phase 3-end (once nothing imports them)
- `constants/theme.ts` (cosmic) — still imported by: `(tabs)/_layout`, `(tabs)/index`,
  `(tabs)/chat`, `chat/[id]`, `notifications`, `safety`, `rate-app`, `invite`.
- Cosmic component family: `AuraButton`, `GlassCard`, `AuraOrb`, `Background`,
  `ParticleField`, `StarField`, `GradientBorder`.
- Deps: `@expo-google-fonts/sora`, `@expo-google-fonts/manrope`.

### Phase 3 — rewrite redesign screens from prototypes
Source JSX: `docs/redesign/claude-design/{onboarding,hometabs,oneoff}-app.jsx`.
Authoritative screen list: `docs/redesign/harness/matrix.mjs`.
- **onboarding:** welcome, auth, carousel, agegate, disclosure, profile, persona, conversation
- **hometabs:** home, companions, you
- **oneoff:** chat, create, memory, paywall, submgmt, editprofile, signin, account, notifs,
  safety, legal, help, states
Each rewrite drops its `theme.ts` import. Copy comes from `client/constants/content/*`.

### Open scope question
- `invite.tsx` — NOT in the redesign matrix; a heavy cosmic screen with no Warm Sanctuary
  reference. Decide: warm redesign vs remove from v1 vs leave on cosmic. Left on cosmic for
  now (non-blocking — `theme.ts` persists for the other deferred screens regardless).

### Phase 4 — assets + polish
- App icon / splash from `client/assets/logo/`.
- Theme-aware `StatusBar` (currently hardcoded `style="light"` in `_layout.tsx`).
- Reduce-motion QA pass; deferred consistency nits.

## Key references
- Tokens: `client/constants/design.ts`, `client/constants/motion.ts`
- Theme hook: `client/hooks/useTheme.ts`
- Content copy: `client/constants/content/*`
- Amibroke reference: `../Amibroke/src/{components,theme}`, `../Amibroke/docs/design-doctrine.md`
