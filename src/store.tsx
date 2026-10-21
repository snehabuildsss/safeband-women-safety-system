import {createContext,useContext,useEffect,useState} from 'react';
import type {ReactNode} from 'react';
import type {State,Incident,Contact,Risk,Severity,Loc} from './types';
import {assess,SCENARIOS,SCENARIO_LABEL} from './risk';
import type {ScenarioKey} from './risk';

const KEY='safeband.demo.v1';
const ago=(h:number)=>new Date(Date.now()-h*3600e3).toISOString();
export const locStr=(lat:number,lng:number)=>`${lat.toFixed(4)}, ${lng.toFixed(4)} (demo, Delhi)`;
const seed=():State=>({
  incidents:[
    {id:'INC-1001',time:ago(72),type:'SOS Emergency',severity:'CRITICAL',location:locStr(28.6562,77.241),description:'Sample SOS from demo data.',status:'Resolved'},
    {id:'INC-1002',time:ago(30),type:'Threat Detection (Demo)',severity:'HIGH',location:locStr(28.6139,77.209),description:'Sample impact plus unusual motion.',status:'Resolved'},
    {id:'INC-1003',time:ago(8),type:'Threat Detection (Demo)',severity:'MEDIUM',location:locStr(28.6129,77.2295),description:'Sample unusual motion pattern.',status:'Resolved'},
    {id:'INC-1004',time:ago(2),type:'Device Event',severity:'LOW',location:locStr(28.6129,77.2295),description:'Sample brief band disconnection.',status:'Active'},
  ],
  contacts:[
    {id:'c1',name:'Asha Verma (demo)',relation:'Mother',phone:'+91 90000 00001',priority:1},
    {id:'c2',name:'Rohan Mehta (demo)',relation:'Brother',phone:'+91 90000 00002',priority:2},
    {id:'c3',name:'Campus Security (demo)',relation:'Security',phone:'+91 90000 00003',priority:3},
  ],
  device:{connected:true,battery:78,lastHeartbeat:ago(0.01),lastSensor:ago(0.01)},
  sensors:SCENARIOS.normal,
  loc:{lat:28.6129,lng:77.2295,updated:ago(0.02)},
  trend:[8,10,9,12,9,11,10,9,12,10,9,9],
  events:[{t:ago(2),msg:'Seed data loaded (demo).'}],
});
function load():State{
  try{
    const raw=localStorage.getItem(KEY);
    if(raw){const p=JSON.parse(raw);
      if(p&&Array.isArray(p.incidents)&&Array.isArray(p.contacts)&&Array.isArray(p.trend)&&Array.isArray(p.events)&&p.device&&p.sensors&&p.loc) return p as State;}
  }catch{}
  return seed();
}
const push=(p:State,type:string,severity:Severity,description:string):State=>{
  const last=p.incidents[0];
  if(last&&last.type===type&&last.description===description&&Date.now()-new Date(last.time).getTime()<2000) return p; // blocks double-click duplicates
  const location=p.loc.source==='browser'?`${p.loc.lat.toFixed(4)}, ${p.loc.lng.toFixed(4)} (browser location)`:locStr(p.loc.lat,p.loc.lng);
  return {...p,
    incidents:[{id:'INC-'+(1001+p.incidents.length),time:new Date().toISOString(),type,severity,location,description,status:'Active'} as Incident,...p.incidents],
    events:[{t:new Date().toISOString(),msg:`${type}: ${description}`},...p.events].slice(0,25)};
};
const log=(p:State,msg:string):State=>({...p,events:[{t:new Date().toISOString(),msg},...p.events].slice(0,25)});
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));

interface Ctx{
  s:State;risk:Risk;emergency:boolean;status:string;activeAlerts:number;
  sos():void;resolveIncident(id:string):void;resolveEmergency():void;
  simulate(k:ScenarioKey):void;resetSim():void;voiceEvent(phrase:string,real:boolean):void;setLocation(l:Loc):void;resetLocation():void;toggleConnection():void;refreshLoc():void;
  saveContact(c:Contact):void;deleteContact(id:string):void;resetDemo():void;
}
const C=createContext<Ctx>(null as unknown as Ctx);
export const useApp=()=>useContext(C);

