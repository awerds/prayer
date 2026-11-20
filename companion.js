const PREF_KEY='oravigil-companion';
const readPref=()=>{try{return JSON.parse(localStorage.getItem(PREF_KEY))||{}}catch{return {}}};
const writePref=v=>{try{localStorage.setItem(PREF_KEY,JSON.stringify(v))}catch{}};

const POSES={
  rest: {open:0.00,width:1.00,round:0.00,bite:0.00,teeth:0.00,press:0.0},
  mbp:  {open:0.00,width:0.90,round:0.00,bite:0.00,teeth:0.00,press:1.0},
  fv:   {open:0.18,width:0.96,round:0.00,bite:1.00,teeth:0.90,press:0.0},
  th:   {open:0.30,width:0.98,round:0.00,bite:0.35,teeth:0.80,press:0.0},
  wide: {open:0.38,width:1.22,round:0.00,bite:0.00,teeth:0.70,press:0.0},
  mid:  {open:0.46,width:1.00,round:0.15,bite:0.00,teeth:0.50,press:0.0},
  open: {open:0.94,width:0.94,round:0.18,bite:0.00,teeth:0.55,press:0.0},
  round:{open:0.68,width:0.54,round:1.00,bite:0.00,teeth:0.10,press:0.0}
};

const state={
  mounted:new Set(),
  persona:'female',
  voiceLabel:'Oravigil companion',
  mode:'idle',
  detail:'Ready to read aloud',
  hidden:Boolean(readPref().hidden),
  motionPaused:Boolean(readPref().motionPaused),
  targetViseme:'rest',
  cur:{open:0,width:1,round:0,bite:0,teeth:0,press:0},
  energy:0,
  rafId:0,
  lastFrame:0,
  blinkTimer:0,
  audioSync:null,
  textSync:null
};

const reducedMotion=()=>typeof window!=='undefined'&&window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const motionAllowed=()=>!state.motionPaused&&!reducedMotion();

