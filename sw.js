const CACHE='ora-shell-v8';
const DAYS='ora-liturgy-days-v1';
const FILES=['./','./index.html','./style.css','./app.js','./voice.js','./prayers.js','./liturgy.js','./data/liturgy/index.json','./assets/cross.svg','./assets/stained-glass.svg','./manifest.webmanifest'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>(key.startsWith('ora-shell-')||/^ora-v\d+$/.test(key))&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith(new URL(self.registration.scope).pathname))return;
  event.respondWith((async()=>{
    try{
      const response=await fetch(event.request);
      if(response.ok){
        try{const cache=await caches.open(url.pathname.includes('/data/liturgy/')?DAYS:CACHE);await cache.put(event.request,response.clone())}catch{}
      }
      return response;
    }catch{
      const cached=await caches.match(event.request);
      return cached||(event.request.mode==='navigate'?await caches.match('./index.html'):Response.error());
    }
  })());
});
