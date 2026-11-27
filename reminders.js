import {getAppointedMystery} from './rosary.js?v=6';

const REM_KEY='oravigil-reminders-v1';
const FIRED_KEY='oravigil-reminders-fired';

export const DEFAULT_REMINDERS={
  enabled:true,
  sound:true,
  rosaryTime:'18:00',
  slots:{
    morning:{enabled:false,time:'06:00',title:'Morning Angelus & Offering',route:'#today',desc:'6:00 a.m. · Traditional morning hour'},
    midday:{enabled:true,time:'12:00',title:'Midday Angelus',route:'#today',desc:'12:00 p.m. · Pause at noon'},
    mercy:{enabled:false,time:'15:00',title:'Hour of Mercy',route:'#rosary',desc:'3:00 p.m. · Traditional hour of Christ’s Passion'},
    rosary:{enabled:true,time:'18:00',title:'Daily Rosary',route:'#rosary',desc:'6:00 p.m. · Traditional evening Angelus & Rosary'},
    compline:{enabled:false,time:'21:00',title:'Night Compline',route:'#liturgy?hour=Completorium',desc:'9:00 p.m. · Prayer before rest'}
  }
};

function loadConfig(){
  try{
    const raw=JSON.parse(localStorage.getItem(REM_KEY));
    if(!raw||typeof raw!=='object')return structuredClone(DEFAULT_REMINDERS);
    const merged=structuredClone(DEFAULT_REMINDERS);
    merged.enabled=raw.enabled!==false;
    merged.sound=raw.sound!==false;
    for(const k of Object.keys(merged.slots)){
      if(raw.slots?.[k]){
        merged.slots[k].enabled=Boolean(raw.slots[k].enabled);
        if(/^\d{2}:\d{2}$/.test(raw.slots[k].time||''))merged.slots[k].time=raw.slots[k].time;
      }
    }
    return merged;
  }catch{
    return structuredClone(DEFAULT_REMINDERS);
  }
}

function saveConfig(cfg){
  try{localStorage.setItem(REM_KEY,JSON.stringify(cfg))}catch{}
}

function loadFired(){
  try{return JSON.parse(localStorage.getItem(FIRED_KEY))||{}}catch{return {}}
}

function saveFired(obj){
  try{localStorage.setItem(FIRED_KEY,JSON.stringify(obj))}catch{}
}

function playBellChime(){
  try{
    const Ctx=window.AudioContext||window.webkitAudioContext;
    if(!Ctx)return;
    const ctx=new Ctx();
    const now=ctx.currentTime;
    const freqs=[528,1056,1584];
    freqs.forEach((f,idx)=>{
      const osc=ctx.createOscillator();
      const gain=ctx.createGain();
      osc.type='sine';
      osc.frequency.setValueAtTime(f,now);
      gain.gain.setValueAtTime(0.0001,now);
      gain.gain.exponentialRampToValueAtTime(idx===0?0.09:0.03/(idx+1),now+0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001,now+2.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now+2.3);
    });
    setTimeout(()=>ctx.close().catch(()=>{}),2500);
  }catch{}
}

function format12h(hhmm){
  const [h,m]=hhmm.split(':').map(Number);
  const ampm=h>=12?'p.m.':'a.m.';
  const h12=((h+11)%12)+1;
  return `${h12}:${String(m).padStart(2,'0')} ${ampm}`;
}

export function getNextReminder(cfg=loadConfig(),now=new Date()){
  if(!cfg.enabled)return null;
  const active=Object.entries(cfg.slots).filter(([,s])=>s.enabled);
  if(!active.length)return null;
  let best=null;
  for(const [key,slot] of active){
    const [h,m]=slot.time.split(':').map(Number);
    const target=new Date(now.getFullYear(),now.getMonth(),now.getDate(),h,m,0,0);
    if(target<=now)target.setDate(target.getDate()+1);
    const diffMs=target-now;
    if(!best||diffMs<best.diffMs){
      const appointed=getAppointedMystery(target);
      const label=key==='rosary'?`${slot.title} (${appointed.name})`:slot.title;
      best={key,slot,target,diffMs,label,timeText:format12h(slot.time)};
    }
  }
  return best;
}

