const HF_BASE='https://huggingface.co/KittenML/kitten-tts-2-pico/resolve/main/';
const ORT_VER='1.21.0';
const ORT_DIST=`https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORT_VER}/dist/`;
const MODEL_CACHE='oravigil-kitten-pico-v1';
const SAMPLE_RATE=24000;
const END_TOKEN=10;

export const KITTEN_VOICES=[
  {key:'eleanor',name:'Eleanor',desc:'Somber, clear (female)',persona:'female'},
  {key:'edith',name:'Edith',desc:'Warm, gentle (female)',persona:'female'},
  {key:'otis',name:'Otis',desc:'Deep, resonant (male)',persona:'male'},
  {key:'frank',name:'Frank',desc:'Weathered, steady (male)',persona:'male'}
];

const EXTRA_LEXICON={
  adversities:'ædvˈɜɹsətiz',alleluia:'ˌælɪlˈujə',amen:'Amˈɛn',angelus:'ˈænʤələs',
  anima:'ˈænɪmə',ave:'ˈɑvA',basely:'bˈAsli',beatitude:'biˈætɪtjud',
  benedictus:'ˌbɛnədˈɪktəs',benignity:'bɪnˈɪɡnəti',blaspheme:'blæsfˈim',
  blasphemies:'blˈæsfəmiz',breathedst:'bɹˈiðədst',christi:'kɹˈɪsti',
  compassing:'kˈʌmpəsɪŋ',compline:'kˈɑmplɪn',concupiscence:'kəŋkjˈupɪsəns',
  containest:'kəntˈAnəst',derisions:'dɪɹˈɪʒənz',despoiled:'dɪspˈɔɪld',
  didst:'dˈɪdst',disjointing:'dɪsʤˈɔɪntɪŋ',dolorous:'dˈOləɹəs',dolors:'dˈOləɹz',
  dominus:'dˈɑmɪnəs',effusion:'ɪfjˈuʒən',eleison:'ɪlˈAsən',enkindle:'ɪnkˈɪndəl',
  gloria:'ɡlˈɔɹiə',hadst:'hˈædst',handmaid:'hˈændmAd',hosanna:'hOzˈænə',
  immensity:'ɪmˈɛnsəti',immerged:'ɪmˈɜɹʤd',ingratitude:'ɪŋɡɹˈætɪtjud',
  iniquities:'ɪnˈɪkwətiz',kyrie:'kˈɪɹiA',lauds:'lˈɔdz',magnificat:'mæɡnˈɪfɪkæt',
  matins:'mˈætɪnz',memorare:'ˌmɛməɹˈɑɹA',molestations:'ˌmOlɛstˈAʃənz',
  noster:'nˈɑstəɹ',pater:'pˈɑtəɹ',perfidious:'pəɹfˈɪdiəs',pieta:'piAtˈɑ',
  plenteously:'plˈɛntiəsli',regina:'ɹɪʤˈinə',renderedst:'ɹˈɛndəɹdəst',
  repairer:'ɹɪpˈɛɹəɹ',reproaches:'ɹɪpɹˈOʧɪz',reprobation:'ˌɹɛpɹəbˈAʃən',
  requiem:'ɹˈɛkwiəm',sacramentally:'ˌsækɹəmˈɛntəli',saidst:'sˈɛdst',
  salve:'sˈɑlvA',sanctus:'sˈæŋktəs',saviour:'sˈAvjəɹ',sext:'sˈɛkst',
  st:'sˈAnt',terce:'tˈɜɹs',transpierce:'tɹænspˈɪɹs',trespasses:'tɹˈɛspæsɪz',
  unexhausted:'ˌʌnɪɡzˈɔstɪd',unmindful:'ʌnmˈIndfəl',unspilled:'ʌnspˈɪld',
  vespers:'vˈɛspəɹz',vouchsafe:'vWʧsˈAf',wast:'wˈɑst',wherewith:'wˈɛɹwɪθ',
  worthily:'wˈɜɹðəli',wouldst:'wˈʊdst'
};

