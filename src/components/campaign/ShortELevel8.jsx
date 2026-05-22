/**
 * Short E — Level 8 — Arcade + Logic
 * R1: catch         — pen | P (INITIAL) [audio guide]
 * R2: catch         — net | T (FINAL)
 * R3: rearrange_easy — fed [audio guide]
 * R4: rearrange_easy — leg
 * R5: catch         — pet | E (MEDIAL)
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import CampaignLetterCatchRound from "./CampaignLetterCatchRound";
import PicSliceBoardEasy from "../games/PicSliceBoardEasy";
import LevelCompleteScreen from "./LevelCompleteScreen";
import { buildWordData } from "../../lib/picSliceGameData";
import { shortEWords } from "../../lib/shortEWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { useRoundHintAudio, LOCK_OVERLAY_STYLE } from "../../lib/useRoundHintAudio";

const VOWEL_KEY = "short-e";
const LEVEL_NUM = 8;
const SCORED_ROUNDS = getScoredRounds(VOWEL_KEY, LEVEL_NUM);
const GH = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/letter_sound/levels";
const findWord = (w) => shortEWords.find((x) => x.word === w);

const ROUND_SEQUENCE = [
  { type: "catch",         word: "pen", missingLetter: "p" }, // P INITIAL
  { type: "catch",         word: "net", missingLetter: "t" }, // T FINAL
  { type: "rearrange_easy",word: "fed" },
  { type: "rearrange_easy",word: "leg" },
  { type: "catch",         word: "pet", missingLetter: "e" }, // E MEDIAL
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

export default function ShortELevel8({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const onMistake = useCallback(() => setMistakes((m) => m + 1), []);

  // R1 (index 0): catch guide; R3 (index 2): rearrange_easy guide
  const hintUrl = roundIndex === 0
    ? `${GH}/catch_the_letter_hint/${lang === "zh" ? "chinese" : "english"}/hint.mp3`
    : roundIndex === 2
    ? `${GH}/rearrange_the_picture_hint/${lang === "zh" ? "chinese" : "english%20"}/hint.mp3`
    : null;

  const guideWord = roundIndex === 0 ? "pen" : roundIndex === 2 ? "fed" : null;
  const guideWordAudio = guideWord ? (findWord(guideWord)?.audio || null) : null;
  const onHintComplete = useCallback((unlock) => {
    if (!guideWordAudio) { unlock(); return; }
    const audio = new Audio(guideWordAudio);
    audio.onended = unlock;
    audio.onerror = unlock;
    audio.play().catch(unlock);
  }, [guideWordAudio]);

  const { locked: hintLocked } = useRoundHintAudio({
    url: hintUrl,
    onHintComplete: (roundIndex === 0 || roundIndex === 2) ? onHintComplete : undefined,
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

  const roundDef = ROUND_SEQUENCE[roundIndex];
  const rearrangeWordPair = useMemo(() => roundDef.type === "rearrange_easy" ? [buildWordData(roundDef.word)] : null, [roundIndex]); // eslint-disable-line
  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} lang={lang} gameType={roundDef?.type === "rearrange_easy" ? "rearrange" : roundDef?.type} />
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
            {roundDef.type === "catch" && (
              <CampaignLetterCatchRound
                key={`catch-${roundIndex}`}
                word={roundDef.word}
                missingLetter={roundDef.missingLetter}
                image={findWord(roundDef.word)?.image}
                audio={findWord(roundDef.word)?.audio}
                onComplete={advance}
                onMistake={onMistake}
                lang={lang}
                paused={hintLocked}
                skipInitialAudio={roundIndex === 0}
              />
            )}
            {roundDef.type === "rearrange_easy" && rearrangeWordPair && (
              <PicSliceBoardEasy
                key={`re-${roundIndex}`}
                wordPair={rearrangeWordPair}
                onRoundComplete={advance}
                lang={lang}
                onMistake={onMistake}
                suppressAutoPlay={roundIndex === 2}
              />
            )}
            {hintLocked && <div style={LOCK_OVERLAY_STYLE} onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}