/**
 * ShortOLevel20 — Final Review
 * R1: word_match — hog — distractors: hag, hob, hug
 * R2: catch — mop — o (medial)
 * R3: connection — cob
 * R4: drawline — hot(_ot), sob(_ob), top(_op) initial — shuffled: s,t,h
 * R5: rearrange_easy — fog
 * R6: dictation — jot
 * R7: drag — cot
 * R8: missing01 — pop
 * R9: word_to_audio — hot — options: hot, hat, hop
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import Level1DragV2 from "./Level1DragV2";
import CampaignConnectionRound from "./CampaignConnectionRound";
import CampaignLetterCatchRound from "./CampaignLetterCatchRound";
import CampaignMissingSound01Round from "./CampaignMissingSound01Round";
import CampaignWordMatchRound from "./CampaignWordMatchRound";
import CampaignWordToAudioRound from "./CampaignWordToAudioRound";
import DictationCampaignRound from "./DictationCampaignRound";
import DrawLineBoard from "../games/drawline/DrawLineBoard";
import PicSliceBoardEasy from "../games/PicSliceBoardEasy";
import LevelCompleteScreen from "./LevelCompleteScreen";
import { buildShortOSliceData } from "../../lib/buildShortOSliceData";
import { shortOWords } from "../../lib/shortOWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";

const LEVEL_NUM = 20;
const VOWEL_KEY = "short-o";
const SCORED_ROUNDS = getScoredRounds(VOWEL_KEY, LEVEL_NUM);
const findWord = (w) => shortOWords.find((x) => x.word === w);

function fakeCard(word) { return { word, audio: null, image: null }; }

// R4 hardcoded drawline: hot(_ot), sob(_ob), top(_op) — initial
// tokens: h, s, t — shuffled: s,t,h
// botSlot0→s→sob(idx1), botSlot1→t→top(idx2), botSlot2→h→hot(idx0)
const R4_DRAW_DEF = {
  positionType: "initial",
  shuffleOrder: [1, 2, 0],
  words: [
    { word: "hot", targetLetter: "h" },
    { word: "sob", targetLetter: "s" },
    { word: "top", targetLetter: "t" },
  ],
};

const ROUND_SEQUENCE = [
  { type: "word_match",     word: "hog",  distractors: ["hag", "hob", "hug"] },
  { type: "catch",          word: "mop",  missingLetter: "o" },
  { type: "connection",     word: "cob" },
  { type: "drawline" },
  { type: "rearrange_easy", word: "fog" },
  { type: "dictation",      word: "jot" },
  { type: "drag",           word: "cot" },
  { type: "missing01",      word: "pop",  missingPos: 1 },
  { type: "word_to_audio",  words: ["hot", "hat", "hop"] },
];
const TOTAL_ROUNDS = ROUND_SEQUENCE.length;

function buildDrawLineRound(def) {
  const topCards = def.words.map((w, i) => ({
    ...findWord(w.word),
    targetLetter: w.targetLetter,
    positionType: def.positionType,
    id: `card-${i}-${w.word}-${w.targetLetter}`,
  }));
  const bottomLetters = def.shuffleOrder.map((topIdx, botSlot) => ({
    letter: topCards[topIdx].targetLetter,
    topCardId: topCards[topIdx].id,
    botIdx: botSlot,
  }));
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

export default function ShortOLevel20({ onBack, lang = "en" }) {
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
  const card = useMemo(() => (roundDef.word && roundDef.type !== "word_to_audio") ? findWord(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const connectionCard = useMemo(() => roundDef.type === "connection" ? buildShortOSliceData(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const rearrangeEasyPair = useMemo(() => roundDef.type === "rearrange_easy" ? [buildShortOSliceData(roundDef.word)] : null, [roundIndex]); // eslint-disable-line
  const drawLineRound = useMemo(() => roundDef.type === "drawline" ? buildDrawLineRound(R4_DRAW_DEF) : null, [roundIndex]); // eslint-disable-line
  const wordMatchChoices = useMemo(() => roundDef.type === "word_match" && card ? [card, ...roundDef.distractors.map(fakeCard)].sort(() => Math.random() - 0.5) : null, [roundIndex]); // eslint-disable-line

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #FFF6E8 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} lang={lang} vowelKey="short-o" gameType={roundDef.type} />
      {!done && (
        <div style={{ height: 6, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
          <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #FFD700, #FF9F43)" }} />
        </div>
      )}
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <LevelCompleteScreen levelNum={LEVEL_NUM} stars={earnedStars} mistakes={mistakes} onBack={onBack} lang={lang} />
          </motion.div>
        ) : (
          <motion.div key={`round-${roundIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {roundDef.type === "word_match" && card && wordMatchChoices && <CampaignWordMatchRound key={`wm-${roundIndex}`} card={card} overrideChoices={wordMatchChoices} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {roundDef.type === "catch" && card && <CampaignLetterCatchRound key={`catch-${roundIndex}`} word={card.word} missingLetter={roundDef.missingLetter} image={card.image} audio={card.audio} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {roundDef.type === "connection" && connectionCard && <CampaignConnectionRound key={`conn-${roundIndex}`} card={connectionCard} onComplete={advance} lang={lang} onMistake={onMistake} />}
            {roundDef.type === "drawline" && drawLineRound && <DrawLineBoard key={`dl-${roundIndex}`} round={drawLineRound} onRoundComplete={advance} lang={lang} onMistake={onMistake} />}
            {roundDef.type === "rearrange_easy" && rearrangeEasyPair && <PicSliceBoardEasy key={`re-${roundIndex}`} wordPair={rearrangeEasyPair} onRoundComplete={advance} lang={lang} onMistake={onMistake} />}
            {roundDef.type === "dictation" && card && <DictationCampaignRound key={`dict-${roundIndex}`} card={card} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {roundDef.type === "drag" && card && <Level1DragV2 key={`drag-${roundIndex}`} card={card} onComplete={advance} lang={lang} onMistake={onMistake} />}
            {roundDef.type === "missing01" && card && <CampaignMissingSound01Round key={`miss-${roundIndex}`} card={card} forcedMissingPos={roundDef.missingPos} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {roundDef.type === "word_to_audio" && <CampaignWordToAudioRound key={`wta-${roundIndex}`} words={roundDef.words} onComplete={advance} onMistake={onMistake} lang={lang} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}