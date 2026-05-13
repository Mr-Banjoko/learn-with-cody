/**
 * Level 19 — 5-round alternating: Rearrange Easy + Missing Sound 0.1
 *
 * Round order:
 *  1. Rearrange Easy         — tag
 *  2. Missing Sound 0.1      — gas
 *  3. Rearrange Easy         — bag
 *  4. Missing Sound 0.1      — tap
 *  5. Rearrange Easy         — jar
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackArrow from "../BackArrow";
import PicSliceBoardEasy from "../games/PicSliceBoardEasy";
import CampaignMissingSound01Round from "./CampaignMissingSound01Round";
import LevelCompleteScreen from "./LevelCompleteScreen";
import HeartDisplay from "./HeartDisplay";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { buildWordData } from "../../lib/picSliceGameData";
import { shortAWords } from "../../lib/shortAWords";

const LEVEL_NUM = 19;
const SCORED_ROUNDS = getScoredRounds("short-a", LEVEL_NUM);

const findWord = (w) => shortAWords.find((x) => x.word === w);

const ROUND_SEQUENCE = [
  { type: "rearrange", word: "tag" }, // R1
  { type: "missing",   word: "gas" }, // R2
  { type: "rearrange", word: "bag" }, // R3
  { type: "missing",   word: "tap" }, // R4
  { type: "rearrange", word: "jar" }, // R5
];

const TOTAL_ROUNDS = ROUND_SEQUENCE.length;

function markLevel19Complete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][19] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function Level19({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const onMistake = useCallback(() => setMistakes((m) => m + 1), []);

  const advance = useCallback(() => {
    const next = roundIndex + 1;
    if (next >= TOTAL_ROUNDS) {
      markLevel19Complete();
      const stars = calcStars(mistakes, SCORED_ROUNDS);
      saveLevelResult("short-a", LEVEL_NUM, stars, mistakes);
      setEarnedStars(stars);
      setDone(true);
    } else {
      setRoundIndex(next);
    }
  }, [roundIndex, mistakes]);

  const roundDef = ROUND_SEQUENCE[roundIndex];
  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;

  const rearrangeWordPair = useMemo(() => {
    if (!roundDef || roundDef.type !== "rearrange") return null;
    return [buildWordData(roundDef.word)];
  }, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const missingCard = useMemo(() => {
    if (!roundDef || roundDef.type !== "missing") return null;
    return findWord(roundDef.word);
  }, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4, padding: "calc(env(safe-area-inset-top, 0px) + 8px) 16px 8px", borderBottom: "1.5px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.75)", backdropFilter: "blur(10px)" }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1E293B" }}>
            {lang === "zh" ? "第 19 关" : "Level 19"}
          </p>
        </div>
        <HeartDisplay mistakes={mistakes} size={54} />
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
            <LevelCompleteScreen levelNum={LEVEL_NUM} stars={earnedStars} mistakes={mistakes} onBack={onBack} lang={lang} />
          </motion.div>
        ) : (
          <motion.div key={`round-${roundIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {roundDef.type === "rearrange" && rearrangeWordPair && (
              <PicSliceBoardEasy
                key={`rearrange-${roundIndex}`}
                wordPair={rearrangeWordPair}
                onRoundComplete={advance}
                lang={lang}
                onMistake={onMistake}
              />
            )}
            {roundDef.type === "missing" && missingCard && (
              <CampaignMissingSound01Round
                key={`missing-${roundIndex}`}
                card={missingCard}
                onComplete={advance}
                onMistake={onMistake}
                lang={lang}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}