import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackArrow from "../BackArrow";
import { getLetterSoundUrl, getLetterGain } from "../../lib/letterSounds";
import { tx } from "../../lib/i18n";

const ALL_LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

const LETTER_COLORS = [
  { main: "#4ECDC4", light: "#E0FAF8", shadow: "rgba(78,205,196,0.35)" },
  { main: "#FF6B6B", light: "#FFF0F0", shadow: "rgba(255,107,107,0.35)" },
  { main: "#FFD93D", light: "#FFFDE7", shadow: "rgba(255,217,61,0.35)" },
];

function buildRound() {
  const target = ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)];
  const pool = ALL_LETTERS.filter((l) => l !== target);
  const distractors = pool.sort(() => Math.random() - 0.5).slice(0, 2);
  const choices = [target, ...distractors].sort(() => Math.random() - 0.5);
  return { target, choices };
}

function playLetterSound(letter) {
  const url = getLetterSoundUrl(letter);
  if (!url) return;
  const gain = getLetterGain(letter);
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    fetch(url)
      .then((r) => r.arrayBuffer())
      .then((buf) => ctx.decodeAudioData(buf))
      .then((decoded) => {
        const gainNode = ctx.createGain();
        gainNode.gain.value = gain;
        const source = ctx.createBufferSource();
        source.buffer = decoded;
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.start(0);
      })
      .catch(() => {
        const audio = new Audio(url);
        audio.volume = Math.min(1, gain * 0.7);
        audio.play().catch(() => {});
      });
  } catch {
    const audio = new Audio(url);
    audio.play().catch(() => {});
  }
}

export default function OneSound3Letters({ onBack, lang = "en" }) {
  const [round, setRound] = useState(() => buildRound());
  const [selected, setSelected] = useState(null);
  const [showNext, setShowNext] = useState(false);
  const [wrongShake, setWrongShake] = useState(false);
  const shakeTimeout = useRef(null);

  const handleSpeakerTap = useCallback(() => {
    playLetterSound(round.target);
  }, [round.target]);

  const handleLetterTap = useCallback((letter, colorIdx) => {
    if (showNext) return;
    setSelected({ letter, colorIdx });
    if (wrongShake) setWrongShake(false);
  }, [showNext, wrongShake]);

  const handleSubmit = useCallback(() => {
    if (!selected || showNext) return;
    if (selected.letter === round.target) {
      setShowNext(true);
    } else {
      clearTimeout(shakeTimeout.current);
      setWrongShake(true);
      shakeTimeout.current = setTimeout(() => setWrongShake(false), 600);
    }
  }, [selected, round.target, showNext]);

  const handleNext = useCallback(() => {
    setRound(buildRound());
    setSelected(null);
    setShowNext(false);
    setWrongShake(false);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: "Fredoka, sans-serif",
        background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Back arrow only */}
      <div style={{ padding: "12px 16px 0", flexShrink: 0 }}>
        <BackArrow onPress={onBack} />
      </div>

      {/* Speaker icon — vertically centered */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
        }}
      >
        <motion.button
          onClick={handleSpeakerTap}
          whileTap={{ scale: 0.91 }}
          style={{
            width: 246,
            height: 246,
            borderRadius: 60,
            background: "white",
            boxShadow: "0 12px 40px rgba(78,205,196,0.22), 0 4px 16px rgba(30,58,95,0.10)",
            border: "3px solid rgba(78,205,196,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <svg width="120" height="120" viewBox="0 0 52 52" fill="none">
            <path
              d="M18 21h-4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4l8 6V15l-8 6z"
              fill="#4ECDC4"
            />
            <path
              d="M30 20.5a8 8 0 0 1 0 11"
              stroke="#4ECDC4"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M33.5 17a13 13 0 0 1 0 18"
              stroke="#4ECDC4"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.6"
            />
          </svg>
        </motion.button>
      </div>

      {/* Letter choice buttons */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          justifyContent: "center",
          gap: 20,
          paddingLeft: 24,
          paddingRight: 24,
          marginBottom: 32,
        }}
      >
        <motion.div
          animate={wrongShake ? { x: [0, -10, 10, -8, 8, 0] } : { x: 0 }}
          transition={{ duration: 0.45 }}
          style={{ display: "flex", gap: 20 }}
        >
          {round.choices.map((letter, idx) => {
            const colorSet = LETTER_COLORS[idx % LETTER_COLORS.length];
            const isSelected = selected?.letter === letter;
            return (
              <motion.button
                key={`${round.target}-${letter}-${idx}`}
                onClick={() => handleLetterTap(letter, idx)}
                whileTap={{ scale: 0.91 }}
                style={{
                  width: 104,
                  height: 104,
                  borderRadius: 28,
                  background: isSelected ? colorSet.main : "white",
                  border: isSelected
                    ? `3px solid ${colorSet.main}`
                    : `3px solid ${colorSet.main}55`,
                  boxShadow: isSelected
                    ? `0 8px 28px ${colorSet.shadow}, 0 0 0 4px ${colorSet.main}28`
                    : `0 6px 20px rgba(30,58,95,0.10)`,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.18s, border 0.18s, box-shadow 0.18s",
                  WebkitTapHighlightColor: "transparent",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontSize: 52,
                    fontWeight: 700,
                    color: isSelected ? "white" : colorSet.main,
                    fontFamily: "Fredoka, sans-serif",
                    lineHeight: 1,
                    transition: "color 0.18s",
                  }}
                >
                  {letter}
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* Submit button */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          justifyContent: "center",
          paddingLeft: 24,
          paddingRight: 24,
          marginBottom: 20,
        }}
      >
        <motion.button
          onClick={handleSubmit}
          whileTap={selected && !showNext ? { scale: 0.95 } : {}}
          style={{
            background: selected && !showNext
              ? "linear-gradient(135deg, #4ECDC4, #44A08D)"
              : "#D1D5DB",
            color: selected && !showNext ? "white" : "#9CA3AF",
            border: "none",
            borderRadius: 999,
            padding: "16px 56px",
            fontSize: 22,
            fontWeight: 700,
            cursor: selected && !showNext ? "pointer" : "not-allowed",
            fontFamily: "Fredoka, sans-serif",
            boxShadow: selected && !showNext
              ? "0 8px 28px rgba(78,205,196,0.4)"
              : "none",
            transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {tx("Submit ✓", "submit_btn", lang)}
        </motion.button>
      </div>

      {/* Next button — bottom right */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          justifyContent: "flex-end",
          paddingRight: 28,
          paddingBottom: "calc(28px + env(safe-area-inset-bottom, 0px))",
          minHeight: 72,
          alignItems: "flex-end",
        }}
      >
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
                background: "linear-gradient(135deg, #6BCB77, #44A08D)",
                color: "white",
                border: "none",
                borderRadius: 999,
                padding: "16px 32px",
                fontSize: 22,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "Fredoka, sans-serif",
                boxShadow: "0 8px 28px rgba(107,203,119,0.45)",
                WebkitTapHighlightColor: "transparent",
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