import { useState } from 'react';
import { SURF, TIRE_MU } from '../data/surfaces.js';
import { WX } from '../data/weather.js';
import { RT } from '../data/reactions.js';
import { TYPS } from '../data/typologies.js';
import { useBreakpoint } from '../lib/breakpoint.js';

const G = 9.81;
const COMMON_IDS = ['frontal', 'rear_end', 'tbone', 'pedestrian'];

// ─── Primitives ───────────────────────────────────────────────────────────────

function Eyebrow({ children }) {
  return (
    <div style={{
      fontFamily: 'var(--font-sans)',
      fontSize: 13,
      fontWeight: 500,
      letterSpacing: '1.5px',
      textTransform: 'uppercase',
      color: 'var(--ink-tertiary)',
      marginBottom: 12,
    }}>
      {children}
    </div>
  );
}

function BSlider({ label, val, min, max, step = 1, unit = '', set }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-secondary)' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{val}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={val}
        onChange={e => set(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--ember)', cursor: 'pointer', display: 'block' }}
      />
    </div>
  );
}

function BToggle({ label, val, set }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '9px 0',
      borderBottom: '0.5px solid var(--hairline)',
    }}>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: val ? 'var(--ink)' : 'var(--ink-secondary)' }}>{label}</span>
      <button
        onClick={() => set(!val)}
        aria-pressed={val}
        style={{
          width: 40, height: 22, borderRadius: 11,
          border: 'none', outline: 'none', cursor: 'pointer', padding: 0,
          background: val ? 'var(--ember)' : 'var(--hairline-strong)',
          position: 'relative',
          transition: 'background 150ms ease',
          flexShrink: 0,
        }}
      >
        <span style={{
          position: 'absolute', top: 3,
          left: val ? 21 : 3,
          width: 16, height: 16,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 2px rgba(0,0,0,0.18)',
          transition: 'left 150ms ease',
          display: 'block',
        }} />
      </button>
    </div>
  );
}

function BSelect({ label, val, opts, set }) {
  return (
    <div style={{ marginBottom: 18 }}>
      {label && (
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-secondary)', marginBottom: 5 }}>
          {label}
        </div>
      )}
      <div style={{ position: 'relative' }}>
        <select
          value={val}
          onChange={e => set(e.target.value)}
          style={{
            width: '100%',
            fontFamily: 'var(--font-sans)',
            fontSize: 14,
            color: 'var(--ink)',
            background: 'var(--surface)',
            border: '0.5px solid var(--hairline-strong)',
            borderRadius: 'var(--r-sm)',
            padding: '8px 32px 8px 12px',
            cursor: 'pointer',
            outline: 'none',
            appearance: 'none',
            WebkitAppearance: 'none',
          }}
        >
          {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <span style={{
          position: 'absolute', right: 11, top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          color: 'var(--ink-tertiary)',
          fontSize: 10,
        }}>▾</span>
      </div>
    </div>
  );
}

function StarRating({ val, set, max = 5 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: max }, (_, i) => i + 1).map(n => (
        <button
          key={n}
          onClick={() => set(n === val ? 0 : n)}
          aria-label={`${n} star${n !== 1 ? 's' : ''}`}
          style={{
            background: 'none', border: 'none', outline: 'none',
            cursor: 'pointer', padding: '4px 5px',
            fontSize: 22, lineHeight: 1,
            color: n <= val ? 'var(--warn)' : 'var(--hairline-strong)',
            transition: 'color 100ms ease',
          }}
        >★</button>
      ))}
    </div>
  );
}

function TypCard({ typ, selected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      style={{
        background: selected ? 'var(--ember-50)' : 'var(--surface)',
        border: selected ? '1.5px solid var(--ember)' : '0.5px solid var(--hairline)',
        borderRadius: 'var(--r-lg)',
        padding: '16px 20px',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'background 150ms ease, border-color 150ms ease',
      }}
    >
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
        }}>{typ.abbr}</span>
      </div>
      <div style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 15,
        fontWeight: 500,
        color: 'var(--ink)',
        marginBottom: 5,
        lineHeight: 1.3,
      }}>{typ.name}</div>
      <div style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 13,
        lineHeight: 1.6,
        color: 'var(--ink-secondary)',
      }}>
        {typ.desc.length > 90 ? typ.desc.slice(0, 90) + '…' : typ.desc}
      </div>
      {selected && (
        <div style={{
          marginTop: 10,
          fontFamily: 'var(--font-sans)',
          fontSize: 11,
          fontWeight: 500,
          color: 'var(--ember)',
          letterSpacing: '0.5px',
        }}>✓ Selected</div>
      )}
    </button>
  );
}

