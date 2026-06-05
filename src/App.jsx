import { useState, useRef, useEffect, useMemo } from "react";

const C = {
  bg:'#0A0C10', panel:'#111318', deep:'#0D0F14', border:'#1E2330',
  orange:'#FF5C00', blue:'#00C2FF', green:'#00E676', yellow:'#FFD600',
  red:'#FF1744', purple:'#9C6FFF', text:'#F0F2F8', muted:'#7A8099', faint:'#222636',
};
const G = 9.81;

const SURF = {
  dry_asphalt:{mu:0.80,label:'Dry Asphalt'},wet_asphalt:{mu:0.50,label:'Wet Asphalt'},
  cobble_dry:{mu:0.60,label:'Cobblestone (dry)'},cobble_wet:{mu:0.35,label:'Cobblestone (wet)'},
  gravel:{mu:0.40,label:'Gravel'},snow:{mu:0.20,label:'Compacted Snow'},ice:{mu:0.10,label:'Black Ice'},
};
const TIRE_MU = {summer:1.0,winter:0.85,allseason:0.92};
const WX = {
  clear:{muM:1.00,vis:200,rtA:0.0,label:'Clear Day'},
  overcast:{muM:1.00,vis:150,rtA:0.0,label:'Overcast'},
  light_rain:{muM:0.85,vis:100,rtA:0.0,label:'Light Rain'},
  heavy_rain:{muM:0.65,vis:50,rtA:0.0,label:'Heavy Rain'},
  fog:{muM:1.00,vis:30,rtA:0.0,label:'Fog'},
  dense_fog:{muM:1.00,vis:10,rtA:0.0,label:'Dense Fog'},
  snow_w:{muM:0.70,vis:40,rtA:0.0,label:'Snow'},
  night:{muM:1.00,vis:60,rtA:0.3,label:'Night'},
  night_rain:{muM:0.65,vis:30,rtA:0.3,label:'Night + Rain'},
};
const RT = {
  alert:{t:0.8,label:'Alert (0.8 s)'},normal:{t:1.0,label:'Normal (1.0 s)'},
  tired:{t:1.5,label:'Tired (1.5 s)'},distracted:{t:2.5,label:'Distracted (2.5 s)'},
  impaired:{t:3.0,label:'Impaired (3.0 s)'},
};

const TYPS = [
  {id:'frontal',name:'Frontal Barrier',abbr:'FRONTAL',col:'#FF1744',severity:'HIGH',
   desc:'Head-on strike against a fixed barrier or stationary object at full approach speed',
   defSpeed:80,defDist:60,defObs:'parked_car',
   invNote:'Crumple zone deformation depth, airbag timing, and belt webbing marks are key evidence. Primary injury mechanisms are head and chest loading.',
   ncapRef:'Euro NCAP Full-Width Rigid Barrier test at 50 km/h and IIHS Small Overlap Rigid Barrier at 40 mph model this scenario directly. Educational approximation based on published segment data.',
   reforms:['Extended crumple zone rail geometry','Revised airbag deployment thresholds for small overlap','Improved load path engineering to firewall']},
  {id:'rear_end',name:'Rear-End Collision',abbr:'REAR-END',col:'#FF8C00',severity:'MODERATE',
   desc:'Vehicle strikes the one ahead, or is struck from behind. Primary whiplash and head restraint scenario',
   defSpeed:70,defDist:50,defObs:'parked_car',
   invNote:'Head restraint position relative to the occupant head at impact determines cervical loading. Belt slack at rear-onset is a critical variable frequently cited in investigation reports.',
   ncapRef:'IIHS evaluates head restraint geometry in rear impact tests. Volvo WHIPS and Mercedes NECK-PRO were developed directly from rear-end crash investigation databases. Educational approximation.',
   reforms:['Active head restraint geometry revision','Electric pretensioner pre-arm threshold reduction','Rear AEB activation parameter tuning']},
  {id:'tbone',name:'Side Impact (T-Bone)',abbr:'T-BONE',col:'#FF5C00',severity:'CRITICAL',
   desc:'Perpendicular vehicle strikes the door at intersection speed. Virtually no crumple space between occupant and impact point',
   defSpeed:60,defDist:25,defObs:'oncoming',
   invNote:'Door intrusion depth versus occupant clearance is the survival structural metric. B-pillar geometry determines whether the survival space is maintained. Curtain airbag deployment must occur within 12-20ms of first contact.',
   ncapRef:'Euro NCAP updated its Moving Deformable Barrier test in 2022 to 1400 kg at 60 km/h, reflecting real-world SUV mass increases. Side impact remains the highest fatality-per-crash category in Europe. Educational approximation.',
   reforms:['Door beam geometry revision','B-pillar hot-stamp section upgrade','Side airbag pre-arm triggered by intersection V2I data']},
  {id:'headon',name:'Head-On Collision',abbr:'HEAD-ON',col:'#E53935',severity:'CRITICAL',
   desc:'Two vehicles collide at combined closing speed. Closing velocity is the sum of both vehicles, making this the most lethal crash family',
   defSpeed:90,defDist:200,defObs:'oncoming',
   invNote:'Closing speed equals the sum of both vehicle velocities. Mass mismatch is critical: the lighter vehicle absorbs disproportionately more energy. Lane departure without ESC or LKA intervention is the dominant precursor.',
   ncapRef:'Head-on collisions represent approximately 11% of crashes but 23% of occupant fatalities per NHTSA CISS data. ESC and LKA reduce head-on frequency significantly. Educational approximation.',
   reforms:['Median barrier installation priority mapping','LKA intervention torque calibration increase','Emergency steering assist in pre-crash window']},
  {id:'pedestrian',name:'Pedestrian Strike',abbr:'PEDESTRIAN',col:'#FFD600',severity:'HIGH',
   desc:'Vehicle strikes an unprotected road user. Vehicle speed is the single decisive lethality factor above all other variables',
   defSpeed:50,defDist:40,defObs:'pedestrian',
   invNote:'Hood deformation clearance above engine hard points determines survivability for head impact. At 30 km/h fatality risk is approximately 10%. At 50 km/h it exceeds 45%. Hood deformation patterns are key forensic evidence.',
   ncapRef:'Euro NCAP Vulnerable Road User assessment is 20% of total star score. AEB Pedestrian reduces pedestrian fatalities by approximately 28% in real-world deployment data per Euro NCAP. Educational approximation.',
   reforms:['Pop-up hood actuator calibration for deformation height','External airbag coverage geometry expansion','AEB pedestrian detection training data expansion']},
  {id:'rollover',name:'Rollover',abbr:'ROLLOVER',col:'#9C6FFF',severity:'CRITICAL',
   desc:'Vehicle exceeds lateral stability limit and rotates. Roof structure and ejection prevention are the critical survival variables',
   defSpeed:100,defDist:80,defObs:'debris',
   invNote:'Roof crush depth versus occupant survival space is the primary structural metric. Curtain airbags must remain inflated for 5-7 seconds across multiple rotation events. Unbelted occupant ejection is almost always fatal.',
   ncapRef:'IIHS roof strength-to-weight ratio test requires SWR greater than 4.0 for Good rating. ESC reduces SUV rollovers by approximately 35% per NHTSA estimates. Educational approximation.',
   reforms:['Roof rail cross-section reinforcement','Curtain airbag inflation duration extension to 7s','ESC yaw threshold recalibration specific to SUV geometry']},
  {id:'departure',name:'Lane Departure',abbr:'DEPARTURE',col:'#00C2FF',severity:'HIGH',
   desc:'Vehicle leaves the roadway due to inattention or loss of control and strikes roadside barriers or structures',
   defSpeed:110,defDist:100,defObs:'debris',
   invNote:'LDW and LKA activation logs from the EDR are forensic evidence. Pre-departure window analysis shows driver gaze patterns consistent with distraction or drowsiness in approximately 78% of cases investigated.',
   ncapRef:'GSR2 (EU 2022) mandates LDW and LKA on all new vehicles. Lane departure is a precursor event in 33% of fatal EU crashes per ETSC data. Educational approximation.',
   reforms:['LKA intervention torque increase for sustained departure','DMS integration with LKA for earlier pre-alert','Roadside barrier design updates for modern impact angles']},
  {id:'ev_ice',name:'EV vs ICE Crash',abbr:'EV vs ICE',col:'#00E676',severity:'HIGH',
   desc:'Collision between electric and combustion vehicles. Weight differential, structural load paths, and post-crash HV safety are the focus',
   defSpeed:80,defDist:70,defObs:'oncoming',
   invNote:'Post-crash high-voltage isolation verification is the first-responder primary protocol. Thermal runaway risk window extends up to 72 hours. Battery pack intrusion below 80mm triggers mandatory isolation procedures.',
   ncapRef:'ISO 6469-3 governs post-crash EV electrical safety. Euro NCAP added EV-specific battery integrity assessment in 2020. Mass mismatch between EVs and small ICE vehicles is an emerging crash compatibility concern. Educational approximation.',
   reforms:['Pyrofuse activation threshold calibration','Rescue cut-point marking standardization across manufacturers','Battery pack side intrusion barrier engineering']},
  {id:'noncollision',name:'Non-Collision Event',abbr:'NON-COL',col:'#7A8099',severity:'LOW',
   desc:'Hard emergency braking, violent swerve, or medical episode without actual impact. Occupant forces occur without a crash event',
   defSpeed:90,defDist:250,defObs:'debris',
   invNote:'Seatbelt webbing marks on clothing without airbag deployment confirm occupant loading without impact. EDR analysis showing no steering correction is a key indicator of driver medical episode rather than distraction.',
   ncapRef:'EDR black box recording is mandatory under GSR2 (EU 2022). Analysis shows 40% of non-collision emergency interventions involve pre-tensioner activation. Relevant to AEB false-positive research. Educational approximation.',
   reforms:['DMS medical episode detection development','Automatic Safe Stop sequence for unresponsive driver','EDR data retention window extension for incident reconstruction']},
  {id:'loss_control',name:'Loss of Control',abbr:'SKID',col:'#5B8CFF',severity:'HIGH',
   desc:'Environmental conditions or evasive maneuver causes spin, aquaplaning, or skid that exceeds the vehicle recovery threshold',
   defSpeed:100,defDist:80,defObs:'debris',
   invNote:'ESC intervention logs show exact yaw rate at moment of divergence. Tire contact patch evidence reconstructs the slide path on the road surface. ABS modulation marks are absent in pure lateral slides, which distinguishes skid from brake-lock scenarios.',
   ncapRef:'ESC reduces fatal loss-of-control crashes by approximately 25% per NHTSA. Mandatory in the EU since 2014. Aquaplaning threshold varies significantly with tire tread depth, a key forensic finding. Educational approximation.',
   reforms:['ESC yaw sensitivity map revision','TCS recalibration for split-mu surface conditions','AEB integration for post-stabilization braking assist']},
  {id:'underride',name:'Underride Accident',abbr:'UNDERRIDE',col:'#CC3344',severity:'CRITICAL',
   desc:'Passenger car slides beneath a truck or trailer. The safety cage is completely bypassed by the geometric mismatch',
   defSpeed:80,defDist:100,defObs:'parked_car',
   invNote:'Underride guard structural failure is the critical forensic point. Height mismatch means crumple zones and front airbags are entirely irrelevant. The roof structure becomes the sole occupant survival determinant.',
   ncapRef:'IIHS front underride guard testing began in 2020. Rear underride guards are governed by FMVSS 223/224. Underride accounts for approximately 40% of truck-involved fatal passenger car crashes. Educational approximation.',
   reforms:['Front underride guard height standardization for trucks','Side underride guard mandatory installation','AEB inter-urban threshold reduction for truck rear-face detection']},
  {id:'animal',name:'Animal Collision',abbr:'ANIMAL',col:'#8B7014',severity:'MODERATE',
   desc:'Vehicle strikes a large animal at road speed. Airbag deployment threshold is often not met, yet windshield intrusion causes serious occupant injury',
   defSpeed:80,defDist:50,defObs:'animal',
   invNote:'Airbag deployment threshold may not be triggered for deer-sized animals, yet hood and windshield intrusion causes significant injury. Non-predictable animal movement trajectory is a key unsolved AEB detection challenge.',
   ncapRef:'Animal strikes cause approximately 200 fatalities annually in the US per NHTSA data. AEB systems are not currently tested against animal profiles in Euro NCAP protocols. Educational approximation.',
   reforms:['Camera training data expansion to animal movement profiles','Windshield reinforcement in the primary impact zone','Hood energy management calibration for sub-threshold impact masses']},
  {id:'building',name:'Building / Structure',abbr:'STRUCTURE',col:'#888899',severity:'CRITICAL',
   desc:'Vehicle impacts a rigid immovable structure. Maximum possible energy transfer with zero absorption by any opponent',
   defSpeed:70,defDist:50,defObs:'parked_car',
   invNote:'A rigid barrier produces the highest possible deceleration pulse. Unlike vehicle-to-vehicle crashes, no energy is absorbed by the opponent structure. The entire crash energy must be managed by the crumple zone alone.',
   ncapRef:'FWRB and SORB crash tests deliberately use rigid barriers to model worst-case conditions. Real-world examples include run-off-road events into bridge abutments and building facades. Educational approximation.',
   reforms:['Breakaway pole engineering standards for roadside','AEB barrier detection at oblique impact angles','Crumple zone energy budget revision for rigid-barrier scenarios']},
];

