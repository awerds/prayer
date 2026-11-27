import {mountCompanion, setCompanionState} from './companion.js';

const STATE_KEY='oravigil-rosary-state';
const readState=()=>{try{return JSON.parse(localStorage.getItem(STATE_KEY))||{}}catch{return {}}};
const writeState=v=>{try{localStorage.setItem(STATE_KEY,JSON.stringify(v))}catch{}};

const PRAYERS={
  signCross:'In the name of the Father, and of the Son, and of the Holy Ghost. Amen.',
  creed:'I believe in God, the Father Almighty, Creator of heaven and earth, and in Jesus Christ, His only Son, our Lord, who was conceived by the Holy Ghost, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died, and was buried. He descended into hell; the third day He rose again from the dead; He ascended into heaven, and sitteth at the right hand of God the Father Almighty; from thence He shall come to judge the living and the dead. I believe in the Holy Ghost, the holy Catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.',
  ourFather:'Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven.\n\nGive us this day our daily bread; and forgive us our trespasses, as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.',
  hailMary:'Hail Mary, full of grace, the Lord is with thee; blessed art thou among women, and blessed is the fruit of thy womb, Jesus.\n\nHoly Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.',
  gloryBe:'Glory be to the Father, and to the Son, and to the Holy Ghost. As it was in the beginning, is now, and ever shall be, world without end. Amen.',
  fatima:'O my Jesus, forgive us our sins, save us from the fires of hell, lead all souls to Heaven, especially those most in need of Thy mercy. Amen.',
  salve:'Hail, holy Queen, Mother of mercy, our life, our sweetness and our hope. To thee do we cry, poor banished children of Eve. To thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us; and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary.\n\n℣. Pray for us, O holy Mother of God.\n℟. That we may be made worthy of the promises of Christ.',
  closing:'Let us pray. O God, whose only begotten Son, by His life, death, and resurrection, has purchased for us the rewards of eternal life, grant, we beseech Thee, that meditating upon these mysteries of the most holy Rosary of the Blessed Virgin Mary, we may imitate what they contain and obtain what they promise, through the same Christ our Lord. Amen.\n\nIn the name of the Father, and of the Son, and of the Holy Ghost. Amen.'
};

