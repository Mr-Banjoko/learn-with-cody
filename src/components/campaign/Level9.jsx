/**
 * Level 9 — 5-round Identifying game (Word → Picture)
 * Words: can → pan → jam → map → mat (fixed order)
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackArrow from "../BackArrow";
import Level9Complete from "./Level9Complete";
import IdentifyingRound from "../games/IdentifyingRound";
import { shortAWords } from "../../lib/shortAWords";
import { shortEWords } from "../../lib/shortEWords";
import { shortIWords } from "../../lib/shortIWords";
import { shortOWords } from "../../lib/shortOWords";
import { shortUWords } from "../../lib/shortUWords";

const TARGET_WORDS = ["can", "pan", "jam", "map", "mat"];
const TOTAL_ROUNDS = TARGET_WORDS.length;
const ALL_WORDS = [...shortAWords, ...shortEWords, ...shortIWords, ...shortOWords, ...shortUWords];

function buildRound(targetWord) {
  const target = shortAWords.find((w) => w.word === targetWord);
  const distractorPool = ALL_WORDS.filter((w) => w.word !== targetWord);
  const shuffled = [...distractorPool].sort(() => Math.random() - 0.5);
  const distractors = shuffled.slice(0, 2);
  const choices = [target, ...distractors].sort(() => Math.random() - 0.5);
  return { target, choices };
}

function markLevel9Complete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][9] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function Level9({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);

  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;

  const advance = useCallback(() => {
    const next = roundIndex + 1;
    if (next >= TOTAL_ROUNDS) {
      markLevel9Complete();
      setDone(true);
    } else {
      setRoundIndex(next);
    }
  }, [roundIndex]);

  const round = useMemo(() => buildRound(TARGET_WORDS[roundIndex]), [roundIndex]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4, padding: "calc(env(safe-area-inset-top, 0px) + 8px) 16px 8px", borderBottom: "1.5px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.75)", backdropFilter: "blur(10px)" }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1E293B" }}>
            {lang === "zh" ? "第 9 关" : "Level 9"}
          </p>
        </div>
      </div>

      {!done && (
        <div style={{ height: 6, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
          <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #4ECDC4, #4D96FF)" }} />
        </div>
      )}

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <Level9Complete onBack={onBack} lang={lang} />
          </motion.div>
        ) : (
          <motion.div key={`round-${roundIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <IdentifyingRound key={roundIndex} round={round} onComplete={advance} lang={lang} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}