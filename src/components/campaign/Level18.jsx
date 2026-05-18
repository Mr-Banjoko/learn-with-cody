/**
 * Level 18 — 5-round mixed: Draw a Line + Drag the Letters V2
 *
 * Round order:
 *  1. Draw a Line — gas (g), jar (j), tag (t)
 *  2. Draw a Line — sat (s), pat (p), mat (m)
 *  3. Drag the Letters V2 — tag
 *  4. Draw a Line — tap (t), bag (b), hat (h)
 *  5. Drag the Letters V2 — jar
 *
 * Missing letters are the first letter of each word.
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import DrawLineBoard from "../games/drawline/DrawLineBoard";
import Level1DragV2 from "./Level1DragV2";
import LevelCompleteScreen from "./LevelCompleteScreen";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { useRoundHintAudio, getHintAudioUrl, LOCK_OVERLAY_STYLE } from "../../lib/useRoundHintAudio";
import { shortAWords } from "../../lib/shortAWords";

const LEVEL_NUM = 18;
const SCORED_ROUNDS = getScoredRounds("short-a", LEVEL_NUM);

const findWord = (w) => shortAWords.find((x) => x.word === w);

function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildFixedDrawLineRound(wordNames) {
  const words = wordNames.map(findWord);
  const topCards = words.map((w, i) => ({
    ...w,
    targetLetter: w.word[0],
    id: `card-${i}-${w.word}`,
  }));
  const letters = topCards.map((c) => ({ letter: c.targetLetter, topCardId: c.id }));
  let shuffledLetters = shuffleArr(letters);
  let tries = 0;
  while (tries < 20 && shuffledLetters.some((l, i) => l.topCardId === topCards[i].id)) {
    shuffledLetters = shuffleArr(letters);
    tries++;
  }
  return { topCards, bottomLetters: shuffledLetters };
}

const ROUND_SEQUENCE = [
  { type: "drawline", words: ["gas", "jar", "tag"] }, // R1
  { type: "drawline", words: ["sat", "pat", "mat"] }, // R2
  { type: "drag",     word:  "tag"                 }, // R3
  { type: "drawline", words: ["tap", "bag", "hat"] }, // R4
  { type: "drag",     word:  "jar"                 }, // R5
];

const TOTAL_ROUNDS = ROUND_SEQUENCE.length;

function markLevel18Complete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][18] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function Level18({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const onMistake = useCallback(() => setMistakes((m) => m + 1), []);
  // Round 1 is a DrawLineBoard (3-word, no single word audio) — just unlock after hint
  const onHintComplete = useCallback((unlock) => { unlock(); }, []);

  const hintUrl = getHintAudioUrl(18, roundIndex, lang);
  const { locked: hintLocked } = useRoundHintAudio({
    url: hintUrl,
    onHintComplete: roundIndex === 0 ? onHintComplete : undefined,
  });

  const advance = useCallback(() => {
    const next = roundIndex + 1;
    if (next >= TOTAL_ROUNDS) {
      markLevel18Complete();
      const stars = calcStars(mistakes, SCORED_ROUNDS);
      saveLevelResult("short-a", LEVEL_NUM, stars, mistakes);
      setEarnedStars(stars);
      setDone(true);
    } else {
      setRoundIndex(next);
    }
  }, [roundIndex, mistakes]);

  const roundDef = ROUND_SEQUENCE[roundIndex];
  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;

  const drawLineRound = useMemo(() => {
    if (!roundDef || roundDef.type !== "drawline") return null;
    return buildFixedDrawLineRound(roundDef.words);
  }, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const dragCard = useMemo(() => {
    if (!roundDef || roundDef.type !== "drag") return null;
    return findWord(roundDef.word);
  }, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} lang={lang} />

      {/* Progress bar */}
      {!done && (
        <div style={{ height: 6, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
          <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #4ECDC4, #4D96FF)" }} />
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <LevelCompleteScreen levelNum={LEVEL_NUM} stars={earnedStars} mistakes={mistakes} onBack={onBack} lang={lang} />
          </motion.div>
        ) : (
          <motion.div key={`round-${roundIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {roundDef.type === "drawline" && drawLineRound && (
              <DrawLineBoard key={`drawline-${roundIndex}`} round={drawLineRound} onRoundComplete={advance} lang={lang} onMistake={onMistake} />
            )}
            {roundDef.type === "drag" && dragCard && (
              <Level1DragV2 key={`drag-${roundIndex}`} card={dragCard} onComplete={advance} lang={lang} onMistake={onMistake} />
            )}
            {hintLocked && <div style={LOCK_OVERLAY_STYLE} onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}