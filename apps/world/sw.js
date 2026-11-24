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
      if (hit) return hit;
      try {
        const net = await fetch(url.pathname, { cache: 'no-cache' });
        if (net.ok) {
          const blob = await net.clone().blob();
          event.waitUntil(files.put('builtin/' + key, new Response(blob, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Source': 'builtin', 'X-Size': String(blob.size) } })));
        }
        return net;
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
