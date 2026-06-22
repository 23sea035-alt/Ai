// @ds-adherence-ignore -- dev tooling scaffold (raw elements/hex/px by design)
//
// dev-harness.jsx — out-of-frame DEV NAVIGATOR + state toggles for Aura Claude Design artifacts.
// Pairs with ios-frame.jsx. Exports to window: DevProvider, useDev, DevRail, DevStage.
//
// This chrome lives OUTSIDE the iOS frame (a fixed panel to the LEFT) and is intentionally neutral/
// dark so it's never mistaken for Aura's warm UI. It is dev-only: gated behind ?dev=1 (default ON in
// these review prototypes; add ?dev=0 to hide). Screens read state via useDev() and render variants —
// so flipping a toggle is also the way we verify every screen actually has all its states built.
//
// Wiring (per artifact):
//   const SCREENS = [
//     { id: 'welcome',  label: 'Welcome (carousel)', states: ['slide1','slide2','slide3'] },
//     { id: 'auth',     label: 'Auth',               states: ['signup','signin','forgot','verify','reset'] },
//     { id: 'chat',     label: 'Chat',               states: ['default','typing','crisis','limit'] },
//     ...
//   ];
//   function Shell() {
//     const { screenId } = useDev();
//     return <IOSDevice dark={useDev().theme === 'dark'}>{ renderScreen(screenId) }</IOSDevice>;
//   }
//   ReactDOM.createRoot(document.getElementById('root')).render(
//     <DevProvider screens={SCREENS}><DevStage><Shell/></DevStage></DevProvider>
//   );

const DevContext = React.createContext(null);
function useDev() { return React.useContext(DevContext) || {}; }

const DEV_ON = (() => {
  try { return new URLSearchParams(window.location.search).get('dev') !== '0'; }
  catch (e) { return true; }
})();

function DevProvider({ screens = [], children, initial = {} }) {
  const { useState, useMemo, useCallback } = React;
  const firstState = (id) => (screens.find((s) => s.id === id)?.states || [])[0] || null;

  const [screenId, setScreenIdRaw] = useState(initial.screenId ?? screens[0]?.id);
  const [theme, setTheme] = useState(initial.theme ?? 'dark');        // 'light' | 'dark' (warm-dark)
  const [account, setAccount] = useState(initial.account ?? 'free');  // 'free' | 'premium'
  const [dataState, setDataState] = useState(initial.dataState ?? 'happy'); // happy|empty|loading|error
  const [screenState, setScreenState] = useState(initial.screenState ?? firstState(initial.screenId ?? screens[0]?.id));

  // Switching screens resets the per-screen state to that screen's first declared state.
  const setScreenId = useCallback((id) => { setScreenIdRaw(id); setScreenState(firstState(id)); }, [screens]);

  const value = useMemo(() => ({
    screens, screenId, setScreenId, theme, setTheme, account, setAccount,
    dataState, setDataState, screenState, setScreenState, devOn: DEV_ON,
  }), [screens, screenId, theme, account, dataState, screenState]);

  return <DevContext.Provider value={value}>{children}</DevContext.Provider>;
}

