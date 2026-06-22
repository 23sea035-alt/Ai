# 04 — HomeTabs scaffold (`HomeTabs.html`)

> Paste after the foundation is approved and `01-doctrine.md` + `02-demo-persona.md` are in context,
> with `claude-design/ios-frame.jsx` + `claude-design/dev-harness.jsx` provided as reusable code.
> Build **one self-contained React HTML artifact** = the signed-in **3-tab app shell** (the home a
> user lands in *after* onboarding). Pushed screens (Chat, Paywall, …) are built in `05`.

---

## HOMETABS SCAFFOLD PROMPT

Build **`HomeTabs.html`** — Aura's signed-in shell: a calm **3-tab** app (**Home · Companions · You**)
with a clean tab navpill and **no center "+" FAB**. Use the approved Warm Sanctuary system, honor
`01-doctrine.md`, and use the demo persona (Maya Chen → companion Aurora) from `02-demo-persona.md`
for all content. **Chat is a pushed screen, not a tab** (built in `05`); from here it is reached by the
primary CTA and by tapping a companion.

### Technical setup
- Wrap every screen in `<IOSDevice dark={theme==='dark'}>` from **ios-frame.jsx** (402×874).
- Use **dev-harness.jsx**: render the app inside `<DevProvider screens={TABS}><DevStage>…`. The
  **dev rail** (left, outside the frame) must let me jump to any tab below and flip **theme**,
  **account**, **data state**, and each tab's **per-screen states**. Screens read `useDev()`.
- A `Shell` keeps the **active tab** and renders it under a persistent **3-tab navpill**; the dev rail
  can also jump directly to any tab for review. Build **both light and warm-dark**.
- **App surfaces are warm + opaque** — the only glass is the OS chrome from ios-frame.

### The TABS registry (build in this order = left→right in the navpill)

```
[ { id:'home',       label:'Home',       states:['happy','empty','loading','error'] },
  { id:'companions', label:'Companions', states:['happy','empty','loading','error'] },
  { id:'you',        label:'You',        states:['default'] } ]
```

### Screen briefs

**1. Home — your companion's room** *(NOT a metrics dashboard)*
A warm, relational landing — the room your companion is waiting in, not a stats screen. Top→bottom:
a warm **greeting** (*"Good afternoon, Maya"*) with a quiet date/sub line; **Aurora present and large**
— her hand-crafted warm avatar as the focal element with her name + the honest "AI companion" marker;
a **resurfaced-memory chip** using Aurora's memory #2 — *"Aurora remembers you started a new job —
how's it going?"* (tap → opens Chat seeded with that thread); the primary **Continue your conversation**
CTA (→ pushed Chat) as the single loud action on the screen; optionally one or two gentle
conversation-starter chips. For **free** accounts, a quiet daily-message indicator (**18 / 30** today)
sits low and unobtrusive — **hidden entirely for premium**.
- *happy*: the above, Aurora present, CTA ready, free count shown (premium hides it).
- *empty*: **brand-new, no messages yet** — a warm first-time variant: *"Aurora's been looking forward
  to meeting you."* CTA reads **Say hello →**; no resurfaced-memory chip yet.
- *loading*: skeleton (greeting bar, avatar circle, CTA block) — never a spinner.
- *error*: warm ErrorState — *"We couldn't reach Aurora just now."* + **Try again**.
- *Guardrail:* this is a **companion's room**, not a dashboard — **no stat-card grid, no charts, no
  finance-dashboard rows.** One focal companion presence + one primary action.

**2. Companions — the roster (and the chat list)**
Large title **Companions**. The roster as warm cards (this *is* the chat list): each card =
companion avatar + name + **one-line voice** + **last-message preview** + **time-ago** → tap opens that
companion's **Chat** (pushed). Show the 3 base personas with **Aurora primary** (most recent), then
**Orion**, then **Lyra**. A **Create / New companion** entry that is **premium-gated**: free users see a
**locked upsell** affordance (a row with a lock + *"Create your own companion — Premium"* → Paywall),
**not** the live creator.
- *happy*: 3 roster cards with previews; create-companion entry gated per account.
- *empty*: only the defaults present (no extra/created companions) — the 3 base cards, create entry
  still shown (gated on free).
