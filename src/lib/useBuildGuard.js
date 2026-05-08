/**
 * useBuildGuard
 *
 * Lightweight hook — just exports a BUILD_ID for the data-build-id attribute.
 * No more fetch-and-reload loops. Vite's content-hashed JS bundles handle
 * cache invalidation automatically. Service workers are unregistered in main.jsx.
 */

export const BUILD_ID = "20260508-j";

export function useBuildGuard() {
  // No-op. Kept for API compatibility with AppShell.
}