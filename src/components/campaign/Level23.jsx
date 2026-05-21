/**
 * Level 23 — Spell-Tap Intro (writev2)
 * R1: writev2 — gap  [first appearance — audio guide]
 * R2: writev2 — wax
 * R3: writev2 — tan
 * R4: writev2 — tax
 * R5: writev2 — dam
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import WriteV2CampaignRound from "./WriteV2CampaignRound";
import LevelCompleteScreen from "./LevelCompleteScreen";
import { shortAWords } from "../../lib/shortAWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { useRoundHintAudio, getHintAudioUrl, LOCK_OVERLAY_STYLE } from "../../lib/useRoundHintAudio";

const LEVEL_NUM = 23;
const SCORED_ROUNDS = getScoredRounds("short-a", LEVEL_NUM);
const WORD_ORDER = ["gap", "wax", "tan", "tax", "dam"];
const TOTAL_ROUNDS = WORD_ORDER.length;
const findWord = (w) => shortAWords.find((x) => x.word === w);

function markComplete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][LEVEL_NUM] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function Level23({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const onMistake = useCallback(() => setMistakes((m) => m + 1), []);

  // R1 (index 0): writev2 first appearance — audio guide + chain word audio
  const hintUrl = getHintAudioUrl(LEVEL_NUM, roundIndex, lang);
  const r1WordAudio = roundIndex === 0 ? (findWord(WORD_ORDER[0])?.audio || null) : null;
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
      saveLevelResult("short-a", LEVEL_NUM, stars, mistakes);
      setEarnedStars(stars);
      setDone(true);
    } else {
      setRoundIndex(next);
    }
  }, [roundIndex, mistakes]);

  const card = useMemo(() => findWord(WORD_ORDER[roundIndex]), [roundIndex]); // eslint-disable-line
  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} lang={lang} gameType="writev2" />
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
            {card && (
              <WriteV2CampaignRound key={`writev2-${roundIndex}`} card={card} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {hintLocked && <div style={LOCK_OVERLAY_STYLE} onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}