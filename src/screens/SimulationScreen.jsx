import { useState } from 'react';
import { C } from '../data/colors.js';
import { TYPS } from '../data/typologies.js';
import { useBreakpoint } from '../lib/breakpoint.js';
import { TopCam, SideCam, FrontCam, RearCam } from '../components/cameras/index.jsx';

const dCol = r => r < 0.15 ? C.green : r < 0.35 ? C.yellow : r < 0.6 ? C.orange : C.red;

const CAM_DEFS = [
  { id: 'top',   label: 'TOP-DOWN',   col: C.orange, Comp: TopCam  },
  { id: 'side',  label: 'SIDE VIEW',  col: C.blue,   Comp: SideCam  },
  { id: 'front', label: 'DRIVER POV', col: C.green,  Comp: FrontCam },
  { id: 'rear',  label: 'REAR CHASE', col: C.purple, Comp: RearCam  },
];

export default function SimulationScreen({ cfg, res, prog, running, onResults, onBack }) {
  const [activeCam, setActiveCam] = useState('top');
  const ActiveComp = CAM_DEFS.find(c => c.id === activeCam)?.Comp || TopCam;
  const done = prog >= 0.98 && !running;
  const bp = useBreakpoint();
  const mobile = bp === 'mobile';
  return (
    <div style={{ height: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.35;transform:scale(0.7)}}`}</style>
      <div style={{ background: C.panel, borderBottom: `1px solid ${C.border}`, padding: mobile ? '8px 12px' : '10px 18px', display: 'flex', alignItems: 'center', gap: mobile ? 8 : 14, flexShrink: 0, flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: C.orange, fontSize: 10, fontWeight: 800, letterSpacing: 3 }}>CHASING HORSEPOWER</div>
          <div style={{ color: C.muted, fontSize: 9 }}>Live Simulation — {TYPS.find(t => t.id === cfg.typology)?.name || 'Scenario'}</div>
        </div>
        <div style={{ flex: 1 }} />
        {running && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.orange, animation: 'pulse 0.8s infinite' }} />
          <span style={{ color: C.orange, fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>SIMULATING</span>
        </div>}
        {done && <button onClick={onResults} style={{
          background: C.orange, color: '#fff', border: 'none', borderRadius: 7,
          padding: mobile ? '6px 14px' : '8px 22px', fontSize: 12, fontWeight: 800, letterSpacing: 2, cursor: 'pointer',
        }}>VIEW ANALYSIS →</button>}
        {!running && <button onClick={onBack} style={{ background: 'transparent', color: C.muted, border: `1px solid ${C.border}`, borderRadius: 6, padding: '7px 14px', fontSize: 11, cursor: 'pointer' }}>← Edit</button>}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: mobile ? 'column' : 'row', overflow: 'hidden' }}>
        {/* Main camera + physics strip */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{
            flex: 1, background: '#080A0E',
            borderRight: mobile ? 'none' : `1px solid ${C.border}`,
            borderBottom: mobile ? `1px solid ${C.border}` : 'none',
            overflow: 'hidden', display: 'flex', alignItems: 'center',
          }}>
            <ActiveComp res={res} prog={prog} cfg={cfg} h={mobile ? 220 : 420} />
          </div>
          <div style={{ background: C.panel, borderTop: `1px solid ${C.border}`, borderRight: mobile ? 'none' : `1px solid ${C.border}`, padding: mobile ? '8px 12px' : '10px 18px', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ color: C.muted, fontSize: 9, letterSpacing: 1.5, fontWeight: 700 }}>SIMULATION PROGRESS</span>
              <span style={{ color: C.muted, fontSize: 9, fontFamily: 'monospace' }}>{Math.round(prog * 100)}%</span>
            </div>
            <div style={{ background: C.deep, borderRadius: 3, height: 4, overflow: 'hidden', marginBottom: 10 }}>
              <div style={{ background: `linear-gradient(90deg,${C.blue},${C.orange})`, width: `${prog * 100}%`, height: '100%', transition: 'width 0.05s' }} />
            </div>
            {res && <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: mobile ? 6 : 10 }}>
              {[
                ['Reaction Dist', `${res.dR.toFixed(1)} m`, C.yellow],
                ['Brake Dist', `${res.dB.toFixed(1)} m`, C.orange],
                ['Impact speed', res.hit ? `${res.vImpK.toFixed(1)} km/h` : 'None', res.hit ? C.red : C.green],
                ['Delta-V cabin', res.hit ? `${res.dvK.toFixed(1)} km/h` : 'None', res.hit ? C.red : C.green],
              ].map(([l, v, col]) => (
                <div key={l} style={{ textAlign: 'center', background: C.deep, borderRadius: 5, padding: '5px 4px' }}>
                  <div style={{ color: C.muted, fontSize: 8.5 }}>{l}</div>
                  <div style={{ color: col, fontFamily: 'monospace', fontSize: mobile ? 11 : 12, fontWeight: 800, marginTop: 1 }}>{v}</div>
                </div>
              ))}
            </div>}
          </div>
        </div>
        {/* Camera thumbnails */}
        <div style={{
          width: mobile ? '100%' : 220,
          background: C.panel,
          display: 'flex',
          flexDirection: mobile ? 'row' : 'column',
          overflow: 'auto',
          flexShrink: 0,
          borderTop: mobile ? `1px solid ${C.border}` : 'none',
        }}>
          {!mobile && <div style={{ padding: '10px 12px 6px', color: C.muted, fontSize: 9, fontWeight: 700, letterSpacing: 2 }}>CAMERA ANGLES</div>}
          {CAM_DEFS.map(cam => {
            const isActive = activeCam === cam.id;
            return (
              <div key={cam.id} onClick={() => setActiveCam(cam.id)}
                style={{
                  border: `2px solid ${isActive ? cam.col : 'transparent'}`,
                  borderRadius: 6,
                  margin: mobile ? '4px' : '4px 8px',
                  overflow: 'hidden', cursor: 'pointer',
                  transition: 'border-color 0.15s', background: '#080A0E',
                  flexShrink: 0,
                  width: mobile ? 120 : undefined,
                }}>
                <cam.Comp res={res} prog={prog} cfg={cfg} h={mobile ? 80 : 115} />
                <div style={{
                  background: isActive ? `${cam.col}20` : C.deep,
                  padding: '4px 6px', borderTop: `1px solid ${isActive ? cam.col : C.border}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ color: isActive ? cam.col : C.muted, fontSize: 8, fontWeight: 700, letterSpacing: 1 }}>{cam.label}</span>
                  {isActive && <span style={{ color: cam.col, fontSize: 7, fontWeight: 700 }}>ACTIVE</span>}
                </div>
              </div>
            );
          })}
          {!mobile && done && res && (
            <div style={{ margin: '12px 8px', background: res.hit ? `${C.red}10` : `${C.green}10`, border: `1px solid ${res.hit ? C.red : C.green}35`, borderRadius: 7, padding: '10px 12px' }}>
              <div style={{ color: res.hit ? C.red : C.green, fontSize: 12, fontWeight: 800, marginBottom: 4 }}>{res.hit ? '● COLLISION' : '✓ SAFE STOP'}</div>
              {res.hit && <>
                <div style={{ color: C.muted, fontSize: 9.5, marginBottom: 2 }}>Impact: <span style={{ color: C.red, fontFamily: 'monospace' }}>{res.vImpK.toFixed(1)} km/h</span></div>
                <div style={{ color: C.muted, fontSize: 9.5 }}>Fatality risk: <span style={{ color: dCol(res.fRisk), fontFamily: 'monospace' }}>{Math.round(res.fRisk * 100)}%</span></div>
              </>}
              {!res.hit && <div style={{ color: C.muted, fontSize: 9.5 }}>Stopped {(res.dTot - cfg.obsDist).toFixed(1)}m short</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
