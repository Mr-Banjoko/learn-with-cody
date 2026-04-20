/**
 * Cody Learn – Service Worker
 * Strategy: Cache-first for GitHub raw assets (images + audio).
 * On first fetch → network → cache. Subsequent fetches → serve from cache (works offline).
 * v2: bust cache to pick up updated letter sounds (a, e, i, p, q, u).
 */

const CACHE_NAME = "cody-assets-v2";
const CACHEABLE_ORIGINS = [
  "https://raw.githubusercontent.com",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isCacheable = CACHEABLE_ORIGINS.some((o) => event.request.url.startsWith(o));
  if (!isCacheable) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) return cached;

      try {
        const response = await fetch(event.request);
        if (response.ok) {
          cache.put(event.request, response.clone());
        }
        return response;
      } catch {
        // Offline and not cached – return empty 503
        return new Response("", { status: 503 });
      }
    })
  );
});
