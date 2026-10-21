import {useState} from 'react';
import {useApp} from '../store';
import {Card,Badge,Modal,fmt} from '../ui';
export default function History(){
  const {s,resolveIncident}=useApp();
  const [q,setQ]=useState(''),[sev,setSev]=useState(''),[st,setSt]=useState(''),[sel,setSel]=useState<string|null>(null);
  const list=s.incidents.filter(i=>(!sev||i.severity===sev)&&(!st||i.status===st)&&(`${i.id} ${i.type} ${i.location} ${i.description}`).toLowerCase().includes(q.toLowerCase()));
  const cur=s.incidents.find(i=>i.id===sel);
  return <Card title="Incident history">
    <div className="row filters"><input placeholder="Search incidents…" aria-label="Search incidents" value={q} onChange={e=>setQ(e.target.value)}/>
      <select aria-label="Filter by severity" value={sev} onChange={e=>setSev(e.target.value)}><option value="">All severities</option>{['LOW','MEDIUM','HIGH','CRITICAL'].map(x=><option key={x}>{x}</option>)}</select>
      <select aria-label="Filter by status" value={st} onChange={e=>setSt(e.target.value)}><option value="">All statuses</option><option>Active</option><option>Resolved</option></select></div>
    {list.length===0?<p className="note">No incidents match your filters.</p>:
    <div className="scroll"><table><thead><tr><th>ID</th><th>Time</th><th>Type</th><th>Severity</th><th>Location</th><th>Status</th></tr></thead><tbody>
      {list.map(i=><tr key={i.id} className={i.status==='Active'?'activeRow':''} onClick={()=>setSel(i.id)} style={{cursor:'pointer'}}>
        <td>{i.id}</td><td>{fmt(i.time)}</td><td>{i.type}</td><td><Badge v={i.severity}/></td><td>{i.location}</td><td><Badge v={i.status}/></td></tr>)}</tbody></table></div>}
    {cur&&<Modal title={cur.id+' details'} onClose={()=>setSel(null)}>
      <div className="li"><span>Time</span><b>{fmt(cur.time)}</b></div><div className="li"><span>Type</span><b>{cur.type}</b></div>
      <div className="li"><span>Severity</span><Badge v={cur.severity}/></div><div className="li"><span>Status</span><Badge v={cur.status}/></div>
      <div className="li"><span>Location</span><b>{cur.location}</b></div><p>{cur.description}</p>
      <div className="row"><button className="btn" onClick={()=>setSel(null)}>Close</button>
      {cur.status==='Active'&&<button className="btn primary" onClick={()=>resolveIncident(cur.id)}>Mark resolved</button>}</div></Modal>}
  </Card>;
}
