/**
 * Cody Learn – Service Worker v5
 * Cache-first for GitHub raw assets. Responds to SKIP_WAITING message.
 */
const CACHE_NAME = "cody-assets-v5";
const CACHEABLE_ORIGINS = ["https://raw.githubusercontent.com"];

self.addEventListener("install", () => {});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const isCacheable = CACHEABLE_ORIGINS.some((o) => event.request.url.startsWith(o));
  if (!isCacheable) return;
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) return cached;
      try {
        const response = await fetch(event.request);
        if (response.ok) cache.put(event.request, response.clone());
        return response;
      } catch {
        return new Response("", { status: 503 });
      }
    })
  );
});
