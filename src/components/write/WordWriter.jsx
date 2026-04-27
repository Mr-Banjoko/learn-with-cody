/**
 * WordWriter — side-by-side letter boxes layout
 * ===============================================
 * Shows one big writing box per letter of the word, arranged side by side.
 * No letters are shown — only the writing boxes.
 * The ghost guide is hidden until the child fails 3 times on that letter.
 */
import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LetterCanvas from "./LetterCanvas";
import { LETTER_DEFS } from "../../lib/letterPaths";
import { playAudio } from "../../lib/useAudio";

const BOX_COLORS = ["#4D96FF", "#FF6B6B", "#6BCB77", "#FFD93D", "#C77DFF"];

export default function WordWriter({ wordData, onWordComplete }) {
  const { word, audio } = wordData;
  const letters = word.split("").filter((l) => LETTER_DEFS[l]);

  const containerRef = useRef(null);
  const [boxSize, setBoxSize] = useState(100);

  // Track which letter is currently active
  const [currentLetterIdx, setCurrentLetterIdx] = useState(0);
  // Track completed letters
  const [completedLetters, setCompletedLetters] = useState([]);
  // Track fail count per letter index
  const [failCounts, setFailCounts] = useState({});
  // Word done
  const [wordDone, setWordDone] = useState(false);
  // Key per letter to force LetterCanvas remount when advancing
  const [canvasKeys, setCanvasKeys] = useState(() => letters.reduce((acc, _, i) => ({ ...acc, [i]: 0 }), {}));

  // Measure container to calculate box size
  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        const numLetters = letters.length;
        const gap = 12;
        const totalGap = gap * (numLetters - 1);
        const available = w - 24 - totalGap; // 24 = horizontal padding
        const size = Math.min(160, Math.max(80, Math.floor(available / numLetters)));
        setBoxSize(size);
      }
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [letters.length]);

  const handleLetterComplete = useCallback((letterIdx) => {
    const newCompleted = [...completedLetters, letterIdx];
    setCompletedLetters(newCompleted);

    if (newCompleted.length >= letters.length) {
      setWordDone(true);
      if (audio) setTimeout(() => playAudio(audio), 300);
      setTimeout(() => onWordComplete && onWordComplete(), 2200);
    } else {
      // Advance to next incomplete letter
      const nextIdx = letters.findIndex((_, i) => !newCompleted.includes(i));
      if (nextIdx !== -1) setCurrentLetterIdx(nextIdx);
    }
  }, [completedLetters, letters, audio, onWordComplete]);

  const handleLetterFail = useCallback((letterIdx) => {
    setFailCounts((prev) => ({
      ...prev,
      [letterIdx]: (prev[letterIdx] || 0) + 1,
    }));
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px 12px 24px",
        gap: 16,
        overflow: "hidden",
      }}
    >
      {/* Side-by-side letter boxes */}
      {!wordDone ? (
        <div style={{
          display: "flex",
          flexDirection: "row",
          gap: 12,
          alignItems: "flex-start",
          justifyContent: "center",
          width: "100%",
        }}>
          {letters.map((letter, i) => {
            const isActive = i === currentLetterIdx;
            const isDone = completedLetters.includes(i);
            const fails = failCounts[i] || 0;
            const showGuide = fails >= 3; // only show ghost after 3 fails
            const color = BOX_COLORS[i % BOX_COLORS.length];

            return (
              <motion.div
                key={i}
                animate={{
                  scale: isActive ? 1 : isDone ? 0.97 : 0.93,
                  opacity: isDone ? 0.65 : isActive ? 1 : 0.45,
                }}
                transition={{ type: "spring", stiffness: 280, damping: 22 }}
                style={{
                  background: isDone ? `${color}18` : isActive ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.55)",
                  borderRadius: 20,
                  border: `3px solid ${isDone ? color : isActive ? color : "#CBD5E1"}`,
                  boxShadow: isActive
                    ? `0 8px 32px ${color}35, 0 0 0 2px ${color}22`
                    : isDone
                    ? `0 4px 16px ${color}20`
                    : "none",
                  width: boxSize,
                  height: Math.round(boxSize * 1.25),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {isDone ? (
                  // Completed — show checkmark
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 350, damping: 18 }}
                    style={{
                      width: "60%",
                      height: "60%",
                      borderRadius: "50%",
                      background: color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ color: "white", fontSize: Math.round(boxSize * 0.28), fontWeight: 800 }}>✓</span>
                  </motion.div>
                ) : isActive ? (
                  // Active — show the writing canvas
                  <LetterCanvas
                    key={`lc-${i}-${canvasKeys[i]}`}
                    letter={letter}
                    onLetterComplete={() => handleLetterComplete(i)}
                    onLetterFail={() => handleLetterFail(i)}
                    isActive={true}
                    showGhost={showGuide}
                    size={boxSize - 8}
                  />
                ) : (
                  // Waiting — empty ruled box
                  <div style={{
                    width: "80%",
                    height: "3px",
                    borderRadius: 99,
                    background: "#E2E8F0",
                    position: "absolute",
                    bottom: "28%",
                  }} />
                )}

                {/* "hint available" indicator if 2 fails */}
                {isActive && fails === 2 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      position: "absolute",
                      top: 5,
                      right: 5,
                      fontSize: 13,
                    }}
                  >
                    💡
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        // Word-complete celebration
        <motion.div
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
          <div style={{ fontSize: 20, color: "#64748B", fontFamily: "Fredoka, sans-serif" }}>
            Amazing writing! 🎉
          </div>
        </motion.div>
      )}
    </div>
  );
}