const VISEME_MAP={
  m:'mbp',b:'mbp',p:'mbp',
  f:'fv',v:'fv',
  i:'wide','ɪ':'wide',e:'wide','ɛ':'wide',A:'wide',j:'wide','ᵻ':'wide',
  a:'open','ɑ':'open','ɐ':'open','æ':'open','ʌ':'open','ə':'open','ɜ':'open','ɚ':'open',I:'open',Y:'open',
  o:'round','ɔ':'round','ɒ':'round',u:'round','ʊ':'round',O:'round',W:'round',Q:'round',w:'round',
  t:'mid',d:'mid',n:'mid',l:'mid',s:'mid',z:'mid','θ':'mid','ð':'mid','ʃ':'mid','ʒ':'mid',
  'ʧ':'mid','ʤ':'mid',k:'mid','ɡ':'mid',g:'mid','ŋ':'mid','ɹ':'mid',r:'mid',h:'mid',T:'mid',S:'mid','ɾ':'mid'
};

let engine=null, loading=null, audioCtx=null, activeSource=null, token=0, resumeFn=null;

export function cancelVoice(){
  token++;
  if(activeSource){
    try{activeSource.onended=null;activeSource.stop()}catch{}
    activeSource=null;
  }
  resumeFn?.();
  resumeFn=null;
}

export function isVoiceLoaded(){return Boolean(engine)}

async function fetchCached(file,onProgress){
  const url=HF_BASE+file;
  let cache=null;
  try{if('caches'in window)cache=await caches.open(MODEL_CACHE)}catch{}
  if(cache){
    try{
      const hit=await cache.match(url);
      if(hit)return await hit.arrayBuffer();
    }catch{}
  }
  const res=await fetch(url);
  if(!res.ok)throw new Error(`Could not fetch ${file} (${res.status})`);
  const total=Number(res.headers.get('content-length'))||0;
  if(!res.body||!onProgress){
    const buf=await res.arrayBuffer();
    if(cache)try{await cache.put(url,new Response(buf.slice(0)))}catch{}
    return buf;
  }
  const reader=res.body.getReader();
  const chunks=[];
  let loaded=0;
  while(true){
    const {done,value}=await reader.read();
    if(done)break;
    chunks.push(value);
    loaded+=value.byteLength;
    onProgress(loaded,total);
  }
  const out=new Uint8Array(loaded);
  let pos=0;
  for(const c of chunks){out.set(c,pos);pos+=c.byteLength}
  const buf=out.buffer;
  if(cache)try{await cache.put(url,new Response(buf.slice(0)))}catch{}
  return buf;
}

function parseNpzFloat32(buffer){
  const view=new DataView(buffer);
  const bytes=new Uint8Array(buffer);
  const dec=new TextDecoder();
  const packs={};
  let offset=0;
  while(offset+30<=bytes.length&&view.getUint32(offset,true)===0x04034b50){
    const comp=view.getUint16(offset+8,true);
    const compSize=view.getUint32(offset+18,true);
    const nameLen=view.getUint16(offset+26,true);
    const extraLen=view.getUint16(offset+28,true);
    const name=dec.decode(bytes.subarray(offset+30,offset+30+nameLen));
    const entryStart=offset+30+nameLen+extraLen;
    offset=entryStart+compSize;
    if(comp!==0||!name.endsWith('.npy'))continue;
    const major=bytes[entryStart+6];
    const hdrLen=major===1?view.getUint16(entryStart+8,true):view.getUint32(entryStart+8,true);
    const dataStart=entryStart+(major===1?10:12)+hdrLen;
    const raw=buffer.slice(dataStart,entryStart+compSize);
    const key=name.replace(/\.npy$/,'').toLowerCase();
    packs[key]=new Float32Array(raw);
  }
  return packs;
}