export const MYSTERIES={
  joyful:{
    key:'joyful',
    name:'Joyful Mysteries',
    latin:'Mysteria Gaudiosa',
    daysStandard:'Monday & Saturday',
    daysTraditional:'Monday, Thursday & Sundays of Advent–Epiphany',
    items:[
      {title:'The Annunciation',fruit:'Humility',ref:'Luke 1:26–38',meditation:'The Archangel Gabriel announces to Mary that she will conceive the Son of God, and she consents in humble obedience.'},
      {title:'The Visitation',fruit:'Love of Neighbor',ref:'Luke 1:39–56',meditation:'Mary travels in haste to serve her cousin Elizabeth, and Saint John the Baptist leaps for joy in the womb.'},
      {title:'The Nativity',fruit:'Poverty of Spirit',ref:'Luke 2:1–20',meditation:'The Word made flesh is born in Bethlehem and laid in a manger while angels sing glory to God in the highest.'},
      {title:'The Presentation in the Temple',fruit:'Obedience & Purity',ref:'Luke 2:22–38',meditation:'Mary and Joseph offer the Child Jesus in the Temple, where Simeon recognizes the Light of the nations.'},
      {title:'The Finding in the Temple',fruit:'Joy in Finding Jesus',ref:'Luke 2:41–52',meditation:'After three days of sorrowful search, Mary and Joseph find the twelve-year-old Jesus teaching among the doctors.'}
    ]
  },
  sorrowful:{
    key:'sorrowful',
    name:'Sorrowful Mysteries',
    latin:'Mysteria Dolorosa',
    daysStandard:'Tuesday & Friday',
    daysTraditional:'Tuesday, Friday & Sundays of Septuagesima–Lent',
    items:[
      {title:'The Agony in the Garden',fruit:'Sorrow for Sin',ref:'Matthew 26:36–46',meditation:'In Gethsemane, Christ kneels in anguish, sweating blood, and surrenders Himself wholly to the Father’s will.'},
      {title:'The Scourging at the Pillar',fruit:'Purity & Mortification',ref:'John 19:1',meditation:'Our Lord is bound to the pillar and cruelly scourged for our sins, bearing every blow in silence.'},
      {title:'The Crowning with Thorns',fruit:'Moral Courage',ref:'Matthew 27:27–31',meditation:'Soldiers press a crown of sharp thorns upon the King of kings and mock Him in purple rags.'},
      {title:'The Carrying of the Cross',fruit:'Patience in Trials',ref:'John 19:17',meditation:'Weakened by wounds, Jesus embraces the heavy wood of the Cross and walks the road to Calvary.'},
      {title:'The Crucifixion and Death',fruit:'Perseverance & Forgiveness',ref:'Luke 23:33–46',meditation:'Nailed to the Cross, Christ forgives His enemies, entrusts His Mother to us, and gives up His spirit.'}
    ]
  },
  glorious:{
    key:'glorious',
    name:'Glorious Mysteries',
    latin:'Mysteria Gloriosa',
    daysStandard:'Wednesday & Sunday',
    daysTraditional:'Wednesday, Saturday & Sundays after Easter',
    items:[
      {title:'The Resurrection',fruit:'Faith',ref:'Mark 16:1–8',meditation:'On the third day Christ rises triumphantly from the tomb, conquering sin and death forever.'},
      {title:'The Ascension',fruit:'Hope & Desire for Heaven',ref:'Acts 1:6–11',meditation:'Forty days after rising, Jesus ascends to the right hand of the Father to prepare a place for us.'},
      {title:'The Descent of the Holy Ghost',fruit:'Love of God & Zeal',ref:'Acts 2:1–13',meditation:'Tongues of fire rest upon Mary and the Apostles, filling the Church with courage to preach the Gospel.'},
      {title:'The Assumption of Mary',fruit:'Grace of a Happy Death',ref:'Revelation 12:1',meditation:'At the end of her earthly life, the Blessed Virgin Mary is taken body and soul into heavenly glory.'},
      {title:'The Coronation of Mary',fruit:'Trust in Mary’s Intercession',ref:'Revelation 12:1–5',meditation:'Our Lady is crowned Queen of Heaven and Earth, interceding continually beside her Divine Son.'}
    ]
  },
  luminous:{
    key:'luminous',
    name:'Luminous Mysteries',
    latin:'Mysteria Lucis',
    daysStandard:'Thursday',
    daysTraditional:'Optional (introduced 2002)',
    items:[
      {title:'The Baptism in the Jordan',fruit:'Openness to the Holy Spirit',ref:'Matthew 3:13–17',meditation:'As Jesus rises from the Jordan, the heavens open and the Father proclaims Him His beloved Son.'},
      {title:'The Wedding Feast at Cana',fruit:'To Jesus through Mary',ref:'John 2:1–11',meditation:'At Mary’s gentle intercession, Christ works His first miracle, turning water into fine wine.'},
      {title:'The Proclamation of the Kingdom',fruit:'Repentance & Trust',ref:'Mark 1:14–15',meditation:'Jesus proclaims the nearness of the Kingdom of God and calls sinners to conversion and mercy.'},
      {title:'The Transfiguration',fruit:'Desire for Holiness',ref:'Luke 9:28–36',meditation:'On Mount Tabor, Christ reveals His divine radiance before Peter, James, and John.'},
      {title:'The Institution of the Eucharist',fruit:'Adoration of the Blessed Sacrament',ref:'Luke 22:14–20',meditation:'At the Last Supper, Our Lord offers His Body and Blood under the appearances of bread and wine.'}
    ]
  }
};

function easterSunday(year){
  const a=year%19, b=Math.floor(year/100), c=year%100;
  const d=Math.floor(b/4), e=b%4, f=Math.floor((b+8)/25);
  const g=Math.floor((b-f+1)/3), h=(19*a+b-d-g+15)%30;
  const i=Math.floor(c/4), k=c%4;
  const l=(32+2*e+2*i-h-k)%7;
  const m=Math.floor((a+11*h+22*l)/451);
  const month=Math.floor((h+l-7*m+114)/31);
  const day=((h+l-7*m+114)%31)+1;
  return new Date(year,month-1,day);
}

