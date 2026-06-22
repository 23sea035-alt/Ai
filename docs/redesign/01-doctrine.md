# 01 — Design Doctrine (Warm Sanctuary)

> Standing reference for **all** Aura redesign work in Claude Design — and our grading rubric for the
> output. Paste it as context after the foundation is approved. Adapted from the sibling repo's proven
> `design-doctrine.md`, recast for Aura's "Warm Sanctuary" direction. The [§13 gate](#13-the-gate) is
> the checklist to run before calling any screen done.

---

## 0. North star

Aura should feel **alive but calm** — warm, human, trustworthy, premium through restraint — and never
**vibe-coded** (generic, static, "AI-slop glass-and-glow"). Every screen is judged on two axes: does
it work, and does it carry the brand? Restraint is part of the brand: **flair is earned.** Hero
moments (meeting your companion, a reply arriving) get gentle motion; utility screens (Settings,
legal, account) stay still. Animating everything is its own vibe-coded smell.

| Vibe-coded tell (avoid) | Warm-Sanctuary equivalent (do) |
|---|---|
| Glassmorphism / frosted surfaces everywhere | Warm, **opaque** surfaces; depth from tone + soft shadow |
| Glow / neon / glowing orbs | Soft, warm shadow + tonal layering; no glow |
| Cosmic purple gradient behind everything | One committed warm field; gradients/texture **earned** |
| Three+ accents, no conviction | **One** warm signature accent, used sparingly |
| Content just appears | Gentle, choreographed entrances + a calm typing reveal |
| No touch feedback | Soft press + haptic on every interaction |
| `Inter` everywhere / techy display font | A warm, characterful display + a legible reading body |
| Emoji-as-UI, ✨/robot motifs | Real iconography; warmth from type, color, space — not emoji |
| Text walls | Clear hierarchy: one focal element + supporting content |
| Cold metrics dashboard | A human, relational landing ("your companion's room") |

At least one **positive identity anchor** (something branded + ownable — the companion presence, the
warm bubble, the type) must be present on every screen.

## 1. Brand — one warm accent (disciplined)

- **One signature accent**, from the approved palette, used for genuine emphasis (primary CTA,
  active state, the caret) — never as decoration and never three-at-once.
- **Semantics are semantic-only.** success / warning / error appear only for their meaning, never as
  a second "fun" color. The **crisis/safety** treatment is **grounding and supportive**, not a red
  alert.
- **Warm dark, not black.** The dark theme is warm charcoal / brown-black; pure `#000` is banned
  (halation + coldness). Light is off-white / cream / warm sand, never clinical white.
- **Gradients & texture are earned.** Reserve any gradient or paper/textile texture for a deliberate
  focal moment; never a default screen background. No ambient drifting blobs (a known AI-slop tell).

## 2. Color usage

- **Text:** primary for anything that matters; secondary for support; tertiary/muted only for
  fine-print — never a primary label, body, or placeholder.
- **Surfaces:** background → raised card → sheet, separated by **warmth and tone**, not borders or
  glow. Borders are soft and low-contrast when used at all.
- **No hardcoded hex/rgba in screens.** Tokens only.

## 3. Spacing & rhythm

- **8pt rhythm.** Use a small fixed scale (4 · 8 · 12 · 16 · 20 · 24 · 32 · 40); no arbitrary px.
- **Standard screen horizontal inset is consistent** (e.g. 20); card padding consistent within a
  screen. Generous whitespace — let content breathe; the calm *is* the premium.
- **Radius:** a token set (e.g. sm/md/lg/xl + pill). Soft continuous corners; avoid full-pill
  everything. Cards lean lg/xl; chips/avatars/pills use pill.

## 4. Typography

- Use the approved pairing — a **warm display** for headings, a **legible reading body** for
  everything else (chat especially). Pick sizes from the established scale; don't invent sizes.
- Long-form chat gets **relaxed line-height and a comfortable measure** — readability is the whole
  game for an emotional conversation. `numberOfLines` / clamping on anything that can overflow.

## 5. Motion — alive but gentle

- **Reduce-motion is a hard requirement.** Every decorative animation has a snap-to-final fallback;
  keep the haptic, drop the travel. Never let motion be the only channel for information.
- **Signature moment — the reply.** The assistant's **typing reveal** should feel like *natural
  writing* (calm, paced, never frenetic), landing softly. The first message from a new companion is
  the onboarding payoff — let it land. Don't replicate that drama on utility screens.
