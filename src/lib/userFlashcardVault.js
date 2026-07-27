/**
 * userFlashcardVault — permanent IndexedDB store for user-taken camera photos
 * captured in campaign mode.
 *
 * Unlike userPhotoDB (the "active" gameplay photo, which reset clears), the
 * vault is append-only on capture and is NEVER cleared by reset. This powers
 * the "Your Flashcards" section in the Learn tab.
 *
 * Entries are keyed by word and tagged with a short-vowel group id so they can
 * be sorted into Short a → Short u sub-folders.
 */

const DB_NAME = "cody_user_flashcards";
const STORE_NAME = "flashcards";
const DB_VERSION = 1;

const VOWEL_MAP = { a: "short-a", e: "short-e", i: "short-i", o: "short-o", u: "short-u" };

/** Map a CVC word to its short-vowel group id (e.g. "cat" → "short-a"). */
export function getVowelFromWord(word) {
  if (!word) return null;
  const w = String(word).toLowerCase();
  for (const ch of w) if (VOWEL_MAP[ch]) return VOWEL_MAP[ch];
  return null;
}

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "word" });
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = () => reject(req.error);
  });
}

function compressImage(dataUrl, maxSize = 500, quality = 0.75) {
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
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Save (or overwrite) a captured photo for a word into the vault.
 * Fire-and-forget safe; never throws. Reset does NOT call this.
 */
export async function saveFlashcardToVault(word, dataUrl) {
  try {
    const vowel = getVowelFromWord(word);
    if (!vowel) return;
    const compressed = await compressImage(dataUrl);
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put({ word, vowel, photo: compressed, created: Date.now() });
      tx.oncomplete = () => resolve(compressed);
      tx.onerror = () => resolve(compressed);
    });
  } catch {
    /* ignore */
  }
}

export async function getFlashcardsByVowel(vowel) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => {
        const all = req.result || [];
        resolve(
          all
            .filter((r) => r.vowel === vowel)
            .sort((a, b) => (a.created || 0) - (b.created || 0))
        );
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function getVaultCountByVowel() {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => {
        const counts = { "short-a": 0, "short-e": 0, "short-i": 0, "short-o": 0, "short-u": 0 };
        (req.result || []).forEach((r) => {
          if (counts[r.vowel] !== undefined) counts[r.vowel] += 1;
        });
        resolve(counts);
      };
      req.onerror = () => resolve({ "short-a": 0, "short-e": 0, "short-i": 0, "short-o": 0, "short-u": 0 });
    });
  } catch {
    return { "short-a": 0, "short-e": 0, "short-i": 0, "short-o": 0, "short-u": 0 };
  }
}