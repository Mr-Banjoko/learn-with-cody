/**
 * Short E — Level 19 — Advanced Audio (A vs E Contrast)
 * R1: word_to_audio — pen  | choices: pen, pan, ten  [audio guide]
 * R2: word_to_audio — bed  | choices: bed, bad, red
 * R3: word_to_audio — men  | choices: men, man, hen
 * R4: word_to_audio — fed  | choices: fed, fad, bed
 * R5: word_to_audio — gem  | choices: gem, jam, hem
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "../LevelHeader";
import CampaignWordToAudioRound from "../CampaignWordToAudioRound";
import LevelCompleteScreen from "../LevelCompleteScreen";
import { calcStars, saveLevelResult, getScoredRounds } from "../../../lib/campaignPerformance";
import { useRoundHintAudio, LOCK_OVERLAY_STYLE } from "../../../lib/useRoundHintAudio";
import { shortEWords } from "../../../lib/shortEWords";

const VOWEL_KEY = "short-e";
const LEVEL_NUM = 19;
const SCORED_ROUNDS = getScoredRounds(VOWEL_KEY, LEVEL_NUM);
const GH = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/letter_sound/levels";
const findWord = (w) => shortEWords.find((x) => x.word === w);

// First word in each array = target
const ROUND_DEFS = [
  ["pen", "pan", "ten"],
  ["bed", "bad", "red"],
  ["men", "man", "hen"],
  ["fed", "fad", "bed"],
  ["gem", "jam", "hem"],
];
const TOTAL_ROUNDS = ROUND_DEFS.length;

function markComplete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data[VOWEL_KEY]) data[VOWEL_KEY] = {};
    data[VOWEL_KEY][LEVEL_NUM] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function ShortELevel19({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const onMistake = useCallback(() => setMistakes((m) => m + 1), []);

  const hintUrl = roundIndex === 0
    ? `${GH}/word%20match/${lang === "zh" ? "chinese" : "english"}/hint.mp3`
    : null;
  const r1WordAudio = roundIndex === 0 ? (findWord("pen")?.audio || null) : null;
  const onHintComplete = useCallback((unlock) => {
    if (!r1WordAudio) { unlock(); return; }
    const audio = new Audio(r1WordAudio);
    audio.onended = unlock;
    audio.onerror = unlock;
    audio.play().catch(unlock);
  }, [r1WordAudio]);

  const { locked: hintLocked } = useRoundHintAudio({
    url: hintUrl,
    onHintComplete: roundIndex === 0 ? onHintComplete : undefined,
  });

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

  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} lang={lang} gameType="word_to_audio" />
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
            <CampaignWordToAudioRound key={`audio-${roundIndex}`} words={ROUND_DEFS[roundIndex]} onComplete={advance} onMistake={onMistake} lang={lang} />
            {hintLocked && <div style={LOCK_OVERLAY_STYLE} onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}