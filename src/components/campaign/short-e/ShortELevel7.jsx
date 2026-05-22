/**
 * Short E — Level 7 — Finish Batch C
 * R1: phonics — net
 * R2: drag    — net
 * R3: phonics — pet
 * R4: drag    — pet
 * R5: phonics — wet
 * R6: drag    — wet
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "../LevelHeader";
import Level1Phonics from "../Level1Phonics";
import Level1DragV2 from "../Level1DragV2";
import LevelCompleteScreen from "../LevelCompleteScreen";
import { shortEWords } from "../../../lib/shortEWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../../lib/campaignPerformance";

const VOWEL_KEY = "short-e";
const LEVEL_NUM = 7;
const SCORED_ROUNDS = getScoredRounds(VOWEL_KEY, LEVEL_NUM);
const findWord = (w) => shortEWords.find((x) => x.word === w);

const ROUNDS = [
  { type: "phonics", card: findWord("net") },
  { type: "drag",    card: findWord("net") },
  { type: "phonics", card: findWord("pet") },
  { type: "drag",    card: findWord("pet") },
  { type: "phonics", card: findWord("wet") },
  { type: "drag",    card: findWord("wet") },
];
const TOTAL_ROUNDS = ROUNDS.length;

function markComplete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data[VOWEL_KEY]) data[VOWEL_KEY] = {};
    data[VOWEL_KEY][LEVEL_NUM] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function ShortELevel7({ onBack, lang = "en" }) {
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
      saveLevelResult(VOWEL_KEY, LEVEL_NUM, stars, mistakes);
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
            {round.type === "phonics" && <Level1Phonics card={round.card} onNext={advance} lang={lang} isFirstCard={false} />}
            {round.type === "drag" && <Level1DragV2 key={`drag-${roundIndex}`} card={round.card} onComplete={advance} lang={lang} onMistake={onMistake} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}