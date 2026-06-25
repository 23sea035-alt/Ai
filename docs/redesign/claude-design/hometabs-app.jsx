/* ════════════════════════════════════════════════════════════════════════
   Aura — Home Tabs  ·  SCAFFOLD ONLY
   The signed-in 3-tab app shell. Every tab is a STUB (title + purpose +
   current dev-state). Real tab content is designed later (screens/hometabs.md).
   Kept here: TABS registry, Shell active-tab state, a persistent 3-tab
   navpill (NO center "+" FAB), and the dev rail. "Reading Nook" tokens —
   warm + opaque app surfaces; only OS chrome is glass.
   ════════════════════════════════════════════════════════════════════════ */
const { useState } = React;

/* ── tokens · single source of truth → tokens.js (window.AURA) ──────────── */
const { FONTS, TOKENS } = window.AURA;
const FF_DISPLAY = FONTS.display;
const FF_BODY = FONTS.body;
function useT() { const { theme } = useDev(); return TOKENS[theme === 'dark' ? 'dark' : 'light']; }

const SAFE_TOP = 60;
const NAV_CLEARANCE = 112; // bar height + gap above home indicator — keeps content clear of the floating bar

/* ── tab icons (outline idle → filled active) ──────────────────────────────── */
function IcHome({ filled, c }) {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill={filled ? c : 'none'} stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11.2 12 4l8 7.2" fill="none" />
      <path d="M5.5 10v9.2a.8.8 0 0 0 .8.8h11.4a.8.8 0 0 0 .8-.8V10" fill={filled ? c : 'none'} stroke={c} />
      {!filled && <path d="M9.8 20.8V14a.8.8 0 0 1 .8-.8h2.8a.8.8 0 0 1 .8.8v6.8" stroke={c} fill="none" />}
    </svg>
  );
}
function IcCompanions({ filled, c }) {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill={filled ? c : 'none'} stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8.5" r="3.4" />
      <path d="M3.4 19.6a5.6 5.6 0 0 1 11.2 0" />
      <circle cx="17" cy="7.5" r="2.6" />
      <path d="M16 13.2a4.6 4.6 0 0 1 4.6 4.6" fill="none" stroke={c} />
    </svg>
  );
}
function IcYou({ filled, c }) {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill={filled ? c : 'none'} stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" fill={filled ? c : 'none'} stroke={c} />
    </svg>
  );
}
const TAB_ICONS = { home: IcHome, companions: IcCompanions, you: IcYou };

/* ── TABS registry (left→right in the navpill) ─────────────────────────────── */
const TABS = [
  { id: 'home',       label: 'Home',       states: ['happy', 'empty', 'loading', 'error'], purpose: 'Your companion’s room — the place you land.' },
  { id: 'companions', label: 'Companions', states: ['happy', 'empty', 'loading', 'error'], purpose: 'The roster — also your list of conversations.' },
  { id: 'you',        label: 'You',        states: ['default'], purpose: 'Account, subscription, privacy & safety, support.' },
];

