/**
 * ShortILevel3 — Practice Batch A
 * R1: catch — big — b (initial)
 * R2: drag — bit
 * R3: identifying — dim
 * R4: rearrange_easy — dig
 * R5: write — dip
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import Level1DragV2 from "./Level1DragV2";
import CampaignLetterCatchRound from "./CampaignLetterCatchRound";
import CampaignWriteRound from "./CampaignWriteRound";
import IdentifyingRound from "../games/IdentifyingRound";
import PicSliceBoardEasy from "../games/PicSliceBoardEasy";
import LevelCompleteScreen from "./LevelCompleteScreen";
import { buildShortISliceData } from "../../lib/buildShortISliceData";
import { shortIWords } from "../../lib/shortIWords";
import { shortAWords } from "../../lib/shortAWords";
import { shortOWords } from "../../lib/shortOWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { useRoundHintAudio, getShortIHintAudioUrl, LOCK_OVERLAY_STYLE } from "../../lib/useRoundHintAudio";
import { useUserPhoto } from "../../lib/useUserPhoto";

const LEVEL_NUM = 3;
const VOWEL_KEY = "short-i";
const SCORED_ROUNDS = getScoredRounds(VOWEL_KEY, LEVEL_NUM);
const ALL_WORDS = [...shortAWords, ...shortOWords, ...shortIWords];
const findWord = (w) => shortIWords.find((x) => x.word === w);

const ROUND_SEQUENCE = [
  { type: "catch",          word: "big",  missingLetter: "b" },
  { type: "drag",           word: "bit" },
  { type: "identifying",    word: "dip" },
  { type: "rearrange_easy", word: "dig" },
  { type: "write",          word: "dip" },
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

export default function ShortILevel3({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const onMistake = useCallback(() => setMistakes((m) => m + 1), []);

  const hintUrl = getShortIHintAudioUrl(LEVEL_NUM, roundIndex, lang);
  const { locked: hintLocked, suppressAutoPlay } = useRoundHintAudio({ url: hintUrl });

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
  const { photoUrl: userPhotoUrl, clearPhoto: onClearPhoto } = useUserPhoto(roundDef.word);
  const identifyingRound = useMemo(() => roundDef.type === "identifying" ? buildIdentifyingRound(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const rearrangeEasyPair = useMemo(() => roundDef.type === "rearrange_easy" ? [buildShortISliceData(roundDef.word)] : null, [roundIndex]); // eslint-disable-line

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
            {roundDef.type === "catch" && card && <CampaignLetterCatchRound key={`catch-${roundIndex}`} word={card.word} missingLetter={roundDef.missingLetter} image={card.image} audio={card.audio} onComplete={advance} onMistake={onMistake} lang={lang} paused={hintLocked} skipInitialAudio={suppressAutoPlay} />}
            {roundDef.type === "drag" && card && <Level1DragV2 key={`drag-${roundIndex}`} card={card} onComplete={advance} lang={lang} onMistake={onMistake} userPhotoUrl={userPhotoUrl} onClearPhoto={onClearPhoto} />}
            {roundDef.type === "identifying" && identifyingRound && <IdentifyingRound key={`id-${roundIndex}`} round={identifyingRound} onComplete={advance} lang={lang} onMistake={onMistake} userPhotoUrl={userPhotoUrl} onClearPhoto={onClearPhoto} />}
            {roundDef.type === "rearrange_easy" && rearrangeEasyPair && <PicSliceBoardEasy key={`re-${roundIndex}`} wordPair={rearrangeEasyPair} onRoundComplete={advance} lang={lang} onMistake={onMistake} />}
            {roundDef.type === "write" && card && <CampaignWriteRound key={`write-${roundIndex}`} card={card} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {hintLocked && <div style={LOCK_OVERLAY_STYLE} onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}