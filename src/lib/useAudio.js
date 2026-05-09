// v8: iOS Safari permanent fix — synchronous fast-path for all playback after warmup
const CACHE_NAME = "cody-audio-v8";

/**
 * APPROVED BLEND TIMING
 * 200 ms inter-phoneme gap between each step in playAudioSequence.
 * DO NOT change without explicit approval.
 */
export const BLEND_GAP_MS = 200;

// currentAudio: the HTMLAudioElement currently playing (or null)
let currentAudio = null;

// resolvedBlobUrls: remoteUrl -> blobUrl (populated by warmupAudio / getCachedAudioUrl)
const resolvedBlobUrls = new Map();

// pendingResolution: remoteUrl -> Promise<blobUrl>
// Prevents duplicate fetches when warmupAudio is called multiple times
const pendingResolution = new Map();

async function getCachedAudioUrl(remoteUrl) {
  if (resolvedBlobUrls.has(remoteUrl)) return resolvedBlobUrls.get(remoteUrl);
  if (pendingResolution.has(remoteUrl)) return pendingResolution.get(remoteUrl);

  const promise = (async () => {
    try {
      const cache = await caches.open(CACHE_NAME);
      let response = await cache.match(remoteUrl);
      if (!response) {
        const fetched = await fetch(remoteUrl);
        if (!fetched.ok) return remoteUrl;
        if (fetched.status === 200) await cache.put(remoteUrl, fetched.clone());
        response = fetched;
      }
      // Force audio/mpeg so iOS Safari uses the correct MP3 decoder
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
      const blobUrl = URL.createObjectURL(blob);
      resolvedBlobUrls.set(remoteUrl, blobUrl);
      pendingResolution.delete(remoteUrl);
      return blobUrl;
    } catch {
      pendingResolution.delete(remoteUrl);
      return remoteUrl;
    }
  })();

  pendingResolution.set(remoteUrl, promise);
  return promise;
}

/**
 * warmupAudio — resolves all blob URLs ahead of time so every subsequent
 * playback call can use the synchronous fast-path.
 * MUST be awaited (or called early enough) before gameplay starts.
 */
export async function warmupAudio(urls) {
  await Promise.all(urls.map(url => getCachedAudioUrl(url).catch(() => {})));
}

/**
 * preloadAudio — fills the Cache API (for offline / fast subsequent loads).
 * Does NOT resolve blob URLs — call warmupAudio for that.
 */
export async function preloadAudio(urls) {
  try {
    const cache = await caches.open(CACHE_NAME);
    for (const url of urls) {
      const cached = await cache.match(url);
      if (!cached) {
        fetch(url)
          .then(res => { if (res.ok && res.status === 200) cache.put(url, res); })
          .catch(() => {});
      }
    }
  } catch {
    // silently fail if Cache API is unavailable
  }
}

// Internal: synchronously start playback from an already-resolved src.
// MUST be called from within the gesture call stack on iOS.
function _startPlayback(src, gain, onEndedCallback) {
  const audio = new Audio();
  audio.preload = "auto";
  audio.playbackRate = 1.0;
  audio.volume = Math.min(1, Math.max(0, gain));
  audio.src = src;
  currentAudio = audio;

  audio.onended = () => {
    if (currentAudio === audio) currentAudio = null;
    onEndedCallback && onEndedCallback();
  };

  audio.onerror = () => {
    if (currentAudio === audio) currentAudio = null;
    onEndedCallback && onEndedCallback();
  };

  audio.load();
  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      if (currentAudio === audio) currentAudio = null;
      onEndedCallback && onEndedCallback();
    });
  }
  return audio;
}

function _stopCurrent() {
  if (currentAudio) {
    currentAudio.onended = null;
    currentAudio.onerror = null;
    currentAudio.pause();
    currentAudio = null;
  }
}

/**
 * playAudio — play a single file.
 * Synchronous fast-path if blob URL is already resolved (after warmupAudio).
 */
export function playAudio(remoteUrl, gain = 1) {
  if (!remoteUrl) return;
  _stopCurrent();

  if (resolvedBlobUrls.has(remoteUrl)) {
    _startPlayback(resolvedBlobUrls.get(remoteUrl), gain);
    return;
  }
  // Async fallback — only hits on very first play before warmup finishes
  getCachedAudioUrl(remoteUrl).then(src => _startPlayback(src, gain));
}

/**
 * playAudioSequence — play steps sequentially.
 * Each step: { url, gain?, onStart? }
 *
 * KEY iOS FIX: When all blob URLs are pre-resolved (warmupAudio awaited),
 * each step's _startPlayback is called synchronously from the onended/setTimeout
 * callback chain — no async hops that would break iOS gesture context.
 * The first step is triggered directly from the user gesture call stack.
 *
 * Returns a cancel() function.
 */
export function playAudioSequence(steps, onDone) {
  _stopCurrent();

  if (!steps || steps.length === 0) {
    onDone && onDone();
    return () => {};
  }

  let cancelled = false;
  let currentStepAudio = null;

  function playStep(i) {
    if (cancelled) return;
    if (i >= steps.length) {
      onDone && onDone();
      return;
    }

    const { url, gain = 1, onStart } = steps[i];
    onStart && onStart(i);

    const src = resolvedBlobUrls.get(url);

    if (src) {
      // Synchronous fast-path — stays in gesture call stack on iOS
      if (cancelled) return;
      const audio = new Audio();
      audio.preload = "auto";
      audio.playbackRate = 1.0;
      audio.volume = Math.min(1, Math.max(0, gain));
      audio.src = src;
      currentAudio = audio;
      currentStepAudio = audio;

      audio.onended = () => {
        if (cancelled) return;
        if (currentAudio === audio) currentAudio = null;
        setTimeout(() => { if (!cancelled) playStep(i + 1); }, BLEND_GAP_MS);
      };

      audio.onerror = () => {
        if (currentAudio === audio) currentAudio = null;
        if (!cancelled) setTimeout(() => playStep(i + 1), BLEND_GAP_MS);
      };

      audio.load();
      const p = audio.play();
      if (p !== undefined) {
        p.catch(() => {
          if (currentAudio === audio) currentAudio = null;
          if (!cancelled) playStep(i + 1);
        });
      }
    } else {
      // Async fallback — only for URLs not yet warmed up
      getCachedAudioUrl(url).then(resolvedSrc => {
        if (cancelled) return;
        const audio = new Audio();
        audio.preload = "auto";
        audio.playbackRate = 1.0;
        audio.volume = Math.min(1, Math.max(0, gain));
        audio.src = resolvedSrc;
        currentAudio = audio;
        currentStepAudio = audio;

        audio.onended = () => {
          if (cancelled) return;
          if (currentAudio === audio) currentAudio = null;
          setTimeout(() => { if (!cancelled) playStep(i + 1); }, BLEND_GAP_MS);
        };

        audio.onerror = () => {
          if (currentAudio === audio) currentAudio = null;
          if (!cancelled) setTimeout(() => playStep(i + 1), BLEND_GAP_MS);
        };

        audio.load();
        const p = audio.play();
        if (p !== undefined) {
          p.catch(() => {
            if (currentAudio === audio) currentAudio = null;
            if (!cancelled) playStep(i + 1);
          });
        }
      }).catch(() => {
        if (!cancelled) playStep(i + 1);
      });
    }
  }

  playStep(0);

  return function cancel() {
    cancelled = true;
    _stopCurrent();
    currentStepAudio = null;
  };
}