const VEHICLES = [
  {name:'2022 Toyota Yaris',type:'sedan',mass:1050,stars:5,src:'Euro NCAP',ev:false,aeb:true,note:'Best-in-class city car safety'},
  {name:'2021 Volkswagen Polo',type:'sedan',mass:1185,stars:5,src:'Euro NCAP',ev:false,aeb:true,note:'Strong occupant protection for its segment'},
  {name:'2022 Fiat 500e',type:'sedan',mass:1365,stars:5,src:'Euro NCAP',ev:true,aeb:true,note:'Urban EV with full active safety suite'},
  {name:'2022 Toyota Corolla',type:'sedan',mass:1375,stars:5,src:'Euro NCAP',ev:false,aeb:true,note:'Benchmark for reliability and safety'},
  {name:'2022 Skoda Octavia',type:'sedan',mass:1430,stars:5,src:'Euro NCAP',ev:false,aeb:true,note:'Popular in Central Europe — close to your region'},
  {name:'2022 Volkswagen Golf',type:'sedan',mass:1415,stars:5,src:'Euro NCAP',ev:false,aeb:true,note:'European safety benchmark across all segments'},
  {name:'2022 Honda Accord',type:'sedan',mass:1505,stars:5,src:'NHTSA',ev:false,aeb:true,note:'IIHS Top Safety Pick+ designation'},
  {name:'2022 BMW 3 Series',type:'sedan',mass:1615,stars:5,src:'Euro NCAP',ev:false,aeb:true,note:'High-performance sedan with full ADAS suite'},
  {name:'2022 Toyota RAV4',type:'suv',mass:1750,stars:5,src:'Euro NCAP',ev:false,aeb:true,note:'Consistent Euro NCAP high performer'},
  {name:'2023 Volvo XC60',type:'suv',mass:1921,stars:5,src:'Euro NCAP',ev:false,aeb:true,note:'Highest-rated safety SUV — City Safety AEB leader'},
  {name:'2022 Ford Explorer',type:'suv',mass:2050,stars:5,src:'NHTSA',ev:false,aeb:true,note:'Full-size American family SUV'},
  {name:'2022 BMW X5',type:'suv',mass:2085,stars:5,src:'NHTSA',ev:false,aeb:true,note:'Luxury SUV with advanced stability systems'},
  {name:'2023 Tesla Model 3',type:'sedan',mass:1831,stars:5,src:'Euro NCAP',ev:true,aeb:true,note:'Autopilot ADAS suite, top EV safety rating'},
  {name:'2023 Tesla Model Y',type:'suv',mass:2003,stars:5,src:'Euro NCAP',ev:true,aeb:true,note:'Best-selling EV globally in 2023'},
  {name:'2023 Hyundai IONIQ 6',type:'sedan',mass:1985,stars:5,src:'Euro NCAP',ev:true,aeb:true,note:'World Car of the Year 2023'},
  {name:'2024 Volvo EX90',type:'suv',mass:2600,stars:5,src:'Euro NCAP',ev:true,aeb:true,note:'Highest Euro NCAP score ever recorded (2024)'},
  {name:'2022 Ford F-150',type:'truck',mass:2200,stars:5,src:'NHTSA',ev:false,aeb:true,note:'Best-selling vehicle in North America'},
  {name:'2022 Mercedes Sprinter',type:'truck',mass:2450,stars:4,src:'Euro NCAP',ev:false,aeb:true,note:'Commercial van benchmark for safety'},
  {name:'2023 Honda CBR600RR',type:'motorcycle',mass:195,stars:0,src:'N/A',ev:false,aeb:false,note:'No passive protection. Rider gear is the only system.'},
  {name:'Volvo 9700 Coach (2022)',type:'bus',mass:14000,stars:0,src:'UNECE',ev:false,aeb:true,note:'Professional coach with rollover cage structure'},
];

function matchVehicle(cfg){
  const {vehicleType:vt,mass,isEV,sys}=cfg;
  let best=VEHICLES[0],top=-1;
  for(const v of VEHICLES){
    let s=0;
    if(v.type===vt) s+=40;
    else if((vt==='sedan'&&v.type==='suv')||(vt==='suv'&&v.type==='sedan')) s+=15;
    const mr=Math.abs(v.mass-mass)/Math.max(v.mass,mass);
    s+=Math.round(30*(1-Math.min(1,mr)));
    if(isEV&&v.ev) s+=20; else if(!isEV&&!v.ev) s+=10;
    if(sys.aeb===v.aeb) s+=5;
    if(s>top){top=s;best=v;}
  }
  return {vehicle:best,pct:Math.min(97,Math.round(top*0.98))};
}

