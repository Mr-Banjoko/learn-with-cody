/**
 * Level 13 — 4-round Draw a Line Game
 *
 * Fixed round order:
 *  Round 1: sad, can, map
 *  Round 2: sat, ham, pan
 *  Round 3: pat, ham, dad
 *  Round 4: mad, jam, dad
 *
 * Each round uses the first letter of each word as the target letter.
 * Letters are guaranteed to be unambiguous for the chosen word sets.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackArrow from "../BackArrow";
import DrawLineBoard from "../games/drawline/DrawLineBoard";
import Level13Complete from "./Level13Complete";
import { shortAWords } from "../../lib/shortAWords";

const findWord = (w) => shortAWords.find((x) => x.word === w);

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build a fixed Draw-a-Line round from 3 word strings.
 * Uses first letter of each word as the target letter.
 * bottomLetters are shuffled so they don't align with top cards.
 */
function buildFixedRound(wordNames) {
  const words = wordNames.map(findWord);
  const topCards = words.map((w, i) => ({
    ...w,
    targetLetter: w.word[0],
    id: `card-${i}-${w.word}`,
  }));

  const letters = topCards.map((c) => ({ letter: c.targetLetter, topCardId: c.id }));
  let shuffledLetters = shuffle(letters);
  let tries = 0;
  while (tries < 20 && shuffledLetters.some((l, i) => l.topCardId === topCards[i].id)) {
    shuffledLetters = shuffle(letters);
    tries++;
  }

  return { topCards, bottomLetters: shuffledLetters };
}

// Pre-build all 4 fixed rounds
function buildAllRounds() {
  return [
    buildFixedRound(["sad", "can", "map"]),
    buildFixedRound(["sat", "ham", "pan"]),
    buildFixedRound(["pat", "ham", "dad"]),
    buildFixedRound(["mad", "jam", "dad"]),
  ];
}

const TOTAL_ROUNDS = 4;

function markLevel13Complete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][13] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function Level13({ onBack, lang = "en" }) {
  const [rounds] = useState(() => buildAllRounds());
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);

  const advance = () => {
    const next = roundIndex + 1;
    if (next >= TOTAL_ROUNDS) {
      markLevel13Complete();
      setDone(true);
    } else {
      setRoundIndex(next);
    }
  };

  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4, padding: "calc(env(safe-area-inset-top, 0px) + 8px) 16px 8px", borderBottom: "1.5px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.75)", backdropFilter: "blur(10px)" }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1E293B" }}>
            {lang === "zh" ? "第 13 关" : "Level 13"}
          </p>
        </div>
        <span style={{ fontSize: 13, color: "#64748B", fontWeight: 600, marginRight: 4 }}>
          {roundIndex + 1}/{TOTAL_ROUNDS}
        </span>
      </div>

      {/* Progress bar */}
      {!done && (
        <div style={{ height: 6, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
          <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #4ECDC4, #4D96FF)" }} />
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <Level13Complete onBack={onBack} lang={lang} />
          </motion.div>
        ) : (
          <motion.div key={`round-${roundIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <DrawLineBoard
              key={`drawline-${roundIndex}`}
              round={rounds[roundIndex]}
              onRoundComplete={advance}
              lang={lang}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}