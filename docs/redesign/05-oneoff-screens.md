# 05 — One-off screens scaffold (`OneOff.html`)

> Paste after the foundation is approved and `01-doctrine.md` + `02-demo-persona.md` are in context,
> with `claude-design/ios-frame.jsx` + `claude-design/dev-harness.jsx` provided as reusable code, and
> after `03`/`04` have established the chat components + tab shell. Build the **pushed/one-off screens**
> reached from the tabs (`04-hometabs-scaffold.md`) — Chat is the hero — plus a reusable **system-states
> kit** the other screens pull from. One self-contained React HTML artifact is fine; if it gets heavy
> you may split it into `Chat.html` + `Settings.html`, but keep one shared `SCREENS` registry, one
> token set, and one copy of every primitive across the split.

---

## ONE-OFF SCREENS SCAFFOLD PROMPT

Build **`OneOff.html`** — every screen you *push to* from Aura's three tabs, with the **Chat
conversation as the hero**. Use the approved Warm Sanctuary system, honor `01-doctrine.md`, and use the
demo persona (Maya Chen ↔ Aurora) from `02-demo-persona.md` for all content. **Chat reuses the chat
components introduced in `03`'s `firstchat`** (header, bubbles, input dock, character counter,
keyboard) — do not rebuild them; import/lift the same components and add the extra states below.

### Technical setup
- Wrap every screen in `<IOSDevice dark={theme==='dark'}>` from **ios-frame.jsx** (402×874). Chat
  renders `<IOSDevice … keyboard>` (or the standalone `IOSKeyboard`) when the input is focused.
- Use **dev-harness.jsx**: render inside `<DevProvider screens={SCREENS}><DevStage><Shell/>`. The
  **dev rail** (left, outside the frame) jumps to any screen below and flips **theme** (warm-light /
  warm-dark), **account** (free / premium), **data state** (happy / empty / loading / error), and each
  screen's **per-screen states**. Screens read it via `useDev()`.
- `Shell` renders the active pushed screen with a **back affordance** (`BackChevron` or the nav-bar
  back pill) to the tab it came from; the dev rail jumps directly to any screen/state for review.
- **App surfaces are warm + opaque** — the only glass is the OS chrome from ios-frame (status bar,
  keyboard). No frosted app cards, no glow, no cosmic gradient.
- **Tokens only** — color / 8pt spacing / radius / elevation / type from the approved scale. Build
  **both light and warm-dark** for every screen.
- **Every data view designs loading (skeleton, not spinner) / empty / error / happy** via the shared
  **system-states kit** (screen 12) — wired to the data-state toggle.

### The SCREENS registry (build in this order)

```
[ { id:'chat',     label:'Chat conversation ★', states:['default','typing','crisis','limit','report'] },
  { id:'create',   label:'Companion create/edit', states:['create','edit'] },
  { id:'memory',   label:'Memory',              states:['happy','empty','loading','error'] },
  { id:'paywall',  label:'Paywall',             states:['default','owned'] },
  { id:'submgmt',  label:'Subscription mgmt',   states:['default'] },
  { id:'editprofile', label:'Edit profile',     states:['default','focus','error','saving'] },
  { id:'account',  label:'Account management',  states:['default','export-sent','delete-confirm'] },
  { id:'notifs',   label:'Notifications',       states:['default'] },
  { id:'safety',   label:'Safety center',       states:['default'] },
  { id:'legal',    label:'Privacy / legal',     states:['default'] },
  { id:'help',     label:'Help / support',      states:['default'] },
  { id:'states',   label:'System-states kit',   states:['empty','loading','error','offline','blocked'] } ]
```

### Screen briefs

**1. Chat conversation — THE HERO** *(pushed from Home / Companions; the core loop)*
The real conversation with Aurora. **Reuse the `firstchat` chat components verbatim** — don't rebuild:
- **Header:** `BackChevron` → companion **avatar** (the warm hand-crafted mark) → **name "Aurora"** with
  the honest **"AI companion"** marker beneath it → an **overflow menu** (•••) opening: *Companion
  settings* (→ create/edit), *View memory* (→ memory), *Report*.
