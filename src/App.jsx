import { useState, useRef, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { calcPhysics } from './lib/physics.js';
import LaunchScreen from './screens/LaunchScreen.jsx';
import BuilderScreen from './screens/BuilderScreen.jsx';
import PreviewScreen from './screens/PreviewScreen.jsx';
import SimulationScreen from './screens/SimulationScreen.jsx';
import ResultsScreen from './screens/ResultsScreen.jsx';
import TokenTest from './screens/TokenTest.jsx';

const DEF = {
  typology: 'frontal', vehicleType: 'sedan', speed: 80, mass: 1400, tireCond: 80,
  tireType: 'summer', brakeEff: 90, isEV: false, occupants: 2, occupantType: 'adults',
  surface: 'dry_asphalt', quality: 90, geo: 'straight', weather: 'clear',
  obstacleType: 'parked_car', obsDist: 80, rtKey: 'normal',
  sys: { abs: true, esc: true, tcs: false, aeb: false, lka: false, acc: false, bsd: false },
  pas: { belt: true, frontBag: true, sideBag: true, crumple: 4, head: true, child: false },
};

export default function App() {
  const navigate = useNavigate();
  const [cfg, setCfg] = useState(DEF);
  const [res, setRes] = useState(null);
  const [prog, setProg] = useState(0);
  const [running, setRunning] = useState(false);
  const rafRef = useRef(null);
  const t0 = useRef(null);

  const runSim = (config) => {
    const r = calcPhysics(config || cfg);
    setRes(r); setProg(0); setRunning(true); t0.current = null;
    const D = 4400;
    const tick = ts => {
      if (!t0.current) t0.current = ts;
      const p = Math.min((ts - t0.current) / D, 1);
      setProg(p);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else setRunning(false);
    };
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  return (
    <Routes>
      <Route path="/" element={<LaunchScreen onStart={() => navigate('/builder')} />} />
      <Route path="/builder" element={<BuilderScreen cfg={cfg} set={setCfg} onPreview={() => navigate('/preview')} />} />
      <Route path="/preview" element={<PreviewScreen cfg={cfg} onRun={() => { runSim(cfg); navigate('/simulation'); }} onBack={() => navigate('/builder')} />} />
      <Route path="/simulation" element={<SimulationScreen cfg={cfg} res={res} prog={prog} running={running} onResults={() => navigate('/results')} onBack={() => navigate('/preview')} />} />
      <Route path="/results" element={<ResultsScreen cfg={cfg} res={res}
        onRestart={() => { runSim(cfg); navigate('/simulation'); }}
        onChange={() => { setRes(null); setProg(0); navigate('/builder'); }}
        onNew={() => { setCfg(DEF); setRes(null); setProg(0); navigate('/'); }}
      />} />
      <Route path="/tokens" element={<TokenTest />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
