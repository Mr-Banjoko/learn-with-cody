/**
 * userPhotoDB — IndexedDB storage for user-taken photos, with compression.
 * Photos are compressed to max 500×500 JPEG at 0.75 quality (~30–60KB each).
 */

const DB_NAME = "cody_user_photos";
const STORE_NAME = "photos";
const DB_VERSION = 1;

// ── Cross-instance pub/sub ───────────────────────────────────────────────────
// When one useUserPhoto instance saves/clears a word's photo, every other
// mounted useUserPhoto instance for the same word is notified and refreshes —
// without waiting for a `word` prop change. This fixes consecutive rounds that
// share a word (e.g. phonics → drag) where the photo taken in round 1 would
// otherwise not appear in round 2.
const listeners = new Map();
function emitPhotoChange(word) {
  const set = listeners.get(word);
  if (set) [...set].forEach((fn) => { try { fn(); } catch {} });
}
export function subscribePhoto(word, fn) {
  if (!listeners.has(word)) listeners.set(word, new Set());
  listeners.get(word).add(fn);
  return () => {
    const s = listeners.get(word);
    if (s) { s.delete(fn); if (s.size === 0) listeners.delete(word); }
  };
}

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = () => reject(req.error);
  });
}

async function compressImage(dataUrl, maxSize = 500, quality = 0.75) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl); // fallback: use original
    img.src = dataUrl;
  });
}

export async function getPhoto(word) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(word);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function savePhoto(word, dataUrl) {
  try {
    const compressed = await compressImage(dataUrl);
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(compressed, word);
      tx.oncomplete = () => { emitPhotoChange(word); resolve(compressed); };
      tx.onerror = () => resolve(dataUrl);
    });
  } catch {
    return dataUrl;
  }
}

export async function clearPhoto(word) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(word);
      tx.oncomplete = () => { emitPhotoChange(word); resolve(); };
      tx.onerror = () => resolve();
    });
  } catch {}
}