function calcPhysics(cfg){
  const {speed,mass,tireCond,tireType,brakeEff,sys,pas,surface,weather,rtKey,obsDist,typology}=cfg;
  const mu0=SURF[surface]?.mu??0.8;
  const wx=WX[weather]??WX.clear;
  const rxT=(RT[rtKey]?.t??1.0)+wx.rtA;
  const v=speed/3.6;
  let mu=mu0*(tireCond/100)*(TIRE_MU[tireType]??1.0)*(brakeEff/100)*wx.muM;
  const hydro=mu0<=0.5&&speed>80&&!sys.tcs;
  if(hydro) mu*=0.15;
  mu=Math.max(mu,0.01);
  const vBrk=sys.aeb?v*0.45:v;
  const dR=v*rxT;
  const dBraw=(vBrk*vBrk)/(2*mu*G);
  const absRed=mu0<0.3?0.30:mu0<0.5?0.20:0.10;
  const dB=sys.abs?dBraw*(1-absRed):dBraw;
  const dTot=dR+dB;
  const absGn=sys.abs?dBraw-dB:0;
  let vImp=0;
  const dAvail=obsDist-dR;
  if(obsDist<dTot){
    if(dAvail>0){const vsq=vBrk*vBrk-2*mu*G*dAvail;vImp=vsq>0?Math.sqrt(vsq):0;}
    else{vImp=v;}
  }
  let crEff=pas.crumple;
  if(typology==='tbone'){vImp=v*0.88;crEff=Math.max(0,pas.crumple-3);}
  else if(typology==='headon'){vImp=Math.min(v*2,vImp*1.8);}
  else if(typology==='underride'){crEff=0;vImp=Math.min(v,vImp*1.15);}
  else if(typology==='rollover'){vImp*=0.65;}
  else if(typology==='noncollision'){vImp=0;}
  const vImpK=vImp*3.6;
  const hit=vImp>0.1;
  const KE=0.5*mass*vImp*vImp/1000;
  const crAbs=0.08*crEff;
  const dvK=vImp*(1-crAbs)*3.6;
  const bfr=dv=>{
    if(dv<10)return 0.001;if(dv<20)return 0.01;if(dv<30)return 0.05;
    if(dv<40)return 0.15;if(dv<50)return 0.30;if(dv<60)return 0.55;
    if(dv<70)return 0.75;if(dv<80)return 0.88;return 0.97;
  };
  let beltM=pas.belt?1.0:3.0;
  if(typology==='rollover'&&!pas.belt) beltM=5.0;
  const fRisk=Math.min(bfr(dvK)*beltM*(pas.frontBag?0.70:1)*(pas.sideBag?0.80:1),0.99);
  const effDv=dvK*(pas.belt?0.6:1)*(pas.frontBag?0.75:1);
  const inj=effDv>=65?'Fatal (unsurvivable)':effDv>=50?'Critical — multi-organ failure risk':effDv>=35?'Severe — internal bleeding, head trauma':effDv>=20?'Moderate — fractures, lacerations':effDv>=10?'Minor — whiplash, contusions':'None / Minor';
  const rl=x=>x<10?'LOW':x<25?'MODERATE':x<45?'HIGH':'CRITICAL';
  const headR=rl(dvK*(pas.frontBag?0.65:1)*(pas.belt?0.70:1));
  const chestR=rl(dvK*(pas.frontBag?0.70:1)*(pas.belt?0.60:1));
  const spineR=rl(dvK*(pas.head?0.65:1)*(pas.belt?0.70:1));
  const causes=[];
  if(hit){
    if(speed>80&&mu0<0.6)causes.push(`Speed (${speed} km/h) excessive for road surface`);
    if(tireCond<50)causes.push(`Worn tires reduced grip by ${Math.round((1-tireCond/100)*100)}%`);
    if(rxT>1.5)causes.push(`Elevated reaction time (${rxT.toFixed(1)} s)`);
    if(!sys.aeb)causes.push('No AEB — autonomous pre-braking unavailable');
    if(hydro)causes.push('Hydroplaning — near-frictionless surface detected');
    if(!causes.length)causes.push('Insufficient stopping distance at current speed and conditions');
  }
  const safeV=dAvail>0?Math.sqrt(2*mu*G*Math.max(0,dAvail))*(sys.aeb?1/0.45:1)*3.6:0;
  const recs=[];
  if(hit){
    if(safeV>5&&safeV<speed)recs.push(`Reduce speed to ${Math.round(safeV)} km/h`);
    if(!pas.belt)recs.push('Wear seatbelt — fatality risk multiplied without it');
    if(!sys.aeb)recs.push(`Enable AEB — reduces approach to ${Math.round(speed*0.45)} km/h`);
    if(!sys.abs)recs.push(`Enable ABS — saves ~${absGn.toFixed(0)} m braking distance`);
    if(tireCond<60)recs.push('Replace tires (condition critically low)');
  }
  const ctrs=[];
  if(sys.abs&&absGn>0.5)ctrs.push({ok:true,t:`ABS saved ${absGn.toFixed(1)} m braking distance`});
  if(sys.aeb&&hit)ctrs.push({ok:true,t:`AEB: approach speed ${speed} down to ${Math.round(speed*0.45)} km/h`});
  if(pas.crumple>=3&&hit)ctrs.push({ok:true,t:`Crumple zones (${pas.crumple}star) absorbed ${Math.round(crAbs*100)}% of KE`});
  if(!pas.belt)ctrs.push({ok:false,t:'No seatbelt — fatality risk multiplier applied'});
  if(!pas.frontBag)ctrs.push({ok:false,t:'No front airbags — head and chest unprotected'});
  return {mu,dR,dB,dTot,dAvail,vImp,vImpK,hit,KE,crAbs,dvK,fRisk,inj,headR,chestR,spineR,causes,recs,ctrs,absGn,rxT,obsDist,hydro,safeV};
}

const DEF={
  typology:'frontal',vehicleType:'sedan',speed:80,mass:1400,tireCond:80,
  tireType:'summer',brakeEff:90,isEV:false,occupants:2,occupantType:'adults',
  surface:'dry_asphalt',quality:90,geo:'straight',weather:'clear',
  obstacleType:'parked_car',obsDist:80,rtKey:'normal',
  sys:{abs:true,esc:true,tcs:false,aeb:false,lka:false,acc:false,bsd:false},
  pas:{belt:true,frontBag:true,sideBag:true,crumple:4,head:true,child:false},
};


/* ── UI ATOMS ── */
const rCol=l=>({LOW:C.green,MODERATE:C.yellow,HIGH:C.orange,CRITICAL:C.red}[l]??C.muted);
const dCol=r=>r<0.15?C.green:r<0.35?C.yellow:r<0.6?C.orange:C.red;

