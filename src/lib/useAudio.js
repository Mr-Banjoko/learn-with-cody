/**
 * useAudio.js — simple, Safari-compatible audio playback.
 *
 * Safari requires audio.play() to be called synchronously within a
 * trusted user-gesture handler (click/touchend). Complex async chains
 * (fetch → blob → createObjectURL → play) break this requirement.
 *
 * Strategy:
 * - playAudio: stop current, set src directly, call play(). Fast.
 * - playAudioSequence: chain via onended callbacks. No async gaps.
 * - warmupAudio / preloadAudio: no-ops (Safari ignores preload anyway).
 * - BLEND_GAP_MS: 200ms gap between phonemes (unchanged).
 */

export const BLEND_GAP_MS = 200;

let currentAudio = null;

// Simple in-memory cache of Audio elements keyed by URL
const audioCache = new Map();

function getAudio(url) {
  if (!audioCache.has(url)) {
    const a = new Audio();
    a.preload = "auto";
    a.src = url;
    audioCache.set(url, a);
  }
  return audioCache.get(url);
}

function stopCurrent() {
  if (currentAudio) {
    currentAudio.onended = null;
    currentAudio.onerror = null;
    try { currentAudio.pause(); currentAudio.currentTime = 0; } catch {}
    currentAudio = null;
  }
}

/**
 * playAudio — play a single audio file.
 * Safe to call from onClick or onPointerDown handlers.
 */
export function playAudio(url, gain = 1) {
  if (!url) return;
  stopCurrent();

  const audio = new Audio();
  audio.src = url;
  audio.volume = Math.min(1, Math.max(0, gain));
  currentAudio = audio;

  audio.onended = () => { if (currentAudio === audio) currentAudio = null; };
  audio.onerror = () => { if (currentAudio === audio) currentAudio = null; };

  const p = audio.play();
  if (p) p.catch(() => { if (currentAudio === audio) currentAudio = null; });
}

/**
 * playAudioSequence — play steps sequentially via onended chaining.
 * Each step: { url, gain?, onStart? }
 * Returns a cancel() function.
 */
export function playAudioSequence(steps, onDone) {
  stopCurrent();

  if (!steps || steps.length === 0) {
    onDone && onDone();
    return () => {};
  }

  let cancelled = false;

  function playStep(i) {
    if (cancelled) return;
    if (i >= steps.length) {
      onDone && onDone();
      return;
    }

    const { url, gain = 1, onStart } = steps[i];
    onStart && onStart(i);

    const audio = new Audio();
    audio.src = url;
    audio.volume = Math.min(1, Math.max(0, gain));
    currentAudio = audio;

    audio.onended = () => {
      if (currentAudio === audio) currentAudio = null;
      if (!cancelled) setTimeout(() => playStep(i + 1), BLEND_GAP_MS);
    };

    audio.onerror = () => {
      if (currentAudio === audio) currentAudio = null;
      if (!cancelled) setTimeout(() => playStep(i + 1), BLEND_GAP_MS);
    };

    const p = audio.play();
    if (p) {
      p.catch(() => {
        if (currentAudio === audio) currentAudio = null;
        if (!cancelled) playStep(i + 1);
      });
    }
  }

  playStep(0);

  return function cancel() {
    cancelled = true;
    stopCurrent();
  };
}

/**
 * warmupAudio — no-op kept for API compatibility.
 */
export async function warmupAudio(urls) {
  // no-op: Safari ignores preload, and async warmup breaks gesture requirements
}

/**
 * preloadAudio — no-op kept for API compatibility.
 */
export async function preloadAudio(urls) {
  // no-op
}

/**
 * stopAllSequences — emergency stop.
 */
export function stopAllSequences() {
  stopCurrent();
}

// Kept for API compatibility
export const appLifecycle = {
  init: () => {},
  register: () => 0,
  deregister: () => {},
  cancel: () => {},
  setStep: () => {},
  setActiveCancel: () => {},
  _sequences: new Map(),
};