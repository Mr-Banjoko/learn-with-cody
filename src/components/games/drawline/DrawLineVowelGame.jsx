/**
 * DrawLineVowelGame — orchestrates rounds for one vowel group.
 * Shows progress bar, handles round transitions, completion.
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackArrow from "../../BackArrow";
import DrawLineBoard from "./DrawLineBoard";
import { generateRounds } from "./drawLineData";

const ROUNDS_PER_SESSION = 5;

export default function DrawLineVowelGame({ group, onBack, lang = "en" }) {
  const [rounds] = useState(() => generateRounds(group.wordPool, ROUNDS_PER_SESSION));
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [direction, setDirection] = useState(1);

  const handleRoundComplete = useCallback(() => {
    const next = roundIndex + 1;
    if (next >= rounds.length) {
      setDone(true);
    } else {
      setDirection(1);
      setRoundIndex(next);
    }
  }, [roundIndex, rounds.length]);

  const progressPct = done ? 100 : (roundIndex / rounds.length) * 100;

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
        <span style={{ fontSize: 22 }}>{group.emoji}</span>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1E3A5F", flex: 1 }}>
          {group.label}
        </h2>
        <span style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>
          {done ? rounds.length : roundIndex + 1} / {rounds.length}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
        <motion.div
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.4 }}
          style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg, ${group.color}, #4D96FF)` }}
        />
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
              padding: 32,
            }}
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -8, 8, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8 }}
              style={{ fontSize: 72 }}
            >
              🎉
            </motion.div>
            <h2 style={{ fontSize: 30, fontWeight: 700, color: "#1E3A5F", margin: 0, textAlign: "center" }}>
              {lang === "zh" ? "太棒了！" : "Amazing job!"}
            </h2>
            <p style={{ fontSize: 18, color: "#64748B", textAlign: "center", margin: 0 }}>
              {lang === "zh" ? `你完成了全部 ${rounds.length} 轮！` : `You completed all ${rounds.length} rounds!`}
            </p>
            <button
              onClick={onBack}
              style={{
                marginTop: 12,
                padding: "14px 40px",
                borderRadius: 999,
                background: group.color,
                color: "white",
                border: "none",
                fontSize: 20,
                fontWeight: 700,
                fontFamily: "Fredoka, sans-serif",
                cursor: "pointer",
                boxShadow: "0 4px 0 rgba(0,0,0,0.15)",
              }}
            >
              {lang === "zh" ? "返回 ←" : "Back ←"}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={`round-${roundIndex}`}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.22 }}
            style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            <DrawLineBoard
              round={rounds[roundIndex]}
              onRoundComplete={handleRoundComplete}
              lang={lang}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}