export function formatCountdown(ms){
  const mins=Math.max(1,Math.round(ms/60000));
  const h=Math.floor(mins/60), m=mins%60;
  return h?`${h}h ${m}m`:`${m}m`;
}

function buildIcs(cfg){
  const pad=n=>String(n).padStart(2,'0');
  const now=new Date();
  const stamp=`${now.getUTCFullYear()}${pad(now.getUTCMonth()+1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;
  const lines=[
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Oravigil//Daily Prayer Reminders//EN',
    'CALSCALE:GREGORIAN',
    'X-WR-CALNAME:Oravigil Prayer Reminders'
  ];
  const todayStr=`${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}`;
  for(const [key,slot] of Object.entries(cfg.slots)){
    if(!slot.enabled)continue;
    const [h,m]=slot.time.split(':').map(Number);
    const endM=(m+15)%60, endH=(h+Math.floor((m+15)/60))%24;
    const summary=key==='rosary'?'Oravigil · Daily Holy Rosary':`Oravigil · ${slot.title}`;
    const desc=key==='rosary'
      ?'Pray today’s appointed Mysteries of the Rosary at https://oravigil.com/#rosary'
      :`Pause for prayer at https://oravigil.com/${slot.route}`;
    lines.push(
      'BEGIN:VEVENT',
      `UID:oravigil-${key}@oravigil.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${todayStr}T${pad(h)}${pad(m)}00`,
      `DTEND:${todayStr}T${pad(endH)}${pad(endM)}00`,
      'RRULE:FREQ=DAILY',
      `SUMMARY:${summary}`,
      `DESCRIPTION:${desc}`,
      'URL:https://oravigil.com/#rosary',
      'BEGIN:VALARM',
      'TRIGGER:PT0M',
      'ACTION:DISPLAY',
      `DESCRIPTION:${summary}`,
      'END:VALARM',
      'END:VEVENT'
    );
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function createReminderManager(){
  let cfg=loadConfig();
  let queuedToasts=[];
  let toastSeq=0;
  const supportsPopover=typeof HTMLElement!=='undefined'&&Object.hasOwn(HTMLElement.prototype,'popover');

  function announce(text){
    if(typeof document.ariaNotify==='function'){
      try{document.ariaNotify(text);return}catch{}
    }
    const live=document.getElementById('reminder-live');
    if(live){
      live.textContent='';
      requestAnimationFrame(()=>{live.textContent=text});
    }
  }

  function hasOpenModal(){
    return Boolean(document.querySelector('dialog[open]'));
  }

  function showToast({title,body,route}){
    if(hasOpenModal()){
      queuedToasts.push({title,body,route});
      return;
    }
    const region=document.getElementById('toast-region');
    if(!region)return;
    const id=`oravigil-toast-${++toastSeq}`;
    const prevFocus=document.activeElement;
    const el=document.createElement('div');
    el.id=id;
    el.className='reminder-toast';
    if(supportsPopover)el.setAttribute('popover','manual');
    el.innerHTML=`
      <div class="toast-body">
        <div class="eyebrow">PRAYER REMINDER</div>
        <strong></strong>
        <p></p>
      </div>
      <div class="toast-actions">
        <a class="primary toast-go" href="${route||'#rosary'}">Pray now →</a>
        <button type="button" class="toast-close" ${supportsPopover?`popovertarget="${id}" popovertargetaction="hide"`:''} aria-label="Close reminder">✕</button>
      </div>
    `;
    el.querySelector('strong').textContent=title;
    el.querySelector('p').textContent=body;
    region.appendChild(el);

    const repositionToasts=()=>{
      const toasts=[...region.querySelectorAll('.reminder-toast')];
      let bottom=18;
      for(let i=toasts.length-1;i>=0;i--){
        toasts[i].style.bottom=`${bottom}px`;
        bottom+=Math.max(84,toasts[i].offsetHeight||92)+10;
      }
    };
    const removeToast=()=>{
      const wasFocused=el.contains(document.activeElement);
      if(supportsPopover&&el.matches(':popover-open'))try{el.hidePopover()}catch{}
      el.remove();
      repositionToasts();
      if(wasFocused){
        const next=region.querySelector('.reminder-toast .toast-close');
        if(next)next.focus();
        else if(prevFocus instanceof HTMLElement&&prevFocus.isConnected)prevFocus.focus();
      }
    };
    el.querySelector('.toast-close').addEventListener('click',removeToast);
    el.querySelector('.toast-go').addEventListener('click',removeToast);
    if(supportsPopover){
      try{el.showPopover()}catch{}
      el.addEventListener('toggle',e=>{if(e.newState==='closed'){el.remove();repositionToasts()}});
    }
    repositionToasts();
    announce(`${title}. ${body}. Actions available.`);
  }

  function flushQueued(){
    if(hasOpenModal()||!queuedToasts.length)return;
    const list=queuedToasts.splice(0);
    list.forEach(showToast);
  }

  function fireReminder(key,slot,isTest=false){
    const appointed=getAppointedMystery(new Date());
    const title=key==='rosary'?`Time for the ${appointed.name}`:slot.title;
    const body=key==='rosary'
      ?`${appointed.reason}. Open the virtual beads and pray with Oravigil.`
      :`${slot.desc}. Pause for a quiet moment of prayer.`;
    if(cfg.sound)playBellChime();
    showToast({title,body,route:slot.route});
    if('Notification'in window&&Notification.permission==='granted'){
      try{
        const n=new Notification(`Oravigil · ${title}`,{body,icon:'./assets/cross.svg',tag:`oravigil-${key}${isTest?'-test':''}`});
        n.onclick=()=>{window.focus();location.hash=slot.route.replace(/^#/,'');n.close()};
      }catch{}
    }
  }

  function checkClock(){
    if(!cfg.enabled)return;
    const now=new Date();
    const today=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    const hhmm=`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const fired=loadFired();
    let changed=false;
    for(const [key,slot] of Object.entries(cfg.slots)){
      if(!slot.enabled||slot.time!==hhmm)continue;
      const stamp=`${today}|${key}|${hhmm}`;
      if(fired[key]===stamp)continue;
      fired[key]=stamp;
      changed=true;
      fireReminder(key,slot,false);
    }
    if(changed)saveFired(fired);
  }

  setInterval(checkClock,20000);
  document.addEventListener('close',flushQueued,true);
  window.addEventListener('visibilitychange',()=>{if(!document.hidden)checkClock()});

  function notifStatusText(){
    if(!('Notification'in window))return 'Browser notifications are not supported here — in-app reminders and Calendar (.ics) export are active.';
    if(Notification.permission==='granted')return 'Browser notifications enabled while Oravigil is open. Export .ics for reminders when the browser is closed.';
    if(Notification.permission==='denied')return 'Browser notifications are blocked in browser settings. In-app reminders and Calendar (.ics) export still work.';
    return 'Enable browser notifications for desktop alerts while Oravigil is open, or export a daily .ics calendar alarm.';
  }

  function renderPanelMarkup(appointed){
    const next=getNextReminder(cfg);
    const nextText=next?`Next reminder: ${next.label} at ${next.timeText} (in ${formatCountdown(next.diffMs)})`:'All timed reminders are currently paused.';
    return `<section class="reminder-panel" aria-labelledby="reminder-heading">
      <div class="reminder-head">
        <div>
          <div class="eyebrow">TIMED PRAYER REMINDERS</div>
          <h2 id="reminder-heading">Keep the traditional hours of prayer</h2>
          <p class="muted" id="reminder-next-summary">${nextText}</p>
        </div>
        <div class="reminder-head-actions">
          <button type="button" class="primary" id="reminder-enable-notif">${('Notification'in window&&Notification.permission==='granted')?'Notifications active ✓':'Enable notifications'}</button>
          <button type="button" class="subtle-button" id="reminder-ics">Add to Calendar (.ics)</button>
          <button type="button" class="subtle-button" id="reminder-test">Test reminder</button>
        </div>
      </div>
      <p class="muted reminder-perm-note" id="reminder-perm-note">${notifStatusText()}</p>
      <div class="reminder-grid">
        ${Object.entries(cfg.slots).map(([key,slot])=>`
          <div class="reminder-slot">
            <label class="reminder-toggle" for="rem-on-${key}">
              <input type="checkbox" id="rem-on-${key}" data-rem-enable="${key}" ${slot.enabled?'checked':''}>
              <span><strong>${slot.title}</strong><small>${key==='rosary'?`Today: ${appointed.name}`:slot.desc}</small></span>
            </label>
            <div class="reminder-time-wrap">
              <label class="visually-hidden" for="rem-time-${key}">${slot.title} time</label>
              <input class="date-input reminder-time" type="time" id="rem-time-${key}" data-rem-time="${key}" value="${slot.time}">
            </div>
          </div>
        `).join('')}
      </div>
      <label class="rosary-check reminder-sound-row">
        <input type="checkbox" id="reminder-sound" ${cfg.sound?'checked':''}> Play gentle sanctuary bell chime with in-app reminders
      </label>
    </section>`;
  }

  function bindPanel(root,getAppointed){
    const refreshSummary=()=>{
      const next=getNextReminder(cfg);
      const el=root.querySelector('#reminder-next-summary');
      if(el)el.textContent=next?`Next reminder: ${next.label} at ${next.timeText} (in ${formatCountdown(next.diffMs)})`:'All timed reminders are currently paused.';
    };
    root.querySelectorAll('[data-rem-enable]').forEach(cb=>{
      cb.onchange=e=>{
        cfg.slots[cb.dataset.remEnable].enabled=e.target.checked;
        saveConfig(cfg);
        refreshSummary();
      };
    });
    root.querySelectorAll('[data-rem-time]').forEach(inp=>{
      inp.onchange=e=>{
        if(/^\d{2}:\d{2}$/.test(e.target.value)){
          cfg.slots[inp.dataset.remTime].time=e.target.value;
          saveConfig(cfg);
          refreshSummary();
        }
      };
    });
    const soundEl=root.querySelector('#reminder-sound');
    if(soundEl)soundEl.onchange=e=>{cfg.sound=e.target.checked;saveConfig(cfg)};

    const notifBtn=root.querySelector('#reminder-enable-notif');
    if(notifBtn)notifBtn.onclick=async()=>{
      if(!('Notification'in window))return;
      try{
        const perm=await Notification.requestPermission();
        notifBtn.textContent=perm==='granted'?'Notifications active ✓':'Enable notifications';
        const note=root.querySelector('#reminder-perm-note');
        if(note)note.textContent=notifStatusText();
        if(perm==='granted'){
          const app=getAppointed();
          showToast({title:'Prayer reminders active',body:`You’ll be reminded for the ${app.name} and your selected hours.`,route:'#rosary'});
        }
      }catch{}
    };

    const icsBtn=root.querySelector('#reminder-ics');
    if(icsBtn)icsBtn.onclick=()=>{
      const blob=new Blob([buildIcs(cfg)],{type:'text/calendar;charset=utf-8'});
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=url;
      a.download='oravigil-prayer-reminders.ics';
      a.click();
      setTimeout(()=>URL.revokeObjectURL(url),1500);
      showToast({title:'Calendar schedule downloaded',body:'Open oravigil-prayer-reminders.ics to add daily reminders to Apple, Google, or Outlook Calendar.',route:'#rosary'});
    };

    const testBtn=root.querySelector('#reminder-test');
    if(testBtn)testBtn.onclick=()=>fireReminder('rosary',cfg.slots.rosary,true);
  }

  return {
    getConfig:()=>cfg,
    getNext:()=>getNextReminder(cfg),
    renderPanelMarkup,
    bindPanel,
    showToast
  };
}
