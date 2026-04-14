import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackArrow from "../BackArrow";
import { playAudio } from "../../lib/useAudio";
import { shortAWords } from "../../lib/shortAWords";
import { shortEWords } from "../../lib/shortEWords";
import { shortIWords } from "../../lib/shortIWords";
import { shortOWords } from "../../lib/shortOWords";
import { shortUWords } from "../../lib/shortUWords";
import { tx } from "../../lib/i18n";

const ALL_WORDS = [
  ...shortAWords,
  ...shortEWords,
  ...shortIWords,
  ...shortOWords,
  ...shortUWords,
];

const CHOICE_COLORS = [
  { border: "#4ECDC4", shadow: "rgba(78,205,196,0.35)", ring: "rgba(78,205,196,0.28)" },
  { border: "#FF6B6B", shadow: "rgba(255,107,107,0.35)", ring: "rgba(255,107,107,0.28)" },
  { border: "#FFD93D", shadow: "rgba(255,217,61,0.35)", ring: "rgba(255,217,61,0.28)" },
];

function buildRound(lastWord) {
  const pool = lastWord ? ALL_WORDS.filter((w) => w !== lastWord) : ALL_WORDS;
  const target = pool[Math.floor(Math.random() * pool.length)];
  const distractorPool = ALL_WORDS.filter((w) => w.word !== target.word);
  const shuffled = [...distractorPool].sort(() => Math.random() - 0.5);
  const distractors = shuffled.slice(0, 2);
  const choices = [target, ...distractors].sort(() => Math.random() - 0.5);
  return { target, choices };
}

function SpeakerIcon({ color = "#4ECDC4", size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <path d="M18 21h-4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4l8 6V15l-8 6z" fill={color} />
      <path d="M30 20.5a8 8 0 0 1 0 11" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M33.5 17a13 13 0 0 1 0 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
    </svg>
  );
}

export default function WordToPicture({ onBack, lang = "en", onRoundComplete, hideBackArrow }) {
  const [round, setRound] = useState(() => buildRound(null));
  const [selected, setSelected] = useState(null);
  const [showNext, setShowNext] = useState(false);
  const [wrongShake, setWrongShake] = useState(false);
  const shakeTimeout = useRef(null);
  const wrongAttempts = useRef(0);
  const lastWordRef = useRef(null);

  // Auto-play word audio when round loads
  useEffect(() => {
    if (round.target.audio) {
      playAudio(round.target.audio);
    }
  }, [round]);

  const handleSpeakerTap = useCallback(() => {
    if (round.target.audio) playAudio(round.target.audio);
  }, [round]);

  const handleSelect = useCallback(
    (choice) => {
      if (showNext) return;
      setSelected(choice);
      if (wrongShake) setWrongShake(false);
    },
    [showNext, wrongShake]
  );

  const handleSubmit = useCallback(() => {
    if (!selected || showNext) return;
    if (selected.word === round.target.word) {
      if (round.target.audio) playAudio(round.target.audio);
      setShowNext(true);
    } else {
      wrongAttempts.current++;
      clearTimeout(shakeTimeout.current);
      setWrongShake(true);
      shakeTimeout.current = setTimeout(() => setWrongShake(false), 600);
    }
  }, [selected, round, showNext]);

  const handleNext = useCallback(() => {
    if (onRoundComplete) onRoundComplete(Math.max(0, 2 - wrongAttempts.current));
    wrongAttempts.current = 0;
    lastWordRef.current = round.target;
    setRound(buildRound(round.target));
    setSelected(null);
    setShowNext(false);
    setWrongShake(false);
  }, [onRoundComplete, round]);

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
      {/* Back arrow */}
      {!hideBackArrow && (
        <div style={{ padding: "12px 16px 0", flexShrink: 0 }}>
          <BackArrow onPress={onBack} />
        </div>
      )}

      {/* Row 1: Word box + speaker */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          padding: "20px 24px 10px",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={round.target.word}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.05, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            style={{
              background: "white",
              borderRadius: 20,
              padding: "14px 40px",
              boxShadow:
                "0 8px 32px rgba(78,205,196,0.20), 0 2px 10px rgba(30,58,95,0.08)",
              border: "3px solid rgba(78,205,196,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: 52,
                fontWeight: 700,
                color: "#1E3A5F",
                fontFamily: "Fredoka, sans-serif",
                letterSpacing: "-0.5px",
              }}
            >
              {round.target.word}
            </span>
          </motion.div>
        </AnimatePresence>

        <motion.button
          onClick={handleSpeakerTap}
          whileTap={{ scale: 0.88 }}
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: "white",
            border: "2.5px solid rgba(78,205,196,0.35)",
            boxShadow: "0 4px 16px rgba(78,205,196,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <SpeakerIcon color="#4ECDC4" size={26} />
        </motion.button>
      </div>

      {/* Rows 2–4: Picture choices — one per row */}
      <motion.div
        animate={wrongShake ? { x: [0, -10, 10, -8, 8, 0] } : { x: 0 }}
        transition={{ duration: 0.45 }}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
          padding: "4px 24px",
          minHeight: 0,
        }}
      >
        {round.choices.map((choice, idx) => {
          const isSelected = selected?.word === choice.word;
          const colorSet = CHOICE_COLORS[idx % CHOICE_COLORS.length];

          return (
            <motion.button
              key={`${round.target.word}-${choice.word}-${idx}`}
              onClick={() => handleSelect(choice)}
              whileTap={{ scale: 0.97 }}
              style={{
                background: "white",
                borderRadius: 22,
                border: isSelected
                  ? `3.5px solid ${colorSet.border}`
                  : "3px solid rgba(168,208,230,0.25)",
                boxShadow: isSelected
                  ? `0 8px 28px ${colorSet.shadow}, 0 0 0 5px ${colorSet.ring}`
                  : "0 4px 18px rgba(30,58,95,0.09)",
                overflow: "hidden",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "border 0.16s, box-shadow 0.16s",
                WebkitTapHighlightColor: "transparent",
                width: "100%",
                height: 135,
                flexShrink: 0,
              }}
            >
              <img
                src={choice.image}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  pointerEvents: "none",
                }}
              />
            </motion.button>
          );
        })}
      </motion.div>

      {/* Row 5: Submit button */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          justifyContent: "center",
          padding: "10px 24px 0",
        }}
      >
        <motion.button
          onClick={handleSubmit}
          whileTap={selected && !showNext ? { scale: 0.95 } : {}}
          style={{
            background:
              selected && !showNext
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
            boxShadow:
              selected && !showNext ? "0 8px 28px rgba(78,205,196,0.4)" : "none",
            transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
            WebkitTapHighlightColor: "transparent",
            width: "100%",
            maxWidth: 320,
          }}
        >
          {tx("Submit ✓", "submit_btn", lang)}
        </motion.button>
      </div>

      {/* Next button */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          justifyContent: "flex-end",
          paddingRight: 28,
          paddingBottom: "calc(20px + env(safe-area-inset-bottom, 0px))",
          minHeight: 68,
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