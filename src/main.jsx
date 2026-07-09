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

// NOTE: Do NOT clear Cache API caches here — they store prefetched image/audio
// assets from GitHub raw. Clearing them on every load forces re-fetching of all
// assets, which triggers GitHub rate-limiting (429) and breaks all pictures/audio.
// Vite handles JS/CSS cache-busting via content-hashed filenames.

["cody_placement_result", "cody_album"].forEach((k) => localStorage.removeItem(k));
prefetchCoreImages();

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
);