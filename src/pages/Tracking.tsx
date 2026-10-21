import {useApp} from '../store';
import {Card,Badge,fmt} from '../ui';
const W=600,H=360,LAT0=28.65,LNG0=77.18,SPAN=0.06;
export default function Tracking(){
  const {s,refreshLoc,status}=useApp();
  const x=(s.loc.lng-LNG0)/SPAN*W,y=(LAT0-s.loc.lat)/SPAN*H;
  return <div className="grid two">
    <Card title="Schematic demo map" right={<Badge v="Demo location"/>}>
      <svg viewBox={`0 0 ${W} ${H}`} className="map" role="img" aria-label={`Map marker at ${s.loc.lat.toFixed(4)}, ${s.loc.lng.toFixed(4)}`}>
        <rect width={W} height={H} fill="#10193a"/>
        {Array.from({length:9}).map((_,i)=><line key={'v'+i} x1={i*75} y1="0" x2={i*75} y2={H} stroke="#232d55"/>)}
        {Array.from({length:6}).map((_,i)=><line key={'h'+i} x1="0" y1={i*72} x2={W} y2={i*72} stroke="#232d55"/>)}
        <path d="M0 250 Q200 180 350 220 T600 120" stroke="#3b4a86" strokeWidth="6" fill="none"/>
        <path d="M120 0 L260 360" stroke="#3b4a86" strokeWidth="4" fill="none"/>
        <circle cx={x} cy={y} r="22" fill="#8b5cf633"/><circle cx={x} cy={y} r="9" fill="#8b5cf6" stroke="#fff" strokeWidth="2"/>
        <text x="10" y={H-10} fill="#8e98bd" fontSize="12">Delhi demo area (28.59–28.65 N, 77.18–77.24 E)</text>
      </svg>
      <p className="note">Offline schematic map positioned from the same coordinates shown at right. Leaflet + OpenStreetMap tiles are planned future work. Not a real user's GPS.</p>
    </Card>
    <Card title="Location details">
      <div className="li"><span>Tracking status</span><Badge v={status==='DEVICE OFFLINE'?'Offline':'Online'}/></div>
      <div className="li"><span>Latitude</span><b>{s.loc.lat.toFixed(5)}</b></div>
      <div className="li"><span>Longitude</span><b>{s.loc.lng.toFixed(5)}</b></div>
      <div className="li"><span>Last updated</span><b>{fmt(s.loc.updated)}</b></div>
      <div className="li"><span>Source</span><b>Simulated</b></div>
      <button className="btn primary" onClick={refreshLoc}>Simulate location update</button>
    </Card>
  </div>;
}
