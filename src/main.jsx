// Clear legacy campaign / placement cache
["cody_placement_result", "cody_album"].forEach((k) => localStorage.removeItem(k));

// HARD CACHE BUST v7 — runs before React mounts.
// Deletes ALL old SW caches directly from the page JS.
// Bump CURRENT_CACHE here whenever a breaking update is deployed.
const CURRENT_CACHE = "cody-assets-v7";
if ("caches" in window) {
  caches.keys().then((keys) => {
    keys.filter((k) => k !== CURRENT_CACHE).forEach((k) => {
      caches.delete(k);
      console.log("[bust] deleted stale cache:", k);
    });
  });
}

// Send SKIP_WAITING to any active SW so it doesn't block new activation
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((reg) => {
      if (reg.active) reg.active.postMessage({ type: "SKIP_WAITING" });
    });
  });
}

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { registerServiceWorker, prefetchCoreImages } from '@/lib/registerSW'

registerServiceWorker();
prefetchCoreImages();

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
