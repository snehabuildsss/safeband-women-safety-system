import {useState} from 'react';
import type {FormEvent} from 'react';
import {useApp} from '../store';
import {Card,Modal} from '../ui';
import type {Contact} from '../types';
const blank={id:'',name:'',relation:'',phone:'',priority:'1'};
export default function Contacts(){
  const {s,saveContact,deleteContact}=useApp();
  const [f,setF]=useState<typeof blank|null>(null);const [err,setErr]=useState<Record<string,string>>({});
  const submit=(e:FormEvent)=>{e.preventDefault();if(!f)return;const er:Record<string,string>={};
    if(!f.name.trim())er.name='Name is required.';if(!f.relation.trim())er.relation='Relationship is required.';
    if(!/^\+?[0-9][0-9\s-]{7,14}$/.test(f.phone.trim()))er.phone='Enter a valid phone number (8-15 digits, optional +).';
    const p=Number(f.priority);if(!Number.isInteger(p)||p<1||p>9)er.priority='Priority must be 1-9.';
    setErr(er);if(Object.keys(er).length)return;
    const c:Contact={id:f.id||'c'+Date.now(),name:f.name.trim(),relation:f.relation.trim(),phone:f.phone.trim(),priority:p};saveContact(c);setF(null);};
  const field=(k:'name'|'relation'|'phone'|'priority',l:string)=><label>{l}<input value={f![k]} onChange={e=>setF({...f!,[k]:e.target.value})}/>{err[k]&&<span className="err">{err[k]}</span>}</label>;
  return <Card title="Emergency contacts (fictional demo data)" right={<button className="btn primary" onClick={()=>{setErr({});setF(blank);}}>Add contact</button>}>
    {s.contacts.length===0?<p className="note">No contacts yet. Add one to receive simulated alerts.</p>:
    <div className="scroll"><table><thead><tr><th>Priority</th><th>Name</th><th>Relationship</th><th>Phone</th><th/></tr></thead><tbody>
      {[...s.contacts].sort((a,b)=>a.priority-b.priority).map(c=><tr key={c.id}><td>{c.priority}</td><td>{c.name}</td><td>{c.relation}</td><td>{c.phone}</td>
        <td className="row"><button className="btn" onClick={()=>{setErr({});setF({...c,priority:String(c.priority)});}}>Edit</button>
        <button className="btn danger" onClick={()=>{if(confirm('Delete '+c.name+'?'))deleteContact(c.id);}}>Delete</button></td></tr>)}</tbody></table></div>}
    {f&&<Modal title={f.id?'Edit contact':'Add contact'} onClose={()=>setF(null)}><form onSubmit={submit} noValidate>
      {field('name','Name')}{field('relation','Relationship')}{field('phone','Phone number')}{field('priority','Priority (1 = first)')}
      <div className="row"><button type="button" className="btn" onClick={()=>setF(null)}>Cancel</button><button className="btn primary" type="submit">Save</button></div></form></Modal>}
  </Card>;
}
