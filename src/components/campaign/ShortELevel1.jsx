/**
 * Short E — Level 1 — Intro Batch A
 * R1: phonics — get [guided tutorial]
 * R2: drag    — get [audio guide]
 * R3: phonics — men
 * R4: drag    — men
 * R5: phonics — ten
 * R6: drag    — ten
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import Level1Phonics from "./Level1Phonics";
import Level1DragV2 from "./Level1DragV2";
import LevelCompleteScreen from "./LevelCompleteScreen";
import { shortEWords } from "../../lib/shortEWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { useRoundHintAudio, LOCK_OVERLAY_STYLE } from "../../lib/useRoundHintAudio";

const VOWEL_KEY = "short-e";
const LEVEL_NUM = 1;
const SCORED_ROUNDS = getScoredRounds(VOWEL_KEY, LEVEL_NUM);
const GH = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/letter_sound/levels";
const findWord = (w) => shortEWords.find((x) => x.word === w);

const ROUNDS = [
  { type: "phonics", card: findWord("get"), guided: true },
  { type: "drag",    card: findWord("get") },
  { type: "phonics", card: findWord("men") },
  { type: "drag",    card: findWord("men") },
  { type: "phonics", card: findWord("ten") },
  { type: "drag",    card: findWord("ten") },
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

export default function ShortELevel1({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const [dragGuideStep, setDragGuideStep] = useState(-1);
  const onMistake = useCallback(() => setMistakes((m) => m + 1), []);

  // R2 (index 1): drag hint audio + chain word audio
  const hintUrl = roundIndex === 1 ? `${GH}/letter_drag_hint/${lang === "zh" ? "chinese" : "english"}/hint%203.mp3` : null;
  const r2WordAudio = roundIndex === 1 ? (findWord("get")?.audio || null) : null;
  const onHintComplete = useCallback((unlock) => {
    if (!r2WordAudio) { unlock(); return; }
    const audio = new Audio(r2WordAudio);
    audio.onended = unlock;
    audio.onerror = unlock;
    audio.play().catch(unlock);
  }, [r2WordAudio]);

  const onHintCompleteWrapped = useCallback((unlock) => {
    onHintComplete((...args) => {
      setDragGuideStep(0);
      unlock(...args);
    });
  }, [onHintComplete]);

  const { locked: hintLocked } = useRoundHintAudio({
    url: hintUrl,
    onHintComplete: roundIndex === 1 ? onHintCompleteWrapped : undefined,
  });

  const advance = useCallback(() => {
    setDragGuideStep(-1);
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
            {round.type === "phonics" ? (
              <Level1Phonics card={round.card} onNext={advance} lang={lang} isFirstCard={round.guided === true} />
            ) : (
              <Level1DragV2
                card={round.card}
                onComplete={advance}
                lang={lang}
                onMistake={onMistake}
                suppressAutoPlay={roundIndex === 1}
                dragGuideStep={roundIndex === 1 ? dragGuideStep : -1}
                onDragGuideAdvance={roundIndex === 1 ? () => setDragGuideStep((s) => s + 1) : undefined}
              />
            )}
            {hintLocked && <div style={LOCK_OVERLAY_STYLE} onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}