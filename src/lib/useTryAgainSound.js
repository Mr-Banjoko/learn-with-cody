/**
 * useTryAgainSound
 *
 * Preloads Try again.mp3 from GitHub at mount so playback is instantaneous.
 * play() fires the audio immediately — no delay, no debounce.
 */
import { useEffect, useRef } from "react";

const TRY_AGAIN_URL =
  "https://cdn.jsdelivr.net/gh/Mr-Banjoko/learn-with-cody@main/letter_sound/feedback/Try%20again.mp3";

// Module-level blob cache so it's only fetched once across all components
let cachedBlobUrl = null;
let fetchPromise = null;

function preloadTryAgain() {
  if (cachedBlobUrl) return Promise.resolve(cachedBlobUrl);
  if (fetchPromise) return fetchPromise;
  fetchPromise = fetch(TRY_AGAIN_URL)
    .then((r) => r.blob())
    .then((blob) => {
      cachedBlobUrl = URL.createObjectURL(blob);
      return cachedBlobUrl;
    })
    .catch(() => {
      fetchPromise = null;
      return TRY_AGAIN_URL; // fallback to network URL
    });
  return fetchPromise;
}

export function useTryAgainSound() {
  const audioRef = useRef(null);

  useEffect(() => {
    // Preload at mount
    preloadTryAgain();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const play = () => {
    // Stop any in-progress playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const url = cachedBlobUrl || TRY_AGAIN_URL;
    const audio = new Audio(url);
    audio.volume = 1;
    audioRef.current = audio;
    audio.play().catch(() => {});
  };

  return { play };
}