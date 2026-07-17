/**
 * useCorrectSound
 *
 * Safari-safe correct sound player.
 * Uses the same playAudioSequence infrastructure as all other audio in the app
 * so it benefits from the same caching, blob resolution, and Safari gesture trust.
 *
 * play(onEnded) — plays correct-sound.mp3 then calls onEnded when done.
 */

import { playAudioSequence } from "./useAudio";
import { useRef } from "react";

const CORRECT_SOUND_URL =
  "https://cdn.jsdelivr.net/gh/Mr-Banjoko/learn-with-cody@main/letter_sound/feedback/correct-sound.mp3";

export function useCorrectSound() {
  const cancelRef = useRef(null);

  const play = (onEnded) => {
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
    }

    // finish fires exactly once — either when the audio ends naturally,
    // or via the watchdog below if the audio stalls/gets interrupted.
    let done = false;
    let watchdog = null;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(watchdog);
      cancelRef.current = null;
      if (onEnded) onEnded();
    };

    const cancel = playAudioSequence(
      [{ url: CORRECT_SOUND_URL, gain: 1 }],
      finish
    );
    cancelRef.current = cancel;

    // Watchdog: if the correct-sound never completes (audio interrupted by
    // blur/notification, failed load, etc.), never leave the round stuck —
    // cancel the stalled sequence and advance anyway.
    watchdog = setTimeout(() => {
      if (done) return;
      if (cancelRef.current) {
        cancelRef.current();
        cancelRef.current = null;
      }
      finish();
    }, 3500);
  };

  return { play };
}