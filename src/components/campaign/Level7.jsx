/**
 * Level 7 — 5-round Letter Catch (difficult mode)
 * Words: can → pan → jam → map → mat
 * Missing letters: c, n, a, m, a
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import LevelCompleteScreen from "./LevelCompleteScreen";
import CampaignLetterCatchRound from "./CampaignLetterCatchRound";
import { shortAWords } from "../../lib/shortAWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { useRoundHintAudio, getHintAudioUrl, LOCK_OVERLAY_STYLE } from "../../lib/useRoundHintAudio";

const LEVEL_NUM = 7;
const SCORED_ROUNDS = getScoredRounds("short-a", LEVEL_NUM);

const ROUND_DEFS = [
  { word: "can", missingLetter: "c" },
  { word: "pan", missingLetter: "n" },
  { word: "jam", missingLetter: "a" },
  { word: "map", missingLetter: "m" },
  { word: "mat", missingLetter: "a" },
];

const TOTAL_ROUNDS = ROUND_DEFS.length;

function findWord(name) {
  return shortAWords.find((w) => w.word === name) || { word: name, image: "", audio: "" };
}

function markLevel7Complete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][7] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function Level7({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const onMistake = useCallback(() => setMistakes((m) => m + 1), []);

  // For round 0 (Round 1): chain word audio after hint audio, keep game paused until both finish
  const wordAudioUrl = roundIndex === 0 ? (findWord(ROUND_DEFS[0].word)?.audio || null) : null;
  const onHintComplete = useCallback((unlock) => {
    if (!wordAudioUrl) { unlock(); return; }
    const audio = new Audio(wordAudioUrl);
    audio.onended = unlock;
    audio.onerror = unlock;
    audio.play().catch(unlock);
  }, [wordAudioUrl]);

  const hintUrl = getHintAudioUrl(7, roundIndex, lang);
  const { locked: hintLocked } = useRoundHintAudio({
    url: hintUrl,
    onHintComplete: roundIndex === 0 ? onHintComplete : undefined,
  });

  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;

  const advance = useCallback(() => {
    const next = roundIndex + 1;
    if (next >= TOTAL_ROUNDS) {
      markLevel7Complete();
      const stars = calcStars(mistakes, SCORED_ROUNDS);
      saveLevelResult("short-a", LEVEL_NUM, stars, mistakes);
      setEarnedStars(stars);
      setDone(true);
    } else {
      setRoundIndex(next);
    }
  }, [roundIndex, mistakes]);

  const roundDef = ROUND_DEFS[roundIndex];
  const wordData = findWord(roundDef.word);

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      fontFamily: "Fredoka, sans-serif",
      background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
      overflow: "hidden",
    }}>
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} lang={lang} />

      {!done && (
        <div style={{ height: 6, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
          <motion.div
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4 }}
            style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #4ECDC4, #4D96FF)" }}
          />
        </div>
      )}

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            <LevelCompleteScreen levelNum={LEVEL_NUM} stars={earnedStars} mistakes={mistakes} onBack={onBack} lang={lang} />
          </motion.div>
        ) : (
          <motion.div
            key={`round-${roundIndex}`}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.22 }}
            style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            <CampaignLetterCatchRound
              key={`catch-${roundIndex}`}
              word={roundDef.word}
              missingLetter={roundDef.missingLetter}
              image={wordData.image}
              audio={wordData.audio}
              onComplete={advance}
              onMistake={onMistake}
              lang={lang}
              paused={hintLocked}
              skipInitialAudio={roundIndex === 0}
            />
            {hintLocked && <div style={LOCK_OVERLAY_STYLE} onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}