/**
 * ShortOLevel11 — Review A–C
 * R1: catch — pot — p (initial)
 * R2: connection — log
 * R3: word_match — fox — distractors: fax, fob, fux
 * R4: drag — mom
 * R5: identifying — rod
 * R6: write — mop
 * R7: missing01 — pop
 * R8: rearrange_easy — jog
 * R9: drag — hot
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import Level1DragV2 from "./Level1DragV2";
import CampaignConnectionRound from "./CampaignConnectionRound";
import CampaignLetterCatchRound from "./CampaignLetterCatchRound";
import CampaignMissingSound01Round from "./CampaignMissingSound01Round";
import CampaignWriteRound from "./CampaignWriteRound";
import CampaignWordMatchRound from "./CampaignWordMatchRound";
import IdentifyingRound from "../games/IdentifyingRound";
import PicSliceBoardEasy from "../games/PicSliceBoardEasy";
import LevelCompleteScreen from "./LevelCompleteScreen";
import { buildShortOSliceData } from "../../lib/buildShortOSliceData";
import { shortOWords } from "../../lib/shortOWords";
import { shortAWords } from "../../lib/shortAWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";

const LEVEL_NUM = 11;
const VOWEL_KEY = "short-o";
const SCORED_ROUNDS = getScoredRounds(VOWEL_KEY, LEVEL_NUM);
const ALL_WORDS = [...shortAWords, ...shortOWords];
const findWord = (w) => shortOWords.find((x) => x.word === w);

function fakeCard(word) { return { word, audio: null, image: null }; }

const FOX_CHOICES_DEF = ["fax", "fob", "fux"];

const ROUND_SEQUENCE = [
  { type: "catch",          word: "pot",  missingLetter: "p" },
  { type: "connection",     word: "log" },
  { type: "word_match",     word: "fox",  distractors: FOX_CHOICES_DEF },
  { type: "drag",           word: "mom" },
  { type: "identifying",    word: "rod" },
  { type: "write",          word: "mop" },
  { type: "missing01",      word: "pop",  missingPos: 0 },
  { type: "rearrange_easy", word: "jog" },
  { type: "drag",           word: "hot" },
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

export default function ShortOLevel11({ onBack, lang = "en" }) {
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
  const wordMatchChoices = useMemo(() => roundDef.type === "word_match" ? [card, ...roundDef.distractors.map(fakeCard)].sort(() => Math.random() - 0.5) : null, [roundIndex]); // eslint-disable-line

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
            {roundDef.type === "catch" && card && <CampaignLetterCatchRound key={`catch-${roundIndex}`} word={card.word} missingLetter={roundDef.missingLetter} image={card.image} audio={card.audio} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {roundDef.type === "connection" && connectionCard && <CampaignConnectionRound key={`conn-${roundIndex}`} card={connectionCard} onComplete={advance} lang={lang} onMistake={onMistake} />}
            {roundDef.type === "word_match" && card && wordMatchChoices && <CampaignWordMatchRound key={`wm-${roundIndex}`} card={card} overrideChoices={wordMatchChoices} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {roundDef.type === "drag" && card && <Level1DragV2 key={`drag-${roundIndex}`} card={card} onComplete={advance} lang={lang} onMistake={onMistake} />}
            {roundDef.type === "identifying" && identifyingRound && <IdentifyingRound key={`id-${roundIndex}`} round={identifyingRound} onComplete={advance} lang={lang} onMistake={onMistake} />}
            {roundDef.type === "write" && card && <CampaignWriteRound key={`write-${roundIndex}`} card={card} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {roundDef.type === "missing01" && card && <CampaignMissingSound01Round key={`miss-${roundIndex}`} card={card} forcedMissingPos={roundDef.missingPos} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {roundDef.type === "rearrange_easy" && rearrangeEasyPair && <PicSliceBoardEasy key={`re-${roundIndex}`} wordPair={rearrangeEasyPair} onRoundComplete={advance} lang={lang} onMistake={onMistake} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}