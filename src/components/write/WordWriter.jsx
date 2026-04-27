/**
 * WordWriter
 * ==========
 * Presents a complete word writing experience:
 *   - Letter-by-letter sequential guided writing
 *   - Shows the full word with current letter highlighted
 *   - Plays letter sound on successful stroke completion (optional)
 *   - Shows word-complete celebration when all letters done
 *
 * This component manages the WRITING ROW (bottom half of the Write game).
 */
import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LetterCanvas from "./LetterCanvas";
import { LETTER_DEFS } from "../../lib/letterPaths";
import { playAudio } from "../../lib/useAudio";

// Colors for each letter slot
const LETTER_COLORS = ["#4D96FF", "#FF6B6B", "#6BCB77", "#FFD93D", "#C77DFF"];

function LetterSlotIndicator({ letter, index, status, isActive }) {
  // status: "waiting" | "active" | "done"
  const color = LETTER_COLORS[index % LETTER_COLORS.length];
  return (
    <motion.div
      animate={{
        scale: isActive ? 1.1 : 1,
        opacity: status === "waiting" ? 0.4 : 1,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: status === "done" ? `${color}22` : isActive ? `${color}18` : "transparent",
        border: `2.5px solid ${status === "done" ? color : isActive ? color : "#CBD5E1"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        flexShrink: 0,
      }}
    >
      <span style={{
        fontSize: 22,
        fontWeight: 700,
        color: status === "done" ? color : isActive ? color : "#94A3B8",
        fontFamily: "Fredoka, sans-serif",
        lineHeight: 1,
      }}>
        {letter}
      </span>
      {status === "done" && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            position: "absolute",
            top: -6,
            right: -6,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "white", fontSize: 9, fontWeight: 800 }}>✓</span>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function WordWriter({ wordData, onWordComplete }) {
  const { word, audio } = wordData;
  const letters = word.split("").filter((l) => LETTER_DEFS[l]);
  const containerRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState(200);
  
  const [currentLetterIdx, setCurrentLetterIdx] = useState(0);
  const [completedLetters, setCompletedLetters] = useState([]);
  const [wordDone, setWordDone] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0); // force re-mount on next letter

  // Measure available width for canvas sizing (mobile-responsive)
  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        setCanvasSize(Math.min(220, Math.max(140, Math.floor(w * 0.68))));
      } else {
        setCanvasSize(Math.min(220, Math.floor(window.innerWidth * 0.62)));
      }
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const handleLetterComplete = useCallback(() => {
    const newCompleted = [...completedLetters, currentLetterIdx];
    setCompletedLetters(newCompleted);

    if (newCompleted.length >= letters.length) {
      // Word complete!
      setWordDone(true);
      // Play the full word audio
      if (audio) {
        setTimeout(() => playAudio(audio), 300);
      }
      setTimeout(() => {
        onWordComplete && onWordComplete();
      }, 2200);
    } else {
      // Move to next letter
      setTimeout(() => {
        setCurrentLetterIdx(currentLetterIdx + 1);
        setCanvasKey((k) => k + 1);
      }, 400);
    }
  }, [completedLetters, currentLetterIdx, letters.length, audio, onWordComplete]);

  const currentLetter = letters[currentLetterIdx];
  const color = LETTER_COLORS[currentLetterIdx % LETTER_COLORS.length];

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "12px 16px 20px",
        gap: 12,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Letter progress indicators */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {letters.map((letter, i) => (
          <LetterSlotIndicator
            key={i}
            letter={letter}
            index={i}
            status={
              completedLetters.includes(i) ? "done" :
              i === currentLetterIdx ? "active" : "waiting"
            }
            isActive={i === currentLetterIdx && !wordDone}
          />
        ))}
      </div>

      {/* Current letter label */}
      {!wordDone && (
        <motion.div
          key={`label-${currentLetterIdx}`}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#64748B",
            fontFamily: "Fredoka, sans-serif",
          }}
        >
          Write the letter <span style={{ color, fontWeight: 700, fontSize: 15 }}>"{currentLetter}"</span>
        </motion.div>
      )}

      {/* Writing canvas — the core interaction */}
      <AnimatePresence mode="wait">
        {!wordDone ? (
          <motion.div
            key={`canvas-${currentLetterIdx}-${canvasKey}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            ref={containerRef}
          style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              position: "relative",
              paddingBottom: 32,
            }}
          >
            {/* Writing area card */}
            <div
              style={{
                background: "rgba(255,255,255,0.90)",
                borderRadius: 28,
                padding: "20px 24px",
                boxShadow: `0 8px 32px rgba(74,144,196,0.12), 0 0 0 2.5px ${color}44`,
                border: `2px solid ${color}33`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                minWidth: 220,
                maxWidth: 320,
                width: "85vw",
              }}
            >
              {/* "Trace here" label */}
              <div style={{
                fontSize: 11,
                color: "#94A3B8",
                fontFamily: "Fredoka, sans-serif",
                letterSpacing: 1,
                textTransform: "uppercase",
                fontWeight: 600,
              }}>
                ✏️ Trace here
              </div>

              <LetterCanvas
                key={`lc-${currentLetterIdx}-${canvasKey}`}
                letter={currentLetter}
                onLetterComplete={handleLetterComplete}
                isActive={!wordDone}
                showGhost={true}
                size={canvasSize}
              />
            </div>
          </motion.div>
        ) : (
          /* Word-complete celebration */
          <motion.div
            key="word-done"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
            }}
          >
            <motion.div
              animate={{ rotate: [0, -8, 8, -4, 4, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6 }}
              style={{ fontSize: 64 }}
            >
              ⭐
            </motion.div>
            <div style={{
              fontSize: 36,
              fontWeight: 700,
              color: "#4ECDC4",
              fontFamily: "Fredoka, sans-serif",
              letterSpacing: 3,
            }}>
              {word}
            </div>
            <div style={{
              fontSize: 20,
              color: "#64748B",
              fontFamily: "Fredoka, sans-serif",
            }}>
              Amazing writing! 🎉
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}