function fallbackWordToIpa(word){
  let s=word.toLowerCase().replace(/[^a-z]/g,'');
  if(!s)return '';
  const rules=[
    [/tion\b/g,'ʃən'],[/sion\b/g,'ʒən'],[/cious\b/g,'ʃəs'],[/tious\b/g,'ʃəs'],
    [/ough/g,'O'],[/igh/g,'I'],[/tch/g,'ʧ'],[/dge/g,'ʤ'],[/sch/g,'sk'],
    [/sh/g,'ʃ'],[/ch/g,'ʧ'],[/th/g,'θ'],[/ph/g,'f'],[/wh/g,'w'],[/ng/g,'ŋ'],
    [/qu/g,'kw'],[/ck/g,'k'],[/ee/g,'i'],[/ea/g,'i'],[/oo/g,'u'],[/ou/g,'W'],
    [/ow/g,'O'],[/oi|oy/g,'ɔɪ'],[/ai|ay/g,'A'],[/au|aw/g,'ɔ'],
    [/er\b|or\b|ar\b/g,'əɹ'],[/y\b/g,'i'],[/c(?=[eiy])/g,'s'],[/c/g,'k'],
    [/g(?=[eiy])/g,'ʤ'],[/x/g,'ks'],[/a/g,'æ'],[/e/g,'ɛ'],[/i/g,'ɪ'],
    [/o/g,'ɑ'],[/u/g,'ʌ'],[/r/g,'ɹ'],[/g/g,'ɡ']
  ];
  for(const [re,rep] of rules)s=s.replace(re,rep);
  return s;
}

function lookupWord(raw,cmu){
  const w=raw.toLowerCase().replace(/’/g,"'");
  if(EXTRA_LEXICON[w])return EXTRA_LEXICON[w];
  if(cmu[w])return cmu[w];
  if(w.endsWith("'s")&&w.length>2){
    const base=lookupWord(w.slice(0,-2),cmu);
    if(base)return base+'z';
  }
  const suffixes=[
    ['eth','əθ'],['est','əst'],['ies','iz','y'],['ied','id','y'],
    ['es','ɪz'],['s','z'],['ed','d'],['ing','ɪŋ'],['ly','li'],['ness','nəs']
  ];
  for(const [suf,ipa,add] of suffixes){
    if(w.length>suf.length+2&&w.endsWith(suf)){
      const stem=w.slice(0,-suf.length)+(add||'');
      if(EXTRA_LEXICON[stem])return EXTRA_LEXICON[stem]+ipa;
      if(cmu[stem])return cmu[stem]+ipa;
      if(stem.length>3&&stem[stem.length-1]===stem[stem.length-2]){
        const trimmed=stem.slice(0,-1);
        if(cmu[trimmed])return cmu[trimmed]+ipa;
      }
      if(!add&&cmu[stem+'e'])return cmu[stem+'e']+ipa;
    }
  }
  return fallbackWordToIpa(w);
}

