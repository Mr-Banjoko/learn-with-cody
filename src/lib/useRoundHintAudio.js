/**
 * useRoundHintAudio
 *
 * Plays a hint audio file when a specific level/round begins.
 * While audio is playing, `locked` is true — callers should render a
 * full-screen overlay to block all UI interaction.
 *
 * Rules:
 * - Plays immediately on mount (or when url changes).
 * - Each url plays exactly once per mount.
 * - If audio fails to load or play, the lock is released gracefully.
 * - No overlap: any previous audio is stopped before the next starts.
 * - onHintComplete (optional): called when hint audio finishes. Use this
 *   to chain additional audio before unlocking the UI.
 *   When onHintComplete is provided, `locked` stays true after hint finishes
 *   until the caller explicitly calls the `unlock` function passed to onHintComplete.
 *
 * Usage (simple):
 *   const { locked } = useRoundHintAudio({ url });
 *
 * Usage (chained word audio):
 *   const { locked } = useRoundHintAudio({
 *     url,
 *     onHintComplete: (unlock) => {
 *       const audio = new Audio(wordAudioUrl);
 *       audio.onended = unlock;
 *       audio.onerror = unlock;
 *       audio.play().catch(unlock);
 *     }
 *   });
 */
import { useState, useEffect, useRef } from "react";

export function useRoundHintAudio({ url, onHintComplete }) {
  const [locked, setLocked] = useState(!!url);
  const audioRef = useRef(null);
  const playedRef = useRef(false);
  const onHintCompleteRef = useRef(onHintComplete);
  useEffect(() => { onHintCompleteRef.current = onHintComplete; }, [onHintComplete]);

  useEffect(() => {
    // Reset on url change (new round entry)
    playedRef.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }

    if (!url) {
      setLocked(false);
      return;
    }

    if (playedRef.current) return;
    playedRef.current = true;
    setLocked(true);

    const audio = new Audio(url);
    audioRef.current = audio;

    const unlock = () => {
      setLocked(false);
      audioRef.current = null;
    };

    const onHintDone = () => {
      audioRef.current = null;
      const cb = onHintCompleteRef.current;
      if (cb) {
        // Keep locked=true; caller must call unlock() when ready
        cb(unlock);
      } else {
        unlock();
      }
    };

    audio.onended = onHintDone;
    audio.onerror = () => {
      console.error(`[RoundHintAudio] Failed to load: ${url}`);
      // On error, still try to chain or just unlock
      const cb = onHintCompleteRef.current;
      if (cb) { cb(unlock); } else { unlock(); }
    };

    audio.play().catch((err) => {
      console.error(`[RoundHintAudio] play() rejected:`, err);
      const cb = onHintCompleteRef.current;
      if (cb) { cb(unlock); } else { unlock(); }
    });

    return () => {
      audio.pause();
      audio.onended = null;
      audio.onerror = null;
    };
  }, [url]); // eslint-disable-line react-hooks/exhaustive-deps

  return { locked };
}

// ── Verified raw GitHub URLs ────────────────────────────────────────────────
const GH = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/letter_sound/levels";

/**
 * Returns the hint audio URL for the given level + roundIndex + lang,
 * or null if this round has no hint audio.
 */
export function getHintAudioUrl(levelNum, roundIndex, lang) {
  const zh = lang === "zh";

  // Level 1, Round 3 (roundIndex 2) → letter_drag_hint / hint 3.mp3
  if (levelNum === 1 && roundIndex === 2) {
    const folder = zh ? "chinese" : "english";
    return `${GH}/letter_drag_hint/${folder}/hint%203.mp3`;
  }

  // Level 2, Round 1 (roundIndex 0) → missing_sound_hint / hint.mp3
  if (levelNum === 2 && roundIndex === 0) {
    const folder = zh ? "chinese" : "english";
    return `${GH}/missing_sound_hint/${folder}/hint.mp3`;
  }

  // Level 3, Round 1 (roundIndex 0) → rearrange_the_picture_hint / hint.mp3
  // NOTE: English subfolder on GitHub is "english " (trailing space → %20)
  if (levelNum === 3 && roundIndex === 0) {
    const folder = zh ? "chinese" : "english%20";
    return `${GH}/rearrange_the_picture_hint/${folder}/hint.mp3`;
  }

  // Level 7, Round 1 (roundIndex 0) → catch_the_letter_hint / hint.mp3
  if (levelNum === 7 && roundIndex === 0) {
    const folder = zh ? "chinese" : "english";
    return `${GH}/catch_the_letter_hint/${folder}/hint.mp3`;
  }

  // Level 4, Round 1 (roundIndex 0) → identifying_hint / hint.mp3
  if (levelNum === 4 && roundIndex === 0) {
    const folder = zh ? "chinese" : "english";
    return `${GH}/identifying_hint/${folder}/hint.mp3`;
  }

  // Level 13, Round 1 (roundIndex 0) → letter_to_sound_hint / hint.mp3
  // NOTE: English subfolder on GitHub is "english " (trailing space → %20)
  if (levelNum === 13 && roundIndex === 0) {
    const folder = zh ? "chinese" : "english%20";
    return `${GH}/letter_to_sound_hint/${folder}/hint.mp3`;
  }

  // Level 17, Round 1 (roundIndex 0) → write_hint  / hint.mp3
  // NOTE: Folder name on GitHub is "write_hint " (trailing space → write_hint%20)
  if (levelNum === 17 && roundIndex === 0) {
    const folder = zh ? "chinese" : "english";
    return `${GH}/write_hint%20/${folder}/hint.mp3`;
  }

  // Level 18, Round 1 (roundIndex 0) → draw_a_line_hint / hint.mp3
  if (levelNum === 18 && roundIndex === 0) {
    const folder = zh ? "chinese" : "english";
    return `${GH}/draw_a_line_hint/${folder}/hint.mp3`;
  }

  // Level 22, Round 1 (roundIndex 0) → dictation_hint / hint.mp3
  if (levelNum === 22 && roundIndex === 0) {
    const folder = zh ? "chinese" : "english";
    return `${GH}/dictation_hint/${folder}/hint.mp3`;
  }

  // Level 32, Round 1 (roundIndex 0) → word match / hint.mp3
  // NOTE: Folder name on GitHub is "word match" (space → word%20match)
  if (levelNum === 32 && roundIndex === 0) {
    const folder = zh ? "chinese" : "english";
    return `${GH}/word%20match/${folder}/hint.mp3`;
  }

  return null;
}

// Full-screen lock overlay style — paste this div when `locked === true`
export const LOCK_OVERLAY_STYLE = {
  position: "absolute",
  inset: 0,
  zIndex: 9000,
  cursor: "default",
  touchAction: "none",
};