import { SURF, TIRE_MU } from '../data/surfaces.js';
import { WX } from '../data/weather.js';
import { RT } from '../data/reactions.js';

const G = 9.81;

export function calcPhysics(cfg){
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

export function genNarrative(res,cfg,typ){
  if(!res.hit){
    return `Vehicle came to a controlled stop ${(res.dTot-cfg.obsDist).toFixed(1)} m before the obstacle. ${cfg.sys.aeb?'AEB pre-braking contributed significantly to the early deceleration. ':''} ${cfg.sys.abs?'ABS maintained steering authority throughout the braking phase. ':''}No passive systems were deployed. Field investigators would find no deformation evidence and clean tire contact patches indicating controlled braking. EDR data would show nominal deceleration curve within design parameters.`;
  }
  const sev=res.vImpK>80?'high-energy':res.vImpK>40?'moderate-energy':'low-energy';
  return `Field investigation indicates a ${sev} ${typ.name.toLowerCase()} at ${res.vImpK.toFixed(1)} km/h. ${!cfg.sys.aeb?'No pre-crash autonomous braking was available. ':'AEB partially reduced approach speed before impact. '}${!cfg.pas.belt?'Absence of seatbelt restraint will be cited as a primary contributing factor to occupant injury severity. ':'Seatbelt webbing marks on the occupant\'s clothing confirm belt engagement at crash onset. '}${res.hydro?'Tire contact patch evidence is consistent with aquaplaning: uniform surface contact with no lateral deformation, indicating near-zero friction at impact. ':''}Crumple zone deformation depth is consistent with the recorded impact velocity. ${typ.invNote}`;
}