function traditionalSundayMystery(date){
  const y=date.getFullYear();
  const d=new Date(y,date.getMonth(),date.getDate());
  const easter=easterSunday(y);
  const septuagesima=new Date(easter);septuagesima.setDate(easter.getDate()-63);
  const christmas=new Date(y,11,25);
  const advent1=new Date(christmas);
  advent1.setDate(25-((christmas.getDay()+6)%7+1)-21);
  const epiphanyOctave=new Date(y,0,13);
  if(d>=septuagesima&&d<easter)return {key:'sorrowful',reason:'Sunday in Septuagesima / Lent (traditional 1962 schedule)'};
  if(d>=advent1||d<=epiphanyOctave)return {key:'joyful',reason:'Sunday in Advent / Christmastide (traditional 1962 schedule)'};
  return {key:'glorious',reason:'Sunday after Easter / Pentecost (traditional 1962 schedule)'};
}

export function getAppointedMystery(date=new Date(),schedule='standard'){
  const dow=date.getDay();
  const dayNames=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  if(schedule==='traditional'){
    if(dow===0){
      const s=traditionalSundayMystery(date);
      return {...MYSTERIES[s.key],reason:s.reason};
    }
    const map={1:'joyful',2:'sorrowful',3:'glorious',4:'joyful',5:'sorrowful',6:'glorious'};
    return {...MYSTERIES[map[dow]],reason:`${dayNames[dow]} · traditional 3-mystery schedule`};
  }
  const map={0:'glorious',1:'joyful',2:'sorrowful',3:'glorious',4:'luminous',5:'sorrowful',6:'joyful'};
  return {...MYSTERIES[map[dow]],reason:`${dayNames[dow]} · standard 4-mystery schedule`};
}

function buildSteps(mysteryKey){
  const set=MYSTERIES[mysteryKey]||MYSTERIES.joyful;
  const steps=[];
  steps.push({
    id:0,beadId:'crucifix',kind:'crucifix',decade:0,
    eyebrow:'INTRODUCTORY · CRUCIFIX',
    title:'Sign of the Cross & Apostles’ Creed',
    subtitle:'Hold the crucifix and profess the faith of the Church.',
    text:`${PRAYERS.signCross}\n\n${PRAYERS.creed}`,
    label:'Crucifix — Sign of the Cross and Apostles’ Creed'
  });
  steps.push({
    id:1,beadId:'intro-pater',kind:'pater',decade:0,
    eyebrow:'INTRODUCTORY · LARGE BEAD',
    title:'Our Father',
    subtitle:'Offered for the intentions of the Holy Father.',
    text:PRAYERS.ourFather,
    label:'Introductory Our Father bead'
  });
  const virtues=['Faith','Hope','Charity'];
  for(let i=0;i<3;i++){
    steps.push({
      id:2+i,beadId:`intro-ave-${i+1}`,kind:'ave',decade:0,
      eyebrow:`INTRODUCTORY · HAIL MARY ${i+1} OF 3`,
      title:`Hail Mary — for ${virtues[i]}`,
      subtitle:`Ask for an increase in the theological virtue of ${virtues[i].toLowerCase()}.`,
      text:PRAYERS.hailMary,
      label:`Introductory Hail Mary ${i+1} of 3 for ${virtues[i]}`
    });
  }
  steps.push({
    id:5,beadId:'intro-glory',kind:'medallion',decade:0,
    eyebrow:'INTRODUCTORY · DOXOLOGY',
    title:'Glory Be',
    subtitle:`Prepare to enter the ${set.name}.`,
    text:PRAYERS.gloryBe,
    label:'Introductory Glory Be before the first decade'
  });

  const ordinals=['First','Second','Third','Fourth','Fifth'];
  for(let d=0;d<5;d++){
    const m=set.items[d];
    const dec=d+1;
    steps.push({
      id:steps.length,beadId:`d${dec}-pater`,kind:'pater',decade:dec,
      eyebrow:`${ordinals[d].toUpperCase()} MYSTERY · OUR FATHER`,
      title:`${dec}. ${m.title}`,
      subtitle:`Fruit: ${m.fruit} · ${m.ref}`,
      meditation:m.meditation,
      text:`The ${ordinals[d]} ${set.name.replace(/ Mysteries$/,'')} Mystery: ${m.title}.\n\n${PRAYERS.ourFather}`,
      label:`Decade ${dec}, Our Father — ${m.title}`
    });
    for(let h=1;h<=10;h++){
      steps.push({
        id:steps.length,beadId:`d${dec}-ave-${h}`,kind:'ave',decade:dec,
        eyebrow:`DECADE ${dec} · HAIL MARY ${h} OF 10`,
        title:m.title,
        subtitle:`Fruit: ${m.fruit} · ${m.ref}`,
        meditation:m.meditation,
        text:PRAYERS.hailMary,
        label:`Decade ${dec}, Hail Mary ${h} of 10 — ${m.title}`
      });
    }
    steps.push({
      id:steps.length,beadId:`d${dec}-close`,kind:'chain',decade:dec,
      eyebrow:`END OF DECADE ${dec}`,
      title:'Glory Be & Fatima Prayer',
      subtitle:`Closing the ${ordinals[d].toLowerCase()} decade (${m.title}).`,
      text:`${PRAYERS.gloryBe}\n\n${PRAYERS.fatima}`,
      label:`Decade ${dec} closing Glory Be and Fatima Prayer`
    });
  }

  steps.push({
    id:steps.length,beadId:'centerpiece',kind:'medallion',decade:6,
    eyebrow:'CONCLUDING PRAYERS · CENTERPIECE',
    title:'Hail, Holy Queen & Closing Prayer',
    subtitle:'Offer the completed Rosary to God through Mary.',
    text:`${PRAYERS.salve}\n\n${PRAYERS.closing}`,
    label:'Centerpiece — Hail, Holy Queen and closing Rosary prayer'
  });
  return steps;
}