function svgMarkup(uid){
  return `<svg class="companion-svg" viewBox="0 0 180 180" role="img" aria-label="Animated prayer companion portrait">
  <defs>
    <clipPath id="clip-${uid}"><circle cx="90" cy="90" r="84"/></clipPath>
    <radialGradient id="bg-${uid}" cx="50%" cy="36%" r="68%">
      <stop offset="0%" stop-color="#2a5164"/>
      <stop offset="65%" stop-color="#152c39"/>
      <stop offset="100%" stop-color="#0c1b25"/>
    </radialGradient>
    <radialGradient id="halo-${uid}" cx="50%" cy="46%" r="52%">
      <stop offset="0%" stop-color="#f7dfa3" stop-opacity="0.52"/>
      <stop offset="56%" stop-color="#e2be79" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#e2be79" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="skin-${uid}" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#f6ebd5"/>
      <stop offset="68%" stop-color="#e6d0a9"/>
      <stop offset="100%" stop-color="#cfa97c"/>
    </linearGradient>
    <linearGradient id="robe-${uid}" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#214050"/>
      <stop offset="100%" stop-color="#10222d"/>
    </linearGradient>
  </defs>
  <g clip-path="url(#clip-${uid})">
    <rect width="180" height="180" fill="url(#bg-${uid})"/>
    <path d="M32 180 V80 A58 58 0 0 1 148 80 V180" fill="none" stroke="#e8c88f" stroke-opacity="0.22" stroke-width="1.3"/>
    <path d="M42 180 V82 A48 48 0 0 1 138 82 V180" fill="none" stroke="#e8c88f" stroke-opacity="0.13" stroke-width="1"/>
    <circle class="companion-halo" cx="90" cy="84" r="68" fill="url(#halo-${uid})"/>
    <g class="companion-body">
      <path d="M18 186 C26 150 54 136 90 136 C126 136 154 150 162 186 Z" fill="url(#robe-${uid})" stroke="#e8c88f" stroke-opacity="0.38" stroke-width="1.2"/>
      <path d="M68 139 L90 162 L112 139" fill="none" stroke="#e8c88f" stroke-opacity="0.72" stroke-width="1.8"/>
      <path d="M90 162 V175 M85 168 H95" stroke="#e8c88f" stroke-opacity="0.68" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M76 124 V143 C76 149 104 149 104 143 V124 Z" fill="#d9bc90"/>
      <path d="M76 126 Q90 138 104 126 V134 Q90 144 76 134 Z" fill="#b89367" fill-opacity="0.35"/>
    </g>
    <g class="companion-head">
      <g class="persona-female">
        <path d="M28 164 C26 94 40 24 90 22 C140 24 154 94 152 164 C136 152 124 142 121 124 C128 98 128 54 90 46 C52 54 52 98 59 124 C56 142 44 152 28 164 Z" fill="#1a3444" stroke="#e8c88f" stroke-opacity="0.48" stroke-width="1.4"/>
        <path d="M46 78 C46 42 66 33 90 33 C114 33 134 42 134 78 C126 56 110 47 90 47 C70 47 54 56 46 78 Z" fill="#3a2c24"/>
      </g>
      <g class="persona-male">
        <path d="M45 80 C44 43 63 27 90 27 C117 27 136 43 135 80 C128 56 114 44 90 44 C66 44 52 56 45 80 Z" fill="#342822"/>
      </g>
      <ellipse cx="47" cy="88" rx="6" ry="10.5" fill="#d9bc90"/>
      <ellipse cx="133" cy="88" rx="6" ry="10.5" fill="#d9bc90"/>
      <path class="face-base" d="M49 77 C49 48 67 38 90 38 C113 38 131 48 131 77 C131 111 114 137 90 138 C66 137 49 111 49 77 Z" fill="url(#skin-${uid})"/>
      <g class="persona-male">
        <path class="beard-shape" d="M52 93 C55 122 70 138 90 139 C110 138 125 122 128 93 C122 110 110 120 90 120 C70 120 58 110 52 93 Z" fill="#3b2e27" fill-opacity="0.72"/>
      </g>
      <path d="M49 77 C49 52 65 42 90 42 C115 42 131 52 131 77 C122 59 108 52 90 52 C72 52 58 59 49 77 Z" fill="#3a2c24" fill-opacity="0.88"/>
      <g class="companion-brows">
        <path d="M62 71 Q71.5 65.5 81 69.5" fill="none" stroke="#47362b" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M99 69.5 Q108.5 65.5 118 71" fill="none" stroke="#47362b" stroke-width="2.5" stroke-linecap="round"/>
      </g>
      <g class="companion-eyes">
        <g>
          <path d="M62.5 79.5 Q71.5 74.5 80.5 79.5" fill="none" stroke="#9e7f5a" stroke-opacity="0.45" stroke-width="1.2" stroke-linecap="round"/>
          <ellipse cx="71.5" cy="82.5" rx="8.2" ry="4.9" fill="#fdf9ef"/>
          <circle cx="71.8" cy="82.5" r="3.7" fill="#352820"/>
          <circle cx="73.3" cy="81.1" r="1.25" fill="#fff8e5"/>
          <path d="M62.5 82 Q71.5 75.5 80.5 82" fill="none" stroke="#30221a" stroke-width="2" stroke-linecap="round"/>
        </g>
        <g>
          <path d="M99.5 79.5 Q108.5 74.5 117.5 79.5" fill="none" stroke="#9e7f5a" stroke-opacity="0.45" stroke-width="1.2" stroke-linecap="round"/>
          <ellipse cx="108.5" cy="82.5" rx="8.2" ry="4.9" fill="#fdf9ef"/>
          <circle cx="108.2" cy="82.5" r="3.7" fill="#352820"/>
          <circle cx="109.7" cy="81.1" r="1.25" fill="#fff8e5"/>
          <path d="M99.5 82 Q108.5 75.5 117.5 82" fill="none" stroke="#30221a" stroke-width="2" stroke-linecap="round"/>
        </g>
      </g>
      <path d="M90 80 L87.5 98 Q90 101 93.5 98" fill="none" stroke="#b49164" stroke-width="1.7" stroke-linecap="round"/>
      <g class="companion-mouth">
        <path class="mouth-cavity" d="M77 113 Q90 113 103 113 Q90 113 77 113 Z" fill="#462221"/>
        <path class="mouth-tongue" d="M82 117 Q90 115 98 117 Q90 120 82 117 Z" fill="#8f4c48" opacity="0"/>
        <path class="mouth-teeth" d="M81 112.5 Q90 113.5 99 112.5 L98 115 Q90 115.6 82 115 Z" fill="#f8f1e4" opacity="0"/>
        <path class="lip-upper" d="M77 113 Q84 110.5 90 112 Q96 110.5 103 113" fill="none" stroke="#8d5349" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>
        <path class="lip-lower" d="M78 113.5 Q90 116.5 102 113.5" fill="none" stroke="#a6695d" stroke-width="2.1" stroke-linecap="round"/>
      </g>
      <path class="chin-line" d="M82 127 Q90 129.5 98 127" fill="none" stroke="#b9966b" stroke-opacity="0.48" stroke-width="1.4" stroke-linecap="round"/>
    </g>
  </g>
  <circle cx="90" cy="90" r="84.5" fill="none" stroke="#e8c88f" stroke-opacity="0.72" stroke-width="1.8"/>
  <circle class="companion-ring" cx="90" cy="90" r="88" fill="none" stroke="#f1ddac" stroke-opacity="0.32" stroke-width="1.3" stroke-dasharray="7 5"/>
</svg>`;
}

