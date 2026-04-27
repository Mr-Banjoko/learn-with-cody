/**
 * Level 16 — 10-round sequence (mirrors Level 11 structure):
 * For each of the 5 words, in order:
 *   1. Learn Phonics  (Level1Phonics, no tutorial)
 *   2. Rearrange the Pictures → Easy  (PicSliceBoardEasy)
 *
 * Words (exact order): gas, jar, tag, tap, bag
 *
 * Round map:
 *  1. gas  — phonics
 *  2. gas  — rearrange (easy)
 *  3. jar  — phonics
 *  4. jar  — rearrange (easy)
 *  5. tag  — phonics
 *  6. tag  — rearrange (easy)
 *  7. tap  — phonics
 *  8. tap  — rearrange (easy)
 *  9. bag  — phonics
 * 10. bag  — rearrange (easy)  → marks level complete
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackArrow from "../BackArrow";
import Level1Phonics from "./Level1Phonics";
import Level16Complete from "./Level16Complete";
import PicSliceBoardEasy from "../games/PicSliceBoardEasy";
import { buildWordData } from "../../lib/picSliceGameData";
import { shortAWords } from "../../lib/shortAWords";

const findWord = (w) => shortAWords.find((x) => x.word === w);
const gasCard = findWord("gas");
const jarCard = findWord("jar");
const tagCard = findWord("tag");
const tapCard = findWord("tap");
const bagCard = findWord("bag");

const ROUNDS = [
  { type: "phonics",   card: gasCard }, // Round 1:  gas phonics
  { type: "rearrange", card: gasCard }, // Round 2:  gas rearrange
  { type: "phonics",   card: jarCard }, // Round 3:  jar phonics
  { type: "rearrange", card: jarCard }, // Round 4:  jar rearrange
  { type: "phonics",   card: tagCard }, // Round 5:  tag phonics
  { type: "rearrange", card: tagCard }, // Round 6:  tag rearrange
  { type: "phonics",   card: tapCard }, // Round 7:  tap phonics
  { type: "rearrange", card: tapCard }, // Round 8:  tap rearrange
  { type: "phonics",   card: bagCard }, // Round 9:  bag phonics
  { type: "rearrange", card: bagCard }, // Round 10: bag rearrange → complete
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
            {lang === "zh" ? "第 16 关" : "Level 16"}
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
            <Level16Complete onBack={onBack} lang={lang} />
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