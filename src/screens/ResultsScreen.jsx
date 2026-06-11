import { useState, useEffect } from 'react';
import { TYPS } from '../data/typologies.js';
import { matchVehicle } from '../data/vehicles.js';
import { genNarrative } from '../lib/physics.js';
import { useBreakpoint } from '../lib/breakpoint.js';

// ─── Shared primitives ────────────────────────────────────────────────────────

function Eyebrow({ children, color = 'var(--ink-tertiary)' }) {
  return (
    <div style={{
      fontFamily: 'var(--font-sans)',
      fontSize: 13,
      fontWeight: 500,
      letterSpacing: '1.5px',
      textTransform: 'uppercase',
      color,
      marginBottom: 8,
    }}>
      {children}
    </div>
  );
}

function Card({ children }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '0.5px solid var(--hairline)',
      borderRadius: 'var(--r-lg)',
      padding: '16px 20px',
    }}>
      {children}
    </div>
  );
}

function MetricBlock({ label, value, caption, color = 'var(--ink)' }) {
  return (
    <div style={{
      background: 'var(--surface-sunken)',
      borderRadius: 'var(--r-md)',
      padding: 16,
    }}>
      <div style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 13,
        fontWeight: 500,
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        color: 'var(--ink-tertiary)',
        marginBottom: 8,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'clamp(28px, 3.5vw, 40px)',
        fontWeight: 500,
        letterSpacing: '-0.5px',
        lineHeight: 1,
        color,
      }}>
        {value}
      </div>
      {caption && (
        <div style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 13,
          color: 'var(--ink-tertiary)',
          marginTop: 6,
        }}>
          {caption}
        </div>
      )}
    </div>
  );
}

const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

// ─── Layered-defense icons (Tabler-style inline SVGs) ─────────────────────────

const SvgShield = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3L4 7v5c0 4.22 3.33 8.09 8 9.5 4.67-1.41 8-5.28 8-9.5V7z"/>
  </svg>
);
const SvgBrakeDisk = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/>
    <line x1="12" y1="3" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="21"/>
    <line x1="3" y1="12" x2="9" y2="12"/><line x1="21" y1="12" x2="15" y2="12"/>
  </svg>
);
const SvgBelt = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="7" y1="3" x2="17" y2="21"/>
    <rect x="9.5" y="9" width="5" height="6" rx="1"/>
  </svg>
);
const SvgAirbag = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="8"/>
    <line x1="12" y1="4" x2="12" y2="7"/><line x1="12" y1="17" x2="12" y2="20"/>
    <line x1="4" y1="12" x2="7" y2="12"/><line x1="17" y1="12" x2="20" y2="12"/>
  </svg>
);
const SvgCrumple = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="17" y1="4" x2="17" y2="20"/><line x1="20" y1="4" x2="20" y2="20"/>
    <line x1="4" y1="12" x2="13" y2="12"/>
    <polyline points="9,8 13,12 9,16"/>
  </svg>
);
const SvgBolt = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="13,2 7,13 12,13 11,22 17,11 12,11 13,2"/>
  </svg>
);
const SvgStability = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 17c2-4 4-5 6-5s4 3 6 3c1 0 2-1 2-3"/>
    <circle cx="7" cy="19" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="17" cy="19" r="1.5" fill="currentColor" stroke="none"/>
  </svg>
);
const SvgCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9"/>
    <polyline points="9,12 11,14 15,10"/>
  </svg>
);

const ICON_MAP = {
  aeb: SvgShield, abs: SvgBrakeDisk, belt: SvgBelt,
  airbag: SvgAirbag, crumple: SvgCrumple, ev: SvgBolt,
  esc: SvgStability, stop: SvgCheck,
};

// ─── Timeline builder ─────────────────────────────────────────────────────────

