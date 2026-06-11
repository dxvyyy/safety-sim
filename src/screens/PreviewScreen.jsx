import { useMemo } from 'react';
import { SURF } from '../data/surfaces.js';
import { WX } from '../data/weather.js';
import { RT } from '../data/reactions.js';
import { TYPS } from '../data/typologies.js';
import { matchVehicle } from '../data/vehicles.js';
import { calcPhysics } from '../lib/physics.js';
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

function ConfigRow({ label, value, mono = false }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      padding: '6px 0',
      borderBottom: '0.5px solid var(--hairline)',
    }}>
      <span style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 14,
        color: 'var(--ink-secondary)',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
        fontSize: 14,
        color: 'var(--ink)',
      }}>
        {value}
      </span>
    </div>
  );
}

const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PreviewScreen({ cfg, onRun, onBack }) {
  const mobile = useBreakpoint() === 'mobile';
  const { vehicle, pct } = useMemo(() => matchVehicle(cfg), [cfg]);
  const typ = TYPS.find(t => t.id === cfg.typology) || TYPS[0];
  const r = useMemo(() => calcPhysics(cfg), [cfg]);

  const safe = !r.hit;
  const sem = safe
    ? { bg: 'var(--safe-bg)', text: 'var(--safe-text)' }
    : { bg: 'var(--fatal-bg)', text: 'var(--fatal-text)' };

  const activeSys = Object.entries(cfg.sys)
    .filter(([, v]) => v)
    .map(([k]) => k.toUpperCase());

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex', flexDirection: 'column' }}>

      {/* ── Frosted header ──────────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        height: 56,
        background: 'rgba(247, 244, 238, 0.72)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '0.5px solid var(--hairline)',
        display: 'flex',
        alignItems: 'center',
        padding: mobile ? '0 20px' : '0 32px',
        flexShrink: 0,
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
            Preview
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <button
          onClick={onBack}
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
      </header>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, overflowY: 'auto', padding: mobile ? '32px 20px' : '40px 32px' }}>
        <div style={{
          maxWidth: 1040,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
        }}>

          {/* Page intro */}
          <div>
            <h1 style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 30,
              fontWeight: 500,
              letterSpacing: '-0.3px',
              color: 'var(--ink)',
              margin: '0 0 10px',
            }}>
              Ready to simulate
            </h1>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 17,
              fontWeight: 400,
              lineHeight: 1.7,
              color: 'var(--ink-secondary)',
              margin: 0,
            }}>
              Review your configuration before running the physics engine.
            </p>
          </div>

          {/* ── Three cards ─────────────────────────────────────────────────── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: mobile ? '1fr' : '1fr 1fr 1fr',
            gap: 12,
            alignItems: 'stretch',
          }}>

            {/* Card 1 — Typology */}
            <Card>
              <Eyebrow color={typ.col}>Crash typology</Eyebrow>
              <div style={{
                display: 'inline-flex',
                background: `${typ.col}18`,
                borderRadius: 'var(--r-sm)',
                padding: '3px 9px',
                marginBottom: 10,
              }}>
                <span style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: '0.5px',
                  color: typ.col,
                }}>
                  {typ.abbr}
                </span>
              </div>
              <div style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 17,
                fontWeight: 500,
                color: 'var(--ink)',
                marginBottom: 8,
                lineHeight: 1.3,
              }}>
                {typ.name}
              </div>
              <div style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 14,
                lineHeight: 1.6,
                color: 'var(--ink-secondary)',
              }}>
                {typ.desc}
              </div>
            </Card>

            {/* Card 2 — Configuration summary */}
            <Card>
              <Eyebrow>Your configuration</Eyebrow>
              <ConfigRow
                label="Vehicle"
                value={cfg.vehicleType.charAt(0).toUpperCase() + cfg.vehicleType.slice(1)}
              />
              <ConfigRow label="Speed"    value={`${cfg.speed} km/h`}                mono />
              <ConfigRow label="Mass"     value={`${cfg.mass.toLocaleString()} kg`}   mono />
              <ConfigRow label="Surface"  value={SURF[cfg.surface].label} />
              <ConfigRow label="Weather"  value={WX[cfg.weather].label} />
              <ConfigRow label="Reaction" value={RT[cfg.rtKey].label} />
              <ConfigRow label="Obstacle" value={`${cfg.obsDist} m`}                  mono />
              {activeSys.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 13,
                    color: 'var(--ink-tertiary)',
                    marginBottom: 6,
                  }}>
                    Active systems
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {activeSys.map(k => (
                      <span key={k} style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: 11,
                        fontWeight: 500,
                        background: 'var(--ember-50)',
                        color: 'var(--ember-800)',
                        borderRadius: 'var(--r-sm)',
                        padding: '3px 9px',
                        letterSpacing: '0.5px',
                      }}>
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Card 3 — Vehicle match */}
            <Card>
              <Eyebrow>Real-world match</Eyebrow>
              <div style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 17,
                fontWeight: 500,
                color: 'var(--ink)',
                marginBottom: 8,
                lineHeight: 1.3,
              }}>
                {vehicle.name}
              </div>
              {vehicle.stars > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <span style={{ color: 'var(--warn)', fontSize: 14, letterSpacing: 1 }}>
                    {'★'.repeat(vehicle.stars)}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 12,
                    color: 'var(--ink-tertiary)',
                  }}>
                    {vehicle.src}
                  </span>
                </div>
              ) : (
                <div style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13,
                  color: 'var(--ink-tertiary)',
                  marginBottom: 10,
                }}>
                  Not rated
                </div>
              )}
              <ConfigRow label="Mass" value={`${vehicle.mass.toLocaleString()} kg`} mono />
              <ConfigRow label="AEB"  value={vehicle.aeb ? 'Standard' : 'Not fitted'} />
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                fontStyle: 'italic',
                lineHeight: 1.5,
                color: 'var(--ink-secondary)',
                margin: '10px 0',
              }}>
                {vehicle.note}
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-tertiary)' }}>
                  Configuration match
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 500, color: 'var(--ink)' }}>
                  {pct}%
                </span>
              </div>
            </Card>

          </div>

          {/* ── Predicted-outcome banner ─────────────────────────────────────── */}
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

            {/* Left — verdict */}
            <div>
              <Eyebrow color={sem.text}>Predicted outcome</Eyebrow>
              <div style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 20,
                fontWeight: 500,
                color: sem.text,
                marginBottom: 6,
                lineHeight: 1.3,
              }}>
                {safe
                  ? `Safe stop — ${(cfg.obsDist - r.dTot).toFixed(1)} m before the obstacle`
                  : `Collision — impact at ${r.vImpK.toFixed(1)} km/h`}
              </div>
              <div style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 14,
                lineHeight: 1.6,
                color: 'var(--ink-secondary)',
              }}>
                {safe
                  ? `Total stopping distance ${r.dTot.toFixed(1)} m · obstacle at ${cfg.obsDist} m`
                  : `${r.KE.toFixed(0)} kJ kinetic energy · ${Math.round(r.fRisk * 100)}% fatality risk`}
              </div>
            </div>

            {/* Right — metric block (key number, floating on tint) */}
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
                {safe ? 'Stopping distance' : 'Impact speed'}
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(36px, 4vw, 48px)',
                fontWeight: 500,
                letterSpacing: '-0.5px',
                lineHeight: 1,
                color: sem.text,
              }}>
                {safe ? `${r.dTot.toFixed(1)} m` : `${r.vImpK.toFixed(1)} km/h`}
              </div>
            </div>

          </div>

          {/* ── CTA ─────────────────────────────────────────────────────────── */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            paddingBottom: mobile ? 16 : 40,
          }}>
            <button
              onClick={onRun}
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
                gap: 8,
                transition: 'background 150ms ease, transform 150ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--ember-600)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--ember)'; }}
              onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)'; }}
              onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              Run simulation
              <ArrowRight />
            </button>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              color: 'var(--ink-tertiary)',
              textAlign: 'center',
              margin: 0,
            }}>
              The engine will animate 4 camera angles in real time
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
