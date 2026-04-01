import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Volume2 } from "lucide-react";
import { playAudio } from "../../lib/useAudio";

// Pick 1 correct + 3 random distractors from the word pool
function buildRound(words, excludeUsed, brokenImages) {
  // Filter to words with images AND not in the broken-image set
  const pool = words.filter((w) => w.image && !brokenImages.has(w.image));
  if (pool.length < 2) return null;

  const remaining = pool.filter((w) => !excludeUsed.has(w.word));
  const candidates = remaining.length > 0 ? remaining : pool;
  const target = candidates[Math.floor(Math.random() * candidates.length)];

  const others = pool.filter((w) => w.word !== target.word);
  const distractors = [...others].sort(() => Math.random() - 0.5).slice(0, 3);
  const choices = [...distractors, target].sort(() => Math.random() - 0.5);

  return { target, choices };
}

export default function WordMatchGame({ words, title, color, onBack }) {
  const usedRef = useRef(new Set());
  const brokenRef = useRef(new Set());
  const [round, setRound] = useState(() => buildRound(words, usedRef.current, brokenRef.current));
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const autoPlayedRef = useRef(null);

  const nextRound = useCallback(() => {
    const r = buildRound(words, usedRef.current, brokenRef.current);
    if (r) setRound(r);
  }, [words]);

  // Auto-play word audio when a new round starts
  useEffect(() => {
    if (!round || autoPlayedRef.current === round.target.word) return;
    autoPlayedRef.current = round.target.word;
    const timer = setTimeout(() => {
      if (round.target.audio) playAudio(round.target.audio);
    }, 400);
    return () => clearTimeout(timer);
  }, [round]);

  const handleChoice = useCallback((choice) => {
    if (feedback || !round) return;
    setSelected(choice.word);
    const correct = choice.word === round.target.word;
    setFeedback(correct ? "correct" : "wrong");
    if (correct) {
      setScore((s) => s + 1);
      playAudio(round.target.audio);
    }
    setTimeout(() => {
      setFeedback(null);
      setSelected(null);
      if (correct) usedRef.current.add(round.target.word);
      nextRound();
    }, correct ? 1400 : 900);
  }, [feedback, round, nextRound]);

  const playTarget = () => {
    if (round?.target.audio) playAudio(round.target.audio);
  };

  // Handle broken image — exclude it and move on
  const handleImageError = useCallback(() => {
    if (!round) return;
    brokenRef.current.add(round.target.image);
    nextRound();
  }, [round, nextRound]);

  if (!round) {
    return (
      <div style={{ background: "#D6EEFF", minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Fredoka, sans-serif" }}>
        <p style={{ color: "#1E3A5F", fontSize: 20, fontWeight: 600 }}>No images available right now.</p>
      </div>
    );
  }

  return (
    <div style={{ background: "#D6EEFF", minHeight: "100%", fontFamily: "Fredoka, sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: "#A8D0E6", borderBottomLeftRadius: 28, borderBottomRightRadius: 28, padding: "16px 20px 22px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <button
          onClick={onBack}
          style={{ width: 40, height: 40, borderRadius: 20, background: "rgba(255,255,255,0.7)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
        >
          <ArrowLeft size={22} color="#1E3A5F" />
        </button>
        <h1 style={{ flex: 1, fontSize: 20, fontWeight: 700, color: "#1E3A5F", margin: 0 }}>Word Match · {title}</h1>
        <div style={{ background: "white", borderRadius: 14, padding: "4px 14px", fontSize: 16, fontWeight: 700, color: color, flexShrink: 0 }}>
          ⭐ {score}
        </div>
      </div>

      {/* Game area — scrollable, centered, fully responsive */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 120px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        {/* Picture card — max 300px, but scales down on small phones */}
        <AnimatePresence mode="wait">
          <motion.div
            key={round.target.word}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.88 }}
            transition={{ type: "spring", stiffness: 280, damping: 20 }}
            style={{
              width: "min(300px, calc(100vw - 48px))",
              background: "white",
              borderRadius: 28,
              padding: 12,
              boxShadow: "0 12px 48px rgba(30,58,95,0.14)",
              border: `3px solid ${color}44`,
            }}
          >
            <img
              src={round.target.image}
              alt=""
              onError={handleImageError}
              style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 18, display: "block" }}
            />
            <button
              onClick={playTarget}
              style={{
                marginTop: 10, width: "100%", padding: "10px 0",
                borderRadius: 16, background: color + "18",
                border: `2px solid ${color}44`,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                cursor: "pointer", fontSize: 16, fontWeight: 700, color: "#1E3A5F",
                fontFamily: "Fredoka, sans-serif",
              }}
            >
              <Volume2 size={20} color={color} />
              Hear the word
            </button>
          </motion.div>
        </AnimatePresence>

        <p style={{ fontSize: 17, fontWeight: 600, color: "#3A6080", textAlign: "center", margin: 0 }}>
          Which word matches the picture?
        </p>

        {/* 2×2 choice grid — constrained to viewport */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          width: "100%",
          maxWidth: "min(340px, calc(100vw - 32px))",
        }}>
          {round.choices.map((choice) => {
            const isSelected = selected === choice.word;
            const isCorrect = choice.word === round.target.word;

            let bg = "white";
            let border = "2px solid #A8D0E6";
            let textColor = "#1E3A5F";
            let shadow = "0 4px 12px rgba(30,58,95,0.10)";

            if (isSelected && feedback === "correct") {
              bg = "#E8FFF6"; border = "3px solid #4ECDC4";
              shadow = "0 6px 24px rgba(78,205,196,0.35)";
            } else if (isSelected && feedback === "wrong") {
              bg = "#FFF0F0"; border = "3px solid #FF6B6B"; textColor = "#FF6B6B";
            } else if (!isSelected && feedback === "correct" && isCorrect) {
              bg = "#E8FFF6"; border = "3px solid #4ECDC4";
            }

            return (
              <motion.button
                key={choice.word}
                whileTap={!feedback ? { scale: 0.93 } : {}}
                animate={isSelected && feedback === "wrong" ? { x: [0, -8, 8, -6, 6, 0] } : {}}
                transition={{ duration: 0.4 }}
                onClick={() => handleChoice(choice)}
                style={{
                  padding: "16px 8px",
                  borderRadius: 20,
                  background: bg, border, color: textColor,
                  fontSize: 24, fontWeight: 700,
                  fontFamily: "Fredoka, sans-serif",
                  cursor: feedback ? "default" : "pointer",
                  boxShadow: shadow,
                  transition: "background 0.2s, border 0.2s",
                  letterSpacing: 1,
                  minHeight: 64,
                  touchAction: "manipulation",
                }}
              >
                {choice.word}
                {isSelected && feedback === "correct" && " ⭐"}
                {isSelected && feedback === "wrong" && " ❌"}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {feedback === "correct" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              style={{ fontSize: 52, marginTop: 4 }}
            >
              🎉
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}