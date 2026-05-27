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

  // ── Level 1: Round 1 (index 0) — guided phonics tutorial (existing, keep)
  // Handled inside Level1Phonics directly (phase audio), not here.

  // ── Level 1: Round 2 (index 1) — drag hint (existing, keep as index 1)
  if (levelNum === 1 && roundIndex === 1) {
    const folder = zh ? "chinese" : "english";
    return `${GH}/letter_drag_hint/${folder}/hint%203.mp3`;
  }

  // ── Level 2: Round 5 (index 4) — missing01 first appearance
  if (levelNum === 2 && roundIndex === 4) {
    const folder = zh ? "chinese" : "english";
    return `${GH}/missing_sound_hint/${folder}/hint.mp3`;
  }

  // ── Level 3: Round 1 (index 0) — connection first appearance
  if (levelNum === 3 && roundIndex === 0) {
    const folder = zh ? "chinese" : "english%20";
    return `${GH}/letter_to_sound_hint/${folder}/hint.mp3`;
  }

  // ── Level 4: Round 1 (index 0) — identifying first appearance
  if (levelNum === 4 && roundIndex === 0) {
    const folder = zh ? "chinese" : "english";
    return `${GH}/identifying_hint/${folder}/hint.mp3`;
  }

  // ── Level 9: Round 1 (index 0) — catch first appearance
  if (levelNum === 9 && roundIndex === 0) {
    const folder = zh ? "chinese" : "english";
    return `${GH}/catch_the_letter_hint/${folder}/hint.mp3`;
  }

  // ── Level 13: Round 1 (index 0) — rearrange_easy first appearance
  if (levelNum === 13 && roundIndex === 0) {
    const folder = zh ? "chinese" : "english%20";
    return `${GH}/rearrange_the_picture_hint/${folder}/hint.mp3`;
  }

  // ── Level 18: Round 1 (index 0) — drawline first appearance
  if (levelNum === 18 && roundIndex === 0) {
    const folder = zh ? "chinese" : "english";
    return `${GH}/draw_a_line_hint/${folder}/hint.mp3`;
  }

  // ── Level 23: Round 1 (index 0) — writev2 first appearance
  if (levelNum === 23 && roundIndex === 0) {
    const folder = zh ? "chinese" : "english";
    return `${GH}/write_v2_hint/${folder}/hint.mp3`;
  }

  // ── Level 24: Round 1 (index 0) — dictation first appearance
  if (levelNum === 24 && roundIndex === 0) {
    const folder = zh ? "chinese" : "english";
    return `${GH}/dictation_hint/${folder}/hint.mp3`;
  }

  // ── Level 28: Round 1 (index 0) — rearrange_hard first appearance
  if (levelNum === 28 && roundIndex === 0) {
    const folder = zh ? "chinese" : "english%20";
    return `${GH}/rearrange_the_picture_hint/${folder}/hint.mp3`;
  }

  // ── Level 33: Round 1 (index 0) — word_match first appearance
  if (levelNum === 33 && roundIndex === 0) {
    const folder = zh ? "chinese" : "english";
    return `${GH}/word%20match/${folder}/hint.mp3`;
  }

  // ── Level 38: Round 1 (index 0) — word_to_audio first appearance
  // Reuse word_match hint as closest available
  if (levelNum === 38 && roundIndex === 0) {
    const folder = zh ? "chinese" : "english";
    return `${GH}/word%20match/${folder}/hint.mp3`;
  }

  return null;
}

/**
 * Returns hint audio URL for Short O levels.
 * First appearance of each game type gets a hint.
 */
