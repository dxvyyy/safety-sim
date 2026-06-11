import { C } from '../../data/colors.js';

const RAIN_P=Array.from({length:36},(_,i)=>({x:(i*83+19)%700,y:(i*47+9)%260,l:10+i%8}));
const SNOW_P=Array.from({length:22},(_,i)=>({x:(i*107+41)%700,y:(i*61+15)%260,r:1.2+(i%3)*0.4}));
const TW=700,TRY=82,TRH=110,TMID=TRY+TRH/2,TX0=55,TXOBS=590;

function getVx(res,prog,cfg){
  if(!res)return TX0;
  const dist=cfg.obsDist;
  const tot=res.hit?dist:Math.max(res.dTot,dist);
  const sc=(TXOBS-TX0-38)/Math.max(tot,1);
  const rFrac=Math.min(res.dR/Math.max(tot,1),0.96);
  let vx;
  if(prog<=rFrac){vx=TX0+(prog/rFrac)*res.dR*sc;}
  else{
    const bp=(prog-rFrac)/Math.max(1-rFrac,0.01);
    vx=TX0+res.dR*sc+bp*Math.min(res.dB,tot-res.dR)*sc;
  }
  return Math.min(vx,TXOBS-30);
}

function isBrk(res,prog,cfg){
  if(!res)return false;
  const tot=res.hit?cfg.obsDist:Math.max(res.dTot,cfg.obsDist);
  return prog>Math.min(res.dR/Math.max(tot,1),0.96);
}

function getSpd(res,prog,cfg){
  if(!res)return cfg.speed;
  const tot=res.hit?cfg.obsDist:Math.max(res.dTot,cfg.obsDist);
  const rFrac=Math.min(res.dR/Math.max(tot,1),0.96);
  if(prog<=rFrac)return cfg.speed;
  const bp=(prog-rFrac)/Math.max(1-rFrac,0.01);
  return Math.max(res.vImpK,cfg.speed-(cfg.speed-res.vImpK)*Math.min(bp,1));
}