function computeBeadLayout(){
  // Elliptical cathedral loop for the 5 decades (55 physical beads + centerpiece at bottom).
  // Angles go clockwise starting just left-of-bottom (Decade 1) up around the top and back to right-of-bottom (Decade 5).
  const cx=210, cy=188, rx=164, ry=152;
  const nodes=[];
  // 55 loop slots spanning angle 108° (bottom-left) clockwise to 432° (bottom-right), leaving bottom 90° for centerpiece.
  const startDeg=106, endDeg=434;
  // Build slot sequence along the loop: for each decade, 1 pater + 10 aves, with extra spacing around pater beads
  const loopSpecs=[];
  for(let d=1;d<=5;d++){
    loopSpecs.push({beadId:`d${d}-pater`,kind:'pater',decade:d,gapBefore:d===1?0:1.45});
    for(let h=1;h<=10;h++){
      loopSpecs.push({beadId:`d${d}-ave-${h}`,kind:'ave',decade:d,gapBefore:h===1?1.35:1});
    }
  }
  const totalWeight=loopSpecs.reduce((s,x)=>s+x.gapBefore,0);
  let acc=0;
  for(const spec of loopSpecs){
    acc+=spec.gapBefore;
    const deg=startDeg+(acc/totalWeight)*(endDeg-startDeg);
    const rad=deg*Math.PI/180;
    nodes.push({
      ...spec,
      x:+(cx+rx*Math.cos(rad)).toFixed(1),
      y:+(cy+ry*Math.sin(rad)).toFixed(1)
    });
  }
  // Centerpiece medallion at bottom of loop
  const center={beadId:'centerpiece',kind:'medallion',decade:6,x:cx,y:348};
  // Pendant dropping straight below centerpiece: intro-glory (implied at centerpiece link), 3 aves, 1 pater, crucifix
  const pendant=[
    {beadId:'intro-ave-3',kind:'ave',decade:0,x:cx,y:380},
    {beadId:'intro-ave-2',kind:'ave',decade:0,x:cx,y:398},
    {beadId:'intro-ave-1',kind:'ave',decade:0,x:cx,y:416},
    {beadId:'intro-pater',kind:'pater',decade:0,x:cx,y:440},
    {beadId:'crucifix',kind:'crucifix',decade:0,x:cx,y:478}
  ];
  return {loop:nodes,center,pendant,cx,cy,rx,ry};
}

const LAYOUT=computeBeadLayout();

function beadStepMap(steps){
  const map=new Map();
  for(const s of steps)map.set(s.beadId,s.id);
  return map;
}

