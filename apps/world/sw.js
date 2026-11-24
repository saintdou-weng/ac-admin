/* VRT World Railway Offline Service Worker v6.3
   - shell (index / manifest) : network first, cached copy when offline
   - island files              : downloaded once and kept in FILES_CACHE; never re-fetched in the background.
     The hub page decides when a file has really changed (by hash) and replaces only that file.
   - a cloud / imported copy of a file (FILES_CACHE 'cloud/<key>') wins over the built-in one ('builtin/<key>');
     add ?builtin=1 to a file URL to bypass both. */
const CACHE_NAME = 'vrt-world-rail-v6-3';
const FILES_CACHE = 'vrt-world-files-v2';            // kept across versions so nothing is downloaded again
const CORE_FILES = ['./', './index.html', './world-manifest.json'];
const FILE_RE = /\/(island[1-9]|seasons_express)\.html$/;
/* desktop layout patch appended to every island page served (same text is in index.html for offline downloads) */
const UI_PATCH = "<style id=\"vrt-world-ui\">\n/* VRT World hub \u00b7 desktop layout patch (added by the hub when an island page is served): the route / scene list and\n   the view buttons fold into the \u8def\u7dda button like on the phone, and the bottom bar is compact. */\n@media (min-width:701px){\n  #sceneMenu.phone-only{display:inline-flex!important;align-items:center}\n  #quickMenu{display:none!important;position:absolute;z-index:6;top:var(--vrt-head,112px);right:24px;width:min(400px,42vw);max-height:calc(100dvh - var(--vrt-head,112px) - 120px);overflow:auto;padding:10px;gap:8px;background:var(--glass);border:1px solid var(--line);border-radius:14px;box-shadow:0 10px 30px #182d3122;backdrop-filter:blur(14px)}\n  .menu-open:not(.ui-hidden) #quickMenu{display:grid!important}\n  #quickMenu .chapters,#quickMenu .view-switch{position:static!important;inset:auto!important;width:auto!important;max-height:none!important;margin:0!important;border:0!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;visibility:visible!important}\n  #quickMenu .chapters{display:flex!important;flex-direction:column!important;padding:0!important}\n  #quickMenu .view-switch{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px;border-top:1px solid var(--line)!important;padding:8px 0 0!important}\n  #quickMenu .junction-note{width:auto!important;display:block!important}\n  #sceneMenu[aria-expanded=\"true\"]{background:#2b5c49!important;color:#fff!important;border-color:#1f4637!important}\n  /* pages that move the view buttons out to a full-width bottom bar: show them only with the menu, under the panel */\n  body:not(.menu-open) .view-switch{display:none!important}\n  .menu-open:not(.ui-hidden) .view-switch{position:fixed!important;left:auto!important;right:24px!important;bottom:24px!important;width:min(400px,42vw)!important;display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))}\n  .controls{right:auto!important;width:min(620px,calc(100vw - 48px))!important;padding:8px 12px!important}\n  .controls .bottomline{display:none!important}\n  .settings-open .controls .bottomline{display:flex!important}\n}\n</style>\n<script id=\"vrt-world-ui-js\">(function(){function f(){var h=document.querySelector('header');if(h)document.documentElement.style.setProperty('--vrt-head',Math.round(h.getBoundingClientRect().bottom+10)+'px');}addEventListener('resize',f);addEventListener('load',f);setTimeout(f,800);setTimeout(f,3000);})();</script>\n";
const withPatch = async (res) => new Response(new Blob([await res.blob(), UI_PATCH]), { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(CORE_FILES)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME && k !== FILES_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  const m = url.pathname.match(FILE_RE);
  if (m) {
    if (url.searchParams.has('builtin')) return;   // the hub asked for the server copy itself
    const key = m[1];
    event.respondWith((async () => {
      const files = await caches.open(FILES_CACHE);
      const hit = (await files.match('cloud/' + key)) || (await files.match('builtin/' + key));
      if (hit) return withPatch(hit);
      try {
        const net = await fetch(url.pathname, { cache: 'no-cache' });
        if (net.ok) {
          const blob = await net.clone().blob();
          event.waitUntil(files.put('builtin/' + key, new Response(blob, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Source': 'builtin', 'X-Size': String(blob.size) } })));
        }
        return net.ok ? withPatch(net) : net;
      } catch (e) {
        return new Response('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><body style="font:16px system-ui;padding:24px">📴 這一島還沒下載到這台裝置，現在又沒有網路。<br><br>連上網路後回到 <a href="./index.html">世界鐵道總控台</a>，按「📥 離線快取全部」。</body>', { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }
    })());
    return;
  }

  if (url.pathname.endsWith('world-manifest.json') || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/world/')) {
    event.respondWith(
      fetch(req).then((res) => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE_NAME).then((c) => c.put(url.pathname.endsWith('/world/') ? './' : req, copy)); }
        return res;
      }).catch(() => caches.match(req, { ignoreSearch: true }))
    );
  }
});
