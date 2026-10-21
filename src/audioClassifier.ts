// Integration point for REAL scream/audio classification. STATUS: NOT YET IMPLEMENTED.
// Nothing in the app calls a model today; all scream confidences in the UI are SIMULATED presets.
export const SCREAM_CLASSIFIER_STATUS='NOT YET IMPLEMENTED' as const;
export interface AudioPrediction{label:string;confidence:number}
export interface AudioClassifier{
  name:string;
  load():Promise<void>;                                                           // fetch model (client-side)
  classify(samples:Float32Array,sampleRate:number):Promise<AudioPrediction[]>;    // one short window, never stored
}
export const AUDIO_CONFIG={threshold:0.7,windowMs:1000,cooldownMs:8000}; // tune after real evaluation
export const NEXT_STEPS=[
  'Pick a browser-runnable audio-event model (e.g. TensorFlow.js YAMNet, which has a screaming class) and check its licence, size and accuracy yourself.',
  'Implement AudioClassifier with it; capture ~1 s windows via getUserMedia + AudioContext only after a Start click.',
  'Call store.voiceEvent-style action when confidence ≥ AUDIO_CONFIG.threshold, with AUDIO_CONFIG.cooldownMs to avoid repeats.',
  'Test false positives (laughing, TV, traffic) and misses before any claim of reliability.',
];
