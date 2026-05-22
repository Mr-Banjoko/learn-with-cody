/**
 * Short I — Level 28 — Grand Finale
 * R1: word_to_audio  — big | big, bag, beg
 * R2: dictation      — win
 * R3: rearrange_hard — sit + hit (anagram)
 * R4: drawline ALL INITIAL — wig(W), fig(F), jig(J)
 * R5: writev2        — mix
 * R6: word_match     — bib
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "../LevelHeader";
import CampaignWordToAudioRound from "../CampaignWordToAudioRound";
import DictationCampaignRound from "../DictationCampaignRound";
import PicSliceBoard from "../../games/PicSliceBoard";
import DrawLineBoard from "../../games/drawline/DrawLineBoard";
import WriteV2CampaignRound from "../WriteV2CampaignRound";
import CampaignWordMatchRound from "../CampaignWordMatchRound";
import LevelCompleteScreen from "../LevelCompleteScreen";
import { buildWordData } from "../../../lib/picSliceGameData";
import { shortIWords } from "../../../lib/shortIWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../../lib/campaignPerformance";

const VOWEL_KEY = "short-i";
const LEVEL_NUM = 28;
const SCORED_ROUNDS = getScoredRounds(VOWEL_KEY, LEVEL_NUM);
const findWord = (w) => shortIWords.find((x) => x.word === w);

const DRAWLINE_DEF = {
  positionType: "initial",
  words: [
    { word: "wig", targetLetter: "w" },
    { word: "fig", targetLetter: "f" },
    { word: "jig", targetLetter: "j" },
  ],
};

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

const ROUND_SEQUENCE = [
  { type: "word_to_audio",  words: ["big", "bag", "beg"] },
  { type: "dictation",      word: "win" },
  { type: "rearrange_hard", pair: ["sit", "hit"] },
  { type: "drawline" },
  { type: "writev2",        word: "mix" },
  { type: "word_match",     word: "bib" },
];
const TOTAL_ROUNDS = ROUND_SEQUENCE.length;

function buildPair([w1, w2]) {
  const d1 = buildWordData(w1) || findWord(w1);
  const d2 = buildWordData(w2) || findWord(w2);
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

export default function ShortILevel28({ onBack, lang = "en" }) {
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
  const card = useMemo(() => roundDef.word ? findWord(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const hardWordPair = useMemo(() => roundDef.type === "rearrange_hard" ? buildPair(roundDef.pair) : null, [roundIndex]); // eslint-disable-line
  const drawLineRound = useMemo(() => roundDef.type === "drawline" ? buildDrawLineRound(DRAWLINE_DEF) : null, [roundIndex]); // eslint-disable-line
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
            {roundDef.type === "word_to_audio" && <CampaignWordToAudioRound key={`audio-${roundIndex}`} words={roundDef.words} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {roundDef.type === "dictation" && card && <DictationCampaignRound key={`dict-${roundIndex}`} card={card} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {roundDef.type === "rearrange_hard" && hardWordPair && <PicSliceBoard key={`hard-${roundIndex}`} wordPair={hardWordPair} onRoundComplete={advance} lang={lang} onMistake={onMistake} />}
            {roundDef.type === "drawline" && drawLineRound && <DrawLineBoard key="dl-final" round={drawLineRound} onRoundComplete={advance} lang={lang} onMistake={onMistake} />}
            {roundDef.type === "writev2" && card && <WriteV2CampaignRound key={`writev2-${roundIndex}`} card={card} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {roundDef.type === "word_match" && card && <CampaignWordMatchRound key={`wm-${roundIndex}`} card={card} onComplete={advance} onMistake={onMistake} lang={lang} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}