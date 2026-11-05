const V = "butce-v81";
const SHELL = ["/", "/index.html", "/butce-theme.css?v=39", "/app.js", "/core.js", "/transaction-input.js", "/transaction-bulk.js", "/cash-income.js", "/statement.js", "/cash-sim.js", "/cloud-store.js", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => Promise.allSettled(SHELL.map(u => c.add(u)))).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("butce-") && k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
// Offline first: answer instantly from cache, refresh the cached copy in the background.
// Only the first ever visit (nothing cached yet) waits for the network.
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  if (url.pathname.startsWith("/__/") || url.pathname.startsWith("/~oauth") || url.searchParams.has("native_auth")) return;
  const nav = req.mode === "navigate", key = nav ? "/index.html" : req;
  const fresh = fetch(req).then(r => { if (r.ok) { const c = r.clone(); caches.open(V).then(x => x.put(key, c)); } return r; });
  e.waitUntil(fresh.catch(() => {}));
  e.respondWith(caches.match(key, { ignoreSearch: nav }).then(hit => hit || caches.match(req, { ignoreSearch: true })).then(hit => hit || fresh.catch(() => nav ? caches.match("/") : Response.error())));
});
