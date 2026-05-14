/**
 * Level 37 — 6-round Word-to-Audio Match
 * R1: rag, tag, bag
 * R2: ram, ham, jam
 * R3: ran, man, can
 * R4: sap, map, tap
 * R5: fat, mat, bat
 * R6: nap, tap, pan
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackArrow from "../BackArrow";
import CampaignWordToAudioRound from "./CampaignWordToAudioRound";
import LevelCompleteScreen from "./LevelCompleteScreen";
import HeartDisplay from "./HeartDisplay";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";

const LEVEL_NUM = 37;
const SCORED_ROUNDS = getScoredRounds("short-a", LEVEL_NUM);

const ROUND_WORDS = [
  ["rag", "tag", "bag"],
  ["ram", "ham", "jam"],
  ["ran", "man", "can"],
  ["sap", "map", "tap"],
  ["fat", "mat", "bat"],
  ["nap", "tap", "pan"],
];
const TOTAL_ROUNDS = ROUND_WORDS.length;

function markComplete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][37] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function Level37({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const onMistake = useCallback(() => setMistakes((m) => m + 1), []);

  const advance = useCallback(() => {
    const next = roundIndex + 1;
    if (next >= TOTAL_ROUNDS) {
      markComplete();
      const stars = calcStars(mistakes, SCORED_ROUNDS);
      saveLevelResult("short-a", LEVEL_NUM, stars, mistakes);
      setEarnedStars(stars);
      setDone(true);
    } else {
      setRoundIndex(next);
    }
  }, [roundIndex, mistakes]);

  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4, padding: "calc(env(safe-area-inset-top, 0px) + 8px) 16px 8px", borderBottom: "1.5px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.75)", backdropFilter: "blur(10px)" }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }}><p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1E293B" }}>{lang === "zh" ? "第 37 关" : "Level 37"}</p></div>
        <HeartDisplay mistakes={mistakes} size={54} />
      </div>
      {!done && (
        <div style={{ height: 6, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
          <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #4ECDC4, #4D96FF)" }} />
        </div>
      )}
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <LevelCompleteScreen levelNum={LEVEL_NUM} stars={earnedStars} mistakes={mistakes} onBack={onBack} lang={lang} />
          </motion.div>
        ) : (
          <motion.div key={`round-${roundIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <CampaignWordToAudioRound key={`audio-${roundIndex}`} words={ROUND_WORDS[roundIndex]} onComplete={advance} onMistake={onMistake} lang={lang} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}