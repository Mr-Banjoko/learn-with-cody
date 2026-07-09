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

    const cancel = playAudioSequence(
      [{ url: CORRECT_SOUND_URL, gain: 1 }],
      () => {
        cancelRef.current = null;
        if (onEnded) onEnded();
      }
    );
    cancelRef.current = cancel;
  };

  return { play };
}