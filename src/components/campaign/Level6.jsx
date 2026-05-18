/**
 * Level 6 — 10-round fixed sequence:
 * For each of 5 words: Learn Phonics → Drag-to-Rearrange-Pictures (easy mode)
 * Words: can, pan, jam, map, mat (in this exact order)
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import Level6Phonics from "./Level6Phonics";
import LevelCompleteScreen from "./LevelCompleteScreen";
import HeartDisplay from "./HeartDisplay";
import PicSliceBoardEasy from "../games/PicSliceBoardEasy";
import { buildWordData } from "../../lib/picSliceGameData";
import { shortAWords } from "../../lib/shortAWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";

const LEVEL_NUM = 6;
const SCORED_ROUNDS = getScoredRounds("short-a", LEVEL_NUM);

const WORD_NAMES = ["can", "pan", "jam", "map", "mat"];
const WORDS = WORD_NAMES.map((name) => shortAWords.find((w) => w.word === name));
const TOTAL_ROUNDS = WORDS.length * 2; // 10

function buildRounds() {
  const rounds = [];
  WORDS.forEach((card) => {
    rounds.push({ type: "phonics",   card });
    rounds.push({ type: "rearrange", card });
  });
  return rounds;
}

const ROUNDS = buildRounds();

function markLevel6Complete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][6] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function Level6({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [direction, setDirection] = useState(1);
  const [mistakes, setMistakes] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const onMistake = useCallback(() => setMistakes((m) => m + 1), []);

  const advance = () => {
    setDirection(1);
    if (roundIndex + 1 >= TOTAL_ROUNDS) {
      markLevel6Complete();
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

  const rearrangeWordPair = useMemo(() => {
    if (!round || round.type !== "rearrange") return null;
    return [buildWordData(round.card.word)];
  }, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: "Fredoka, sans-serif",
        background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
        overflow: "hidden",
      }}
    >
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} lang={lang} />

      {/* Progress bar */}
      {!done && (
        <div style={{ height: 6, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
          <motion.div
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4 }}
            style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #4ECDC4, #4D96FF)" }}
          />
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            <LevelCompleteScreen levelNum={LEVEL_NUM} stars={earnedStars} mistakes={mistakes} onBack={onBack} lang={lang} />
          </motion.div>
        ) : (
          <motion.div
            key={`round-${roundIndex}`}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.22 }}
            style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            {round.type === "phonics" ? (
              <Level6Phonics card={round.card} onNext={advance} lang={lang} />
            ) : (
              <PicSliceBoardEasy
                key={`rearrange-${roundIndex}`}
                wordPair={rearrangeWordPair}
                onRoundComplete={advance}
                lang={lang}
                onMistake={onMistake}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}