// Bump CACHE whenever you change any file, so players get the new version.
const CACHE='skipstone-v3';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
// Cache first so the game opens instantly and offline; refresh the copy in the background when online.
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  const net=fetch(r).then(res=>{
    if(res&&res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(r,copy))}
    return res;
  }).catch(()=>null);
  e.waitUntil(net);
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>hit||net.then(res=>res||(r.mode==='navigate'?caches.match('./index.html'):Response.error()))));
});
