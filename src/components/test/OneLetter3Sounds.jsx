import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackArrow from "../BackArrow";
import { getLetterSoundUrl, getLetterGain } from "../../lib/letterSounds";
import { tx } from "../../lib/i18n";

const ALL_LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

const SPEAKER_COLORS = [
  { main: "#4ECDC4", light: "#E0FAF8", shadow: "rgba(78,205,196,0.35)" },
  { main: "#FF6B6B", light: "#FFF0F0", shadow: "rgba(255,107,107,0.35)" },
  { main: "#FFD93D", light: "#FFFDE7", shadow: "rgba(255,217,61,0.35)" },
];

function buildRound() {
  const target = ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)];
  const pool = ALL_LETTERS.filter((l) => l !== target);
  const shuffledPool = pool.sort(() => Math.random() - 0.5);
  const distractors = shuffledPool.slice(0, 2);
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

export default function OneLetter3Sounds({ onBack, lang = "en" }) {
  const [round, setRound] = useState(() => buildRound());
  const [selected, setSelected] = useState(null);
  const [showNext, setShowNext] = useState(false);
  const [wrongShake, setWrongShake] = useState(false);
  const shakeTimeout = useRef(null);

  const handleSpeakerTap = useCallback((letter, colorIdx) => {
    playLetterSound(letter);
    setSelected({ letter, colorIdx });
    if (showNext) setShowNext(false);
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
      {/* Back arrow only — no header bar */}
      <div style={{ padding: "12px 16px 0", flexShrink: 0 }}>
        <BackArrow onPress={onBack} />
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: "6%",
          paddingBottom: 32,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        {/* Target letter — 10% bigger: 160→176, positioned higher */}
        <AnimatePresence mode="wait">
          <motion.div
            key={round.target}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
              width: 176,
              height: 176,
              borderRadius: 44,
              background: "white",
              boxShadow: "0 12px 40px rgba(78,205,196,0.22), 0 4px 16px rgba(30,58,95,0.10)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 44,
              flexShrink: 0,
              border: "3px solid rgba(78,205,196,0.18)",
            }}
          >
            <span
              style={{
                fontSize: 110,
                fontWeight: 700,
                color: "#1E3A5F",
                lineHeight: 1,
                fontFamily: "Fredoka, sans-serif",
                letterSpacing: "-2px",
              }}
            >
              {round.target}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Speaker choices */}
        <motion.div
          animate={wrongShake ? { x: [0, -10, 10, -8, 8, 0] } : { x: 0 }}
          transition={{ duration: 0.45 }}
          style={{
            display: "flex",
            gap: 20,
            marginBottom: 40,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {round.choices.map((letter, idx) => {
            const colorSet = SPEAKER_COLORS[idx % SPEAKER_COLORS.length];
            const isSelected = selected?.letter === letter;
            return (
              <motion.button
                key={`${round.target}-${letter}-${idx}`}
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleSpeakerTap(letter, idx);
                }}
                whileTap={{ scale: 0.91 }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 28,
                  background: isSelected ? colorSet.main : "white",
                  border: isSelected
                    ? `3px solid ${colorSet.main}`
                    : `3px solid ${colorSet.main}44`,
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
                <svg width="58" height="58" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M18 21h-4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4l8 6V15l-8 6z"
                    fill={isSelected ? "white" : colorSet.main}
                  />
                  <path
                    d="M30 20.5a8 8 0 0 1 0 11"
                    stroke={isSelected ? "white" : colorSet.main}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M33.5 17a13 13 0 0 1 0 18"
                    stroke={isSelected ? "white" : colorSet.main}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.6"
                  />
                </svg>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Submit + Next row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            justifyContent: "center",
            width: "100%",
          }}
        >
          {/* Submit button */}
          <motion.button
            onPointerDown={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            whileTap={selected && !showNext ? { scale: 0.95 } : {}}
            style={{
              background:
                selected && !showNext
                  ? "linear-gradient(135deg, #4ECDC4, #44A08D)"
                  : "#D1D5DB",
              color: selected && !showNext ? "white" : "#9CA3AF",
              border: "none",
              borderRadius: 999,
              padding: "16px 48px",
              fontSize: 22,
              fontWeight: 700,
              cursor: selected && !showNext ? "pointer" : "not-allowed",
              fontFamily: "Fredoka, sans-serif",
              boxShadow:
                selected && !showNext
                  ? "0 8px 28px rgba(78,205,196,0.4)"
                  : "none",
              transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {tx("Submit ✓", "submit_btn", lang)}
          </motion.button>

          {/* Next button — appears after correct answer */}
          <AnimatePresence>
            {showNext && (
              <motion.button
                initial={{ opacity: 0, scale: 0.7, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ type: "spring", stiffness: 350, damping: 22 }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleNext();
                }}
                whileTap={{ scale: 0.93 }}
                style={{
                  background: "linear-gradient(135deg, #6BCB77, #44A08D)",
                  color: "white",
                  border: "none",
                  borderRadius: 999,
                  padding: "16px 28px",
                  fontSize: 22,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "Fredoka, sans-serif",
                  boxShadow: "0 8px 28px rgba(107,203,119,0.45)",
                  WebkitTapHighlightColor: "transparent",
                  flexShrink: 0,
                }}
              >
                {tx("Next →", "next_btn", lang)}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Hint */}
        <p
          style={{
            fontSize: 13,
            color: "#94A3B8",
            marginTop: 14,
            textAlign: "center",
          }}
        >
          {tx("Tap a speaker, then submit", "speaker_hint", lang)}
        </p>
      </div>
    </div>
  );
}