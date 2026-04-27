/**
 * Level 16 — mirrors Level 1 structure with new word set:
 * gas, jar, tag, tap, bag
 *
 * Round order:
 *  1. gas  — phonics (guided)
 *  2. jar  — phonics
 *  3. jar  — drag
 *  4. tag  — phonics
 *  5. tag  — drag
 *  6. tap  — phonics
 *  7. tap  — drag
 *  8. bag  — phonics
 *  9. bag  — drag
 * 10. gas  — phonics (unguided)
 * 11. gas  — drag  → marks level complete
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackArrow from "../BackArrow";
import Level1Phonics from "./Level1Phonics";
import Level1DragV2 from "./Level1DragV2";
import Level16Complete from "./Level16Complete";
import { shortAWords } from "../../lib/shortAWords";

const findWord = (w) => shortAWords.find((x) => x.word === w);
const gasCard = findWord("gas");
const jarCard = findWord("jar");
const tagCard = findWord("tag");
const tapCard = findWord("tap");
const bagCard = findWord("bag");

const ROUNDS = [
  { type: "phonics", card: gasCard, guided: true  }, // R1
  { type: "phonics", card: jarCard, guided: false }, // R2
  { type: "drag",    card: jarCard },                // R3
  { type: "phonics", card: tagCard, guided: false }, // R4
  { type: "drag",    card: tagCard },                // R5
  { type: "phonics", card: tapCard, guided: false }, // R6
  { type: "drag",    card: tapCard },                // R7
  { type: "phonics", card: bagCard, guided: false }, // R8
  { type: "drag",    card: bagCard },                // R9
  { type: "phonics", card: gasCard, guided: false }, // R10
  { type: "drag",    card: gasCard },                // R11 → complete
];

const TOTAL_ROUNDS = ROUNDS.length;

function markLevel16Complete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][16] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function Level16({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [direction, setDirection] = useState(1);

  const advance = () => {
    setDirection(1);
    const nextIndex = roundIndex + 1;
    if (nextIndex >= TOTAL_ROUNDS) {
      markLevel16Complete();
      setDone(true);
    } else {
      setRoundIndex(nextIndex);
    }
  };

  const round = ROUNDS[roundIndex];
  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4, padding: "calc(env(safe-area-inset-top, 0px) + 8px) 16px 8px", borderBottom: "1.5px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.75)", backdropFilter: "blur(10px)" }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1E293B" }}>
            {lang === "zh" ? "第 16 关" : "Level 16"}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {!done && (
        <div style={{ height: 6, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
          <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #4ECDC4, #4D96FF)" }} />
        </div>
      )}

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <Level16Complete onBack={onBack} lang={lang} />
          </motion.div>
        ) : (
          <motion.div key={`round-${roundIndex}`} initial={{ opacity: 0, x: direction * 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: direction * -40 }} transition={{ duration: 0.22 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {round.type === "phonics" ? (
              <Level1Phonics card={round.card} onNext={advance} lang={lang} isFirstCard={round.guided === true} />
            ) : (
              <Level1DragV2 card={round.card} onComplete={advance} lang={lang} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}