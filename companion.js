const PREF_KEY='oravigil-companion';
const readPref=()=>{try{return JSON.parse(localStorage.getItem(PREF_KEY))||{}}catch{return {}}};
const writePref=v=>{try{localStorage.setItem(PREF_KEY,JSON.stringify(v))}catch{}};

const POSES={
  rest: {open:0.00,width:1.00,round:0.00,bite:0.00,teeth:0.00,press:0.0},
  mbp:  {open:0.00,width:0.90,round:0.00,bite:0.00,teeth:0.00,press:1.0},
  fv:   {open:0.16,width:0.95,round:0.00,bite:1.00,teeth:0.90,press:0.0},
  th:   {open:0.26,width:0.98,round:0.00,bite:0.35,teeth:0.80,press:0.0},
  wide: {open:0.34,width:1.18,round:0.00,bite:0.00,teeth:0.65,press:0.0},
  mid:  {open:0.42,width:1.00,round:0.15,bite:0.00,teeth:0.48,press:0.0},
  open: {open:0.82,width:0.94,round:0.16,bite:0.00,teeth:0.50,press:0.0},
  round:{open:0.60,width:0.56,round:1.00,bite:0.00,teeth:0.10,press:0.0}
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
    <clipPath id="eyeL-${uid}"><path d="M66.8 82.2 Q74.5 76.8 82.2 82.2 Q74.5 85.8 66.8 82.2 Z"/></clipPath>
    <clipPath id="eyeR-${uid}"><path d="M97.8 82.2 Q105.5 76.8 113.2 82.2 Q105.5 85.8 97.8 82.2 Z"/></clipPath>
    <radialGradient id="bg-${uid}" cx="50%" cy="36%" r="68%">
      <stop offset="0%" stop-color="#2b5265"/>
      <stop offset="65%" stop-color="#152c39"/>
      <stop offset="100%" stop-color="#0c1b25"/>
    </radialGradient>
    <radialGradient id="halo-${uid}" cx="50%" cy="46%" r="52%">
      <stop offset="0%" stop-color="#f7dfa3" stop-opacity="0.52"/>
      <stop offset="56%" stop-color="#e2be79" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#e2be79" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="skin-${uid}" cx="44%" cy="34%" r="68%">
      <stop offset="0%" stop-color="#f8efe0"/>
      <stop offset="58%" stop-color="#ead5b3"/>
      <stop offset="100%" stop-color="#cfa97f"/>
    </radialGradient>
    <linearGradient id="hair-${uid}" x1="35%" y1="0%" x2="65%" y2="100%">
      <stop offset="0%" stop-color="#584031"/>
      <stop offset="48%" stop-color="#3a291f"/>
      <stop offset="100%" stop-color="#231812"/>
    </linearGradient>
    <linearGradient id="beard-${uid}" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#433024"/>
      <stop offset="65%" stop-color="#302219"/>
      <stop offset="100%" stop-color="#211711"/>
    </linearGradient>
    <linearGradient id="veil-${uid}" x1="45%" y1="0%" x2="55%" y2="100%">
      <stop offset="0%" stop-color="#284a5e"/>
      <stop offset="60%" stop-color="#183242"/>
      <stop offset="100%" stop-color="#0f212c"/>
    </linearGradient>
    <linearGradient id="robe-${uid}" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#224152"/>
      <stop offset="100%" stop-color="#10222d"/>
    </linearGradient>
  </defs>
  <g clip-path="url(#clip-${uid})">
    <rect width="180" height="180" fill="url(#bg-${uid})"/>
    <path d="M32 180 V80 A58 58 0 0 1 148 80 V180" fill="none" stroke="#e8c88f" stroke-opacity="0.22" stroke-width="1.3"/>
    <path d="M42 180 V82 A48 48 0 0 1 138 82 V180" fill="none" stroke="#e8c88f" stroke-opacity="0.13" stroke-width="1"/>
    <circle class="companion-halo" cx="90" cy="84" r="68" fill="url(#halo-${uid})"/>
    <g class="companion-body">
      <path d="M20 186 C27 151 54 139 90 139 C126 139 153 151 160 186 Z" fill="url(#robe-${uid})" stroke="#e8c88f" stroke-opacity="0.38" stroke-width="1.2"/>
      <path d="M70 141 L90 162 L110 141" fill="none" stroke="#e8c88f" stroke-opacity="0.72" stroke-width="1.7"/>
      <path d="M90 162 V175 M85.5 168 H94.5" stroke="#e8c88f" stroke-opacity="0.68" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M80 124 V143 C80 148 100 148 100 143 V124 Z" fill="#dcbf96"/>
      <path d="M80 126 Q90 135 100 126 V132 Q90 140 80 132 Z" fill="#9c7850" fill-opacity="0.28"/>
    </g>
    <g class="companion-head">
      <g class="persona-female">
        <path d="M35 172 C34 104 46 31 90 29 C134 31 146 104 145 172 C131 160 122 148 119 132 L123 84 C123 50 109 36 90 36 C71 36 57 50 57 84 L61 132 C58 148 49 160 35 172 Z" fill="url(#veil-${uid})" stroke="#e8c88f" stroke-opacity="0.58" stroke-width="1.4"/>
        <path d="M43 166 C42 106 52 38 90 36 C128 38 138 106 137 166" fill="none" stroke="#e8c88f" stroke-opacity="0.32" stroke-width="1.1"/>
        <path d="M51 94 C50 62 63 36 90 36 C117 36 130 62 129 94 C129 116 124 134 116 144 C109 138 105 132 104 124 L76 124 C75 132 71 138 64 144 C56 134 51 116 51 94 Z" fill="url(#hair-${uid})"/>
      </g>
      <g class="persona-male">
        <path d="M52 86 C50 50 63 26 90 25 C117 26 130 50 128 86 C125 91 122 90 121 84 L121 64 C118 45 106 38 90 38 C74 38 62 45 59 64 L59 84 C58 90 55 91 52 86 Z" fill="url(#hair-${uid})"/>
      </g>
      <g class="companion-ears">
        <ellipse cx="57" cy="88.5" rx="4" ry="8.2" fill="#dfc297"/>
        <path d="M56.8 84.5 Q55 88.5 57.2 92" fill="none" stroke="#b99468" stroke-opacity="0.55" stroke-width="1" stroke-linecap="round"/>
        <ellipse cx="123" cy="88.5" rx="4" ry="8.2" fill="#dfc297"/>
        <path d="M123.2 84.5 Q125 88.5 122.8 92" fill="none" stroke="#b99468" stroke-opacity="0.55" stroke-width="1" stroke-linecap="round"/>
      </g>
      <path class="face-base" d="M58 76 C58 49 71 40 90 40 C109 40 122 49 122 76 C122 96 113 115 102 127 C97 132.5 93.5 134.5 90 134.5 C86.5 134.5 83 132.5 78 127 C67 115 58 96 58 76 Z" fill="url(#skin-${uid})"/>
      <path d="M61 88 C62 104 70 118 80 126 C72 119 63 106 61 88 Z M119 88 C118 104 110 118 100 126 C108 119 117 106 119 88 Z" fill="#b98e62" fill-opacity="0.12"/>
      <ellipse cx="69" cy="95" rx="6.5" ry="3.5" fill="#cf8f78" fill-opacity="0.12"/>
      <ellipse cx="111" cy="95" rx="6.5" ry="3.5" fill="#cf8f78" fill-opacity="0.12"/>
      <g class="persona-male">
        <path class="beard-shape" d="M58.5 89 C58.5 112 67 128 78 135 C83 138 86.5 139 90 139 C93.5 139 97 138 102 135 C113 128 121.5 112 121.5 89 C119.5 96 117 101 113 104.5 C109 107 105 103.5 101 102 C97 100.5 93 101 90 102 C87 101 83 100.5 79 102 C75 103.5 71 107 67 104.5 C63 101 60.5 96 58.5 89 Z M75.5 106 C79.5 104.2 85 104 90 104.5 C95 104 100.5 104.2 104.5 106 C106.5 111 104.2 116.5 99.5 119 C95.5 121 93 119 90 119 C87 119 84.5 121 80.5 119 C75.8 116.5 73.5 111 75.5 106 Z" fill="url(#beard-${uid})" fill-opacity="0.90" fill-rule="evenodd"/>
        <path d="M69 118 C75 129 83 134 90 135 C97 134 105 129 111 118" fill="none" stroke="#5c4536" stroke-opacity="0.32" stroke-width="1.3" stroke-linecap="round"/>
      </g>
      <g class="persona-male">
        <path d="M53.5 84 C51.5 47 64 25 90 24.5 C115 25 128.5 46 126.5 84 C124.5 88 122 87 121.5 80 C121 69 119 60 114.5 55 C107 49 95 48 82 51.5 C76 53 72 52.5 69.5 49.5 C67 54 62 60 59.5 72 C58.8 77 58.5 82 58 85 C56.5 88 54.5 87 53.5 84 Z" fill="url(#hair-${uid})"/>
        <path d="M70 46 C82 35 103 34 116 47" fill="none" stroke="#765a47" stroke-opacity="0.45" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M75 39 C87 31 102 31 113 40" fill="none" stroke="#765a47" stroke-opacity="0.34" stroke-width="1.3" stroke-linecap="round"/>
        <path d="M58 58 C61 45 68 37 78 33" fill="none" stroke="#765a47" stroke-opacity="0.32" stroke-width="1.2" stroke-linecap="round"/>
      </g>
      <g class="persona-female">
        <path d="M55 96 C54 60 64 35 90 35 C116 35 126 60 125 96 C123 76 118 62 111 54 C104 47 96 46 90 49.5 C84 46 76 47 69 54 C62 62 57 76 55 96 Z" fill="url(#hair-${uid})"/>
        <path d="M62 58 C69 47 79 43 89 47 M118 58 C111 47 101 43 91 47" fill="none" stroke="#765a47" stroke-opacity="0.45" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M58 76 C60 63 65 54 72 49 M122 76 C120 63 115 54 108 49" fill="none" stroke="#765a47" stroke-opacity="0.32" stroke-width="1.2" stroke-linecap="round"/>
      </g>
      <g class="companion-brows">
        <path d="M66.2 73.2 Q74.5 68.5 82.6 71.2 Q74.5 70.6 66.2 73.2 Z" fill="#443227" stroke="#443227" stroke-width="1.1" stroke-linejoin="round"/>
        <path d="M113.8 73.2 Q105.5 68.5 97.4 71.2 Q105.5 70.6 113.8 73.2 Z" fill="#443227" stroke="#443227" stroke-width="1.1" stroke-linejoin="round"/>
      </g>
      <g class="companion-eyes">
        <g>
          <path d="M66.8 78.6 Q74.5 74.6 82.2 79" fill="none" stroke="#a6845c" stroke-opacity="0.48" stroke-width="1.1" stroke-linecap="round"/>
          <path d="M66.8 82.2 Q74.5 76.8 82.2 82.2 Q74.5 85.8 66.8 82.2 Z" fill="#fdf9ef"/>
          <g clip-path="url(#eyeL-${uid})">
            <circle cx="74.6" cy="81.6" r="3.6" fill="#463427"/>
            <circle cx="74.6" cy="81.6" r="1.8" fill="#1a120e"/>
            <circle cx="76" cy="80.5" r="1.05" fill="#fff9e8"/>
          </g>
          <path d="M66.5 82.2 Q74.5 76.5 82.5 82.2" fill="none" stroke="#2c1f17" stroke-width="1.75" stroke-linecap="round"/>
          <path d="M68.5 83.4 Q74.5 85.4 80.5 83.4" fill="none" stroke="#a6845c" stroke-opacity="0.38" stroke-width="0.9" stroke-linecap="round"/>
        </g>
        <g>
          <path d="M97.8 79 Q105.5 74.6 113.2 78.6" fill="none" stroke="#a6845c" stroke-opacity="0.48" stroke-width="1.1" stroke-linecap="round"/>
          <path d="M97.8 82.2 Q105.5 76.8 113.2 82.2 Q105.5 85.8 97.8 82.2 Z" fill="#fdf9ef"/>
          <g clip-path="url(#eyeR-${uid})">
            <circle cx="105.4" cy="81.6" r="3.6" fill="#463427"/>
            <circle cx="105.4" cy="81.6" r="1.8" fill="#1a120e"/>
            <circle cx="106.8" cy="80.5" r="1.05" fill="#fff9e8"/>
          </g>
          <path d="M97.5 82.2 Q105.5 76.5 113.5 82.2" fill="none" stroke="#2c1f17" stroke-width="1.75" stroke-linecap="round"/>
          <path d="M99.5 83.4 Q105.5 85.4 111.5 83.4" fill="none" stroke="#a6845c" stroke-opacity="0.38" stroke-width="0.9" stroke-linecap="round"/>
        </g>
      </g>
      <path d="M90.5 79.5 L92.2 94.5 Q90 97.2 87.5 95.5 Z" fill="#b99266" fill-opacity="0.22"/>
      <path d="M86 95.8 Q88 97.5 90 96.7 Q92 97.5 94 95.8" fill="none" stroke="#b38d62" stroke-opacity="0.72" stroke-width="1.3" stroke-linecap="round"/>
      <g class="companion-mouth">
        <path class="mouth-cavity" d="M79.5 109.5 Q90 109.5 100.5 109.5 Q90 109.5 79.5 109.5 Z" fill="#462221"/>
        <path class="mouth-tongue" d="M84 113.5 Q90 112 96 113.5 Q90 115.5 84 113.5 Z" fill="#8f4c48" opacity="0"/>
        <path class="mouth-teeth" d="M82.5 109 Q90 109.7 97.5 109 L96.5 111 Q90 111.5 83.5 111 Z" fill="#f8f1e4" opacity="0"/>
        <path class="lip-upper" d="M79.5 109.5 Q84.8 107.4 90 108.7 Q95.2 107.4 100.5 109.5" fill="none" stroke="#9b5c51" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        <path class="lip-lower" d="M80.5 110 Q90 112.5 99.5 110" fill="none" stroke="#b47467" stroke-width="2" stroke-linecap="round"/>
      </g>
      <path class="chin-line" d="M84.5 124.8 Q90 126.5 95.5 124.8" fill="none" stroke="#b9966b" stroke-opacity="0.34" stroke-width="1.1" stroke-linecap="round"/>
    </g>
  </g>
  <circle cx="90" cy="90" r="84.5" fill="none" stroke="#e8c88f" stroke-opacity="0.72" stroke-width="1.8"/>
  <circle class="companion-ring" cx="90" cy="90" r="88" fill="none" stroke="#f1ddac" stroke-opacity="0.32" stroke-width="1.3" stroke-dasharray="7 5"/>
</svg>`;
}

let uidSeq=0;

function applyMouthGeometry(card,pose){
  const cx=90, cy=109;
  const open=Math.max(0,Math.min(0.92,pose.open));
  const halfW=10.6*pose.width;
  const topY=cy-open*1.4-(pose.press*0.25);
  const serenity=open<0.06&&pose.press<0.2?-0.75:0;
  const cornerY=cy+serenity+open*0.6+(pose.round*0.8)-(pose.width>1.08?0.8:0);
  const botCtrlY=cy+open*13.0+(pose.bite*0.9);
  const cavVisualTop=(cornerY+(topY-open*0.8))/2;
  const cavVisualBot=(cornerY+botCtrlY)/2;
  const leftX=cx-halfW;
  const rightX=cx+halfW;
  const ctrlX=halfW*0.56;

  const cavity=card.querySelector('.mouth-cavity');
  const teeth=card.querySelector('.mouth-teeth');
  const tongue=card.querySelector('.mouth-tongue');
  const lipUp=card.querySelector('.lip-upper');
  const lipLo=card.querySelector('.lip-lower');
  const chin=card.querySelector('.chin-line');

  if(cavity){
    if(open>0.04){
      const d=`M${leftX.toFixed(1)} ${cornerY.toFixed(1)} Q${cx} ${(topY-open*0.8).toFixed(1)} ${rightX.toFixed(1)} ${cornerY.toFixed(1)} Q${cx} ${botCtrlY.toFixed(1)} ${leftX.toFixed(1)} ${cornerY.toFixed(1)} Z`;
      cavity.setAttribute('d',d);
      cavity.style.opacity='1';
    }else{
      cavity.style.opacity='0';
    }
  }
  if(teeth){
    const showTeeth=(pose.teeth>0.05&&(open>0.12||pose.bite>0.3))?Math.min(1,pose.teeth*(pose.bite>0.3?1:Math.min(1,open*2.4))):0;
    if(showTeeth>0.05){
      const tw=halfW*0.66;
      const tTop=cavVisualTop+0.2;
      const tBot=Math.min(cavVisualBot-0.6,tTop+2.1+pose.bite*0.8);
      if(tBot>tTop+0.4){
        const td=`M${(cx-tw).toFixed(1)} ${(tTop+0.3).toFixed(1)} Q${cx} ${tTop.toFixed(1)} ${(cx+tw).toFixed(1)} ${(tTop+0.3).toFixed(1)} L${(cx+tw*0.88).toFixed(1)} ${tBot.toFixed(1)} Q${cx} ${(tBot+0.4).toFixed(1)} ${(cx-tw*0.88).toFixed(1)} ${tBot.toFixed(1)} Z`;
        teeth.setAttribute('d',td);
        teeth.style.opacity=showTeeth.toFixed(2);
      }else{
        teeth.style.opacity='0';
      }
    }else{
      teeth.style.opacity='0';
    }
  }
  if(tongue){
    const showTongue=open>0.44?Math.min(0.88,(open-0.44)*1.9):0;
    if(showTongue>0.05){
      const tw=halfW*0.5;
      const ty=cavVisualBot-0.7;
      const td=`M${(cx-tw).toFixed(1)} ${ty.toFixed(1)} Q${cx} ${(ty-open*2.1).toFixed(1)} ${(cx+tw).toFixed(1)} ${ty.toFixed(1)} Q${cx} ${(cavVisualBot+0.4).toFixed(1)} ${(cx-tw).toFixed(1)} ${ty.toFixed(1)} Z`;
      tongue.setAttribute('d',td);
      tongue.style.opacity=showTongue.toFixed(2);
    }else{
      tongue.style.opacity='0';
    }
  }
  if(lipUp){
    const bow=pose.round>0.5?topY-1.1:topY-1.7;
    const midDip=topY-0.3;
    const d=`M${leftX.toFixed(1)} ${cornerY.toFixed(1)} Q${(cx-ctrlX).toFixed(1)} ${bow.toFixed(1)} ${cx} ${midDip.toFixed(1)} Q${(cx+ctrlX).toFixed(1)} ${bow.toFixed(1)} ${rightX.toFixed(1)} ${cornerY.toFixed(1)}`;
    lipUp.setAttribute('d',d);
    lipUp.setAttribute('stroke-width',(2.2+pose.press*0.55).toFixed(2));
  }
  if(lipLo){
    const loCtrlY=botCtrlY+1.8-(pose.bite*1.4);
    const d=`M${(leftX+0.8).toFixed(1)} ${(cornerY+0.3).toFixed(1)} Q${cx} ${loCtrlY.toFixed(1)} ${(rightX-0.8).toFixed(1)} ${(cornerY+0.3).toFixed(1)}`;
    lipLo.setAttribute('d',d);
  }
  if(chin){
    chin.style.transform=`translateY(${(open*1.6).toFixed(2)}px)`;
  }
}

function syncDom(){
  const allow=motionAllowed();
  const pose=allow?state.cur:POSES.rest;
  for(const entry of state.mounted){
    if(!entry.root.isConnected){state.mounted.delete(entry);continue}
    const card=entry.root.querySelector('.companion-card');
    const stageEl=entry.stageHost?.querySelector('.companion-stage-wrap')||card;
    if(!card&&!stageEl)continue;
    for(const el of new Set([card,stageEl].filter(Boolean))){
      el.dataset.state=state.mode;
      el.dataset.persona=state.persona;
      el.dataset.hidden=state.hidden?'true':'false';
      el.dataset.motion=allow?'on':'off';
    }
    if(card){
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
    }
    if(!stageEl)continue;
    applyMouthGeometry(stageEl,pose);
    const halo=stageEl.querySelector('.companion-halo');
    if(halo){
      const boost=allow?state.energy:0;
      halo.style.opacity=(state.mode==='speaking'?.54+boost*.46:state.mode==='listening'?.68:.34).toFixed(3);
      halo.style.transform=`scale(${(1+boost*.13).toFixed(3)})`;
    }
    const brows=stageEl.querySelector('.companion-brows');
    if(brows){
      const dy=allow&&state.mode==='speaking'?-Math.min(2.6,state.energy*3.5):0;
      brows.style.transform=`translateY(${dy.toFixed(2)}px)`;
    }
    const head=stageEl.querySelector('.companion-head');
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
      for(const entry of state.mounted){
        const scope=entry.stageHost||entry.root;
        const eyes=scope.querySelector('.companion-eyes');
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
      ?Math.min(0.92,Math.max(0.14,tPose.open*(0.65+energyBoost*0.45)))
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

export function mountCompanion(container,opts={}){
  if(!container)return;
  const uid=`c${++uidSeq}`;
  const attrs=`data-state="${state.mode}" data-persona="${state.persona}" data-hidden="${state.hidden}" data-motion="${motionAllowed()?'on':'off'}"`;
  const stageTarget=opts.stageTarget||null;
  if(stageTarget){
    stageTarget.innerHTML=`<div class="companion-stage-wrap" ${attrs}><div class="companion-stage">${svgMarkup(uid)}</div></div>`;
    container.innerHTML=`<div class="companion-card companion-bar-only" ${attrs}>
      <div class="companion-meta">
        <div class="eyebrow companion-voice"></div>
        <p class="companion-detail"></p>
        <div class="companion-controls">
          <button type="button" class="subtle-button" data-companion-motion></button>
          <button type="button" class="subtle-button" data-companion-hide></button>
        </div>
      </div>
    </div>`;
  }else{
    container.innerHTML=`<div class="companion-card" ${attrs}>
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
  }
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
  for(const existing of state.mounted){
    if(existing.root===container)state.mounted.delete(existing);
  }
  state.mounted.add({root:container,stageHost:stageTarget||container});
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
