/**
 * Level 11 — 10-round sequence (mirrors Level 1 structure):
 * For each of the 5 words, in order:
 *   1. Learn Phonics  (Level1Phonics, no tutorial)
 *   2. Rearrange the Pictures → Easy  (PicSliceBoardEasy)
 *
 * Words (exact order): sad, sat, pat, mad, ham
 *
 * Round map:
 *  1. sad  — phonics
 *  2. sad  — rearrange (easy)
 *  3. sat  — phonics
 *  4. sat  — rearrange (easy)
 *  5. pat  — phonics
 *  6. pat  — rearrange (easy)
 *  7. mad  — phonics
 *  8. mad  — rearrange (easy)
 *  9. ham  — phonics
 * 10. ham  — rearrange (easy)  → marks level complete
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackArrow from "../BackArrow";
import Level1Phonics from "./Level1Phonics";
import Level11Complete from "./Level11Complete";
import PicSliceBoardEasy from "../games/PicSliceBoardEasy";
import { buildWordData } from "../../lib/picSliceGameData";
import { shortAWords } from "../../lib/shortAWords";

// ── Word cards (exact order) ────────────────────────────────────────────────
const findWord = (w) => shortAWords.find((x) => x.word === w);
const sadCard = findWord("sad");
const satCard = findWord("sat");
const patCard = findWord("pat");
const madCard = findWord("mad");
const hamCard = findWord("ham");

// ── Flat round sequence ─────────────────────────────────────────────────────
const ROUNDS = [
  { type: "phonics",   card: sadCard },  // Round 1:  sad phonics
  { type: "rearrange", card: sadCard },  // Round 2:  sad rearrange
  { type: "phonics",   card: satCard },  // Round 3:  sat phonics
  { type: "rearrange", card: satCard },  // Round 4:  sat rearrange
  { type: "phonics",   card: patCard },  // Round 5:  pat phonics
  { type: "rearrange", card: patCard },  // Round 6:  pat rearrange
  { type: "phonics",   card: madCard },  // Round 7:  mad phonics
  { type: "rearrange", card: madCard },  // Round 8:  mad rearrange
  { type: "phonics",   card: hamCard },  // Round 9:  ham phonics
  { type: "rearrange", card: hamCard },  // Round 10: ham rearrange → complete
];

const TOTAL_ROUNDS = ROUNDS.length;

function markLevel11Complete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][11] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function Level11({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [direction, setDirection] = useState(1);

  const advance = () => {
    setDirection(1);
    const nextIndex = roundIndex + 1;
    if (nextIndex >= TOTAL_ROUNDS) {
      markLevel11Complete();
      setDone(true);
    } else {
      setRoundIndex(nextIndex);
    }
  };

  const round = ROUNDS[roundIndex];
  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;

  // Build wordPair for PicSliceBoardEasy (expects an array of 1 word data object)
  const wordPair = round ? [buildWordData(round.card.word)] : null;

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
            {lang === "zh" ? "第 11 关" : "Level 11"}
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
            <Level11Complete onBack={onBack} lang={lang} />
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
              <Level1Phonics
                card={round.card}
                onNext={advance}
                lang={lang}
                isFirstCard={false}
              />
            ) : (
              <PicSliceBoardEasy
                wordPair={wordPair}
                onRoundComplete={advance}
                lang={lang}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}