let uidSeq=0;

function applyMouthGeometry(card,pose){
  const cx=90, cy=113;
  const open=Math.max(0,Math.min(1.15,pose.open));
  const halfW=13.2*pose.width;
  const topY=cy-open*2.2-(pose.press*0.3);
  const botY=cy+open*11.8+(pose.bite*1.2);
  const leftX=cx-halfW;
  const rightX=cx+halfW;
  const cornerY=cy+open*1.0+(pose.round*1.4)-(pose.width>1.08?1.1:0);
  const ctrlX=halfW*0.56;

  const cavity=card.querySelector('.mouth-cavity');
  const teeth=card.querySelector('.mouth-teeth');
  const tongue=card.querySelector('.mouth-tongue');
  const lipUp=card.querySelector('.lip-upper');
  const lipLo=card.querySelector('.lip-lower');
  const chin=card.querySelector('.chin-line');

  if(cavity){
    if(open>0.04){
      const d=`M${leftX.toFixed(1)} ${cornerY.toFixed(1)} Q${cx} ${(topY-open*1.2).toFixed(1)} ${rightX.toFixed(1)} ${cornerY.toFixed(1)} Q${cx} ${(botY+open*1.8).toFixed(1)} ${leftX.toFixed(1)} ${cornerY.toFixed(1)} Z`;
      cavity.setAttribute('d',d);
      cavity.style.opacity='1';
    }else{
      cavity.style.opacity='0';
    }
  }
  if(teeth){
    const showTeeth=(pose.teeth>0.05&&(open>0.12||pose.bite>0.3))?Math.min(1,pose.teeth*(pose.bite>0.3?1:Math.min(1,open*2.4))):0;
    if(showTeeth>0.05){
      const tw=halfW*0.72;
      const tTop=topY+0.6;
      const tBot=Math.min(botY-0.8,tTop+2.6+pose.bite*1.0);
      const td=`M${(cx-tw).toFixed(1)} ${(tTop+0.4).toFixed(1)} Q${cx} ${tTop.toFixed(1)} ${(cx+tw).toFixed(1)} ${(tTop+0.4).toFixed(1)} L${(cx+tw*0.9).toFixed(1)} ${tBot.toFixed(1)} Q${cx} ${(tBot+0.6).toFixed(1)} ${(cx-tw*0.9).toFixed(1)} ${tBot.toFixed(1)} Z`;
      teeth.setAttribute('d',td);
      teeth.style.opacity=showTeeth.toFixed(2);
    }else{
      teeth.style.opacity='0';
    }
  }
  if(tongue){
    const showTongue=open>0.42?Math.min(0.95,(open-0.42)*1.8):0;
    if(showTongue>0.05){
      const tw=halfW*0.56;
      const ty=botY-1.6;
      const td=`M${(cx-tw).toFixed(1)} ${ty.toFixed(1)} Q${cx} ${(ty-open*3.4).toFixed(1)} ${(cx+tw).toFixed(1)} ${ty.toFixed(1)} Q${cx} ${(botY+0.8).toFixed(1)} ${(cx-tw).toFixed(1)} ${ty.toFixed(1)} Z`;
      tongue.setAttribute('d',td);
      tongue.style.opacity=showTongue.toFixed(2);
    }else{
      tongue.style.opacity='0';
    }
  }
  if(lipUp){
    const bow=pose.round>0.5?topY-1.4:topY-2.2;
    const midDip=topY-0.4;
    const d=`M${leftX.toFixed(1)} ${cornerY.toFixed(1)} Q${(cx-ctrlX).toFixed(1)} ${bow.toFixed(1)} ${cx} ${midDip.toFixed(1)} Q${(cx+ctrlX).toFixed(1)} ${bow.toFixed(1)} ${rightX.toFixed(1)} ${cornerY.toFixed(1)}`;
    lipUp.setAttribute('d',d);
    lipUp.setAttribute('stroke-width',(2.3+pose.press*0.65).toFixed(2));
  }
  if(lipLo){
    const loEdge=botY+1.6-(pose.bite*1.8);
    const d=`M${(leftX+0.8).toFixed(1)} ${(cornerY+0.4).toFixed(1)} Q${cx} ${loEdge.toFixed(1)} ${(rightX-0.8).toFixed(1)} ${(cornerY+0.4).toFixed(1)}`;
    lipLo.setAttribute('d',d);
  }
  if(chin){
    chin.style.transform=`translateY(${(open*2.8).toFixed(2)}px)`;
  }
}

