// Bump version to bust stale cache from old letter sound files
const CACHE_NAME = "cody-audio-v2";
let currentAudio = null;

// Pre-resolved blob URL map: remoteUrl -> blobUrl
const resolvedBlobUrls = new Map();

async function getCachedAudioUrl(remoteUrl) {
  // Return pre-resolved blob URL if available (zero async overhead)
  if (resolvedBlobUrls.has(remoteUrl)) return resolvedBlobUrls.get(remoteUrl);
  try {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(remoteUrl);
    if (cached) {
      const blob = await cached.blob();
      const blobUrl = URL.createObjectURL(blob);
      resolvedBlobUrls.set(remoteUrl, blobUrl);
      return blobUrl;
    }
    const response = await fetch(remoteUrl);
    if (!response.ok) return remoteUrl;
    await cache.put(remoteUrl, response.clone());
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    resolvedBlobUrls.set(remoteUrl, blobUrl);
    return blobUrl;
  } catch {
    return remoteUrl;
  }
}

/**
 * Pre-resolve a list of remote URLs into blob URLs and warm up the audio engine.
 * Call this on component mount so first taps are instant.
 */
export async function warmupAudio(urls) {
  for (const url of urls) {
    if (!resolvedBlobUrls.has(url)) {
      // Resolve into blob URL silently
      getCachedAudioUrl(url).catch(() => {});
    }
  }
  // Warm up the browser audio engine with a silent zero-duration audio
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
    ctx.close();
  } catch {}
}

export async function playAudio(remoteUrl) {
  if (!remoteUrl) return;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  const src = await getCachedAudioUrl(remoteUrl);
  const audio = new Audio(src);
  currentAudio = audio;
  audio.play().catch(() => {});
  audio.onended = () => {
    if (currentAudio === audio) currentAudio = null;
  };
}

/**
 * Play an array of steps sequentially, each starting only after the previous ends.
 * Each step: { url: string, onStart: (index) => void }
 * Returns a cancel function.
 */
export function playAudioSequence(steps, onDone) {
  // Stop any currently playing audio first
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  let cancelled = false;

  function playStep(i) {
    if (cancelled || i >= steps.length) {
      if (!cancelled) onDone && onDone();
      return;
    }
    const { url, onStart } = steps[i];
    onStart && onStart(i);
    getCachedAudioUrl(url).then((src) => {
      if (cancelled) return;
      const audio = new Audio(src);
      currentAudio = audio;
      audio.onended = () => {
        if (currentAudio === audio) currentAudio = null;
        if (!cancelled) playStep(i + 1);
      };
      // If play fails, move to next step anyway
      audio.play().catch(() => {
        if (!cancelled) playStep(i + 1);
      });
    }).catch(() => {
      if (!cancelled) playStep(i + 1);
    });
  }

  playStep(0);

  return function cancel() {
    cancelled = true;
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
  };
}

export async function preloadAudio(urls) {
  try {
    const cache = await caches.open(CACHE_NAME);
    for (const url of urls) {
      const cached = await cache.match(url);
      if (!cached) {
        fetch(url)
          .then((res) => { if (res.ok) cache.put(url, res); })
          .catch(() => {});
      }
    }
  } catch {
    // silently fail if Cache API is unavailable
  }
}