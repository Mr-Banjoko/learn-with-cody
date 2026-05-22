/**
 * Short I — Level 7 — Drawline Early Intro (ALL INITIAL)
 * R1: drawline ALL INITIAL — sit(S), sip(S), six(S)  [audio guide]
 * R2: identifying — win
 * R3: drag        — kid
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "../LevelHeader";
import DrawLineBoard from "../../games/drawline/DrawLineBoard";
import IdentifyingRound from "../../games/IdentifyingRound";
import Level1DragV2 from "../Level1DragV2";
import LevelCompleteScreen from "../LevelCompleteScreen";
import { shortIWords } from "../../../lib/shortIWords";
import { shortAWords } from "../../../lib/shortAWords";
import { shortEWords } from "../../../lib/shortEWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../../lib/campaignPerformance";
import { useRoundHintAudio, LOCK_OVERLAY_STYLE } from "../../../lib/useRoundHintAudio";

const VOWEL_KEY = "short-i";
const LEVEL_NUM = 7;
const SCORED_ROUNDS = getScoredRounds(VOWEL_KEY, LEVEL_NUM);
const GH = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/letter_sound/levels";
const findWord = (w) => shortIWords.find((x) => x.word === w);
const ALL_WORDS = [...shortIWords, ...shortAWords, ...shortEWords];

const DRAWLINE_DEF = {
  positionType: "initial",
  words: [
    { word: "sit", targetLetter: "s" },
    { word: "sip", targetLetter: "s" },
    { word: "six", targetLetter: "s" },
  ],
};

function buildDrawLineRound(def) {
  const topCards = def.words.map((w, i) => ({
    ...findWord(w.word),
    targetLetter: w.targetLetter,
    positionType: def.positionType,
    id: `card-${i}-${w.word}-${w.targetLetter}`,
  }));
  const bottomLetters = topCards.map((c, i) => ({ letter: c.targetLetter, topCardId: c.id, botIdx: i }));
  return { topCards, bottomLetters };
}

function buildIdentifying(word) {
  const target = findWord(word);
  const pool = ALL_WORDS.filter((w) => w.word !== word);
  const choices = [target, ...[...pool].sort(() => Math.random() - 0.5).slice(0, 2)].sort(() => Math.random() - 0.5);
  return { target, choices };
}

const ROUNDS = [
  { type: "drawline" },
  { type: "identifying", word: "win" },
  { type: "drag",        card: findWord("kid") },
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

export default function ShortILevel7({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const onMistake = useCallback(() => setMistakes((m) => m + 1), []);

  // R1 (index 0): drawline first appearance in Short I
  const hintUrl = roundIndex === 0
    ? `${GH}/draw_a_line_hint/${lang === "zh" ? "chinese" : "english"}/hint.mp3`
    : null;
  const onHintComplete = useCallback((unlock) => { unlock(); }, []);

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
  const drawLineRound = useMemo(() => round.type === "drawline" ? buildDrawLineRound(DRAWLINE_DEF) : null, [roundIndex]); // eslint-disable-line
  const identifyingRound = useMemo(() => round.type === "identifying" ? buildIdentifying(round.word) : null, [roundIndex]); // eslint-disable-line
  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} lang={lang} gameType={round.type === "drawline" ? "drawline" : round.type} />
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
            {round.type === "drawline" && drawLineRound && <DrawLineBoard key="dl-0" round={drawLineRound} onRoundComplete={advance} lang={lang} onMistake={onMistake} />}
            {round.type === "identifying" && identifyingRound && <IdentifyingRound key={roundIndex} round={identifyingRound} onComplete={advance} lang={lang} onMistake={onMistake} />}
            {round.type === "drag" && <Level1DragV2 key={`drag-${roundIndex}`} card={round.card} onComplete={advance} lang={lang} onMistake={onMistake} />}
            {hintLocked && <div style={LOCK_OVERLAY_STYLE} onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}