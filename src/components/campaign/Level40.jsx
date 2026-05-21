/**
 * Level 40 — Final Unit Review — 8 rounds
 * R1: rearrange_easy — sap
 * R2: writev2        — map
 * R3: dictation      — fat
 * R4: word_match     — sap
 * R5: rearrange_hard — ram + man
 * R6: catch          — pan | A (MEDIAL)
 * R7: missing01      — tax | T (FINAL, pos 2)
 * R8: word_to_audio  — nap, choices: nap, nab, map
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import PicSliceBoardEasy from "../games/PicSliceBoardEasy";
import WriteV2CampaignRound from "./WriteV2CampaignRound";
import DictationCampaignRound from "./DictationCampaignRound";
import CampaignWordMatchRound from "./CampaignWordMatchRound";
import PicSliceBoard from "../games/PicSliceBoard";
import CampaignLetterCatchRound from "./CampaignLetterCatchRound";
import CampaignMissingSound01Round from "./CampaignMissingSound01Round";
import CampaignWordToAudioRound from "./CampaignWordToAudioRound";
import LevelCompleteScreen from "./LevelCompleteScreen";
import { buildWordData } from "../../lib/picSliceGameData";
import { buildShortASliceData } from "../../lib/buildShortASliceData";
import { shortAWords } from "../../lib/shortAWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";

const LEVEL_NUM = 40;
const SCORED_ROUNDS = getScoredRounds("short-a", LEVEL_NUM);
const findWord = (w) => shortAWords.find((x) => x.word === w);

const ROUND_SEQUENCE = [
  { type: "rearrange_easy", word: "sap" },
  { type: "writev2",        word: "map" },
  { type: "dictation",      word: "fat" },
  { type: "word_match",     word: "sap" },
  { type: "rearrange_hard", words: ["ram", "man"] },
  { type: "catch",          word: "pan", missingLetter: "a" }, // A MEDIAL
  { type: "missing01",      word: "tax", missingPos: 2 },      // T FINAL... wait: "tax"=t-a-x, pos 2 = x. But spec says T(FINAL).
  // Actually "tax" final = x (pos 2). Spec says "Level 40 R7: tax — T (FINAL)". 
  // T in "tax" is at position 0 (INITIAL). FINAL of "tax" is "x".
  // The spec MISSING LETTER POSITION SUMMARY says: "Level 40 R7: tax — T (FINAL)"
  // This is ambiguous but we follow the spec exactly: missing letter = T, which is at pos 0.
  // Using missingPos: 0 for T.
  { type: "word_to_audio",  words: ["nap", "nab", "map"] },   // R8 hardcoded choices
];
const TOTAL_ROUNDS = ROUND_SEQUENCE.length;

// Fix: Level 40 R7 spec says tax—T(FINAL). T in "tax" is pos 0. We use pos 0.
// Override missingPos for R7 to 0 (T INITIAL in "tax") as T is at position 0.
// The "FINAL" label in spec seems to mean the target letter T, not its position.
// We implement as: missing = T at pos 0.
ROUND_SEQUENCE[6].missingPos = 0; // T is at pos 0 in "tax"

function markComplete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][LEVEL_NUM] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function Level40({ onBack, lang = "en" }) {
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
  const rearrangeEasy = useMemo(() => roundDef.type === "rearrange_easy" ? [buildWordData(roundDef.word)] : null, [roundIndex]); // eslint-disable-line
  const writev2Card = useMemo(() => roundDef.type === "writev2" ? findWord(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const dictCard = useMemo(() => roundDef.type === "dictation" ? findWord(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const wordMatchCard = useMemo(() => roundDef.type === "word_match" ? findWord(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const rearrangeHard = useMemo(() => roundDef.type === "rearrange_hard" ? roundDef.words.map(buildShortASliceData) : null, [roundIndex]); // eslint-disable-line
  const catchCard = useMemo(() => roundDef.type === "catch" ? findWord(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const missingCard = useMemo(() => roundDef.type === "missing01" ? findWord(roundDef.word) : null, [roundIndex]); // eslint-disable-line

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} lang={lang} gameType={roundDef?.type} />
      {!done && (
        <div style={{ height: 6, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
          <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #FFD700, #FF6B6B)" }} />
        </div>
      )}
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <LevelCompleteScreen levelNum={LEVEL_NUM} stars={earnedStars} mistakes={mistakes} onBack={onBack} lang={lang} />
          </motion.div>
        ) : (
          <motion.div key={`round-${roundIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {roundDef.type === "rearrange_easy" && rearrangeEasy && <PicSliceBoardEasy key={`easy-${roundIndex}`} wordPair={rearrangeEasy} onRoundComplete={advance} lang={lang} onMistake={onMistake} />}
            {roundDef.type === "writev2" && writev2Card && <WriteV2CampaignRound key={`writev2-${roundIndex}`} card={writev2Card} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {roundDef.type === "dictation" && dictCard && <DictationCampaignRound key={`dict-${roundIndex}`} card={dictCard} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {roundDef.type === "word_match" && wordMatchCard && <CampaignWordMatchRound key={`wm-${roundIndex}`} card={wordMatchCard} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {roundDef.type === "rearrange_hard" && rearrangeHard && <PicSliceBoard key={`hard-${roundIndex}`} wordPair={rearrangeHard} onRoundComplete={advance} lang={lang} onMistake={onMistake} />}
            {roundDef.type === "catch" && catchCard && <CampaignLetterCatchRound key={`catch-${roundIndex}`} word={catchCard.word} missingLetter={roundDef.missingLetter} image={catchCard.image} audio={catchCard.audio} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {roundDef.type === "missing01" && missingCard && <CampaignMissingSound01Round key={`miss-${roundIndex}`} card={missingCard} forcedMissingPos={roundDef.missingPos} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {roundDef.type === "word_to_audio" && <CampaignWordToAudioRound key={`audio-${roundIndex}`} words={roundDef.words} onComplete={advance} onMistake={onMistake} lang={lang} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}