// ── styling (scoped, dev-only) ────────────────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('aura-devrail-style')) {
  const st = document.createElement('style');
  st.id = 'aura-devrail-style';
  st.textContent = `
    .dev-stage{display:flex;align-items:stretch;min-height:100vh;background:#0c0c0f;}
    .dev-rail{width:248px;flex:0 0 248px;box-sizing:border-box;padding:18px 16px;overflow-y:auto;
      background:#141418;border-right:1px solid rgba(255,255,255,0.08);color:#e6e6ea;
      font-family:-apple-system,system-ui,sans-serif;}
    .dev-stage-canvas{flex:1;display:flex;align-items:center;justify-content:center;padding:24px;overflow:hidden;}
    .dev-h{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#8a8a93;margin:18px 0 8px;}
    .dev-h:first-child{margin-top:0;}
    .dev-title{font-size:14px;font-weight:800;letter-spacing:-.2px;color:#fff;margin-bottom:2px;}
    .dev-sub{font-size:11px;color:#8a8a93;margin-bottom:6px;}
    .dev-jump{width:100%;box-sizing:border-box;padding:8px 10px;border-radius:9px;background:#1f1f25;
      color:#fff;border:1px solid rgba(255,255,255,0.1);font-size:13px;font-family:inherit;}
    .dev-seg{display:flex;flex-wrap:wrap;gap:6px;}
    .dev-chip{flex:1 1 auto;min-width:0;padding:7px 10px;border-radius:8px;background:#1f1f25;color:#b9b9c2;
      border:1px solid rgba(255,255,255,0.08);font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;
      text-align:center;-webkit-tap-highlight-color:transparent;transition:all .15s;}
    .dev-chip:hover{color:#fff;}
    .dev-chip.on{background:#2b6cff;border-color:#2b6cff;color:#fff;}
    .dev-hint{font-size:10.5px;color:#6a6a73;line-height:1.5;margin-top:16px;}
    .dev-scaler{transform-origin:center center;}
  `;
  document.head.appendChild(st);
}

function DevSeg({ options, value, onChange }) {
  return (
    <div className="dev-seg">
      {options.map((o) => (
        <button key={o} type="button" className={'dev-chip' + (value === o ? ' on' : '')} onClick={() => onChange(o)}>{o}</button>
      ))}
    </div>
  );
}

function DevRail() {
  const d = useDev();
  if (!d.devOn) return null;
  const active = d.screens.find((s) => s.id === d.screenId);
  return (
    <div className="dev-rail" data-dev>
      <div className="dev-title">Aura · Dev</div>
      <div className="dev-sub">not part of the app — review tooling</div>

      <div className="dev-h">Screen</div>
      <select className="dev-jump" value={d.screenId} aria-label="Jump to screen"
              onChange={(e) => d.setScreenId(e.target.value)}>
        {d.screens.map((s, i) => <option key={s.id} value={s.id}>{(i + 1) + '. ' + (s.label || s.id)}</option>)}
      </select>

      <div className="dev-h">Theme</div>
      <DevSeg options={['light', 'dark']} value={d.theme} onChange={d.setTheme} />

      <div className="dev-h">Account</div>
      <DevSeg options={['free', 'premium']} value={d.account} onChange={d.setAccount} />

      <div className="dev-h">Data state</div>
      <DevSeg options={['happy', 'empty', 'loading', 'error']} value={d.dataState} onChange={d.setDataState} />

      {active?.states?.length ? (
        <>
          <div className="dev-h">{(active.label || active.id) + ' state'}</div>
          <DevSeg options={active.states} value={d.screenState} onChange={d.setScreenState} />
        </>
      ) : null}

      <div className="dev-hint">Toggles drive <code>useDev()</code> — every screen should render each
        state. Add <code>?dev=0</code> to hide this rail for clean screenshots.</div>
    </div>
  );
}

// Lays out [rail][scaled frame] and fits the 402×874 device to the available canvas.
function DevStage({ children, frameW = 402, frameH = 874 }) {
  const { useRef, useEffect, useState } = React;
  const d = useDev();
  const canvasRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const fit = () => {
      const el = canvasRef.current; if (!el) return;
      const pad = 48;
      const s = Math.min((el.clientWidth - pad) / frameW, (el.clientHeight - pad) / frameH, 1);
      setScale(s > 0 ? s : 1);
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [frameW, frameH]);

  if (!d.devOn) return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: d.theme === 'dark' ? '#000' : '#F2F2F7' }}>{children}</div>;

  return (
    <div className="dev-stage">
      <DevRail />
      <div className="dev-stage-canvas" ref={canvasRef}>
        <div className="dev-scaler" style={{ transform: `scale(${scale})`, width: frameW, height: frameH }}>{children}</div>
      </div>
    </div>
  );
}

Object.assign(window, { DevProvider, useDev, DevRail, DevStage });
