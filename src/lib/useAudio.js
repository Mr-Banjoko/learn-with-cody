/**
 * useAudio.js — Web Audio API-based playback
 *
 * Uses AudioContext + decodeAudioData for reliable, correct-speed playback
 * on both desktop and mobile (especially iOS Safari where new Audio() is unreliable).
 *
 * Decoded AudioBuffers are cached in memory so subsequent plays are instant.
 */

const CACHE_NAME = "cody-audio-v3";
const BLEND_GAP_MS = 400;

// Shared AudioContext — created once, reused everywhere
let _ctx = null;
function getCtx() {
  if (!_ctx || _ctx.state === "closed") {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // iOS suspends context until user interaction — resume it
  if (_ctx.state === "suspended") _ctx.resume().catch(() => {});
  return _ctx;
}

// Cache: remoteUrl -> decoded AudioBuffer
const bufferCache = new Map();

// Currently playing source node (so we can stop it)
let currentSource = null;

function stopCurrent() {
  if (currentSource) {
    try { currentSource.stop(); } catch {}
    currentSource = null;
  }
}

/**
 * Fetch audio bytes: tries Cache API first, then network.
 * Returns ArrayBuffer.
 */
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
    // Fallback: direct fetch without cache
    const response = await fetch(remoteUrl);
    return response.arrayBuffer();
  }
}

/**
 * Decode and cache an AudioBuffer for a remote URL.
 */
async function getBuffer(remoteUrl) {
  if (bufferCache.has(remoteUrl)) return bufferCache.get(remoteUrl);
  const bytes = await fetchAudioBytes(remoteUrl);
  const ctx = getCtx();
  const buffer = await ctx.decodeAudioData(bytes);
  bufferCache.set(remoteUrl, buffer);
  return buffer;
}

/**
 * Play a single audio URL immediately.
 * Stops any currently playing audio first.
 */
export async function playAudio(remoteUrl, gain = 1) {
  if (!remoteUrl) return;
  stopCurrent();
  const ctx = getCtx();
  const buffer = await getBuffer(remoteUrl);
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
  source.onended = () => {
    if (currentSource === source) currentSource = null;
  };
  source.start(0);
}

/**
 * Play an array of steps sequentially (letter sounds → word).
 * Each step: { url, gain?, onStart? }
 * Returns a cancel function.
 */
export function playAudioSequence(steps, onDone) {
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

/**
 * Pre-decode and cache audio files so first taps are instant.
 * Also resumes / initialises the AudioContext.
 */
export async function warmupAudio(urls) {
  const ctx = getCtx(); // ensure context exists and is running
  ctx.resume().catch(() => {});
  for (const url of urls) {
    if (!bufferCache.has(url)) {
      getBuffer(url).catch(() => {});
    }
  }
}

/**
 * Legacy compat: preload just caches the raw bytes.
 */
export async function preloadAudio(urls) {
  for (const url of urls) {
    if (!bufferCache.has(url)) {
      getBuffer(url).catch(() => {});
    }
  }
}