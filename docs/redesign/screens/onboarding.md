# Onboarding — per-screen design prompts

> Use these **after** the [`03-onboarding-scaffold.md`](../03-onboarding-scaffold.md) scaffold has
> rendered the stub flow. Paste **ONE screen block at a time** into Claude Design to design that screen
> into its stub. Assumes the approved Warm Sanctuary system + [`01-doctrine.md`](../01-doctrine.md) +
> [`02-demo-persona.md`](../02-demo-persona.md) + `claude-design/ios-frame.jsx` + `dev-harness.jsx` are
> in context. Each block keeps the scaffold's nav, dev rail, and tokens; designs **both warm-light and
> warm-dark**; and (auth is Clerk-managed — this is UI only).

Flow order: **Welcome → Auth → Carousel → Age gate → AI disclosure + ToS → Profile → Choose companion → Conversation.**

---

## Welcome (value prop) — `welcome`

Design the **Welcome** screen — a single pre-auth value-prop page (NOT a carousel). Calm and inviting,
it sets the tone in one breath. Top→bottom: the **Aura** wordmark / warm mark; a short **value-prop
headline** (*"A companion who remembers you."*) + one supporting line; a primary **Get started →** and a
secondary **I already have an account** (→ auth); a quiet **"For adults 18+"** note. One warm focal
image/illustration is welcome (no glowing orb, no stock). States: `default`. Guardrail: one page, one
clear primary action — the 3-screen narrative lives later, post-auth, in the carousel.

## Auth — `auth`

Design the **Auth** screen — one surface, `mode` switches the body (don't build five screens). This is
where people decide to trust Aura, so keep it calm and trustworthy.
- *signup* (default): email + password (reveal eye); **Continue with Apple** + **Continue with Google**;
  agree-to-terms checkbox linking ToS/Privacy; primary **Create account**; footer toggle *"Already have
  an account? Sign in."* Show button `idle / loading / done`.
- *signin*: email + password; **Forgot password?**; Apple/Google; primary **Sign in**; footer → signup.
- *forgot*: email + **Send reset link** + a "we'll email a code" note; back to signin.
- *verify*: a **6-digit code** entry (Clerk emails it) + **Verify** + resend timer.
- *reset*: new-password + confirm + **Update password**.
States = the five modes. After signup/verify → carousel.

## Intro carousel — `carousel`

Design the **post-auth intro carousel** — a short 3-screen narrative that welcomes the new user and sets
expectations before onboarding's gates. Stories-style: a slim segmented progress bar at top, tap/swipe to
advance, **Skip** + **Continue →**. One warm idea + a warm hero per slide (no orbs, no stock):
- *slide1* — **"Meet a companion who remembers you."** (continuity across conversations)
- *slide2* — **"A calm, private place to talk."** (judgment-free, your conversations are yours)
- *slide3* — **"Here whenever you need."** (always available; honest that it's an AI)
States = the three slides. → age gate. Guardrail: warm and brief — this is a narrative bridge, not a
second value-prop pitch.

## Age gate — `agegate`

Design the **Age gate** — a warm, single-purpose screen, the FIRST gate after auth. Header *"How old are
you?"*; a friendly **date-of-birth picker** (wheel or field); one honest line *"Aura is for adults. You
must be 18 or older to continue."*; primary **Continue**.
- *default*: a valid 18+ DOB → Continue enabled → disclosure.
- *under18*: under 18 → **fail closed** — a calm, non-shaming stop: *"You need to be 18 to use Aura.
  Thanks for stopping by."* (no path forward). Design this state explicitly.

## AI disclosure + ToS — `disclosure`

Design the **AI disclosure + Terms** screen — the honesty moment, warm not legalistic. Header *"A few
things to know."* Short human cards: *"Aurora is an AI"* (supportive company — not a real person, not a
substitute for professional care); *"If you're ever in crisis,"* Aura shares real resources (988) and
you can always reach them; *"Your conversations are private"* and yours to export or delete. A checkbox
*"I understand and agree to the Terms & Privacy Policy"* + primary **Continue** (disabled until checked)
→ profile. States: `default`. Guardrail: honest, no dark patterns on the consent checkbox.

## Profile setup — `profile`

Design the **Profile setup** screen — light and welcoming. Header *"What should Aurora call you?"*;
first-name + last-name fields (first name is what the companion uses); an optional friendly subline;
primary **Continue** → persona. Keep it minimal — no demographic interrogation. States: `default`
(+ focus/error on the fields).

## Choose companion — `persona`

Design the **Choose your companion** screen — the choice that sets up the payoff. Header *"Who would you
like to talk with?"* Sub *"You can always meet the others later."* Three warm companion cards —
**Aurora · Orion · Lyra** — each with the hand-crafted avatar, name, one-line voice (from the persona
doc), and a soft selected state; **Aurora** gently pre-highlighted. A quiet note *"Personalities can be
tuned with Premium."* Primary **Start chatting with {name} →** → firstchat. States: `default`.
Guardrail: free tier = base personas on default traits (no trait sliders here).

## Conversation — `firstchat`

Design the **first conversation** — onboarding ends HERE, not a dashboard. Open the real chat screen with
the chosen companion greeting Maya warmly by name; let it breathe. This is the **first appearance of the
reusable chat components** (header with avatar + name + honest "AI companion" marker; warm bubbles; the
bottom input dock) — build them here so the one-off Chat screen reuses them.
- *opening*: one warm opener from Aurora — *"Hi Maya — I'm really glad you're here. There's no script and
  no rush. What's on your mind today?"* — with a quiet first-session AI-disclosure banner above the
  thread.
- *typing*: the greeting arriving via the **calm typing reveal** (natural-writing pace; reduce-motion →
  snap to final, keep the haptic).
Guardrail: end in the conversation; reuse these chat components in the Chat one-off rather than rebuilding.