function buildTimeline(cfg, res) {
  const { sys, pas, isEV, typology, speed } = cfg;
  const items = [];

  if (sys.aeb) {
    items.push({
      msLabel: res.hit ? '−450 ms' : '−' + Math.max(80, Math.round(res.dB * 38)) + ' ms',
      icon: 'aeb',
      name: 'AEB',
      text: res.hit
        ? `Pre-braked from ${speed} to ${Math.round(speed * 0.45)} km/h before driver braking began`
        : `Reduced approach to ${Math.round(speed * 0.45)} km/h, extending safe stopping margin`,
      ok: true,
    });
  }

  if (sys.abs && res.absGn > 0.3) {
    items.push({
      msLabel: '0 ms',
      icon: 'abs',
      name: 'ABS',
      text: `Prevented wheel lock throughout braking — saved ${res.absGn.toFixed(1)} m of stopping distance`,
      ok: true,
    });
  } else if (!sys.abs && res.hit) {
    items.push({
      msLabel: '0 ms',
      icon: 'abs',
      name: 'ABS',
      text: `Not equipped — wheels locked under braking, adding an estimated ${Math.round(res.dB * 0.13)} m`,
      ok: false,
    });
  }

  if (sys.esc && !res.hit && typology !== 'noncollision') {
    items.push({
      msLabel: '0 ms',
      icon: 'esc',
      name: 'ESC',
      text: `Electronic stability control maintained vehicle direction during emergency braking`,
      ok: true,
    });
  }

  if (res.hit) {
    if (typology === 'ev_ice' && isEV) {
      items.push({
        msLabel: '< 1 ms',
        icon: 'ev',
        name: 'HV isolation',
        text: `Pyrofuse disconnected high-voltage bus — 400–800 V system isolated before occupant loading`,
        ok: true,
      });
    }

    if (pas.belt) {
      items.push({
        msLabel: '8 ms',
        icon: 'belt',
        name: 'Pretensioner',
        text: `Pulled you ~12 cm back into the seat, removing all slack before the airbag arrived`,
        ok: true,
      });
    } else {
      items.push({
        msLabel: '8 ms',
        icon: 'belt',
        name: 'Seatbelt',
        text: `Not worn — occupant unrestrained at onset of deceleration; fatality risk multiplied ×3`,
        ok: false,
      });
    }

    if (pas.sideBag) {
      items.push({
        msLabel: '12 ms',
        icon: 'airbag',
        name: 'Curtain airbag',
        text: `Deployed laterally in ~12 ms, maintaining head clearance from door structure`,
        ok: true,
      });
    }

    if (pas.frontBag) {
      items.push({
        msLabel: '20 ms',
        icon: 'airbag',
        name: 'Front airbag',
        text: `Deployed at full pressure in ~20 ms, cushioning head and chest at ${Math.round(res.dvK)} km/h ΔV`,
        ok: true,
      });
    } else {
      items.push({
        msLabel: '20 ms',
        icon: 'airbag',
        name: 'Front airbag',
        text: `Not equipped — head and chest unprotected at peak deformation load`,
        ok: false,
      });
    }

    if (pas.belt) {
      items.push({
        msLabel: '30 ms',
        icon: 'belt',
        name: 'Load limiter',
        text: `Belt webbing fed ~${Math.round(8 + pas.crumple * 1.5)} cm, capping chest load to target design force`,
        ok: true,
      });
    }

    if (pas.crumple >= 2) {
      items.push({
        msLabel: '30–80 ms',
        icon: 'crumple',
        name: 'Crumple zone',
        text: `${pas.crumple}-star structure absorbed ${Math.round(res.crAbs * 100)}% of crash energy — ${(res.KE * res.crAbs).toFixed(0)} kJ converted to structural deformation`,
        ok: true,
      });
    }

    if (typology === 'ev_ice' && isEV) {
      items.push({
        msLabel: 'ongoing',
        icon: 'ev',
        name: 'Thermal risk window',
        text: `Battery thermal monitoring active — 72-hour runaway risk window begins at time of crash`,
        ok: false,
      });
    }
  } else {
    items.push({
      msLabel: 'stop',
      icon: 'stop',
      name: 'Controlled stop',
      text: `Vehicle stopped ${(cfg.obsDist - res.dTot).toFixed(1)} m before the obstacle — passive systems not deployed`,
      ok: true,
    });
  }

  return items;
}

// ─── Layered-defense reveal component ────────────────────────────────────────

