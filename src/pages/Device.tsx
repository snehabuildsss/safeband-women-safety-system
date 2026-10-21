import {useApp} from '../store';
import {Card,Badge,Sim,fmt} from '../ui';
export default function Device(){
  const {s,toggleConnection}=useApp();const on=s.device.connected,m=on?'Online':'Offline';
  const rows:[string,string][]=[['Device name','SafeBand Prototype'],['Identifier','SB-DEMO-0001'],['Last heartbeat',fmt(s.device.lastHeartbeat)],
    ['Battery',s.device.battery+'%'],['Battery voltage',on?(3.3+s.device.battery/100*0.9).toFixed(2)+' V':'—'],['Signal strength',on?'-62 dBm':'—'],['Firmware','v0.1-demo']];
  return <>
    <p className="note">All telemetry is simulated until real hardware is connected.</p>
    <div className="grid two">
      <Card title="Device" right={<Sim/>}><div className="li"><span>Connection</span><Badge v={on?'Connected':'Disconnected'}/></div>
        {rows.map(([k,v])=><div className="li" key={k}><span>{k}</span><b>{v}</b></div>)}
        <button className="btn primary" onClick={toggleConnection}>{on?'Simulate disconnection':'Simulate reconnection'}</button></Card>
      <Card title="Modules" right={<Sim/>}>
        {['Motion sensor','GPS module','Communication module'].map(k=><div className="li" key={k}><span>{k}</span><Badge v={m}/></div>)}
        <p className="note">{on?'All modules reporting simulated OK status.':'Band offline: modules unreachable and alerts cannot be relayed.'}</p></Card>
    </div></>;
}
