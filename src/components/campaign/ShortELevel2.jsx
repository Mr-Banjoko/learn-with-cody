/**
 * Short E — Level 2 — Finish Batch A + Missing Letter intro
 * R1: phonics    — red
 * R2: drag       — red
 * R3: missing01  — get | G (INITIAL) [audio guide]
 * R4: missing01  — men | N (FINAL)
 * R5: missing01  — ten | E (MEDIAL)
 * R6: missing01  — red | R (INITIAL)
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import Level6Phonics from "./Level6Phonics";
import Level1DragV2 from "./Level1DragV2";
import CampaignMissingSound01Round from "./CampaignMissingSound01Round";
import LevelCompleteScreen from "./LevelCompleteScreen";
import { shortEWords } from "../../lib/shortEWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { useRoundHintAudio, LOCK_OVERLAY_STYLE } from "../../lib/useRoundHintAudio";

const VOWEL_KEY = "short-e";
const LEVEL_NUM = 2;
const SCORED_ROUNDS = getScoredRounds(VOWEL_KEY, LEVEL_NUM);
const GH = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/letter_sound/levels";
const findWord = (w) => shortEWords.find((x) => x.word === w);

const ROUNDS = [
  { type: "phonics",   card: findWord("red") },
  { type: "drag",      card: findWord("red") },
  { type: "missing01", card: findWord("get"), missingPos: 0 }, // G INITIAL
  { type: "missing01", card: findWord("men"), missingPos: 2 }, // N FINAL
  { type: "missing01", card: findWord("ten"), missingPos: 1 }, // E MEDIAL
  { type: "missing01", card: findWord("red"), missingPos: 0 }, // R INITIAL
];
const TOTAL_ROUNDS = ROUNDS.length;

function markComplete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data[VOWEL_KEY]) data[VOWEL_KEY] = {};
    data[VOWEL_KEY][LEVEL_NUM] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function ShortELevel2({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const [r3HintDone, setR3HintDone] = useState(false);
  const onMistake = useCallback(() => setMistakes((m) => m + 1), []);

  // R3 (index 2): missing01 first appearance — audio guide + chain word audio
  const hintUrl = roundIndex === 2 ? `${GH}/missing_sound_hint/${lang === "zh" ? "chinese" : "english"}/hint.mp3` : null;
  const r3WordAudio = roundIndex === 2 ? (findWord("get")?.audio || null) : null;
  const onHintComplete = useCallback((unlock) => {
    if (!r3WordAudio) { setR3HintDone(true); unlock(); return; }
    const audio = new Audio(r3WordAudio);
    audio.onended = () => { setR3HintDone(true); unlock(); };
    audio.onerror = () => { setR3HintDone(true); unlock(); };
    audio.play().catch(() => { setR3HintDone(true); unlock(); });
  }, [r3WordAudio]);

  const { locked: hintLocked } = useRoundHintAudio({
    url: hintUrl,
    onHintComplete: roundIndex === 2 ? onHintComplete : undefined,
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

  const round = ROUNDS[roundIndex];
  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} lang={lang} gameType={round?.type} />
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
            {round.type === "phonics" && <Level6Phonics card={round.card} onNext={advance} lang={lang} />}
            {round.type === "drag" && <Level1DragV2 key={`drag-${roundIndex}`} card={round.card} onComplete={advance} lang={lang} onMistake={onMistake} />}
            {round.type === "missing01" && (
              <CampaignMissingSound01Round
                key={`missing-${roundIndex}`}
                card={round.card}
                forcedMissingPos={round.missingPos}
                onComplete={advance}
                onMistake={onMistake}
                lang={lang}
                suppressAutoPlay={roundIndex === 2}
                pulseCorrectLetter={roundIndex === 2 && r3HintDone}
              />
            )}
            {hintLocked && <div style={LOCK_OVERLAY_STYLE} onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}