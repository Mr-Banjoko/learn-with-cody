/**
 * Register the service worker + proactively prefetch all core lesson images.
 * Called once at app startup (main.jsx).
 */
import { shortAWords } from "./shortAWords";

export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  navigator.serviceWorker
    .register("/sw.js")
    .then((reg) => {
      console.log("[SW] Registered", reg.scope);
    })
    .catch((err) => {
      console.warn("[SW] Registration failed", err);
    });
}

/**
 * Warm the SW cache with all core lesson images so they are available offline.
 * Uses the Cache API directly — works even before SW intercepts fetches.
 */
export async function prefetchCoreImages() {
  if (!("caches" in window)) return;

  const CACHE_NAME = "cody-assets-v1";
  const urls = shortAWords.map((w) => w.image).filter(Boolean);

  try {
    const cache = await caches.open(CACHE_NAME);
    // Only fetch what's not already cached
    await Promise.allSettled(
      urls.map(async (url) => {
        const cached = await cache.match(url);
        if (!cached) {
          const res = await fetch(url, { mode: "cors" });
          if (res.ok) await cache.put(url, res);
        }
      })
    );
  } catch (err) {
    console.warn("[prefetch] Core image prefetch failed:", err);
  }
}