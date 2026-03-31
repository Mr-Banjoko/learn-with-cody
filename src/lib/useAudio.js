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
    // Not cached — fetch, store, and return object URL
    const response = await fetch(remoteUrl);
    if (!response.ok) return remoteUrl; // fallback to direct URL
    await cache.put(remoteUrl, response.clone());
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch {
    // Cache API unavailable (e.g. non-secure context) — fall back to direct URL
    return remoteUrl;
  }
}

export async function playAudio(remoteUrl) {
  if (!remoteUrl) return;

  // Stop any currently playing audio
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

// Preload a list of audio URLs into the cache silently
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