/**
 * CampaignOneLetter3Sounds — Campaign-mode round for "1 Letter · 3 Sounds".
 * Shows a big target letter; tapping a speaker plays its sound and selects it
 * (does not evaluate). Tapping Submit checks the selection: correct advances
 * (via onComplete), wrong shakes + counts a mistake and lets the child retry.
 * No hint audio is wired for this game type (HintButton renders silently).
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getLetterSoundUrl, getLetterGain } from "../../lib/letterSounds";
import { playAudio } from "../../lib/useAudio";
import { useCorrectSound } from "../../lib/useCorrectSound";
import { useTryAgainSound } from "../../lib/useTryAgainSound";

const SPEAKER_COLORS = [
  { main: "#4ECDC4", shadow: "rgba(78,205,196,0.35)" },
  { main: "#FF6B6B", shadow: "rgba(255,107,107,0.35)" },
  { main: "#FFD93D", shadow: "rgba(255,217,61,0.35)" },
];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function CampaignOneLetter3Sounds({ speakers, targetLetter, onComplete, onMistake }) {
  const [choices] = useState(() => shuffle(speakers));
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false); // true while correct-answer sequence plays out
  const [shake, setShake] = useState(false);
  const { play: playCorrect } = useCorrectSound();
  const { play: playTryAgain } = useTryAgainSound();

  const handleTap = useCallback((letter) => {
    if (locked) return;
    playAudio(getLetterSoundUrl(letter), getLetterGain(letter));
    setSelected(letter);
  }, [locked]);

  const handleSubmit = useCallback(() => {
    if (!selected || locked) return;
    if (selected === targetLetter) {
      setLocked(true);
      playCorrect(() => onComplete());
    } else {
      playTryAgain();
      onMistake && onMistake();
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }, [selected, locked, targetLetter, onComplete, onMistake, playCorrect, playTryAgain]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", padding: "8px 16px 28px", fontFamily: "Fredoka, sans-serif" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={targetLetter}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.2, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          style={{
            width: 180, height: 180, borderRadius: 44, background: "white",
            boxShadow: "0 12px 40px rgba(78,205,196,0.22), 0 4px 16px rgba(30,58,95,0.10)",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "3px solid rgba(78,205,196,0.18)",
          }}
        >
          <span style={{ fontSize: 106, fontWeight: 700, color: "#1E3A5F", lineHeight: 1, fontFamily: "Fredoka, sans-serif", letterSpacing: "-2px" }}>
            {targetLetter}
          </span>
        </motion.div>
      </AnimatePresence>

      <motion.div
        animate={shake ? { x: [0, -10, 10, -8, 8, 0] } : { x: 0 }}
        transition={{ duration: 0.45 }}
        style={{ display: "flex", gap: 20 }}
      >
        {choices.map((letter, idx) => {
          const colorSet = SPEAKER_COLORS[idx % SPEAKER_COLORS.length];
          const isSelected = selected === letter;
          return (
            <motion.button
              key={`${targetLetter}-${letter}-${idx}`}
              onPointerDown={(e) => { e.preventDefault(); handleTap(letter); }}
              whileTap={!locked ? { scale: 0.91 } : {}}
              style={{
                width: 92, height: 92, borderRadius: 26,
                background: isSelected ? colorSet.main : "white",
                border: isSelected ? `3px solid ${colorSet.main}` : `3px solid ${colorSet.main}55`,
                boxShadow: isSelected
                  ? `0 8px 28px ${colorSet.shadow}, 0 0 0 4px ${colorSet.main}28`
                  : "0 6px 20px rgba(30,58,95,0.10)",
                cursor: locked ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.18s, border 0.18s, box-shadow 0.18s",
                WebkitTapHighlightColor: "transparent",
                touchAction: "manipulation",
                flexShrink: 0,
              }}
            >
              <svg width="48" height="48" viewBox="0 0 52 52" fill="none">
                <path d="M18 21h-4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4l8 6V15l-8 6z" fill={isSelected ? "white" : colorSet.main} />
                <path d="M30 20.5a8 8 0 0 1 0 11" stroke={isSelected ? "white" : colorSet.main} strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M33.5 17a13 13 0 0 1 0 18" stroke={isSelected ? "white" : colorSet.main} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
              </svg>
            </motion.button>
          );
        })}
      </motion.div>

      <motion.button
        onPointerDown={(e) => { e.preventDefault(); handleSubmit(); }}
        whileTap={selected && !locked ? { scale: 0.95 } : {}}
        style={{
          background: selected && !locked ? "linear-gradient(135deg, #4ECDC4, #44A08D)" : "#D1D5DB",
          color: selected && !locked ? "white" : "#9CA3AF",
          border: "none",
          borderRadius: 999,
          padding: "16px 56px",
          fontSize: 22,
          fontWeight: 700,
          cursor: selected && !locked ? "pointer" : "not-allowed",
          fontFamily: "Fredoka, sans-serif",
          boxShadow: selected && !locked ? "0 8px 28px rgba(78,205,196,0.4)" : "none",
          transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
          WebkitTapHighlightColor: "transparent",
          touchAction: "manipulation",
        }}
      >
        Submit ✓
      </motion.button>
    </div>
  );
}