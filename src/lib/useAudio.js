const CACHE_NAME = "cody-audio-v1";
let currentAudio = null;

async function getCachedAudioUrl(remoteUrl) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(remoteUrl);
    if (cached) {
      const blob = await cached.blob();
      return URL.createObjectURL(blob);
    }
    const response = await fetch(remoteUrl);
    if (!response.ok) return remoteUrl;
    await cache.put(remoteUrl, response.clone());
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch {
    return remoteUrl;
  }
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