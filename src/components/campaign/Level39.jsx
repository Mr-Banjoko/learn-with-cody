/**
 * Level 39 — 6-round alternating Identifying / Word Match
 */
import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import IdentifyingRound from "../games/IdentifyingRound";
import CampaignWordMatchRound from "./CampaignWordMatchRound";
import LevelCompleteScreen from "./LevelCompleteScreen";
import HeartDisplay from "./HeartDisplay";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { shortAWords } from "../../lib/shortAWords";
import { shortEWords } from "../../lib/shortEWords";
import { shortIWords } from "../../lib/shortIWords";
import { shortOWords } from "../../lib/shortOWords";
import { shortUWords } from "../../lib/shortUWords";

const LEVEL_NUM = 39;
const SCORED_ROUNDS = getScoredRounds("short-a", LEVEL_NUM);
const findWord = (w) => shortAWords.find((x) => x.word === w);
const ALL_WORDS = [...shortAWords, ...shortEWords, ...shortIWords, ...shortOWords, ...shortUWords];

const WORD_MATCH_DISTRACTORS = {
  rag: ["bag", "tag", "wag"],
  sap: ["map", "tap", "cap"],
  nap: ["tap", "pan", "can"],
};

const ROUND_SEQUENCE = [
  { type: "identifying", word: "fat" },
  { type: "wordmatch",   word: "rag" },
  { type: "identifying", word: "ram" },
  { type: "wordmatch",   word: "sap" },
  { type: "identifying", word: "ran" },
  { type: "wordmatch",   word: "nap" },
];
const TOTAL_ROUNDS = ROUND_SEQUENCE.length;

function buildIdentifyingRound(targetWord) {
  const target = findWord(targetWord);
  const pool = ALL_WORDS.filter((w) => w.word !== targetWord);
  const choices = [target, ...[...pool].sort(() => Math.random() - 0.5).slice(0, 2)].sort(() => Math.random() - 0.5);
  return { target, choices };
}

function buildWordMatchCard(targetWord) {
  const target = findWord(targetWord);
  const distractorWords = WORD_MATCH_DISTRACTORS[targetWord] || [];
  const distractors = distractorWords.map((d) => ALL_WORDS.find((w) => w.word === d) || { word: d, audio: null, image: null });
  const choices = [...distractors, target].sort(() => Math.random() - 0.5);
  return { target, choices, overrideChoices: choices };
}

function markComplete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][39] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function Level39({ onBack, lang = "en" }) {
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
    } else setRoundIndex(next);
  }, [roundIndex, mistakes]);

  const roundDef = ROUND_SEQUENCE[roundIndex];
  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;
  const identifyingRound = useMemo(() => roundDef.type === "identifying" ? buildIdentifyingRound(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const wordMatchData = useMemo(() => roundDef.type === "wordmatch" ? buildWordMatchCard(roundDef.word) : null, [roundIndex]); // eslint-disable-line

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} lang={lang} />
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
            {roundDef.type === "identifying" && identifyingRound && <IdentifyingRound key={`id-${roundIndex}`} round={identifyingRound} onComplete={advance} lang={lang} onMistake={onMistake} />}
            {roundDef.type === "wordmatch" && wordMatchData && <CampaignWordMatchRound key={`wm-${roundIndex}`} card={wordMatchData.target} overrideChoices={wordMatchData.overrideChoices} onComplete={advance} onMistake={onMistake} lang={lang} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}