export function Provider({children}:{children:ReactNode}){
  const [s,setS]=useState<State>(load);
  useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(s));}catch{}},[s]);
  const emergency=s.incidents.some(i=>i.status==='Active'&&i.type==='SOS Emergency');
  const risk=assess(s.sensors,emergency);
  const status=emergency?'EMERGENCY':!s.device.connected?'DEVICE OFFLINE':risk.level==='HIGH'?'HIGH RISK':'NORMAL';
  const v:Ctx={
    s,risk,emergency,status,activeAlerts:s.incidents.filter(i=>i.status==='Active').length,
    sos:()=>setS(p=>p.incidents.some(i=>i.status==='Active'&&i.type==='SOS Emergency')?p:push(p,'SOS Emergency','CRITICAL','Manual SOS activated (simulated; no real SMS/call sent).')),
    resolveIncident:id=>setS(p=>{const t=p.incidents.find(i=>i.id===id);const sensors=t&&t.type.startsWith('Voice Trigger')?{...p.sensors,voice:0}:p.sensors;return log({...p,sensors,incidents:p.incidents.map(i=>i.id===id?{...i,status:'Resolved'}:i)},`${id} resolved.`);}),
    resolveEmergency:()=>setS(p=>log({...p,incidents:p.incidents.map(i=>i.type==='SOS Emergency'&&i.status==='Active'?{...i,status:'Resolved'}:i)},'Emergency resolved.')),
    simulate:k=>setS(p=>{
      const sensors=SCENARIOS[k],r=assess(sensors);
      let n:State={...p,sensors,trend:[...p.trend.slice(-11),r.score],device:{...p.device,lastSensor:new Date().toISOString()}};
      n=k==='normal'||r.level==='LOW'?log(n,'Simulated normal movement: risk LOW.'):push(n,SCENARIO_LABEL[k],r.level,`${r.level} risk (${r.score}/100). ${r.reasons.join(' ')} [DEMO DATA]`);
      return n;}),
    toggleConnection:()=>setS(p=>{
      const connected=!p.device.connected;
      const n={...p,device:{...p.device,connected,lastHeartbeat:connected?new Date().toISOString():p.device.lastHeartbeat}};
      return log(n,connected?'Band reconnected (simulated).':'Band disconnected (simulated).');}),
    refreshLoc:()=>setS(p=>log({...p,loc:{lat:clamp(p.loc.lat+(Math.random()-.5)*.006,28.59,28.65),lng:clamp(p.loc.lng+(Math.random()-.5)*.006,77.18,77.24),updated:new Date().toISOString()}},'Simulated location update.')),
    saveContact:c=>setS(p=>({...p,contacts:p.contacts.some(x=>x.id===c.id)?p.contacts.map(x=>x.id===c.id?c:x):[...p.contacts,c]})),
    deleteContact:id=>setS(p=>({...p,contacts:p.contacts.filter(c=>c.id!==id)})),
    resetSim:()=>setS(p=>log({...p,sensors:SCENARIOS.normal},'Simulation reset: sensors back to normal (incidents and contacts untouched).')),
    voiceEvent:(phrase,real)=>setS(p=>{
      const sensors={...p.sensors,voice:100},r=assess(sensors);
      const n:State={...p,sensors,trend:[...p.trend.slice(-11),r.score]};
      return push(n,real?'Voice Trigger (Browser Speech Recognition)':'Voice Trigger (Simulated)','MEDIUM',`Phrase detected: "${phrase}". ${real?'Heard by browser speech recognition; no audio stored.':'SIMULATED detection; no audio captured. [DEMO DATA]'}`);}),
    setLocation:l=>setS(p=>({...p,loc:l})),
    resetLocation:()=>setS(p=>log({...p,loc:{lat:28.6129,lng:77.2295,updated:new Date().toISOString()}},'Switched back to demo location (Delhi).')),
    resetDemo:()=>setS(seed()),
  };
  return <C.Provider value={v}>{children}</C.Provider>;
}
