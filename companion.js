const PREF_KEY='oravigil-companion';
const readPref=()=>{try{return JSON.parse(localStorage.getItem(PREF_KEY))||{}}catch{return {}}};
const writePref=v=>{try{localStorage.setItem(PREF_KEY,JSON.stringify(v))}catch{}};

const state={
  mounted:new Set(),
  persona:'female',
  voiceLabel:'Oravigil companion',
  mode:'idle',
  detail:'Ready to read aloud',
  hidden:Boolean(readPref().hidden),
  motionPaused:Boolean(readPref().motionPaused),
  viseme:'rest',
  energy:0,
  rafId:0,
  blinkTimer:0,
  wordTimers:[],
  cadenceTimer:0,
  audioSync:null
};

const reducedMotion=()=>typeof window!=='undefined'&&window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const motionAllowed=()=>!state.motionPaused&&!reducedMotion();

function svgMarkup(uid){
  return `<svg class="companion-svg" viewBox="0 0 160 160" role="img" aria-label="Animated prayer companion portrait">
  <defs>
    <clipPath id="clip-${uid}"><circle cx="80" cy="80" r="74"/></clipPath>
    <radialGradient id="bg-${uid}" cx="50%" cy="38%" r="68%">
      <stop offset="0%" stop-color="#274b5d"/>
      <stop offset="65%" stop-color="#152b38"/>
      <stop offset="100%" stop-color="#0d1c26"/>
    </radialGradient>
    <radialGradient id="halo-${uid}" cx="50%" cy="46%" r="50%">
      <stop offset="0%" stop-color="#f5dc9e" stop-opacity="0.48"/>
      <stop offset="58%" stop-color="#e2be79" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#e2be79" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="skin-${uid}" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#f4e7cf"/>
      <stop offset="72%" stop-color="#e5cfa9"/>
      <stop offset="100%" stop-color="#d2b588"/>
    </linearGradient>
    <linearGradient id="robe-${uid}" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#203d4d"/>
      <stop offset="100%" stop-color="#11232e"/>
    </linearGradient>
  </defs>
  <g clip-path="url(#clip-${uid})">
    <rect width="160" height="160" fill="url(#bg-${uid})"/>
    <path d="M36 160 V74 A44 44 0 0 1 124 74 V160" fill="none" stroke="#e8c88f" stroke-opacity="0.22" stroke-width="1.2"/>
    <path d="M44 160 V76 A36 36 0 0 1 116 76 V160" fill="none" stroke="#e8c88f" stroke-opacity="0.14" stroke-width="1"/>
    <circle class="companion-halo" cx="80" cy="76" r="54" fill="url(#halo-${uid})"/>
    <g class="companion-body">
      <path d="M24 164 C28 134 50 122 80 122 C110 122 132 134 136 164 Z" fill="url(#robe-${uid})" stroke="#e8c88f" stroke-opacity="0.35" stroke-width="1"/>
      <path d="M62 124 L80 144 L98 124" fill="none" stroke="#e8c88f" stroke-opacity="0.7" stroke-width="1.6"/>
      <path d="M80 144 V156 M76 149 H84" stroke="#e8c88f" stroke-opacity="0.65" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M70 112 V128 C70 133 90 133 90 128 V112 Z" fill="#d9be94"/>
    </g>
    <g class="companion-head">
      <g class="persona-female">
        <path d="M34 138 C32 86 42 36 80 34 C118 36 128 86 126 138 C114 130 105 124 103 112 C108 92 108 60 80 54 C52 60 52 92 57 112 C55 124 46 130 34 138 Z" fill="#1b3443" stroke="#e8c88f" stroke-opacity="0.45" stroke-width="1.2"/>
        <path d="M48 76 C48 48 64 42 80 42 C96 42 112 48 112 76 C106 60 94 54 80 54 C66 54 54 60 48 76 Z" fill="#3a2c24"/>
      </g>
      <g class="persona-male">
        <path d="M47 78 C46 50 61 38 80 38 C99 38 114 50 113 78 C108 60 98 51 80 51 C62 51 52 60 47 78 Z" fill="#352a24"/>
      </g>
      <ellipse cx="49" cy="83" rx="4.5" ry="7.5" fill="#d9be94"/>
      <ellipse cx="111" cy="83" rx="4.5" ry="7.5" fill="#d9be94"/>
      <path d="M51 74 C51 53 64 46 80 46 C96 46 109 53 109 74 C109 98 97 117 80 118 C63 117 51 98 51 74 Z" fill="url(#skin-${uid})"/>
      <g class="persona-male">
        <path d="M53 86 C55 107 66 118 80 119 C94 118 105 107 107 86 C103 99 95 106 80 106 C65 106 57 99 53 86 Z" fill="#3b2f28" fill-opacity="0.72"/>
      </g>
      <path d="M51 74 C51 56 62 49 80 49 C98 49 109 56 109 74 C103 61 93 56 80 56 C67 56 57 61 51 74 Z" fill="#3a2c24" fill-opacity="0.88"/>
      <g class="companion-brows">
        <path d="M60 70 Q67 66 74 69" fill="none" stroke="#47362b" stroke-width="2" stroke-linecap="round"/>
        <path d="M86 69 Q93 66 100 70" fill="none" stroke="#47362b" stroke-width="2" stroke-linecap="round"/>
      </g>
      <g class="companion-eyes">
        <g>
          <ellipse cx="67" cy="78" rx="6" ry="3.6" fill="#fcf8ee"/>
          <circle cx="67.2" cy="78" r="2.7" fill="#362a22"/>
          <circle cx="68.3" cy="77" r="0.9" fill="#fff7e2"/>
          <path d="M60.5 77.5 Q67 73 73.5 77.5" fill="none" stroke="#34261e" stroke-width="1.6" stroke-linecap="round"/>
        </g>
        <g>
          <ellipse cx="93" cy="78" rx="6" ry="3.6" fill="#fcf8ee"/>
          <circle cx="92.8" cy="78" r="2.7" fill="#362a22"/>
          <circle cx="93.9" cy="77" r="0.9" fill="#fff7e2"/>
          <path d="M86.5 77.5 Q93 73 99.5 77.5" fill="none" stroke="#34261e" stroke-width="1.6" stroke-linecap="round"/>
        </g>
      </g>
      <path d="M80 77 L78.5 90 Q80 92 82.5 90" fill="none" stroke="#b9986d" stroke-width="1.4" stroke-linecap="round"/>
      <g class="companion-mouth">
        <g class="viseme" data-v="rest">
          <path d="M71 101 Q80 104 89 101" fill="none" stroke="#8f584d" stroke-width="2.1" stroke-linecap="round"/>
          <path d="M74 103.5 Q80 105.5 86 103.5" fill="none" stroke="#b68173" stroke-width="1.1" stroke-linecap="round"/>
        </g>
        <g class="viseme" data-v="mbp">
          <path d="M71.5 101.5 Q80 102 88.5 101.5" fill="none" stroke="#854f45" stroke-width="2.6" stroke-linecap="round"/>
        </g>
        <g class="viseme" data-v="fv">
          <path d="M71 100.5 Q80 101.5 89 100.5" fill="none" stroke="#8c544a" stroke-width="2" stroke-linecap="round"/>
          <rect x="75" y="101" width="10" height="2" rx="1" fill="#f7f0e2"/>
          <path d="M73 103.2 Q80 105.4 87 103.2" fill="none" stroke="#9e675b" stroke-width="1.6" stroke-linecap="round"/>
        </g>
        <g class="viseme" data-v="wide">
          <path d="M69 100.5 Q80 98 91 100.5 Q80 106.5 69 100.5 Z" fill="#4f2927" stroke="#8f584d" stroke-width="1.4"/>
          <path d="M73 100.4 Q80 101.4 87 100.4" stroke="#f7f0e2" stroke-width="1.5" stroke-linecap="round"/>
        </g>
        <g class="viseme" data-v="mid">
          <path d="M72 100 Q80 98.4 88 100 Q80 106 72 100 Z" fill="#4f2927" stroke="#8f584d" stroke-width="1.5"/>
          <path d="M75 100.3 H85" stroke="#f7f0e2" stroke-width="1.3" stroke-linecap="round"/>
        </g>
        <g class="viseme" data-v="open">
          <ellipse cx="80" cy="103" rx="7.6" ry="5.6" fill="#4b2524" stroke="#8f584d" stroke-width="1.6"/>
          <path d="M75 99.6 Q80 101 85 99.6" stroke="#f7f0e2" stroke-width="1.5" stroke-linecap="round"/>
          <ellipse cx="80" cy="106.4" rx="4.6" ry="1.8" fill="#8b4f4a"/>
        </g>
        <g class="viseme" data-v="round">
          <ellipse cx="80" cy="102.6" rx="4.8" ry="5.1" fill="#4b2524" stroke="#8f584d" stroke-width="1.7"/>
        </g>
      </g>
    </g>
  </g>
  <circle cx="80" cy="80" r="74.5" fill="none" stroke="#e8c88f" stroke-opacity="0.65" stroke-width="1.6"/>
  <circle class="companion-ring" cx="80" cy="80" r="78" fill="none" stroke="#f1ddac" stroke-opacity="0.28" stroke-width="1.2" stroke-dasharray="6 5"/>
</svg>`;
}

