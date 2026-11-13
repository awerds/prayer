let model, loading, audio, token=0, resume;
export function cancelVoice(){token++;audio?.pause();audio=null;resume?.();resume=null;}
export async function downloadVoice(status){
 if(model)return model;
 if(!loading)loading=(async()=>{status.textContent='Downloading browser voice… Allow roughly 100 MB plus speech runtime files. Keep this page open.';const {KokoroTTS}=await import('https://esm.sh/kokoro-js@1.2.1');model=await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX',{dtype:'q8',device:'wasm',progress_callback:p=>{if(p.status==='progress')status.textContent=`Downloading ${p.file||'voice'} · ${Math.round(p.progress||0)}%`}});status.textContent='Browser voice ready. Speech is generated on this device.';return model})().catch(e=>{loading=null;throw e});
 return loading;
}
export async function browserSpeak(text,rate,status){const run=++token;const tts=await downloadVoice(status);if(run!==token)return;for(const part of text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[text]){status.textContent='Preparing speech on this device…';const result=await tts.generate(part,{voice:'af_heart',speed:Number(rate)});if(run!==token)return;const url=URL.createObjectURL(result.toBlob());audio=new Audio(url);try{status.textContent='Reading with the downloaded browser voice.';await new Promise((resolve,reject)=>{resume=resolve;audio.onended=resolve;audio.onerror=reject;audio.play().catch(reject)})}finally{URL.revokeObjectURL(url);resume=null}if(run!==token)return;}status.textContent='Reading finished.';}
