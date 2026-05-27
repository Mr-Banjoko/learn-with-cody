/**
 * ShortOLevel4 — Review A
 * R1: connection — mom
 * R2: catch — dog — d (initial)
 * R3: drag — hot
 * R4: identifying — top
 * R5: missing01 — pop
 * R6: rearrange_easy — mom
 * R7: catch — hot — t (final)
 * R8: drag — pop
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import Level1DragV2 from "./Level1DragV2";
import CampaignConnectionRound from "./CampaignConnectionRound";
import CampaignLetterCatchRound from "./CampaignLetterCatchRound";
import CampaignMissingSound01Round from "./CampaignMissingSound01Round";
import IdentifyingRound from "../games/IdentifyingRound";
import PicSliceBoardEasy from "../games/PicSliceBoardEasy";
import LevelCompleteScreen from "./LevelCompleteScreen";
import { buildShortOSliceData } from "../../lib/buildShortOSliceData";
import { shortOWords } from "../../lib/shortOWords";
import { shortAWords } from "../../lib/shortAWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";

const LEVEL_NUM = 4;
const VOWEL_KEY = "short-o";
const SCORED_ROUNDS = getScoredRounds(VOWEL_KEY, LEVEL_NUM);
const ALL_WORDS = [...shortAWords, ...shortOWords];
const findWord = (w) => shortOWords.find((x) => x.word === w);

const ROUND_SEQUENCE = [
  { type: "connection",     word: "mom" },
  { type: "catch",          word: "dog",  missingLetter: "d" },
  { type: "drag",           word: "hot" },
  { type: "identifying",    word: "top" },
  { type: "missing01",      word: "pop",  missingPos: 2 },
  { type: "rearrange_easy", word: "mom" },
  { type: "catch",          word: "hot",  missingLetter: "t" },
  { type: "drag",           word: "pop" },
];
const TOTAL_ROUNDS = ROUND_SEQUENCE.length;

function buildIdentifyingRound(word) {
  const target = findWord(word);
  const pool = ALL_WORDS.filter((w) => w.word !== word);
  const choices = [target, ...[...pool].sort(() => Math.random() - 0.5).slice(0, 2)].sort(() => Math.random() - 0.5);
  return { target, choices };
}

function markComplete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data[VOWEL_KEY]) data[VOWEL_KEY] = {};
    data[VOWEL_KEY][LEVEL_NUM] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function ShortOLevel4({ onBack, lang = "en" }) {
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

  const roundDef = ROUND_SEQUENCE[roundIndex];
  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;
  const card = useMemo(() => findWord(roundDef.word), [roundIndex]); // eslint-disable-line
  const connectionCard = useMemo(() => roundDef.type === "connection" ? buildShortOSliceData(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const identifyingRound = useMemo(() => roundDef.type === "identifying" ? buildIdentifyingRound(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const rearrangeEasyPair = useMemo(() => roundDef.type === "rearrange_easy" ? [buildShortOSliceData(roundDef.word)] : null, [roundIndex]); // eslint-disable-line

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #FFF6E8 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} lang={lang} vowelKey="short-o" gameType={roundDef.type} />
      {!done && (
        <div style={{ height: 6, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
          <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #FF9F43, #FFD93D)" }} />
        </div>
      )}
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <LevelCompleteScreen levelNum={LEVEL_NUM} stars={earnedStars} mistakes={mistakes} onBack={onBack} lang={lang} />
          </motion.div>
        ) : (
          <motion.div key={`round-${roundIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {roundDef.type === "connection" && connectionCard && <CampaignConnectionRound key={`conn-${roundIndex}`} card={connectionCard} onComplete={advance} lang={lang} onMistake={onMistake} />}
            {roundDef.type === "catch" && card && <CampaignLetterCatchRound key={`catch-${roundIndex}`} word={card.word} missingLetter={roundDef.missingLetter} image={card.image} audio={card.audio} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {roundDef.type === "drag" && card && <Level1DragV2 key={`drag-${roundIndex}`} card={card} onComplete={advance} lang={lang} onMistake={onMistake} />}
            {roundDef.type === "identifying" && identifyingRound && <IdentifyingRound key={`id-${roundIndex}`} round={identifyingRound} onComplete={advance} lang={lang} onMistake={onMistake} />}
            {roundDef.type === "missing01" && card && <CampaignMissingSound01Round key={`miss-${roundIndex}`} card={card} forcedMissingPos={roundDef.missingPos} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {roundDef.type === "rearrange_easy" && rearrangeEasyPair && <PicSliceBoardEasy key={`re-${roundIndex}`} wordPair={rearrangeEasyPair} onRoundComplete={advance} lang={lang} onMistake={onMistake} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}