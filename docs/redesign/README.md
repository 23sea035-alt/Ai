# Aura AI — Redesign prompt library

This folder is the **plan of record for the Aura AI visual redesign**, executed in an external
**Claude Design** session. We do **not** edit app code here — these are the prompts + reusable
scaffolding we paste into Claude Design, plus the design rules we grade the output against.

Modeled on the sibling repo **`../Amibroke`** (`origin/master`), which already ran this exact
playbook successfully (same Expo/React Native stack).

## Locked decisions (2026-06-22)

- **Direction:** "Warm Sanctuary" — warm, calm, human, trustworthy. Deliberately *off* the cold
  cosmic/purple/neon/glassmorphism default (that look reads as vibe-coded).
- **Palette + type:** *guided reselect* — Claude Design proposes 2–3 options; we approve before screens.
- **Platform:** iOS, native (Expo / React Native). Frame = iPhone 16 Pro (402×874 pt).
- **Navigation:** 3 tabs — **Home · Companions · You**. Chat is a pushed screen.
- **Onboarding:** 3-slide carousel → auth (swappable) → age gate (18+) → AI disclosure + ToS →
  profile → pick companion → **first conversation** (NOT the dashboard).

## The doc set (read / paste in order)

| File | Role |
|---|---|
| [`00-foundation.md`](00-foundation.md) | **Paste first.** Project + Warm Sanctuary mood + the palette/type proposal workflow + the technical scaffold conventions (ios-frame, dev rail, tokens). |
| [`01-doctrine.md`](01-doctrine.md) | Standing design rules — the anti-"vibe-coded" doctrine + the completeness/accessibility gate. Our grading rubric. |
| [`02-demo-persona.md`](02-demo-persona.md) | The **one coherent demo persona** (user + companion + conversation + memories) that threads through every screen so the prototype tells one story. |
| [`03-onboarding-scaffold.md`](03-onboarding-scaffold.md) | Build prompt for `Onboarding.html` (welcome → first chat). |
| `04-hometabs-scaffold.md` *(next)* | Build prompt for `HomeTabs.html` (Home · Companions · You). |
| `05-oneoff-screens.md` *(next)* | Build prompts for pushed screens (Chat, Paywall, Memory, …) + the system-states kit. |
| [`claude-design/ios-frame.jsx`](claude-design/ios-frame.jsx) | Reusable iOS device chrome (status bar, Dynamic Island, nav bar, home indicator, keyboard). |
| [`claude-design/dev-harness.jsx`](claude-design/dev-harness.jsx) | Reusable **out-of-frame dev rail** + state context (screen jumper · theme · free/premium · per-screen states). |

## How a Claude Design session goes

1. Paste **`00-foundation`** → Claude Design proposes palette + type. **Approve one.**
2. Paste **`01-doctrine`** + **`02-demo-persona`** as standing context.
3. Provide the two `claude-design/*.jsx` files as reusable scaffolding.
4. Paste **one scaffold prompt** (`03`/`04`/`05`) → Claude Design builds that HTML artifact, with the
   dev rail wired so you can jump screens and flip states while reviewing.
5. Export the approved HTML into `claude-design/` (mirrors Amibroke's `docs/redesign/claude-design/`).
