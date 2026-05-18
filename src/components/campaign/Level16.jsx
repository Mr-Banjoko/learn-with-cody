/**
 * Level 16 — 10-round sequence:
 * Odd rounds  (1,3,5,7,9):  Learn Phonics  (Level1Phonics)
 * Even rounds (2,4,6,8,10): Letter-to-Sound Connection (CampaignConnectionRound)
 *
 * Words (exact order): gas, jar, tag, tap, bag
 *
 * Round map:
 *  1. gas  — phonics
 *  2. gas  — connection
 *  3. jar  — phonics
 *  4. jar  — connection
 *  5. tag  — phonics
 *  6. tag  — connection
 *  7. tap  — phonics
 *  8. tap  — connection
 *  9. bag  — phonics
 * 10. bag  — connection → marks level complete
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import Level1Phonics from "./Level1Phonics";
import CampaignConnectionRound from "./CampaignConnectionRound";
import LevelCompleteScreen from "./LevelCompleteScreen";
import HeartDisplay from "./HeartDisplay";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { buildWordData } from "../../lib/picSliceGameData";
import { shortAWords } from "../../lib/shortAWords";

const LEVEL_NUM = 16;
const SCORED_ROUNDS = getScoredRounds("short-a", LEVEL_NUM);

const findWord = (w) => shortAWords.find((x) => x.word === w);

const ROUNDS = [
  { type: "phonics",    word: "gas" }, // Round 1
  { type: "connection", word: "gas" }, // Round 2
  { type: "phonics",    word: "jar" }, // Round 3
  { type: "connection", word: "jar" }, // Round 4
  { type: "phonics",    word: "tag" }, // Round 5
  { type: "connection", word: "tag" }, // Round 6
  { type: "phonics",    word: "tap" }, // Round 7
  { type: "connection", word: "tap" }, // Round 8
  { type: "phonics",    word: "bag" }, // Round 9
  { type: "connection", word: "bag" }, // Round 10
];

const TOTAL_ROUNDS = ROUNDS.length;

function markLevel16Complete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][16] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function Level16({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [direction, setDirection] = useState(1);
  const [mistakes, setMistakes] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const onMistake = useCallback(() => setMistakes((m) => m + 1), []);

  const advance = useCallback(() => {
    setDirection(1);
    const nextIndex = roundIndex + 1;
    if (nextIndex >= TOTAL_ROUNDS) {
      markLevel16Complete();
      const stars = calcStars(mistakes, SCORED_ROUNDS);
      saveLevelResult("short-a", LEVEL_NUM, stars, mistakes);
      setEarnedStars(stars);
      setDone(true);
    } else {
      setRoundIndex(nextIndex);
    }
  }, [roundIndex, mistakes]);

  const round = ROUNDS[roundIndex];
  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;

  const phonicsCard = useMemo(() => {
    if (!round || round.type !== "phonics") return null;
    return findWord(round.word);
  }, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const connectionCard = useMemo(() => {
    if (!round || round.type !== "connection") return null;
    return buildWordData(round.word);
  }, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} lang={lang} />

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
          <motion.div key={`round-${roundIndex}`} initial={{ opacity: 0, x: direction * 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: direction * -40 }} transition={{ duration: 0.22 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {round.type === "phonics" && phonicsCard && (
              <Level1Phonics card={phonicsCard} onNext={advance} lang={lang} isFirstCard={false} />
            )}
            {round.type === "connection" && connectionCard && (
              <CampaignConnectionRound
                key={`connection-${roundIndex}`}
                card={connectionCard}
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