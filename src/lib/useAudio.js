/**
 * useAudio.js — Web Audio API-based playback
 *
 * Key mobile fix: AudioContext must be resumed SYNCHRONOUSLY inside a user gesture.
 * We do this by (a) calling resumeCtx() at the very start of play calls,
 * and (b) registering a global unlock listener on first touch/click.
 */

const CACHE_NAME = "cody-audio-v3";
const BLEND_GAP_MS = 400;

let _ctx = null;

function getCtx() {
  if (!_ctx || _ctx.state === "closed") {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return _ctx;
}

// Call this synchronously at the START of every user-gesture handler.
// On iOS, resume() only works when called synchronously inside a gesture.
function resumeCtx() {
  const ctx = getCtx();
  if (ctx.state === "suspended") {
    ctx.resume(); // intentionally NOT awaited — must be sync call in gesture
  }
  return ctx;
}

// Global one-time unlock on first touch/click (handles cases where
// the AudioContext is created before any gesture).
let unlocked = false;
function installUnlockListener() {
  if (unlocked || typeof window === "undefined") return;
  const unlock = () => {
    if (unlocked) return;
    unlocked = true;
    resumeCtx();
    window.removeEventListener("touchstart", unlock, true);
    window.removeEventListener("touchend", unlock, true);
    window.removeEventListener("click", unlock, true);
  };
  window.addEventListener("touchstart", unlock, true);
  window.addEventListener("touchend", unlock, true);
  window.addEventListener("click", unlock, true);
}
installUnlockListener();

// Cache: remoteUrl -> decoded AudioBuffer
const bufferCache = new Map();

// Currently playing source node
let currentSource = null;

function stopCurrent() {
  if (currentSource) {
    try { currentSource.stop(); } catch {}
    currentSource = null;
  }
}

async function fetchAudioBytes(remoteUrl) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(remoteUrl);
    if (cached) return cached.arrayBuffer();
    const response = await fetch(remoteUrl);
    if (!response.ok) throw new Error("fetch failed");
    if (response.status === 200) await cache.put(remoteUrl, response.clone());
    return response.arrayBuffer();
  } catch {
    const response = await fetch(remoteUrl);
    return response.arrayBuffer();
  }
}

async function getBuffer(remoteUrl) {
  if (bufferCache.has(remoteUrl)) return bufferCache.get(remoteUrl);
  const bytes = await fetchAudioBytes(remoteUrl);
  // Use a fresh context reference here in case it was recreated
  const ctx = getCtx();
  const buffer = await ctx.decodeAudioData(bytes);
  bufferCache.set(remoteUrl, buffer);
  return buffer;
}

function playBuffer(ctx, buffer, gain) {
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = 1.0;
  if (gain !== 1) {
    const gainNode = ctx.createGain();
    gainNode.gain.value = Math.min(1, Math.max(0, gain));
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
  } else {
    source.connect(ctx.destination);
  }
  currentSource = source;
  return source;
}

export async function playAudio(remoteUrl, gain = 1) {
  if (!remoteUrl) return;
  // MUST resume synchronously before any await — iOS gesture context
  const ctx = resumeCtx();
  stopCurrent();
  const buffer = await getBuffer(remoteUrl);
  const source = playBuffer(ctx, buffer, gain);
  source.onended = () => { if (currentSource === source) currentSource = null; };
  source.start(0);
}

export function playAudioSequence(steps, onDone) {
  // Resume synchronously at the start of the gesture
  resumeCtx();
  stopCurrent();
  let cancelled = false;

  function playStep(i) {
    if (cancelled || i >= steps.length) {
      if (!cancelled) onDone && onDone();
      return;
    }
    const { url, onStart, gain = 1 } = steps[i];
    onStart && onStart(i);
    getBuffer(url).then((buffer) => {
      if (cancelled) return;
      const ctx = getCtx();
      const source = playBuffer(ctx, buffer, gain);
      source.onended = () => {
        if (currentSource === source) currentSource = null;
        if (!cancelled) setTimeout(() => { if (!cancelled) playStep(i + 1); }, BLEND_GAP_MS);
      };
      source.start(0);
    }).catch(() => {
      if (!cancelled) playStep(i + 1);
    });
  }

  playStep(0);

  return function cancel() {
    cancelled = true;
    stopCurrent();
  };
}

export async function warmupAudio(urls) {
  resumeCtx();
  for (const url of urls) {
    if (!bufferCache.has(url)) {
      getBuffer(url).catch(() => {});
    }
  }
}

export async function preloadAudio(urls) {
  for (const url of urls) {
    if (!bufferCache.has(url)) {
      getBuffer(url).catch(() => {});
    }
  }
}