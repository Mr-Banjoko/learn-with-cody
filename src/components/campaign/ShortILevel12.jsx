/**
 * ShortILevel12 — Review A-C (Mixed Vowel)
 * R1: drag_v2 — kid
 * R2: dictation — dog (Short O)
 * R3: word_match — kit — distractors: kat, kot, kut
 * R4: rearrange_hard — hit [pair: hit + hid]
 * R5: word_to_audio — map (Short A) — options: map, mop, mip
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import Level1DragV2 from "./Level1DragV2";
import CampaignWordMatchRound from "./CampaignWordMatchRound";
import CampaignWordToAudioRound from "./CampaignWordToAudioRound";
import DictationCampaignRound from "./DictationCampaignRound";
import PicSliceBoard from "../games/PicSliceBoard";
import LevelCompleteScreen from "./LevelCompleteScreen";
import { buildShortISliceData } from "../../lib/buildShortISliceData";
import { shortIWords } from "../../lib/shortIWords";
import { shortOWords } from "../../lib/shortOWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { useRoundHintAudio, getShortIHintAudioUrl, LOCK_OVERLAY_STYLE } from "../../lib/useRoundHintAudio";

const LEVEL_NUM = 12;
const VOWEL_KEY = "short-i";
const SCORED_ROUNDS = getScoredRounds(VOWEL_KEY, LEVEL_NUM);
const findI = (w) => shortIWords.find((x) => x.word === w);
const findO = (w) => shortOWords.find((x) => x.word === w);
function fakeCard(word) { return { word, audio: null, image: null }; }

const ROUND_SEQUENCE = [
  { type: "drag_v2",        word: "kid",  source: "i" },
  { type: "dictation",      word: "dog",  source: "o" },
  { type: "word_match",     word: "kit",  source: "i", distractors: ["kat", "kot", "kut"] },
  { type: "rearrange_hard", words: ["hit", "hid"] },
  { type: "word_to_audio",  words: ["map", "mop", "mip"] },
];
const TOTAL_ROUNDS = ROUND_SEQUENCE.length;

function markComplete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data[VOWEL_KEY]) data[VOWEL_KEY] = {};
    data[VOWEL_KEY][LEVEL_NUM] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function ShortILevel12({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const onMistake = useCallback(() => setMistakes((m) => m + 1), []);

  const hintUrl = getShortIHintAudioUrl(LEVEL_NUM, roundIndex, lang);
  const { locked: hintLocked } = useRoundHintAudio({ url: hintUrl });

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
  const card = useMemo(() => {
    const def = ROUND_SEQUENCE[roundIndex];
    if (!def.word) return null;
    if (def.source === "o") return findO(def.word);
    return findI(def.word);
  }, [roundIndex]); // eslint-disable-line
  const wordMatchChoices = useMemo(() => roundDef.type === "word_match" && card ? [card, ...roundDef.distractors.map(fakeCard)].sort(() => Math.random() - 0.5) : null, [roundIndex]); // eslint-disable-line
  const rearrangeHardPair = useMemo(() => roundDef.type === "rearrange_hard" ? roundDef.words.map(buildShortISliceData) : null, [roundIndex]); // eslint-disable-line
  const traySwapCount = useMemo(() => (roundIndex % 2 === 0) ? 2 : 1, [roundIndex]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #F0F8FF 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} lang={lang} vowelKey="short-i" gameType={roundDef.type} />
      {!done && (
        <div style={{ height: 6, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
          <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #6BCB77, #4ECDC4)" }} />
        </div>
      )}
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <LevelCompleteScreen levelNum={LEVEL_NUM} stars={earnedStars} mistakes={mistakes} onBack={onBack} lang={lang} />
          </motion.div>
        ) : (
          <motion.div key={`round-${roundIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {roundDef.type === "drag_v2" && card && <Level1DragV2 key={`drag-${roundIndex}`} card={card} onComplete={advance} lang={lang} onMistake={onMistake} />}
            {roundDef.type === "dictation" && card && <DictationCampaignRound key={`dict-${roundIndex}`} card={card} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {roundDef.type === "word_match" && card && wordMatchChoices && <CampaignWordMatchRound key={`wm-${roundIndex}`} card={card} overrideChoices={wordMatchChoices} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {roundDef.type === "rearrange_hard" && rearrangeHardPair && <PicSliceBoard key={`hard-${roundIndex}`} wordPair={rearrangeHardPair} onRoundComplete={advance} lang={lang} onMistake={onMistake} traySwapCount={traySwapCount} />}
            {roundDef.type === "word_to_audio" && <CampaignWordToAudioRound key={`wta-${roundIndex}`} words={roundDef.words} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {hintLocked && <div style={LOCK_OVERLAY_STYLE} onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}