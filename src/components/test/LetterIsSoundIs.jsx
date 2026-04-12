import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackArrow from "../BackArrow";

const ALL_LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

const CHOICE_COLORS = [
  { main: "#4ECDC4", light: "#E0FAF8", shadow: "rgba(78,205,196,0.4)" },
  { main: "#FF6B6B", light: "#FFF0F0", shadow: "rgba(255,107,107,0.4)" },
  { main: "#4D96FF", light: "#EFF6FF", shadow: "rgba(77,150,255,0.4)" },
];

function SpeakerIcon({ color = "#1E3A5F", size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <path
        d="M18 21h-4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4l8 6V15l-8 6z"
        fill={color}
      />
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
        opacity="0.6"
      />
    </svg>
  );
}

function buildRound() {
  const situation = Math.random() < 0.5 ? 1 : 2;
  const letter =
    ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)];
  const pool = ALL_LETTERS.filter((l) => l !== letter);
  const distractors = pool.sort(() => Math.random() - 0.5).slice(0, 2);
  const choices = [letter, ...distractors].sort(() => Math.random() - 0.5);
  return { situation, letter, choices };
}

// Tap-to-place: tapping a choice snaps it into the target box.
// Tapping the placed item in the box removes it back.
export default function LetterIsSoundIs({ onBack, lang = "en" }) {
  const [round, setRound] = useState(() => buildRound());
  const [placed, setPlaced] = useState(null); // { choiceIdx }
  const [showNext, setShowNext] = useState(false);
  const [wrongShake, setWrongShake] = useState(false);

  const handleChoiceTap = useCallback(
    (idx) => {
      if (showNext) return;
      setPlaced((prev) => (prev?.choiceIdx === idx ? null : { choiceIdx: idx }));
    },
    [showNext]
  );

  const handleBoxTap = useCallback(() => {
    if (showNext) return;
    setPlaced(null);
  }, [showNext]);

  const handleSubmit = useCallback(() => {
    if (!placed || showNext) return;
    // Correctness logic will be added later
    setShowNext(true);
  }, [placed, showNext]);

  const handleNext = useCallback(() => {
    setRound(buildRound());
    setPlaced(null);
    setShowNext(false);
    setWrongShake(false);
  }, []);

  const { situation, letter, choices } = round;
  const placedChoice = placed !== null ? choices[placed.choiceIdx] : null;

  // Situation 1: empty letter box, sound box filled with speaker, 3 letters below
  // Situation 2: letter box filled, empty sound box, 3 speaker icons below

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: "Fredoka, sans-serif",
        background:
          "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Back arrow */}
      <div style={{ padding: "12px 16px 0", flexShrink: 0 }}>
        <BackArrow onPress={onBack} />
      </div>

      {/* Content area — vertically centered */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 28px",
          gap: 24,
        }}
      >
        {/* Row 1: letter is */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#1E3A5F",
              minWidth: 130,
              flexShrink: 0,
            }}
          >
            letter is
          </span>

          {/* Letter box */}
          <AnimatePresence mode="wait">
            {situation === 1 ? (
              /* Situation 1: empty target box for letters */
              <motion.div
                key="letter-target"
                onClick={placedChoice && situation === 1 ? handleBoxTap : undefined}
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: 24,
                  background: placedChoice && situation === 1 ? "white" : "rgba(78,205,196,0.08)",
                  border: `3px dashed ${placedChoice && situation === 1 ? "#4ECDC4" : "rgba(78,205,196,0.45)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: placedChoice && situation === 1 ? "pointer" : "default",
                  transition: "all 0.2s",
                  boxShadow: placedChoice && situation === 1
                    ? "0 6px 24px rgba(78,205,196,0.2)"
                    : "none",
                }}
              >
                {placedChoice && situation === 1 && (
                  <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{
                      fontSize: 62,
                      fontWeight: 700,
                      color: "#1E3A5F",
                      fontFamily: "Fredoka, sans-serif",
                      lineHeight: 1,
                    }}
                  >
                    {placedChoice}
                  </motion.span>
                )}
              </motion.div>
            ) : (
              /* Situation 2: filled letter box */
              <motion.div
                key="letter-filled"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: 24,
                  background: "white",
                  border: "3px solid rgba(78,205,196,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 6px 24px rgba(78,205,196,0.15)",
                }}
              >
                <span
                  style={{
                    fontSize: 62,
                    fontWeight: 700,
                    color: "#1E3A5F",
                    fontFamily: "Fredoka, sans-serif",
                    lineHeight: 1,
                  }}
                >
                  {letter}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Row 2: sound is */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#1E3A5F",
              minWidth: 130,
              flexShrink: 0,
            }}
          >
            sound is
          </span>

          {/* Sound box */}
          <AnimatePresence mode="wait">
            {situation === 2 ? (
              /* Situation 2: empty target box for speaker */
              <motion.div
                key="sound-target"
                onClick={placedChoice && situation === 2 ? handleBoxTap : undefined}
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: 24,
                  background: placedChoice && situation === 2 ? "white" : "rgba(77,150,255,0.08)",
                  border: `3px dashed ${placedChoice && situation === 2 ? "#4D96FF" : "rgba(77,150,255,0.45)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: placedChoice && situation === 2 ? "pointer" : "default",
                  transition: "all 0.2s",
                  boxShadow: placedChoice && situation === 2
                    ? "0 6px 24px rgba(77,150,255,0.2)"
                    : "none",
                }}
              >
                {placedChoice && situation === 2 && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <SpeakerIcon
                      color={CHOICE_COLORS[placed.choiceIdx % CHOICE_COLORS.length].main}
                      size={52}
                    />
                  </motion.div>
                )}
              </motion.div>
            ) : (
              /* Situation 1: filled sound box with speaker */
              <motion.div
                key="sound-filled"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: 24,
                  background: "white",
                  border: "3px solid rgba(77,150,255,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 6px 24px rgba(77,150,255,0.15)",
                }}
              >
                <SpeakerIcon color="#4D96FF" size={52} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Row 3: choices */}
        <motion.div
          animate={wrongShake ? { x: [0, -10, 10, -8, 8, 0] } : { x: 0 }}
          transition={{ duration: 0.45 }}
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 18,
            marginTop: 8,
          }}
        >
          {choices.map((choice, idx) => {
            const colorSet = CHOICE_COLORS[idx % CHOICE_COLORS.length];
            const isPlaced = placed?.choiceIdx === idx;

            return (
              <motion.button
                key={`${round.letter}-${idx}`}
                onClick={() => handleChoiceTap(idx)}
                whileTap={{ scale: 0.91 }}
                animate={isPlaced ? { opacity: 0.3, scale: 0.88 } : { opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 24,
                  background: colorSet.main,
                  border: `3px solid ${colorSet.main}`,
                  boxShadow: `0 6px 20px ${colorSet.shadow}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: isPlaced ? "default" : "pointer",
                  WebkitTapHighlightColor: "transparent",
                  flexShrink: 0,
                }}
              >
                {situation === 1 ? (
                  <span
                    style={{
                      fontSize: 52,
                      fontWeight: 700,
                      color: "white",
                      fontFamily: "Fredoka, sans-serif",
                      lineHeight: 1,
                    }}
                  >
                    {choice}
                  </span>
                ) : (
                  <SpeakerIcon color="white" size={48} />
                )}
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
          whileTap={placed && !showNext ? { scale: 0.95 } : {}}
          style={{
            background:
              placed && !showNext
                ? "linear-gradient(135deg, #4ECDC4, #44A08D)"
                : "#D1D5DB",
            color: placed && !showNext ? "white" : "#9CA3AF",
            border: "none",
            borderRadius: 999,
            padding: "16px 56px",
            fontSize: 22,
            fontWeight: 700,
            cursor: placed && !showNext ? "pointer" : "not-allowed",
            fontFamily: "Fredoka, sans-serif",
            boxShadow:
              placed && !showNext
                ? "0 8px 28px rgba(78,205,196,0.4)"
                : "none",
            transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          submit ✓
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
              next →
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}