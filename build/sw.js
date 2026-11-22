// EntryGo Offline Service Worker (Network-First with Offline Local Cache Fallback)
const CACHE_NAME = "entrygo-pwa-v1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./gate/",
  "./gate/index.html",
  "./p/",
  "./p/index.html",
  "./assets/css/gatepass.css",
  "./assets/js/core.js",
  "./assets/js/organiser.js",
  "./assets/js/gate.js",
  "./assets/js/pass.js",
  "./assets/js/csv.js",
  "./assets/js/local-backend.js",
  "./config.js",
  "./vendor/supabase.js",
  "./vendor/jsQR.js",
  "./vendor/qrcode.mjs",
  "./assets/img/icon.svg",
  "./assets/fonts/oswald-latin-wght.woff2"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  // Pass through Supabase REST / Auth / realtime network calls
  if (e.request.url.includes("supabase.co") || e.request.url.includes("api.")) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res && res.status === 200 && e.request.method === "GET") {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
