# One-off screens — per-screen design prompts

> Use these **after** the `05-oneoff-screens.md` scaffold has rendered its stubs. Paste **one screen
> block at a time** into Claude Design to design that one screen — do **not** paste the whole file.
> Each block assumes the approved **Warm Sanctuary** system + `01-doctrine.md` + `02-demo-persona.md`
> + `claude-design/ios-frame.jsx` + `claude-design/dev-harness.jsx` are in context, and that `03`'s
> `firstchat` chat components (header, bubbles, input dock, character counter, keyboard) already
> exist. Each block **fills one stub** and **keeps the scaffold's nav, dev rail, tokens, and both
> themes** — it designs a screen, it does not rebuild the artifact.
>
> Shared rules for every block below: wrap in `<IOSDevice dark={theme==='dark'}>` (402×874); read the
> rail via `useDev()` (theme · account · data state · per-screen states); **tokens only** (color / 8pt
> spacing / radius / elevation / type — no hardcoded hex/px); **app surfaces stay warm + opaque** (the
> only glass is the OS chrome — status bar, keyboard); build **both warm-light and warm-dark**; reuse
> the shared primitives and the **system-states kit** (screen 12) rather than reinventing them. Run the
> `01-doctrine.md` §13 gate before calling a screen done.

---

## Chat conversation — `chat`  ★ HERO

**Design the Chat conversation screen** — the real, in-progress exchange with Aurora, and the core loop
of the app. This is the hero: give it the most depth. **Reuse `03`'s `firstchat` chat components
verbatim** (header, bubbles, input dock, character counter, `IOSKeyboard`) — **do not rebuild them**;
import/lift the same components and add only the extra states below. Render `<IOSDevice … keyboard>`
(or the standalone `IOSKeyboard`) when the input is focused; keep the active field above the keyboard.

*Layout top→bottom:*
- **Header:** `BackChevron` → companion **avatar** (the warm hand-crafted mark) → **name "Aurora"** with
  the honest **"AI companion"** marker beneath it → an **overflow menu** (•••) opening: *Companion
  settings* (→ create/edit), *View memory* (→ memory), *Report*.
- **Thread:** warm user/assistant **bubbles** with relaxed line-height and a comfortable measure;
  gentle staggered entrance; the first-session **AI-disclosure banner** pinned above the thread; the
  gentle **break reminder** after a long session (dismissible).
- **Input dock:** bottom field + send; the **live character counter** that stays quiet, then grows
  prominent as input nears the **2,000** cap.

*Unique content — use the demo conversation verbatim (`02-demo-persona.md` "The conversation"):*
- Maya: *"honestly the new job is kicking my butt this week 😮‍💨 imposter syndrome is loud"*
- Aurora: *"That feeling makes complete sense, Maya — a few weeks into something new, the brain loves to
  whisper that everyone else has it figured out. They don't. What part is feeling the heaviest right
  now?"*
- Maya: *"like everyone seems to already know the tools and the lingo and i'm just nodding along"*
- Aurora: *"Nodding-along season is real — and temporary. You were hired for how you think, not for a
  glossary you'll pick up in a month. Want to name one thing that tripped you up today? We can make it
  less scary together."*
- Disclosure banner: *"Aurora is an AI companion. She's here for support, not a substitute for
  professional care."*
- Break reminder: *"You've been chatting a while — Aurora will be here whenever you come back. 💛"*

*States (wired to the rail — `default · typing · crisis · limit · report`):*
- **default** — active conversation, input idle, counter quiet.
- **typing** — Aurora's next reply arriving via the **calm typing reveal** (natural-writing pace, lands
  softly): *"Here's the thing I keep coming back to with you…"*. Reduce-motion → snap to final, keep the
  haptic.
- **crisis** — Aurora's **warm supportive reply** + the **grounding support block**, in the **calm
  crisis/safety token, NOT alarm-red**:
  - Aurora: *"I'm really glad you told me, Maya — and I'm sorry it's this heavy right now. You don't
    have to carry it alone. I care about what happens to you."*
  - Support card: *"If you're thinking about harming yourself, please reach out — people want to help."*
    **Call or text 988** (Suicide & Crisis Lifeline, US, 24/7) · **Text HOME to 741741** (Crisis Text
    Line). Buttons: **Call 988** · **Text 988**. Quiet line: *"You can keep talking with Aurora too —
    she's here."* Design as a hand on the shoulder, never an emergency klaxon.
