import {useState} from 'react';
import {useApp} from '../store';
import {Card,Badge,Modal,fmt} from '../ui';
export default function Dashboard({go}:{go(p:string):void}){
  const {s,risk,status,activeAlerts,emergency,sos,simulate}=useApp();
  const [ask,setAsk]=useState(false);
  return <>
    <p className="note">DEMO MODE: all data below is simulated sample data. No hardware, GPS, SMS or calls are connected.</p>
    <div className="grid">
      <Card title="Safety status"><div className="big"><Badge v={status}/></div></Card>
      <Card title="Band connection"><div className="big"><Badge v={s.device.connected?'Connected':'Disconnected'}/></div></Card>
      <Card title="Battery"><div className="big">{s.device.battery}%</div></Card>
      <Card title="Threat level"><div className="big"><Badge v={risk.level}/> <small>{risk.score}/100</small></div></Card>
      <Card title="Active alerts"><div className="big">{activeAlerts}</div></Card>
      <Card title="Last known location"><div>{s.loc.lat.toFixed(4)}, {s.loc.lng.toFixed(4)}</div><small>Demo, Delhi · {fmt(s.loc.updated)}</small></Card>
      <Card title="Last sensor update"><div>{fmt(s.device.lastSensor)}</div><small>Simulated</small></Card>
    </div>
    <div className="card sosbox">
      <button className="sos" disabled={emergency} onClick={()=>setAsk(true)} aria-label="Trigger SOS emergency">{emergency?'SOS ACTIVE':'SOS'}</button>
      <div><b>Emergency SOS</b><p className="note">Creates a simulated emergency incident. No real alert is sent.</p>
        <button className="btn" onClick={()=>simulate('high')}>DEMO SCENARIO: generate sample high-risk event</button></div>
    </div>
    <div className="grid two">
      <Card title="Recent incidents" right={<button className="link" onClick={()=>go('history')}>View all</button>}>
        {s.incidents.slice(0,4).map(i=><div className="li" key={i.id}><span>{i.id} · {i.type}<br/><small>{fmt(i.time)}</small></span><Badge v={i.status}/></div>)}
      </Card>
      <Card title="Recent sensor activity (simulated)">
        {s.events.slice(0,5).map((e,k)=><div className="li" key={k}><span>{e.msg}<br/><small>{fmt(e.t)}</small></span></div>)}
      </Card>
      <Card title="Emergency contacts" right={<button className="link" onClick={()=>go('contacts')}>Manage</button>}>
        {s.contacts.length===0?<p className="note">No contacts configured.</p>:[...s.contacts].sort((a,b)=>a.priority-b.priority).map(c=><div className="li" key={c.id}><span>{c.name}<br/><small>{c.relation}</small></span><small>P{c.priority}</small></div>)}
      </Card>
    </div>
    {ask&&<Modal title="Confirm emergency SOS?" onClose={()=>setAsk(false)}>
      <p>This will create a <b>simulated</b> emergency incident and set status to EMERGENCY. No real SMS or phone call is sent.</p>
      <div className="row"><button className="btn" onClick={()=>setAsk(false)}>Cancel</button>
      <button className="btn danger" onClick={()=>{sos();setAsk(false);}}>Confirm SOS</button></div></Modal>}
  </>;
}
