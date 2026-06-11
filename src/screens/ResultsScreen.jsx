import { useState } from 'react';
import { TYPS } from '../data/typologies.js';
import { matchVehicle } from '../data/vehicles.js';
import { genNarrative } from '../lib/physics.js';
import { useBreakpoint } from '../lib/breakpoint.js';

// ─── Shared primitives ────────────────────────────────────────────────────────

function Eyebrow({ children, color = 'var(--ink-tertiary)' }) {
  return (
    <div style={{
      fontFamily: 'var(--font-sans)',
      fontSize: 12,
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
        fontSize: 12,
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
        fontSize: 32,
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
          fontSize: 12,
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
          maxWidth: 640,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
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
                fontSize: 24,
                fontWeight: 500,
                letterSpacing: '-0.2px',
                color: sem.text,
                marginBottom: 6,
                lineHeight: 1.2,
              }}>
                {res.hit ? 'Fatal outcome' : 'You survived'}
              </div>
              <div style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                lineHeight: 1.6,
                color: 'var(--ink-secondary)',
              }}>
                {res.hit
                  ? `Collision at ${res.vImpK.toFixed(1)} km/h · ${res.KE.toFixed(0)} kJ kinetic energy`
                  : `Stopped ${(res.dTot - cfg.obsDist).toFixed(1)} m before the obstacle`}
              </div>
            </div>
            <div style={{ flexShrink: 0, textAlign: mobile ? 'left' : 'right' }}>
              <div style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                color: sem.text,
                marginBottom: 4,
                opacity: 0.75,
              }}>
                {res.hit ? 'Fatality risk' : 'Stopping distance'}
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 36,
                fontWeight: 500,
                letterSpacing: '-0.5px',
                lineHeight: 1,
                color: sem.text,
              }}>
                {res.hit ? `${Math.round(res.fRisk * 100)}%` : `${res.dTot.toFixed(1)} m`}
              </div>
            </div>
          </div>

          {/* ── 2. Safety systems verdict (static — stagger animation is future) */}
          {res.ctrs && res.ctrs.length > 0 && (
            <Card>
              <Eyebrow>Safety systems</Eyebrow>
              {res.ctrs.map((c, i) => (
                <div key={i} style={{
                  display: 'flex',
                  gap: 12,
                  padding: '8px 0',
                  borderBottom: i < res.ctrs.length - 1 ? '0.5px solid var(--hairline)' : 'none',
                  alignItems: 'flex-start',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 14,
                    color: c.ok ? 'var(--safe)' : 'var(--fatal)',
                    flexShrink: 0,
                    lineHeight: 1.5,
                  }}>
                    {c.ok ? '✓' : '✗'}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 13,
                    color: 'var(--ink-secondary)',
                    lineHeight: 1.6,
                  }}>
                    {c.t}
                  </span>
                </div>
              ))}
            </Card>
          )}

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
                    value={`${(res.dTot - cfg.obsDist).toFixed(1)} m`}
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
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-secondary)' }}>
                        {label}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: 12,
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
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-tertiary)' }}>
                  Overall — {' '}
                </span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 500, color: 'var(--ink)' }}>
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
                    fontSize: 12,
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
                    fontSize: 13,
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
                    fontSize: 13,
                    color: 'var(--safe)',
                    flexShrink: 0,
                    lineHeight: 1.6,
                  }}>
                    →
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 13,
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
              fontSize: 14,
              fontWeight: 400,
              lineHeight: 1.75,
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
              fontSize: 14,
              lineHeight: 1.75,
              color: 'var(--ink-secondary)',
              margin: '0 0 16px',
            }}>
              {typ.ncapRef}
            </p>
            {typ.reforms && typ.reforms.length > 0 && (
              <>
                <div style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  color: 'var(--ink-tertiary)',
                  marginBottom: 10,
                }}>
                  What this crash informs
                </div>
                {typ.reforms.map((reform, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    gap: 10,
                    marginBottom: i < typ.reforms.length - 1 ? 6 : 0,
                    alignItems: 'flex-start',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 13,
                      color: 'var(--ink-tertiary)',
                      flexShrink: 0,
                      lineHeight: 1.6,
                    }}>
                      →
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 13,
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
              fontSize: 15,
              fontWeight: 500,
              color: 'var(--ink)',
              marginBottom: 6,
            }}>
              {vehicle.name}
            </div>
            {vehicle.stars > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <span style={{ color: 'var(--warn)', fontSize: 13, letterSpacing: 1 }}>
                  {'★'.repeat(vehicle.stars)}
                </span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--ink-tertiary)' }}>
                  {vehicle.src}
                </span>
              </div>
            ) : (
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-tertiary)', marginBottom: 8 }}>
                Not rated
              </div>
            )}
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 12,
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
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-tertiary)' }}>
                        {k}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink)' }}>
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
