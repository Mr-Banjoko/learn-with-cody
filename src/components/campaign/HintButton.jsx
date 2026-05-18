/**
 * HintButton — on-demand hint audio button for Campaign Mode.
 *
 * Uses hint.png image. Plays a game-type-specific audio clip when tapped.
 * Does NOT lock the UI. Uses its own separate Audio instance.
 * If audio is already playing, restarts from the beginning.
 * If no audio URL is defined, button is visible but tap does nothing.
 */
import { useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { getHintAudioForGameType } from "../../lib/hintAudio";

const HINT_IMG = "https://media.base44.com/images/public/69c4ec00726384fdef1ab181/80369bdaf_hint.png";

export default function HintButton({ gameType, lang = "en" }) {
  const audioRef = useRef(null);

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

    const audio = new Audio(url);
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
        width: 48,
        height: 48,
      }}
      aria-label="Hint"
    >
      <img
        src={HINT_IMG}
        alt="Hint"
        style={{
          width: 48,
          height: 48,
          objectFit: "contain",
          display: "block",
          pointerEvents: "none",
        }}
        draggable={false}
      />
    </motion.button>
  );
}