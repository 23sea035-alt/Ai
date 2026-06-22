# 03 — Onboarding scaffold (`Onboarding.html`)

> Paste after the foundation is approved and `01-doctrine.md` + `02-demo-persona.md` are in context,
> with `claude-design/ios-frame.jsx` + `claude-design/dev-harness.jsx` provided as reusable code.
> Build **one self-contained React HTML artifact** = the entire pre-app onboarding flow.

---

## ONBOARDING SCAFFOLD PROMPT

Build **`Onboarding.html`** — Aura's full first-run flow, from the pre-auth welcome through to the
user's **first conversation**. Use the approved Warm Sanctuary system, honor `01-doctrine.md`, and use
the demo persona (Maya Chen → companion Aurora) from `02-demo-persona.md` for all content.

### Technical setup
- Wrap every screen in `<IOSDevice dark={theme==='dark'}>` from **ios-frame.jsx** (402×874).
- Use **dev-harness.jsx**: render the app inside `<DevProvider screens={SCREENS}><DevStage>…`. The
  **dev rail** (left, outside the frame) must let me jump to any screen below and flip **theme**,
  **account**, **data state**, and each screen's **per-screen states**. Screens read `useDev()`.
- A `Shell` keeps the real flow state (current step, auth mode, collected profile) and a `next/back`;
  the dev rail can also jump directly to any screen for review. Build **both light and warm-dark**.
- **App surfaces are warm + opaque** — the only glass is the OS chrome from ios-frame.

### The SCREENS registry (build in this order = the real flow order)

```
[ { id:'welcome',   label:'Welcome (carousel)', states:['slide1','slide2','slide3'] },
  { id:'auth',      label:'Auth',               states:['signup','signin','forgot','verify','reset'] },
  { id:'agegate',   label:'Age gate',           states:['default','under18'] },
  { id:'disclosure',label:'AI disclosure + ToS',states:['default'] },
  { id:'profile',   label:'Profile setup',      states:['default'] },
  { id:'persona',   label:'Pick companion',     states:['default'] },
  { id:'firstchat', label:'First conversation', states:['opening','typing'] } ]
```

### Screen briefs

**1. Welcome — 3-slide carousel** *(pre-auth)*
A short, warm, **skippable** value-prop intro (Stories-style: a slim segmented progress bar at top,
tap/swipe to advance). Three slides, one idea each, with a warm illustrative/tonal hero per slide
(no glowing orbs, no stock):
- *slide1* — **"A companion who remembers you."** (continuity across conversations)
- *slide2* — **"Always here. Never judging."** (a safe, private place to talk)
- *slide3* — **"Private & safe by design."** (your conversations are yours; built for trust)
Footer: **Skip** (text) + a primary **Get started →**. A quiet line under the CTA: *"For adults 18+."*
Tapping Get started / Skip → **auth**. *(states = the three slides.)*

**2. Auth — swappable modes** *(one screen, `mode` switches the body)*
The single auth surface; reuse one layout across modes (don't build five screens).
- *signup* (default): email + password fields (password reveal eye); **Continue with Apple** +
  **Continue with Google** buttons; agree-to-terms checkbox linking ToS/Privacy; primary **Create
  account**; a footer toggle **"Already have an account? Sign in."** Show the `idle / loading / done`
  button states.
- *signin*: email + password; **Forgot password?** link; Apple/Google; primary **Sign in**; footer
  toggle to *signup*.
- *forgot*: email field + **Send reset link**; a "we'll email you a code" note; back to *signin*.
- *verify*: a **6-digit code** entry (Clerk emails the code) + **Verify** + a resend timer.
- *reset*: new-password + confirm + **Update password**.
Keep it calm and trustworthy — this is where people decide to trust Aura. (Auth is Clerk-managed;
this is UI only.) After signup/verify succeeds → **agegate**.

**3. Age gate** *(post-auth, FIRST gate)*
A warm, single-purpose screen: **"How old are you?"** with a friendly **date-of-birth picker** (wheel
or field) and one honest line: *"Aura is for adults. You must be 18 or older to continue."* Primary
**Continue**.
- *default*: a valid 18+ DOB → Continue enabled → **disclosure**.
- *under18*: if under 18, **fail closed** — a calm, non-shaming stop state: *"You need to be 18 to use
  Aura. Thanks for stopping by."* (no path forward). Design this state explicitly.

**4. AI disclosure + ToS**
The honesty moment, warm not legalistic: **"A few things to know."** Short, human cards:
- *"Aurora is an AI."* It's software designed to be supportive company — **not a real person, and not
  a substitute for professional care.**
- *"If you're ever in crisis,"* Aura will share real resources (988) — and you can always reach them.
- *"Your conversations are private"* and yours to export or delete anytime.
A checkbox **"I understand and agree to the Terms & Privacy Policy"** + primary **Continue** (disabled
until checked). → **profile**.

**5. Profile setup**
Light and welcoming: **"What should Aurora call you?"** First name + last name fields (first name is
what the companion uses). Optional friendly subline. Primary **Continue** → **persona**. Keep it to
the minimum — no demographic interrogation.

**6. Pick companion** *(the choice that sets up the payoff)*
Header **"Who would you like to talk with?"** Sub *"You can always meet the others later."* Three warm
companion cards — **Aurora · Orion · Lyra** — each: the hand-crafted avatar, the name, the one-line
voice (from the persona doc), a soft selected state. **Aurora** gently pre-highlighted. A quiet note:
*"Personalities can be tuned with Premium."* Primary **Start chatting with {name} →** → **firstchat**.
*(Free tier: base personas on default traits — no trait sliders here.)*

**7. First conversation — the payoff** *(ends onboarding HERE, not a dashboard)*
Open the real **chat screen** with the chosen companion, who greets Maya warmly and by name. This is
the emotional landing — let it breathe.
- *opening*: the conversation starts with **one warm message from Aurora**: *"Hi Maya — I'm really
  glad you're here. There's no script and no rush. What's on your mind today?"* The input dock invites
  a reply; a quiet first-session **AI-disclosure banner** sits above the thread ("Aurora is an AI
  companion. She's here for support, not a substitute for professional care.").
- *typing*: Aurora's greeting arriving via the **calm typing reveal** (natural-writing pace).
Use the same chat components the one-off Chat screen will use (bubbles, input dock, header with the
companion avatar + name + honest "AI companion" marker) — this is the first appearance of that
template, so make it the reusable one.

### Flow wiring
`Shell` holds: `step` (index into SCREENS), `authMode`, and a `profile` object (first/last name, DOB,
chosen persona). `next/back` move through the **happy path**: welcome → auth → agegate → disclosure →
profile → persona → firstchat. The carousel advances within `welcome`; the auth toggle switches
`authMode`; the age gate branches to the `under18` dead-end on a sub-18 DOB. The dev rail can jump to
any screen/state independently for review.

### Guardrails
- **Age gate is first and fails closed** — a sub-18 user has no path forward.
- **End in the first conversation**, never a dashboard. The payoff is meeting your companion.
- AI disclosure is **honest but warm** — no wall of legalese, no dark patterns on the consent checkbox.
- Reuse one set of chat components in `firstchat` (the Chat one-off will reuse them, not rebuild them).
- Every screen renders in **light and warm-dark**; auth/age-gate/profile inputs show focus + error +
  disabled states. No glass on app surfaces; no glow; warm opaque cards only.
