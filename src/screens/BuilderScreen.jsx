import { useState } from 'react';
import { C } from '../data/colors.js';
import { SURF, TIRE_MU } from '../data/surfaces.js';
import { WX } from '../data/weather.js';
import { RT } from '../data/reactions.js';
import { TYPS } from '../data/typologies.js';
import { useBreakpoint } from '../lib/breakpoint.js';
import { Sel, Sld, Tog, Stars5, StepBar } from '../components/ui/index.jsx';

const G = 9.81;

function TypStep({ cfg, set }) {
  const bp = useBreakpoint();
  const numCols = bp === 'mobile' ? 1 : bp === 'tablet' ? 2 : 3;
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: C.text, fontSize: 21, fontWeight: 700, marginBottom: 6 }}>Choose Crash Typology</div>
        <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.6 }}>Select the type of accident to simulate. Each typology applies different physics and generates unique investigative insights aligned with real-world crash analysis methods.</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${numCols},1fr)`, gap: 10, maxHeight: '58vh', overflowY: 'auto', paddingRight: 4 }}>
        {TYPS.map(t => {
          const sel = cfg.typology === t.id;
          const sevCol = t.severity === 'CRITICAL' ? C.red : t.severity === 'HIGH' ? C.orange : t.severity === 'MODERATE' ? C.yellow : C.green;
          return (
            <button key={t.id}
              onClick={() => set(c => ({ ...c, typology: t.id, obstacleType: t.defObs, obsDist: t.defDist, speed: t.defSpeed }))}
              style={{
                background: sel ? `${t.col}18` : C.panel,
                border: `1px solid ${sel ? t.col : C.border}`,
                borderRadius: 10, padding: '12px 14px', cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.15s',
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <span style={{ color: t.col, fontSize: 8.5, fontWeight: 800, letterSpacing: 1.5, background: `${t.col}1A`, padding: '2px 7px', borderRadius: 3 }}>{t.abbr}</span>
                <span style={{ color: sevCol, fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>{t.severity}</span>
              </div>
              <div style={{ color: C.text, fontSize: 12, fontWeight: 600, marginBottom: 4, lineHeight: 1.3 }}>{t.name}</div>
              <div style={{ color: C.muted, fontSize: 10, lineHeight: 1.45 }}>{t.desc.length > 82 ? t.desc.slice(0, 82) + '…' : t.desc}</div>
              {sel && <div style={{ marginTop: 7, color: t.col, fontSize: 9, fontWeight: 700 }}>✓ Selected</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function VehicleStep({ cfg, set }) {
  const bp = useBreakpoint();
  const mobile = bp === 'mobile';
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: C.text, fontSize: 21, fontWeight: 700, marginBottom: 6 }}>Vehicle Configuration</div>
        <div style={{ color: C.muted, fontSize: 12 }}>Define the physical properties of the vehicle entering the scenario.</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 28 }}>
        <div>
          <Sel label="Vehicle Type" val={cfg.vehicleType} set={v => set(c => ({ ...c, vehicleType: v }))}
            opts={[['sedan', 'Sedan'], ['suv', 'SUV'], ['truck', 'Truck / Van'], ['motorcycle', 'Motorcycle'], ['bus', 'Bus / Coach']]} />
          <Sld label="Initial Speed" val={cfg.speed} min={0} max={200} unit=" km/h" set={v => set(c => ({ ...c, speed: v }))} />
          <Sld label="Vehicle Mass" val={cfg.mass} min={150} max={18000} step={50} unit=" kg" set={v => set(c => ({ ...c, mass: v }))} />
          <Sld label="Tire Condition" val={cfg.tireCond} min={0} max={100} unit="%" set={v => set(c => ({ ...c, tireCond: v }))} />
          <Sld label="Brake Efficiency" val={cfg.brakeEff} min={10} max={100} unit="%" set={v => set(c => ({ ...c, brakeEff: v }))} />
          <Sel label="Tire Type" val={cfg.tireType} set={v => set(c => ({ ...c, tireType: v }))}
            opts={[['summer', 'Summer (μ × 1.00)'], ['allseason', 'All-Season (μ × 0.92)'], ['winter', 'Winter (μ × 0.85)']]} />
        </div>
        <div>
          <Sld label="Number of Occupants" val={cfg.occupants} min={1} max={5} set={v => set(c => ({ ...c, occupants: Math.round(v) }))} />
          <Sel label="Occupant Profile" val={cfg.occupantType} set={v => set(c => ({ ...c, occupantType: v }))}
            opts={[['adults', 'Adults'], ['elderly', 'Elderly'], ['children', 'Children'], ['mixed', 'Mixed']]} />
          <div style={{ marginTop: 14 }}>
            <Tog label="Electric Vehicle (EV)" val={cfg.isEV} set={v => set(c => ({ ...c, isEV: v }))} accent={C.green} />
            {cfg.isEV && <div style={{ marginTop: 8, background: `${C.green}0D`, border: `1px solid ${C.green}25`, borderRadius: 6, padding: '8px 10px' }}>
              <div style={{ color: C.green, fontSize: 9.5, fontWeight: 700, marginBottom: 3 }}>EV ACTIVE</div>
              <div style={{ color: C.muted, fontSize: 9.5, lineHeight: 1.5 }}>HV battery isolation, thermal runaway risk, and post-crash 400-800V electrical safety protocols will be included in the results analysis.</div>
            </div>}
          </div>
          <div style={{ marginTop: 16, background: C.deep, borderRadius: 8, padding: '12px 14px', border: `1px solid ${C.border}` }}>
            <div style={{ color: C.muted, fontSize: 9.5, letterSpacing: 1.5, fontWeight: 700, marginBottom: 8 }}>TYPOLOGY LOADED</div>
            {(() => {
              const t = TYPS.find(x => x.id === cfg.typology) || TYPS[0];
              return (
                <div>
                  <div style={{ color: t.col, fontSize: 11, fontWeight: 700, marginBottom: 4 }}>{t.name}</div>
                  <div style={{ color: C.muted, fontSize: 10, lineHeight: 1.5 }}>{t.desc.slice(0, 100)}…</div>
                  <div style={{ marginTop: 6, color: C.muted, fontSize: 10 }}>Default speed: <span style={{ color: C.blue, fontFamily: 'monospace' }}>{t.defSpeed} km/h</span></div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConditionsStep({ cfg, set }) {
  const bp = useBreakpoint();
  const mobile = bp === 'mobile';
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: C.text, fontSize: 21, fontWeight: 700, marginBottom: 6 }}>Road, Weather and Scenario</div>
        <div style={{ color: C.muted, fontSize: 12 }}>Define the environmental conditions and the obstacle configuration for this simulation.</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 28 }}>
        <div>
          <div style={{ color: C.orange, fontSize: 9, fontWeight: 800, letterSpacing: 2, marginBottom: 10 }}>ROAD CONDITIONS</div>
          <Sel label="Road Surface" val={cfg.surface} set={v => set(c => ({ ...c, surface: v }))}
            opts={Object.entries(SURF).map(([k, v]) => [k, `${v.label}  (μ = ${v.mu})`])} />
          <Sld label="Road Quality" val={cfg.quality} min={0} max={100} unit="%" set={v => set(c => ({ ...c, quality: v }))} />
          <Sel label="Road Geometry" val={cfg.geo} set={v => set(c => ({ ...c, geo: v }))}
            opts={[['straight', 'Straight'], ['30', 'Curve 30°'], ['60', 'Curve 60°'], ['90', 'Curve 90°'], ['downhill', 'Downhill 5%'], ['uphill', 'Uphill 5%']]} />
          <div style={{ marginTop: 16 }}>
            <div style={{ color: C.orange, fontSize: 9, fontWeight: 800, letterSpacing: 2, marginBottom: 10 }}>WEATHER</div>
            <Sel label="Conditions" val={cfg.weather} set={v => set(c => ({ ...c, weather: v }))}
              opts={Object.entries(WX).map(([k, v]) => [k, `${v.label}  (${v.vis}m vis.)`])} />
            <div style={{ background: C.deep, borderRadius: 6, padding: '8px 10px', border: `1px solid ${C.border}`, marginTop: 6 }}>
              {[['μ modifier', `×${WX[cfg.weather].muM}`], ['Visibility', `${WX[cfg.weather].vis} m`],
                ...(WX[cfg.weather].rtA > 0 ? [['Reaction penalty', `+${WX[cfg.weather].rtA} s`]] : [])
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ color: C.muted, fontSize: 10 }}>{k}</span>
                  <span style={{ color: C.blue, fontFamily: 'monospace', fontSize: 10.5 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div style={{ color: C.orange, fontSize: 9, fontWeight: 800, letterSpacing: 2, marginBottom: 10 }}>SCENARIO</div>
          <Sel label="Obstacle Type" val={cfg.obstacleType} set={v => set(c => ({ ...c, obstacleType: v }))}
            opts={[['parked_car', 'Parked Car'], ['pedestrian', 'Pedestrian'], ['oncoming', 'Oncoming Vehicle'], ['animal', 'Large Animal']]} />
          <Sld label="Obstacle Distance" val={cfg.obsDist} min={10} max={250} unit=" m" set={v => set(c => ({ ...c, obsDist: v }))} />
          <Sel label="Driver Reaction Time" val={cfg.rtKey} set={v => set(c => ({ ...c, rtKey: v }))}
            opts={Object.entries(RT).map(([k, v]) => [k, v.label])} />
          <div style={{ marginTop: 18, background: C.deep, borderRadius: 8, padding: '12px 14px', border: `1px solid ${C.border}` }}>
            <div style={{ color: C.muted, fontSize: 9.5, letterSpacing: 1.5, fontWeight: 700, marginBottom: 8 }}>LIVE PHYSICS PREVIEW</div>
            {(() => {
              const mu = SURF[cfg.surface].mu * (cfg.tireCond / 100) * (TIRE_MU[cfg.tireType] || 1) * ((cfg.brakeEff || 90) / 100) * WX[cfg.weather].muM;
              const v = cfg.speed / 3.6, rt = (RT[cfg.rtKey]?.t || 1) + WX[cfg.weather].rtA;
              const dR = v * rt, dB = (v * v) / (2 * Math.max(mu, 0.01) * G), dT = dR + dB;
              return [
                ['Effective μ', mu.toFixed(3), C.blue],
                ['Reaction dist', `${dR.toFixed(1)} m`, C.yellow],
                ['Brake dist', `${dB.toFixed(1)} m`, C.orange],
                ['Total stop', `${dT.toFixed(1)} m`, dT > cfg.obsDist ? C.red : C.green],
                ['Outcome', dT > cfg.obsDist ? 'COLLISION' : 'SAFE', dT > cfg.obsDist ? C.red : C.green],
              ].map(([k, v, col]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: C.muted, fontSize: 10 }}>{k}</span>
                  <span style={{ color: col, fontFamily: 'monospace', fontSize: 10.5, fontWeight: 700 }}>{v}</span>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

function SystemsStep({ cfg, set }) {
  const bp = useBreakpoint();
  const mobile = bp === 'mobile';
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: C.text, fontSize: 21, fontWeight: 700, marginBottom: 6 }}>Safety Systems</div>
        <div style={{ color: C.muted, fontSize: 12 }}>Configure which active and passive safety technologies are equipped. Each system affects the physics calculation and the investigative results.</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 28 }}>
        <div>
          <div style={{ color: C.blue, fontSize: 9, fontWeight: 800, letterSpacing: 2, marginBottom: 12 }}>ACTIVE SYSTEMS — Prevention</div>
          {[['abs', 'ABS — Anti-lock Braking'], ['esc', 'ESC — Electronic Stability Control'],
            ['tcs', 'TCS — Traction Control'], ['aeb', 'AEB — Auto Emergency Braking'],
            ['lka', 'LKA — Lane Keep Assist'], ['acc', 'ACC — Adaptive Cruise Control'],
            ['bsd', 'BSD — Blind Spot Detection']].map(([k, l]) => (
            <Tog key={k} label={l} val={cfg.sys[k]} set={v => set(c => ({ ...c, sys: { ...c.sys, [k]: v } }))} accent={C.blue} />
          ))}
          {cfg.sys.aeb && <div style={{ marginTop: 10, background: `${C.blue}0D`, border: `1px solid ${C.blue}25`, borderRadius: 6, padding: '8px 10px' }}>
            <div style={{ color: C.blue, fontSize: 9.5, fontWeight: 700, marginBottom: 2 }}>AEB ACTIVE</div>
            <div style={{ color: C.muted, fontSize: 9.5 }}>Approach speed will be reduced to {Math.round(cfg.speed * 0.45)} km/h before driver braking begins.</div>
          </div>}
        </div>
        <div>
          <div style={{ color: C.orange, fontSize: 9, fontWeight: 800, letterSpacing: 2, marginBottom: 12 }}>PASSIVE SYSTEMS — Survival</div>
          <Tog label="Seatbelt" val={cfg.pas.belt} set={v => set(c => ({ ...c, pas: { ...c.pas, belt: v } }))} />
          <Tog label="Front Airbags" val={cfg.pas.frontBag} set={v => set(c => ({ ...c, pas: { ...c.pas, frontBag: v } }))} />
          <Tog label="Side / Curtain Airbags" val={cfg.pas.sideBag} set={v => set(c => ({ ...c, pas: { ...c.pas, sideBag: v } }))} />
          <Tog label="Head Restraint (quality)" val={cfg.pas.head} set={v => set(c => ({ ...c, pas: { ...c.pas, head: v } }))} />
          <Tog label="Child Safety Seat" val={cfg.pas.child} set={v => set(c => ({ ...c, pas: { ...c.pas, child: v } }))} />
          <div style={{ marginTop: 12 }}>
            <div style={{ color: C.muted, fontSize: 10.5, marginBottom: 6 }}>Crumple Zone Rating <span style={{ color: C.faint, fontSize: 9 }}>(each star absorbs ~8% of KE)</span></div>
            <Stars5 val={cfg.pas.crumple} set={v => set(c => ({ ...c, pas: { ...c.pas, crumple: v } }))} />
          </div>
          {!cfg.pas.belt && <div style={{ marginTop: 12, background: `${C.red}12`, border: `1px solid ${C.red}30`, borderRadius: 6, padding: '8px 10px' }}>
            <div style={{ color: C.red, fontSize: 9.5, fontWeight: 700 }}>No seatbelt — 3x fatality risk multiplier will apply</div>
          </div>}
        </div>
      </div>
    </div>
  );
}

const BUILDER_STEPS = ['TYPOLOGY', 'VEHICLE', 'CONDITIONS', 'SYSTEMS'];

export default function BuilderScreen({ cfg, set, onPreview }) {
  const [step, setStep] = useState(0);
  const bp = useBreakpoint();
  const mobile = bp === 'mobile';
  const hPad = mobile ? '12px 16px' : '12px 28px';
  const cPad = mobile ? '20px 5%' : bp === 'tablet' ? '28px 8%' : '32px 10%';
  const fPad = mobile ? '14px 16px' : `14px 10%`;
  const content = [
    <TypStep key="t" cfg={cfg} set={set} />,
    <VehicleStep key="v" cfg={cfg} set={set} />,
    <ConditionsStep key="c" cfg={cfg} set={set} />,
    <SystemsStep key="s" cfg={cfg} set={set} />,
  ];
  return (
    <div style={{ height: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ background: C.panel, borderBottom: `1px solid ${C.border}`, padding: hPad, display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <div>
          <div style={{ color: C.orange, fontSize: 10, fontWeight: 800, letterSpacing: 3 }}>CHASING HORSEPOWER</div>
          <div style={{ color: C.muted, fontSize: 9 }}>Scenario Builder</div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ color: C.muted, fontSize: 11 }}>Step {step + 1} of {BUILDER_STEPS.length}</div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: cPad }}>
        <StepBar steps={BUILDER_STEPS} current={step} onStep={setStep} />
        {content[step]}
      </div>
      <div style={{ background: C.panel, borderTop: `1px solid ${C.border}`, padding: fPad, display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} style={{
          background: 'transparent', color: step === 0 ? C.faint : C.text, border: `1px solid ${step === 0 ? C.faint : C.border}`,
          borderRadius: 7, padding: '9px 24px', fontSize: 12, fontWeight: 600, cursor: step === 0 ? 'default' : 'pointer',
        }}>← Back</button>
        {step < BUILDER_STEPS.length - 1
          ? <button onClick={() => { if (!cfg.typology) { alert('Please select a typology first.'); } else setStep(s => s + 1); }} style={{
            background: C.orange, color: '#fff', border: 'none', borderRadius: 7, padding: '9px 32px',
            fontSize: 12, fontWeight: 800, letterSpacing: 1, cursor: 'pointer',
          }}>Next →</button>
          : <button onClick={onPreview} style={{
            background: C.orange, color: '#fff', border: 'none', borderRadius: 7, padding: '9px 32px',
            fontSize: 12, fontWeight: 800, letterSpacing: 1, cursor: 'pointer',
          }}>Review Scenario →</button>
        }
      </div>
    </div>
  );
}