let uidSeq=0;

function syncDom(){
  for(const host of state.mounted){
    if(!host.isConnected){state.mounted.delete(host);continue}
    const card=host.querySelector('.companion-card');
    if(!card)continue;
    card.dataset.state=state.mode;
    card.dataset.persona=state.persona;
    card.dataset.hidden=state.hidden?'true':'false';
    card.dataset.motion=motionAllowed()?'on':'off';
    const label=card.querySelector('.companion-voice');
    const detail=card.querySelector('.companion-detail');
    if(label)label.textContent=state.voiceLabel;
    if(detail)detail.textContent=state.detail;
    const hideBtn=card.querySelector('[data-companion-hide]');
    const motionBtn=card.querySelector('[data-companion-motion]');
    if(hideBtn)hideBtn.textContent=state.hidden?'Show portrait':'Hide portrait';
    if(motionBtn){
      motionBtn.hidden=state.hidden;
      motionBtn.textContent=state.motionPaused?'Resume motion':'Pause motion';
    }
    const mouth=card.querySelector('.companion-mouth');
    if(mouth){
      const active=motionAllowed()?state.viseme:'rest';
      mouth.querySelectorAll('.viseme').forEach(el=>{
        el.style.opacity=el.dataset.v===active?'1':'0';
      });
      const lift=motionAllowed()&&state.mode==='speaking'?1+Math.min(.22,state.energy*.35):1;
      mouth.style.transform=`scaleY(${lift.toFixed(3)})`;
    }
    const halo=card.querySelector('.companion-halo');
    if(halo){
      const boost=motionAllowed()?state.energy:0;
      halo.style.opacity=(state.mode==='speaking'?.55+boost*.45:state.mode==='listening'?.65:.35).toFixed(3);
      halo.style.transform=`scale(${(1+boost*.14).toFixed(3)})`;
    }
    const brows=card.querySelector('.companion-brows');
    if(brows){
      const dy=motionAllowed()&&state.mode==='speaking'?-Math.min(2.2,state.energy*3.2):0;
      brows.style.transform=`translateY(${dy.toFixed(2)}px)`;
    }
    const head=card.querySelector('.companion-head');
    if(head){
      if(motionAllowed()&&state.mode==='speaking'){
        const t=performance.now()*0.0018;
        const rot=(Math.sin(t)*1.3+Math.sin(t*2.1)*state.energy*1.6);
        const ty=Math.sin(t*1.3)*1.1-state.energy*1.2;
        head.style.transform=`translateY(${ty.toFixed(2)}px) rotate(${rot.toFixed(2)}deg)`;
      }else if(motionAllowed()&&state.mode==='listening'){
        head.style.transform='translateY(0.8px) rotate(-1.6deg)';
      }else{
        head.style.transform='translateY(0px) rotate(0deg)';
      }
    }
  }
}

