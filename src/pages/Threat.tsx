import {useEffect,useState} from 'react';
import {useApp} from '../store';
import {RULES} from '../risk';
import {useSpeech} from '../useSpeech';
import {SCREAM_CLASSIFIER_STATUS,NEXT_STEPS} from '../audioClassifier';
import {Card,Badge,Sim,fmt} from '../ui';
const PK='safeband.phrases.v1',DEF=['Help me','Save me','Emergency','Call the police'];
const loadP=():string[]=>{try{const p=JSON.parse(localStorage.getItem(PK)||'null');if(Array.isArray(p)&&p.every(x=>typeof x==='string'))return p;}catch{}return DEF;};
export default function Threat(){
  const {s,risk,simulate,resetSim,emergency,voiceEvent,resolveIncident}=useApp();
  const [phrases,setPhrases]=useState<string[]>(loadP);const [np,setNp]=useState('');
  useEffect(()=>{try{localStorage.setItem(PK,JSON.stringify(phrases));}catch{}},[phrases]);
  const sp=useSpeech(phrases,p=>voiceEvent(p,true));
  const addP=()=>{const v=np.trim().slice(0,40);if(v&&!phrases.some(x=>x.toLowerCase()===v.toLowerCase()))setPhrases([...phrases,v]);setNp('');};
  const n=s.trend.length,pts=s.trend.map((v,i)=>`${(i*300/Math.max(1,n-1)).toFixed(1)},${100-v}`).join(' ');
  const audio=s.sensors.audio??0;
  const cards:[string,number][]=[['Accelerometer / motion',s.sensors.motion],['Sudden movement / impact',s.sensors.impact],['Inactivity / unusual movement',s.sensors.inactivity],['Audio distress signal',audio]];
  const activeVoice=s.incidents.find(i=>i.status==='Active'&&i.type.startsWith('Voice Trigger'));
  const listening=sp.status==='listening'||sp.status==='starting';
  return <>
    <p className="note">This is a rule-based demonstration of the planned threat-detection logic, not a trained AI model. Actual AI-based multimodal inference is future work. It cannot predict assaults or guarantee safety.</p>
    <Card title="Struggle & scream simulator" right={<Sim/>}>
      <div className="sim-grid">
        <button className="sim-btn" onClick={()=>simulate('struggle')}>SIMULATE STRUGGLE<br/><small>Preset: high motion, moderate impact</small></button>
        <button className="sim-btn" onClick={()=>simulate('scream')}>SIMULATE SCREAM<br/><small>Preset: audio signal 85%</small></button>
        <button className="sim-btn hot" onClick={()=>simulate('both')}>SIMULATE STRUGGLE + SCREAM<br/><small>Both signals plus combination bonus</small></button>
      </div>
      <div className="row" style={{marginTop:12}}>
        <button className="btn" onClick={resetSim}>RESET SIMULATION</button>
        <small>Resets sensor values only. Contacts and incident records are kept.</small></div>
      <p className="note">Scream confidence now: <b>{audio}%</b> <Sim/> a fixed preset, not the output of a real AI model. All incidents created here are marked DEMO DATA.</p>
    </Card>
    <div className="grid">
      <Card title="Overall risk" right={<Sim/>}><div className="big"><Badge v={risk.level}/> {risk.score}/100</div>
        <div className="bar"><i style={{width:risk.score+'%'}} className={risk.level==='HIGH'?'r':risk.level==='MEDIUM'?'a':'g'}/></div></Card>
      {cards.map(([l,v])=><Card key={l} title={l} right={<Sim/>}><div className="big">{v}<small>/100</small></div><div className="bar"><i style={{width:v+'%'}}/></div></Card>)}
      <Card title="Voice trigger"><div className="big"><Badge v={(s.sensors.voice??0)>0?'MEDIUM':'LOW'}/></div><small>{(s.sensors.voice??0)>0?'Phrase detected':'No phrase detected'}</small></Card>
      <Card title="SOS activation"><div className="big"><Badge v={emergency?'EMERGENCY':'NORMAL'}/></div><small>Manual SOS always triggers the emergency workflow.</small></Card>
    </div>
    <div className="card row"><b>Quick demo controls:</b>
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
    <Card title="Voice trigger phrases">
      <div>{phrases.map(p=><span className="chip" key={p}><button onClick={()=>voiceEvent(p,false)} aria-label={`Simulate hearing ${p}`}>“{p}” · simulate</button><button onClick={()=>setPhrases(phrases.filter(x=>x!==p))} aria-label={`Remove phrase ${p}`}>✕</button></span>)}</div>
      {phrases.length===0&&<p className="note">No phrases configured.</p>}
      <div className="row" style={{margin:'8px 0'}}><input style={{maxWidth:260,margin:0}} placeholder="Add trigger phrase" aria-label="New trigger phrase" value={np} onChange={e=>setNp(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addP()}/><button className="btn" onClick={addP}>Add phrase</button>
        <button className="btn" onClick={()=>{setPhrases(DEF);}}>Restore defaults</button></div>
      {activeVoice&&<div className="li"><span>Test event active: {activeVoice.id}</span><button className="btn primary" onClick={()=>resolveIncident(activeVoice.id)}>Dismiss / resolve test event</button></div>}
      <div className="row" style={{marginTop:8}}>
        {!listening?<button className="btn primary" onClick={sp.start}>START LISTENING</button>:<button className="btn danger" onClick={sp.stop}>STOP LISTENING</button>}
        <Badge v={sp.status==='listening'?'MIC ON':sp.status==='starting'?'REQUESTING':'MIC OFF'}/>{sp.msg&&<small role="status">{sp.msg}</small>}</div>
      {sp.heard&&<small>Last heard (not stored): “{sp.heard}”</small>}
      <p className="note">Real listening uses your browser’s Web Speech API, which recognises words, not screams, and works only in some browsers (e.g. Chrome/Edge). Depending on the browser, audio may be sent to an external speech service. The microphone starts only after you click Start, and no audio is recorded or kept by SafeBand. No messages or calls are sent.</p>
    </Card>
    <Card title="Real scream classification" right={<Badge v={SCREAM_CLASSIFIER_STATUS}/>}>
      <p className="note">Not implemented. Scream confidence anywhere in this app is a simulated preset. Voice recognition above is not scream detection. A real classifier would be imperfect, with false positives and missed events.</p>
      <ul>{NEXT_STEPS.map((x,i)=><li key={i}><small>{x}</small></li>)}</ul></Card>
    <Card title="Recent detection events">{s.events.length===0?<p className="note">No events yet.</p>:s.events.slice(0,8).map((e,i)=><div className="li" key={i}><span>{e.msg}</span><small>{fmt(e.t)}</small></div>)}</Card>
  </>;
}
