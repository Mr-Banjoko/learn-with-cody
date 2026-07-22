/**
 * HintButton — on-demand hint audio button for Campaign Mode.
 *
 * Uses hint.png image. Plays a game-type-specific audio clip when tapped.
 * Does NOT lock the UI. Uses its own separate Audio instance.
 * If audio is already playing, restarts from the beginning.
 * If no audio URL is defined, button is visible but tap does nothing.
 *
 * INSTANT PLAYBACK: the hint mp3 is prefetched into a blob URL as soon as
 * the round mounts (gameType/lang known), so tapping plays from memory
 * with zero network delay. Cache is module-level and persists across rounds.
 */
import { useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { getHintAudioForGameType } from "../../lib/hintAudio";

const HINT_IMG = "https://media.base44.com/images/public/69c4ec00726384fdef1ab181/80369bdaf_hint.png";

// url → blob URL (or in-flight promise) — shared across all HintButton instances
const blobCache = new Map();

function preloadHint(url) {
  if (!url || blobCache.has(url)) return blobCache.get(url);
  const promise = fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.blob();
    })
    .then((blob) => {
      const blobUrl = URL.createObjectURL(blob);
      blobCache.set(url, blobUrl);
      return blobUrl;
    })
    .catch(() => {
      blobCache.delete(url); // allow retry on next mount
      return null;
    });
  blobCache.set(url, promise);
  return promise;
}

export default function HintButton({ gameType, lang = "en", variant = "image" }) {
  const audioRef = useRef(null);

  // Prefetch the hint audio the moment the round mounts
  useEffect(() => {
    const url = getHintAudioForGameType(gameType, lang);
    if (url) preloadHint(url);
  }, [gameType, lang]);

  const handleTap = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    const url = getHintAudioForGameType(gameType, lang);
    if (!url) return; // no audio defined — silent

    // Stop any currently playing hint audio and restart
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }

    // Play from the cached blob if ready; fall back to the network URL
    const cached = blobCache.get(url);
    const src = typeof cached === "string" ? cached : url;

    const audio = new Audio(src);
    audioRef.current = audio;

    audio.onended = () => { audioRef.current = null; };
    audio.onerror = () => {
      console.error(`[HintButton] Failed to load hint audio: ${url}`);
      audioRef.current = null;
    };

    audio.play().catch((err) => {
      console.error(`[HintButton] play() rejected:`, err);
      audioRef.current = null;
    });
  }, [gameType, lang]);

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onPointerDown={handleTap}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        touchAction: "manipulation",
        userSelect: "none",
        flexShrink: 0,
        width: 72,
        height: variant === "storybook" ? 46 : 72,
        color: "#18315E",
        fontFamily: "Fredoka, sans-serif",
        fontSize: 25,
        fontWeight: 700,
      }}
      aria-label="Hint"
    >
      {variant === "storybook" ? "Hint" : (
        <img
          src={HINT_IMG}
          alt="Hint"
          style={{
            width: 72,
            height: 72,
            objectFit: "contain",
            display: "block",
            pointerEvents: "none",
          }}
          draggable={false}
        />
      )}
    </motion.button>
  );
}