- Gentle staggered entrances for lists/sections; soft spring + haptic on press. No always-on heavy
  animation.

## 6. Icons

- **One committed icon family**, warm/rounded in feel (e.g. Phosphor or a soft rounded set) — outline
  default, filled for active/selected. Consistent sizes (16/18/20/24; a feature anchor ~28–32).
- White/ink glyph, **no accent-tinted icon tiles** — the accent is for genuine emphasis (active tab,
  selected card), not icon chrome. Check for glyph collisions (two features sharing a glyph reads as
  one feature).

## 7. Reuse — one of each primitive

Build a small set and reuse it everywhere — not eight look-alikes:
**companion avatar** (warm, hand-crafted — NOT a glowing orb, NOT a stock circle), **chat bubble**
(user + assistant variants), **message input dock**, **warm card**, **primary/secondary/tertiary
button**, **list-group** (hairline-separated rows in one rounded card), **segmented control**,
**chip**, **toggle**, **EmptyState**, **LoadingState (skeleton)**, **ErrorState**. If two screens
need the same shape, it's the same component.

## 8. Hierarchy & UX

- One focal element + supporting content; lead the eye to the primary action/value first. No text
  walls. The chat screen's focal element is the conversation; Home's is the companion presence.
- Touch targets ≥ 44pt. Keep the **AI-honesty cue** present but unobtrusive (it builds trust without
  nagging).

## 9. Interaction & feedback

- **Channel:** transient confirmation → toast; blocking/destructive → confirm dialog; field
  validation → **inline**. Don't over-alert.
- **States:** every button/input carries disabled + loading + pressed. Disabled = lowered opacity,
  no haptic.
- **Destructive actions** (delete account, clear data, sign out) always confirm first.
- **Surface choice:** quick focused task / picker / confirm → bottom sheet; a full sub-context →
  push. Don't push a one-field edit; don't sheet a whole flow.
- **Keyboard:** forms avoid the keyboard, keep the active field visible, tap-outside dismisses.

## 10. Content, safety & honesty

- **AI disclosure** is honest but calm — present (a quiet marker / first-session banner), never
  nagging.
- **Crisis/self-harm support** is the product's signature care moment: **grounding, warm, clearly
  actionable** (988), paired with the companion's supportive reply. **Never** an alarm-red emergency
  screen. Design it as a hand on the shoulder.
- **Report / flag a message** is low-friction and non-punitive in tone.
- **Microcopy:** warm, clear, sentence case for labels/body, Title Case only for true buttons; errors
  say what to do next. Emoji are rare, intentional accents — not filler or UI.
- **Degenerate data:** design the zero / single / very-long / error cases, not just the happy path.

## 11. Accessibility (WCAG 2.2 AA)

- Text contrast ≥ 4.5:1 (≥ 3:1 large); never rely on color alone for state.
- Touch targets ≥ 44pt; **Dynamic Type** friendly (layouts reflow at larger sizes; sanity-check XL).
- **VoiceOver:** interactive + informative elements labeled; **icon-only controls must be labeled**;
  decorative bits hidden. Honor **Reduce Motion** (§5). Honor safe areas; content clears the tab bar.

## 12. Performance (premium = smooth)

- Long lists virtualize; no always-on heavy animation; ambient motion (if any) stays cheap and slow.

## 13. The gate (run before any screen is "done")

1. One warm accent, accent-agnostic? Semantics semantic-only? Crisis = supportive, not alarm? (§1, §10)
2. Surfaces **opaque + warm**, depth from tone/soft-shadow — **no glass, no glow, no cosmic gradient**? (§0–2)
3. All spacing/radius/type/color from **tokens**, nothing hardcoded? 8pt rhythm? (§2–4)
4. Gentle entrances + soft press/haptic; **reduce-motion fallback**; typing reveal calm? (§5)
5. One committed icon family, consistent sizes, no accent tiles? (§6)
6. Reused the shared primitives instead of bespoke look-alikes? (§7)
7. Right feedback channel; destructive actions confirmed; right surface (sheet vs push); keyboard handled? (§9)
8. **Loading (skeleton) / empty / error / happy** all designed and wired to the dev-rail toggle? (§10)
9. VoiceOver labels (esp. icon-only), Dynamic Type sane, safe-area + tab-bar clearance? (§11)
10. The §0 table passes — and at least one branded, ownable **identity anchor** is present?
11. Both **warm-light and warm-dark** rendered?
