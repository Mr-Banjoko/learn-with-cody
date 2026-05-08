import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { prefetchCoreImages } from '@/lib/registerSW'

// ── Build version check ────────────────────────────────────────────────────
// Bump BUILD_VERSION with every deploy to force Safari to load fresh JS.
const BUILD_VERSION = '20260508-c';
const STORED_VERSION = localStorage.getItem('app_build_version');

if (STORED_VERSION !== BUILD_VERSION) {
  // Unregister all service workers, clear all caches, then hard reload once.
  Promise.all([
    'serviceWorker' in navigator
      ? navigator.serviceWorker.getRegistrations().then((regs) =>
          Promise.all(regs.map((r) => r.unregister()))
        )
      : Promise.resolve(),
    'caches' in window
      ? caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      : Promise.resolve(),
  ]).then(() => {
    localStorage.setItem('app_build_version', BUILD_VERSION);
    window.location.reload(true);
  });
} else {
  // ── Normal startup ─────────────────────────────────────────────────────
  // Clear legacy keys
  ["cody_placement_result", "cody_album"].forEach((k) => localStorage.removeItem(k));
  prefetchCoreImages();

  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)