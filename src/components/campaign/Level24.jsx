/**
 * Level 24 — 5-round mixed: Drag the Letters V2 + Draw a Line
 *
 * Round order:
 *  1. Drag the Letters V2 → wax
 *  2. Draw a Line         → gap, tax, map
 *  3. Drag the Letters V2 → dam
 *  4. Draw a Line         → dam, can, pan
 *  5. Drag the Letters V2 → tan
 */
import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackArrow from "../BackArrow";
import Level1DragV2 from "./Level1DragV2";
import DrawLineBoard from "../games/drawline/DrawLineBoard";
import Level24Complete from "./Level24Complete";
import { shortAWords } from "../../lib/shortAWords";

const findWord = (w) => shortAWords.find((x) => x.word === w);

function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildFixedDrawLineRound(wordNames) {
  const words = wordNames.map(findWord);
  const topCards = words.map((w, i) => ({
    ...w,
    targetLetter: w.word[0],
    id: `card-${i}-${w.word}`,
  }));
  const letters = topCards.map((c) => ({ letter: c.targetLetter, topCardId: c.id }));
  let shuffledLetters = shuffleArr(letters);
  let tries = 0;
  while (tries < 20 && shuffledLetters.some((l, i) => l.topCardId === topCards[i].id)) {
    shuffledLetters = shuffleArr(letters);
    tries++;
  }
  return { topCards, bottomLetters: shuffledLetters };
}

// type: "drag" | "drawline"
const ROUND_SEQUENCE = [
  { type: "drag",     word: "wax"                    }, // R1
  { type: "drawline", words: ["gap", "tax", "map"]   }, // R2
  { type: "drag",     word: "dam"                    }, // R3
  { type: "drawline", words: ["dam", "can", "pan"]   }, // R4
  { type: "drag",     word: "tan"                    }, // R5
];

const TOTAL_ROUNDS = ROUND_SEQUENCE.length;

function markLevel24Complete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][24] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function Level24({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);

  const advance = useCallback(() => {
    const next = roundIndex + 1;
    if (next >= TOTAL_ROUNDS) {
      markLevel24Complete();
      setDone(true);
    } else {
      setRoundIndex(next);
    }
  }, [roundIndex]);

  const roundDef = ROUND_SEQUENCE[roundIndex];
  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;

  const dragCard = useMemo(() => {
    if (!roundDef || roundDef.type !== "drag") return null;
    return findWord(roundDef.word);
  }, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const drawLineRound = useMemo(() => {
    if (!roundDef || roundDef.type !== "drawline") return null;
    return buildFixedDrawLineRound(roundDef.words);
  }, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4, padding: "calc(env(safe-area-inset-top, 0px) + 8px) 16px 8px", borderBottom: "1.5px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.75)", backdropFilter: "blur(10px)" }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1E293B" }}>
            {lang === "zh" ? "第 24 关" : "Level 24"}
          </p>
        </div>
        <span style={{ fontSize: 13, color: "#64748B", fontWeight: 600, marginRight: 4 }}>{roundIndex + 1}/{TOTAL_ROUNDS}</span>
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
            <Level24Complete onBack={onBack} lang={lang} />
          </motion.div>
        ) : (
          <motion.div key={`round-${roundIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {roundDef.type === "drag" && dragCard && (
              <Level1DragV2 key={`drag-${roundIndex}`} card={dragCard} onComplete={advance} lang={lang} />
            )}
            {roundDef.type === "drawline" && drawLineRound && (
              <DrawLineBoard key={`drawline-${roundIndex}`} round={drawLineRound} onRoundComplete={advance} lang={lang} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}