// ─── Step heading ─────────────────────────────────────────────────────────────

function StepHead({ title, body }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h1 style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 30,
        fontWeight: 500,
        letterSpacing: '-0.3px',
        lineHeight: 1.15,
        color: 'var(--ink)',
        margin: '0 0 10px',
      }}>{title}</h1>
      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 17,
        fontWeight: 400,
        lineHeight: 1.7,
        color: 'var(--ink-secondary)',
        margin: 0,
      }}>{body}</p>
    </div>
  );
}

// ─── Step 1 — Typology ────────────────────────────────────────────────────────

function TypologyStep({ cfg, set, mobile }) {
  const [showAll, setShowAll] = useState(false);
  const common = TYPS.filter(t => COMMON_IDS.includes(t.id));
  const extended = TYPS.filter(t => !COMMON_IDS.includes(t.id));

  function selectTyp(t) {
    set(c => ({ ...c, typology: t.id, obstacleType: t.defObs, obsDist: t.defDist, speed: t.defSpeed }));
  }

  return (
    <div>
      <StepHead
        title="What kind of crash?"
        body="Each typology applies different physics, injury profiles, and investigation methods. Defaults are set to match."
      />
      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 12 }}>
        {common.map(t => (
          <TypCard key={t.id} typ={t} selected={cfg.typology === t.id} onSelect={() => selectTyp(t)} />
        ))}
      </div>

      <button
        onClick={() => setShowAll(v => !v)}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 13,
          color: 'var(--ink-tertiary)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '16px 0',
          width: '100%',
          textAlign: 'center',
          display: 'block',
          transition: 'color 150ms ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--ink-secondary)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--ink-tertiary)'; }}
      >
        {showAll ? '↑ Hide extended types' : '↓ Show all 13 types'}
      </button>

      {showAll && (
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 12 }}>
          {extended.map(t => (
            <TypCard key={t.id} typ={t} selected={cfg.typology === t.id} onSelect={() => selectTyp(t)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Step 2 — Vehicle ─────────────────────────────────────────────────────────

function VehicleStep({ cfg, set, mobile }) {
  const typ = TYPS.find(t => t.id === cfg.typology) || TYPS[0];

  return (
    <div>
      <StepHead
        title="Your vehicle"
        body="Define the physical properties of the vehicle entering the scenario."
      />
      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 40 }}>

        {/* Left — kinematic controls */}
        <div>
          <BSelect
            label="Vehicle type"
            val={cfg.vehicleType}
            opts={[
              ['sedan', 'Sedan'],
              ['suv', 'SUV'],
              ['truck', 'Truck / Van'],
              ['motorcycle', 'Motorcycle'],
              ['bus', 'Bus / Coach'],
            ]}
            set={v => set(c => ({ ...c, vehicleType: v }))}
          />
          <BSlider label="Initial speed" val={cfg.speed} min={0} max={200} unit=" km/h" set={v => set(c => ({ ...c, speed: v }))} />
          <BSlider label="Vehicle mass" val={cfg.mass} min={150} max={18000} step={50} unit=" kg" set={v => set(c => ({ ...c, mass: v }))} />
          <BSlider label="Tire condition" val={cfg.tireCond} min={0} max={100} unit="%" set={v => set(c => ({ ...c, tireCond: v }))} />
          <BSlider label="Brake efficiency" val={cfg.brakeEff} min={10} max={100} unit="%" set={v => set(c => ({ ...c, brakeEff: v }))} />
          <BSelect
            label="Tire type"
            val={cfg.tireType}
            opts={[
              ['summer', 'Summer (μ × 1.00)'],
              ['allseason', 'All-Season (μ × 0.92)'],
              ['winter', 'Winter (μ × 0.85)'],
            ]}
            set={v => set(c => ({ ...c, tireType: v }))}
          />
        </div>

        {/* Right — occupants, EV toggle, typology reference */}
        <div>
          <BSlider
            label="Occupants"
            val={cfg.occupants}
            min={1}
            max={5}
            step={1}
            set={v => set(c => ({ ...c, occupants: Math.round(v) }))}
          />
          <BSelect
            label="Occupant profile"
            val={cfg.occupantType}
            opts={[
              ['adults', 'Adults'],
              ['elderly', 'Elderly'],
              ['children', 'Children'],
              ['mixed', 'Mixed'],
            ]}
            set={v => set(c => ({ ...c, occupantType: v }))}
          />

          <div style={{ marginBottom: 20 }}>
            <BToggle label="Electric vehicle (EV)" val={cfg.isEV} set={v => set(c => ({ ...c, isEV: v }))} />
            {cfg.isEV && (
              <div style={{
                marginTop: 10,
                background: 'var(--surface)',
                border: '0.5px solid var(--hairline)',
                borderRadius: 'var(--r-sm)',
                padding: '10px 14px',
              }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: 'var(--ink)', marginBottom: 4 }}>
                  HV battery protocols active
                </div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.6, color: 'var(--ink-secondary)' }}>
                  Battery isolation, thermal runaway risk, and 400–800 V first-responder protocols will appear in the results analysis.
                </div>
              </div>
            )}
          </div>

          {/* Loaded typology reference card */}
          <div style={{
            background: 'var(--surface)',
            border: '0.5px solid var(--hairline)',
            borderRadius: 'var(--r-lg)',
            padding: '16px 20px',
          }}>
            <Eyebrow>Loaded typology</Eyebrow>
            <div style={{
              display: 'inline-flex',
              background: `${typ.col}18`,
              borderRadius: 'var(--r-sm)',
              padding: '3px 9px',
              marginBottom: 10,
            }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500, letterSpacing: '0.5px', color: typ.col }}>
                {typ.abbr}
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500, color: 'var(--ink)', marginBottom: 6, lineHeight: 1.3 }}>
              {typ.name}
            </div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.6, color: 'var(--ink-secondary)' }}>
              {typ.desc.length > 100 ? typ.desc.slice(0, 100) + '…' : typ.desc}
            </div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-tertiary)', marginTop: 10 }}>
              Default speed:{' '}
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink)', fontWeight: 500 }}>
                {typ.defSpeed} km/h
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Step 3 — Conditions ──────────────────────────────────────────────────────

