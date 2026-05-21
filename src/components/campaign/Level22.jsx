/**
 * Level 22 — Finish Batch E + light review
 * R1: phonics   — tax
 * R2: drag      — tax
 * R3: phonics   — dam
 * R4: drag      — dam
 * R5: missing01 — gap | P (FINAL, pos 2)
 * R6: missing01 — wax | W (INITIAL, pos 0)
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import Level6Phonics from "./Level6Phonics";
import Level1DragV2 from "./Level1DragV2";
import CampaignMissingSound01Round from "./CampaignMissingSound01Round";
import LevelCompleteScreen from "./LevelCompleteScreen";
import { shortAWords } from "../../lib/shortAWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";

const LEVEL_NUM = 22;
const SCORED_ROUNDS = getScoredRounds("short-a", LEVEL_NUM);
const findWord = (w) => shortAWords.find((x) => x.word === w);

const ROUNDS = [
  { type: "phonics",   card: findWord("tax") },
  { type: "drag",      card: findWord("tax") },
  { type: "phonics",   card: findWord("dam") },
  { type: "drag",      card: findWord("dam") },
  { type: "missing01", card: findWord("gap"), missingPos: 2 }, // P FINAL
  { type: "missing01", card: findWord("wax"), missingPos: 0 }, // W INITIAL
];
const TOTAL_ROUNDS = ROUNDS.length;

function markComplete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][LEVEL_NUM] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function Level22({ onBack, lang = "en" }) {
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

  const round = ROUNDS[roundIndex];
  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} lang={lang} gameType={round?.type} />
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
            {round.type === "phonics" && <Level6Phonics card={round.card} onNext={advance} lang={lang} />}
            {round.type === "drag" && <Level1DragV2 key={`drag-${roundIndex}`} card={round.card} onComplete={advance} lang={lang} onMistake={onMistake} />}
            {round.type === "missing01" && <CampaignMissingSound01Round key={`miss-${roundIndex}`} card={round.card} forcedMissingPos={round.missingPos} onComplete={advance} onMistake={onMistake} lang={lang} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}