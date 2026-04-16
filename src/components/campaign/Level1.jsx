/**
 * Level 1 — 10-round fixed sequence:
 * For each of 5 words: Learn Phonics → Drag the Letters
 * Ends with a celebration screen.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackArrow from "../BackArrow";
import Level1Phonics from "./Level1Phonics";
import Level1Drag from "./Level1Drag";
import Level1Complete from "./Level1Complete";
import { shortAWords } from "../../lib/shortAWords";

// Fixed word set: exactly cat, dad, rat, hat, bat (first 5 in order)
const WORDS = shortAWords.slice(0, 5);
const TOTAL_ROUNDS = WORDS.length * 2; // 10

// Build the flat round sequence
function buildRounds() {
  const rounds = [];
  WORDS.forEach((card) => {
    rounds.push({ type: "phonics", card });
    rounds.push({ type: "drag",    card });
  });
  return rounds;
}

const ROUNDS = buildRounds();

function markLevel1Complete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][1] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function Level1({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [direction, setDirection] = useState(1);

  const advance = () => {
    setDirection(1);
    if (roundIndex + 1 >= TOTAL_ROUNDS) {
      markLevel1Complete();
      setDone(true);
    } else {
      setRoundIndex((i) => i + 1);
    }
  };

  const round = ROUNDS[roundIndex];

  // Progress: how many rounds completed out of TOTAL_ROUNDS
  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;

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
          gap: 4,
          padding: "calc(env(safe-area-inset-top, 0px) + 8px) 16px 8px",
          borderBottom: "1.5px solid rgba(0,0,0,0.06)",
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(10px)",
        }}
      >
        <BackArrow onPress={onBack} />

        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1E293B" }}>
            {lang === "zh" ? "第 1 关" : "Level 1"}
          </p>
        </div>


      </div>

      {/* Progress bar */}
      {!done && (
        <div style={{ height: 6, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
          <motion.div
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4 }}
            style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #4ECDC4, #4D96FF)" }}
          />
        </div>
      )}

      {/* Content — animated transitions between rounds */}
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            <Level1Complete onBack={onBack} lang={lang} />
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
            {round.type === "phonics" ? (
              <Level1Phonics card={round.card} onNext={advance} lang={lang} />
            ) : (
              <Level1Drag card={round.card} onComplete={advance} lang={lang} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}