function scheduleBlink(){
  clearTimeout(state.blinkTimer);
  const delay=3400+Math.random()*3200;
  state.blinkTimer=setTimeout(()=>{
    if(motionAllowed()&&!state.hidden){
      for(const host of state.mounted){
        const eyes=host.querySelector('.companion-eyes');
        if(eyes){
          eyes.classList.add('blinking');
          setTimeout(()=>eyes.classList.remove('blinking'),140);
        }
      }
    }
    scheduleBlink();
  },delay);
}
scheduleBlink();

export function mountCompanion(container){
  if(!container)return;
  const uid=`c${++uidSeq}`;
  container.innerHTML=`<div class="companion-card" data-state="${state.mode}" data-persona="${state.persona}" data-hidden="${state.hidden}" data-motion="${motionAllowed()?'on':'off'}">
    <div class="companion-stage">${svgMarkup(uid)}</div>
    <div class="companion-meta">
      <div class="eyebrow companion-voice"></div>
      <p class="companion-detail"></p>
      <div class="companion-controls">
        <button type="button" class="subtle-button" data-companion-motion></button>
        <button type="button" class="subtle-button" data-companion-hide></button>
      </div>
    </div>
  </div>`;
  container.querySelector('[data-companion-hide]').onclick=()=>{
    state.hidden=!state.hidden;
    writePref({hidden:state.hidden,motionPaused:state.motionPaused});
    syncDom();
  };
  container.querySelector('[data-companion-motion]').onclick=()=>{
    state.motionPaused=!state.motionPaused;
    writePref({hidden:state.hidden,motionPaused:state.motionPaused});
    syncDom();
  };
  state.mounted.add(container);
  syncDom();
}

