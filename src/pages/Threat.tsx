import {useApp} from '../store';
import {RULES} from '../risk';
import {Card,Badge,Sim,fmt} from '../ui';
export default function Threat(){
  const {s,risk,simulate,emergency}=useApp();
  const n=s.trend.length,pts=s.trend.map((v,i)=>`${(i*300/Math.max(1,n-1)).toFixed(1)},${100-v}`).join(' ');
  const cards:[string,number][]=[['Accelerometer / motion',s.sensors.motion],['Sudden movement / impact',s.sensors.impact],['Inactivity / unusual movement',s.sensors.inactivity]];
  return <>
    <p className="note">This is a rule-based demonstration of the planned threat-detection logic, not a trained AI model. Actual AI-based multimodal inference is future work. It cannot predict assaults or guarantee safety.</p>
    <div className="grid">
      <Card title="Overall risk" right={<Sim/>}><div className="big"><Badge v={risk.level}/> {risk.score}/100</div>
        <div className="bar"><i style={{width:risk.score+'%'}} className={risk.level==='HIGH'?'r':risk.level==='MEDIUM'?'a':'g'}/></div></Card>
      {cards.map(([l,v])=><Card key={l} title={l} right={<Sim/>}><div className="big">{v}<small>/100</small></div><div className="bar"><i style={{width:v+'%'}}/></div></Card>)}
      <Card title="SOS activation"><div className="big"><Badge v={emergency?'EMERGENCY':'NORMAL'}/></div><small>Manual SOS always triggers the emergency workflow.</small></Card>
    </div>
    <div className="card row"><b>Demo controls:</b>
      <button className="btn" onClick={()=>simulate('normal')}>Simulate normal movement</button>
      <button className="btn" onClick={()=>simulate('unusual')}>Simulate unusual movement</button>
      <button className="btn danger" onClick={()=>simulate('high')}>Simulate high-risk scenario</button></div>
    <div className="grid two">
      <Card title="Why this risk level?"><ul>{risk.reasons.map((r,i)=><li key={i}>{r}</li>)}</ul>
        <small>Rules (editable in src/risk.ts): weights {JSON.stringify(RULES.weights)}, MEDIUM ≥ {RULES.mediumAt}, HIGH ≥ {RULES.highAt}.</small></Card>
      <Card title="Risk trend (simulated)"><svg viewBox="0 0 300 100" className="chart" role="img" aria-label="Risk score trend">
        <line x1="0" x2="300" y1={100-RULES.mediumAt} y2={100-RULES.mediumAt} stroke="#f59e0b" strokeDasharray="4"/>
        <line x1="0" x2="300" y1={100-RULES.highAt} y2={100-RULES.highAt} stroke="#ef4444" strokeDasharray="4"/>
        <polyline points={pts} fill="none" stroke="#8b5cf6" strokeWidth="2"/></svg></Card>
    </div>
    <Card title="Recent detection events">{s.events.length===0?<p className="note">No events yet.</p>:s.events.slice(0,8).map((e,i)=><div className="li" key={i}><span>{e.msg}</span><small>{fmt(e.t)}</small></div>)}</Card>
  </>;
}
