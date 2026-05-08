import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { prefetchCoreImages } from '@/lib/registerSW'

// ── Build version cache-bust ───────────────────────────────────────────────
// Bump this string with every deploy to force Safari to reload fresh assets.
const BUILD_VERSION = '20260508-d';

if (localStorage.getItem('app_build_version') !== BUILD_VERSION) {
  // Wipe SW registrations + caches, save new version, then hard reload.
  // We do NOT render React — just reload immediately.
  localStorage.setItem('app_build_version', BUILD_VERSION);

  const tasks = [];
  if ('serviceWorker' in navigator) {
    tasks.push(
      navigator.serviceWorker.getRegistrations()
        .then((regs) => Promise.all(regs.map((r) => r.unregister())))
    );
  }
  if ('caches' in window) {
    tasks.push(
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
    );
  }

  Promise.all(tasks).finally(() => {
    window.location.reload(true);
  });
} else {
  // ── Normal startup ───────────────────────────────────────────────────────
  ["cody_placement_result", "cody_album"].forEach((k) => localStorage.removeItem(k));
  prefetchCoreImages();

  ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
  );
}