export function setCompanionVoice(label,persona='female'){
  state.voiceLabel=label||'Oravigil companion';
  state.persona=persona==='male'?'male':'female';
  syncDom();
}

export function setCompanionState(mode,detail){
  state.mode=mode||'idle';
  if(detail!==undefined)state.detail=detail;
  if(mode!=='speaking'){
    state.viseme='rest';
    state.energy=0;
  }
  syncDom();
}

function clearWordTimers(){
  for(const t of state.wordTimers)clearTimeout(t);
  state.wordTimers=[];
  clearInterval(state.cadenceTimer);
  state.cadenceTimer=0;
}

export function stopCompanionSync(){
  cancelAnimationFrame(state.rafId);
  state.rafId=0;
  state.audioSync=null;
  clearWordTimers();
  state.viseme='rest';
  state.energy=0;
  syncDom();
}

export function startAudioSync(analyser,getTimeSec,visemeCues){
  stopCompanionSync();
  const bins=analyser?new Uint8Array(analyser.fftSize):null;
  state.audioSync={analyser,getTimeSec,visemeCues:visemeCues||[],bins};
  const tick=()=>{
    if(!state.audioSync)return;
    const {analyser:an,getTimeSec:nowSec,visemeCues:cues,bins:buf}=state.audioSync;
    let rms=0;
    if(an&&buf){
      an.getByteTimeDomainData(buf);
      let sum=0;
      for(let i=0;i<buf.length;i++){
        const v=(buf[i]-128)/128;
        sum+=v*v;
      }
      rms=Math.min(1,Math.sqrt(sum/buf.length)*4.2);
    }
    state.energy=state.energy*0.62+rms*0.38;
    const t=nowSec();
    let v='rest';
    if(cues.length){
      let lo=0,hi=cues.length-1,idx=-1;
      while(lo<=hi){
        const mid=(lo+hi)>>1;
        if(cues[mid].t<=t){idx=mid;lo=mid+1}else hi=mid-1;
      }
      if(idx>=0)v=cues[idx].v;
    }
    if(state.energy<0.045&&v!=='mbp'&&v!=='fv')v='rest';
    else if(v==='rest'&&state.energy>0.12)v=state.energy>0.38?'open':'mid';
    state.viseme=v;
    syncDom();
    state.rafId=requestAnimationFrame(tick);
  };
  state.rafId=requestAnimationFrame(tick);
}

function charToViseme(ch){
  if('mbp'.includes(ch))return 'mbp';
  if('fv'.includes(ch))return 'fv';
  if('ouqw'.includes(ch))return 'round';
  if('a'.includes(ch))return 'open';
  if('eiy'.includes(ch))return 'wide';
  return 'mid';
}

export function driveWordVisemes(word,rate=0.85){
  clearWordTimers();
  const clean=String(word||'').toLowerCase().replace(/[^a-z]/g,'');
  if(!clean){state.viseme='rest';state.energy=0;syncDom();return}
  const seq=[];
  for(let i=0;i<clean.length;i++){
    const v=charToViseme(clean[i]);
    if(seq[seq.length-1]!==v)seq.push(v);
  }
  const stepMs=Math.max(55,Math.min(115,Math.round(78/Math.max(0.5,Number(rate)||0.85))));
  seq.forEach((v,i)=>{
    state.wordTimers.push(setTimeout(()=>{
      if(state.mode!=='speaking')return;
      state.viseme=v;
      state.energy=v==='open'?0.72:v==='round'||v==='wide'?0.56:v==='mid'?0.42:0.22;
      syncDom();
    },i*stepMs));
  });
  state.wordTimers.push(setTimeout(()=>{
    if(state.mode!=='speaking')return;
    state.viseme='rest';
    state.energy=0.1;
    syncDom();
  },seq.length*stepMs+40));
}

export function startDeviceCadence(rate=0.85){
  clearWordTimers();
  const pattern=['mid','open','wide','mbp','round','mid','fv','open','rest'];
  let k=0;
  const interval=Math.max(95,Math.round(135/Math.max(0.5,Number(rate)||0.85)));
  state.cadenceTimer=setInterval(()=>{
    if(state.mode!=='speaking'){clearWordTimers();return}
    const v=pattern[k++%pattern.length];
    state.viseme=v;
    state.energy=v==='rest'?0.08:v==='open'?0.65:0.42;
    syncDom();
  },interval);
}
