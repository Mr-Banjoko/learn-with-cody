/**
 * Level 1 — Introduce Batch A (first 3 words)
 * R1: phonics — cat  [guided tutorial, audio guide existing]
 * R2: drag    — cat  [drag hint, audio guide existing at roundIndex=1]
 * R3: phonics — dad
 * R4: drag    — dad
 * R5: phonics — rat
 * R6: drag    — rat
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import Level1Phonics from "./Level1Phonics";
import Level1DragV2 from "./Level1DragV2";
import LevelCompleteScreen from "./LevelCompleteScreen";
import { shortAWords } from "../../lib/shortAWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { useRoundHintAudio, getHintAudioUrl, LOCK_OVERLAY_STYLE } from "../../lib/useRoundHintAudio";
import { useUserPhoto } from "../../lib/useUserPhoto";

const LEVEL_NUM = 1;
const SCORED_ROUNDS = getScoredRounds("short-a", LEVEL_NUM);

const findWord = (w) => shortAWords.find((x) => x.word === w);

// R1 phonics cat (guided), R2 drag cat, R3 phonics dad, R4 drag dad, R5 phonics rat, R6 drag rat
const ROUNDS = [
  { type: "phonics", card: findWord("cat"), guided: true  },
  { type: "drag",    card: findWord("cat") },
  { type: "phonics", card: findWord("dad"), guided: false },
  { type: "drag",    card: findWord("dad") },
  { type: "phonics", card: findWord("rat"), guided: false },
  { type: "drag",    card: findWord("rat") },
];
const TOTAL_ROUNDS = ROUNDS.length;

function markComplete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][1] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function Level1({ onBack, lang = "en" }) {
  useState(() => { try { localStorage.removeItem("level1_tutorial_done"); } catch {} });
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const onMistake = useCallback(() => setMistakes((m) => m + 1), []);

  // Audio guide: only Round 2 (index 1) has drag hint; Round 1 phonics tutorial is internal
  const hintUrl = getHintAudioUrl(LEVEL_NUM, roundIndex, lang);
  // Round 2 (drag-cat): chain cat audio after hint
  const round2WordAudio = roundIndex === 1 ? (findWord("cat")?.audio || null) : null;
  const onHintComplete = useCallback((unlock) => {
    if (!round2WordAudio) { unlock(); return; }
    const audio = new Audio(round2WordAudio);
    audio.onended = unlock;
    audio.onerror = unlock;
    audio.play().catch(unlock);
  }, [round2WordAudio]);

  const [dragGuideStep, setDragGuideStep] = useState(-1); // -1 = not started
  const onHintCompleteWrapped = useCallback((unlock) => {
    onHintComplete((...args) => {
      setDragGuideStep(0); // start guide after audio finishes
      unlock(...args);
    });
  }, [onHintComplete]);

  const { locked: hintLocked } = useRoundHintAudio({
    url: hintUrl,
    onHintComplete: roundIndex === 1 ? onHintCompleteWrapped : undefined,
  });

  // Reset guide step when round changes
  const resetGuide = useCallback(() => setDragGuideStep(-1), []);

  const advance = useCallback(() => {
    resetGuide();
    const next = roundIndex + 1;
    if (next >= TOTAL_ROUNDS) {
      markComplete();
      const stars = calcStars(mistakes, SCORED_ROUNDS);
      saveLevelResult("short-a", LEVEL_NUM, stars, mistakes);
      setEarnedStars(stars);
      setDone(true);
    } else {
      setRoundIndex(next);
    }
  }, [roundIndex, mistakes]);

  const round = ROUNDS[roundIndex];
  const { photoUrl: userPhotoUrl, clearPhoto: onClearPhoto } = useUserPhoto(round?.card?.word);
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
                userPhotoUrl={userPhotoUrl}
                onClearPhoto={onClearPhoto}
              />
            )}
            {hintLocked && <div style={LOCK_OVERLAY_STYLE} onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}