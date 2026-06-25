/**
 * Level 19 — Logic + Recognition Batch D
 * R1: rearrange_easy — gas
 * R2: identifying    — jar
 * R3: drawline       — tag(T-INITIAL), tap(T-INITIAL), bag(B-INITIAL) — ALL INITIAL
 * R4: identifying    — tap
 * R5: rearrange_easy — bag
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import PicSliceBoardEasy from "../games/PicSliceBoardEasy";
import IdentifyingRound from "../games/IdentifyingRound";
import DrawLineBoard from "../games/drawline/DrawLineBoard";
import LevelCompleteScreen from "./LevelCompleteScreen";
import { buildWordData } from "../../lib/picSliceGameData";
import { shortAWords } from "../../lib/shortAWords";
import { shortEWords } from "../../lib/shortEWords";
import { shortIWords } from "../../lib/shortIWords";
import { shortOWords } from "../../lib/shortOWords";
import { shortUWords } from "../../lib/shortUWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { useUserPhoto } from "../../lib/useUserPhoto";

const LEVEL_NUM = 19;
const SCORED_ROUNDS = getScoredRounds("short-a", LEVEL_NUM);
const ALL_WORDS = [...shortAWords, ...shortEWords, ...shortIWords, ...shortOWords, ...shortUWords];
const findWord = (w) => shortAWords.find((x) => x.word === w);

// R3 drawline — ALL INITIAL — tokens: T, T, B
// tag and tap both missing T (independent tokens); bag missing B
const R3_DRAW_DEF = {
  positionType: "initial",
  words: [
    { word: "tag", targetLetter: "t" },
    { word: "tap", targetLetter: "t" },
    { word: "bag", targetLetter: "b" },
  ],
};

const ROUND_SEQUENCE = [
  { type: "rearrange_easy", word: "gas" },
  { type: "identifying",    word: "jar" },
  { type: "drawline" },
  { type: "identifying",    word: "tap" },
  { type: "rearrange_easy", word: "bag" },
];
const TOTAL_ROUNDS = ROUND_SEQUENCE.length;

function buildIdentifyingRound(word) {
  const target = findWord(word);
  const pool = ALL_WORDS.filter((w) => w.word !== word);
  const choices = [target, ...[...pool].sort(() => Math.random() - 0.5).slice(0, 2)].sort(() => Math.random() - 0.5);
  return { target, choices };
}

function buildDrawLineRound(def) {
  const topCards = def.words.map((w, i) => ({
    ...findWord(w.word),
    targetLetter: w.targetLetter,
    positionType: def.positionType,
    id: `card-${i}-${w.word}-${w.targetLetter}`,
  }));
  const bottomLetters = topCards.map((c, i) => ({ letter: c.targetLetter, topCardId: c.id, botIdx: i }));
  return { topCards, bottomLetters };
}

function markComplete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][LEVEL_NUM] = { completed: true, completedAt: new Date().toISOString() };
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
      markComplete();
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
  const rearrangeWordPair = useMemo(() => roundDef.type === "rearrange_easy" ? [buildWordData(roundDef.word)] : null, [roundIndex]); // eslint-disable-line
  const identifyingRound = useMemo(() => roundDef.type === "identifying" ? buildIdentifyingRound(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const drawLineRound = useMemo(() => roundDef.type === "drawline" ? buildDrawLineRound(R3_DRAW_DEF) : null, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} lang={lang} gameType={roundDef?.type} />
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
            {roundDef.type === "rearrange_easy" && rearrangeWordPair && <PicSliceBoardEasy key={`re-${roundIndex}`} wordPair={rearrangeWordPair} onRoundComplete={advance} lang={lang} onMistake={onMistake} />}
            {roundDef.type === "identifying" && identifyingRound && <IdentifyingRound key={`id-${roundIndex}`} round={identifyingRound} onComplete={advance} lang={lang} onMistake={onMistake} />}
            {roundDef.type === "drawline" && drawLineRound && <DrawLineBoard key={`dl-${roundIndex}`} round={drawLineRound} onRoundComplete={advance} lang={lang} onMistake={onMistake} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}