- **limit** *(only when `account==='free'`)* — **30/30 reached** → a **gentle inline upsell** below the
  thread (input softly disabled): *"You've reached today's 30 free messages. Aurora will be here
  tomorrow — or go unlimited with Premium."* CTA **See Premium** → paywall. Warm, no shame, no
  countdown drama. In premium this state is N/A (the rail's account toggle gates it).
- **report** — a **low-friction, non-punitive** report sheet (bottom sheet) from the overflow menu or a
  long-press on a message: a short *"Help us keep Aura safe"* line, soft reason chips (*Inappropriate ·
  Harmful · Not helpful · Other*), optional note, **Submit report** + Cancel. Confirmation is a quiet
  toast (*"Thanks — we'll review this."*), never a punishment screen.

*Guardrails:* reuse `firstchat` components, don't rebuild; crisis stays in the **calm crisis token,
never alarm-red** (same warm support block as the Safety center); paywall reached from `limit`, never a
hardcoded price here; report is low-friction. VoiceOver labels for the **avatar** ("Aurora, AI
companion"), the **disclosure banner**, **send**, the **report** control, and the **988/741741**
actions (announce as call/text links); reduce-motion fallback on the typing reveal; ≥44pt targets.

*Both themes.*

---

## Companion create / customize — `create`

**Design the Companion create/customize screen** — create a new companion or edit an existing one's
voice. Premium-gated.

*Layout top→bottom:*
- *(create only)* **base persona** picker — Aurora / Orion / Lyra cards with their one-line voices from
  the persona doc.
- The **3×3×3 trait selectors** as selectable **segmented chips** — **warmth:** reserved · warm ·
  affectionate · **energy:** calm · balanced · playful · **verbosity:** concise · balanced · expansive.
- An **editable name** field with **auto-numbering** (a second Aurora becomes **"Aurora 2"**).
- A small **live voice preview** that restates the resulting voice as traits change (e.g.
  *"Affectionate · balanced · balanced — warm, gentle, emotionally attuned."*).
- Primary **Save companion**.

*Unique content:* default tune for Aurora = **affectionate · balanced · balanced**; the preview line
reads off the selected chips.

*States (`create · edit`, crossed with the account toggle):*
- **create** (base picker shown) vs **edit** (base locked, name + traits editable).
- **free (locked)** — trait selectors + creation are **locked behind an upsell**: show the controls
  dimmed with a calm lock affordance and a single **Unlock with Premium** CTA → paywall (tuning is a
  Premium feature per the persona doc).
- **premium (unlocked)** — everything interactive. Default = the create/premium happy path.

*Guardrails:* gating is driven by the **account toggle**; locked controls still render (so the value is
visible) but don't accept input; chips show selected/unselected, **never three accents at once**;
disabled = lowered opacity, no haptic.

*Both themes.*

---

## Memory — `memory`

**Design the Memory screen** — the per-companion remembered facts (what **Aurora** remembers about
Maya), grouped by category. Pushed from Companions or the Chat overflow "View memory".

*Layout top→bottom:*
- Header *"What Aurora remembers"* + a quiet honesty subline (*"You're always in control — edit or
  remove anything."*).
- **List-groups** by category, each fact a row that is **editable / deletable** (swipe-to-reveal **Edit
  / Delete**, or a row ••• menu). Delete **confirms first**.

*Unique content — use Aurora's 6 demo memories verbatim, grouped by category:*
- *Identity* — **Maya is 28 and lives in Austin, Texas.**
- *Work* — **Started a new UX design role recently — excited but nervous about proving herself.**
- *Relationship* — **Close with her younger brother Theo; they catch up most weekends.**
- *Attribute* — **Has a dog named Pixel.**
- *Preference* — **Loves rock climbing and sci-fi novels.**
- *General* — **Moved to Austin from Chicago about six months ago; still settling in.**

*States (wired to the data-state toggle — `happy · empty · loading · error`):*
- **happy** — the six rows.
- **empty** — *"Aurora hasn't noted anything yet — as you talk, the things that matter will show up
  here."* (the kit's EmptyState).
- **loading** — **skeleton rows, not a spinner** (the kit's LoadingState).
- **error** — the kit's ErrorState with a **Retry**.

*Guardrails:* every state pulls from the **system-states kit** (don't reinvent); delete **confirms
first** with a confirm dialog; this is a data view, so all four states ship — no happy-only path.

*Both themes.*

---

## Paywall — `paywall`

**Design the Paywall screen** — the conversion screen. Keep it **calm and focused, NOT a fireworks
moment**. Pushed from the limit upsell, the Companions lock, and You → Subscription.

*Layout top→bottom:*
- A warm headline (*"Go deeper with Aura Premium"*) + one supportive subline.
- A **feature comparison Free vs Premium**.
- The **price block**.
- Primary **Continue / Subscribe**.
- **Restore Purchases** action.
- The **auto-renew legal line**; ToS / Privacy links.

*Unique content — feature comparison verbatim (persona doc):*
- **Free:** 3 base companions · default personalities · **30 messages/day**.
- **Premium:** unlimited messages · **personality tuning (3×3×3 traits)** · **create extra companions**
  · priority responses.

*Price — render from StoreKit / RevenueCat. The "$9.99/mo" is a placeholder, do NOT hardcode it.* Show
a clearly-labeled `localizedPriceString` slot (e.g. `{storePrice}/mo`) with a **skeleton while the
store price loads**; add an inline note in the artifact that the real app injects the localized store
price here.

*Legal:* standard auto-renew line — *"Subscription renews automatically until canceled. Manage or
cancel anytime in App Store settings."* + Restore Purchases.

*States (driven by the account toggle — `default · owned`):*
- **default** (free user) — the offer.
- **owned/current** (premium user) — Premium shown as **current plan**, the subscribe CTA
  **disabled/Current plan**, surfacing **Manage subscription** → submgmt.

*Guardrails:* **price always from StoreKit, never hardcoded** (labeled slot + loading skeleton);
Restore Purchases + auto-renew line present; calm, not celebratory.

*Both themes.*

---

## Subscription management — `submgmt`

**Design the Subscription management screen** — the current plan + store-managed controls. A utility
screen — no motion flourish. Pushed from You → Subscription (premium).

*Layout top→bottom:*
- **Current plan: Premium**.
- **Renews Jul 14, 2026**.
- **Manage in App Store** (opens the OS-managed subscription — note Aura can't change billing in-app).
- **Restore Purchases**.
- A quiet link back to the paywall's feature list.

*Unique content:* plan = **Premium**, renews **Jul 14, 2026** (verbatim from persona doc).

*States (`default`):* reached when `account==='premium'`; in free, the You → Subscription entry routes
to the **paywall** instead — note that branch.

*Guardrails:* billing is store-managed, so the screen explains rather than mutates; still and readable,
no motion.

*Both themes.*

---

## Edit profile — `editprofile`

**Design the Edit profile screen.** Keep it minimal — no demographic interrogation. Pushed from You →
Edit profile.

*Layout top→bottom:*
- **Avatar** (with a change affordance).
- **First name** / **last name** fields (first name is what the companion uses).
- Primary **Save**.

*Unique content:* prefilled **Maya** / **Chen**.

*States (`default · focus · error · saving`):*
- **default** — Save disabled until something changes.
- **focus** — active field above the keyboard, focus ring on token.
- **error** — inline field validation, e.g. *"First name can't be empty"* — say what to do next.
- **saving** — Save button loading → success toast.

*Guardrails:* disabled Save until dirty; errors say what to do next; keep the active field above the
keyboard.

*Both themes.*

---

## Account management — `account`

**Design the Account management screen** — data export + delete account in one screen. Both are
Apple-required. Pushed from You → Privacy & Safety.

*Layout top→bottom:*
- **Data export** group — *"Download a copy of your conversations and memories"* → **Request export**.
- **Delete account** group (**danger styling**) — *"Permanently delete your account."*

*Unique content:*
- *Data export request → confirmation:* tapping Request export shows a calm confirmation — *"We're
  preparing your export — we'll email a download link to maya.chen@example.com when it's ready."*
- *Delete account:* an honest explainer of the **soft-delete grace period** — *"Your account is
  deactivated now and permanently deleted after 30 days. Sign back in within 30 days to cancel."* The
  confirm dialog requires an explicit destructive tap (**Delete account**) + Cancel.

*States (`default · export-sent · delete-confirm`):*
- **default** — the two groups.
- **export-sent** — the export confirmation.
- **delete-confirm** — the destructive confirm dialog.

*Guardrails:* **destructive actions confirm first, always** — delete uses a confirm dialog with the
soft-delete grace explainer and danger styling; disabled = lowered opacity, no haptic.

*Both themes.*

---

## Notifications — `notifs`

**Design the Notifications settings screen.** Transactional only — no marketing toggles. Pushed from
You → Notifications.

*Layout top→bottom:*
- A **push toggle** labeled **"Aurora replied 💬"** + explanatory copy: *"Get notified when your
  companion replies while you're away."*

*Unique content:* toggle **on** by default (matches the persona doc's "You" tab); the emoji is an
intentional accent, not UI chrome.

*States (`default`):* render the toggle in both on and off positions.

*Guardrails:* transactional notifications only — no marketing/promo toggles.

*Both themes.*

---

## Safety center — `safety`

**Design the Safety center screen** — how Aura keeps conversations safe + crisis resources. **Supportive
tone — grounding, not alarming.** Pushed from You → Safety center.

*Layout top→bottom:*
- A calm explainer of **how Aura keeps conversations safe** — **content moderation** (*"Aura watches
  for harmful content and steps in gently."*) + the **honest AI disclosure** (*"Your companions are AI
  — supportive company, never a substitute for professional care."*).
- A **crisis resources** card **reusing the same warm support block as Chat's crisis state**: **Call or
  text 988** (Suicide & Crisis Lifeline) · **Text HOME to 741741** (Crisis Text Line), with **Call
  988** / **Text 988** actions.

*States (`default`).*

*Guardrails:* crisis resources use the **calm crisis token, never alarm-red**; the 988/741741 controls
carry VoiceOver labels as call/text actions; reuse Chat's support block, don't reinvent it.

*Both themes.*

---

## Privacy / legal — `legal`

**Design the Privacy / legal screen** — the privacy policy in a calm reading layout. A utility screen —
readable, still, no motion. Pushed from You → Privacy policy.

*Layout top→bottom:*
- A **calm reading layout** (generous measure, relaxed line-height, clear section headings) for the
  **privacy policy**.
- Opening with a **plain-language retention summary** card above the formal text: *"In plain terms:
  your conversations are yours. We keep them so Aurora can remember you, and you can export or delete
  everything anytime."*
- Links to full Terms.

*States (`default`).*

*Guardrails:* readable and still — no motion; plain-language summary precedes the formal text.

*Both themes.*

---

## Help / support — `help`

**Design the Help / support screen** — a short FAQ. Pushed from You → Help.

*Layout top→bottom:*
- A short **FAQ list** (list-group rows that expand or push to detail), covering:
  - **Account** — *"How do I edit my profile or delete my account?"*
  - **Billing / restore** — *"How do I restore a purchase or manage my subscription?"*
  - **Safety** — *"How does Aura keep conversations safe?"*
  - **Companions / memory** — *"How do companions remember things, and can I edit what they know?"*
- A quiet **Contact support** footer.

*States (`default`).*

*Guardrails:* reuse the shared list-group primitive; calm and quiet.

*Both themes.*

---

## System-states kit — `states`

**Design the System-states kit** — a single reference board presenting the warm, reusable state
primitives so every screen above **reuses them, never reinvents them**. Present as a labeled board (each
pattern in a device-sized example or a stacked gallery).

*The primitives:*
- **EmptyState** — warm icon/illustration + a human line + an optional gentle CTA (e.g. Memory empty).
- **LoadingState** — **skeleton** placeholders (shimmer optional, reduce-motion safe), **never a
  spinner**.
- **ErrorState** — calm *"Something went wrong"* + a single **Retry**; says what to do next.
- **Offline** — *"You're offline — Aurora will catch up when you're back."* (warm, non-blocking).
- **Blocked-message** — the moderation in-thread state: a message **softly held back** with a calm
  explainer (*"This message was held back to keep things safe."*) — supportive, not punitive, not red.

*States (`empty · loading · error · offline · blocked`):* map 1:1 to the rail toggle so each pattern is
reviewable in isolation, in both themes.

*Guardrails:* one of each primitive, reused everywhere — not eight look-alikes; loading is a skeleton,
never a spinner; blocked/offline stay supportive, never red.

*Both themes.*
