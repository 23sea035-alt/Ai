# Approved tokens — Option A "Reading Nook" (LOCKED 2026-06-22)

> The palette + type direction is **locked to Option A**. Paste this as the system in any Claude Design
> session (it replaces Step 1 of [`00-foundation.md`](00-foundation.md) — no more proposing). Every
> scaffold + per-screen prompt builds from these tokens. Terracotta on warm paper, warm-light +
> warm-dark, depth from soft warm shadow (no glow/glass). Meets WCAG 2.2 AA.

**Type:** **Newsreader** (warm literary serif) for display/headings · **Hanken Grotesk** for body & UI.

## Color tokens

| Role | Warm-light | Warm-dark |
|---|---|---|
| Background | `#F4ECE0` | `#1B1712` |
| Raised card | `#FBF5EB` | `#25201A` |
| Sheet / modal | `#FFFCF6` | `#2E2820` |
| Text · primary | `#2A241E` | `#F1E8DC` |
| Text · secondary | `#6A5D50` | `#BFB2A2` |
| Text · tertiary | `#9C8E7E` | `#8A7E70` |
| Text · disabled | `#C2B6A7` | `#5C5347` |
| **Accent (primary)** | `#B85432` | `#E2855E` |
| Border / divider | `#E6DBCB` | `#393129` |
| Success | `#5C7850` | `#8AA47C` |
| Warning | `#B07A22` | `#D7A24E` |
| Error | `#B0463A` | `#D9725F` |
| Crisis / safety | `#3D6B5C` | `#6FA08C` |

- **One accent.** Terracotta is for the primary CTA, active state, and caret only — never decoration,
  never three-at-once. The **crisis/safety** green is reserved for safety moments (grounding, not alarm).
- **Accent-contrast rule:** terracotta `#B85432` on cream is fine as a **fill** (with `#FFFCF6` text) or
  for **large/active** text; for small accent-colored body text, darken it or use the dark-theme tone —
  don't put thin terracotta text on cream.

## Type scale

| Role | Font | Size / line · weight |
|---|---|---|
| Display | Newsreader | 40 / 44 · 600 |
| Headline | Newsreader | 30 / 36 · 600 |
| Title | Newsreader | 22 / 28 · 600 |
| Body · chat | Hanken Grotesk | 17 / 26 · 400 |
| Label | Hanken Grotesk | 14 / 18 · 600 |
| Caption | Hanken Grotesk | 12 / 16 · 500 |

Long-form chat uses Body (17/26) with a relaxed measure — readability is the priority.

## Spacing · radius · elevation

- **Spacing (8pt rhythm):** `4 · 8 · 12 · 16 · 24 · 32 · 48`. Standard screen horizontal inset = 20–24.
- **Radius:** `8 · 12 · 16 · 20 · full`. Cards lean 16/20; chips/avatars/pills use full; avoid pill-everything.
- **Elevation (warm shadow, never glow):**
  - `e1` — `0 1px 2px rgba(60,40,25,.06)`
  - `e2` — `0 4px 14px rgba(60,40,25,.09)`
  - `e3` — `0 12px 30px rgba(60,40,25,.14)`
