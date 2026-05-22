/**
 * Short I — Level 6 — Missing Letter Intro
 * R1: missing01  — sit | S (INITIAL)  [audio guide]
 * R2: missing01  — pin | N (FINAL)
 * R3: drag       — tin
 * R4: connection — tip
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "../LevelHeader";
import CampaignMissingSound01Round from "../CampaignMissingSound01Round";
import Level1DragV2 from "../Level1DragV2";
import CampaignConnectionRound from "../CampaignConnectionRound";
import LevelCompleteScreen from "../LevelCompleteScreen";
import { buildWordData } from "../../../lib/picSliceGameData";
import { shortIWords } from "../../../lib/shortIWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../../lib/campaignPerformance";
import { useRoundHintAudio, LOCK_OVERLAY_STYLE } from "../../../lib/useRoundHintAudio";

const VOWEL_KEY = "short-i";
const LEVEL_NUM = 6;
const SCORED_ROUNDS = getScoredRounds(VOWEL_KEY, LEVEL_NUM);
const GH = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/letter_sound/levels";
const findWord = (w) => shortIWords.find((x) => x.word === w);

const ROUNDS = [
  { type: "missing01",  card: findWord("sit"), missingPos: 0 }, // S INITIAL
  { type: "missing01",  card: findWord("pin"), missingPos: 2 }, // N FINAL
  { type: "drag",       card: findWord("tin") },
  { type: "connection", word: "tip" },
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

export default function ShortILevel6({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const [hintDone, setHintDone] = useState(false);
  const onMistake = useCallback(() => setMistakes((m) => m + 1), []);

  // R1 (index 0): missing01 first appearance in Short I
  const hintUrl = roundIndex === 0
    ? `${GH}/missing_sound_hint/${lang === "zh" ? "chinese" : "english"}/hint.mp3`
    : null;
  const r1WordAudio = roundIndex === 0 ? (findWord("sit")?.audio || null) : null;
  const onHintComplete = useCallback((unlock) => {
    if (!r1WordAudio) { setHintDone(true); unlock(); return; }
    const audio = new Audio(r1WordAudio);
    audio.onended = () => { setHintDone(true); unlock(); };
    audio.onerror = () => { setHintDone(true); unlock(); };
    audio.play().catch(() => { setHintDone(true); unlock(); });
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

  const round = ROUNDS[roundIndex];
  const connectionCard = useMemo(() => round.type === "connection" ? buildWordData(round.word) : null, [roundIndex]); // eslint-disable-line
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
            {round.type === "missing01" && (
              <CampaignMissingSound01Round key={`m01-${roundIndex}`} card={round.card} forcedMissingPos={round.missingPos} onComplete={advance} onMistake={onMistake} lang={lang} suppressAutoPlay={roundIndex === 0} pulseCorrectLetter={roundIndex === 0 && hintDone} />
            )}
            {round.type === "drag" && <Level1DragV2 key={`drag-${roundIndex}`} card={round.card} onComplete={advance} lang={lang} onMistake={onMistake} />}
            {round.type === "connection" && connectionCard && <CampaignConnectionRound key={`conn-${roundIndex}`} card={connectionCard} onComplete={advance} lang={lang} onMistake={onMistake} />}
            {hintLocked && <div style={LOCK_OVERLAY_STYLE} onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}