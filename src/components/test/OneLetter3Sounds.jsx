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

function SpeakerIcon({ color, size = 52 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="52" height="52" rx="16" fill={color} fillOpacity="0.15" />
      {/* Speaker body */}
      <path
        d="M18 21h-4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4l8 6V15l-8 6z"
        fill={color}
      />
      {/* Sound waves */}
      <path
        d="M30 20.5a8 8 0 0 1 0 11"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M33.5 17a13 13 0 0 1 0 18"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />
    </svg>
  );
}

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
  const [feedback, setFeedback] = useState(null); // null | "correct" | "wrong"
  const feedbackTimeout = useRef(null);

  const handleSpeakerTap = useCallback(
    (letter, colorIdx) => {
      playLetterSound(letter);
      setSelected({ letter, colorIdx });
      if (feedback) setFeedback(null);
    },
    [feedback]
  );

  const handleSubmit = useCallback(() => {
    if (!selected) return;
    if (selected.letter === round.target) {
      setFeedback("correct");
      clearTimeout(feedbackTimeout.current);
      feedbackTimeout.current = setTimeout(() => {
        setRound(buildRound());
        setSelected(null);
        setFeedback(null);
      }, 1400);
    } else {
      setFeedback("wrong");
      clearTimeout(feedbackTimeout.current);
      feedbackTimeout.current = setTimeout(() => {
        setFeedback(null);
      }, 1200);
    }
  }, [selected, round.target]);

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
      {/* Header */}
      <div
        style={{
          background: "#A8D0E6",
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          padding: "10px 20px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}
      >
        <BackArrow onPress={onBack} />
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1E3A5F", margin: 0 }}>
            {tx("1 Letter · 3 Sounds", "one_letter_3_sounds_title", lang)}
          </h1>
          <p style={{ fontSize: 13, color: "#3A6080", margin: 0 }}>
            {tx("Tap the correct sound!", "tap_correct_sound", lang)}
          </p>
        </div>
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 24px 32px",
          gap: 0,
        }}
      >
        {/* Target letter */}
        <AnimatePresence mode="wait">
          <motion.div
            key={round.target}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
              width: 160,
              height: 160,
              borderRadius: 40,
              background: "white",
              boxShadow: "0 12px 40px rgba(78,205,196,0.22), 0 4px 16px rgba(30,58,95,0.10)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 40,
              flexShrink: 0,
              border: "3px solid rgba(78,205,196,0.18)",
            }}
          >
            <span
              style={{
                fontSize: 100,
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
        <div
          style={{
            display: "flex",
            gap: 20,
            marginBottom: 36,
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "nowrap",
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
                animate={
                  isSelected
                    ? { scale: [1, 1.08, 1.04], transition: { duration: 0.25 } }
                    : { scale: 1 }
                }
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
                {/* Speaker SVG — color adapts to selected state */}
                <svg
                  width="58"
                  height="58"
                  viewBox="0 0 52 52"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
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
        </div>

        {/* Feedback banner */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              key={feedback}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              style={{
                background: feedback === "correct" ? "#6BCB77" : "#FF6B6B",
                color: "white",
                borderRadius: 999,
                padding: "12px 32px",
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 16,
                boxShadow:
                  feedback === "correct"
                    ? "0 6px 24px rgba(107,203,119,0.4)"
                    : "0 6px 24px rgba(255,107,107,0.4)",
              }}
            >
              {feedback === "correct"
                ? tx("🌟 Correct!", "correct_feedback", lang)
                : tx("Try again! 🎵", "try_again_feedback", lang)}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit button */}
        <motion.button
          onPointerDown={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          whileTap={selected ? { scale: 0.95 } : {}}
          style={{
            background: selected
              ? "linear-gradient(135deg, #4ECDC4, #44A08D)"
              : "#D1D5DB",
            color: selected ? "white" : "#9CA3AF",
            border: "none",
            borderRadius: 999,
            padding: "16px 56px",
            fontSize: 22,
            fontWeight: 700,
            cursor: selected ? "pointer" : "not-allowed",
            fontFamily: "Fredoka, sans-serif",
            boxShadow: selected
              ? "0 8px 28px rgba(78,205,196,0.4)"
              : "none",
            transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
            WebkitTapHighlightColor: "transparent",
            minWidth: 200,
          }}
        >
          {tx("Submit ✓", "submit_btn", lang)}
        </motion.button>

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