export function ObsSprite({x,y,type}){
  if(type==='pedestrian')return(
    <g transform={`translate(${x},${y})`}>
      <circle cy={-17} r={5.5} fill={C.yellow}/>
      <line y1={-11} y2={2} stroke={C.yellow} strokeWidth={2.5} strokeLinecap="round"/>
      <line x1={-7} y1={-5} x2={7} y2={-5} stroke={C.yellow} strokeWidth={2.5} strokeLinecap="round"/>
      <line x1={0} y1={2} x2={-6} y2={14} stroke={C.yellow} strokeWidth={2.5} strokeLinecap="round"/>
      <line x1={0} y1={2} x2={6} y2={14} stroke={C.yellow} strokeWidth={2.5} strokeLinecap="round"/>
    </g>
  );
  if(type==='animal')return(
    <g transform={`translate(${x},${y})`}>
      <ellipse rx={12} ry={7} fill="#7A5614"/>
      <circle cx={11} cy={-5} r={5} fill="#7A5614"/>
      {[[-9,5,-13,14],[-3,5,-3,14],[3,5,3,14],[9,5,13,14]].map(([x1,y1,x2,y2],i)=>
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#7A5614" strokeWidth={2.5} strokeLinecap="round"/>)}
    </g>
  );
  if(type==='oncoming')return(
    <g transform={`translate(${x-15},${y-7})`}>
      <rect width={30} height={14} fill={C.red} rx={3} opacity={0.85}/>
      <rect x={2} y={2} width={18} height={10} fill="rgba(255,180,180,0.28)" rx={2}/>
      <rect x={26} y={3} width={3} height={3} fill="#fff" rx={0.5}/>
      <rect x={26} y={8} width={3} height={3} fill="#fff" rx={0.5}/>
    </g>
  );
  return(
    <g transform={`translate(${x-17},${y-8})`}>
      <rect width={34} height={17} fill="#3A4060" rx={3.5}/>
      <rect x={5} y={3} width={24} height={11} fill="#22253A" rx={2}/>
    </g>
  );
}

export function CarSprite({x,y,type,braking}){
  const w=type==='bus'?44:type==='truck'?38:28;
  const h=type==='motorcycle'?9:17;
  const fc={sedan:C.blue,suv:'#FF8040',truck:C.yellow,motorcycle:C.green,bus:'#9090FF'}[type]??C.blue;
  return(
    <g transform={`translate(${x},${y})`}>
      <rect x={-4} y={-h/2} width={w} height={h} fill={fc} rx={3}/>
      <rect x={w-10} y={-h/2+3} width={6} height={h-6} fill="rgba(200,240,255,0.35)" rx={2}/>
      <rect x={w-2} y={-h/2+2} width={2} height={3} fill="#FFEE80" rx={0.8}/>
      <rect x={w-2} y={h/2-5} width={2} height={3} fill="#FFEE80" rx={0.8}/>
      <rect x={-4} y={-h/2+2} width={2} height={3} fill={braking?'#FF2200':'#660000'} rx={0.8}/>
      <rect x={-4} y={h/2-5} width={2} height={3} fill={braking?'#FF2200':'#660000'} rx={0.8}/>
    </g>
  );
}

export function TopCam({res,prog,cfg,h=270}){
  const vx=getVx(res,prog,cfg);
  const brk=isBrk(res,prog,cfg);
  const done=prog>=0.98;
  let rxZ=0,bxZ=TX0,bwZ=0;
  if(res){
    const tot=res.hit?cfg.obsDist:Math.max(res.dTot,cfg.obsDist);
    const sc=(TXOBS-TX0-38)/Math.max(tot,1);
    rxZ=res.dR*sc;bxZ=TX0+rxZ;bwZ=Math.min(res.dB,tot-res.dR)*sc;
  }
  const night=cfg.weather==='night'||cfg.weather==='night_rain';
  const rainy=cfg.weather?.includes('rain');
  const foggy=cfg.weather==='fog'||cfg.weather==='dense_fog';
  const snowy=cfg.weather==='snow_w';
  const spd=Math.round(Math.max(0,getSpd(res,prog,cfg)));
  return(
    <svg viewBox={`0 0 ${TW} ${h}`} width="100%" style={{display:'block'}}>
      <defs>
        {done&&res?.hit&&<radialGradient id="ig"><stop offset="0%" stopColor={C.red} stopOpacity={0.85}/><stop offset="100%" stopColor={C.red} stopOpacity={0}/></radialGradient>}
        {done&&!res?.hit&&<radialGradient id="sg"><stop offset="0%" stopColor={C.green} stopOpacity={0.7}/><stop offset="100%" stopColor={C.green} stopOpacity={0}/></radialGradient>}
      </defs>
      <rect width={TW} height={h} fill={C.bg}/>
      <rect width={TW} height={TRY} fill="#0A0F08"/>
      <rect y={TRY+TRH} width={TW} height={h-TRY-TRH} fill="#0A0F08"/>
      <rect y={TRY} width={TW} height={TRH} fill="#181B26"/>
      <rect y={TRY} width={TW} height={3} fill="#C0A800" opacity={0.75}/>
      <rect y={TRY+TRH-3} width={TW} height={3} fill="#C0A800" opacity={0.75}/>
      {Array.from({length:10},(_,i)=><rect key={i} x={20+i*68} y={TMID-2} width={36} height={3.5} fill="#2E3250" rx={1.5}/>)}
      {res&&<>
        <rect x={TX0} y={TRY} width={rxZ} height={TRH} fill={C.yellow} opacity={0.09}/>
        <rect x={bxZ} y={TRY} width={bwZ} height={TRH} fill={C.orange} opacity={0.10}/>
        {rxZ>32&&<text x={TX0+rxZ/2} y={TRY+14} fill={C.yellow} fontSize={8} textAnchor="middle" fontFamily="monospace" opacity={0.8}>REACT {res.dR.toFixed(1)}m</text>}
        {bwZ>32&&<text x={bxZ+bwZ/2} y={TRY+14} fill={C.orange} fontSize={8} textAnchor="middle" fontFamily="monospace" opacity={0.8}>BRAKE {res.dB.toFixed(1)}m</text>}
      </>}
      {!cfg.sys?.abs&&brk&&res?.hit&&<>
        <line x1={bxZ} y1={TMID-9} x2={vx+6} y2={TMID-9} stroke="#0C0C14" strokeWidth={5} strokeLinecap="round" opacity={0.9}/>
        <line x1={bxZ} y1={TMID+9} x2={vx+6} y2={TMID+9} stroke="#0C0C14" strokeWidth={5} strokeLinecap="round" opacity={0.9}/>
      </>}
      <ObsSprite x={TXOBS} y={TMID} type={cfg.obstacleType||'parked_car'}/>
      <CarSprite x={vx} y={TMID} type={cfg.vehicleType||'sedan'} braking={brk}/>
      {done&&res?.hit&&<>
        <ellipse cx={TXOBS-8} cy={TMID} rx={65} ry={54} fill="url(#ig)"/>
        {[-28,-10,8,24].map((a,i)=><line key={i} x1={TXOBS-8} y1={TMID} x2={TXOBS-8+Math.cos(a*Math.PI/180)*42} y2={TMID+Math.sin(a*Math.PI/180)*42} stroke={C.red} strokeWidth={1.5} opacity={0.5}/>)}
      </>}
      {done&&!res?.hit&&<ellipse cx={vx+12} cy={TMID} rx={54} ry={42} fill="url(#sg)"/>}
      {rainy&&RAIN_P.map((d,i)=><line key={i} x1={d.x} y1={d.y} x2={d.x-3} y2={d.y+d.l} stroke="#5088CC" strokeWidth={0.9} opacity={0.28}/>)}
      {snowy&&SNOW_P.map((d,i)=><circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#BBCCE0" opacity={0.42}/>)}
      {foggy&&<rect width={TW} height={h} fill="#90A8C0" opacity={0.08}/>}
      {night&&<rect width={TW} height={h} fill="#00003A" opacity={0.22}/>}
      {res&&<g>
        <rect x={TW-74} y={h-50} width={66} height={42} fill="rgba(0,0,0,0.75)" rx={8}/>
        <text x={TW-41} y={h-26} fill={brk?C.orange:C.text} fontSize={19} textAnchor="middle" fontWeight={800} fontFamily="monospace">{spd}</text>
        <text x={TW-41} y={h-11} fill={C.muted} fontSize={9} textAnchor="middle" fontFamily="monospace">km/h</text>
      </g>}
      {done&&res&&<g>
        <rect x={TW/2-82} y={14} width={164} height={32} fill={res.hit?C.red:C.green} opacity={0.13} rx={7}/>
        <rect x={TW/2-82} y={14} width={164} height={32} fill="none" stroke={res.hit?C.red:C.green} strokeWidth={0.8} rx={7} opacity={0.5}/>
        <text x={TW/2} y={35} fill={res.hit?C.red:C.green} fontSize={13} textAnchor="middle" fontWeight={800} fontFamily="monospace" letterSpacing={2}>{res.hit?'COLLISION':'SAFE STOP'}</text>
      </g>}
      <rect x={8} y={8} width={110} height={18} fill="rgba(0,0,0,0.65)" rx={3}/>
      <text x={14} y={20.5} fill={C.orange} fontSize={9} fontFamily="monospace" fontWeight={700}>CAM 1 — TOP-DOWN</text>
      {!res&&<text x={TW/2} y={h/2+4} fill={C.muted} fontSize={12} textAnchor="middle" fontFamily="monospace">Awaiting simulation...</text>}
    </svg>
  );
}

export function SideCam({res,prog,cfg,h=270}){
  const W=700,GY=h*0.72,RH=h*0.14;
  const vx=getVx(res,prog,cfg);
  const brk=isBrk(res,prog,cfg);
  const done=prog>=0.98;
  const fc={sedan:C.blue,suv:'#FF8040',truck:C.yellow,motorcycle:C.green,bus:'#9090FF'}[cfg.vehicleType||'sedan']??C.blue;
  const vW=cfg.vehicleType==='truck'?52:cfg.vehicleType==='bus'?68:cfg.vehicleType==='motorcycle'?30:40;
  const vH=cfg.vehicleType==='motorcycle'?10:cfg.vehicleType==='truck'?22:cfg.vehicleType==='bus'?28:17;
  const wR=cfg.vehicleType==='motorcycle'?7:9;
  const bxZ=res?TX0+(res.dR*(TXOBS-TX0-38)/Math.max(res.hit?cfg.obsDist:Math.max(res.dTot,cfg.obsDist),1)):TX0;
  return(
    <svg viewBox={`0 0 ${W} ${h}`} width="100%" style={{display:'block'}}>
      <rect width={W} height={GY} fill="#070A0F"/>
      <rect y={GY} width={W} height={h-GY} fill="#0A0F08"/>
      <rect y={GY} width={W} height={RH} fill="#181B26"/>
      <rect y={GY} width={W} height={2} fill="#C0A800" opacity={0.6}/>
      <rect y={GY+RH-2} width={W} height={2} fill="#C0A800" opacity={0.6}/>
      {Array.from({length:9},(_,i)=><rect key={i} x={30+i*74} y={GY+RH/2-1.5} width={44} height={3} fill="#2E3250" rx={1.5}/>)}
      <line x1={590} y1={GY-8} x2={590} y2={GY+RH+8} stroke={C.red} strokeWidth={1.5} opacity={0.35} strokeDasharray="4 3"/>
      {!cfg.sys?.abs&&brk&&res?.hit&&(
        <line x1={bxZ} y1={GY+RH-5} x2={vx+vW*0.75} y2={GY+RH-5} stroke="#0D0D14" strokeWidth={4} strokeLinecap="round" opacity={0.9}/>
      )}
      <g transform={`translate(${vx},${GY-vH-wR})`}>
        <rect width={vW} height={vH} fill={fc} rx={done&&res?.hit?2:4}/>
        {done&&res?.hit&&<rect x={vW*0.68} y={0} width={vW*0.32} height={vH} fill={fc} opacity={0.35} transform="skewX(-22) translate(10,0)"/>}
        <rect x={vW*0.52} y={2} width={vW*0.28} height={vH-4} fill="rgba(200,230,255,0.22)" rx={2}/>
        <circle cx={vW*0.18} cy={vH+wR} r={wR} fill="#1A1A1A" stroke="#333" strokeWidth={1.5}/>
        <circle cx={vW*0.82} cy={vH+wR} r={wR} fill="#1A1A1A" stroke="#333" strokeWidth={1.5}/>
        <circle cx={vW*0.18} cy={vH+wR} r={wR*0.36} fill="#444"/>
        <circle cx={vW*0.82} cy={vH+wR} r={wR*0.36} fill="#444"/>
        <rect x={-1} y={vH*0.3} width={3} height={vH*0.4} fill={brk?'#FF2200':'#660000'} rx={1}/>
        <rect x={vW-2} y={vH*0.3} width={3} height={vH*0.4} fill="#FFEE80" rx={1}/>
      </g>
      {done&&res?.hit&&<ellipse cx={590} cy={GY-vH/2} rx={55} ry={45} fill={C.red} opacity={0.18}/>}
      <rect x={8} y={8} width={112} height={18} fill="rgba(0,0,0,0.65)" rx={3}/>
      <text x={14} y={20.5} fill={C.blue} fontSize={9} fontFamily="monospace" fontWeight={700}>CAM 2 — SIDE VIEW</text>
      {done&&res&&<g>
        <rect x={W/2-60} y={GY*0.35-12} width={120} height={24} fill={res.hit?C.red:C.green} opacity={0.15} rx={5}/>
        <text x={W/2} y={GY*0.35+5} fill={res.hit?C.red:C.green} fontSize={11} textAnchor="middle" fontWeight={800} fontFamily="monospace">{res.hit?'IMPACT':'STOPPED'}</text>
      </g>}
      {!res&&<text x={W/2} y={h/2+4} fill={C.muted} fontSize={12} textAnchor="middle" fontFamily="monospace">Awaiting simulation...</text>}
    </svg>
  );
}

export function FrontCam({res,prog,cfg,h=270}){
  const W=700,VPX=W/2,VPY=h*0.46;
  const obsS=0.04+prog*0.96;
  const done=prog>=0.98;
  const night=cfg.weather==='night'||cfg.weather==='night_rain';
  const foggy=cfg.weather==='fog'||cfg.weather==='dense_fog';
  const obsCol=cfg.obstacleType==='oncoming'?C.red:cfg.obstacleType==='pedestrian'?C.yellow:'#3A4060';
  return(
    <svg viewBox={`0 0 ${W} ${h}`} width="100%" style={{display:'block'}}>
      <rect width={W} height={VPY} fill={night?'#030406':'#070B10'}/>
      <polygon points={`0,${VPY} ${VPX-22},${VPY} 0,${h}`} fill="#0A0F08"/>
      <polygon points={`${W},${VPY} ${VPX+22},${VPY} ${W},${h}`} fill="#0A0F08"/>
      <polygon points={`${VPX-22},${VPY} ${VPX+22},${VPY} ${W-50},${h} 50,${h}`} fill="#181B26"/>
      <line x1={VPX-22} y1={VPY} x2={50} y2={h} stroke="#C0A800" strokeWidth={2} opacity={0.6}/>
      <line x1={VPX+22} y1={VPY} x2={W-50} y2={h} stroke="#C0A800" strokeWidth={2} opacity={0.6}/>
      {[0.18,0.40,0.62,0.80].map((t,i)=>{
        const interp=(a)=>{const left=VPX-22,right=W-50,bLeft=50;
          return {lx:left+(bLeft-left)*a,rx:right+(VPX+22-right)*a,y:VPY+a*(h-VPY)};};
        const a1=interp(t),a2=interp(Math.min(t+0.08,1));
        const mx1=(a1.lx+a1.rx)/2,mx2=(a2.lx+a2.rx)/2;
        return<line key={i} x1={mx1} y1={a1.y} x2={mx2} y2={a2.y} stroke="#2E3250" strokeWidth={2}/>;
      })}
      <rect y={h*0.84} width={W} height={h*0.16} fill="#0B0D12"/>
      <rect y={h*0.84} width={W} height={2} fill="#1E2330"/>
      {night&&<>
        <polygon points={`${VPX-55},${h*0.84} ${VPX-22},${VPY+22} ${VPX-95},${h*0.84}`} fill="#FFEE80" opacity={0.04}/>
        <polygon points={`${VPX+55},${h*0.84} ${VPX+22},${VPY+22} ${VPX+95},${h*0.84}`} fill="#FFEE80" opacity={0.04}/>
      </>}
      {res&&(
        <g transform={`translate(${VPX},${VPY+10}) scale(${obsS})`}>
          <rect x={-22} y={-28} width={60} height={38} fill={obsCol} rx={4} opacity={0.9}/>
          {cfg.obstacleType==='pedestrian'&&<>
            <circle cy={-44} r={11} fill={C.yellow}/>
            <line y1={-33} y2={-18} stroke={C.yellow} strokeWidth={5} strokeLinecap="round"/>
            <line x1={-10} y1={-26} x2={10} y2={-26} stroke={C.yellow} strokeWidth={5} strokeLinecap="round"/>
          </>}
        </g>
      )}
      {done&&res?.hit&&<rect width={W} height={h} fill={C.red} opacity={0.25}/>}
      {foggy&&<rect width={W} height={h} fill="#90A8C0" opacity={0.13}/>}
      <rect x={8} y={8} width={120} height={18} fill="rgba(0,0,0,0.65)" rx={3}/>
      <text x={14} y={20.5} fill={C.green} fontSize={9} fontFamily="monospace" fontWeight={700}>CAM 3 — DRIVER POV</text>
      {done&&res&&<g>
        <rect x={W/2-60} y={VPY-24} width={120} height={24} fill={res.hit?C.red:C.green} opacity={0.15} rx={5}/>
        <text x={W/2} y={VPY-6} fill={res.hit?C.red:C.green} fontSize={11} textAnchor="middle" fontWeight={800} fontFamily="monospace">{res.hit?'IMPACT':'STOPPED'}</text>
      </g>}
      {!res&&<text x={W/2} y={h/2+4} fill={C.muted} fontSize={12} textAnchor="middle" fontFamily="monospace">Awaiting simulation...</text>}
    </svg>
  );
}

export function RearCam({res,prog,cfg,h=270}){
  const W=700,VPX=W/2,VPY=h*0.42;
  const obsS=res?.hit?0.025+prog*0.22:0.025;
  const done=prog>=0.98;
  const fc={sedan:C.blue,suv:'#FF8040',truck:C.yellow,motorcycle:C.green,bus:'#9090FF'}[cfg.vehicleType||'sedan']??C.blue;
  const night=cfg.weather==='night'||cfg.weather==='night_rain';
  const brkOn=isBrk(res,prog,cfg);
  return(
    <svg viewBox={`0 0 ${W} ${h}`} width="100%" style={{display:'block'}}>
      <rect width={W} height={VPY} fill={night?'#030406':'#070B10'}/>
      <polygon points={`0,${VPY} ${VPX-22},${VPY} 0,${h}`} fill="#0A0F08"/>
      <polygon points={`${W},${VPY} ${VPX+22},${VPY} ${W},${h}`} fill="#0A0F08"/>
      <polygon points={`${VPX-22},${VPY} ${VPX+22},${VPY} ${W-50},${h} 50,${h}`} fill="#181B26"/>
      <line x1={VPX-22} y1={VPY} x2={50} y2={h} stroke="#C0A800" strokeWidth={2} opacity={0.6}/>
      <line x1={VPX+22} y1={VPY} x2={W-50} y2={h} stroke="#C0A800" strokeWidth={2} opacity={0.6}/>
      {res&&<g transform={`translate(${VPX},${VPY+6})`}>
        <rect x={-14*obsS} y={-18*obsS} width={28*obsS} height={18*obsS} fill={C.yellow} rx={2} opacity={0.85}/>
      </g>}
      <g transform={`translate(${W/2},${h*0.7})`}>
        <rect x={-34} y={-22} width={68} height={22} fill={fc} rx={4}/>
        <rect x={-22} y={-22} width={44} height={15} fill="rgba(200,230,255,0.22)" rx={2}/>
        <rect x={-33} y={-9} width={10} height={8} fill={brkOn?'#FF2200':'#660000'} rx={1}/>
        <rect x={23} y={-9} width={10} height={8} fill={brkOn?'#FF2200':'#660000'} rx={1}/>
        <rect x={-34} y={0} width={68} height={5} fill="#1C1F28" rx={2}/>
        <circle cx={-27} cy={10} r={10} fill="#1A1A1A" stroke="#333" strokeWidth={1.5}/>
        <circle cx={27} cy={10} r={10} fill="#1A1A1A" stroke="#333" strokeWidth={1.5}/>
        <circle cx={-27} cy={10} r={4} fill="#444"/>
        <circle cx={27} cy={10} r={4} fill="#444"/>
        {night&&<>
          <circle cx={-9} cy={0} r={3.5} fill="#FFCC00" opacity={0.55}/>
          <circle cx={9} cy={0} r={3.5} fill="#FFCC00" opacity={0.55}/>
        </>}
      </g>
      {done&&res?.hit&&<rect width={W} height={h} fill={C.red} opacity={0.2}/>}
      <rect x={8} y={8} width={122} height={18} fill="rgba(0,0,0,0.65)" rx={3}/>
      <text x={14} y={20.5} fill={C.purple} fontSize={9} fontFamily="monospace" fontWeight={700}>CAM 4 — REAR CHASE</text>
      {done&&res&&<g>
        <rect x={W/2-60} y={VPY-24} width={120} height={24} fill={res.hit?C.red:C.green} opacity={0.15} rx={5}/>
        <text x={W/2} y={VPY-6} fill={res.hit?C.red:C.green} fontSize={11} textAnchor="middle" fontWeight={800} fontFamily="monospace">{res.hit?'IMPACT':'STOPPED'}</text>
      </g>}
      {!res&&<text x={W/2} y={h/2+4} fill={C.muted} fontSize={12} textAnchor="middle" fontFamily="monospace">Awaiting simulation...</text>}
    </svg>
  );
}
