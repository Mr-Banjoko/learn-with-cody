/**
 * Short E — Level 12 — Spelling Intro
 * R1: writev2 — pen  [audio guide]
 * R2: writev2 — leg
 * R3: writev2 — net
 * R4: writev2 — ten
 * R5: writev2 — red
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "../LevelHeader";
import WriteV2CampaignRound from "../WriteV2CampaignRound";
import LevelCompleteScreen from "../LevelCompleteScreen";
import { shortEWords } from "../../../lib/shortEWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../../lib/campaignPerformance";
import { useRoundHintAudio, LOCK_OVERLAY_STYLE } from "../../../lib/useRoundHintAudio";

const VOWEL_KEY = "short-e";
const LEVEL_NUM = 12;
const SCORED_ROUNDS = getScoredRounds(VOWEL_KEY, LEVEL_NUM);
const GH = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/letter_sound/levels";
const findWord = (w) => shortEWords.find((x) => x.word === w);

const WORD_ORDER = ["pen", "leg", "net", "ten", "red"];
const TOTAL_ROUNDS = WORD_ORDER.length;

function markComplete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data[VOWEL_KEY]) data[VOWEL_KEY] = {};
    data[VOWEL_KEY][LEVEL_NUM] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function ShortELevel12({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const onMistake = useCallback(() => setMistakes((m) => m + 1), []);

  const hintUrl = roundIndex === 0
    ? `${GH}/write_v2_hint/${lang === "zh" ? "chinese" : "english"}/hint.mp3`
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
            <WriteV2CampaignRound key={`writev2-${roundIndex}`} card={card} onComplete={advance} onMistake={onMistake} lang={lang} />
            {hintLocked && <div style={LOCK_OVERLAY_STYLE} onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}