export function getShortOHintAudioUrl(levelNum, roundIndex, lang) {
  const zh = lang === "zh";

  // L1 R2 (index 1): connection first appearance in Short O
  if (levelNum === 1 && roundIndex === 1) {
    const folder = zh ? "chinese" : "english%20";
    return `${GH}/letter_to_sound_hint/${folder}/hint.mp3`;
  }
  // L2 R1 (index 0): catch first appearance
  if (levelNum === 2 && roundIndex === 0) {
    const folder = zh ? "chinese" : "english";
    return `${GH}/catch_the_letter_hint/${folder}/hint.mp3`;
  }
  // L3 R1 (index 0): missing01 (drag+missing01) first appearance
  if (levelNum === 3 && roundIndex === 0) {
    const folder = zh ? "chinese" : "english";
    return `${GH}/missing_sound_hint/${folder}/hint.mp3`;
  }
  // L5 R2 (index 1): rearrange_easy first appearance
  if (levelNum === 5 && roundIndex === 1) {
    const folder = zh ? "chinese" : "english%20";
    return `${GH}/rearrange_the_picture_hint/${folder}/hint.mp3`;
  }
  // L7 R1 (index 0): drawline first appearance
  if (levelNum === 7 && roundIndex === 0) {
    const folder = zh ? "chinese" : "english";
    return `${GH}/draw_a_line_hint/${folder}/hint.mp3`;
  }
  // L9 R2 (index 1): write first appearance
  if (levelNum === 9 && roundIndex === 1) {
    const folder = zh ? "chinese" : "english";
    return `${GH}/write_hint%20/${folder}/hint.mp3`;
  }
  // L10 R1 (index 0): word_match first appearance
  if (levelNum === 10 && roundIndex === 0) {
    const folder = zh ? "chinese" : "english";
    return `${GH}/word%20match/${folder}/hint.mp3`;
  }
  // L13 R1 (index 0): rearrange_easy reinforcement
  if (levelNum === 13 && roundIndex === 0) {
    const folder = zh ? "chinese" : "english%20";
    return `${GH}/rearrange_the_picture_hint/${folder}/hint.mp3`;
  }
  // L14 R1 (index 0): drawline again
  if (levelNum === 14 && roundIndex === 0) {
    const folder = zh ? "chinese" : "english";
    return `${GH}/draw_a_line_hint/${folder}/hint.mp3`;
  }
  // L17 R1 (index 0): dictation first appearance
  if (levelNum === 17 && roundIndex === 0) {
    const folder = zh ? "chinese" : "english";
    return `${GH}/dictation_hint/${folder}/hint.mp3`;
  }
  // L18 R1 (index 0): writev2 first appearance
  if (levelNum === 18 && roundIndex === 0) {
    const folder = zh ? "chinese" : "english";
    return `${GH}/write_v2_hint/${folder}/hint.mp3`;
  }
  // L19 R1 (index 0): word_to_audio first appearance
  if (levelNum === 19 && roundIndex === 0) {
    const folder = zh ? "chinese" : "english";
    return `${GH}/word%20match/${folder}/hint.mp3`;
  }

  return null;
}

/**
 * Returns hint audio URL for Short I levels.
 * First appearance of each game type gets a hint.
 */
export function getShortIHintAudioUrl(levelNum, roundIndex, lang) {
  const zh = lang === "zh";

  // L1 R1 (index 0): phonics/missing01 intro — no special hint needed (handled by Level1Phonics)

  // L3 R1 (index 0): catch first appearance in Short I
  if (levelNum === 3 && roundIndex === 0) {
    const folder = zh ? "chinese" : "english";
    return `${GH}/catch_the_letter_hint/${folder}/hint.mp3`;
  }
  // L5 R1 (index 0): phonics first appearance in Short I Batch B
  // no special hint needed

  // L6 R5 (index 4): rearrange_hard first appearance in Short I
  if (levelNum === 6 && roundIndex === 4) {
    const folder = zh ? "chinese" : "english%20";
    return `${GH}/rearrange_the_picture_hint/${folder}/hint.mp3`;
  }
  // L7 R1 (index 0): dictation first appearance in Short I
  if (levelNum === 7 && roundIndex === 0) {
    const folder = zh ? "chinese" : "english";
    return `${GH}/dictation_hint/${folder}/hint.mp3`;
  }
  // L8 R5 (index 4): writev2 first appearance in Short I
  if (levelNum === 8 && roundIndex === 4) {
    const folder = zh ? "chinese" : "english";
    return `${GH}/write_v2_hint/${folder}/hint.mp3`;
  }
  // L11 R2 (index 1): write first appearance in Short I
  if (levelNum === 11 && roundIndex === 1) {
    const folder = zh ? "chinese" : "english";
    return `${GH}/write_hint%20/${folder}/hint.mp3`;
  }
  // L13 R1 (index 0): draw-a-line block 1 first appearance in Short I
  if (levelNum === 13 && roundIndex === 0) {
    const folder = zh ? "chinese" : "english";
    return `${GH}/draw_a_line_hint/${folder}/hint.mp3`;
  }
  // L4 R2 (index 1): word_match first appearance in Short I
  if (levelNum === 4 && roundIndex === 1) {
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