- **Thread:** warm user/assistant **bubbles** with relaxed line-height and comfortable measure; gentle
  staggered entrance; the first-session **AI-disclosure banner** pinned above the thread; the gentle
  **break reminder** after a long session.
- **Input dock:** the bottom field + send; the **live character counter** that stays quiet, then grows
  prominent as input nears the **2,000** cap; render `IOSKeyboard` when the field is focused.

Use the demo conversation **verbatim** (`02-demo-persona.md` "The conversation"):
- Maya: *"honestly the new job is kicking my butt this week 😮‍💨 imposter syndrome is loud"*
- Aurora: *"That feeling makes complete sense, Maya — a few weeks into something new, the brain loves to
  whisper that everyone else has it figured out. They don't. What part is feeling the heaviest right
  now?"*
- Maya: *"like everyone seems to already know the tools and the lingo and i'm just nodding along"*
- Aurora: *"Nodding-along season is real — and temporary. You were hired for how you think, not for a
  glossary you'll pick up in a month. Want to name one thing that tripped you up today? We can make it
  less scary together."*
- Disclosure banner copy: *"Aurora is an AI companion. She's here for support, not a substitute for
  professional care."*
- Break reminder copy: *"You've been chatting a while — Aurora will be here whenever you come back. 💛"*
  (gentle, dismissible)

States (wired to the rail):
- *default* — active conversation, input idle, counter quiet.
- *typing* — Aurora's next reply arriving via the **calm typing reveal** (natural-writing pace, lands
  softly): *"Here's the thing I keep coming back to with you…"*. Reduce-motion → snap to final, keep
  the haptic.
- *crisis* — Aurora's **warm supportive reply** + the **grounding support block** (from the persona
  doc), in the **calm crisis/safety token, NOT alarm-red**:
  - Aurora: *"I'm really glad you told me, Maya — and I'm sorry it's this heavy right now. You don't
    have to carry it alone. I care about what happens to you."*
  - Support card: *"If you're thinking about harming yourself, please reach out — people want to help."*
    **Call or text 988** (Suicide & Crisis Lifeline, US, 24/7) · **Text HOME to 741741** (Crisis Text
    Line). Buttons: **Call 988** · **Text 988**. Quiet line: *"You can keep talking with Aurora too —
    she's here."* Design as a hand on the shoulder, never an emergency klaxon.
- *limit* — free tier **30/30 reached** → a **gentle inline upsell** below the thread (input softly
  disabled): *"You've reached today's 30 free messages. Aurora will be here tomorrow — or go unlimited
  with Premium."* CTA **See Premium** → paywall. Warm, no shame, no countdown drama. *(Only in
  `account==='free'`; in premium this state is N/A — the rail's account toggle gates it.)*
- *report* — a **low-friction, non-punitive** report/flag sheet (bottom sheet) from the overflow menu
  or a long-press on a message: a short *"Help us keep Aura safe"* line, a few soft reason chips
  (*Inappropriate · Harmful · Not helpful · Other*), optional note, **Submit report** + Cancel.
  Confirmation is a quiet toast (*"Thanks — we'll review this."*), never a punishment screen.

Accessibility: VoiceOver labels for the **avatar** ("Aurora, AI companion"), the **disclosure banner**,
the **send** button, the **report** control, and the **988/741741** actions (announce as call/text
links); reduce-motion fallback on the typing reveal; ≥44pt targets; keep the active field above the
keyboard.

