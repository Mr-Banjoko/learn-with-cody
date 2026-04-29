/**
 * Level 31 — 10-round fixed sequence (mirrors Level 6 exactly):
 * For each of 5 words: Learn Phonics (Level6Phonics) → Drag the Letters V2
 *
 * Words (exact order): dab, fan, jab, man, nab
 *
 * Round map:
 *  1. dab — phonics
 *  2. dab — drag
 *  3. fan — phonics
 *  4. fan — drag
 *  5. jab — phonics
 *  6. jab — drag
 *  7. man — phonics
 *  8. man — drag
 *  9. nab — phonics
 * 10. nab — drag → marks level complete
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackArrow from "../BackArrow";
import Level6Phonics from "./Level6Phonics";
import Level1DragV2 from "./Level1DragV2";
import LevelCompleteScreen from "./LevelCompleteScreen";
import HeartDisplay from "./HeartDisplay";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
const LEVEL_NUM = 31;
const SCORED_ROUNDS = getScoredRounds("short-a", LEVEL_NUM);
import { shortAWords } from "../../lib/shortAWords";

const WORD_NAMES = ["dab", "fan", "jab", "man", "nab"];
const WORDS = WORD_NAMES.map((name) => shortAWords.find((w) => w.word === name));
const TOTAL_ROUNDS = WORDS.length * 2; // 10

function buildRounds() {
  const rounds = [];
  WORDS.forEach((card) => {
    rounds.push({ type: "phonics", card });
    rounds.push({ type: "drag",    card });
  });
  return rounds;
}

const ROUNDS = buildRounds();

function markLevel31Complete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][31] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function Level31({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [direction, setDirection] = useState(1);
  const [mistakes, setMistakes] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const onMistake = useCallback(() => setMistakes((m) => m + 1), []);

  const advance = () => {
    setDirection(1);
    if (roundIndex + 1 >= TOTAL_ROUNDS) {
      markLevel31Complete();
      const stars = calcStars(mistakes, SCORED_ROUNDS);
      saveLevelResult("short-a", LEVEL_NUM, stars, mistakes);
      setEarnedStars(stars);
      setDone(true);
    } else {
      setRoundIndex((i) => i + 1);
    }
  };

  const round = ROUNDS[roundIndex];
  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4, padding: "calc(env(safe-area-inset-top, 0px) + 8px) 16px 8px", borderBottom: "1.5px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.75)", backdropFilter: "blur(10px)" }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1E293B" }}>{lang === "zh" ? "第 31 关" : "Level 31"}</p>
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
            <LevelCompleteScreen levelNum={LEVEL_NUM} stars={earnedStars} mistakes={mistakes} onBack={onBack} lang={lang} />
          </motion.div>
        ) : (
          <motion.div key={`round-${roundIndex}`} initial={{ opacity: 0, x: direction * 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: direction * -40 }} transition={{ duration: 0.22 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {round.type === "phonics" ? (
              <Level6Phonics card={round.card} onNext={advance} lang={lang} />
            ) : (
              <Level1DragV2 card={round.card} onComplete={advance} lang={lang} onMistake={onMistake} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}