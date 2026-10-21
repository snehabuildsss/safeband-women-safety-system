import {useEffect,useRef,useState} from 'react';
import {useApp} from '../store';
import {Card,Badge,fmt} from '../ui';
const KEY=import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string|undefined;
type G='idle'|'loading'|'denied'|'unsupported'|'timeout'|'error'|'tracking';
const OPT:PositionOptions={enableHighAccuracy:true,timeout:15000,maximumAge:0};
export default function Tracking(){
  const {s,refreshLoc,setLocation,resetLocation}=useApp();
  const [g,setG]=useState<G>('idle');const [msg,setMsg]=useState('');const [tick,setTick]=useState(0);const [schem,setSchem]=useState(false);
  const watch=useRef<number|null>(null);
  const clear=()=>{if(watch.current!==null&&'geolocation' in navigator){navigator.geolocation.clearWatch(watch.current);}watch.current=null;};
  useEffect(()=>{const t=setInterval(()=>setTick(x=>x+1),15000);return()=>{clearInterval(t);clear();};},[]);
  const ok=(p:GeolocationPosition)=>setLocation({lat:p.coords.latitude,lng:p.coords.longitude,accuracy:p.coords.accuracy,updated:new Date(p.timestamp).toISOString(),source:'browser'});
  const bad=(e:GeolocationPositionError)=>{clear();setG(e.code===1?'denied':e.code===3?'timeout':'error');
    setMsg(e.code===1?'Permission denied. Allow location for this site in your browser settings, then try again.':e.code===3?'Timed out waiting for a position.':'Position unavailable on this device.');};
  const guard=()=>{if(!('geolocation' in navigator)){setG('unsupported');setMsg('Geolocation is not supported in this browser.');return false;}return true;};
  const useMy=()=>{if(!guard())return;clear();setG('loading');setMsg('Waiting for browser permission / position…');navigator.geolocation.getCurrentPosition(p=>{ok(p);setG('idle');setMsg('');},bad,OPT);};
  const startT=()=>{if(!guard())return;clear();setG('loading');setMsg('Waiting for browser permission / position…');watch.current=navigator.geolocation.watchPosition(p=>{ok(p);setG('tracking');setMsg('');},bad,OPT);};
  const stopT=()=>{clear();setG('idle');setMsg('');};
  const demo=()=>{stopT();resetLocation();};
  const real=s.loc.source==='browser';void tick;
  const stale=real&&Date.now()-new Date(s.loc.updated).getTime()>120000;
  const q=`${s.loc.lat},${s.loc.lng}`;
  const src=KEY?`https://www.google.com/maps/embed/v1/place?key=${KEY}&q=${q}&zoom=15`:`https://maps.google.com/maps?q=${q}&z=15&output=embed`;
  const link=`https://www.google.com/maps/search/?api=1&query=${q}`;
  const W=600,H=360,x=Math.max(0,Math.min(W,(s.loc.lng-77.18)/0.06*W)),y=Math.max(0,Math.min(H,(28.65-s.loc.lat)/0.06*H));
  const tracking=g==='tracking'||(g==='loading'&&watch.current!==null);
  return <div className="grid two">
    <Card title="Google Maps" right={<Badge v={real?'REAL BROWSER LOCATION':'SIMULATED (Delhi demo)'}/>}>
      {!schem?<iframe key={q} className="gmap" title={`Map at ${q}`} src={src} loading="lazy" referrerPolicy="no-referrer-when-downgrade"/>:
      <svg viewBox={`0 0 ${W} ${H}`} className="map" role="img" aria-label={`Schematic marker at ${q}`}>
        <rect width={W} height={H} fill="#10193a"/>{Array.from({length:9}).map((_,i)=><line key={i} x1={i*75} y1="0" x2={i*75} y2={H} stroke="#232d55"/>)}
        <circle cx={x} cy={y} r="22" fill="#8b5cf633"/><circle cx={x} cy={y} r="9" fill="#8b5cf6" stroke="#fff" strokeWidth="2"/>
        <text x="10" y={H-10} fill="#8e98bd" fontSize="12">Schematic fallback (Delhi demo area; marker clamped to edge if outside)</text></svg>}
      <div className="row" style={{marginTop:8}}><a className="btn" href={link} target="_blank" rel="noreferrer">Open in Google Maps</a>
        <button className="btn" onClick={()=>setSchem(!schem)}>{schem?'Show Google map':'Map not loading? Schematic view'}</button></div>
      <p className="note">{KEY?'Using the Google Maps Embed API (key from VITE_GOOGLE_MAPS_API_KEY).':'No API key set: using Google’s keyless embed URL, which is unofficial and may stop working. Add VITE_GOOGLE_MAPS_API_KEY for the supported Embed API.'} The map shows the coordinates at right; it is not tracking the wearable band.</p>
    </Card>
    <Card title="Location details">
      <div className="li"><span>Source</span><Badge v={real?'REAL BROWSER LOCATION':'SIMULATED'}/></div>
      <div className="li"><span>Latitude</span><b>{s.loc.lat.toFixed(5)}</b></div>
      <div className="li"><span>Longitude</span><b>{s.loc.lng.toFixed(5)}</b></div>
      <div className="li"><span>Accuracy</span><b>{real&&s.loc.accuracy!==undefined?`±${Math.round(s.loc.accuracy)} m`:'n/a'}</b></div>
      <div className="li"><span>Last updated</span><b>{fmt(s.loc.updated)} {stale&&<Badge v="STALE"/>}</b></div>
      <div className="li"><span>Browser tracking</span><b>{tracking?'ON':'OFF'}</b></div>
      {msg&&<p className={g==='loading'?'note':'err'} role="status">{msg}</p>}
      <div className="row" style={{marginTop:10}}>
        <button className="btn primary" onClick={useMy} disabled={g==='loading'}>USE MY LOCATION</button>
        <button className="btn" onClick={real?useMy:refreshLoc}>REFRESH LOCATION</button>
        {tracking?<button className="btn danger" onClick={stopT}>STOP TRACKING</button>:<button className="btn" onClick={startT}>START TRACKING</button>}
        <button className="btn" onClick={demo} disabled={!real}>Switch to demo location</button></div>
      <p className="note">Your browser will ask permission only after you click a location button. Browser location is the position of this phone/computer, not of the wearable band unless the band sends its own GPS data (future work). Demo coordinates are never presented as real.</p>
    </Card>
  </div>;
}
