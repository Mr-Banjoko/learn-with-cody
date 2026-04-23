/**
 * Level 10 — same structure as Level 5 (Review)
 *
 * Fixed 9-round sequence (mapping: cat→can, dad→pan, rat→jam, hat→map, bat→mat):
 *   R1: Rearrange the Pictures → map
 *   R2: Identifying            → pan
 *   R3: Drag the Letters       → mat
 *   R4: Identifying            → can
 *   R5: Rearrange the Pictures → mat
 *   R6: Drag the Letters       → jam
 *   R7: Drag the Letters       → can
 *   R8: Identifying            → map
 *   R9: Rearrange the Pictures → jam
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackArrow from "../BackArrow";
import Level10Complete from "./Level10Complete";
import PicSliceBoardEasy from "../games/PicSliceBoardEasy";
import Level1Drag from "./Level1Drag";
import IdentifyingRound from "../games/IdentifyingRound";
import { buildWordData } from "../../lib/picSliceGameData";
import { shortAWords } from "../../lib/shortAWords";
import { shortEWords } from "../../lib/shortEWords";
import { shortIWords } from "../../lib/shortIWords";
import { shortOWords } from "../../lib/shortOWords";
import { shortUWords } from "../../lib/shortUWords";

const ROUND_SEQUENCE = [
  { type: "rearrange",   word: "map" },
  { type: "identifying", word: "pan" },
  { type: "drag",        word: "mat" },
  { type: "identifying", word: "can" },
  { type: "rearrange",   word: "mat" },
  { type: "drag",        word: "jam" },
  { type: "drag",        word: "can" },
  { type: "identifying", word: "map" },
  { type: "rearrange",   word: "jam" },
];
const TOTAL_ROUNDS = ROUND_SEQUENCE.length;

function findWord(name) {
  return shortAWords.find((w) => w.word === name) || { word: name, image: "", audio: "" };
}

function markLevel10Complete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][10] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

const ALL_WORDS = [...shortAWords, ...shortEWords, ...shortIWords, ...shortOWords, ...shortUWords];

function buildIdentifyingRound(targetWord) {
  const target = shortAWords.find((w) => w.word === targetWord);
  const distractorPool = ALL_WORDS.filter((w) => w.word !== targetWord);
  const shuffled = [...distractorPool].sort(() => Math.random() - 0.5);
  const distractors = shuffled.slice(0, 2);
  const choices = [target, ...distractors].sort(() => Math.random() - 0.5);
  return { target, choices };
}

export default function Level10({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);

  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;

  const advance = useCallback(() => {
    const next = roundIndex + 1;
    if (next >= TOTAL_ROUNDS) {
      markLevel10Complete();
      setDone(true);
    } else {
      setRoundIndex(next);
    }
  }, [roundIndex]);

  const roundDef = ROUND_SEQUENCE[roundIndex];

  const rearrangeWordPair = useMemo(() => {
    if (!roundDef || roundDef.type !== "rearrange") return null;
    return [buildWordData(roundDef.word)];
  }, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const dragCard = useMemo(() => {
    if (!roundDef || roundDef.type !== "drag") return null;
    return findWord(roundDef.word);
  }, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const identifyingRound = useMemo(() => {
    if (!roundDef || roundDef.type !== "identifying") return null;
    return buildIdentifyingRound(roundDef.word);
  }, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4, padding: "calc(env(safe-area-inset-top, 0px) + 8px) 16px 8px", borderBottom: "1.5px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.75)", backdropFilter: "blur(10px)" }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1E293B" }}>
            {lang === "zh" ? "第 10 关 — 复习" : "Level 10 — Review"}
          </p>
        </div>
        <span style={{ fontSize: 13, color: "#64748B", fontWeight: 600, marginRight: 4 }}>
          {roundIndex + 1}/{TOTAL_ROUNDS}
        </span>
      </div>

      {!done && (
        <div style={{ height: 6, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
          <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #4ECDC4, #4D96FF)" }} />
        </div>
      )}

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <Level10Complete onBack={onBack} lang={lang} />
          </motion.div>
        ) : (
          <motion.div key={`round-${roundIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {roundDef.type === "rearrange" && rearrangeWordPair ? (
              <PicSliceBoardEasy key={`rearrange-${roundIndex}`} wordPair={rearrangeWordPair} onRoundComplete={advance} lang={lang} />
            ) : roundDef.type === "drag" && dragCard ? (
              <Level1Drag key={`drag-${roundIndex}`} card={dragCard} onComplete={advance} lang={lang} />
            ) : roundDef.type === "identifying" && identifyingRound ? (
              <IdentifyingRound key={`identifying-${roundIndex}`} round={identifyingRound} onComplete={advance} lang={lang} />
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}