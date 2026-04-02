// v4: force audio/mpeg MIME type on blobs to fix iOS Safari decoder selection.
// Old blobs (v3) had no explicit MIME → iOS used a slow generic decoder → half-speed playback.
const CACHE_NAME = "cody-audio-v4";

const BLEND_GAP_MS = 400;

let currentAudio = null;

const resolvedBlobUrls = new Map();

async function getCachedAudioUrl(remoteUrl) {
  if (resolvedBlobUrls.has(remoteUrl)) return resolvedBlobUrls.get(remoteUrl);
  try {
    const cache = await caches.open(CACHE_NAME);
    let response = await cache.match(remoteUrl);
    if (!response) {
      const fetched = await fetch(remoteUrl);
      if (!fetched.ok) return remoteUrl;
      if (fetched.status === 200) await cache.put(remoteUrl, fetched.clone());
      response = fetched;
    }
    const arrayBuffer = await response.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
    const blobUrl = URL.createObjectURL(blob);
    resolvedBlobUrls.set(remoteUrl, blobUrl);
    return blobUrl;
  } catch {
    return remoteUrl;
  }
}

export async function warmupAudio(urls) {
  for (const url of urls) {
    if (!resolvedBlobUrls.has(url)) {
      getCachedAudioUrl(url).catch(() => {});
    }
  }
}

export async function playAudio(remoteUrl, gain = 1) {
  if (!remoteUrl) return;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  const src = await getCachedAudioUrl(remoteUrl);
  const audio = new Audio();
  audio.preload = "auto";
  audio.playbackRate = 1.0;
  audio.volume = Math.min(1, Math.max(0, gain));
  audio.src = src;
  currentAudio = audio;
  audio.onended = () => {
    if (currentAudio === audio) currentAudio = null;
  };
  audio.load();
  audio.play().catch(() => {
    if (currentAudio === audio) currentAudio = null;
  });
}

export function playAudioSequence(steps, onDone) {
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
    const { url, onStart, gain = 1 } = steps[i];
    onStart && onStart(i);

    getCachedAudioUrl(url).then((src) => {
      if (cancelled) return;

      const audio = new Audio();
      audio.preload = "auto";
      audio.playbackRate = 1.0;
      audio.volume = Math.min(1, Math.max(0, gain));
      audio.src = src;
      currentAudio = audio;

      audio.onended = () => {
        if (currentAudio === audio) currentAudio = null;
        if (!cancelled) setTimeout(() => { if (!cancelled) playStep(i + 1); }, BLEND_GAP_MS);
      };

      audio.load();
      audio.play().catch(() => {
        if (currentAudio === audio) currentAudio = null;
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
          .then((res) => { if (res.ok && res.status === 200) cache.put(url, res); })
          .catch(() => {});
      }
    }
  } catch {
    // silently fail
  }
}
