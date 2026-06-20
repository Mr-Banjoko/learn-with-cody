/**
 * ShortILevel20 — Grand Review I: All batches A-D
 * R1: word_match — big — distractors: bag, bog, bug
 * R2: catch — sit — s (initial)
 * R3: rearrange_hard — pin [pair: pin + pig]
 * R4: drawline — {big,dig,jig} initial
 * R5: dictation — lip
 * R6: drag — kit
 * R7: identifying — hid
 * R8: writev2 — mix
 * R9: word_to_audio — hit — options: hit, hat, hot
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import Level1DragV2 from "./Level1DragV2";
import CampaignLetterCatchRound from "./CampaignLetterCatchRound";
import CampaignWordMatchRound from "./CampaignWordMatchRound";
import CampaignWordToAudioRound from "./CampaignWordToAudioRound";
import WriteV2CampaignRound from "./WriteV2CampaignRound";
import DictationCampaignRound from "./DictationCampaignRound";
import DrawLineBoard from "../games/drawline/DrawLineBoard";
import IdentifyingRound from "../games/IdentifyingRound";
import PicSliceBoard from "../games/PicSliceBoard";
import LevelCompleteScreen from "./LevelCompleteScreen";
import { buildShortISliceData } from "../../lib/buildShortISliceData";
import { shortIWords } from "../../lib/shortIWords";
import { shortAWords } from "../../lib/shortAWords";
import { shortOWords } from "../../lib/shortOWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { useRoundHintAudio, getShortIHintAudioUrl, LOCK_OVERLAY_STYLE } from "../../lib/useRoundHintAudio";

const LEVEL_NUM = 20;
const VOWEL_KEY = "short-i";
const SCORED_ROUNDS = getScoredRounds(VOWEL_KEY, LEVEL_NUM);
const ALL_WORDS = [...shortAWords, ...shortOWords, ...shortIWords];
const findI = (w) => shortIWords.find((x) => x.word === w);
function fakeCard(word) { return { word, audio: null, image: null }; }

function buildDrawLineRound() {
  const words = [
    { word: "big", targetLetter: "b", positionType: "initial" },
    { word: "dig", targetLetter: "d", positionType: "initial" },
    { word: "kid", targetLetter: "k", positionType: "initial" },
  ];
  const topCards = words.map((w, i) => ({ ...findI(w.word), targetLetter: w.targetLetter, positionType: w.positionType, id: `card-${i}-${w.word}` }));
  const bottomLetters = [
    { letter: "k", topCardId: topCards[2].id, botIdx: 0 },
    { letter: "b", topCardId: topCards[0].id, botIdx: 1 },
    { letter: "d", topCardId: topCards[1].id, botIdx: 2 },
  ];
  return { topCards, bottomLetters };
}

function buildIdentifyingRound(word) {
  const target = findI(word);
  const pool = ALL_WORDS.filter((w) => w.word !== word);
  const choices = [target, ...[...pool].sort(() => Math.random() - 0.5).slice(0, 2)].sort(() => Math.random() - 0.5);
  return { target, choices };
}

const ROUND_SEQUENCE = [
  { type: "word_match",    word: "big",  distractors: ["bag", "bog", "bug"] },
  { type: "catch",         word: "sit",  missingLetter: "s" },
  { type: "rearrange_hard", words: ["pin", "pig"] },
  { type: "drawline" },
  { type: "dictation",     word: "lip" },
  { type: "drag",          word: "kit" },
  { type: "identifying",   word: "hid" },
  { type: "writev2",       word: "mix" },
  { type: "word_to_audio", words: ["hit", "hat", "hot"] },
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

export default function ShortILevel20({ onBack, lang = "en" }) {
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
  const card = useMemo(() => roundDef.word ? findI(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const wordMatchChoices = useMemo(() => roundDef.type === "word_match" && card ? [card, ...roundDef.distractors.map(fakeCard)].sort(() => Math.random() - 0.5) : null, [roundIndex]); // eslint-disable-line
  const rearrangeHardPair = useMemo(() => roundDef.type === "rearrange_hard" ? roundDef.words.map(buildShortISliceData) : null, [roundIndex]); // eslint-disable-line
  const drawLineRound = useMemo(() => roundDef.type === "drawline" ? buildDrawLineRound() : null, [roundIndex]); // eslint-disable-line
  const identifyingRound = useMemo(() => roundDef.type === "identifying" ? buildIdentifyingRound(roundDef.word) : null, [roundIndex]); // eslint-disable-line

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
            {roundDef.type === "word_match" && card && wordMatchChoices && <CampaignWordMatchRound key={`wm-${roundIndex}`} card={card} overrideChoices={wordMatchChoices} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {roundDef.type === "catch" && card && <CampaignLetterCatchRound key={`catch-${roundIndex}`} word={card.word} missingLetter={roundDef.missingLetter} image={card.image} audio={card.audio} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {roundDef.type === "rearrange_hard" && rearrangeHardPair && <PicSliceBoard key={`hard-${roundIndex}`} wordPair={rearrangeHardPair} onRoundComplete={advance} lang={lang} onMistake={onMistake} />}
            {roundDef.type === "drawline" && drawLineRound && <DrawLineBoard key={`dl-${roundIndex}`} round={drawLineRound} onRoundComplete={advance} lang={lang} onMistake={onMistake} />}
            {roundDef.type === "dictation" && card && <DictationCampaignRound key={`dict-${roundIndex}`} card={card} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {roundDef.type === "drag" && card && <Level1DragV2 key={`drag-${roundIndex}`} card={card} onComplete={advance} lang={lang} onMistake={onMistake} />}
            {roundDef.type === "identifying" && identifyingRound && <IdentifyingRound key={`id-${roundIndex}`} round={identifyingRound} onComplete={advance} lang={lang} onMistake={onMistake} />}
            {roundDef.type === "writev2" && card && <WriteV2CampaignRound key={`writev2-${roundIndex}`} card={card} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {roundDef.type === "word_to_audio" && <CampaignWordToAudioRound key={`wta-${roundIndex}`} words={roundDef.words} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {hintLocked && <div style={LOCK_OVERLAY_STYLE} onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}