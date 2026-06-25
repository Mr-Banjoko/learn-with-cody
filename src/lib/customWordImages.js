/**
 * customWordImages — IndexedDB-backed persistent custom image store.
 * Falls back to localStorage for small compressed data URLs if IDB is unavailable.
 */

const DB_NAME = "cody_custom_images";
const STORE_NAME = "word_images";
const DB_VERSION = 1;
const MAX_DIM = 800;
const JPEG_QUALITY = 0.82;
const LS_PREFIX = "cwi_"; // localStorage fallback prefix

// Normalize a word key: lowercase, trim, strip .mp3, strip non-alpha
function normalizeWord(word) {
  if (!word) return "";
  return word
    .toLowerCase()
    .trim()
    .replace(/\.mp3$/i, "")
    .replace(/[^a-z]/g, "");
}

// ── IndexedDB helpers ────────────────────────────────────────────────────────

let _db = null;

function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(STORE_NAME, { keyPath: "word" });
    };
    req.onsuccess = (e) => { _db = e.target.result; resolve(_db); };
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(word) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(word);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut(record) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function idbDelete(word) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).delete(word);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function idbGetAll() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result ?? []);
    req.onerror = () => reject(req.error);
  });
}

// ── Image compression ────────────────────────────────────────────────────────

export function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const { width, height } = img;
        const scale = Math.min(1, MAX_DIM / Math.max(width, height));
        const w = Math.round(width * scale);
        const h = Math.round(height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(e.target.result); // fallback: raw
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function saveCustomImage(rawWord, dataUrl) {
  const word = normalizeWord(rawWord);
  if (!word || !dataUrl) return;
  const now = Date.now();
  const record = { word, imageData: dataUrl, createdAt: now, updatedAt: now };
  try {
    await idbPut(record);
  } catch (_) {
    // IDB unavailable — fallback to localStorage (only if data URL is small enough)
    try {
      localStorage.setItem(LS_PREFIX + word, JSON.stringify(record));
    } catch (__) {}
  }
  // Bust the in-memory cache
  _cache.delete(word);
}

export async function getCustomImage(rawWord) {
  const word = normalizeWord(rawWord);
  if (!word) return null;
  // In-memory cache hit
  if (_cache.has(word)) return _cache.get(word);
  let record = null;
  try {
    record = await idbGet(word);
  } catch (_) {}
  if (!record) {
    try {
      const ls = localStorage.getItem(LS_PREFIX + word);
      if (ls) record = JSON.parse(ls);
    } catch (_) {}
  }
  const dataUrl = record?.imageData ?? null;
  _cache.set(word, dataUrl);
  return dataUrl;
}

export async function removeCustomImage(rawWord) {
  const word = normalizeWord(rawWord);
  if (!word) return;
  try { await idbDelete(word); } catch (_) {}
  try { localStorage.removeItem(LS_PREFIX + word); } catch (_) {}
  _cache.delete(word);
}

export async function getAllCustomImages() {
  try {
    const rows = await idbGetAll();
    if (rows.length > 0) return rows;
  } catch (_) {}
  // Fallback: scan localStorage
  const results = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(LS_PREFIX)) {
        try { results.push(JSON.parse(localStorage.getItem(k))); } catch (_) {}
      }
    }
  } catch (_) {}
  return results;
}

// Session-level memory cache (avoids repeated IDB reads per word per session)
const _cache = new Map();