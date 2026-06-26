/**
 * CampaignVowelSoundRound
 *
 * Campaign-mode adaptation of OneLetter3Sounds.
 * Shows one vowel letter; the learner must tap the matching sound
 * from 3 speaker buttons (all are vowel sounds — a, e, i, o, u).
 * The target vowel is always included; 2 distractors are the other vowels.
 *
 * Props:
 *   targetLetter  — the vowel to identify (e.g. "a")
 *   onComplete()  — called after correct submit + sound plays
 *   onMistake()   — called on each wrong submit
 *   lang          — "en" | "zh"
 */
import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getLetterSoundUrl, getLetterGain } from "../../../lib/letterSounds";
import { playAudio } from "../../../lib/useAudio";
import { useCorrectSound } from "../../../lib/useCorrectSound";
import { useTryAgainSound } from "../../../lib/useTryAgainSound";

const VOWELS = ["a", "e", "i", "o", "u"];

const SPEAKER_COLORS = [
  { main: "#FF6B6B", light: "#FFF0F0", shadow: "rgba(255,107,107,0.35)" },
  { main: "#4ECDC4", light: "#E0FAF8", shadow: "rgba(78,205,196,0.35)" },
  { main: "#FFD93D", light: "#FFFDE7", shadow: "rgba(255,217,61,0.35)" },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function SpeakerIcon({ color, size = 58 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <path d="M18 21h-4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4l8 6V15l-8 6z" fill={color} />
      <path d="M30 20.5a8 8 0 0 1 0 11" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M33.5 17a13 13 0 0 1 0 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
    </svg>
  );
}

export default function CampaignVowelSoundRound({ targetLetter, onComplete, onMistake, lang = "en" }) {
  // Build 3 choices: target + 2 other vowels, shuffled
  const choices = useState(() => {
    const distractors = shuffle(VOWELS.filter((v) => v !== targetLetter)).slice(0, 2);
    return shuffle([targetLetter, ...distractors]);
  })[0];

  const [selected, setSelected] = useState(null);
  const [wrongShake, setWrongShake] = useState(false);
  const [completing, setCompleting] = useState(false);
  const shakeTimeout = useRef(null);
  const { play: playCorrect } = useCorrectSound();
  const { play: playTryAgain } = useTryAgainSound();

  // No auto-play — user must tap to hear the sound

  const handleSpeakerTap = useCallback((letter) => {
    if (completing) return;
    const url = getLetterSoundUrl(letter);
    if (url) playAudio(url, getLetterGain(letter));
    setSelected(letter);
    if (wrongShake) setWrongShake(false);
  }, [completing, wrongShake]);

  const handleSubmit = useCallback(() => {
    if (!selected || completing) return;
    if (selected === targetLetter) {
      setCompleting(true);
      playCorrect(() => onComplete());
    } else {
      onMistake && onMistake();
      playTryAgain();
      clearTimeout(shakeTimeout.current);
      setWrongShake(true);
      shakeTimeout.current = setTimeout(() => {
        setWrongShake(false);
        setSelected(null);
      }, 600);
    }
  }, [selected, targetLetter, completing, playCorrect, playTryAgain, onComplete, onMistake]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", fontFamily: "Fredoka, sans-serif", overflow: "hidden", position: "relative" }}>
      {completing && <div style={{ position: "absolute", inset: 0, zIndex: 100, pointerEvents: "all" }} />}

      {/* Big letter display */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={targetLetter}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
              width: "min(220px, 55vw)", height: "min(220px, 55vw)",
              borderRadius: 56,
              background: "white",
              boxShadow: "0 12px 40px rgba(78,205,196,0.22), 0 4px 16px rgba(30,58,95,0.10)",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "3px solid rgba(78,205,196,0.18)",
              cursor: "default",
            }}
          >
            <span style={{ fontSize: "min(140px, 34vw)", fontWeight: 700, color: "#1E3A5F", lineHeight: 1, letterSpacing: "-2px" }}>
              {targetLetter}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Speaker buttons */}
      <div style={{ flexShrink: 0, display: "flex", justifyContent: "center", gap: 20, padding: "0 24px 24px" }}>
        <motion.div
          animate={wrongShake ? { x: [0, -10, 10, -8, 8, 0] } : { x: 0 }}
          transition={{ duration: 0.45 }}
          style={{ display: "flex", gap: 20 }}
        >
          {choices.map((letter, idx) => {
            const colorSet = SPEAKER_COLORS[idx % SPEAKER_COLORS.length];
            const isSelected = selected === letter;
            return (
              <motion.button
                key={`${targetLetter}-${letter}-${idx}`}
                onClick={() => handleSpeakerTap(letter)}
                whileTap={{ scale: 0.91 }}
                style={{
                  width: "min(104px, 27vw)", height: "min(104px, 27vw)",
                  borderRadius: 28,
                  background: isSelected ? colorSet.main : "white",
                  border: isSelected ? `3px solid ${colorSet.main}` : `3px solid ${colorSet.main}55`,
                  boxShadow: isSelected
                    ? `0 8px 28px ${colorSet.shadow}, 0 0 0 4px ${colorSet.main}28`
                    : "0 6px 20px rgba(30,58,95,0.10)",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.18s, border 0.18s, box-shadow 0.18s",
                  WebkitTapHighlightColor: "transparent",
                  flexShrink: 0,
                }}
              >
                <SpeakerIcon color={isSelected ? "white" : colorSet.main} />
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* Submit button */}
      <div style={{ flexShrink: 0, display: "flex", justifyContent: "center", padding: "0 24px 28px" }}>
        <motion.button
          onClick={handleSubmit}
          whileTap={selected && !completing ? { scale: 0.95 } : {}}
          style={{
            background: selected && !completing ? "linear-gradient(135deg, #4ECDC4, #44A08D)" : "#D1D5DB",
            color: selected && !completing ? "white" : "#9CA3AF",
            border: "none",
            borderRadius: 999,
            padding: "16px 56px",
            fontSize: 22,
            fontWeight: 700,
            cursor: selected && !completing ? "pointer" : "not-allowed",
            fontFamily: "Fredoka, sans-serif",
            boxShadow: selected && !completing ? "0 8px 28px rgba(78,205,196,0.4)" : "none",
            transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
            WebkitTapHighlightColor: "transparent",
            width: "100%",
            maxWidth: 300,
          }}
        >
          {lang === "zh" ? "确认 ✓" : "Submit ✓"}
        </motion.button>
      </div>
    </div>
  );
}