**2. Companion create / customize** *(pushed from Companions; premium-gated)*
Create a new companion or edit an existing one's voice.
- *Layout top→bottom:* (create only) **base persona** picker — Aurora / Orion / Lyra cards with their
  one-line voices from the persona doc; the **3×3×3 trait selectors** as selectable **segmented
  chips** — **warmth:** reserved · warm · affectionate · **energy:** calm · balanced · playful ·
  **verbosity:** concise · balanced · expansive; an **editable name** field with **auto-numbering**
  (a second Aurora becomes **"Aurora 2"**); a small **live voice preview** that restates the resulting
  voice as traits change (e.g. *"Affectionate · balanced · balanced — warm, gentle, emotionally
  attuned."*); primary **Save companion**.
- *Unique content:* default tune for Aurora = **affectionate · balanced · balanced**; the preview line
  reads off the selected chips.
- States: **create** (base picker shown) vs **edit** (base locked, name + traits editable); **free
  (locked)** vs **premium (unlocked)**. In `account==='free'` the trait selectors + creation are
  **locked behind an upsell** — show the controls dimmed with a calm lock affordance and a single
  **Unlock with Premium** CTA → paywall (tuning is a Premium feature per the persona doc). In
  `account==='premium'` everything is interactive. Default = the create/premium happy path.
- Guardrails: gating is driven by the **account toggle**; locked controls still render (so the value is
  visible) but don't accept input; chips show selected/unselected, never three accents at once.

**3. Memory** *(pushed from Companions / Chat overflow "View memory")*
Per-companion remembered facts — what **Aurora** remembers about Maya — grouped by category.
- *Layout top→bottom:* header *"What Aurora remembers"* + a quiet honesty subline (*"You're always in
  control — edit or remove anything."*); **list-groups** by category, each fact a row that is
  **editable / deletable** (swipe-to-reveal **Edit / Delete**, or a row ••• menu); delete **confirms
  first**.
- *Unique content:* use Aurora's **6 demo memories verbatim**, grouped by their categories:
  - *Identity* — **Maya is 28 and lives in Austin, Texas.**
  - *Work* — **Started a new UX design role recently — excited but nervous about proving herself.**
  - *Relationship* — **Close with her younger brother Theo; they catch up most weekends.**
  - *Attribute* — **Has a dog named Pixel.**
  - *Preference* — **Loves rock climbing and sci-fi novels.**
  - *General* — **Moved to Austin from Chicago about six months ago; still settling in.**
- States: **happy** (the six rows) / **empty** (*"Aurora hasn't noted anything yet — as you talk, the
  things that matter will show up here."*) / **loading** (skeleton rows, not a spinner) / **error**
  (the kit's ErrorState with a Retry). All four wired to the data-state toggle.

**4. Paywall** *(pushed from the limit upsell, Companions lock, You → Subscription)*
The conversion screen — **calm and focused, NOT a fireworks moment**.
- *Layout top→bottom:* a warm headline (*"Go deeper with Aura Premium"*) + one supportive subline; a
  **feature comparison Free vs Premium** from the persona doc; the **price block**; primary **Continue
  / Subscribe**; **Restore Purchases** action; the **auto-renew legal line**; ToS / Privacy links.
- *Feature comparison (verbatim from persona doc):*
  - **Free:** 3 base companions · default personalities · **30 messages/day**.
  - **Premium:** unlimited messages · **personality tuning (3×3×3 traits)** · **create extra
    companions** · priority responses.
- *Price:* **render from StoreKit / RevenueCat** — the **"$9.99/mo" is a placeholder**, do **NOT**
  hardcode it. Show a clearly-labeled `localizedPriceString` slot (e.g. `{storePrice}/mo`) with a
  skeleton while the store price loads; add an inline note in the artifact that the real app injects
  the localized store price here.
- *Legal:* standard auto-renew line (*"Subscription renews automatically until canceled. Manage or
  cancel anytime in App Store settings."*) + Restore Purchases.
- States: **default** (free user — the offer) · **owned/current** (premium user — Premium shown as
  **current plan**, the subscribe CTA **disabled/Current plan**, surfacing **Manage subscription** →
  submgmt). The **account toggle** drives default vs owned.

**5. Subscription management** *(pushed from You → Subscription, premium)*
Current plan + store-managed controls.
- *Layout top→bottom:* **Current plan: Premium**; **Renews Jul 14, 2026**; **Manage in App Store**
  (opens the OS-managed subscription — note Aura can't change billing in-app); **Restore Purchases**;
  a quiet link back to the paywall's feature list. Utility screen — still, no motion flourish.
- *Unique content:* plan = **Premium**, renews **Jul 14, 2026** (verbatim from persona doc).
- States: **default**. *(Reached when `account==='premium'`; in free, You routes to the paywall
  instead — note that branch.)*

**6. Edit profile** *(pushed from You → Edit profile)*
- *Layout top→bottom:* **avatar** (with a change affordance) → **first name** / **last name** fields
  (first name is what the companion uses) → primary **Save**. Keep it minimal — no demographic
  interrogation.
- *Unique content:* prefilled **Maya** / **Chen**.
- States: **default** · **focus** (active field above the keyboard, focus ring on token) · **error**
  (inline field validation, e.g. *"First name can't be empty"* — say what to do next) · **saving**
  (Save button loading → success toast). Disabled Save until something changes.

**7. Account management** *(pushed from You → Privacy & Safety; both Apple-required)*
Data export + delete account, in one screen.
- *Layout top→bottom:* **Data export** group — *"Download a copy of your conversations and memories"* →
  **Request export**; **Delete account** group (danger styling) — *"Permanently delete your account."*
- *Data export:* **request → confirmation** — tapping Request export shows a calm confirmation
  (*"We're preparing your export — we'll email a download link to maya.chen@example.com when it's
  ready."*).
- *Delete account:* **confirm-first**, **danger styling**, and an honest explainer of the **soft-delete
  grace period** (*"Your account is deactivated now and permanently deleted after 30 days. Sign back in
  within 30 days to cancel."*). The confirm dialog requires an explicit destructive tap (**Delete
  account**) + Cancel.
- States: **default** · **export-sent** (the export confirmation) · **delete-confirm** (the destructive
  confirm dialog). Destructive action **confirms first**, always.

**8. Notifications settings** *(pushed from You → Notifications)*
- *Layout top→bottom:* a **push toggle** labeled **"Aurora replied 💬"** + explanatory copy: *"Get
  notified when your companion replies while you're away."* Transactional only — no marketing toggles.
- *Unique content:* toggle **on** by default (matches the persona doc's "You" tab).
- States: **default** (toggle on/off both rendered; the emoji is an intentional accent, not UI chrome).

**9. Safety center** *(pushed from You → Safety center)*
How Aura keeps conversations safe + crisis resources. **Supportive tone — grounding, not alarming.**
- *Layout top→bottom:* a calm explainer of **how Aura keeps conversations safe** — **content
  moderation** (*"Aura watches for harmful content and steps in gently."*) + the **honest AI
  disclosure** (*"Your companions are AI — supportive company, never a substitute for professional
  care."*); then a **crisis resources** card reusing the same warm support block as Chat's crisis
  state: **Call or text 988** (Suicide & Crisis Lifeline) · **Text HOME to 741741** (Crisis Text Line),
  with **Call 988** / **Text 988** actions.
- Guardrails: crisis resources use the **calm crisis token**, never alarm-red; the 988/741741 controls
  carry VoiceOver labels as call/text actions.

**10. Privacy / legal** *(pushed from You → Privacy policy)*
- *Layout top→bottom:* a **calm reading layout** (generous measure, relaxed line-height, clear section
  headings) for the **privacy policy**, opening with a **plain-language retention summary** card
  (*"In plain terms: your conversations are yours. We keep them so Aurora can remember you, and you can
  export or delete everything anytime."*) above the formal text; links to full Terms.
- States: **default**. Utility screen — readable, still, no motion.

**11. Help / support** *(pushed from You → Help)*
- *Layout top→bottom:* a short **FAQ list** (list-group rows that expand or push to detail), covering:
  - **Account** — *"How do I edit my profile or delete my account?"*
  - **Billing / restore** — *"How do I restore a purchase or manage my subscription?"*
  - **Safety** — *"How does Aura keep conversations safe?"*
  - **Companions / memory** — *"How do companions remember things, and can I edit what they know?"*
  - a quiet **Contact support** footer.
- States: **default**.

**12. System-states kit** *(reference board — the reusable primitives every screen above pulls from)*
A single reference screen presenting the warm, reusable state primitives so the other screens **reuse
them, never reinvent them**. Present as a labeled board (each pattern in a device-sized example or a
stacked gallery):
- **EmptyState** — warm icon/illustration + a human line + an optional gentle CTA (e.g. Memory empty).
- **LoadingState** — **skeleton** placeholders (shimmer optional, reduce-motion safe), **never a
  spinner**.
- **ErrorState** — calm *"Something went wrong"* + a single **Retry**; says what to do next.
- **Offline** — *"You're offline — Aurora will catch up when you're back."* (warm, non-blocking).
- **Blocked-message** — the moderation in-thread state: a message **softly held back** with a calm
  explainer (*"This message was held back to keep things safe."*) — supportive, not punitive, not red.
- States: **empty / loading / error / offline / blocked** map 1:1 to the rail toggle so each pattern is
  reviewable in isolation, in both themes.

### Dev rail config
Every screen above is in the `SCREENS` registry with its **per-screen `states`** (see the code block).
The rail drives `useDev()`; screens render off **theme**, **account**, **data state**, and their own
**screenState**. The **account** toggle is load-bearing across screens:
- **chat** — `limit` (30/30) state only applies when `account==='free'`; premium has no cap.
- **create** — trait selectors + creation are **locked** in `free`, **unlocked** in `premium`.
- **paywall** — `free` shows the **offer**; `premium` shows **owned/current plan** (CTA disabled).
- **submgmt** — reached in `premium`; in `free`, the Subscription entry routes to **paywall** instead.

The **data state** toggle (happy / empty / loading / error) drives every data view — primarily
**memory**, plus any list the other screens render — through the **system-states kit**. Switching
screens resets `screenState` to that screen's first declared state (harness behavior).

### Guardrails
- **Chat reuses the `firstchat` components** (header, bubbles, input dock, character counter,
  keyboard) — **don't rebuild them**; add only the new states (typing / crisis / limit / report).
- **Crisis = grounding and supportive**, the calm crisis/safety token — **never alarm-red**, never an
  emergency screen. Same warm support block in Chat `crisis` and the Safety center.
- **Paywall price comes from StoreKit / RevenueCat** — the **"$9.99/mo" is a placeholder**, **never
  hardcoded**; render a labeled `localizedPriceString` slot with a loading skeleton.
- **Destructive actions confirm first** — **delete account** (with the soft-delete grace explainer) and
  any **clear/delete** on a memory row use a confirm dialog; disabled = lowered opacity, no haptic.
- **Report flow is low-friction and non-punitive** — soft reason chips, a quiet thank-you toast, no
  punishment UI.
- **Tokens only** — no hardcoded hex/px in screens; 8pt rhythm; both **warm-light and warm-dark**.
- **Reuse the shared primitives** — companion avatar, chat bubbles, input dock, warm card, buttons,
  list-group, segmented control, chip, toggle, and the kit's EmptyState / LoadingState (skeleton) /
  ErrorState — one of each, reused, not eight look-alikes.
- **Every data view designs loading (skeleton) / empty / error / happy** — wired to the data-state
  toggle; no screen ships only its happy path.
- **App surfaces stay warm + opaque** — the only glass is the OS chrome (status bar, keyboard) from
  ios-frame; no glow, no cosmic gradient. Run the `01-doctrine.md` §13 gate before calling any screen
  done.