function syncDom(){
  const allow=motionAllowed();
  const pose=allow?state.cur:POSES.rest;
  for(const host of state.mounted){
    if(!host.isConnected){state.mounted.delete(host);continue}
    const card=host.querySelector('.companion-card');
    if(!card)continue;
    card.dataset.state=state.mode;
    card.dataset.persona=state.persona;
    card.dataset.hidden=state.hidden?'true':'false';
    card.dataset.motion=allow?'on':'off';
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
    applyMouthGeometry(card,pose);
    const halo=card.querySelector('.companion-halo');
    if(halo){
      const boost=allow?state.energy:0;
      halo.style.opacity=(state.mode==='speaking'?.54+boost*.46:state.mode==='listening'?.68:.34).toFixed(3);
      halo.style.transform=`scale(${(1+boost*.13).toFixed(3)})`;
    }
    const brows=card.querySelector('.companion-brows');
    if(brows){
      const dy=allow&&state.mode==='speaking'?-Math.min(2.6,state.energy*3.5):0;
      brows.style.transform=`translateY(${dy.toFixed(2)}px)`;
    }
    const head=card.querySelector('.companion-head');
    if(head){
      if(allow&&state.mode==='speaking'){
        const t=performance.now()*0.0017;
        const rot=(Math.sin(t)*1.2+Math.sin(t*2.1)*state.energy*1.5);
        const ty=Math.sin(t*1.25)*1.1-state.energy*1.1;
        head.style.transform=`translateY(${ty.toFixed(2)}px) rotate(${rot.toFixed(2)}deg)`;
      }else if(allow&&state.mode==='listening'){
        head.style.transform='translateY(1px) rotate(-1.6deg)';
      }else{
        head.style.transform='translateY(0px) rotate(0deg)';
      }
    }
  }
}

function scheduleBlink(){
  clearTimeout(state.blinkTimer);
  const delay=3200+Math.random()*3400;
  state.blinkTimer=setTimeout(()=>{
    if(motionAllowed()&&!state.hidden){
      for(const host of state.mounted){
        const eyes=host.querySelector('.companion-eyes');
        if(eyes){
          eyes.classList.add('blinking');
          setTimeout(()=>eyes.classList.remove('blinking'),135);
        }
      }
    }
    scheduleBlink();
  },delay);
}
scheduleBlink();

function stepPoseToward(targetName,energyBoost,dtMs){
  const tPose=POSES[targetName]||POSES.rest;
  const norm=Math.min(2.2,Math.max(0.4,dtMs/16.67));
  const targetOpen=tPose.press>0.5||tPose.bite>0.5
    ?tPose.open
    :tPose.open>0.05
      ?Math.max(0.14,tPose.open*(0.62+energyBoost*0.62))
      :0;
  const openRate=targetOpen>state.cur.open?0.52:0.32;
  const kOpen=1-Math.pow(1-openRate,norm);
  const kShape=1-Math.pow(1-0.44,norm);
  state.cur.open+=(targetOpen-state.cur.open)*kOpen;
  state.cur.width+=(tPose.width-state.cur.width)*kShape;
  state.cur.round+=(tPose.round-state.cur.round)*kShape;
  state.cur.bite+=(tPose.bite-state.cur.bite)*kShape;
  state.cur.teeth+=(tPose.teeth-state.cur.teeth)*kShape;
  state.cur.press+=(tPose.press-state.cur.press)*kShape;
}

