/**
 * WriteGame — Short A tracing game
 * Shows word picture + 3 traceable letters (CVC) side by side.
 * Letters must be traced left to right.
 * On word completion, next word loads automatically.
 * On batch completion, calls onComplete().
 */
import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackArrow from "../BackArrow";
import TracingLetter from "./TracingLetter";
import { shortAWords } from "../../lib/shortAWords";

const WORDS = shortAWords;

// How large to render each letter cell (scale on 60×80 base)
// We want 3 letters + gaps to fit in ~90% of screen width
// Screen ~ 390px wide → 3 letters + 2 gaps → each letter ≈ 100px → scale = 100/60 ≈ 1.65
function getScale(screenW) {
  const available = Math.min(screenW * 0.9, 380);
  const perLetter = (available - 32) / 3; // 32px for 2 gaps
  return Math.min(perLetter / 60, 1.8);
}

export default function WriteGame({ onBack, lang = "en" }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [activeLetterIdx, setActiveLetterIdx] = useState(0);
  const [wordKey, setWordKey] = useState(0);
  const [allDone, setAllDone] = useState(false);
  const screenW = typeof window !== "undefined" ? window.innerWidth : 390;
  const scale = getScale(screenW);

  const card = WORDS[wordIndex];
  const letters = card.word.split("");

  const handleLetterComplete = useCallback((letterIdx) => {
    if (letterIdx < letters.length - 1) {
      // Move to next letter
      setTimeout(() => setActiveLetterIdx(letterIdx + 1), 350);
    } else {
      // Word complete — load next
      setTimeout(() => {
        const next = wordIndex + 1;
        if (next >= WORDS.length) {
          setAllDone(true);
          onBack && onBack(); // Return to Write menu when all words done
        } else {
          setWordIndex(next);
          setActiveLetterIdx(0);
          setWordKey((k) => k + 1);
        }
      }, 700);
    }
  }, [wordIndex, letters.length, onBack]);

  const progressPct = (wordIndex / WORDS.length) * 100;
  const cellH = 80 * scale;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: "Fredoka, sans-serif",
        background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "calc(env(safe-area-inset-top, 0px) + 8px) 16px 8px",
          borderBottom: "1.5px solid rgba(0,0,0,0.06)",
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(10px)",
        }}
      >
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1E293B" }}>
            {lang === "zh" ? "描写 · Short a" : "Write · Short a"}
          </p>
        </div>
        <span style={{ fontSize: 14, color: "#94A3B8", fontWeight: 600 }}>
          {wordIndex + 1}/{WORDS.length}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 5, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
        <motion.div
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.4 }}
          style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #4ECDC4, #C77DFF)" }}
        />
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: "12px 16px 20px",
          overflowY: "auto",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={wordKey}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.3 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, width: "100%" }}
          >
            {/* Word picture */}
            <div
              style={{
                background: "white",
                borderRadius: 24,
                padding: 10,
                boxShadow: "0 8px 32px rgba(30,58,95,0.12)",
                flexShrink: 0,
              }}
            >
              <img
                src={card.image}
                alt={card.word}
                style={{
                  width: "min(220px, 52vw)",
                  height: "min(220px, 52vw)",
                  objectFit: "cover",
                  borderRadius: 16,
                  display: "block",
                }}
              />
            </div>

            {/* Word label */}
            <p style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#64748B", letterSpacing: 4 }}>
              {letters.map((l, i) => (
                <span
                  key={i}
                  style={{
                    color: i < activeLetterIdx ? "#4ECDC4" : i === activeLetterIdx ? "#1E293B" : "#CBD5E1",
                    transition: "color 0.3s",
                  }}
                >
                  {l}
                </span>
              ))}
            </p>

            {/* Tracing area — 4-line ruled background strip */}
            <div
              style={{
                background: "rgba(255,255,255,0.85)",
                borderRadius: 20,
                border: "2px solid rgba(78,205,196,0.2)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                padding: "12px 16px",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                maxWidth: 380,
              }}
            >
              {letters.map((letter, i) => (
                <div key={`${wordKey}-${i}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <TracingLetter
                    letter={letter}
                    isActive={i === activeLetterIdx}
                    onComplete={() => handleLetterComplete(i)}
                    scale={scale}
                  />
                  {/* Letter label below */}
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: i < activeLetterIdx ? "#4ECDC4" : i === activeLetterIdx ? "#4ECDC4" : "#CBD5E1",
                      transition: "color 0.3s",
                      marginTop: 2,
                    }}
                  >
                    {letter}
                  </span>
                </div>
              ))}
            </div>

            {/* Instruction prompt */}
            <p style={{ margin: 0, fontSize: 14, color: "#94A3B8", textAlign: "center", fontWeight: 500 }}>
              {lang === "zh"
                ? `描写字母 "${letters[activeLetterIdx].toUpperCase()}"  ✏️`
                : `Trace the letter "${letters[activeLetterIdx].toUpperCase()}"  ✏️`}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}