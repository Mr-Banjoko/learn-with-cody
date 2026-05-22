/**
 * Short E — Level 20 — Unit Review 1
 * R1: missing01     — keg | K (INITIAL)
 * R2: catch         — peg | G (FINAL)
 * R3: drawline (ALL FINAL) — den(N), hen(N), men(N)
 * R4: dictation     — jet
 * R5: rearrange_hard — vet + wet
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import CampaignMissingSound01Round from "./CampaignMissingSound01Round";
import CampaignLetterCatchRound from "./CampaignLetterCatchRound";
import DrawLineBoard from "../games/drawline/DrawLineBoard";
import DictationCampaignRound from "./DictationCampaignRound";
import PicSliceBoard from "../games/PicSliceBoard";
import LevelCompleteScreen from "./LevelCompleteScreen";
import { buildWordData } from "../../lib/picSliceGameData";
import { shortEWords } from "../../lib/shortEWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";

const VOWEL_KEY = "short-e";
const LEVEL_NUM = 20;
const SCORED_ROUNDS = getScoredRounds(VOWEL_KEY, LEVEL_NUM);
const findWord = (w) => shortEWords.find((x) => x.word === w);

const DL_DEF = { positionType: "final", words: [
  { word: "den", targetLetter: "n" },
  { word: "hen", targetLetter: "n" },
  { word: "men", targetLetter: "n" },
]};

const ROUND_SEQUENCE = [
  { type: "missing01",     word: "keg", missingPos: 0 },  // K INITIAL
  { type: "catch",         word: "peg", missingLetter: "g" }, // G FINAL
  { type: "drawline" },
  { type: "dictation",     word: "jet" },
  { type: "rearrange_hard",words: ["vet", "wet"] },
];
const TOTAL_ROUNDS = ROUND_SEQUENCE.length;

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
    if (!data[VOWEL_KEY]) data[VOWEL_KEY] = {};
    data[VOWEL_KEY][LEVEL_NUM] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function ShortELevel20({ onBack, lang = "en" }) {
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
  const drawLineRound = useMemo(() => roundDef.type === "drawline" ? buildDrawLineRound(DL_DEF) : null, [roundIndex]); // eslint-disable-line
  const rearrangeWordPair = useMemo(() => roundDef.type === "rearrange_hard" ? roundDef.words.map(buildWordData) : null, [roundIndex]); // eslint-disable-line
  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} lang={lang} gameType={roundDef?.type === "rearrange_hard" ? "rearrange" : roundDef?.type} />
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
            {roundDef.type === "missing01" && (
              <CampaignMissingSound01Round key={`miss-${roundIndex}`} card={findWord(roundDef.word)} forcedMissingPos={roundDef.missingPos} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {roundDef.type === "catch" && (
              <CampaignLetterCatchRound key={`catch-${roundIndex}`} word={roundDef.word} missingLetter={roundDef.missingLetter} image={findWord(roundDef.word)?.image} audio={findWord(roundDef.word)?.audio} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {roundDef.type === "drawline" && drawLineRound && (
              <DrawLineBoard key="dl-0" round={drawLineRound} onRoundComplete={advance} lang={lang} onMistake={onMistake} />
            )}
            {roundDef.type === "dictation" && (
              <DictationCampaignRound key={`dict-${roundIndex}`} card={findWord(roundDef.word)} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {roundDef.type === "rearrange_hard" && rearrangeWordPair && (
              <PicSliceBoard key={`hard-${roundIndex}`} wordPair={rearrangeWordPair} onRoundComplete={advance} lang={lang} onMistake={onMistake} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}