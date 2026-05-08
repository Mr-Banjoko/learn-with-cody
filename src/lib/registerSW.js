/**
 * Register the service worker + proactively prefetch all core lesson images.
 * Called once at app startup (main.jsx).
 */
import { shortAWords } from "./shortAWords";

// Service worker registration intentionally removed.
// Cache busting is handled via BUILD_VERSION in main.jsx.

/**
 * Warm the SW cache with all core lesson images so they are available offline.
 * Uses the Cache API directly — works even before SW intercepts fetches.
 */
export async function prefetchCoreImages() {
  if (!("caches" in window)) return;

  const CACHE_NAME = "cody-assets-v2";
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