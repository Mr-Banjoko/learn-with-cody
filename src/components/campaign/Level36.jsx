/**
 * Level 36 — 6-round Drag-the-Letters V2
 * R1: rag  R2: ram  R3: ran  R4: sap  R5: nap  R6: fat
 */
import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import Level1DragV2 from "./Level1DragV2";
import LevelCompleteScreen from "./LevelCompleteScreen";
import HeartDisplay from "./HeartDisplay";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { shortAWords } from "../../lib/shortAWords";
import { playAudio } from "../../lib/useAudio";

const LEVEL_NUM = 36;
const SCORED_ROUNDS = getScoredRounds("short-a", LEVEL_NUM);
const WORD_ORDER = ["rag", "ram", "ran", "sap", "nap", "fat"];
const TOTAL_ROUNDS = WORD_ORDER.length;
const findWord = (w) => shortAWords.find((x) => x.word === w);

function markComplete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][36] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function Level36({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const [audioLocked, setAudioLocked] = useState(true);
  const lockRef = useRef(null);
  const onMistake = useCallback(() => setMistakes((m) => m + 1), []);

  useEffect(() => {
    setAudioLocked(true);
    clearTimeout(lockRef.current);
    const card = findWord(WORD_ORDER[roundIndex]);
    const t = setTimeout(() => {
      if (card?.audio) playAudio(card.audio);
      lockRef.current = setTimeout(() => setAudioLocked(false), 1400);
    }, 300);
    return () => { clearTimeout(t); clearTimeout(lockRef.current); };
  }, [roundIndex]);

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
  const card = findWord(WORD_ORDER[roundIndex]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} />
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
          <motion.div key={`round-${roundIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
            {audioLocked && <div style={{ position: "absolute", inset: 0, zIndex: 50, pointerEvents: "all" }} />}
            {card && (
              <Level1DragV2 key={`drag-${roundIndex}`} card={card} onComplete={advance} lang={lang} onMistake={onMistake} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}