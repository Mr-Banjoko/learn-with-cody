/**
 * Placement round — 1 Sound · 3 Letters.
 * A speaker plays a target sound; the learner taps the matching letter.
 * Fixed round (from props), campaign-round interface: onComplete / onMistake.
 */
import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getLetterSoundUrl, getLetterGain } from "../../lib/letterSounds";
import { playAudio } from "../../lib/useAudio";
import { tx } from "../../lib/i18n";

const LETTER_COLORS = [
  { main: "#4ECDC4", shadow: "rgba(78,205,196,0.35)" },
  { main: "#FF6B6B", shadow: "rgba(255,107,107,0.35)" },
  { main: "#FFD93D", shadow: "rgba(255,217,61,0.35)" },
];

export default function PlacementSound3Letters({ round, onComplete, onMistake, lang = "en" }) {
  const { target, choices } = round;
  const [selected, setSelected] = useState(null);
  const [showNext, setShowNext] = useState(false);
  const [wrongShake, setWrongShake] = useState(false);
  const shakeTimeout = useRef(null);

  const playSound = useCallback(() => {
    playAudio(getLetterSoundUrl(target), getLetterGain(target));
  }, [target]);

  const handleLetterTap = useCallback((letter) => {
    if (showNext) return;
    setSelected(letter);
    if (wrongShake) setWrongShake(false);
  }, [showNext, wrongShake]);

  const handleSubmit = useCallback(() => {
    if (!selected || showNext) return;
    if (selected === target) {
      setShowNext(true);
    } else {
      onMistake?.();
      clearTimeout(shakeTimeout.current);
      setWrongShake(true);
      shakeTimeout.current = setTimeout(() => setWrongShake(false), 600);
    }
  }, [selected, target, showNext, onMistake]);

  const handleNext = useCallback(() => {
    setShowNext(false);
    setSelected(null);
    onComplete?.();
  }, [onComplete]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
        <motion.button
          onClick={playSound}
          whileTap={{ scale: 0.91 }}
          style={{
            width: 246, height: 246, borderRadius: 60, background: "white",
            boxShadow: "0 12px 40px rgba(78,205,196,0.22), 0 4px 16px rgba(30,58,95,0.10)",
            border: "3px solid rgba(78,205,196,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", WebkitTapHighlightColor: "transparent",
          }}
        >
          <svg width="120" height="120" viewBox="0 0 52 52" fill="none">
            <path d="M18 21h-4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4l8 6V15l-8 6z" fill="#4ECDC4" />
            <path d="M30 20.5a8 8 0 0 1 0 11" stroke="#4ECDC4" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M33.5 17a13 13 0 0 1 0 18" stroke="#4ECDC4" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
          </svg>
        </motion.button>
      </div>

      <div style={{ flexShrink: 0, display: "flex", justifyContent: "center", gap: 20, paddingLeft: 24, paddingRight: 24, marginBottom: 28 }}>
        <motion.div animate={wrongShake ? { x: [0, -10, 10, -8, 8, 0] } : { x: 0 }} transition={{ duration: 0.45 }} style={{ display: "flex", gap: 20 }}>
          {choices.map((letter, idx) => {
            const color = LETTER_COLORS[idx % LETTER_COLORS.length];
            const isSelected = selected === letter;
            return (
              <motion.button
                key={`${target}-${letter}-${idx}`}
                onClick={() => handleLetterTap(letter)}
                whileTap={{ scale: 0.91 }}
                style={{
                  width: 104, height: 104, borderRadius: 28,
                  background: isSelected ? color.main : "white",
                  border: isSelected ? `3px solid ${color.main}` : `3px solid ${color.main}55`,
                  boxShadow: isSelected ? `0 8px 28px ${color.shadow}, 0 0 0 4px ${color.main}28` : "0 6px 20px rgba(30,58,95,0.10)",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.18s, border 0.18s, box-shadow 0.18s",
                  WebkitTapHighlightColor: "transparent", flexShrink: 0,
                }}
              >
                <span style={{ fontSize: 52, fontWeight: 700, color: isSelected ? "white" : color.main, lineHeight: 1, transition: "color 0.18s" }}>
                  {letter}
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      <div style={{ flexShrink: 0, display: "flex", justifyContent: "center", paddingLeft: 24, paddingRight: 24, marginBottom: 16 }}>
        <motion.button
          onClick={handleSubmit}
          whileTap={selected && !showNext ? { scale: 0.95 } : {}}
          style={{
            background: selected && !showNext ? "linear-gradient(135deg, #4ECDC4, #44A08D)" : "#D1D5DB",
            color: selected && !showNext ? "white" : "#9CA3AF", border: "none", borderRadius: 999,
            padding: "16px 56px", fontSize: 22, fontWeight: 700,
            cursor: selected && !showNext ? "pointer" : "not-allowed", fontFamily: "Fredoka, sans-serif",
            boxShadow: selected && !showNext ? "0 8px 28px rgba(78,205,196,0.4)" : "none",
            transition: "background 0.2s, color 0.2s, box-shadow 0.2s", WebkitTapHighlightColor: "transparent",
          }}
        >
          {tx("Submit ✓", "submit_btn", lang)}
        </motion.button>
      </div>

      <div style={{ flexShrink: 0, display: "flex", justifyContent: "flex-end", paddingRight: 28, paddingBottom: "calc(20px + env(safe-area-inset-bottom, 0px))", minHeight: 64, alignItems: "flex-end" }}>
        <AnimatePresence>
          {showNext && (
            <motion.button
              initial={{ opacity: 0, scale: 0.7, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ type: "spring", stiffness: 350, damping: 22 }}
              onClick={handleNext}
              whileTap={{ scale: 0.93 }}
              style={{
                background: "linear-gradient(135deg, #6BCB77, #44A08D)", color: "white", border: "none",
                borderRadius: 999, padding: "16px 32px", fontSize: 22, fontWeight: 700, cursor: "pointer",
                fontFamily: "Fredoka, sans-serif", boxShadow: "0 8px 28px rgba(107,203,119,0.45)", WebkitTapHighlightColor: "transparent",
              }}
            >
              {tx("Next →", "next_btn", lang)}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}