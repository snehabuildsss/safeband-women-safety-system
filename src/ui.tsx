import type {ReactNode} from 'react';
export const fmt=(iso:string)=>{const d=new Date(iso);return isNaN(+d)?'—':d.toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'});};
export function Card({title,right,children}:{title?:string;right?:ReactNode;children:ReactNode}){
  return <section className="card">{title&&<h3><span>{title}</span>{right}</h3>}{children}</section>;
}
const tone=(v:string)=>['LOW','Resolved','NORMAL','Online','Connected','OK'].includes(v)?'g':['MEDIUM'].includes(v)?'a':['DEVICE OFFLINE','Offline','Disconnected'].includes(v)?'m':'r';
export const Badge=({v}:{v:string})=><span className={'badge '+tone(v)}>{v}</span>;
export const Sim=()=><span className="badge p" title="Simulated data, no real hardware">SIMULATED</span>;
export function Modal({title,onClose,children}:{title:string;onClose():void;children:ReactNode}){
  return <div className="overlay" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
    <div className="modal" onClick={e=>e.stopPropagation()}><h2>{title}</h2>{children}</div></div>;
}
