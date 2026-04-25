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

      if (reg.waiting) {
        reg.waiting.postMessage({ type: "SKIP_WAITING" });
      }

      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            newWorker.postMessage({ type: "SKIP_WAITING" });
          }
        });
      });
    })
    .catch((err) => {
      console.warn("[SW] Registration failed", err);
    });

  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}

export async function prefetchCoreImages() {
  if (!("caches" in window)) return;
  const CACHE_NAME = "cody-assets-v5";
  const urls = shortAWords.map((w) => w.image).filter(Boolean);
  try {
    const cache = await caches.open(CACHE_NAME);
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
