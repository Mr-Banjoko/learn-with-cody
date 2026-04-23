/**
 * Level 1 round order:
 * 1.  cat  — guided phonics (Phase 1–6 tutorial)
 * 2.  dad  — phonics
 * 3.  dad  — drag (Level1Drag)
 * 4.  rat  — phonics
 * 5.  rat  — drag (Level1Drag)
 * 6.  hat  — phonics
 * 7.  hat  — drag (Level1Drag)
 * 8.  bat  — phonics
 * 9.  bat  — drag (Level1Drag)
 * 10. cat  — unguided phonics (no tutorial)
 * 11. cat  — drag (Level1DragV2) → marks level complete
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackArrow from "../BackArrow";
import Level1Phonics from "./Level1Phonics";
import Level1Drag from "./Level1Drag";
import Level1DragV2 from "./Level1DragV2";
import Level1Complete from "./Level1Complete";
import { shortAWords } from "../../lib/shortAWords";

const catCard  = shortAWords[0]; // cat
const dadCard  = shortAWords[1]; // dad
const ratCard  = shortAWords[2]; // rat
const hatCard  = shortAWords[3]; // hat
const batCard  = shortAWords[4]; // bat

// Flat round sequence — explicit ordering
const ROUNDS = [
  { type: "phonics",  card: catCard, guided: true  }, // Round 1:  guided cat phonics
  { type: "phonics",  card: dadCard, guided: false },  // Round 2:  dad phonics
  { type: "drag",     card: dadCard },                 // Round 3:  dad drag
  { type: "phonics",  card: ratCard, guided: false },  // Round 4:  rat phonics
  { type: "drag",     card: ratCard },                 // Round 5:  rat drag
  { type: "phonics",  card: hatCard, guided: false },  // Round 6:  hat phonics
  { type: "drag",     card: hatCard },                 // Round 7:  hat drag
  { type: "phonics",  card: batCard, guided: false },  // Round 8:  bat phonics
  { type: "drag",     card: batCard },                 // Round 9:  bat drag
  { type: "phonics",  card: catCard, guided: false },  // Round 10: unguided cat phonics
  { type: "dragV2",   card: catCard },                 // Round 11: cat DragV2 → complete
];

const TOTAL_ROUNDS = ROUNDS.length;

function markLevel1Complete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][1] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function Level1({ onBack, lang = "en" }) {
  // Always reset tutorial flag when Level 1 is mounted so tutorial shows every time
  useState(() => {
    try { localStorage.removeItem("level1_tutorial_done"); } catch {}
  });
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [direction, setDirection] = useState(1);

  const advance = () => {
    setDirection(1);
    const nextIndex = roundIndex + 1;
    if (nextIndex >= TOTAL_ROUNDS) {
      markLevel1Complete();
      setDone(true);
    } else {
      setRoundIndex(nextIndex);
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
              <Level1Phonics
                card={round.card}
                onNext={advance}
                lang={lang}
                isFirstCard={round.guided === true}
              />
            ) : round.type === "dragV2" ? (
              <Level1DragV2 card={round.card} onComplete={advance} lang={lang} />
            ) : (
              <Level1Drag card={round.card} onComplete={advance} lang={lang} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}