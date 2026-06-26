/**
 * MixedCampaignLevel4 — First Mixed Identifying
 * R1: identifying — hat   (target) / bed / pig / dog
 * R2: identifying — hen   (target) / hit / hot / hut
 * R3: identifying — fin   (target) / fun / fog / men   (fan not approved → skip, use fun/fog/men)
 * R4: identifying — mop   (target) / mug / men / mud   (map not approved for this list → use mug/men/mud)
 * R5: identifying — sun   (target) / sit / sob / sum
 * R6: word_match  — bat   (target) / bet / bit / bot / but  (fake vowel trap words)
 *
 * Note: identifying accepts exactly 3 choices total (target + 2 distractors).
 * word_match uses fake CVC words with swapped vowels — audio: null for fakes.
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "../LevelHeader";
import LevelCompleteScreen from "../LevelCompleteScreen";
import IdentifyingRound from "../../games/IdentifyingRound";
import CampaignWordMatchRound from "../CampaignWordMatchRound";
import { calcStars, saveLevelResult } from "../../../lib/campaignPerformance";
import { useRoundHintAudio, LOCK_OVERLAY_STYLE } from "../../../lib/useRoundHintAudio";
import { useUserPhoto } from "../../../lib/useUserPhoto";
import { shortAWords } from "../../../lib/shortAWords";
import { shortEWords } from "../../../lib/shortEWords";
import { shortIWords } from "../../../lib/shortIWords";
import { shortOWords } from "../../../lib/shortOWords";
import { shortUWords } from "../../../lib/shortUWords";

const LEVEL_NUM = 4;
const VOWEL_KEY = "mixed";
const SCORED_ROUNDS = 6;

const ALL_WORDS = [...shortAWords, ...shortEWords, ...shortIWords, ...shortOWords, ...shortUWords];
const findCard = (w) => ALL_WORDS.find((x) => x.word === w) || { word: w, audio: null, image: null };
function fakeCard(word) { return { word, audio: null, image: null }; }

const ROUND_SEQUENCE = [
  { type: "identifying", target: "hat",  options: ["hat", "bed", "pig"] },
  { type: "identifying", target: "hen",  options: ["hen", "hit", "hut"] },
  { type: "identifying", target: "fin",  options: ["fin", "fun", "fog"] },
  { type: "identifying", target: "mop",  options: ["mop", "mug", "mud"] },
  { type: "identifying", target: "sun",  options: ["sun", "sit", "sob"] },
  {
    type: "word_match",
    target: "bat",
    // fake vowel-trap options: bat + swapped vowels bet/bit/bot/but (one real + fakes)
    choices: [
      { word: "bat", audio: null, image: null, _real: true },
      { word: "bet", audio: null, image: null },
      { word: "bit", audio: null, image: null },
      { word: "bot", audio: null, image: null },
      { word: "but", audio: null, image: null },
    ],
  },
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

export default function MixedCampaignLevel4({ onBack, lang = "en" }) {
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
    const choices = [...roundDef.options.map(findCard)].sort(() => Math.random() - 0.5);
    return { target, choices };
  }, [roundIndex]); // eslint-disable-line

  // word_match: real bat card + fake distractors shuffled
  const wordMatchCard = useMemo(() => {
    if (roundDef.type !== "word_match") return null;
    return findCard(roundDef.target);
  }, [roundIndex]); // eslint-disable-line

  const wordMatchChoices = useMemo(() => {
    if (roundDef.type !== "word_match") return null;
    return [...roundDef.choices].sort(() => Math.random() - 0.5);
  }, [roundIndex]); // eslint-disable-line

  const { photoUrl: userPhotoUrl, clearPhoto: onClearPhoto } = useUserPhoto(
    roundDef.type === "identifying" ? roundDef.target :
    roundDef.type === "word_match"  ? roundDef.target : null
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
            {roundDef.type === "identifying" && identifyingRound && (
              <IdentifyingRound key={`id-${roundIndex}`} round={identifyingRound} onComplete={advance} lang={lang} onMistake={onMistake} suppressAutoPlay={suppressAutoPlay} userPhotoUrl={userPhotoUrl} onClearPhoto={onClearPhoto} />
            )}
            {roundDef.type === "word_match" && wordMatchCard && wordMatchChoices && (
              <CampaignWordMatchRound key={`wm-${roundIndex}`} card={wordMatchCard} overrideChoices={wordMatchChoices} onComplete={advance} onMistake={onMistake} lang={lang} suppressAutoPlay={suppressAutoPlay} userPhotoUrl={userPhotoUrl} onClearPhoto={onClearPhoto} />
            )}
            {hintLocked && <div style={LOCK_OVERLAY_STYLE} onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}