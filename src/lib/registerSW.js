import { shortAWords } from "./shortAWords";

const ASSET_CACHE_NAME = "cody-assets-v7";

export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  // ?v=7 forces Safari to bypass its HTTP cache for sw.js
  navigator.serviceWorker.register("/sw.js?v=7").then((reg) => {
    if (reg.waiting) reg.waiting.postMessage({ type: "SKIP_WAITING" });
    reg.addEventListener("updatefound", () => {
      const nw = reg.installing;
      if (!nw) return;
      nw.addEventListener("statechange", () => {
        if (nw.state === "installed" && navigator.serviceWorker.controller) nw.postMessage({ type: "SKIP_WAITING" });
      });
    });
    reg.update().catch(() => {});
  }).catch((err) => console.warn("[SW] Registration failed", err));

  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!refreshing) { refreshing = true; window.location.reload(); }
  });
}

export async function prefetchCoreImages() {
  if (!("caches" in window)) return;
  const urls = shortAWords.map((w) => w.image).filter(Boolean);
  try {
    const cache = await caches.open(ASSET_CACHE_NAME);
    await Promise.allSettled(urls.map(async (url) => {
      const cached = await cache.match(url);
      if (!cached) { const res = await fetch(url, { mode: "cors" }); if (res.ok) await cache.put(url, res); }
    }));
  } catch (err) { console.warn("[prefetch] failed:", err); }
}