function Sld({label,val,min,max,step=1,unit='',set}){
  return(
    <div style={{marginBottom:11}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
        <span style={{color:C.muted,fontSize:11}}>{label}</span>
        <span style={{color:C.blue,fontSize:11,fontWeight:700,fontFamily:'monospace'}}>{val}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={val}
        onChange={e=>set(Number(e.target.value))}
        style={{width:'100%',accentColor:C.orange,cursor:'pointer',height:3,display:'block'}}/>
    </div>
  );
}

function Tog({label,val,set,accent=C.blue}){
  return(
    <div onClick={()=>set(!val)} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',cursor:'pointer',userSelect:'none'}}>
      <span style={{color:val?C.text:C.muted,fontSize:11.5,transition:'color 0.2s'}}>{label}</span>
      <div style={{
        width:33,height:18,borderRadius:9,flexShrink:0,
        background:val?accent:C.border,position:'relative',transition:'background 0.2s',
      }}>
        <div style={{width:12,height:12,borderRadius:6,background:'#fff',position:'absolute',
          top:3,left:val?17:3,transition:'left 0.2s'}}/>
      </div>
    </div>
  );
}

function Sel({label,val,opts,set}){
  return(
    <div style={{marginBottom:9}}>
      {label&&<div style={{color:C.muted,fontSize:11,marginBottom:3}}>{label}</div>}
      <select value={val} onChange={e=>set(e.target.value)} style={{
        width:'100%',background:'#0C0E14',color:C.text,border:`1px solid ${C.border}`,
        borderRadius:6,padding:'5px 8px',fontSize:11,cursor:'pointer',outline:'none',
      }}>
        {opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}

function Stars5({val,set}){
  return(
    <div style={{display:'flex',gap:3}}>
      {[1,2,3,4,5].map(n=>(
        <button key={n} onClick={()=>set(n)} style={{
          background:'none',border:'none',cursor:'pointer',
          color:n<=val?C.yellow:C.border,fontSize:20,padding:'1px 2px',lineHeight:1
        }}>★</button>
      ))}
    </div>
  );
}

function StepBar({steps,current,onStep}){
  return(
    <div style={{display:'flex',alignItems:'center',marginBottom:28}}>
      {steps.map((s,i)=>(
        <div key={i} style={{display:'flex',alignItems:'center',flex:i<steps.length-1?'1 1 0':'0 0 auto'}}>
          <button onClick={()=>i<current&&onStep(i)} style={{
            background:i===current?C.orange:i<current?C.faint:'transparent',
            color:i===current?'#fff':i<current?C.text:C.muted,
            border:`1px solid ${i===current?C.orange:i<current?C.border:C.faint}`,
            borderRadius:5,padding:'5px 12px',fontSize:9.5,fontWeight:700,letterSpacing:1,
            cursor:i<current?'pointer':'default',whiteSpace:'nowrap',
          }}>
            {i+1}. {s}
          </button>
          {i<steps.length-1&&(
            <div style={{flex:1,height:1,background:i<current?C.border:C.faint,minWidth:6}}/>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── CAMERA SVG HELPERS ── */
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

/* ── OBSTACLE SPRITE ── */
function ObsSprite({x,y,type}){
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

/* ── CAR SPRITE (top-down) ── */
function CarSprite({x,y,type,braking}){
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

/* ── CAMERA 1: TOP-DOWN ── */
function TopCam({res,prog,cfg,h=270}){
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

/* ── CAMERA 2: SIDE VIEW ── */
function SideCam({res,prog,cfg,h=270}){
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

/* ── CAMERA 3: DRIVER POV ── */
function FrontCam({res,prog,cfg,h=270}){
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

/* ── CAMERA 4: REAR CHASE ── */
function RearCam({res,prog,cfg,h=270}){
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

const CAM_DEFS=[
  {id:'top',label:'TOP-DOWN',col:C.orange,Comp:TopCam},
  {id:'side',label:'SIDE VIEW',col:C.blue,Comp:SideCam},
  {id:'front',label:'DRIVER POV',col:C.green,Comp:FrontCam},
  {id:'rear',label:'REAR CHASE',col:C.purple,Comp:RearCam},
];


/* ── SCREEN 1: LAUNCH ── */
function LaunchScreen({onStart}){
  return(
    <div style={{height:'100vh',background:C.bg,display:'flex',flexDirection:'column',
      alignItems:'center',justifyContent:'center',gap:18,padding:40,position:'relative',overflow:'hidden'}}>
      <svg style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',opacity:0.035,pointerEvents:'none'}} viewBox="0 0 1400 900" preserveAspectRatio="xMidYMid slice">
        {Array.from({length:23},(_,i)=><line key={`h${i}`} x1={0} y1={i*40} x2={1400} y2={i*40} stroke={C.orange} strokeWidth={0.5}/>)}
        {Array.from({length:36},(_,i)=><line key={`v${i}`} x1={i*40} y1={0} x2={i*40} y2={900} stroke={C.orange} strokeWidth={0.5}/>)}
      </svg>
      <div style={{position:'relative',textAlign:'center'}}>
        <div style={{color:C.orange,fontSize:10,fontWeight:800,letterSpacing:8,marginBottom:14,opacity:0.85}}>LEAF ACADEMY  ·  TERM E 2025-26  ·  CHASING HORSEPOWER PROGRAM</div>
        <div style={{color:C.text,fontSize:58,fontWeight:900,letterSpacing:5,lineHeight:1}}>CHASING</div>
        <div style={{color:C.orange,fontSize:58,fontWeight:900,letterSpacing:5,lineHeight:1.1,marginBottom:18}}>HORSEPOWER</div>
        <div style={{color:C.muted,fontSize:13,letterSpacing:5,marginBottom:6}}>CAR SAFETY SANDBOX SIMULATOR</div>
        <div style={{color:C.faint,fontSize:10.5,letterSpacing:1.5}}>Physics grounded in Euro NCAP · NHTSA · IIHS · WHO published data</div>
      </div>
      <div style={{color:C.muted,fontSize:12.5,maxWidth:520,textAlign:'center',lineHeight:1.85,margin:'6px 0 18px'}}>
        Explore how vehicle configuration, road conditions, and safety systems determine crash outcomes across 13 crash typologies. Investigate results the way real-world engineers and crash analysts do.
      </div>
      <button onClick={onStart} style={{
        background:C.orange,color:'#fff',border:'none',borderRadius:10,
        padding:'14px 56px',fontSize:14,fontWeight:800,letterSpacing:3,cursor:'pointer',
        boxShadow:`0 0 32px ${C.orange}55`,
      }}>LAUNCH SIMULATOR</button>
      <div style={{display:'flex',gap:36,marginTop:10}}>
        {[['13','Crash Typologies'],['20','Real Vehicles'],['4','Camera Angles'],['100%','Real Physics']].map(([n,l])=>(
          <div key={l} style={{textAlign:'center'}}>
            <div style={{color:C.orange,fontSize:20,fontWeight:900}}>{n}</div>
            <div style={{color:C.muted,fontSize:9.5,letterSpacing:1.5,marginTop:2}}>{l.toUpperCase()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── SCREEN 2: BUILDER ── */
function TypStep({cfg,set}){
  return(
    <div>
      <div style={{marginBottom:20}}>
        <div style={{color:C.text,fontSize:21,fontWeight:700,marginBottom:6}}>Choose Crash Typology</div>
        <div style={{color:C.muted,fontSize:12,lineHeight:1.6}}>Select the type of accident to simulate. Each typology applies different physics and generates unique investigative insights aligned with real-world crash analysis methods.</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,maxHeight:'58vh',overflowY:'auto',paddingRight:4}}>
        {TYPS.map(t=>{
          const sel=cfg.typology===t.id;
          const sevCol=t.severity==='CRITICAL'?C.red:t.severity==='HIGH'?C.orange:t.severity==='MODERATE'?C.yellow:C.green;
          return(
            <button key={t.id}
              onClick={()=>set(c=>({...c,typology:t.id,obstacleType:t.defObs,obsDist:t.defDist,speed:t.defSpeed}))}
              style={{
                background:sel?`${t.col}18`:C.panel,
                border:`1px solid ${sel?t.col:C.border}`,
                borderRadius:10,padding:'12px 14px',cursor:'pointer',textAlign:'left',
                transition:'all 0.15s',
              }}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:7}}>
                <span style={{color:t.col,fontSize:8.5,fontWeight:800,letterSpacing:1.5,
                  background:`${t.col}1A`,padding:'2px 7px',borderRadius:3}}>{t.abbr}</span>
                <span style={{color:sevCol,fontSize:9,fontWeight:700,letterSpacing:1}}>{t.severity}</span>
              </div>
              <div style={{color:C.text,fontSize:12,fontWeight:600,marginBottom:4,lineHeight:1.3}}>{t.name}</div>
              <div style={{color:C.muted,fontSize:10,lineHeight:1.45}}>{t.desc.length>82?t.desc.slice(0,82)+'…':t.desc}</div>
              {sel&&<div style={{marginTop:7,color:t.col,fontSize:9,fontWeight:700}}>✓ Selected</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function VehicleStep({cfg,set}){
  return(
    <div>
      <div style={{marginBottom:20}}>
        <div style={{color:C.text,fontSize:21,fontWeight:700,marginBottom:6}}>Vehicle Configuration</div>
        <div style={{color:C.muted,fontSize:12}}>Define the physical properties of the vehicle entering the scenario.</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:28}}>
        <div>
          <Sel label="Vehicle Type" val={cfg.vehicleType} set={v=>set(c=>({...c,vehicleType:v}))}
            opts={[['sedan','Sedan'],['suv','SUV'],['truck','Truck / Van'],['motorcycle','Motorcycle'],['bus','Bus / Coach']]}/>
          <Sld label="Initial Speed" val={cfg.speed} min={0} max={200} unit=" km/h" set={v=>set(c=>({...c,speed:v}))}/>
          <Sld label="Vehicle Mass" val={cfg.mass} min={150} max={18000} step={50} unit=" kg" set={v=>set(c=>({...c,mass:v}))}/>
          <Sld label="Tire Condition" val={cfg.tireCond} min={0} max={100} unit="%" set={v=>set(c=>({...c,tireCond:v}))}/>
          <Sld label="Brake Efficiency" val={cfg.brakeEff} min={10} max={100} unit="%" set={v=>set(c=>({...c,brakeEff:v}))}/>
          <Sel label="Tire Type" val={cfg.tireType} set={v=>set(c=>({...c,tireType:v}))}
            opts={[['summer','Summer (μ × 1.00)'],['allseason','All-Season (μ × 0.92)'],['winter','Winter (μ × 0.85)']]}/>
        </div>
        <div>
          <Sld label="Number of Occupants" val={cfg.occupants} min={1} max={5} set={v=>set(c=>({...c,occupants:Math.round(v)}))}/>
          <Sel label="Occupant Profile" val={cfg.occupantType} set={v=>set(c=>({...c,occupantType:v}))}
            opts={[['adults','Adults'],['elderly','Elderly'],['children','Children'],['mixed','Mixed']]}/>
          <div style={{marginTop:14}}>
            <Tog label="Electric Vehicle (EV)" val={cfg.isEV} set={v=>set(c=>({...c,isEV:v}))} accent={C.green}/>
            {cfg.isEV&&<div style={{marginTop:8,background:`${C.green}0D`,border:`1px solid ${C.green}25`,borderRadius:6,padding:'8px 10px'}}>
              <div style={{color:C.green,fontSize:9.5,fontWeight:700,marginBottom:3}}>EV ACTIVE</div>
              <div style={{color:C.muted,fontSize:9.5,lineHeight:1.5}}>HV battery isolation, thermal runaway risk, and post-crash 400-800V electrical safety protocols will be included in the results analysis.</div>
            </div>}
          </div>
          <div style={{marginTop:16,background:C.deep,borderRadius:8,padding:'12px 14px',border:`1px solid ${C.border}`}}>
            <div style={{color:C.muted,fontSize:9.5,letterSpacing:1.5,fontWeight:700,marginBottom:8}}>TYPOLOGY LOADED</div>
            {(()=>{const t=TYPS.find(x=>x.id===cfg.typology)||TYPS[0];return(
              <div>
                <div style={{color:t.col,fontSize:11,fontWeight:700,marginBottom:4}}>{t.name}</div>
                <div style={{color:C.muted,fontSize:10,lineHeight:1.5}}>{t.desc.slice(0,100)}…</div>
                <div style={{marginTop:6,color:C.muted,fontSize:10}}>Default speed: <span style={{color:C.blue,fontFamily:'monospace'}}>{t.defSpeed} km/h</span></div>
              </div>
            );})()}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConditionsStep({cfg,set}){
  return(
    <div>
      <div style={{marginBottom:20}}>
        <div style={{color:C.text,fontSize:21,fontWeight:700,marginBottom:6}}>Road, Weather and Scenario</div>
        <div style={{color:C.muted,fontSize:12}}>Define the environmental conditions and the obstacle configuration for this simulation.</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:28}}>
        <div>
          <div style={{color:C.orange,fontSize:9,fontWeight:800,letterSpacing:2,marginBottom:10}}>ROAD CONDITIONS</div>
          <Sel label="Road Surface" val={cfg.surface} set={v=>set(c=>({...c,surface:v}))}
            opts={Object.entries(SURF).map(([k,v])=>[k,`${v.label}  (μ = ${v.mu})`])}/>
          <Sld label="Road Quality" val={cfg.quality} min={0} max={100} unit="%" set={v=>set(c=>({...c,quality:v}))}/>
          <Sel label="Road Geometry" val={cfg.geo} set={v=>set(c=>({...c,geo:v}))}
            opts={[['straight','Straight'],['30','Curve 30°'],['60','Curve 60°'],['90','Curve 90°'],['downhill','Downhill 5%'],['uphill','Uphill 5%']]}/>
          <div style={{marginTop:16}}>
            <div style={{color:C.orange,fontSize:9,fontWeight:800,letterSpacing:2,marginBottom:10}}>WEATHER</div>
            <Sel label="Conditions" val={cfg.weather} set={v=>set(c=>({...c,weather:v}))}
              opts={Object.entries(WX).map(([k,v])=>[k,`${v.label}  (${v.vis}m vis.)`])}/>
            <div style={{background:C.deep,borderRadius:6,padding:'8px 10px',border:`1px solid ${C.border}`,marginTop:6}}>
              {[['μ modifier',`×${WX[cfg.weather].muM}`],['Visibility',`${WX[cfg.weather].vis} m`],
                ...(WX[cfg.weather].rtA>0?[['Reaction penalty',`+${WX[cfg.weather].rtA} s`]]:[])
              ].map(([k,v])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between',marginBottom:2}}>
                  <span style={{color:C.muted,fontSize:10}}>{k}</span>
                  <span style={{color:C.blue,fontFamily:'monospace',fontSize:10.5}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div style={{color:C.orange,fontSize:9,fontWeight:800,letterSpacing:2,marginBottom:10}}>SCENARIO</div>
          <Sel label="Obstacle Type" val={cfg.obstacleType} set={v=>set(c=>({...c,obstacleType:v}))}
            opts={[['parked_car','Parked Car'],['pedestrian','Pedestrian'],['oncoming','Oncoming Vehicle'],['animal','Large Animal']]}/>
          <Sld label="Obstacle Distance" val={cfg.obsDist} min={10} max={250} unit=" m" set={v=>set(c=>({...c,obsDist:v}))}/>
          <Sel label="Driver Reaction Time" val={cfg.rtKey} set={v=>set(c=>({...c,rtKey:v}))}
            opts={Object.entries(RT).map(([k,v])=>[k,v.label])}/>
          <div style={{marginTop:18,background:C.deep,borderRadius:8,padding:'12px 14px',border:`1px solid ${C.border}`}}>
            <div style={{color:C.muted,fontSize:9.5,letterSpacing:1.5,fontWeight:700,marginBottom:8}}>LIVE PHYSICS PREVIEW</div>
            {(()=>{
              const mu=SURF[cfg.surface].mu*(cfg.tireCond/100)*(TIRE_MU[cfg.tireType]||1)*((cfg.brakeEff||90)/100)*WX[cfg.weather].muM;
              const v=cfg.speed/3.6,rt=(RT[cfg.rtKey]?.t||1)+WX[cfg.weather].rtA;
              const dR=v*rt,dB=(v*v)/(2*Math.max(mu,0.01)*G),dT=dR+dB;
              return[
                ['Effective μ',mu.toFixed(3),C.blue],
                ['Reaction dist',`${dR.toFixed(1)} m`,C.yellow],
                ['Brake dist',`${dB.toFixed(1)} m`,C.orange],
                ['Total stop',`${dT.toFixed(1)} m`,dT>cfg.obsDist?C.red:C.green],
                ['Outcome',dT>cfg.obsDist?'COLLISION':'SAFE',dT>cfg.obsDist?C.red:C.green],
              ].map(([k,v,col])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <span style={{color:C.muted,fontSize:10}}>{k}</span>
                  <span style={{color:col,fontFamily:'monospace',fontSize:10.5,fontWeight:700}}>{v}</span>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

function SystemsStep({cfg,set}){
  return(
    <div>
      <div style={{marginBottom:20}}>
        <div style={{color:C.text,fontSize:21,fontWeight:700,marginBottom:6}}>Safety Systems</div>
        <div style={{color:C.muted,fontSize:12}}>Configure which active and passive safety technologies are equipped. Each system affects the physics calculation and the investigative results.</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:28}}>
        <div>
          <div style={{color:C.blue,fontSize:9,fontWeight:800,letterSpacing:2,marginBottom:12}}>ACTIVE SYSTEMS — Prevention</div>
          {[['abs','ABS — Anti-lock Braking'],['esc','ESC — Electronic Stability Control'],
            ['tcs','TCS — Traction Control'],['aeb','AEB — Auto Emergency Braking'],
            ['lka','LKA — Lane Keep Assist'],['acc','ACC — Adaptive Cruise Control'],
            ['bsd','BSD — Blind Spot Detection']].map(([k,l])=>(
            <Tog key={k} label={l} val={cfg.sys[k]} set={v=>set(c=>({...c,sys:{...c.sys,[k]:v}}))} accent={C.blue}/>
          ))}
          {cfg.sys.aeb&&<div style={{marginTop:10,background:`${C.blue}0D`,border:`1px solid ${C.blue}25`,borderRadius:6,padding:'8px 10px'}}>
            <div style={{color:C.blue,fontSize:9.5,fontWeight:700,marginBottom:2}}>AEB ACTIVE</div>
            <div style={{color:C.muted,fontSize:9.5}}>Approach speed will be reduced to {Math.round(cfg.speed*0.45)} km/h before driver braking begins.</div>
          </div>}
        </div>
        <div>
          <div style={{color:C.orange,fontSize:9,fontWeight:800,letterSpacing:2,marginBottom:12}}>PASSIVE SYSTEMS — Survival</div>
          <Tog label="Seatbelt" val={cfg.pas.belt} set={v=>set(c=>({...c,pas:{...c.pas,belt:v}}))}/>
          <Tog label="Front Airbags" val={cfg.pas.frontBag} set={v=>set(c=>({...c,pas:{...c.pas,frontBag:v}}))}/>
          <Tog label="Side / Curtain Airbags" val={cfg.pas.sideBag} set={v=>set(c=>({...c,pas:{...c.pas,sideBag:v}}))}/>
          <Tog label="Head Restraint (quality)" val={cfg.pas.head} set={v=>set(c=>({...c,pas:{...c.pas,head:v}}))}/>
          <Tog label="Child Safety Seat" val={cfg.pas.child} set={v=>set(c=>({...c,pas:{...c.pas,child:v}}))}/>
          <div style={{marginTop:12}}>
            <div style={{color:C.muted,fontSize:10.5,marginBottom:6}}>Crumple Zone Rating <span style={{color:C.faint,fontSize:9}}>(each star absorbs ~8% of KE)</span></div>
            <Stars5 val={cfg.pas.crumple} set={v=>set(c=>({...c,pas:{...c.pas,crumple:v}}))}/>
          </div>
          {!cfg.pas.belt&&<div style={{marginTop:12,background:`${C.red}12`,border:`1px solid ${C.red}30`,borderRadius:6,padding:'8px 10px'}}>
            <div style={{color:C.red,fontSize:9.5,fontWeight:700}}>No seatbelt — 3x fatality risk multiplier will apply</div>
          </div>}
        </div>
      </div>
    </div>
  );
}

const BUILDER_STEPS=['TYPOLOGY','VEHICLE','CONDITIONS','SYSTEMS'];

function BuilderScreen({cfg,set,onPreview}){
  const [step,setStep]=useState(0);
  const content=[
    <TypStep key="t" cfg={cfg} set={set}/>,
    <VehicleStep key="v" cfg={cfg} set={set}/>,
    <ConditionsStep key="c" cfg={cfg} set={set}/>,
    <SystemsStep key="s" cfg={cfg} set={set}/>,
  ];
  return(
    <div style={{height:'100vh',background:C.bg,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{background:C.panel,borderBottom:`1px solid ${C.border}`,padding:'12px 28px',display:'flex',alignItems:'center',gap:16,flexShrink:0}}>
        <div>
          <div style={{color:C.orange,fontSize:10,fontWeight:800,letterSpacing:3}}>CHASING HORSEPOWER</div>
          <div style={{color:C.muted,fontSize:9}}>Scenario Builder</div>
        </div>
        <div style={{flex:1}}/>
        <div style={{color:C.muted,fontSize:11}}>Step {step+1} of {BUILDER_STEPS.length}</div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'32px 10%'}}>
        <StepBar steps={BUILDER_STEPS} current={step} onStep={setStep}/>
        {content[step]}
      </div>
      <div style={{background:C.panel,borderTop:`1px solid ${C.border}`,padding:'14px 10%',display:'flex',justifyContent:'space-between',flexShrink:0}}>
        <button onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0} style={{
          background:'transparent',color:step===0?C.faint:C.text,border:`1px solid ${step===0?C.faint:C.border}`,
          borderRadius:7,padding:'9px 24px',fontSize:12,fontWeight:600,cursor:step===0?'default':'pointer',
        }}>← Back</button>
        {step<BUILDER_STEPS.length-1
          ?<button onClick={()=>{if(!cfg.typology){alert('Please select a typology first.');}else setStep(s=>s+1);}} style={{
            background:C.orange,color:'#fff',border:'none',borderRadius:7,padding:'9px 32px',
            fontSize:12,fontWeight:800,letterSpacing:1,cursor:'pointer',
          }}>Next →</button>
          :<button onClick={onPreview} style={{
            background:C.orange,color:'#fff',border:'none',borderRadius:7,padding:'9px 32px',
            fontSize:12,fontWeight:800,letterSpacing:1,cursor:'pointer',
          }}>Review Scenario →</button>
        }
      </div>
    </div>
  );
}

/* ── SCREEN 2.5: PREVIEW ── */
function PreviewScreen({cfg,onRun,onBack}){
  const {vehicle,pct}=useMemo(()=>matchVehicle(cfg),[cfg]);
  const typ=TYPS.find(t=>t.id===cfg.typology)||TYPS[0];
  const liveR=useMemo(()=>calcPhysics(cfg),[cfg]);
  const oc=liveR.hit?C.red:C.green;
  const Row=({k,v,col})=>(
    <div style={{display:'flex',justifyContent:'space-between',borderBottom:`1px solid ${C.border}`,padding:'5px 0'}}>
      <span style={{color:C.muted,fontSize:11}}>{k}</span>
      <span style={{color:col||C.text,fontFamily:'monospace',fontSize:11,fontWeight:600}}>{v}</span>
    </div>
  );
  return(
    <div style={{height:'100vh',background:C.bg,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{background:C.panel,borderBottom:`1px solid ${C.border}`,padding:'12px 28px',display:'flex',alignItems:'center',flexShrink:0}}>
        <div>
          <div style={{color:C.orange,fontSize:10,fontWeight:800,letterSpacing:3}}>CHASING HORSEPOWER</div>
          <div style={{color:C.muted,fontSize:9}}>Pre-Simulation Review</div>
        </div>
        <div style={{flex:1}}/>
        <button onClick={onBack} style={{background:'transparent',color:C.muted,border:`1px solid ${C.border}`,borderRadius:6,padding:'6px 16px',fontSize:11,cursor:'pointer'}}>← Edit Scenario</button>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'28px 8%'}}>
        <div style={{marginBottom:22,textAlign:'center'}}>
          <div style={{color:C.text,fontSize:22,fontWeight:700,marginBottom:4}}>Ready to Simulate</div>
          <div style={{color:C.muted,fontSize:12}}>Review your configuration before running the physics engine.</div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16,marginBottom:20}}>
          {/* Typology card */}
          <div style={{background:C.panel,border:`1px solid ${typ.col}40`,borderRadius:10,padding:18}}>
            <div style={{color:typ.col,fontSize:9,fontWeight:800,letterSpacing:2,marginBottom:8}}>CRASH TYPOLOGY</div>
            <div style={{color:typ.col,fontSize:11,fontWeight:800,letterSpacing:1,background:`${typ.col}18`,padding:'3px 8px',borderRadius:3,display:'inline-block',marginBottom:10}}>{typ.abbr}</div>
            <div style={{color:C.text,fontSize:15,fontWeight:700,marginBottom:6}}>{typ.name}</div>
            <div style={{color:C.muted,fontSize:10.5,lineHeight:1.55}}>{typ.desc}</div>
          </div>
          {/* Config summary */}
          <div style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:10,padding:18}}>
            <div style={{color:C.orange,fontSize:9,fontWeight:800,letterSpacing:2,marginBottom:10}}>YOUR CONFIGURATION</div>
            <Row k="Vehicle" v={cfg.vehicleType.charAt(0).toUpperCase()+cfg.vehicleType.slice(1)}/>
            <Row k="Speed" v={`${cfg.speed} km/h`} col={C.blue}/>
            <Row k="Mass" v={`${cfg.mass} kg`}/>
            <Row k="Surface" v={SURF[cfg.surface].label}/>
            <Row k="Weather" v={WX[cfg.weather].label}/>
            <Row k="Reaction" v={RT[cfg.rtKey].label}/>
            <Row k="Obstacle dist" v={`${cfg.obsDist} m`}/>
            <div style={{marginTop:10}}>
              <div style={{color:C.muted,fontSize:10,marginBottom:5}}>Active systems</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                {Object.entries(cfg.sys).filter(([,v])=>v).map(([k])=>(
                  <span key={k} style={{background:`${C.blue}18`,color:C.blue,fontSize:8.5,fontWeight:700,padding:'2px 6px',borderRadius:3,letterSpacing:1}}>{k.toUpperCase()}</span>
                ))}
              </div>
            </div>
          </div>
          {/* Vehicle match */}
          <div style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:10,padding:18}}>
            <div style={{color:C.orange,fontSize:9,fontWeight:800,letterSpacing:2,marginBottom:10}}>REAL-WORLD EQUIVALENT</div>
            <div style={{color:C.text,fontSize:14,fontWeight:700,marginBottom:4,lineHeight:1.3}}>{vehicle.name}</div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
              <span style={{color:C.yellow,fontSize:12}}>{vehicle.stars>0?'★'.repeat(vehicle.stars):'—'}</span>
              {vehicle.stars>0&&<span style={{color:C.muted,fontSize:9}}>{vehicle.src}</span>}
            </div>
            <div style={{color:C.muted,fontSize:10,marginBottom:3}}>Mass: <span style={{color:C.text}}>{vehicle.mass.toLocaleString()} kg</span></div>
            <div style={{color:C.muted,fontSize:10,marginBottom:8}}>AEB: <span style={{color:vehicle.aeb?C.green:C.red}}>{vehicle.aeb?'Standard':'Not fitted'}</span></div>
            <div style={{color:C.muted,fontSize:10,lineHeight:1.5,fontStyle:'italic'}}>{vehicle.note}</div>
            <div style={{marginTop:8,background:C.deep,borderRadius:5,padding:'5px 8px'}}>
              <span style={{color:C.muted,fontSize:9}}>Configuration match: </span>
              <span style={{color:C.orange,fontSize:10,fontWeight:700}}>{pct}%</span>
            </div>
          </div>
        </div>
        {/* Predicted outcome */}
        <div style={{background:`${oc}0E`,border:`1px solid ${oc}35`,borderRadius:10,padding:'18px 24px',marginBottom:20,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <div style={{color:oc,fontSize:18,fontWeight:800,letterSpacing:2,marginBottom:4}}>{liveR.hit?'● PREDICTED: COLLISION':'✓ PREDICTED: SAFE STOP'}</div>
            <div style={{color:C.muted,fontSize:11}}>
              {liveR.hit?`Impact at approximately ${liveR.vImpK.toFixed(1)} km/h · ${liveR.KE.toFixed(0)} kJ kinetic energy`:`Vehicle stops ${(liveR.dTot-cfg.obsDist).toFixed(1)} m before the obstacle`}
            </div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{color:C.muted,fontSize:9,letterSpacing:1}}>TOTAL STOP DIST</div>
            <div style={{color:oc,fontFamily:'monospace',fontSize:22,fontWeight:900}}>{liveR.dTot.toFixed(1)}m</div>
            <div style={{color:C.muted,fontSize:9}}>obstacle at {cfg.obsDist}m</div>
          </div>
        </div>
        <div style={{textAlign:'center'}}>
          <button onClick={onRun} style={{
            background:C.orange,color:'#fff',border:'none',borderRadius:10,
            padding:'14px 60px',fontSize:15,fontWeight:800,letterSpacing:3,cursor:'pointer',
            boxShadow:`0 0 28px ${C.orange}44`,
          }}>▶  RUN SIMULATION</button>
          <div style={{color:C.muted,fontSize:10,marginTop:10}}>The physics engine will animate 4 camera angles in real time</div>
        </div>
      </div>
    </div>
  );
}


/* ── SCREEN 3: SIMULATION ── */
function SimulationScreen({cfg,res,prog,running,onResults,onBack}){
  const [activeCam,setActiveCam]=useState('top');
  const ActiveComp=CAM_DEFS.find(c=>c.id===activeCam)?.Comp||TopCam;
  const done=prog>=0.98&&!running;
  return(
    <div style={{height:'100vh',background:C.bg,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.35;transform:scale(0.7)}}`}</style>
      <div style={{background:C.panel,borderBottom:`1px solid ${C.border}`,padding:'10px 18px',display:'flex',alignItems:'center',gap:14,flexShrink:0}}>
        <div>
          <div style={{color:C.orange,fontSize:10,fontWeight:800,letterSpacing:3}}>CHASING HORSEPOWER</div>
          <div style={{color:C.muted,fontSize:9}}>Live Simulation — {TYPS.find(t=>t.id===cfg.typology)?.name||'Scenario'}</div>
        </div>
        <div style={{flex:1}}/>
        {running&&<div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:8,height:8,borderRadius:'50%',background:C.orange,animation:'pulse 0.8s infinite'}}/>
          <span style={{color:C.orange,fontSize:11,fontWeight:700,letterSpacing:2}}>SIMULATING</span>
        </div>}
        {done&&<button onClick={onResults} style={{
          background:C.orange,color:'#fff',border:'none',borderRadius:7,
          padding:'8px 22px',fontSize:12,fontWeight:800,letterSpacing:2,cursor:'pointer',
        }}>VIEW FULL ANALYSIS →</button>}
        {!running&&<button onClick={onBack} style={{background:'transparent',color:C.muted,border:`1px solid ${C.border}`,borderRadius:6,padding:'7px 14px',fontSize:11,cursor:'pointer'}}>← Edit</button>}
      </div>
      <div style={{flex:1,display:'flex',overflow:'hidden'}}>
        {/* Main camera */}
        <div style={{flex:1,display:'flex',flexDirection:'column',minWidth:0}}>
          <div style={{flex:1,background:'#080A0E',borderRight:`1px solid ${C.border}`,overflow:'hidden',display:'flex',alignItems:'center'}}>
            <ActiveComp res={res} prog={prog} cfg={cfg} h={420}/>
          </div>
          {/* Progress and physics strip */}
          <div style={{background:C.panel,borderTop:`1px solid ${C.border}`,borderRight:`1px solid ${C.border}`,padding:'10px 18px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
              <span style={{color:C.muted,fontSize:9,letterSpacing:1.5,fontWeight:700}}>SIMULATION PROGRESS</span>
              <span style={{color:C.muted,fontSize:9,fontFamily:'monospace'}}>{Math.round(prog*100)}%</span>
            </div>
            <div style={{background:C.deep,borderRadius:3,height:4,overflow:'hidden',marginBottom:10}}>
              <div style={{background:`linear-gradient(90deg,${C.blue},${C.orange})`,width:`${prog*100}%`,height:'100%',transition:'width 0.05s'}}/>
            </div>
            {res&&<div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
              {[
                ['Reaction Dist',`${res.dR.toFixed(1)} m`,C.yellow],
                ['Brake Dist',`${res.dB.toFixed(1)} m`,C.orange],
                ['Impact speed',res.hit?`${res.vImpK.toFixed(1)} km/h`:'None',res.hit?C.red:C.green],
                ['Delta-V cabin',res.hit?`${res.dvK.toFixed(1)} km/h`:'None',res.hit?C.red:C.green],
              ].map(([l,v,col])=>(
                <div key={l} style={{textAlign:'center',background:C.deep,borderRadius:5,padding:'5px 4px'}}>
                  <div style={{color:C.muted,fontSize:8.5}}>{l}</div>
                  <div style={{color:col,fontFamily:'monospace',fontSize:12,fontWeight:800,marginTop:1}}>{v}</div>
                </div>
              ))}
            </div>}
          </div>
        </div>
        {/* Camera thumbnails */}
        <div style={{width:220,background:C.panel,display:'flex',flexDirection:'column',overflow:'auto',flexShrink:0}}>
          <div style={{padding:'10px 12px 6px',color:C.muted,fontSize:9,fontWeight:700,letterSpacing:2}}>CAMERA ANGLES</div>
          {CAM_DEFS.map(cam=>{
            const isActive=activeCam===cam.id;
            return(
              <div key={cam.id} onClick={()=>setActiveCam(cam.id)}
                style={{
                  border:`2px solid ${isActive?cam.col:'transparent'}`,
                  borderRadius:6,margin:'4px 8px',overflow:'hidden',cursor:'pointer',
                  transition:'border-color 0.15s',background:'#080A0E',flexShrink:0,
                }}>
                <cam.Comp res={res} prog={prog} cfg={cfg} h={115}/>
                <div style={{
                  background:isActive?`${cam.col}20`:C.deep,
                  padding:'5px 8px',borderTop:`1px solid ${isActive?cam.col:C.border}`,
                  display:'flex',justifyContent:'space-between',alignItems:'center',
                }}>
                  <span style={{color:isActive?cam.col:C.muted,fontSize:8.5,fontWeight:700,letterSpacing:1}}>{cam.label}</span>
                  {isActive&&<span style={{color:cam.col,fontSize:8,fontWeight:700}}>ACTIVE</span>}
                </div>
              </div>
            );
          })}
          {done&&res&&(
            <div style={{margin:'12px 8px',background:res.hit?`${C.red}10`:`${C.green}10`,border:`1px solid ${res.hit?C.red:C.green}35`,borderRadius:7,padding:'10px 12px'}}>
              <div style={{color:res.hit?C.red:C.green,fontSize:12,fontWeight:800,marginBottom:4}}>{res.hit?'● COLLISION':'✓ SAFE STOP'}</div>
              {res.hit&&<>
                <div style={{color:C.muted,fontSize:9.5,marginBottom:2}}>Impact: <span style={{color:C.red,fontFamily:'monospace'}}>{res.vImpK.toFixed(1)} km/h</span></div>
                <div style={{color:C.muted,fontSize:9.5}}>Fatality risk: <span style={{color:dCol(res.fRisk),fontFamily:'monospace'}}>{Math.round(res.fRisk*100)}%</span></div>
              </>}
              {!res.hit&&<div style={{color:C.muted,fontSize:9.5}}>Stopped {(res.dTot-cfg.obsDist).toFixed(1)}m short</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── SCREEN 4: RESULTS ── */
function ResultsScreen({cfg,res,onRestart,onChange,onNew}){
  const [physOpen,setPhysOpen]=useState(false);
  if(!res)return null;
  const typ=TYPS.find(t=>t.id===cfg.typology)||TYPS[0];
  const {vehicle}=matchVehicle(cfg);
  const oc=res.hit?C.red:C.green;
  const fc=dCol(res.fRisk);

  const genNarrative=()=>{
    if(!res.hit){
      return `Vehicle came to a controlled stop ${(res.dTot-cfg.obsDist).toFixed(1)} m before the obstacle. ${cfg.sys.aeb?'AEB pre-braking contributed significantly to the early deceleration. ':''} ${cfg.sys.abs?'ABS maintained steering authority throughout the braking phase. ':''}No passive systems were deployed. Field investigators would find no deformation evidence and clean tire contact patches indicating controlled braking. EDR data would show nominal deceleration curve within design parameters.`;
    }
    const sev=res.vImpK>80?'high-energy':res.vImpK>40?'moderate-energy':'low-energy';
    return `Field investigation indicates a ${sev} ${typ.name.toLowerCase()} at ${res.vImpK.toFixed(1)} km/h. ${!cfg.sys.aeb?'No pre-crash autonomous braking was available. ':'AEB partially reduced approach speed before impact. '}${!cfg.pas.belt?'Absence of seatbelt restraint will be cited as a primary contributing factor to occupant injury severity. ':'Seatbelt webbing marks on the occupant\'s clothing confirm belt engagement at crash onset. '}${res.hydro?'Tire contact patch evidence is consistent with aquaplaning: uniform surface contact with no lateral deformation, indicating near-zero friction at impact. ':''}Crumple zone deformation depth is consistent with the recorded impact velocity. ${typ.invNote}`;
  };

  const Box=({title,col,children})=>(
    <div style={{background:C.panel,border:`1px solid ${col||C.border}`,borderRadius:10,padding:18,marginBottom:14}}>
      <div style={{color:col||C.orange,fontSize:9,fontWeight:800,letterSpacing:2,marginBottom:12}}>{title}</div>
      {children}
    </div>
  );
  const Row=({k,v,col})=>(
    <div style={{display:'flex',justifyContent:'space-between',borderBottom:`1px solid ${C.border}`,padding:'5px 0'}}>
      <span style={{color:C.muted,fontSize:10.5}}>{k}</span>
      <span style={{color:col||C.text,fontFamily:'monospace',fontSize:11,fontWeight:600}}>{v}</span>
    </div>
  );

  return(
    <div style={{height:'100vh',background:C.bg,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{background:C.panel,borderBottom:`1px solid ${C.border}`,padding:'11px 24px',display:'flex',alignItems:'center',gap:14,flexShrink:0}}>
        <div>
          <div style={{color:C.orange,fontSize:10,fontWeight:800,letterSpacing:3}}>CHASING HORSEPOWER</div>
          <div style={{color:C.muted,fontSize:9}}>Incident Analysis Report — {typ.name}</div>
        </div>
        <div style={{flex:1}}/>
        <button onClick={onRestart} style={{background:C.orange,color:'#fff',border:'none',borderRadius:6,padding:'7px 18px',fontSize:11,fontWeight:700,cursor:'pointer',letterSpacing:1}}>▶ Simulate Again</button>
        <button onClick={onChange} style={{background:'transparent',color:C.blue,border:`1px solid ${C.blue}55`,borderRadius:6,padding:'7px 18px',fontSize:11,fontWeight:600,cursor:'pointer'}}>← Edit Scenario</button>
        <button onClick={onNew} style={{background:'none',border:'none',color:C.muted,fontSize:10.5,cursor:'pointer',padding:'7px 4px',textDecoration:'underline',textUnderlineOffset:3}}>New Simulation</button>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'24px 8%'}}>
        {/* Header classification */}
        <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:16,marginBottom:20}}>
          <div style={{background:`${oc}0E`,border:`1px solid ${oc}35`,borderRadius:10,padding:'18px 22px'}}>
            <div style={{color:C.muted,fontSize:9,letterSpacing:2,fontWeight:700,marginBottom:6}}>INCIDENT CLASSIFICATION</div>
            <div style={{color:oc,fontSize:22,fontWeight:900,letterSpacing:2,marginBottom:4}}>{res.hit?'● COLLISION':'✓ SAFE STOP'}</div>
            <div style={{display:'flex',gap:10,alignItems:'center'}}>
              <span style={{color:typ.col,fontSize:9,fontWeight:800,background:`${typ.col}18`,padding:'2px 8px',borderRadius:3,letterSpacing:1}}>{typ.abbr}</span>
              <span style={{color:C.muted,fontSize:11}}>{typ.name}</span>
              {res.hit&&<span style={{color:fc,fontSize:9,fontWeight:700,letterSpacing:1}}>FATALITY RISK {Math.round(res.fRisk*100)}%</span>}
            </div>
          </div>
          <div style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:10,padding:'18px 22px',minWidth:200}}>
            <div style={{color:C.muted,fontSize:9,letterSpacing:2,fontWeight:700,marginBottom:8}}>REAL-WORLD EQUIVALENT</div>
            <div style={{color:C.text,fontSize:13,fontWeight:700,marginBottom:4}}>{vehicle.name}</div>
            <div style={{color:C.yellow,fontSize:11,marginBottom:4}}>{vehicle.stars>0?'★'.repeat(vehicle.stars):'-'} <span style={{color:C.muted,fontSize:9}}>{vehicle.src}</span></div>
            <div style={{color:C.muted,fontSize:9.5}}>{vehicle.note}</div>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          <div>
            {/* Crash dynamics */}
            <Box title="CRASH DYNAMICS">
              <Row k="Approach speed" v={`${cfg.speed} km/h`}/>
              <Row k="Reaction distance" v={`${res.dR.toFixed(1)} m`} col={C.yellow}/>
              <Row k="Brake distance" v={`${res.dB.toFixed(1)} m`} col={C.orange}/>
              <Row k="Total stopping distance" v={`${res.dTot.toFixed(1)} m`} col={res.hit?C.red:C.green}/>
              {res.hit&&<>
                <Row k="Impact speed" v={`${res.vImpK.toFixed(1)} km/h`} col={C.red}/>
                <Row k="Kinetic energy at impact" v={`${res.KE.toFixed(0)} kJ`} col={C.orange}/>
                <Row k="Crumple zone absorbed" v={`${Math.round(res.crAbs*100)}%`} col={C.blue}/>
                <Row k="Delta-V transmitted to cabin" v={`${res.dvK.toFixed(1)} km/h`} col={C.red}/>
              </>}
            </Box>

            {/* Safety systems verdict */}
            {res.ctrs.length>0&&<Box title="SAFETY SYSTEMS VERDICT">
              {res.ctrs.map((c,i)=>(
                <div key={i} style={{display:'flex',gap:8,padding:'5px 0',borderBottom:`1px solid ${C.border}`}}>
                  <span style={{color:c.ok?C.green:C.red,fontSize:13,flexShrink:0}}>{c.ok?'✓':'✗'}</span>
                  <span style={{color:C.text,fontSize:10.5,lineHeight:1.5}}>{c.t}</span>
                </div>
              ))}
            </Box>}

            {/* Accident causes */}
            {res.hit&&res.causes.length>0&&<Box title="CONTRIBUTING FACTORS" col={C.red}>
              {res.causes.map((c,i)=>(
                <div key={i} style={{display:'flex',gap:8,padding:'5px 0',borderBottom:`1px solid ${C.border}`}}>
                  <span style={{color:C.red,fontSize:11,flexShrink:0,fontWeight:700}}>{i+1}.</span>
                  <span style={{color:C.text,fontSize:10.5,lineHeight:1.5}}>{c}</span>
                </div>
              ))}
            </Box>}

            {/* Survival recommendations */}
            {res.hit&&res.recs.length>0&&<Box title="TO SURVIVE THIS SCENARIO" col={C.green}>
              {res.recs.map((r,i)=>(
                <div key={i} style={{display:'flex',gap:8,padding:'5px 0',borderBottom:`1px solid ${C.border}`}}>
                  <span style={{color:C.green,fontSize:11,flexShrink:0}}>→</span>
                  <span style={{color:C.text,fontSize:10.5,lineHeight:1.5}}>{r}</span>
                </div>
              ))}
            </Box>}
          </div>

          <div>
            {/* Injury risk */}
            {res.hit&&<Box title="INJURY RISK ASSESSMENT" col={fc}>
              <div style={{marginBottom:12}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                  <span style={{color:C.muted,fontSize:10.5}}>Fatality Risk</span>
                  <span style={{color:fc,fontSize:11,fontWeight:700}}>{Math.round(res.fRisk*100)}%</span>
                </div>
                <div style={{background:C.deep,borderRadius:3,height:6,overflow:'hidden'}}>
                  <div style={{background:`linear-gradient(90deg,${C.green},${C.yellow},${C.orange},${C.red})`,width:`${res.fRisk*100}%`,height:'100%'}}/>
                </div>
              </div>
              {[['Head Injury',res.headR],['Chest Injury',res.chestR],['Spinal Risk',res.spineR]].map(([l,v])=>(
                <div key={l} style={{display:'flex',justifyContent:'space-between',borderBottom:`1px solid ${C.border}`,padding:'4px 0'}}>
                  <span style={{color:C.muted,fontSize:10.5}}>{l}</span>
                  <span style={{color:rCol(v),fontSize:10.5,fontWeight:700,letterSpacing:1}}>{v}</span>
                </div>
              ))}
              <div style={{marginTop:10,background:`${fc}10`,borderRadius:6,padding:'8px 10px'}}>
                <div style={{color:C.muted,fontSize:9.5}}>Overall Classification</div>
                <div style={{color:fc,fontSize:11,fontWeight:700,marginTop:2}}>{res.inj}</div>
              </div>
            </Box>}

            {/* Field investigation narrative */}
            <Box title="FIELD INVESTIGATION NOTES">
              <div style={{color:C.text,fontSize:10.5,lineHeight:1.75}}>{genNarrative()}</div>
            </Box>

            {/* Real-world parallel */}
            <Box title="REAL-WORLD PARALLEL" col={C.blue}>
              <div style={{color:C.text,fontSize:10.5,lineHeight:1.75,marginBottom:10}}>{typ.ncapRef}</div>
              {typ.reforms.length>0&&<>
                <div style={{color:C.blue,fontSize:9,fontWeight:800,letterSpacing:2,marginTop:10,marginBottom:6}}>WHAT THIS CRASH INFORMS</div>
                {typ.reforms.map((r,i)=>(
                  <div key={i} style={{display:'flex',gap:7,marginBottom:5}}>
                    <span style={{color:C.blue,fontSize:11,flexShrink:0}}>→</span>
                    <span style={{color:C.text,fontSize:10.5}}>{r}</span>
                  </div>
                ))}
              </>}
            </Box>

            {/* Physics deep dive */}
            <div style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:10,overflow:'hidden',marginBottom:14}}>
              <button onClick={()=>setPhysOpen(o=>!o)} style={{
                width:'100%',background:'transparent',border:'none',cursor:'pointer',
                padding:'14px 18px',display:'flex',justifyContent:'space-between',alignItems:'center',
              }}>
                <span style={{color:C.muted,fontSize:9,fontWeight:800,letterSpacing:2}}>PHYSICS DEEP DIVE</span>
                <span style={{color:C.muted,fontSize:12}}>{physOpen?'▲':'▼'}</span>
              </button>
              {physOpen&&<div style={{padding:'0 18px 16px',borderTop:`1px solid ${C.border}`}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:12}}>
                  {[
                    ['Effective μ',res.mu.toFixed(4)],['Reaction time',`${res.rxT.toFixed(2)} s`],
                    ['v approach',`${cfg.speed/3.6*1000/1000|0} m/s`],['AEB vBrake',cfg.sys.aeb?`${(cfg.speed/3.6*0.45).toFixed(1)} m/s`:'N/A'],
                    ['d_reaction',`${res.dR.toFixed(2)} m`],['d_brake (raw)',`${(res.dB+res.absGn).toFixed(2)} m`],
                    ['ABS saving',`${res.absGn.toFixed(2)} m`],['d_brake (final)',`${res.dB.toFixed(2)} m`],
                    ['v_impact',`${res.vImp.toFixed(2)} m/s`],['KE',`${res.KE.toFixed(1)} kJ`],
                    ['Crumple abs',`${Math.round(res.crAbs*100)}%`],['ΔV to cabin',`${res.dvK.toFixed(1)} km/h`],
                    ['Base fatality',`bfr(${res.dvK.toFixed(0)})=${(([d])=>d<10?0.001:d<20?0.01:d<30?0.05:d<40?0.15:d<50?0.30:d<60?0.55:d<70?0.75:d<80?0.88:0.97)([res.dvK])}`,],
                    ['Final risk',`${(res.fRisk*100).toFixed(1)}%`],
                  ].map(([k,v],i)=>(
                    <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'3px 0',borderBottom:`1px solid ${C.faint}`}}>
                      <span style={{color:C.muted,fontSize:9.5}}>{k}</span>
                      <span style={{color:C.text,fontFamily:'monospace',fontSize:9.5}}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── MAIN APP ── */
export default function App(){
  const [screen,setScreen]=useState('launch');
  const [cfg,setCfg]=useState(DEF);
  const [res,setRes]=useState(null);
  const [prog,setProg]=useState(0);
  const [running,setRunning]=useState(false);
  const rafRef=useRef(null);
  const t0=useRef(null);

  const runSim=(config)=>{
    const r=calcPhysics(config||cfg);
    setRes(r);setProg(0);setRunning(true);t0.current=null;
    const D=4400;
    const tick=ts=>{
      if(!t0.current)t0.current=ts;
      const p=Math.min((ts-t0.current)/D,1);
      setProg(p);
      if(p<1)rafRef.current=requestAnimationFrame(tick);
      else setRunning(false);
    };
    if(rafRef.current)cancelAnimationFrame(rafRef.current);
    rafRef.current=requestAnimationFrame(tick);
  };

  useEffect(()=>(()=>{if(rafRef.current)cancelAnimationFrame(rafRef.current);}),[]);

  if(screen==='launch') return <LaunchScreen onStart={()=>setScreen('builder')}/>;
  if(screen==='builder') return <BuilderScreen cfg={cfg} set={setCfg} onPreview={()=>setScreen('preview')}/>;
  if(screen==='preview') return <PreviewScreen cfg={cfg} onRun={()=>{runSim(cfg);setScreen('simulation');}} onBack={()=>setScreen('builder')}/>;
  if(screen==='simulation') return <SimulationScreen cfg={cfg} res={res} prog={prog} running={running} onResults={()=>setScreen('results')} onBack={()=>setScreen('preview')}/>;
  if(screen==='results') return <ResultsScreen cfg={cfg} res={res}
    onRestart={()=>{setScreen('simulation');runSim(cfg);}}
    onChange={()=>{setRes(null);setProg(0);setScreen('builder');}}
    onNew={()=>{setCfg(DEF);setRes(null);setProg(0);setScreen('launch');}}/>;
  return <LaunchScreen onStart={()=>setScreen('builder')}/>;
}
