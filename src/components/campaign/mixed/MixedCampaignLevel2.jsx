/**
 * MixedCampaignLevel2 — First Mixed Word Listening
 * R1: word_to_audio — cat (target) / bed / pig
 * R2: word_to_audio — pen (target) / pin / pot
 * R3: word_to_audio — pig (target) / peg / pug
 * R4: word_to_audio — dog (target) / dig / mud   (dug not approved → mud)
 * R5: word_to_audio — cup (target) / cop / cub
 * R6: identifying   — dad (target) / bed / fin / mug
 *
 * word_to_audio accepts exactly 3 words (target + 2 distractors).
 * identifying uses target + 2 distractors (3 total choices).
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "../LevelHeader";
import LevelCompleteScreen from "../LevelCompleteScreen";
import CampaignWordToAudioRound from "../CampaignWordToAudioRound";
import IdentifyingRound from "../../games/IdentifyingRound";
import { calcStars, saveLevelResult } from "../../../lib/campaignPerformance";
import { useRoundHintAudio, LOCK_OVERLAY_STYLE } from "../../../lib/useRoundHintAudio";
import { shortAWords } from "../../../lib/shortAWords";
import { shortEWords } from "../../../lib/shortEWords";
import { shortIWords } from "../../../lib/shortIWords";
import { shortOWords } from "../../../lib/shortOWords";
import { shortUWords } from "../../../lib/shortUWords";
import { useUserPhoto } from "../../../lib/useUserPhoto";

const LEVEL_NUM = 2;
const VOWEL_KEY = "mixed";
const SCORED_ROUNDS = 6;

const ALL_WORDS = [...shortAWords, ...shortEWords, ...shortIWords, ...shortOWords, ...shortUWords];
const findCard = (w) => ALL_WORDS.find((x) => x.word === w) || { word: w, audio: null, image: null };

const ROUND_SEQUENCE = [
  { type: "word_to_audio", words: ["cat", "bed", "pig"] },
  { type: "word_to_audio", words: ["pen", "pin", "pot"] },
  { type: "word_to_audio", words: ["pig", "peg", "pug"] },
  { type: "word_to_audio", words: ["dog", "dig", "mud"] },
  { type: "word_to_audio", words: ["cup", "cop", "cub"] },
  { type: "identifying",   target: "dad", options: ["dad", "bed", "fin"] },
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

export default function MixedCampaignLevel2({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const onMistake = useCallback(() => setMistakes((m) => m + 1), []);

  const { locked: hintLocked, suppressAutoPlay } = useRoundHintAudio({ url: null });

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

  const identifyingRound = useMemo(() => {
    if (roundDef.type !== "identifying") return null;
    const target = findCard(roundDef.target);
    const choices = roundDef.options.map(findCard);
    // Shuffle choices
    const shuffled = [...choices].sort(() => Math.random() - 0.5);
    return { target, choices: shuffled };
  }, [roundIndex]); // eslint-disable-line

  const { photoUrl: userPhotoUrl, clearPhoto: onClearPhoto } = useUserPhoto(
    roundDef.type === "identifying" ? roundDef.target : null
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFF8 0%, #FFF9E6 60%, #E8F4FF 100%)", overflow: "hidden" }}>
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} lang={lang} vowelKey="mixed" gameType={roundDef.type} />
      {!done && (
        <div style={{ height: 6, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
          <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #FF6B6B, #FFD93D, #4ECDC4, #9B5DE5)" }} />
        </div>
      )}
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <LevelCompleteScreen levelNum={LEVEL_NUM} stars={earnedStars} mistakes={mistakes} onBack={onBack} lang={lang} />
          </motion.div>
        ) : (
          <motion.div key={`round-${roundIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {roundDef.type === "word_to_audio" && (
              <CampaignWordToAudioRound key={`wta-${roundIndex}`} words={roundDef.words} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {roundDef.type === "identifying" && identifyingRound && (
              <IdentifyingRound key={`id-${roundIndex}`} round={identifyingRound} onComplete={advance} lang={lang} onMistake={onMistake} suppressAutoPlay={suppressAutoPlay} userPhotoUrl={userPhotoUrl} onClearPhoto={onClearPhoto} />
            )}
            {hintLocked && <div style={LOCK_OVERLAY_STYLE} onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}