/**
 * Level 2 — 5-round campaign:
 * Rearrange the Pictures (easy mode) for each of the 5 Short-a words:
 * cat → dad → rat → hat → bat
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackArrow from "../BackArrow";
import Level2Complete from "./Level2Complete";
import PicSliceBoardEasy from "../games/PicSliceBoardEasy";
import { buildWordData } from "../../lib/picSliceGameData";
import { shortAWords } from "../../lib/shortAWords";

// Fixed word order — do NOT randomize
const WORD_NAMES = ["cat", "dad", "rat", "hat", "bat"];
const WORDS = WORD_NAMES.map((name) => shortAWords.find((w) => w.word === name) || { word: name, image: "", audio: "" });
const TOTAL_ROUNDS = WORDS.length; // 5

function markLevel2Complete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][2] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function Level2({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);

  // Build wordPair for PicSliceBoardEasy — it expects an array (easy uses index 0 only)
  const wordPair = useMemo(() => {
    const word = WORDS[roundIndex];
    return [buildWordData(word.word)];
  }, [roundIndex]);

  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;

  const handleRoundComplete = () => {
    const next = roundIndex + 1;
    if (next >= TOTAL_ROUNDS) {
      markLevel2Complete();
      setDone(true);
    } else {
      setRoundIndex(next);
    }
  };

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
            {lang === "zh" ? "第 2 关" : "Level 2"}
          </p>
          
        </div>
      </div>

      {/* Progress bar */}
      {!done && (
        <div style={{ height: 6, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
          <motion.div
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4 }}
            style={{
              height: "100%",
              borderRadius: 99,
              background: "linear-gradient(90deg, #4ECDC4, #4D96FF)",
            }}
          />
        </div>
      )}

      {/* Content */}
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
            <Level2Complete onBack={onBack} lang={lang} />
          </motion.div>
        ) : (
          <motion.div
            key={`round-${roundIndex}`}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.22 }}
            style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            <PicSliceBoardEasy
              key={`round-${roundIndex}`}
              wordPair={wordPair}
              onRoundComplete={handleRoundComplete}
              lang={lang}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}