function ConditionsStep({ cfg, set, mobile }) {
  const mu0 = SURF[cfg.surface]?.mu ?? 0.8;
  const wx  = WX[cfg.weather] ?? WX.clear;
  const muEff = Math.max(
    mu0 * (cfg.tireCond / 100) * (TIRE_MU[cfg.tireType] || 1) * (cfg.brakeEff / 100) * wx.muM,
    0.01
  );
  const v    = cfg.speed / 3.6;
  const rt   = (RT[cfg.rtKey]?.t || 1.0) + wx.rtA;
  const vBrk = cfg.sys.aeb ? v * 0.45 : v;
  const dR   = v * rt;
  const absRed = mu0 < 0.3 ? 0.30 : mu0 < 0.5 ? 0.20 : 0.10;
  const dBraw  = (vBrk * vBrk) / (2 * muEff * G);
  const dB     = cfg.sys.abs ? dBraw * (1 - absRed) : dBraw;
  const dTot   = dR + dB;
  const safe   = dTot <= cfg.obsDist;

  const previewRows = [
    { k: 'Effective μ',   v: muEff.toFixed(3) },
    { k: 'Reaction dist', v: `${dR.toFixed(1)} m` },
    { k: 'Brake dist',    v: `${dB.toFixed(1)} m` },
    { k: 'Total stop',    v: `${dTot.toFixed(1)} m` },
    {
      k: 'Clearance',
      v: safe ? `+${(cfg.obsDist - dTot).toFixed(1)} m` : `−${(dTot - cfg.obsDist).toFixed(1)} m`,
      accent: safe ? 'var(--safe-text)' : 'var(--fatal-text)',
    },
    {
      k: 'Outcome',
      v: safe ? 'SAFE STOP' : 'COLLISION',
      accent: safe ? 'var(--safe-text)' : 'var(--fatal-text)',
    },
  ];

  return (
    <div>
      <StepHead
        title="Road, weather and scenario"
        body="Set the environmental conditions and obstacle configuration for this simulation."
      />
      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 40 }}>

        {/* Left — road + weather */}
        <div>
          <Eyebrow>Road conditions</Eyebrow>
          <BSelect
            label="Road surface"
            val={cfg.surface}
            opts={Object.entries(SURF).map(([k, s]) => [k, `${s.label}  (μ = ${s.mu})`])}
            set={v => set(c => ({ ...c, surface: v }))}
          />
          <BSlider label="Road quality" val={cfg.quality} min={0} max={100} unit="%" set={v => set(c => ({ ...c, quality: v }))} />
          <BSelect
            label="Road geometry"
            val={cfg.geo}
            opts={[
              ['straight', 'Straight'],
              ['30', 'Curve 30°'],
              ['60', 'Curve 60°'],
              ['90', 'Curve 90°'],
              ['downhill', 'Downhill 5%'],
              ['uphill', 'Uphill 5%'],
            ]}
            set={v => set(c => ({ ...c, geo: v }))}
          />

          <div style={{ marginTop: 24 }}>
            <Eyebrow>Weather</Eyebrow>
            <BSelect
              label="Conditions"
              val={cfg.weather}
              opts={Object.entries(WX).map(([k, w]) => [k, `${w.label}  (${w.vis} m vis.)`])}
              set={v => set(c => ({ ...c, weather: v }))}
            />
            <div style={{
              background: 'var(--surface)',
              border: '0.5px solid var(--hairline)',
              borderRadius: 'var(--r-sm)',
              padding: '6px 14px',
            }}>
              {[
                ['μ modifier', `×${wx.muM}`],
                ['Visibility', `${wx.vis} m`],
                ...(wx.rtA > 0 ? [['Reaction penalty', `+${wx.rtA} s`]] : []),
              ].map(([k, v], i, arr) => (
                <div key={k} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  padding: '5px 0',
                  borderBottom: i < arr.length - 1 ? '0.5px solid var(--hairline)' : 'none',
                }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-secondary)' }}>{k}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink)' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — scenario + live preview */}
        <div>
          <Eyebrow>Scenario</Eyebrow>
          <BSelect
            label="Obstacle type"
            val={cfg.obstacleType}
            opts={[
              ['parked_car', 'Parked car'],
              ['pedestrian', 'Pedestrian'],
              ['oncoming', 'Oncoming vehicle'],
              ['animal', 'Large animal'],
              ['debris', 'Road debris'],
            ]}
            set={v => set(c => ({ ...c, obstacleType: v }))}
          />
          <BSlider
            label="Obstacle distance"
            val={cfg.obsDist}
            min={10}
            max={250}
            unit=" m"
            set={v => set(c => ({ ...c, obsDist: v }))}
          />
          <BSelect
            label="Driver reaction"
            val={cfg.rtKey}
            opts={Object.entries(RT).map(([k, r]) => [k, r.label])}
            set={v => set(c => ({ ...c, rtKey: v }))}
          />

          {/* Live physics preview */}
          <div style={{
            marginTop: 24,
            background: 'var(--surface)',
            border: '0.5px solid var(--hairline)',
            borderRadius: 'var(--r-lg)',
            padding: '16px 20px',
          }}>
            <Eyebrow>Live physics preview</Eyebrow>
            {previewRows.map(({ k, v, accent }, i) => (
              <div key={k} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                padding: '5px 0',
                borderBottom: i < previewRows.length - 1 ? '0.5px solid var(--hairline)' : 'none',
              }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-secondary)' }}>{k}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  fontWeight: accent ? 600 : 400,
                  color: accent || 'var(--ink)',
                }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Step 4 — Systems ─────────────────────────────────────────────────────────

