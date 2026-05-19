/**
 * useCorrectSound
 *
 * Safari-safe correct sound player.
 *
 * Safari requires audio to be both created AND played within a synchronous
 * user-gesture stack. Blob URL + async fetch breaks this chain.
 *
 * Strategy:
 *  1. On first user interaction anywhere in the document, create a silent
 *     Audio element and call .play() to "unlock" the audio context for this
 *     Audio instance — Safari allows subsequent .play() calls on the same
 *     element without a gesture once it has been unlocked.
 *  2. After unlocking, load the real src via element.src assignment (no fetch/blob).
 *  3. play(onEnded) reuses the same element, seeking to 0 and calling .play().
 *     This stays within Safari's gesture trust window because the element is
 *     already unlocked.
 */

const CORRECT_SOUND_URL =
  "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/letter_sound/feedback/correct-sound.mp3";

import { useRef, useEffect } from "react";

export function useCorrectSound() {
  const audioRef = useRef(null);
  const unlockedRef = useRef(false);

  useEffect(() => {
    // Create the audio element immediately so it's ready
    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;

    // Unlock on first touch/pointer anywhere — Safari requirement
    const unlock = () => {
      if (unlockedRef.current) return;
      // Play silence to unlock, then load real src
      audio.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
      const p = audio.play();
      if (p && typeof p.then === "function") {
        p.then(() => {
          audio.pause();
          audio.src = CORRECT_SOUND_URL;
          audio.load();
          unlockedRef.current = true;
        }).catch(() => {
          audio.src = CORRECT_SOUND_URL;
          audio.load();
          unlockedRef.current = true;
        });
      } else {
        audio.pause();
        audio.src = CORRECT_SOUND_URL;
        audio.load();
        unlockedRef.current = true;
      }
      document.removeEventListener("touchstart", unlock, true);
      document.removeEventListener("pointerdown", unlock, true);
    };

    document.addEventListener("touchstart", unlock, { capture: true, passive: true });
    document.addEventListener("pointerdown", unlock, { capture: true, passive: true });

    return () => {
      document.removeEventListener("touchstart", unlock, true);
      document.removeEventListener("pointerdown", unlock, true);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  const play = (onEnded) => {
    const audio = audioRef.current;
    if (!audio) {
      if (onEnded) onEnded();
      return;
    }

    try { audio.pause(); } catch (_) {}
    audio.onended = null;
    audio.onerror = null;
    audio.currentTime = 0;

    if (!unlockedRef.current) {
      audio.src = CORRECT_SOUND_URL;
      audio.load();
      unlockedRef.current = true;
    }

    const cleanup = () => {
      audio.onended = null;
      audio.onerror = null;
      if (onEnded) onEnded();
    };

    audio.onended = cleanup;
    audio.onerror = cleanup;

    const p = audio.play();
    if (p && typeof p.then === "function") {
      p.catch(cleanup);
    }
  };

  return { play };
}