function renderBeadsSvg(steps,activeIndex){
  const activeStep=steps[activeIndex];
  const map=beadStepMap(steps);
  const isDone=beadId=>{
    const sid=map.get(beadId);
    return sid!==undefined&&sid<activeIndex;
  };
  const isCurrent=beadId=>{
    if(activeStep.beadId===beadId)return true;
    // Highlight centerpiece on intro Glory Be, and decade's last bead/next chain on decade close
    if(activeStep.beadId==='intro-glory'&&beadId==='centerpiece')return true;
    if(activeStep.kind==='chain'&&beadId===`d${activeStep.decade}-ave-10`)return true;
    return false;
  };

  const loopPts=LAYOUT.loop;
  const chainPath=`M ${LAYOUT.center.x} ${LAYOUT.center.y} `+
    loopPts.map(p=>`L ${p.x} ${p.y}`).join(' ')+
    ` L ${LAYOUT.center.x} ${LAYOUT.center.y}`;

  const decadeLabels=[1,2,3,4,5].map(d=>{
    const fifth=loopPts.find(p=>p.beadId===`d${d}-ave-5`);
    if(!fifth)return '';
    const dx=fifth.x-LAYOUT.cx, dy=fifth.y-LAYOUT.cy;
    const len=Math.hypot(dx,dy)||1;
    const lx=(fifth.x+(dx/len)*24).toFixed(1);
    const ly=(fifth.y+(dy/len)*22+4).toFixed(1);
    const roman=['I','II','III','IV','V'][d-1];
    const activeDec=activeStep.decade===d?' active':'';
    return `<text class="rosary-roman${activeDec}" x="${lx}" y="${ly}" text-anchor="middle">${roman}</text>`;
  }).join('');

  const drawBead=node=>{
    const sid=map.get(node.beadId);
    const step=steps[sid];
    const cur=isCurrent(node.beadId);
    const done=!cur&&isDone(node.beadId);
    const cls=`rosary-bead kind-${node.kind}${cur?' is-current':''}${done?' is-done':''}`;
    const ariaCur=cur?' aria-current="step"':'';
    if(node.kind==='crucifix'){
      return `<g class="${cls}" data-step="${sid}" role="button" tabindex="0" aria-label="${step.label}"${ariaCur}>
        <circle class="bead-hit" cx="${node.x}" cy="${node.y}" r="22" fill="transparent"/>
        ${cur?`<circle class="bead-halo" cx="${node.x}" cy="${node.y}" r="22"/>`:''}
        <path class="crucifix-shape" d="M${node.x-3.5} ${node.y-18} H${node.x+3.5} V${node.y-7} H${node.x+14} V${node.y} H${node.x+3.5} V${node.y+20} H${node.x-3.5} V${node.y} H${node.x-14} V${node.y-7} H${node.x-3.5} Z"/>
        <circle cx="${node.x}" cy="${node.y-3.5}" r="2.2" fill="#142733"/>
      </g>`;
    }
    if(node.kind==='medallion'){
      return `<g class="${cls}" data-step="${sid}" role="button" tabindex="0" aria-label="${step.label}"${ariaCur}>
        <circle class="bead-hit" cx="${node.x}" cy="${node.y}" r="18" fill="transparent"/>
        ${cur?`<circle class="bead-halo" cx="${node.x}" cy="${node.y}" r="17"/>`:''}
        <circle class="bead-body" cx="${node.x}" cy="${node.y}" r="12.5"/>
        <text class="medallion-glyph" x="${node.x}" y="${node.y+4.5}" text-anchor="middle">M</text>
      </g>`;
    }
    const r=node.kind==='pater'?8.2:5.2;
    return `<g class="${cls}" data-step="${sid}" role="button" tabindex="0" aria-label="${step.label}"${ariaCur}>
      <circle class="bead-hit" cx="${node.x}" cy="${node.y}" r="12.5" fill="transparent"/>
      ${cur?`<circle class="bead-halo" cx="${node.x}" cy="${node.y}" r="${(r+5.2).toFixed(1)}"/>`:''}
      <circle class="bead-body" cx="${node.x}" cy="${node.y}" r="${r}"/>
      <circle class="bead-glint" cx="${(node.x-r*0.32).toFixed(1)}" cy="${(node.y-r*0.32).toFixed(1)}" r="${(r*0.26).toFixed(1)}"/>
    </g>`;
  };

  const progressPct=Math.round((activeIndex/(steps.length-1))*100);
  return `<svg class="rosary-svg" viewBox="0 0 420 510" role="group" aria-label="Interactive virtual Rosary beads (${progressPct}% complete)">
    <defs>
      <radialGradient id="bead-idle" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#3a6679"/>
        <stop offset="65%" stop-color="#1d3c4b"/>
        <stop offset="100%" stop-color="#0f232e"/>
      </radialGradient>
      <radialGradient id="bead-done" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#fff0c9"/>
        <stop offset="55%" stop-color="#dfb873"/>
        <stop offset="100%" stop-color="#9e7a3c"/>
      </radialGradient>
      <radialGradient id="bead-pater" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#f5dfb0"/>
        <stop offset="60%" stop-color="#b99655"/>
        <stop offset="100%" stop-color="#6c5124"/>
      </radialGradient>
    </defs>
    <path class="rosary-chain" d="${chainPath}" fill="none"/>
    <line class="rosary-chain" x1="${LAYOUT.center.x}" y1="${LAYOUT.center.y+12}" x2="${LAYOUT.center.x}" y2="462"/>
    ${decadeLabels}
    <g class="rosary-center-label" aria-hidden="true">
      <text x="${LAYOUT.cx}" y="${LAYOUT.cy-22}" text-anchor="middle" class="rosary-center-eyebrow">${steps[activeIndex].decade>=1&&steps[activeIndex].decade<=5?`DECADE ${steps[activeIndex].decade} OF 5`:steps[activeIndex].decade===6?'CLOSING':'INTRODUCTORY'}</text>
      <text x="${LAYOUT.cx}" y="${LAYOUT.cy+6}" text-anchor="middle" class="rosary-center-count">${activeIndex+1} / ${steps.length}</text>
      <text x="${LAYOUT.cx}" y="${LAYOUT.cy+28}" text-anchor="middle" class="rosary-center-pct">${progressPct}% prayed</text>
    </g>
    ${loopPts.map(drawBead).join('')}
    ${drawBead(LAYOUT.center)}
    ${LAYOUT.pendant.map(drawBead).join('')}
  </svg>`;
}