function LayeredDefenseReveal({ cfg, res }) {
  const items = buildTimeline(cfg, res);
  const prefersReduced = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const total = items.length + 1;

  const [revealed, setRevealed] = useState(prefersReduced ? total : 0);

  useEffect(() => {
    if (prefersReduced || revealed >= total) return;
    const delay = revealed === 0 ? 250 : 400;
    const t = setTimeout(() => setRevealed(r => r + 1), delay);
    return () => clearTimeout(t);
  }, [revealed, total, prefersReduced]);

  const synthesis = res.hit
    ? 'No single system saved you — they worked as one'
    : 'Each system in this chain contributed — the safe stop was their combined result';

  return (
    <div style={{
      background: 'var(--surface)',
      border: '0.5px solid var(--hairline)',
      borderRadius: 'var(--r-lg)',
      padding: '16px 20px',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
      }}>
        <div style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color: 'var(--ink-tertiary)',
        }}>
          Layered defense
        </div>
        {revealed >= total && !prefersReduced && (
          <button
            onClick={() => setRevealed(0)}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              fontWeight: 500,
              background: 'transparent',
              color: 'var(--ink-tertiary)',
              border: '0.5px solid var(--hairline-strong)',
              borderRadius: 'var(--r-sm)',
              padding: '3px 10px',
              cursor: 'pointer',
              transition: 'background 150ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-sunken)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            Replay
          </button>
        )}
      </div>

      {items.map((item, i) => {
        const Icon = ICON_MAP[item.icon] || SvgCheck;
        const vis = revealed > i;
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: 12,
              padding: '10px 0',
              borderBottom: i < items.length - 1 ? '0.5px solid var(--hairline)' : 'none',
              alignItems: 'flex-start',
              opacity: vis ? 1 : 0,
              transform: vis ? 'translateY(0)' : 'translateY(8px)',
              transition: prefersReduced ? 'none' : 'opacity 500ms ease, transform 500ms ease',
            }}
          >
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--ink-tertiary)',
              minWidth: 54,
              flexShrink: 0,
              lineHeight: '20px',
              textAlign: 'right',
              paddingTop: 0,
            }}>
              {item.msLabel}
            </div>
            <div style={{
              color: item.ok ? 'var(--safe)' : 'var(--fatal)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'flex-start',
              paddingTop: 2,
            }}>
              <Icon />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--ink)',
                marginBottom: 2,
                lineHeight: 1.4,
              }}>
                {item.name}
              </div>
              <div style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                color: 'var(--ink-secondary)',
                lineHeight: 1.55,
              }}>
                {item.text}
              </div>
            </div>
            <div style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              color: item.ok ? 'var(--safe)' : 'var(--fatal)',
              flexShrink: 0,
              lineHeight: '20px',
            }}>
              {item.ok ? '✓' : '✗'}
            </div>
          </div>
        );
      })}

      <div style={{
        marginTop: 16,
        paddingTop: 14,
        borderTop: '0.5px solid var(--hairline)',
        opacity: revealed >= total ? 1 : 0,
        transform: revealed >= total ? 'translateY(0)' : 'translateY(8px)',
        transition: prefersReduced ? 'none' : 'opacity 500ms ease, transform 500ms ease',
      }}>
        <div style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 14,
          fontWeight: 500,
          fontStyle: 'italic',
          color: res.hit ? 'var(--fatal-text)' : 'var(--safe-text)',
          lineHeight: 1.5,
        }}>
          {synthesis}
        </div>
      </div>
    </div>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ResultsScreen({ cfg, res, onRestart, onChange, onNew }) {
  const [physOpen, setPhysOpen] = useState(false);
  const mobile = useBreakpoint() === 'mobile';
  if (!res) return null;

  const typ = TYPS.find(t => t.id === cfg.typology) || TYPS[0];
  const { vehicle } = matchVehicle(cfg);

  const sem = res.hit
    ? { bg: 'var(--fatal-bg)', text: 'var(--fatal-text)', core: 'var(--fatal)' }
    : { bg: 'var(--safe-bg)', text: 'var(--safe-text)', core: 'var(--safe)' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex', flexDirection: 'column' }}>

      {/* ── Frosted header ──────────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        height: 56,
        background: 'rgba(247,244,238,0.72)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '0.5px solid var(--hairline)',
        display: 'flex',
        alignItems: 'center',
        padding: mobile ? '0 20px' : '0 32px',
        flexShrink: 0,
        gap: 8,
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            color: 'var(--ink-tertiary)',
            lineHeight: 1,
          }}>
            Chasing Horsepower
          </div>
          <div style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            color: 'var(--ink-secondary)',
            marginTop: 2,
          }}>
            Analysis
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <button
          onClick={onRestart}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            fontWeight: 500,
            background: 'var(--ember)',
            color: 'var(--stage)',
            border: 'none',
            borderRadius: 'var(--r-sm)',
            padding: '6px 14px',
            cursor: 'pointer',
            transition: 'background 150ms ease, transform 150ms ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--ember-600)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--ember)'; }}
          onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)'; }}
          onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {mobile ? '▶' : '▶  Simulate again'}
        </button>
        <button
          onClick={onChange}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            background: 'transparent',
            color: 'var(--ink-secondary)',
            border: '0.5px solid var(--hairline-strong)',
            borderRadius: 'var(--r-sm)',
            padding: '6px 14px',
            cursor: 'pointer',
            transition: 'background 150ms ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-sunken)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)'; }}
          onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          ← Edit
        </button>
        {!mobile && (
          <button
            onClick={onNew}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              background: 'transparent',
              color: 'var(--ink-tertiary)',
              border: 'none',
              padding: '6px 4px',
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            New
          </button>
        )}
      </header>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, overflowY: 'auto', padding: mobile ? '32px 20px' : '40px 32px' }}>
        <div style={{
          maxWidth: 820,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
        }}>

          {/* ── 1. Verdict header ───────────────────────────────────────────── */}
          <div style={{
            background: sem.bg,
            borderRadius: 'var(--r-lg)',
            padding: mobile ? '20px' : '24px 28px',
            display: 'flex',
            flexDirection: mobile ? 'column' : 'row',
            alignItems: mobile ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            gap: mobile ? 20 : 32,
          }}>
            <div>
              <Eyebrow color={sem.text}>{typ.name} · {cfg.speed} km/h</Eyebrow>
              <div style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 30,
                fontWeight: 500,
                letterSpacing: '-0.3px',
                color: sem.text,
                marginBottom: 8,
                lineHeight: 1.15,
              }}>
                {res.hit ? 'Fatal outcome' : 'You survived'}
              </div>
              <div style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 14,
                lineHeight: 1.6,
                color: 'var(--ink-secondary)',
              }}>
                {res.hit
                  ? `Collision at ${res.vImpK.toFixed(1)} km/h · ${res.KE.toFixed(0)} kJ kinetic energy`
                  : `Stopped ${(cfg.obsDist - res.dTot).toFixed(1)} m before the obstacle`}
              </div>
            </div>
            <div style={{ flexShrink: 0, textAlign: mobile ? 'left' : 'right' }}>
              <div style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                color: sem.text,
                marginBottom: 4,
                opacity: 0.75,
              }}>
                {res.hit ? 'Fatality risk' : 'Clearance'}
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(36px, 4vw, 48px)',
                fontWeight: 500,
                letterSpacing: '-0.5px',
                lineHeight: 1,
                color: sem.text,
              }}>
                {res.hit ? `${Math.round(res.fRisk * 100)}%` : `${(cfg.obsDist - res.dTot).toFixed(1)} m`}
              </div>
            </div>
          </div>

          {/* ── 2. Layered defense reveal ────────────────────────────────────── */}
          <LayeredDefenseReveal cfg={cfg} res={res} />

          {/* ── 3. Crash dynamics metric blocks ─────────────────────────────── */}
          <div>
            <Eyebrow>Crash dynamics</Eyebrow>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 12,
            }}>
              <MetricBlock
                label="Reaction distance"
                value={`${res.dR.toFixed(1)} m`}
              />
              <MetricBlock
                label="Brake distance"
                value={`${res.dB.toFixed(1)} m`}
              />
              <MetricBlock
                label="Stopping distance"
                value={`${res.dTot.toFixed(1)} m`}
                color={res.hit ? 'var(--fatal-text)' : 'var(--safe-text)'}
              />
              {res.hit
                ? <MetricBlock
                    label="Impact speed"
                    value={`${res.vImpK.toFixed(1)} km/h`}
                    color="var(--fatal-text)"
                  />
                : <MetricBlock
                    label="Clearance"
                    value={`${(cfg.obsDist - res.dTot).toFixed(1)} m`}
                    color="var(--safe-text)"
                    caption="before obstacle"
                  />
              }
              {res.hit && <>
                <MetricBlock
                  label="Kinetic energy"
                  value={`${res.KE.toFixed(0)} kJ`}
                />
                <MetricBlock
                  label="ΔV to cabin"
                  value={`${res.dvK.toFixed(1)} km/h`}
                  color="var(--fatal-text)"
                />
              </>}
            </div>
          </div>

          {/* ── Injury risk (collision only) ─────────────────────────────────── */}
          {res.hit && (
            <Card>
              <Eyebrow>Injury risk assessment</Eyebrow>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  ['Head injury', res.headR],
                  ['Chest injury', res.chestR],
                  ['Spinal risk', res.spineR],
                ].map(([label, level], i) => {
                  const lc = level === 'LOW' ? 'var(--safe-text)'
                    : level === 'MODERATE' ? 'var(--warn-text)'
                    : 'var(--fatal-text)';
                  return (
                    <div key={label} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      padding: '7px 0',
                      borderBottom: i < 2 ? '0.5px solid var(--hairline)' : 'none',
                    }}>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--ink-secondary)' }}>
                        {label}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: 13,
                        fontWeight: 500,
                        letterSpacing: '0.5px',
                        color: lc,
                      }}>
                        {level}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div style={{
                marginTop: 12,
                background: 'var(--surface-sunken)',
                borderRadius: 'var(--r-sm)',
                padding: '8px 12px',
              }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-tertiary)' }}>
                  Overall — {' '}
                </span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>
                  {res.inj}
                </span>
              </div>
            </Card>
          )}

          {/* ── 4. Contributing factors + To survive (collision only) ──────── */}
          {res.hit && res.causes && res.causes.length > 0 && (
            <Card>
              <Eyebrow color="var(--fatal-text)">Contributing factors</Eyebrow>
              {res.causes.map((cause, i) => (
                <div key={i} style={{
                  display: 'flex',
                  gap: 12,
                  padding: '7px 0',
                  borderBottom: i < res.causes.length - 1 ? '0.5px solid var(--hairline)' : 'none',
                  alignItems: 'flex-start',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--fatal-text)',
                    flexShrink: 0,
                    lineHeight: 1.6,
                    minWidth: 16,
                  }}>
                    {i + 1}.
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 14,
                    color: 'var(--ink-secondary)',
                    lineHeight: 1.6,
                  }}>
                    {cause}
                  </span>
                </div>
              ))}
            </Card>
          )}

          {res.hit && res.recs && res.recs.length > 0 && (
            <Card>
              <Eyebrow color="var(--safe-text)">To survive this scenario</Eyebrow>
              {res.recs.map((rec, i) => (
                <div key={i} style={{
                  display: 'flex',
                  gap: 12,
                  padding: '7px 0',
                  borderBottom: i < res.recs.length - 1 ? '0.5px solid var(--hairline)' : 'none',
                  alignItems: 'flex-start',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 14,
                    color: 'var(--safe)',
                    flexShrink: 0,
                    lineHeight: 1.6,
                  }}>
                    →
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 14,
                    color: 'var(--ink-secondary)',
                    lineHeight: 1.6,
                  }}>
                    {rec}
                  </span>
                </div>
              ))}
            </Card>
          )}

          {/* ── 5. Field investigation notes ────────────────────────────────── */}
          <Card>
            <Eyebrow>Field investigation notes</Eyebrow>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 17,
              fontWeight: 400,
              lineHeight: 1.7,
              color: 'var(--ink-secondary)',
              margin: 0,
            }}>
              {genNarrative(res, cfg, typ)}
            </p>
          </Card>

          {/* ── 6. Real-world parallel ──────────────────────────────────────── */}
          <Card>
            <Eyebrow color={typ.col}>Real-world parallel</Eyebrow>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 17,
              lineHeight: 1.7,
              color: 'var(--ink-secondary)',
              margin: '0 0 20px',
            }}>
              {typ.ncapRef}
            </p>
            {typ.reforms && typ.reforms.length > 0 && (
              <>
                <div style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13,
                  fontWeight: 500,
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  color: 'var(--ink-tertiary)',
                  marginBottom: 12,
                }}>
                  What this crash informs
                </div>
                {typ.reforms.map((reform, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    gap: 10,
                    marginBottom: i < typ.reforms.length - 1 ? 8 : 0,
                    alignItems: 'flex-start',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 14,
                      color: 'var(--ink-tertiary)',
                      flexShrink: 0,
                      lineHeight: 1.6,
                    }}>
                      →
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 14,
                      color: 'var(--ink-secondary)',
                      lineHeight: 1.6,
                    }}>
                      {reform}
                    </span>
                  </div>
                ))}
              </>
            )}
          </Card>

          {/* ── Real-world vehicle match ─────────────────────────────────────── */}
          <Card>
            <Eyebrow>Real-world match</Eyebrow>
            <div style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 17,
              fontWeight: 500,
              color: 'var(--ink)',
              marginBottom: 6,
            }}>
              {vehicle.name}
            </div>
            {vehicle.stars > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <span style={{ color: 'var(--warn)', fontSize: 14, letterSpacing: 1 }}>
                  {'★'.repeat(vehicle.stars)}
                </span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-tertiary)' }}>
                  {vehicle.src}
                </span>
              </div>
            ) : (
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-tertiary)', marginBottom: 8 }}>
                Not rated
              </div>
            )}
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              fontStyle: 'italic',
              lineHeight: 1.5,
              color: 'var(--ink-secondary)',
              margin: 0,
            }}>
              {vehicle.note}
            </p>
          </Card>

          {/* ── 7. Physics deep dive — collapsed by default ──────────────────── */}
          <div style={{
            background: 'var(--surface)',
            border: '0.5px solid var(--hairline)',
            borderRadius: 'var(--r-lg)',
            overflow: 'hidden',
          }}>
            <button
              onClick={() => setPhysOpen(o => !o)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'background 150ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-sunken)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                color: 'var(--ink-tertiary)',
              }}>
                Physics deep dive
              </span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-tertiary)' }}>
                {physOpen ? '▲' : '▼'}
              </span>
            </button>
            {physOpen && (
              <div style={{ borderTop: '0.5px solid var(--hairline)', padding: '16px 20px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: mobile ? '1fr' : '1fr 1fr',
                  gap: 8,
                }}>
                  {[
                    ['Effective μ', res.mu.toFixed(4)],
                    ['Reaction time', `${res.rxT.toFixed(2)} s`],
                    ['Approach speed', `${(cfg.speed / 3.6).toFixed(1)} m/s`],
                    ['AEB pre-brake', cfg.sys.aeb ? `${(cfg.speed / 3.6 * 0.45).toFixed(1)} m/s` : 'N/A'],
                    ['Reaction distance', `${res.dR.toFixed(2)} m`],
                    ['Brake dist (raw)', `${(res.dB + res.absGn).toFixed(2)} m`],
                    ['ABS saving', `${res.absGn.toFixed(2)} m`],
                    ['Brake dist (final)', `${res.dB.toFixed(2)} m`],
                    ['Impact speed', `${res.vImp.toFixed(2)} m/s`],
                    ['Kinetic energy', `${res.KE.toFixed(1)} kJ`],
                    ['Crumple absorbed', `${Math.round(res.crAbs * 100)}%`],
                    ['ΔV to cabin', `${res.dvK.toFixed(1)} km/h`],
                    ['Fatality risk', `${(res.fRisk * 100).toFixed(1)}%`],
                  ].map(([k, v], i) => (
                    <div key={i} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '4px 0',
                      borderBottom: '0.5px solid var(--hairline)',
                    }}>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-tertiary)' }}>
                        {k}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink)' }}>
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Footer actions ───────────────────────────────────────────────── */}
          <div style={{
            display: 'flex',
            flexDirection: mobile ? 'column' : 'row',
            alignItems: mobile ? 'stretch' : 'center',
            justifyContent: 'center',
            gap: 12,
            paddingBottom: mobile ? 16 : 40,
            paddingTop: 8,
          }}>
            <button
              onClick={onRestart}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 15,
                fontWeight: 500,
                background: 'var(--ember)',
                color: 'var(--stage)',
                border: 'none',
                borderRadius: 'var(--r-sm)',
                padding: '12px 28px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'background 150ms ease, transform 150ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--ember-600)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--ember)'; }}
              onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)'; }}
              onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              Simulate again
              <ArrowRight />
            </button>
            <button
              onClick={onChange}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 15,
                fontWeight: 500,
                background: 'transparent',
                color: 'var(--ink-secondary)',
                border: '0.5px solid var(--hairline-strong)',
                borderRadius: 'var(--r-sm)',
                padding: '12px 28px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 150ms ease, transform 150ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-sunken)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)'; }}
              onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              Change scenario
            </button>
            <button
              onClick={onNew}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 14,
                background: 'transparent',
                color: 'var(--ink-tertiary)',
                border: 'none',
                padding: '12px 8px',
                cursor: 'pointer',
                textDecoration: 'underline',
                textUnderlineOffset: 3,
              }}
            >
              New simulation
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
