import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { prefetchCoreImages } from '@/lib/registerSW'

// ── Startup ────────────────────────────────────────────────────────────────
// Unregister any leftover service workers on every load (they cause stale caches).
// Vite handles cache-busting via content-hashed filenames — no manual version needed.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then((regs) => regs.forEach((r) => r.unregister()))
    .catch(() => {});
}

// Clear ALL browser caches on every load so stale JS/CSS never survives a publish.
if ('caches' in window) {
  caches.keys().then((names) => names.forEach((n) => caches.delete(n))).catch(() => {});
}

["cody_placement_result", "cody_album"].forEach((k) => localStorage.removeItem(k));
prefetchCoreImages();

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
);