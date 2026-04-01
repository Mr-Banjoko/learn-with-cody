import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Volume2 } from "lucide-react";
import { playAudio } from "../../lib/useAudio";

// Pick 1 correct + 3 random distractors from the word pool
function buildRound(words, excludeUsed) {
  // Filter to words with images (avoid blanks)
  const pool = words.filter((w) => w.image);
  // Pick a target we haven't shown yet if possible
  const remaining = pool.filter((w) => !excludeUsed.has(w.word));
  const candidates = remaining.length > 0 ? remaining : pool;
  const targetIdx = Math.floor(Math.random() * candidates.length);
  const target = candidates[targetIdx];

  // Pick 3 distractors (different word)
  const others = pool.filter((w) => w.word !== target.word);
  const shuffled = [...others].sort(() => Math.random() - 0.5);
  const distractors = shuffled.slice(0, 3);

  // Merge + shuffle choices
  const choices = [...distractors, target].sort(() => Math.random() - 0.5);
  return { target, choices };
}

export default function WordMatchGame({ words, title, color, onBack }) {
  const usedRef = useRef(new Set());
  const [round, setRound] = useState(() => buildRound(words, usedRef.current));
  const [selected, setSelected] = useState(null); // word string
  const [feedback, setFeedback] = useState(null); // "correct" | "wrong"
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const autoPlayedRef = useRef(null);

  // Auto-play word audio when a new round starts
  useEffect(() => {
    if (autoPlayedRef.current === round.target.word) return;
    autoPlayedRef.current = round.target.word;
    const timer = setTimeout(() => {
      if (round.target.audio) playAudio(round.target.audio);
    }, 400);
    return () => clearTimeout(timer);
  }, [round]);

  const handleChoice = useCallback((choice) => {
    if (feedback) return; // block during feedback
    setSelected(choice.word);
    const correct = choice.word === round.target.word;
    setFeedback(correct ? "correct" : "wrong");
    setTotal((t) => t + 1);
    if (correct) {
      setScore((s) => s + 1);
      playAudio(round.target.audio);
    }
    // Advance after delay
    setTimeout(() => {
      setFeedback(null);
      setSelected(null);
      if (correct) {
        usedRef.current.add(round.target.word);
      }
      setRound(buildRound(words, usedRef.current));
    }, correct ? 1400 : 900);
  }, [feedback, round, words]);

  const playTarget = () => {
    if (round.target.audio) playAudio(round.target.audio);
  };

  return (
    <div className="min-h-full pb-32" style={{ background: "#D6EEFF", fontFamily: "Fredoka, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#A8D0E6", borderBottomLeftRadius: 28, borderBottomRightRadius: 28, padding: "16px 20px 22px", display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={onBack}
          style={{ width: 40, height: 40, borderRadius: 20, background: "rgba(255,255,255,0.7)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
        >
          <ArrowLeft size={22} color="#1E3A5F" />
        </button>
        <h1 style={{ flex: 1, fontSize: 22, fontWeight: 700, color: "#1E3A5F" }}>Word Match · {title}</h1>
        {/* Score */}
        <div style={{ background: "white", borderRadius: 14, padding: "4px 14px", fontSize: 16, fontWeight: 700, color: color }}>
          ⭐ {score}
        </div>
      </div>

      {/* Picture card */}
      <div className="px-5 pt-6 flex flex-col items-center gap-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={round.target.word}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.88 }}
            transition={{ type: "spring", stiffness: 280, damping: 20 }}
            style={{
              width: "100%", maxWidth: 280,
              background: "white", borderRadius: 28,
              padding: 12,
              boxShadow: "0 12px 48px rgba(30,58,95,0.14)",
              border: `3px solid ${color}44`,
            }}
          >
            <img
              src={round.target.image}
              alt=""
              style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 18, display: "block" }}
            />
            {/* Audio replay button below image */}
            <button
              onClick={playTarget}
              style={{
                marginTop: 12, width: "100%", padding: "10px 0",
                borderRadius: 16, background: color + "18",
                border: `2px solid ${color}44`,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                cursor: "pointer", fontSize: 17, fontWeight: 700, color: "#1E3A5F",
                fontFamily: "Fredoka, sans-serif",
              }}
            >
              <Volume2 size={20} color={color} />
              Hear the word
            </button>
          </motion.div>
        </AnimatePresence>

        {/* Instruction */}
        <p style={{ fontSize: 17, fontWeight: 600, color: "#3A6080", textAlign: "center" }}>
          Which word matches the picture?
        </p>

        {/* Choice buttons — 2×2 grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%", maxWidth: 340 }}>
          {round.choices.map((choice) => {
            const isSelected = selected === choice.word;
            const isCorrect = choice.word === round.target.word;

            let bg = "white";
            let border = "2px solid #A8D0E6";
            let textColor = "#1E3A5F";
            let shadow = "0 4px 12px rgba(30,58,95,0.10)";

            if (isSelected && feedback === "correct") {
              bg = "#E8FFF6"; border = "3px solid #4ECDC4"; textColor = "#1E3A5F";
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
                  padding: "18px 10px", borderRadius: 20,
                  background: bg, border, color: textColor,
                  fontSize: 26, fontWeight: 700,
                  fontFamily: "Fredoka, sans-serif",
                  cursor: feedback ? "default" : "pointer",
                  boxShadow: shadow,
                  transition: "background 0.2s, border 0.2s",
                  letterSpacing: 1,
                }}
              >
                {choice.word}
                {isSelected && feedback === "correct" && " ⭐"}
                {isSelected && feedback === "wrong" && " ❌"}
              </motion.button>
            );
          })}
        </div>

        {/* Correct big celebration */}
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