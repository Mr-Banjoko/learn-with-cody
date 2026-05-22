/**
 * Short I — Level 18 — Rearrange Hard Expansion
 * R1: rearrange_hard — fit + fat (I/A)
 * R2: rearrange_hard — bin + ben (I/E)
 * R3: catch          — dip | D (INITIAL)
 * R4: connection     — rim
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "../LevelHeader";
import PicSliceBoard from "../../games/PicSliceBoard";
import CampaignLetterCatchRound from "../CampaignLetterCatchRound";
import CampaignConnectionRound from "../CampaignConnectionRound";
import LevelCompleteScreen from "../LevelCompleteScreen";
import { buildWordData } from "../../../lib/picSliceGameData";
import { shortIWords } from "../../../lib/shortIWords";
import { shortAWords } from "../../../lib/shortAWords";
import { shortEWords } from "../../../lib/shortEWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../../lib/campaignPerformance";

const VOWEL_KEY = "short-i";
const LEVEL_NUM = 18;
const SCORED_ROUNDS = getScoredRounds(VOWEL_KEY, LEVEL_NUM);
const findI = (w) => shortIWords.find((x) => x.word === w);
const findA = (w) => shortAWords.find((x) => x.word === w);
const findE = (w) => shortEWords.find((x) => x.word === w);

const HARD_PAIRS = [
  ["fit", "fat"],  // I vs A
  ["bin", "ben"],  // I vs E
];

const ROUNDS = [
  { type: "rearrange_hard", pair: HARD_PAIRS[0] },
  { type: "rearrange_hard", pair: HARD_PAIRS[1] },
  { type: "catch",          word: "dip", missingLetter: "d" }, // D INITIAL
  { type: "connection",     word: "rim" },
];
const TOTAL_ROUNDS = ROUNDS.length;

function buildPair([w1, w2]) {
  const d1 = buildWordData(w1) || findI(w1);
  const d2 = buildWordData(w2) || findA(w2) || findE(w2);
  return [d1, d2].filter(Boolean);
}

function markComplete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data[VOWEL_KEY]) data[VOWEL_KEY] = {};
    data[VOWEL_KEY][LEVEL_NUM] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function ShortILevel18({ onBack, lang = "en" }) {
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

  const round = ROUNDS[roundIndex];
  const hardWordPair = useMemo(() => round.type === "rearrange_hard" ? buildPair(round.pair) : null, [roundIndex]); // eslint-disable-line
  const catchCard = useMemo(() => round.type === "catch" ? findI(round.word) : null, [roundIndex]); // eslint-disable-line
  const connectionCard = useMemo(() => round.type === "connection" ? buildWordData(round.word) : null, [roundIndex]); // eslint-disable-line
  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} lang={lang} gameType={round.type === "rearrange_hard" ? "rearrange" : round.type} />
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
            {round.type === "rearrange_hard" && hardWordPair && <PicSliceBoard key={`hard-${roundIndex}`} wordPair={hardWordPair} onRoundComplete={advance} lang={lang} onMistake={onMistake} />}
            {round.type === "catch" && catchCard && <CampaignLetterCatchRound key={`catch-${roundIndex}`} word={round.word} missingLetter={round.missingLetter} image={catchCard.image} audio={catchCard.audio} onComplete={advance} onMistake={onMistake} lang={lang} paused={false} skipInitialAudio={false} />}
            {round.type === "connection" && connectionCard && <CampaignConnectionRound key={`conn-${roundIndex}`} card={connectionCard} onComplete={advance} lang={lang} onMistake={onMistake} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}