function buildTextTimeline(chunk,rate){
  const r=Math.max(0.5,Number(rate)||0.85);
  const basePhonemeMs=68/r;
  const events=[];
  const wordAnchors=[];
  const tokenRe=/[A-Za-z'’]+|[.,!?;:—–]|\s+/g;
  let t=0;
  let m;
  while((m=tokenRe.exec(chunk))!==null){
    const tok=m[0];
    if(/^\s+$/.test(tok)){
      events.push({t,v:'rest',e:0.08});
      t+=28/r;
      continue;
    }
    if(/^[.,!?;:—–]$/.test(tok)){
      events.push({t,v:'rest',e:0.0});
      t+=(tok===','||tok===';'||tok===':'?195:320)/r;
      continue;
    }
    const wordStart=m.index;
    const raw=tok.toLowerCase().replace(/[^a-z]/g,'');
    if(!raw)continue;
    const visemes=[];
    let i=0;
    const cleaned=raw.length>3&&raw.endsWith('e')&&!'aeiou'.includes(raw[raw.length-2])&&raw!=='thee'?raw.slice(0,-1):raw;
    while(i<cleaned.length){
      const two=cleaned.slice(i,i+2);
      const three=cleaned.slice(i,i+3);
      if(three==='igh'){visemes.push({v:'open',w:1.35});i+=3}
      else if(two==='th'){visemes.push({v:'th',w:0.85});i+=2}
      else if(two==='ph'){visemes.push({v:'fv',w:0.85});i+=2}
      else if(two==='sh'||two==='ch'||two==='wh'||two==='ck'||two==='ng'){visemes.push({v:two==='wh'?'round':'mid',w:0.85});i+=2}
      else if(two==='oo'||two==='ou'||two==='ow'||two==='qu'){visemes.push({v:'round',w:1.3});i+=2}
      else if(two==='ee'||two==='ea'||two==='ai'||two==='ay'||two==='ie'){visemes.push({v:'wide',w:1.25});i+=2}
      else if(two==='au'||two==='aw'){visemes.push({v:'open',w:1.3});i+=2}
      else if(two==='gh'){i+=2}
      else{
        const ch=cleaned[i++];
        if('mbp'.includes(ch))visemes.push({v:'mbp',w:0.75});
        else if('fv'.includes(ch))visemes.push({v:'fv',w:0.85});
        else if('ouw'.includes(ch))visemes.push({v:'round',w:1.2});
        else if(ch==='a')visemes.push({v:'open',w:1.25});
        else if('eiy'.includes(ch))visemes.push({v:'wide',w:1.15});
        else visemes.push({v:'mid',w:0.8});
      }
    }
    const compact=[];
    for(const item of visemes){
      if(compact.length&&compact[compact.length-1].v===item.v){
        compact[compact.length-1].w+=item.w*0.45;
      }else compact.push({...item});
    }
    const anchorStartT=t;
    for(const item of compact){
      const e=item.v==='open'?0.82:item.v==='round'||item.v==='wide'?0.64:item.v==='mid'||item.v==='th'?0.44:0.22;
      events.push({t,v:item.v,e});
      t+=basePhonemeMs*item.w;
    }
    wordAnchors.push({charStart:wordStart,charEnd:wordStart+tok.length,tStart:anchorStartT,tEnd:t});
  }
  events.push({t,v:'rest',e:0});
  return {events,wordAnchors,totalMs:t};
}

function runLoop(now){
  const dt=state.lastFrame?Math.min(50,now-state.lastFrame):16.67;
  state.lastFrame=now;

  if(state.audioSync){
    const {analyser,getTimeSec,visemeCues,bins}=state.audioSync;
    let rms=0;
    if(analyser&&bins){
      analyser.getByteTimeDomainData(bins);
      let sum=0;
      for(let i=0;i<bins.length;i++){
        const v=(bins[i]-128)/128;
        sum+=v*v;
      }
      rms=Math.min(1,Math.sqrt(sum/bins.length)*4.6);
    }
    const alpha=rms>state.energy?0.55:0.28;
    state.energy=state.energy*(1-alpha)+rms*alpha;
    const t=getTimeSec()+0.035;
    let v='rest';
    if(visemeCues.length){
      let lo=0,hi=visemeCues.length-1,idx=-1;
      while(lo<=hi){
        const mid=(lo+hi)>>1;
        if(visemeCues[mid].t<=t){idx=mid;lo=mid+1}else hi=mid-1;
      }
      if(idx>=0)v=visemeCues[idx].v;
    }
    if(state.energy<0.032&&v!=='mbp'&&v!=='fv')v='rest';
    else if(v==='rest'&&state.energy>0.14)v=state.energy>0.42?'open':'mid';
    state.targetViseme=v;
    stepPoseToward(v,state.energy,dt);
    syncDom();
    state.rafId=requestAnimationFrame(runLoop);
    return;
  }

  if(state.textSync){
    const ts=state.textSync;
    const elapsed=(now-ts.anchorRealMs)*ts.paceScale;
    const curT=ts.anchorTimelineMs+elapsed;
    const evs=ts.timeline.events;
    let lo=0,hi=evs.length-1,idx=0;
    while(lo<=hi){
      const mid=(lo+hi)>>1;
      if(evs[mid].t<=curT){idx=mid;lo=mid+1}else hi=mid-1;
    }
    const ev=evs[idx]||{v:'rest',e:0};
    state.energy=state.energy*0.65+ev.e*0.35;
    state.targetViseme=ev.v;
    stepPoseToward(ev.v,state.energy,dt);
    syncDom();
    state.rafId=requestAnimationFrame(runLoop);
    return;
  }

  // Smoothly settle back to serene rest when idle
  state.energy*=0.82;
  stepPoseToward('rest',0,dt);
  syncDom();
  if(state.cur.open>0.01||Math.abs(state.cur.width-1)>0.01||state.energy>0.01){
    state.rafId=requestAnimationFrame(runLoop);
  }else{
    state.cur={...POSES.rest};
    state.energy=0;
    state.rafId=0;
    state.lastFrame=0;
    syncDom();
  }
}

function ensureLoop(){
  if(!state.rafId){
    state.lastFrame=0;
    state.rafId=requestAnimationFrame(runLoop);
  }
}

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
    state.audioSync=null;
    state.textSync=null;
    ensureLoop();
  }
  syncDom();
}