function SystemsStep({ cfg, set, mobile }) {
  return (
    <div>
      <StepHead
        title="Safety systems"
        body="Configure active prevention and passive survival systems. Each affects the physics calculation and the investigation report."
      />
      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 40 }}>

        {/* Left — active */}
        <div>
          <Eyebrow>Active systems — prevention</Eyebrow>
          {[
            ['abs', 'ABS — Anti-lock Braking'],
            ['esc', 'ESC — Electronic Stability Control'],
            ['tcs', 'TCS — Traction Control'],
            ['aeb', 'AEB — Auto Emergency Braking'],
            ['lka', 'LKA — Lane Keep Assist'],
            ['acc', 'ACC — Adaptive Cruise Control'],
            ['bsd', 'BSD — Blind Spot Detection'],
          ].map(([k, l]) => (
            <BToggle
              key={k}
              label={l}
              val={cfg.sys[k]}
              set={v => set(c => ({ ...c, sys: { ...c.sys, [k]: v } }))}
            />
          ))}
          {cfg.sys.aeb && (
            <div style={{
              marginTop: 14,
              background: 'var(--surface)',
              border: '0.5px solid var(--hairline)',
              borderRadius: 'var(--r-sm)',
              padding: '10px 14px',
            }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: 'var(--ink)', marginBottom: 4 }}>
                AEB active
              </div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.6, color: 'var(--ink-secondary)' }}>
                Approach speed reduced to {Math.round(cfg.speed * 0.45)} km/h before driver braking begins.
              </div>
            </div>
          )}
        </div>

        {/* Right — passive */}
        <div>
          <Eyebrow>Passive systems — survival</Eyebrow>
          {[
            ['belt',     'Seatbelt'],
            ['frontBag', 'Front airbags'],
            ['sideBag',  'Side / curtain airbags'],
            ['head',     'Head restraint'],
            ['child',    'Child safety seat'],
          ].map(([k, l]) => (
            <BToggle
              key={k}
              label={l}
              val={cfg.pas[k]}
              set={v => set(c => ({ ...c, pas: { ...c.pas, [k]: v } }))}
            />
          ))}

          <div style={{ marginTop: 20 }}>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--ink-secondary)', marginBottom: 3 }}>
              Crumple zone rating
            </div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-tertiary)', marginBottom: 10 }}>
              Each star absorbs ~8% of kinetic energy
            </div>
            <StarRating
              val={cfg.pas.crumple}
              set={v => set(c => ({ ...c, pas: { ...c.pas, crumple: v } }))}
            />
          </div>

          {!cfg.pas.belt && (
            <div style={{
              marginTop: 16,
              background: 'var(--fatal-bg)',
              borderRadius: 'var(--r-sm)',
              padding: '10px 14px',
            }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: 'var(--fatal-text)' }}>
                No seatbelt — 3× fatality risk multiplier will apply
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function BuilderScreen({ cfg, set, onPreview }) {
  const [step, setStep] = useState(0);
  const mobile = useBreakpoint() === 'mobile';

  const stepContent = [
    <TypologyStep  key="typ"  cfg={cfg} set={set} mobile={mobile} />,
    <VehicleStep   key="veh"  cfg={cfg} set={set} mobile={mobile} />,
    <ConditionsStep key="cond" cfg={cfg} set={set} mobile={mobile} />,
    <SystemsStep   key="sys"  cfg={cfg} set={set} mobile={mobile} />,
  ];

  return (
    <div style={{
      height: '100vh',
      background: 'var(--paper)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* ── Frosted header ──────────────────────────────────────────────────── */}
      <header style={{
        height: 56,
        flexShrink: 0,
        background: 'rgba(247, 244, 238, 0.72)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '0.5px solid var(--hairline)',
        display: 'flex',
        alignItems: 'center',
        padding: mobile ? '0 20px' : '0 32px',
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
            Builder
          </div>
        </div>
      </header>

      {/* ── Scrollable content ──────────────────────────────────────────────── */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        padding: mobile ? '32px 20px' : '40px 32px',
      }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>

          {/* Progress bar + step counter */}
          <div style={{ marginBottom: 36 }}>
            <div style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: 'var(--ink-tertiary)',
              marginBottom: 12,
            }}>
              Step {step + 1} of 4
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{
                  flex: 1,
                  height: 3,
                  borderRadius: 999,
                  background: i <= step ? 'var(--ink)' : 'var(--hairline)',
                  transition: 'background 200ms ease',
                }} />
              ))}
            </div>
          </div>

          {/* Step content */}
          {stepContent[step]}

          {/* Bottom padding so footer doesn't clip last element */}
          <div style={{ height: 24 }} />

        </div>
      </main>

      {/* ── Sticky footer ───────────────────────────────────────────────────── */}
      <footer style={{
        flexShrink: 0,
        background: 'rgba(247, 244, 238, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '0.5px solid var(--hairline)',
        padding: mobile ? '12px 20px' : '12px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>

        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            background: 'transparent',
            color: 'var(--ink-secondary)',
            border: '0.5px solid var(--hairline-strong)',
            borderRadius: 'var(--r-sm)',
            padding: '8px 20px',
            cursor: step === 0 ? 'default' : 'pointer',
            opacity: step === 0 ? 0.3 : 1,
            transition: 'opacity 150ms ease',
          }}
          onMouseEnter={e => { if (step > 0) e.currentTarget.style.background = 'var(--surface-sunken)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >← Back</button>

        {step < 3 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              fontWeight: 500,
              background: 'var(--ink)',
              color: 'var(--paper)',
              border: 'none',
              borderRadius: 'var(--r-sm)',
              padding: '8px 24px',
              cursor: 'pointer',
              transition: 'opacity 150ms ease, transform 150ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.82'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >Continue →</button>
        ) : (
          <button
            onClick={onPreview}
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
            Review scenario →
          </button>
        )}

      </footer>
    </div>
  );
}
