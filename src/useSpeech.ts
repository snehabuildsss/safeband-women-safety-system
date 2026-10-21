import {useCallback,useEffect,useRef,useState} from 'react';
export type VoiceStatus='idle'|'starting'|'listening'|'denied'|'unsupported'|'error';
const norm=(t:string)=>t.toLowerCase().replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
// Browser Web Speech API: recognises WORDS, not screams. May send audio to the browser vendor's service.
export function useSpeech(phrases:string[],onMatch:(p:string)=>void){
  const [status,setStatus]=useState<VoiceStatus>('idle');const [msg,setMsg]=useState('');const [heard,setHeard]=useState('');
  const rec=useRef<any>(null),on=useRef(false),last=useRef<Record<string,number>>({});
  const ph=useRef(phrases),cb=useRef(onMatch);ph.current=phrases;cb.current=onMatch;
  const kill=()=>{on.current=false;try{rec.current?.abort();}catch{}rec.current=null;};
  const fail=useCallback((s:VoiceStatus,m:string)=>{kill();setStatus(s);setMsg(m);},[]);
  const stop=useCallback(()=>{kill();setStatus('idle');setMsg('Stopped. Microphone is OFF.');setHeard('');},[]);
  const start=useCallback(()=>{
    const SR=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;
    if(!SR){setStatus('unsupported');setMsg('Speech recognition is not supported in this browser. Try desktop Chrome or Edge.');return;}
    if(on.current)return;
    on.current=true;setStatus('starting');setMsg('Waiting for microphone permission…');
    const launch=()=>{
      const r=new SR();r.continuous=true;r.interimResults=true;r.lang='en-IN';
      r.onstart=()=>{setStatus('listening');setMsg('Listening: microphone is ON.');};
      r.onresult=(e:any)=>{
        for(let i=e.resultIndex;i<e.results.length;i++){
          const text=norm(e.results[i][0].transcript);setHeard(text);
          for(const p of ph.current){const n=norm(p);if(!n)continue;
            if((' '+text+' ').includes(' '+n+' ')){const now=Date.now();
              if(now-(last.current[n]||0)>8000){last.current[n]=now;cb.current(p);}}}}
      };
      r.onerror=(e:any)=>{const c=e.error;if(c==='no-speech'||c==='aborted')return;
        if(c==='not-allowed'||c==='service-not-allowed')fail('denied','Microphone permission denied or speech service blocked.');
        else if(c==='audio-capture')fail('error','No microphone available.');
        else if(c==='network')fail('error','Speech service unavailable (network).');
        else fail('error','Recognition error: '+c);};
      r.onend=()=>{if(on.current){try{launch();}catch{fail('error','Could not restart listening.');}}};
      rec.current=r;r.start();
    };
    try{launch();}catch{fail('error','Could not start speech recognition.');}
  },[fail]);
  useEffect(()=>()=>kill(),[]);
  return {status,msg,heard,start,stop};
}