export function renderRosaryPage(main,ctx){
  const todayKey=ctx.todayKey;
  const saved=readState();
  const schedule=saved.schedule==='traditional'?'traditional':'standard';
  const appointed=getAppointedMystery(new Date(),schedule);
  let mysteryKey=(saved.date===todayKey&&MYSTERIES[saved.mysteryKey])?saved.mysteryKey:appointed.key;
  let stepIndex=(saved.date===todayKey&&saved.mysteryKey===mysteryKey&&Number.isInteger(saved.stepIndex))?saved.stepIndex:0;
  let autoAdvance=saved.autoAdvance!==false;
  let rosaryPlaying=false;
  let rosaryTimer=null;

  const persist=()=>{
    writeState({date:todayKey,schedule:curSchedule,mysteryKey,stepIndex,autoAdvance,completedDate:saved.completedDate||null});
  };
  let curSchedule=schedule;
  let steps=buildSteps(mysteryKey);
  stepIndex=Math.max(0,Math.min(steps.length-1,stepIndex));

  function clearAutoTimer(){
    clearTimeout(rosaryTimer);
    rosaryTimer=null;
  }

  function stopRosarySpeech(){
    clearAutoTimer();
    rosaryPlaying=false;
    ctx.stop();
  }

  function updateView(){
    const appToday=getAppointedMystery(new Date(),curSchedule);
    const set=MYSTERIES[mysteryKey];
    const step=steps[stepIndex];
    const isCompletedToday=readState().completedDate===todayKey;

    const beadsHost=main.querySelector('#rosary-beads-host');
    if(beadsHost){
      beadsHost.innerHTML=renderBeadsSvg(steps,stepIndex);
      bindBeadHandlers(beadsHost);
    }

    const metaEl=main.querySelector('#rosary-appointed-note');
    if(metaEl)metaEl.textContent=`Today’s appointed set: ${appToday.name} (${appToday.reason})`;

    main.querySelectorAll('[data-mystery]').forEach(b=>{
      const active=b.dataset.mystery===mysteryKey;
      b.classList.toggle('active',active);
      b.setAttribute('aria-pressed',String(active));
    });
    main.querySelectorAll('[data-schedule]').forEach(b=>{
      const active=b.dataset.schedule===curSchedule;
      b.classList.toggle('active',active);
      b.setAttribute('aria-pressed',String(active));
    });
    main.querySelectorAll('[data-decade-jump]').forEach(b=>{
      const targetDec=Number(b.dataset.decadeJump);
      b.classList.toggle('active',step.decade===targetDec);
    });

    const eyebrow=main.querySelector('#rosary-step-eyebrow');
    const title=main.querySelector('#rosary-step-title');
    const sub=main.querySelector('#rosary-step-sub');
    const med=main.querySelector('#rosary-step-meditation');
    const textEl=main.querySelector('#rosary-step-text');
    const prevBtn=main.querySelector('#rosary-prev');
    const nextBtn=main.querySelector('#rosary-next');
    const listenBtn=main.querySelector('#rosary-listen');
    const doneBanner=main.querySelector('#rosary-complete-banner');

    if(eyebrow)eyebrow.textContent=step.eyebrow;
    if(title)title.textContent=step.title;
    if(sub)sub.textContent=step.subtitle||'';
    if(med){
      med.textContent=step.meditation||'';
      med.hidden=!step.meditation;
    }
    if(textEl)textEl.textContent=step.text;
    if(prevBtn)prevBtn.disabled=stepIndex===0;
    if(nextBtn)nextBtn.textContent=stepIndex===steps.length-1?'Complete Rosary ✓':'Next bead →';
    if(listenBtn&&!rosaryPlaying)listenBtn.textContent=autoAdvance?'▶ Pray from this bead':'▶ Listen to this bead';
    if(doneBanner)doneBanner.hidden=!isCompletedToday;
    persist();
  }

  function goToStep(idx,keepPlaying=false){
    const bounded=Math.max(0,Math.min(steps.length-1,idx));
    if(!keepPlaying)stopRosarySpeech();
    stepIndex=bounded;
    updateView();
    if(keepPlaying)speakCurrentBead();
  }

  function speakCurrentBead(){
    const step=steps[stepIndex];
    const btn=main.querySelector('#rosary-listen');
    const status=main.querySelector('#rosary-speech-status');
    if(!btn||!status)return;
    rosaryPlaying=true;
    ctx.speak(step.text,btn,status,()=>{
      if(!rosaryPlaying||!main.querySelector('#rosary-listen'))return;
      if(autoAdvance&&stepIndex<steps.length-1){
        const mode=ctx.getPrefs().mode;
        const waitMs=mode==='response'?4500:1100;
        if(mode==='response'){
          setCompanionState('listening','Your turn — advancing to next bead shortly');
          status.textContent='Your turn — moving to the next bead in a moment.';
        }
        rosaryTimer=setTimeout(()=>{
          rosaryTimer=null;
          if(!rosaryPlaying||!main.querySelector('#rosary-listen'))return;
          stepIndex++;
          updateView();
          speakCurrentBead();
        },waitMs);
      }else{
        rosaryPlaying=false;
        if(stepIndex===steps.length-1){
          const cur=readState();
          writeState({...cur,date:todayKey,completedDate:todayKey});
          status.textContent='Rosary complete. Deo gratias.';
          updateView();
        }else{
          btn.textContent=autoAdvance?'▶ Pray from this bead':'▶ Listen to this bead';
        }
      }
    });
  }

  function bindBeadHandlers(host){
    host.querySelectorAll('.rosary-bead').forEach(bead=>{
      const activate=()=>{
        const sid=Number(bead.dataset.step);
        if(Number.isInteger(sid))goToStep(sid,false);
      };
      bead.addEventListener('click',activate);
      bead.addEventListener('keydown',e=>{
        if(e.key==='Enter')activate();
        if(e.key===' ')e.preventDefault();
      });
      bead.addEventListener('keyup',e=>{
        if(e.key===' ')activate();
      });
    });
  }

  const reminderHtml=ctx.reminders.renderPanelMarkup(getAppointedMystery(new Date(),curSchedule));

  main.innerHTML=`
    <div class="intro">
      <div>
        <div class="eyebrow">THE MOST HOLY ROSARY</div>
        <h1>Pray the Rosary, bead by bead.</h1>
        <p id="rosary-appointed-note"></p>
      </div>
      <div class="date-badge">${new Date().toLocaleDateString(undefined,{weekday:'long'})}<br>${new Date().toLocaleDateString(undefined,{month:'long',day:'numeric'})}</div>
    </div>

    <div id="rosary-complete-banner" class="completion-note" role="status" hidden>✛ You completed today’s Rosary. May Our Lady keep you close to Christ.</div>

    <div class="rosary-bar">
      <div class="rosary-mysteries" role="group" aria-label="Choose Rosary mysteries">
        ${Object.values(MYSTERIES).map(m=>`<button type="button" data-mystery="${m.key}" aria-pressed="${m.key===mysteryKey}"><strong>${m.name.replace(' Mysteries','')}</strong><span>${m.daysStandard}</span></button>`).join('')}
      </div>
      <div class="rosary-schedule-toggle" role="group" aria-label="Mystery calendar tradition">
        <button type="button" data-schedule="standard" aria-pressed="${curSchedule==='standard'}">4-Mystery</button>
        <button type="button" data-schedule="traditional" aria-pressed="${curSchedule==='traditional'}">Traditional (1962)</button>
      </div>
    </div>

    <div class="rosary-stage">
      <section class="rosary-beads-panel" aria-label="Virtual Rosary beads">
        <div id="rosary-beads-host"></div>
        <div class="rosary-decade-jumps" role="group" aria-label="Jump to section">
          <button type="button" data-decade-jump="0">Intro</button>
          <button type="button" data-decade-jump="1">I</button>
          <button type="button" data-decade-jump="2">II</button>
          <button type="button" data-decade-jump="3">III</button>
          <button type="button" data-decade-jump="4">IV</button>
          <button type="button" data-decade-jump="5">V</button>
          <button type="button" data-decade-jump="6">Close</button>
        </div>
        <p class="rosary-bead-hint muted">Tap or press Enter on any bead to jump directly to that prayer.</p>
      </section>

      <section class="rosary-prayer-panel">
        <div id="rosary-companion" class="companion-dock"></div>
        <div class="rosary-prayer-card">
          <div class="eyebrow" id="rosary-step-eyebrow"></div>
          <h2 id="rosary-step-title"></h2>
          <p class="latin" id="rosary-step-sub"></p>
          <p class="rosary-meditation" id="rosary-step-meditation" hidden></p>

          <div class="rosary-audio-bar">
            <button type="button" class="primary" id="rosary-listen">▶ Pray from this bead</button>
            <label class="rosary-check"><input type="checkbox" id="rosary-auto" ${autoAdvance?'checked':''}> Auto-advance beads</label>
            <button type="button" class="subtle-button" id="rosary-restart">Start over</button>
          </div>
          <p id="rosary-speech-status" class="speech-caption" role="status"></p>

          <div class="liturgical-prose rosary-prose" id="rosary-step-text"></div>

          <div class="journey-actions">
            <button type="button" class="subtle-button" id="rosary-prev">← Previous bead</button>
            <button type="button" class="primary" id="rosary-next">Next bead →</button>
          </div>
        </div>
      </section>
    </div>

    ${reminderHtml}
  `;

  mountCompanion(main.querySelector('#rosary-companion'));
  ctx.syncCompanionIdentity();
  ctx.reminders.bindPanel(main,()=>getAppointedMystery(new Date(),curSchedule));

  main.querySelectorAll('[data-mystery]').forEach(btn=>{
    btn.onclick=()=>{
      stopRosarySpeech();
      mysteryKey=btn.dataset.mystery;
      steps=buildSteps(mysteryKey);
      stepIndex=0;
      updateView();
    };
  });

  main.querySelectorAll('[data-schedule]').forEach(btn=>{
    btn.onclick=()=>{
      stopRosarySpeech();
      curSchedule=btn.dataset.schedule;
      const app=getAppointedMystery(new Date(),curSchedule);
      mysteryKey=app.key;
      steps=buildSteps(mysteryKey);
      stepIndex=0;
      updateView();
    };
  });

  main.querySelectorAll('[data-decade-jump]').forEach(btn=>{
    btn.onclick=()=>{
      const dec=Number(btn.dataset.decadeJump);
      const target=steps.findIndex(s=>s.decade===dec);
      if(target>=0)goToStep(target,false);
    };
  });

  main.querySelector('#rosary-auto').onchange=e=>{
    autoAdvance=e.target.checked;
    persist();
    updateView();
  };

  main.querySelector('#rosary-listen').onclick=()=>{
    if(rosaryPlaying){
      stopRosarySpeech();
      main.querySelector('#rosary-speech-status').textContent='Paused.';
      updateView();
      return;
    }
    speakCurrentBead();
  };

  main.querySelector('#rosary-prev').onclick=()=>goToStep(stepIndex-1,false);
  main.querySelector('#rosary-next').onclick=()=>{
    if(stepIndex===steps.length-1){
      stopRosarySpeech();
      const cur=readState();
      writeState({...cur,date:todayKey,completedDate:todayKey});
      main.querySelector('#rosary-speech-status').textContent='Rosary complete. Deo gratias.';
      updateView();
    }else{
      goToStep(stepIndex+1,false);
    }
  };
  main.querySelector('#rosary-restart').onclick=()=>goToStep(0,false);
  window.addEventListener('hashchange',stopRosarySpeech,{once:true});

  updateView();
}
