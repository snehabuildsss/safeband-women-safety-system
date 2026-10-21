import type {Risk,Sensors} from './types';
// Transparent, configurable DEMO rules. NOT a trained AI model; real multimodal AI inference is future work.
export const RULES={
  weights:{motion:0.3,impact:0.4,inactivity:0.2}, // contribution of each 0-100 reading
  flags:{motion:50,impact:60,inactivity:50},      // reading above this counts as a concerning signal
  comboBonus:15,                                  // added when 2+ concerning signals occur together
  mediumAt:35, highAt:65,
};
export const SCENARIOS:Record<'normal'|'unusual'|'high',Sensors>={
  normal:{motion:20,impact:5,inactivity:5},
  unusual:{motion:70,impact:20,inactivity:30},
  high:{motion:85,impact:90,inactivity:60},
};
export function assess(s:Sensors,sos=false):Risk{
  if(sos) return {score:100,level:'HIGH',reasons:['Manual SOS is active: always triggers the emergency workflow.']};
  const R=RULES,reasons:string[]=[];
  let score=s.motion*R.weights.motion+s.impact*R.weights.impact+s.inactivity*R.weights.inactivity;
  let flags=0;
  if(s.motion>R.flags.motion){flags++;reasons.push(`Unusual motion (${s.motion}/100 > ${R.flags.motion}).`);}
  if(s.impact>R.flags.impact){flags++;reasons.push(`Severe impact (${s.impact}/100 > ${R.flags.impact}).`);}
  if(s.inactivity>R.flags.inactivity){flags++;reasons.push(`Prolonged inactivity (${s.inactivity}/100 > ${R.flags.inactivity}).`);}
  if(flags>=2){score+=R.comboBonus;reasons.push(`${flags} concerning signals together: +${R.comboBonus} combination bonus.`);}
  if(flags===0) reasons.push('All readings are within normal movement ranges.');
  score=Math.max(0,Math.min(100,Math.round(score)));
  return {score,level:score>=R.highAt?'HIGH':score>=R.mediumAt?'MEDIUM':'LOW',reasons};
}