export function stopCompanionSync(){
  state.audioSync=null;
  state.textSync=null;
  ensureLoop();
}

export function startAudioSync(analyser,getTimeSec,visemeCues){
  state.textSync=null;
  const bins=analyser?new Uint8Array(analyser.fftSize):null;
  state.audioSync={analyser,getTimeSec,visemeCues:visemeCues||[],bins};
  ensureLoop();
}

export function startTextSync(chunk,rate=0.85){
  state.audioSync=null;
  const timeline=buildTextTimeline(chunk,rate);
  const now=performance.now();
  state.textSync={
    timeline,
    startRealMs:now,
    anchorRealMs:now,
    anchorTimelineMs:0,
    lastBoundaryRealMs:0,
    lastBoundaryTimelineMs:0,
    paceScale:1.0
  };
  ensureLoop();
}

export function syncWordBoundary(charIndex){
  const ts=state.textSync;
  if(!ts||typeof charIndex!=='number'||charIndex<0)return;
  const anchor=ts.timeline.wordAnchors.find(w=>charIndex>=w.charStart&&charIndex<=w.charEnd)
    ||ts.timeline.wordAnchors.find(w=>w.charStart>=charIndex);
  if(!anchor)return;
  const now=performance.now();
  if(ts.lastBoundaryRealMs>0){
    const dReal=now-ts.lastBoundaryRealMs;
    const dTime=anchor.tStart-ts.lastBoundaryTimelineMs;
    if(dReal>70&&dTime>70){
      const measured=Math.max(0.55,Math.min(1.65,dTime/dReal));
      ts.paceScale=ts.paceScale*0.55+measured*0.45;
    }
  }
  ts.lastBoundaryRealMs=now;
  ts.lastBoundaryTimelineMs=anchor.tStart;
  ts.anchorRealMs=now;
  ts.anchorTimelineMs=anchor.tStart;
}