- *loading*: 3 skeleton roster cards.
- *error*: warm ErrorState + **Try again**.
- *account*: **free** → create entry is locked (→ Paywall) **and** any non-default companion shows a
  **locked-not-deleted** state (dimmed card, lock chip, *"Included with Premium"* — never deleted).
  **premium** → create entry is live (→ companion creator, pushed); extra companions unlocked.

**3. You — account hub** *(calm utility screen, minimal motion)*
A still, trustworthy settings screen (utility, so no hero motion — §0/§5). Top→bottom:
a **header card** — avatar, **Maya Chen**, **@maya**, a **tier pill** (**Free** default; **Premium**
when toggled) and an **edit-profile** affordance. Then grouped list-rows (one rounded card per group,
hairline-separated):
- **Account** — *Edit profile* · *Subscription* (shows **"Manage in App Store"** detail **only when
  premium**; free shows **"Upgrade to Premium"** → Paywall).
- **Notifications** — push toggle **"Aurora replied"** (on).
- **Privacy & Safety** — *Safety center* · *Privacy policy* · *Data export* · *Delete account*.
- **Support** — *Help* · *Rate Aura*.
Below the groups: a **Sign out** row (**confirm-first** dialog) and a quiet **version footer**.
- **Data export** + **Delete account** are explicit (Apple-required); **Delete confirms first**.
- *account*: **free** → tier pill = Free, Subscription row = *"Upgrade to Premium"*. **premium** →
  tier pill = Premium, Subscription row detail = *"Manage in App Store"*.
- (States: free vs premium drive the tier pill + Subscription row; `default` covers the rest.)

### Dev rail config
The **TABS** are the jumpable screens. The rail's **theme** (light / warm-dark), **account**
(free / premium), and **data-state** (happy / empty / loading / error) toggles drive `useDev()`, plus
each tab's **per-screen states** above. The **account** toggle must visibly change all three tabs:
**Home** (free shows 18/30, premium hides it), **Companions** (free gates create + locks extras,
premium unlocks both), and **You** (tier pill + Subscription row). Flipping a toggle is the forcing
function to prove every state is built.

### Flow wiring
`Shell` holds the **active tab** (`home` default) and renders it above a persistent **3-tab navpill**;
tapping a pill switches tabs (active pill uses the one warm accent — outline icon → filled when
active). Primary CTAs lead to **pushed** screens that live in other artifacts: Home's **Continue your
conversation** and the resurfaced-memory chip → **Chat**; Companions' cards → that companion's
**Chat**; the gated create entry and free **Subscription** row → **Paywall** / companion creator. In
this prototype those may **deep-link by filename** (e.g. `Chat.html`, `Paywall.html`) or be **inert**
— mirror how the sibling Amibroke `HomeTabs.html` linked out to other HTML files. The dev rail can jump
to any tab/state independently for review.

### Guardrails
- **No FAB.** A clean **3-tab** navpill — the core action is **"continue your conversation,"**
  foregrounded on Home; a center "+" would be decoration and off-brand for Warm Sanctuary.
- **Home ≠ dashboard.** It's the companion's room — warm + relational. No stat-card grids, charts, or
  finance-dashboard patterns.
- **Three calm tabs.** Home · Companions · You. Chat is pushed, built in `05` — don't rebuild it here.
- **Reuse the shared primitives** from the doctrine (companion avatar, warm card, list-group, chip,
  toggle, EmptyState / LoadingState / ErrorState) — same shapes the other artifacts use, not bespoke
  look-alikes.
- **Tokens only**; render **both warm-light and warm-dark**; app surfaces warm + opaque (no glass on
  app content, no glow, no cosmic gradient).
- **Every data view designs loading (skeleton) / empty / error / happy** — wired to the dev-rail
  data-state toggle. Destructive **Sign out** + **Delete account** confirm first.
