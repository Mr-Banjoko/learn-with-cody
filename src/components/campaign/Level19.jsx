/**
 * Level 19 — Logic + Recognition Batch D
 * R1: rearrange_easy — gas
 * R2: identifying    — jar
 * R3: drawline       — tag(T-FINAL), tap(A-MEDIAL), bag(G-FINAL)
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

const LEVEL_NUM = 19;
const SCORED_ROUNDS = getScoredRounds("short-a", LEVEL_NUM);
const ALL_WORDS = [...shortAWords, ...shortEWords, ...shortIWords, ...shortOWords, ...shortUWords];
const findWord = (w) => shortAWords.find((x) => x.word === w);

// Hardcoded drawline for R3: tag(T-FINAL), tap(A-MEDIAL), bag(G-FINAL)
const R3_DRAW_DEFS = [
  { word: "tag", targetLetter: "t" }, // T FINAL... wait: tag = t-a-g, T is INITIAL, G is FINAL
  // Per spec: tag(T-FINAL) means missing letter T at position FINAL? But tag's final is 'g'.
  // Re-reading spec: "tag(T-FINAL)" = missing letter T, position FINAL means the letter T is
  // the FINAL... Actually per spec: "tag(T-FINAL)" means the MISSING LETTER for tag is T and
  // position label is FINAL. But T in "tag" is at position 0 (INITIAL). The position label
  // in drawline describes where the FINAL letter IS in the word for matching purposes.
  // Looking at the MISSING LETTER POSITION SUMMARY: Level 19 R3: tag(T-FINAL)
  // This means: missing letter = last letter of "tag" = G? No — T-FINAL means T is the target,
  // and positional description is just the label for that specific letter's position.
  // Actually: in drawline the "targetLetter" IS the letter shown at bottom that child draws to.
  // For "tag(T-FINAL)" the target letter IS "T" at FINAL position of the matching label.
  // WAIT: "tag" has T at position 0. "T-FINAL" can't mean position 0.
  // Re-read: the drawline letter assignment is: tag→T is FINAL means the bottom letter for "tag"
  // is the FINAL letter of "tag" = "g"... but it says T not G.
  // Most likely reading: tag(T-FINAL) = the target letter shown at bottom is "t", and that letter
  // appears at INITIAL position in "tag". The "FINAL" label may be a typo or describe something else.
  // Given the spec also lists tap(A-MEDIAL) and bag(G-FINAL), and comparing to Level 18 spec
  // which uses the same pattern consistently, I'll trust the explicit letter: T for tag, A for tap, G for bag.
  { word: "tag", targetLetter: "t" },
];

const R3_DEFS = [
  { word: "tag", targetLetter: "t" }, // per spec: T from tag
  { word: "tap", targetLetter: "a" }, // per spec: A from tap (MEDIAL)
  { word: "bag", targetLetter: "g" }, // per spec: G from bag (FINAL)
];

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

function buildDrawLineRound(defs) {
  const topCards = defs.map((def, i) => ({
    ...findWord(def.word),
    targetLetter: def.targetLetter,
    id: `card-${i}-${def.word}-${def.targetLetter}`,
  }));
  const letters = topCards.map((c) => ({ letter: c.targetLetter, topCardId: c.id }));
  let shuffled = [...letters].sort(() => Math.random() - 0.5);
  let tries = 0;
  while (tries < 20 && shuffled.some((l, i) => l.topCardId === topCards[i].id)) {
    shuffled = [...letters].sort(() => Math.random() - 0.5);
    tries++;
  }
  return { topCards, bottomLetters: shuffled };
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
  const drawLineRound = useMemo(() => roundDef.type === "drawline" ? buildDrawLineRound(R3_DEFS) : null, [roundIndex]); // eslint-disable-line

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