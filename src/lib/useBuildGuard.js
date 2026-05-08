/**
 * useBuildGuard
 *
 * Runs once on app mount. Fetches the production URL with cache:no-store,
 * extracts the embedded BUILD_ID from the response, and compares it to the
 * BUILD_ID baked into the currently-running JS bundle.
 *
 * If they differ → Safari is running a stale cached page → force reload.
 *
 * This works because:
 * - Even if Safari serves stale HTML, the stale JS bundle still runs.
 * - The fetch with cache:no-store bypasses all caches and gets the REAL
 *   current production HTML from the server.
 * - We embed BUILD_ID as a comment in the rendered output so we can read it.
 *
 * HOW TO UPDATE: bump BUILD_ID below on every deploy (match it in AppShell too).
 */

import { useEffect } from "react";

// ── BUMP THIS ON EVERY DEPLOY ─────────────────────────────────────────────────
export const BUILD_ID = "20260508-f";
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "app_build_id";

export function useBuildGuard() {
  useEffect(() => {
    // Already on correct build this session — skip
    if (sessionStorage.getItem(STORAGE_KEY) === BUILD_ID) return;

    // Fetch production root with no-store to bypass all caches
    fetch(window.location.origin + "/?_cb=" + Date.now(), { cache: "no-store" })
      .then((res) => res.text())
      .then((html) => {
        // Extract the build id we embed in the page (see AppShell)
        const match = html.match(/data-build-id="([^"]+)"/);
        if (!match) {
          // Can't detect — mark session as checked and continue
          sessionStorage.setItem(STORAGE_KEY, BUILD_ID);
          return;
        }
        const serverBuildId = match[1];
        if (serverBuildId !== BUILD_ID) {
          // Server has a newer build — force hard reload
          console.log(`[BuildGuard] Stale build detected (running: ${BUILD_ID}, server: ${serverBuildId}). Reloading.`);
          window.location.reload(true);
        } else {
          // Up to date — mark session so we don't check again
          sessionStorage.setItem(STORAGE_KEY, BUILD_ID);
          console.log(`[BuildGuard] Build ${BUILD_ID} is current.`);
        }
      })
      .catch(() => {
        // Network error — don't reload, just continue
        sessionStorage.setItem(STORAGE_KEY, BUILD_ID);
      });
  }, []);
}