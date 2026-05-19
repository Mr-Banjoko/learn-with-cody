/**
 * useCorrectSound
 *
 * Preloads correct-sound.mp3 from GitHub and provides a play function.
 * play(onEnded) — plays the sound and calls onEnded when it finishes.
 * Double-trigger protected: if already playing, the previous instance is
 * stopped before a new one starts.
 */

const CORRECT_SOUND_URL =
  "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/letter_sound/feedback/correct-sound.mp3";

import { useRef, useEffect } from "react";

export function useCorrectSound() {
  const audioRef = useRef(null);
  const blobUrlRef = useRef(null);

  // Preload once on mount
  useEffect(() => {
    let cancelled = false;
    fetch(CORRECT_SOUND_URL)
      .then((r) => r.blob())
      .then((blob) => {
        if (!cancelled) blobUrlRef.current = URL.createObjectURL(blob);
      })
      .catch(() => {
        // Fallback to remote URL if preload fails
        blobUrlRef.current = CORRECT_SOUND_URL;
      });
    return () => {
      cancelled = true;
      if (blobUrlRef.current && blobUrlRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  /**
   * Play the correct sound.
   * @param {() => void} onEnded - called when audio finishes (or on error)
   */
  const play = (onEnded) => {
    // Stop any already-playing instance
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }

    const src = blobUrlRef.current || CORRECT_SOUND_URL;
    const audio = new Audio(src);
    audioRef.current = audio;

    const cleanup = () => {
      audioRef.current = null;
      if (onEnded) onEnded();
    };

    audio.onended = cleanup;
    audio.onerror = cleanup;
    audio.play().catch(cleanup);
  };

  return { play };
}