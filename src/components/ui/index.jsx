import { C } from '../../data/colors.js';
import { useBreakpoint } from '../../lib/breakpoint.js';

export function Sld({label,val,min,max,step=1,unit='',set}){
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

export function Tog({label,val,set,accent=C.blue}){
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

export function Sel({label,val,opts,set}){
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

export function Stars5({val,set}){
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

export function StepBar({steps,current,onStep}){
  const bp = useBreakpoint();
  const mobile = bp === 'mobile';
  return(
    <div style={{display:'flex',alignItems:'center',marginBottom:28}}>
      {steps.map((s,i)=>(
        <div key={i} style={{display:'flex',alignItems:'center',flex:i<steps.length-1?'1 1 0':'0 0 auto'}}>
          <button onClick={()=>i<current&&onStep(i)} style={{
            background:i===current?C.orange:i<current?C.faint:'transparent',
            color:i===current?'#fff':i<current?C.text:C.muted,
            border:`1px solid ${i===current?C.orange:i<current?C.border:C.faint}`,
            borderRadius:5,padding: mobile ? '4px 8px' : '5px 12px',
            fontSize:9.5,fontWeight:700,letterSpacing:1,
            cursor:i<current?'pointer':'default',whiteSpace:'nowrap',
          }}>
            {mobile ? `${i+1}` : `${i+1}. ${s}`}
          </button>
          {i<steps.length-1&&(
            <div style={{flex:1,height:1,background:i<current?C.border:C.faint,minWidth:6}}/>
          )}
        </div>
      ))}
    </div>
  );
}

export function Box({title,col,children}){
  return(
    <div style={{background:C.panel,border:`1px solid ${col||C.border}`,borderRadius:10,padding:18,marginBottom:14}}>
      <div style={{color:col||C.orange,fontSize:9,fontWeight:800,letterSpacing:2,marginBottom:12}}>{title}</div>
      {children}
    </div>
  );
}
