/* 世界鐵道 · serves an imported copy of seasons_express.html (kept in this device's Cache Storage) in place of the built-in one */
const CACHE='vrt-world-import-v1',KEY='imported/seasons_express.html';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin||!u.pathname.endsWith('/seasons_express.html')||u.searchParams.has('builtin'))return;
  e.respondWith(caches.open(CACHE).then(c=>c.match(KEY)).then(r=>r||fetch(e.request)).catch(()=>fetch(e.request)));
});
