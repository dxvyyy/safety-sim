import { useState, useEffect, useRef } from 'react';
import { useBreakpoint } from '../lib/breakpoint.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const PPM          = 10
const CAR_OFFSET   = 220
const VIEWPORT_W   = 800
const VIEWPORT_H   = 450
const ROAD_Y       = 175
const ROAD_H       = 100
const ROAD_CY      = ROAD_Y + ROAD_H / 2   // 225
const CAR_W        = 44
const CAR_H        = 24
const REACTION_FRAC = 0.28

// ─── Helpers ──────────────────────────────────────────────────────────────────

function lerp(a, b, t) { return a + (b - a) * Math.min(1, Math.max(0, t)); }
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function computeVehicleNorm(prog, res, cfg) {
  const rn = Math.min(res.dR / cfg.obsDist, 1);
  const fn = res.hit ? 1.0 : Math.min(res.dTot / cfg.obsDist, 1);
  let vn;
  if (prog <= REACTION_FRAC) {
    vn = (prog / REACTION_FRAC) * rn;
  } else {
    const bp = (prog - REACTION_FRAC) / (1 - REACTION_FRAC);
    vn = rn + bp * (fn - rn);
  }
  return Math.min(vn, fn);
}

function computeLiveSpeed(prog, res, cfg) {
  if (prog <= REACTION_FRAC) return cfg.speed;
  const bp = (prog - REACTION_FRAC) / (1 - REACTION_FRAC);
  const vStart = cfg.sys.aeb ? cfg.speed * 0.45 : cfg.speed;
  const vEnd = res.hit ? (res.vImpK ?? 0) : 0;
  return lerp(vStart, vEnd, bp);
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SimulationScreen({ cfg, res, prog, running, onResults, onBack }) {
  const mobile = useBreakpoint() === 'mobile';

  // All hooks before null guard
  const [vb, setVb] = useState({ x: -CAR_OFFSET, w: VIEWPORT_W });
  const [labelVisible, setLabelVisible] = useState(false);
  const [pullbackDone, setPullbackDone] = useState(false);

  const pbRafRef     = useRef(null);
  const prevRunning  = useRef(false);

  // Reset on sim restart
  useEffect(() => {
    const was = prevRunning.current;
    prevRunning.current = running;
    if (!was && running) {
      if (pbRafRef.current) cancelAnimationFrame(pbRafRef.current);
      setVb({ x: -CAR_OFFSET, w: VIEWPORT_W });
      setLabelVisible(false);
      setPullbackDone(false);
    }
  }, [running]);

  // Pan viewBox during sim
  useEffect(() => {
    if (!res || !running) return;
    const vn = computeVehicleNorm(prog, res, cfg);
    const carWorldX = vn * cfg.obsDist * PPM;
    setVb(prev => ({ ...prev, x: Math.max(-CAR_OFFSET, carWorldX - CAR_OFFSET) }));
  }, [prog, running, res, cfg]);

  // Pull-back on completion
  const done = prog >= 1 && !running;
  useEffect(() => {
    if (!done || !res) return;
    if (pbRafRef.current) cancelAnimationFrame(pbRafRef.current);

    const vn = computeVehicleNorm(1, res, cfg);
    const carWorldX = vn * cfg.obsDist * PPM;
    const startX = Math.max(-CAR_OFFSET, carWorldX - CAR_OFFSET);
    const endX   = -80;
    const endW   = cfg.obsDist * PPM + 240;
    const DUR    = 900;
    let t0 = null;

    const animate = ts => {
      if (!t0) t0 = ts;
      const t = Math.min((ts - t0) / DUR, 1);
      const e = easeOutCubic(t);
      setVb({ x: lerp(startX, endX, e), w: lerp(VIEWPORT_W, endW, e) });
      if (t < 1) {
        pbRafRef.current = requestAnimationFrame(animate);
      } else {
        setPullbackDone(true);
        setLabelVisible(true);
      }
    };
    pbRafRef.current = requestAnimationFrame(animate);
    return () => { if (pbRafRef.current) cancelAnimationFrame(pbRafRef.current); };
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Null guard ──
  if (!res) return null;

  // ── Derived ──
  const vn             = computeVehicleNorm(prog, res, cfg);
  const carWorldX      = vn * cfg.obsDist * PPM;
  const reactionEndX   = (res.dR ?? 0) * PPM;
  const obstacleWorldX = cfg.obsDist * PPM;
  const isBraking      = prog > REACTION_FRAC;
  const hasCrashed     = done && res.hit;
  const liveSpeed      = computeLiveSpeed(prog, res, cfg);
  const phase          = prog <= REACTION_FRAC ? 'Reaction' : done ? (res.hit ? 'Impact' : 'Stopped') : 'Braking';

  // ViewBox string + scale for viewport-fixed elements
  const viewBox  = `${vb.x.toFixed(1)} 0 ${vb.w.toFixed(1)} ${VIEWPORT_H}`;
  const vs       = vb.w / VIEWPORT_W;   // viewScale: SVG units per apparent px

  // Trail dimensions
  const rxTrailW = Math.max(0, Math.min(carWorldX, reactionEndX));
  const bkTrailW = Math.max(0, carWorldX - reactionEndX);

  // Car rect
  const carX = carWorldX;
  const carY = ROAD_CY - CAR_H / 2;

  return (
    <div style={{
      height: '100dvh',
      background: 'var(--stage)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header style={{
        height: 56,
        flexShrink: 0,
        background: 'rgba(33,28,24,0.72)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '0.5px solid var(--stage-hairline)',
        display: 'flex',
        alignItems: 'center',
        padding: mobile ? '0 16px' : '0 24px',
        gap: 10,
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500,
            letterSpacing: '1.5px', textTransform: 'uppercase',
            color: 'var(--stage-muted)', lineHeight: 1,
          }}>Chasing Horsepower</div>
          <div style={{
            fontFamily: 'var(--font-sans)', fontSize: 13,
            color: 'var(--stage-muted)', marginTop: 2,
          }}>Simulation</div>
        </div>
        <div style={{ flex: 1 }} />
        {done && (
          <button onClick={onResults} style={{
            fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500,
            background: 'var(--ember)', color: 'var(--stage)',
            border: 'none', borderRadius: 'var(--r-sm)',
            padding: '7px 16px', cursor: 'pointer',
            transition: 'background 150ms ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--ember-600)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--ember)'; }}
          >View results →</button>
        )}
        <button onClick={onBack} style={{
          fontFamily: 'var(--font-sans)', fontSize: 13,
          background: 'transparent', color: 'var(--stage-muted)',
          border: '0.5px solid var(--stage-hairline)', borderRadius: 'var(--r-sm)',
          padding: '6px 14px', cursor: 'pointer',
        }}>← Back</button>
      </header>

      {/* ── SVG viewport ────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <svg
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          <defs>
            <pattern id="sim-grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="0.5"/>
            </pattern>
          </defs>

          {/* Background */}
          <rect x={vb.x} y={0} width={vb.w} height={VIEWPORT_H} fill="#1A1C1F"/>
          <rect x={vb.x} y={0} width={vb.w} height={VIEWPORT_H} fill="url(#sim-grid)"/>

          {/* Road */}
          <rect x={vb.x - 200} y={ROAD_Y} width={vb.w + 400} height={ROAD_H} fill="#26282D"/>
          <line x1={vb.x - 200} y1={ROAD_Y}          x2={vb.x + vb.w + 200} y2={ROAD_Y}
            stroke="rgba(245,237,232,0.15)" strokeWidth="1.5"/>
          <line x1={vb.x - 200} y1={ROAD_Y + ROAD_H} x2={vb.x + vb.w + 200} y2={ROAD_Y + ROAD_H}
            stroke="rgba(245,237,232,0.15)" strokeWidth="1.5"/>
          <line x1={vb.x - 200} y1={ROAD_CY}         x2={vb.x + vb.w + 200} y2={ROAD_CY}
            stroke="rgba(245,237,232,0.07)" strokeWidth="1" strokeDasharray="24 18"/>

          {/* ── Painted trails ─────────────────────────────────────────────── */}
          {rxTrailW > 0 && (
            <rect x={0} y={ROAD_Y} width={rxTrailW} height={ROAD_H} fill="rgba(224,165,22,0.22)"/>
          )}
          {bkTrailW > 0 && (
            <rect x={reactionEndX} y={ROAD_Y} width={bkTrailW} height={ROAD_H} fill="rgba(216,87,42,0.28)"/>
          )}

          {/* ── Distance markers ───────────────────────────────────────────── */}
          {labelVisible && [0.25, 0.5, 0.75, 1.0].map(frac => {
            const wx = frac * obstacleWorldX;
            return (
              <g key={frac}>
                <line x1={wx} y1={ROAD_Y - 8} x2={wx} y2={ROAD_Y}
                  stroke="rgba(245,237,232,0.22)" strokeWidth="0.75"/>
                <text x={wx} y={ROAD_Y - 14}
                  fontFamily="var(--font-mono)" fontSize={8 * vs}
                  fill="rgba(245,237,232,0.38)" textAnchor="middle">
                  {Math.round(frac * cfg.obsDist)}m
                </text>
              </g>
            );
          })}

          {/* ── Obstacle ───────────────────────────────────────────────────── */}
          <rect
            x={obstacleWorldX - 2} y={ROAD_CY - 18}
            width={36} height={36} rx={3}
            fill="#3A3D45" stroke="rgba(245,237,232,0.22)" strokeWidth="1"
          />

          {/* ── AEB cone ───────────────────────────────────────────────────── */}
          {isBraking && cfg.sys.aeb && !hasCrashed && (
            <polygon
              points={`${carX + CAR_W},${ROAD_CY} ${carX + CAR_W + 120},${ROAD_CY - 36} ${carX + CAR_W + 120},${ROAD_CY + 36}`}
              fill="rgba(224,165,22,0.11)"
              stroke="rgba(224,165,22,0.32)"
              strokeWidth="0.5"
            />
          )}

          {/* ── Vehicle ────────────────────────────────────────────────────── */}
          {/* Body */}
          <rect x={carX} y={carY} width={CAR_W} height={CAR_H} rx={5}
            fill="#C8C2BA" stroke="rgba(255,255,255,0.15)" strokeWidth="0.75"/>
          {/* Windshield */}
          <rect x={carX + 26} y={carY + 4} width={14} height={16} rx={2}
            fill="rgba(120,160,200,0.5)"/>
          {/* Headlights */}
          <rect x={carX + CAR_W - 4} y={carY + 3}          width={4} height={6} rx={1} fill="rgba(255,240,180,0.65)"/>
          <rect x={carX + CAR_W - 4} y={carY + CAR_H - 9}  width={4} height={6} rx={1} fill="rgba(255,240,180,0.65)"/>
          {/* Brake lights */}
          {isBraking && (
            <>
              <rect x={carX} y={carY + 3}         width={5} height={6} rx={1.5} fill="#C73E33"/>
              <rect x={carX} y={carY + CAR_H - 9} width={5} height={6} rx={1.5} fill="#C73E33"/>
            </>
          )}

          {/* ── Crash overlay ──────────────────────────────────────────────── */}
          {hasCrashed && (
            <>
              <circle cx={obstacleWorldX + 8} cy={ROAD_CY} r={38} fill="rgba(199,62,51,0.30)"/>
              <circle cx={obstacleWorldX + 8} cy={ROAD_CY} r={20} fill="rgba(255,110,70,0.50)"/>
            </>
          )}

          {/* ── Camera badge (viewport-fixed) ──────────────────────────────── */}
          <text
            x={vb.x + 11 * vs} y={18 * vs}
            fontFamily="var(--font-mono)" fontSize={9 * vs}
            fontWeight="500" fill="rgba(245,237,232,0.38)" letterSpacing="1"
          >TOP-DOWN · SCALED 1:1</text>

        </svg>

        {/* Crash label — DOM overlay */}
        {hasCrashed && labelVisible && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            fontFamily: 'var(--font-sans)', fontSize: mobile ? 18 : 22, fontWeight: 500,
            color: 'var(--fatal-text)', background: 'var(--fatal-bg)',
            padding: '10px 22px', borderRadius: 'var(--r-sm)',
            pointerEvents: 'none',
          }}>
            Impact at {(res.vImpK ?? 0).toFixed(1)} km/h
          </div>
        )}
      </div>

      {/* ── Progress bar ────────────────────────────────────────────────────── */}
      <div style={{ height: 4, background: 'var(--stage-elevated)', flexShrink: 0 }}>
        <div style={{
          height: '100%',
          width: `${prog * 100}%`,
          background: hasCrashed ? '#C73E33' : 'var(--ember)',
          transition: 'width 80ms linear',
        }}/>
      </div>

      {/* ── Physics strip ───────────────────────────────────────────────────── */}
      <div style={{
        flexShrink: 0,
        background: 'var(--stage-elevated)',
        borderTop: '0.5px solid var(--stage-hairline)',
        display: 'flex',
        alignItems: 'center',
        padding: mobile ? '10px 16px' : '10px 24px',
        gap: mobile ? 16 : 32,
        overflowX: 'auto',
      }}>
        {[
          { label: 'Phase',    value: phase },
          { label: 'Speed',    value: `${liveSpeed.toFixed(1)} km/h` },
          { label: 'Distance', value: `${(vn * cfg.obsDist).toFixed(1)} m` },
          { label: 'AEB',      value: cfg.sys.aeb ? 'Active' : 'Off' },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
            <div style={{
              fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 500,
              letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--stage-muted)',
            }}>{label}</div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 500,
              color: 'var(--stage-text)',
            }}>{value}</div>
          </div>
        ))}
        <div style={{ flex: 1 }}/>
        {done && !mobile && (
          <button onClick={onResults} style={{
            fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500,
            background: 'var(--ember)', color: 'var(--stage)',
            border: 'none', borderRadius: 'var(--r-sm)',
            padding: '7px 16px', cursor: 'pointer',
            transition: 'background 150ms ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--ember-600)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--ember)'; }}
          >View results →</button>
        )}
      </div>

    </div>
  );
}
