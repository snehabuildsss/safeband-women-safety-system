import {useState} from 'react';
import {LayoutDashboard,MapPin,ShieldAlert,Cpu,Users,History as Hist,Bell,ShieldCheck} from 'lucide-react';
import {useApp} from './store';
import {Badge} from './ui';
import Dashboard from './pages/Dashboard';
import Tracking from './pages/Tracking';
import Threat from './pages/Threat';
import Device from './pages/Device';
import Contacts from './pages/Contacts';
import History from './pages/History';
const NAV=[['dashboard','Dashboard',LayoutDashboard],['tracking','Live Tracking',MapPin],['threat','Threat Detection',ShieldAlert],['device','Device Monitoring',Cpu],['contacts','Emergency Contacts',Users],['history','Incident History',Hist]] as const;
export default function App(){
  const [page,setPage]=useState<string>('dashboard');
  const {s,emergency,activeAlerts,resolveEmergency,resetDemo}=useApp();
  const title=NAV.find(n=>n[0]===page)![1];
  return <div className="app">
    <aside className="side"><div className="logo"><ShieldCheck color="#8b5cf6"/>SafeBand</div>
      <nav className="nav" aria-label="Main">{NAV.map(([k,l,I])=><button key={k} className={page===k?'on':''} onClick={()=>setPage(k)}><I size={18}/>{l}</button>)}</nav>
      <button className="btn reset" onClick={()=>{if(confirm('Restore original demo data?'))resetDemo();}}>Reset demo data</button></aside>
    <div className="main">
      <header className="top"><h1>{title}</h1><div className="row">
        <span className="badge p">DEMO MODE</span><Badge v={s.device.connected?'Connected':'Disconnected'}/>
        <span className="bell" aria-label={`${activeAlerts} active alerts`}><Bell size={18}/>{activeAlerts>0&&<i>{activeAlerts}</i>}</span></div></header>
      {emergency&&<div className="banner" role="alert"><div><b>EMERGENCY ACTIVE (simulated)</b>
        <div>Simulated notifications queued for: {s.contacts.length?[...s.contacts].sort((a,b)=>a.priority-b.priority).map(c=>`${c.name} (${c.phone})`).join(', '):'no contacts configured'}. No real SMS or call is sent.</div></div>
        <button className="btn" onClick={resolveEmergency}>Resolve emergency</button></div>}
      <main className="content">
        {page==='dashboard'&&<Dashboard go={setPage}/>}{page==='tracking'&&<Tracking/>}{page==='threat'&&<Threat/>}
        {page==='device'&&<Device/>}{page==='contacts'&&<Contacts/>}{page==='history'&&<History/>}
      </main></div></div>;
}