function textToPhonemes(text,cmu){
  const cleaned=text
    .replace(/[℣℟✠✛✝]/g,' ')
    .replace(/\bSt\./g,'Saint')
    .replace(/\bP\.\s*/g,'')
    .replace(/\bS\.\s*/g,'')
    .replace(/—|–/g,', ')
    .replace(/\s+/g,' ')
    .trim();
  const tokens=cleaned.match(/[A-Za-z]+(?:['’][A-Za-z]+)?|\d+|[.,!?;:()…]/g)||[];
  const digits=['zero','one','two','three','four','five','six','seven','eight','nine'];
  let out='';
  for(const tok of tokens){
    if(/^[.,!?;:()…]$/.test(tok)){
      out+=tok;
    }else if(/^\d+$/.test(tok)){
      const words=tok.split('').map(d=>lookupWord(digits[Number(d)],cmu)).join(' ');
      out+=(out&&!/[\s(]$/.test(out)?' ':'')+words;
    }else{
      const ph=lookupWord(tok,cmu);
      if(ph)out+=(out&&!/[\s(]$/.test(out)?' ':'')+ph;
    }
  }
  return out.trim();
}

function splitChunks(text,maxLen=210){
  const sentences=text.replace(/\s+/g,' ').trim().match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[text];
  const chunks=[];
  for(const s of sentences){
    const trimmed=s.trim();
    if(!trimmed)continue;
    if(trimmed.length<=maxLen){chunks.push(trimmed);continue}
    const clauses=trimmed.split(/(?<=[,;:])\s+/);
    let buf='';
    for(const c of clauses){
      if(buf&&(buf.length+c.length+1)>maxLen){chunks.push(buf);buf=c}
      else buf=buf?buf+' '+c:c;
    }
    if(buf)chunks.push(buf);
  }
  return chunks.length?chunks:[text];
}

function ensureAudioContext(){
  if(!audioCtx){
    const Ctx=window.AudioContext||window.webkitAudioContext;
    audioCtx=new Ctx();
  }
  if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});
  return audioCtx;
}

export async function downloadVoice(status){
  ensureAudioContext();
  if(engine)return engine;
  if(!loading){
    loading=(async()=>{
      const setStatus=msg=>{if(status)status.textContent=msg};
      setStatus('Loading KittenTTS 2 Pico runtime…');
      const ort=await import(`${ORT_DIST}ort.wasm.min.mjs`);
      ort.env.wasm.wasmPaths=ORT_DIST;
      ort.env.wasm.numThreads=1;
      ort.env.wasm.proxy=false;

      setStatus('Downloading KittenTTS Pico lexicon & voice packs…');
      const [vocabBuf,cmuBuf,voicesBuf]=await Promise.all([
        fetchCached('vocab.json'),
        fetchCached('g2p/cmu_misaki_us.json'),
        fetchCached('voices_en.npz')
      ]);
      const dec=new TextDecoder();
      const vocab=JSON.parse(dec.decode(vocabBuf));
      const cmu=JSON.parse(dec.decode(cmuBuf));
      const voices=parseNpzFloat32(voicesBuf);

      const modelBuf=await fetchCached('kitten_tts_2_pico_en.onnx',(loaded,total)=>{
        const pct=total?Math.min(100,Math.round(loaded/total*100)):0;
        setStatus(total?`Downloading KittenTTS 2 Pico model · ${pct}% (8 MB)`:'Downloading KittenTTS 2 Pico model (8 MB)…');
      });

      setStatus('Initializing KittenTTS 2 Pico on this device…');
      const session=await ort.InferenceSession.create(new Uint8Array(modelBuf),{
        executionProviders:['wasm']
      });
      engine={ort,session,vocab,cmu,voices};
      setStatus('KittenTTS 2 Pico ready (~13 MB cached). Speech runs locally on this device.');
      return engine;
    })().catch(err=>{
      loading=null;
      throw err;
    });
  }
  return loading;
}

async function synthesizeChunk(eng,text,voiceKey,rate,keepStart){
  const phonemes=textToPhonemes(text,eng.cmu);
  const ids=[];
  const chars=[];
  for(const ch of phonemes){
    if(Object.hasOwn(eng.vocab,ch)){
      ids.push(eng.vocab[ch]);
      chars.push(ch);
    }else if(ch==='('||ch===')'){
      ids.push(eng.vocab[',']);
      chars.push(',');
    }
  }
  const fullIds=[0,...ids,END_TOKEN,0];
  const fullChars=['',...chars,'',''];
  const pack=eng.voices[voiceKey]||eng.voices.eleanor||Object.values(eng.voices)[0];
  const row=Math.min(fullIds.length-1,Math.floor(pack.length/256)-1);
  const style=new Float32Array(pack.subarray(row*256,(row+1)*256));

  const inputIds=new BigInt64Array(fullIds.map(BigInt));
  const feeds={
    input_ids:new eng.ort.Tensor('int64',inputIds,[1,fullIds.length]),
    style:new eng.ort.Tensor('float32',style,[1,256]),
    speed:new eng.ort.Tensor('float32',new Float32Array([Number(rate)||0.85]),[1])
  };
  const results=await eng.session.run(feeds);
  const outNames=eng.session.outputNames;
  const rawWav=results[outNames[0]].data;
  const rawDur=results[outNames[1]]?.data;

  let totalDur=0;
  if(rawDur){for(let i=0;i<rawDur.length;i++)totalDur+=Number(rawDur[i])}
  const spf=Math.max(1,Math.round(rawWav.length/Math.max(totalDur,1)));
  const lead=keepStart||!rawDur?0:Math.max(0,Number(rawDur[0])-1)*spf;
  const trail=rawDur?Math.max(0,Number(rawDur[rawDur.length-1])-1)*spf:0;
  const endIdx=(lead+trail+spf<rawWav.length&&trail)?rawWav.length-trail:rawWav.length;
  const startIdx=(lead+trail+spf<rawWav.length)?lead:0;

  const len=Math.max(0,endIdx-startIdx);
  const wav=new Float32Array(len);
  for(let i=0;i<len;i++){
    const v=rawWav[startIdx+i];
    wav[i]=v>1?1:v<-1?-1:v;
  }
  const fade=Math.min(120,Math.floor(len/8));
  for(let i=0;i<fade;i++){
    const k=i/fade;
    wav[i]*=k;
    wav[len-1-i]*=k;
  }

  const visemeCues=[];
  if(rawDur){
    let samplePos=0;
    for(let i=0;i<rawDur.length&&i<fullChars.length;i++){
      const durSamples=Number(rawDur[i])*spf;
      const tSec=Math.max(0,(samplePos-startIdx)/SAMPLE_RATE);
      const ch=fullChars[i];
      const v=VISEME_MAP[ch]||'rest';
      if(!visemeCues.length||visemeCues[visemeCues.length-1].v!==v){
        visemeCues.push({t:tSec,v});
      }
      samplePos+=durSamples;
    }
  }
  return {wav,visemeCues};
}

export async function browserSpeak(text,rate,status,options={}){
  const run=++token;
  const ctx=ensureAudioContext();
  const eng=await downloadVoice(status);
  if(run!==token)return;

  const voiceKey=options.voice||'eleanor';
  const voiceObj=KITTEN_VOICES.find(v=>v.key===voiceKey)||KITTEN_VOICES[0];
  const chunks=splitChunks(text);

  let nextPromise=synthesizeChunk(eng,chunks[0],voiceKey,rate,true);

  for(let i=0;i<chunks.length;i++){
    if(run!==token)return;
    if(status)status.textContent=i===0?`Preparing ${voiceObj.name} (KittenTTS Pico)…`:`Reading with ${voiceObj.name} · KittenTTS 2 Pico.`;
    const {wav,visemeCues}=await nextPromise;
    if(run!==token)return;

    if(i+1<chunks.length){
      nextPromise=synthesizeChunk(eng,chunks[i+1],voiceKey,rate,false);
    }
    if(!wav.length)continue;

    const buffer=ctx.createBuffer(1,wav.length,SAMPLE_RATE);
    buffer.copyToChannel(wav,0);

    const source=ctx.createBufferSource();
    source.buffer=buffer;
    const analyser=ctx.createAnalyser();
    analyser.fftSize=256;
    analyser.smoothingTimeConstant=0.55;
    source.connect(analyser);
    analyser.connect(ctx.destination);
    activeSource=source;

    if(status)status.textContent=`Reading with ${voiceObj.name} · KittenTTS 2 Pico (on device).`;
    const startTime=ctx.currentTime;
    options.onChunkStart?.(analyser,()=>ctx.currentTime-startTime,visemeCues);

    await new Promise(resolve=>{
      resumeFn=resolve;
      source.onended=()=>{
        if(activeSource===source)activeSource=null;
        resumeFn=null;
        resolve();
      };
      source.start(startTime);
    });
    options.onChunkEnd?.();
    if(run!==token)return;
  }
  if(status)status.textContent='Reading finished.';
}