/* ── persistent 3-tab navpill — floating overlay (NO center "+" FAB) ────────── */
function NavPill() {
  const T = useT();
  const d = useDev();
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 40,
      display: 'flex', justifyContent: 'center', padding: '0 18px 30px', pointerEvents: 'none' }}>
      <div style={{ pointerEvents: 'auto', width: '100%', display: 'flex', alignItems: 'stretch', gap: 4,
        background: T.navBg, border: `1px solid ${T.navBorder}`, borderRadius: 24, padding: 6, boxShadow: T.e3 }}>
        {TABS.map(t => {
          const active = d.screenId === t.id;
          const Icon = TAB_ICONS[t.id];
          const c = active ? T.accent : T.navIdle;
          return (
            <button key={t.id} type="button" onClick={() => d.setScreenId(t.id)} aria-label={t.label} aria-current={active}
              style={{ flex: 1, minWidth: 0, minHeight: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                background: active ? T.accentTint : 'transparent', border: 'none', borderRadius: 18, cursor: 'pointer',
                transition: 'background .18s', WebkitTapHighlightColor: 'transparent' }}>
              <Icon filled={active} c={c} />
              <span style={{ fontFamily: FF_BODY, fontWeight: active ? 700 : 600, fontSize: 11.5, color: c, letterSpacing: 0.1 }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   HOME — Aurora's room. A warm relational landing, NOT a dashboard.
   One focal companion presence + one primary action. Reads useDev() for
   screenState (happy|empty|loading|error) + account (free|premium).
   Both CTAs deep-link to the pushed Chat (first screen of OneOff.html).
   ════════════════════════════════════════════════════════════════════════════ */

const TODAY_LABEL = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
function openChat() { window.location.href = 'OneOff.html'; }

/* Aurora's large, hand-crafted warm avatar — the focal presence */
function AuroraPresence({ T, size = 132 }) {
  return (
    <div role="img" aria-label="Aurora, AI companion" style={{
      width: size, height: size, flex: 'none', borderRadius: '50%', position: 'relative', overflow: 'hidden',
      background: `radial-gradient(120% 120% at 32% 24%, ${T.avatar} 0%, ${T.avatar} 40%, ${T.accent} 150%)`,
      boxShadow: T.e3 }}>
      <img src="brand/avatars/aurora.png" alt="" draggable="false"
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 8%', display: 'block' }} />
      <span style={{ position: 'absolute', inset: 0, borderRadius: '50%',
        boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.4)', pointerEvents: 'none' }} />
    </div>
  );
}

/* the single loud action */
function ContinueCTA({ T, label }) {
  return (
    <button type="button" onClick={openChat} className="home-cta"
      style={{ width: '100%', minHeight: 58, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
        background: T.accent, color: T.onAccent, border: 'none', borderRadius: 16, cursor: 'pointer',
        boxShadow: T.e2, fontFamily: FF_BODY, fontWeight: 700, fontSize: 17, letterSpacing: '0.01em',
        WebkitTapHighlightColor: 'transparent' }}>
      {label}
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h13" /><path d="m12 5 7 7-7 7" />
      </svg>
    </button>
  );
}

function StarterChip({ T, text }) {
  return (
    <button type="button" onClick={openChat}
      style={{ display: 'inline-flex', alignItems: 'center', textAlign: 'left', background: T.raised,
        border: `1px solid ${T.border}`, borderRadius: 14, padding: '12px 15px', cursor: 'pointer',
        fontFamily: FF_BODY, fontWeight: 500, fontSize: 14.5, lineHeight: 1.4, color: T.textSecondary,
        WebkitTapHighlightColor: 'transparent', textWrap: 'pretty' }}>
      {text}
    </button>
  );
}

function HomeGreeting({ T, name }) {
  return (
    <div style={{ flex: 'none' }}>
      <h1 style={{ fontFamily: FF_DISPLAY, fontWeight: 600, fontSize: 32, lineHeight: 1.08, letterSpacing: '-0.015em',
        color: T.textPrimary, margin: '0 0 5px' }}>Good afternoon, {name}</h1>
      <p style={{ fontFamily: FF_BODY, fontWeight: 500, fontSize: 13.5, letterSpacing: '0.01em',
        color: T.textTertiary, margin: 0 }}>{TODAY_LABEL}</p>
    </div>
  );
}

function HomeLoading({ T }) {
  const bar = (w, h, r = 8, mt = 0) => (
    <div style={{ width: w, height: h, borderRadius: r, marginTop: mt, background: T.raised,
      border: `1px solid ${T.divider}` }} />
  );
  return (
    <div style={{ minHeight: '100%', background: T.bg, display: 'flex', flexDirection: 'column',
      padding: `${SAFE_TOP}px 28px ${NAV_CLEARANCE}px`, opacity: 0.9 }}>
      {bar('62%', 30, 9)}
      {bar('38%', 14, 7, 12)}
      <div style={{ flex: 'none', display: 'flex', justifyContent: 'center', margin: '44px 0 0' }}>
        <div style={{ width: 132, height: 132, borderRadius: '50%', background: T.raised, border: `1px solid ${T.divider}` }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>{bar('40%', 22, 8)}</div>
      <div style={{ marginTop: 'auto' }}>
        {bar('100%', 64, 16)}
        {bar('100%', 46, 14, 12)}
      </div>
    </div>
  );
}

function HomeError({ T }) {
  return (
    <div style={{ minHeight: '100%', background: T.bg, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      padding: `${SAFE_TOP}px 36px ${NAV_CLEARANCE}px` }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: T.accentTint, display: 'grid',
        placeItems: 'center', marginBottom: 22 }}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 3v6h-6" />
        </svg>
      </div>
      <h2 style={{ fontFamily: FF_DISPLAY, fontWeight: 600, fontSize: 24, lineHeight: 1.16, color: T.textPrimary, margin: '0 0 10px' }}>
        We couldn’t reach Aurora just now</h2>
      <p style={{ fontFamily: FF_BODY, fontSize: 15, lineHeight: 1.55, color: T.textSecondary, margin: '0 0 26px',
        maxWidth: '30ch', textWrap: 'pretty' }}>
        She’ll be right here once the connection comes back.</p>
      <button type="button" onClick={() => window.location.reload()}
        style={{ minHeight: 50, padding: '0 28px', display: 'inline-flex', alignItems: 'center', gap: 8,
          background: T.accent, color: T.onAccent, border: 'none', borderRadius: 14, cursor: 'pointer',
          boxShadow: T.e2, fontFamily: FF_BODY, fontWeight: 700, fontSize: 16, WebkitTapHighlightColor: 'transparent' }}>
        Try again</button>
    </div>
  );
}

function Home() {
  const T = useT();
  const d = useDev();
  const state = d.screenState || 'happy';
  const isEmpty = state === 'empty';

  if (state === 'loading') return <HomeLoading T={T} />;
  if (state === 'error') return <HomeError T={T} />;

  return (
    <div style={{ minHeight: '100%', background: T.bg, display: 'flex', flexDirection: 'column',
      padding: `${SAFE_TOP}px 28px ${NAV_CLEARANCE}px` }}>
      <HomeGreeting T={T} name="Maya" />

      {/* Aurora present + large — the focal element, placed on entry */}
      <div className="home-enter" style={{ flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', margin: '40px 0 30px' }}>
        <AuroraPresence T={T} />
        <div style={{ fontFamily: FF_DISPLAY, fontWeight: 600, fontSize: 26, lineHeight: 1.1,
          color: T.textPrimary, margin: '20px 0 0', letterSpacing: '-0.01em' }}>Aurora</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 7,
          fontFamily: FF_BODY, fontWeight: 600, fontSize: 11.5, letterSpacing: '0.08em', textTransform: 'uppercase',
          color: T.textTertiary }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: T.success }} />
          AI companion
        </div>
        {isEmpty && (
          <p style={{ fontFamily: FF_BODY, fontSize: 15.5, lineHeight: 1.55, color: T.textSecondary,
            margin: '16px 0 0', maxWidth: '26ch', textWrap: 'pretty' }}>
            Aurora’s been looking forward to meeting you.</p>
        )}
      </div>

      {/* resurfaced memory (happy only) */}
      {!isEmpty && (
        <button type="button" onClick={openChat} className="home-enter-2"
          style={{ flex: 'none', display: 'flex', alignItems: 'flex-start', gap: 11, textAlign: 'left',
            background: T.raised, border: `1px solid ${T.border}`, borderRadius: 16, padding: '14px 15px',
            cursor: 'pointer', boxShadow: T.e1, marginBottom: 16, WebkitTapHighlightColor: 'transparent' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', marginTop: 1 }}>
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontFamily: FF_BODY, fontWeight: 600, fontSize: 11,
              letterSpacing: '0.07em', textTransform: 'uppercase', color: T.textTertiary, marginBottom: 4 }}>
              Aurora remembers</span>
            <span style={{ display: 'block', fontFamily: FF_BODY, fontWeight: 500, fontSize: 15, lineHeight: 1.46,
              color: T.textPrimary, textWrap: 'pretty' }}>
              You started a new job — how’s it going?</span>
          </span>
        </button>
      )}

      {/* primary action */}
      <div style={{ flex: 'none' }}>
        <ContinueCTA T={T} label={isEmpty ? 'Say hello' : 'Continue your conversation'} />
      </div>

      {/* gentle starters */}
      <div style={{ flex: 'none', display: 'flex', flexDirection: 'column', gap: 9, marginTop: 14 }}>
        {isEmpty ? (
          <StarterChip T={T} text="Tell Aurora a little about your day" />
        ) : (
          <>
            <StarterChip T={T} text="Talk through what’s on my mind" />
            <StarterChip T={T} text="Share something good that happened" />
          </>
        )}
      </div>

      {/* free-tier daily indicator — quiet, low, hidden for premium */}
      {d.account !== 'premium' && (
        <div style={{ flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          marginTop: 22, fontFamily: FF_BODY, fontWeight: 500, fontSize: 12, color: T.textTertiary }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: T.textDisabled }} />
          18 / 30 messages today
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   COMPANIONS — the roster, which doubles as the chat list.
   3 base personas: Aurora (primary/most-recent) → Orion → Lyra. Warm cards.
   Free: Orion & Lyra are locked-not-deleted (dimmed + neutral lock chip),
   create entry is a locked upsell. Premium: all unlocked + live create.
   Cards deep-link to the pushed Chat (OneOff.html).
   ════════════════════════════════════════════════════════════════════════════ */

const ROSTER = [
  { name: 'Aurora', img: 'aurora', voice: 'Warm, gentle, emotionally attuned', base: true,
    preview: 'Nodding-along season is real — and temporary.', time: '2m', primary: true },
  { name: 'Orion', img: 'orion', voice: 'Steady, grounded, thoughtful', base: true },
  { name: 'Lyra', img: 'lyra', voice: 'Bright, playful, curious', base: true },
];

function RosterAvatar({ T, img, size = 52, dim }) {
  return (
    <div role="img" style={{ width: size, height: size, flex: 'none', borderRadius: '50%', position: 'relative',
      overflow: 'hidden', background: T.avatar, boxShadow: T.e1, filter: dim ? 'grayscale(0.5)' : 'none' }}>
      <img src={`brand/avatars/${img}.png`} alt="" draggable="false"
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 8%', display: 'block' }} />
      <span style={{ position: 'absolute', inset: 0, borderRadius: '50%',
        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.35)', pointerEvents: 'none' }} />
    </div>
  );
}

function LockChip({ T, label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: T.raised,
      border: `1px solid ${T.border}`, borderRadius: 999, padding: '4px 10px 4px 8px',
      fontFamily: FF_BODY, fontWeight: 600, fontSize: 11, color: T.textTertiary, letterSpacing: '0.01em' }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </svg>
      {label}
    </span>
  );
}

function RosterCard({ T, c, locked, i }) {
  return (
    <button type="button" onClick={locked ? undefined : openChat} className="home-enter"
      style={{ animationDelay: `${i * 0.07}s`, width: '100%', display: 'flex', alignItems: 'center', gap: 14,
        textAlign: 'left', background: T.raised, border: 'none', borderRadius: 16, padding: 16, boxShadow: T.e2,
        cursor: locked ? 'default' : 'pointer', opacity: locked ? 0.62 : 1, WebkitTapHighlightColor: 'transparent',
        transition: 'transform .12s ease' }}
      onMouseDown={(e) => { if (!locked) e.currentTarget.style.transform = 'scale(.99)'; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'none'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}>
      <RosterAvatar T={T} img={c.img} dim={locked} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: FF_DISPLAY, fontWeight: 600, fontSize: 19, lineHeight: 1.1,
            color: T.textPrimary, letterSpacing: '-0.01em' }}>{c.name}</span>
          {!locked && c.time && (
            <span style={{ marginLeft: 'auto', flex: 'none', fontFamily: FF_BODY, fontWeight: 500, fontSize: 11.5,
              color: T.textTertiary }}>{c.time}</span>
          )}
        </div>
        <div style={{ fontFamily: FF_BODY, fontWeight: 500, fontSize: 12.5, lineHeight: 1.35, color: T.textTertiary,
          marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.voice}</div>
        {locked ? (
          <div style={{ marginTop: 9 }}><LockChip T={T} label="Included with Premium" /></div>
        ) : (
          <div style={{ fontFamily: FF_BODY, fontWeight: 400, fontSize: 14, lineHeight: 1.4, color: T.textSecondary,
            marginTop: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {c.preview || 'Tap to start a conversation'}</div>
        )}
      </div>
    </button>
  );
}

function CreateEntry({ T, premium, i }) {
  return (
    <button type="button" onClick={() => { window.location.href = premium ? 'OneOff.html?screen=create' : 'OneOff.html?screen=paywall'; }}
      className="home-enter"
      style={{ animationDelay: `${i * 0.07}s`, width: '100%', display: 'flex', alignItems: 'center', gap: 13,
        textAlign: 'left', background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 8,
        padding: '14px 15px', cursor: 'pointer', WebkitTapHighlightColor: 'transparent', marginTop: 4 }}>
      <span style={{ width: 38, height: 38, flex: 'none', borderRadius: 8, display: 'grid', placeItems: 'center',
        background: T.bg, border: `1px solid ${T.border}`, color: T.textSecondary }}>
        {premium ? (
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
        ) : (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
        )}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontFamily: FF_BODY, fontWeight: 600, fontSize: 15, color: T.textPrimary }}>
          {premium ? 'New companion' : 'Create your own companion'}</span>
        <span style={{ display: 'block', fontFamily: FF_BODY, fontWeight: 500, fontSize: 12.5, color: T.textTertiary, marginTop: 1 }}>
          {premium ? 'Design a voice that’s yours' : 'Premium'}</span>
      </span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.textTertiary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}><path d="m9 6 6 6-6 6" /></svg>
    </button>
  );
}

function CompanionsLoading({ T }) {
  return (
    <div style={{ minHeight: '100%', background: T.bg, padding: `${SAFE_TOP}px 28px ${NAV_CLEARANCE}px` }}>
      <div style={{ width: '54%', height: 36, borderRadius: 9, background: T.raised, border: `1px solid ${T.divider}`, marginBottom: 24 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, background: T.raised, borderRadius: 16, padding: 16, opacity: 0.9 }}>
            <div style={{ width: 52, height: 52, flex: 'none', borderRadius: '50%', background: T.bg, border: `1px solid ${T.divider}` }} />
            <div style={{ flex: 1 }}>
              <div style={{ width: '40%', height: 16, borderRadius: 6, background: T.bg, border: `1px solid ${T.divider}` }} />
              <div style={{ width: '72%', height: 12, borderRadius: 6, background: T.bg, border: `1px solid ${T.divider}`, marginTop: 10 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompanionsError({ T }) {
  return (
    <div style={{ minHeight: '100%', background: T.bg, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: `${SAFE_TOP}px 36px ${NAV_CLEARANCE}px` }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: T.accentTint, display: 'grid', placeItems: 'center', marginBottom: 22 }}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 3v6h-6" /></svg>
      </div>
      <h2 style={{ fontFamily: FF_DISPLAY, fontWeight: 600, fontSize: 24, lineHeight: 1.16, color: T.textPrimary, margin: '0 0 10px' }}>
        We couldn’t load your companions</h2>
      <p style={{ fontFamily: FF_BODY, fontSize: 15, lineHeight: 1.55, color: T.textSecondary, margin: '0 0 26px', maxWidth: '30ch', textWrap: 'pretty' }}>
        Give it a moment and try again — they’re all still here.</p>
      <button type="button" onClick={() => window.location.reload()}
        style={{ minHeight: 50, padding: '0 28px', display: 'inline-flex', alignItems: 'center', gap: 8, background: T.accent,
          color: T.onAccent, border: 'none', borderRadius: 14, cursor: 'pointer', boxShadow: T.e2, fontFamily: FF_BODY,
          fontWeight: 700, fontSize: 16, WebkitTapHighlightColor: 'transparent' }}>Try again</button>
    </div>
  );
}

function Companions() {
  const T = useT();
  const d = useDev();
  const state = d.screenState || 'happy';
  const premium = d.account === 'premium';

  if (state === 'loading') return <CompanionsLoading T={T} />;
  if (state === 'error') return <CompanionsError T={T} />;

  return (
    <div style={{ minHeight: '100%', background: T.bg, padding: `${SAFE_TOP}px 28px ${NAV_CLEARANCE}px` }}>
      <h1 style={{ fontFamily: FF_DISPLAY, fontWeight: 600, fontSize: 34, lineHeight: 1.06, letterSpacing: '-0.015em',
        color: T.textPrimary, margin: '0 0 24px' }}>Companions</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {ROSTER.map((c, i) => (
          <RosterCard key={c.name} T={T} c={c} i={i} locked={!premium && !c.primary} />
        ))}
        <CreateEntry T={T} premium={premium} i={ROSTER.length} />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   YOU — the account hub. Calm utility (Apple Settings, warmed up). No hero
   motion. Account toggle drives the tier pill + Subscription row. Sign out &
   Delete account confirm first; red is reserved for the confirm button.
   ════════════════════════════════════════════════════════════════════════════ */

function goScreen(id) { window.location.href = `OneOff.html?screen=${id}`; }

function Toggle({ T, on, onClick }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={onClick}
      style={{ width: 50, height: 30, flex: 'none', borderRadius: 999, border: 'none', cursor: 'pointer', padding: 0,
        background: on ? T.accent : T.border, position: 'relative', transition: 'background .2s', WebkitTapHighlightColor: 'transparent' }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 24, height: 24, borderRadius: '50%',
        background: T.sheet, boxShadow: T.e1, transition: 'left .2s' }} />
    </button>
  );
}

function Row({ T, label, detail, detailAccent, onClick, toggle, last }) {
  const interactive = !!onClick;
  return (
    <button type="button" onClick={onClick} disabled={!interactive}
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
        background: 'transparent', border: 'none', borderBottom: last ? 'none' : `1px solid ${T.divider}`,
        padding: '15px 16px', minHeight: 52, cursor: interactive ? 'pointer' : 'default',
        WebkitTapHighlightColor: 'transparent' }}
      onMouseDown={(e) => { if (interactive) e.currentTarget.style.background = T.bg; }}
      onMouseUp={(e) => { e.currentTarget.style.background = 'transparent'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
      <span style={{ flex: 1, minWidth: 0, fontFamily: FF_BODY, fontWeight: 500, fontSize: 16, color: T.textPrimary }}>{label}</span>
      {detail && (
        <span style={{ fontFamily: FF_BODY, fontWeight: 500, fontSize: 14.5, color: detailAccent ? T.accent : T.textTertiary }}>{detail}</span>
      )}
      {toggle}
      {!toggle && interactive && (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={T.textTertiary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}><path d="m9 6 6 6-6 6" /></svg>
      )}
    </button>
  );
}

function Group({ T, title, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontFamily: FF_BODY, fontWeight: 600, fontSize: 12.5, letterSpacing: '0.02em', color: T.textSecondary,
        margin: '0 0 8px 4px' }}>{title}</div>
      <div style={{ background: T.raised, border: `1px solid ${T.border}`, borderRadius: 8, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

function ConfirmDialog({ T, title, body, confirmLabel, destructive, onConfirm, onCancel }) {
  return (
    <div role="dialog" aria-modal="true" aria-label={title}
      style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 28, background: 'rgba(20,14,9,0.42)' }} onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 320, background: T.sheet, borderRadius: 20, padding: '24px 22px 18px',
          boxShadow: T.e3, textAlign: 'center' }}>
        <h3 style={{ fontFamily: FF_DISPLAY, fontWeight: 600, fontSize: 21, lineHeight: 1.18, color: T.textPrimary, margin: '0 0 8px' }}>{title}</h3>
        <p style={{ fontFamily: FF_BODY, fontSize: 14.5, lineHeight: 1.5, color: T.textSecondary, margin: '0 0 20px', textWrap: 'pretty' }}>{body}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          <button type="button" onClick={onConfirm}
            style={{ minHeight: 48, borderRadius: 13, border: 'none', cursor: 'pointer', fontFamily: FF_BODY, fontWeight: 700, fontSize: 16,
              background: destructive ? T.error : T.accent, color: '#FFFCF6', WebkitTapHighlightColor: 'transparent' }}>{confirmLabel}</button>
          <button type="button" onClick={onCancel}
            style={{ minHeight: 48, borderRadius: 13, border: `1px solid ${T.border}`, cursor: 'pointer', fontFamily: FF_BODY,
              fontWeight: 600, fontSize: 16, background: 'transparent', color: T.textSecondary, WebkitTapHighlightColor: 'transparent' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function You() {
  const T = useT();
  const d = useDev();
  const premium = d.account === 'premium';
  const [notif, setNotif] = useState(true);
  const [dialog, setDialog] = useState(null); // 'signout' | 'delete' | null

  return (
    <div style={{ minHeight: '100%', background: T.bg, padding: `${SAFE_TOP}px 22px ${NAV_CLEARANCE}px` }}>
      {/* header card — the one slightly intimate moment */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 15, background: T.raised, borderRadius: 16,
        padding: 18, boxShadow: T.e2, marginBottom: 26 }}>
        <div role="img" aria-label="Maya Chen" style={{ width: 58, height: 58, flex: 'none', borderRadius: '50%',
          background: `radial-gradient(120% 120% at 32% 26%, ${T.bubbleBg} 0%, ${T.accentTint} 120%)`,
          display: 'grid', placeItems: 'center', boxShadow: T.e1 }}>
          <span style={{ fontFamily: FF_DISPLAY, fontWeight: 600, fontSize: 24, color: T.bubbleText }}>M</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FF_DISPLAY, fontWeight: 600, fontSize: 22, lineHeight: 1.12, color: T.textPrimary, letterSpacing: '-0.01em' }}>Maya Chen</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 5 }}>
            <span style={{ fontFamily: FF_BODY, fontWeight: 500, fontSize: 14, color: T.textSecondary }}>@maya</span>
            {premium ? (
              <span style={{ fontFamily: FF_BODY, fontWeight: 700, fontSize: 11, letterSpacing: '0.04em', color: T.onAccent,
                background: T.accent, borderRadius: 999, padding: '3px 10px' }}>PREMIUM</span>
            ) : (
              <span style={{ fontFamily: FF_BODY, fontWeight: 600, fontSize: 11, letterSpacing: '0.04em', color: T.textSecondary,
                border: `1px solid ${T.border}`, borderRadius: 999, padding: '2px 10px' }}>FREE</span>
            )}
          </div>
        </div>
        <button type="button" aria-label="Edit profile" onClick={() => goScreen('editprofile')}
          style={{ width: 40, height: 40, flex: 'none', borderRadius: '50%', display: 'grid', placeItems: 'center',
            background: T.bg, border: `1px solid ${T.border}`, color: T.textSecondary, cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
        </button>
      </div>

      <Group T={T} title="Account">
        <Row T={T} label="Edit profile" onClick={() => goScreen('editprofile')} />
        <Row T={T} label="Subscription" last
          detail={premium ? 'Manage in App Store' : 'Upgrade to Premium'} detailAccent={!premium}
          onClick={() => goScreen('paywall')} />
      </Group>

      <Group T={T} title="Notifications">
        <Row T={T} label="Aurora replied" last toggle={<Toggle T={T} on={notif} onClick={() => setNotif(v => !v)} />} />
      </Group>

      <Group T={T} title="Privacy & Safety">
        <Row T={T} label="Safety center" onClick={() => goScreen('safety')} />
        <Row T={T} label="Privacy policy" onClick={() => goScreen('legal')} />
        <Row T={T} label="Data export" onClick={() => goScreen('account')} />
        <Row T={T} label="Delete account" last onClick={() => setDialog('delete')} />
      </Group>

      <Group T={T} title="Support">
        <Row T={T} label="Help" onClick={() => goScreen('help')} />
        <Row T={T} label="Rate Aura" last onClick={() => {}} />
      </Group>

      {/* isolated sign out + version footer */}
      <button type="button" onClick={() => setDialog('signout')}
        style={{ width: '100%', minHeight: 52, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: T.raised, border: `1px solid ${T.border}`, borderRadius: 8, cursor: 'pointer', marginTop: 8,
          fontFamily: FF_BODY, fontWeight: 600, fontSize: 16, color: T.textPrimary, WebkitTapHighlightColor: 'transparent' }}>
        Sign out
      </button>
      <div style={{ textAlign: 'center', fontFamily: FF_BODY, fontWeight: 500, fontSize: 12, color: T.textTertiary, marginTop: 18 }}>
        Aura · version 1.0.0
      </div>

      {dialog === 'signout' && (
        <ConfirmDialog T={T} title="Sign out?" body="You can sign back in anytime. Aurora will be right where you left her."
          confirmLabel="Sign out" onConfirm={() => setDialog(null)} onCancel={() => setDialog(null)} />
      )}
      {dialog === 'delete' && (
        <ConfirmDialog T={T} destructive title="Delete account?"
          body="This permanently erases your account, conversations, and memories. This can’t be undone."
          confirmLabel="Delete account" onConfirm={() => setDialog(null)} onCancel={() => setDialog(null)} />
      )}
    </div>
  );
}

/* ── the one stub used by every tab ────────────────────────────────────────── */
function Stub({ tab }) {
  const T = useT();
  const d = useDev();
  const stateName = tab.states && tab.states.length > 1 ? d.screenState : (tab.states ? tab.states[0] : null);
  return (
    <div style={{ minHeight: '100%', background: T.bg, display: 'flex', flexDirection: 'column', padding: `${SAFE_TOP}px 28px ${NAV_CLEARANCE}px` }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ fontFamily: FF_BODY, fontWeight: 600, fontSize: 11.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: T.textTertiary, marginBottom: 16 }}>
          {`Tab · ${tab.label}`}
        </div>
        <h1 style={{ fontFamily: FF_DISPLAY, fontWeight: 600, fontSize: 36, lineHeight: 1.08, color: T.textPrimary, margin: '0 0 14px', letterSpacing: 0.2 }}>
          {tab.label}
        </h1>
        <p style={{ fontFamily: FF_BODY, fontSize: 16, lineHeight: 1.55, color: T.textSecondary, margin: 0, maxWidth: '28ch', textWrap: 'pretty' }}>
          {tab.purpose}
        </p>
        {stateName && (
          <div style={{ marginTop: 22, display: 'inline-flex', alignItems: 'center', gap: 7,
            fontFamily: FF_BODY, fontWeight: 600, fontSize: 12.5, color: T.accent,
            background: T.accentTint, border: `1px solid ${T.border}`, padding: '6px 14px', borderRadius: 999 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.accent }} />
            state · {stateName}
          </div>
        )}
        <div style={{ marginTop: 26, fontFamily: FF_BODY, fontSize: 12, color: T.textTertiary, opacity: 0.85 }}>
          Stub — design pending
        </div>
      </div>
    </div>
  );
}

/* ── Shell: active tab + persistent navpill ────────────────────────────────── */
function Shell() {
  const d = useDev();
  const tab = TABS.find(t => t.id === d.screenId) || TABS[0];
  return (
    <IOSDevice dark={d.theme === 'dark'}>
      <div style={{ position: 'relative', height: '100%', background: TOKENS[d.theme === 'dark' ? 'dark' : 'light'].bg }}>
        <div className="app-scroll" style={{ height: '100%', overflowY: 'auto' }}>
          {tab.id === 'home' ? <Home /> : tab.id === 'companions' ? <Companions /> : tab.id === 'you' ? <You /> : <Stub tab={tab} />}
        </div>
        <NavPill />
      </div>
    </IOSDevice>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <DevProvider screens={TABS} initial={{ screenId: 'home', theme: 'light', account: 'free', dataState: 'happy' }}>
    <DevStage><Shell /></DevStage>
  </DevProvider>
);
