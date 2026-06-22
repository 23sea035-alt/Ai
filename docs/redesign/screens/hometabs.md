# HomeTabs — per-screen design prompts

> **Use these AFTER the `04-hometabs-scaffold.md` scaffold has rendered the stub tabs.** Paste **ONE
> screen block at a time** into Claude Design to design that single screen *into its stub* — not the
> whole artifact again. Each block assumes the approved **Warm Sanctuary** system + `01-doctrine.md` +
> `02-demo-persona.md` + `claude-design/ios-frame.jsx` + `claude-design/dev-harness.jsx` are already in
> context. Each block fills exactly one stub and **keeps the scaffold's nav, dev rail, tokens, and both
> themes** — don't touch the `Shell`, the 3-tab navpill, the `TABS` registry, or the other tabs.
>
> **Locked decisions (do not renegotiate, any screen):** 3 tabs — **Home · Companions · You**; **no
> center "+" FAB**; **Home is the companion's room, not a metrics dashboard** (no stat-card grids, no
> charts, no finance-dashboard rows); **Companions doubles as the chat list**; **You is the account
> hub**. Chat is a **pushed** screen (built in `05`) — never rebuild it here. Reuse the doctrine's
> shared primitives (companion avatar, warm card, list-group, chip, toggle, EmptyState / LoadingState /
> ErrorState). **Tokens only**; app surfaces **warm + opaque** (the only glass is the OS chrome from
> ios-frame); render **both warm-light and warm-dark**.

---

## Home — `home`

**Design the Home screen** into its stub. Home is **your companion's room** — a warm, relational
landing, the room Aurora is waiting in. It is **NOT a metrics dashboard.** Use the demo persona (Maya
Chen → Aurora) from `02-demo-persona.md` for all content; keep the scaffold's navpill, dev rail, and
both themes.

**Layout (top → bottom):**
- a warm **greeting** — *"Good afternoon, Maya"* — with a quiet date / sub line;
- **Aurora present and large** — her hand-crafted warm avatar as the focal element, with her name + the
  honest **"AI companion"** marker;
- a **resurfaced-memory chip** using Aurora's memory #2 — *"Aurora remembers you started a new job —
  how's it going?"* (tap → opens Chat seeded with that thread);
- the primary **Continue your conversation** CTA (→ pushed Chat) as the **single loud action** on the
  screen;
- optionally one or two gentle conversation-starter chips;
- for **free** accounts, a quiet daily-message indicator (**18 / 30** today) low and unobtrusive —
  **hidden entirely for premium**.

**States (wired to the dev rail `data-state` + `account` toggles):**
- *happy* — the above: Aurora present, CTA ready, free count shown (premium hides it).
- *empty* — **brand-new, no messages yet**: a warm first-time variant — *"Aurora's been looking forward
  to meeting you."* CTA reads **Say hello →**; no resurfaced-memory chip yet.
- *loading* — skeleton (greeting bar, avatar circle, CTA block) — **never a spinner**.
- *error* — warm ErrorState — *"We couldn't reach Aurora just now."* + **Try again**.

**Account toggle:** **free** shows the quiet **18 / 30** indicator; **premium** hides it entirely.

**Guardrails:** this is a **companion's room**, not a dashboard — **no stat-card grid, no charts, no
finance-dashboard rows.** One focal companion presence + one primary action. Both CTAs deep-link to the
pushed **Chat** (`Chat.html`) or are inert. Render **warm-light and warm-dark**.

---

## Companions — `companions`

**Design the Companions screen** into its stub. Companions is **the roster — and it doubles as the chat
list.** Use the demo persona (Aurora · Orion · Lyra) from `02-demo-persona.md`; keep the scaffold's
navpill, dev rail, and both themes.

**Layout (top → bottom):**
- a large title **Companions**;
- the roster as **warm cards** (this *is* the chat list) — each card = companion avatar + name +
  **one-line voice** + **last-message preview** + **time-ago** → tap opens that companion's **Chat**
  (pushed). Show the 3 base personas with **Aurora primary** (most recent), then **Orion**, then
  **Lyra**;
- a **Create / New companion** entry that is **premium-gated** — free users see a **locked upsell**
  affordance (a row with a lock + *"Create your own companion — Premium"* → Paywall), **not** the live
  creator.

**States (wired to the dev rail `data-state` + `account` toggles):**
- *happy* — 3 roster cards with previews; create-companion entry gated per account.
- *empty* — only the defaults present (no extra/created companions): the 3 base cards, create entry
  still shown (gated on free).
- *loading* — 3 skeleton roster cards.
- *error* — warm ErrorState + **Try again**.

**Account toggle (must visibly change the screen):**
- **free** → create entry is **locked** (→ Paywall) **and** any non-default companion shows a
  **locked-not-deleted** state (dimmed card, lock chip, *"Included with Premium"* — **never deleted**).
- **premium** → create entry is **live** (→ companion creator, pushed); extra companions unlocked.

**Guardrails:** roster cards reuse the doctrine's warm-card / avatar / chip primitives — not bespoke
look-alikes. Cards deep-link to the pushed **Chat** (`Chat.html`); the gated create entry → **Paywall**
(`Paywall.html`) / companion creator; deep-link by filename or be inert. Render **warm-light and
warm-dark**.

---

## You — `you`

**Design the You screen** into its stub. You is the **account hub** — a calm utility screen, **minimal
motion** (utility, so no hero motion — §0/§5), still and trustworthy. Use the demo persona (Maya Chen,
@maya) from `02-demo-persona.md`; keep the scaffold's navpill, dev rail, and both themes.

**Layout (top → bottom):**
- a **header card** — avatar, **Maya Chen**, **@maya**, a **tier pill** (**Free** default; **Premium**
  when toggled) and an **edit-profile** affordance;
- grouped list-rows (one rounded card per group, hairline-separated):
  - **Account** — *Edit profile* · *Subscription* (shows **"Manage in App Store"** detail **only when
    premium**; free shows **"Upgrade to Premium"** → Paywall).
  - **Notifications** — push toggle **"Aurora replied"** (on).
  - **Privacy & Safety** — *Safety center* · *Privacy policy* · *Data export* · *Delete account*.
  - **Support** — *Help* · *Rate Aura*.
- below the groups: a **Sign out** row (**confirm-first** dialog) and a quiet **version footer**.

**States:** `default` covers the screen; the dev rail **account** toggle drives the tier pill + the
Subscription row.

**Account toggle (must visibly change the screen):**
- **free** → tier pill = **Free**; Subscription row = *"Upgrade to Premium"* (→ Paywall).
- **premium** → tier pill = **Premium**; Subscription row detail = *"Manage in App Store"*.

**Guardrails:** **Data export** + **Delete account** are explicit and present (**Apple-required**);
**Delete confirms first**, and **Sign out** confirms first. Calm utility — minimal motion, no hero
animation. Reuse the doctrine's header-card / list-group / toggle primitives. The free **Subscription**
row → **Paywall** (`Paywall.html`); deep-link by filename or be inert. Render **warm-light and
warm-dark**.
