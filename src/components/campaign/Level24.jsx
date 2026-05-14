/**
 * Level 24 — 5-round draw-a-line (missing letter = LAST letter of each word)
 * R1: gap(p), wax(x), tan(n)
 * R2: tax(x), dam(m), bag(g)
 * R3: tap(p), tag(g), gas(s)
 * R4: ham(m), mad(d), pat(t)
 * R5: can(n), map(p), mat(t)
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackArrow from "../BackArrow";
import DrawLineBoard from "../games/drawline/DrawLineBoard";
import LevelCompleteScreen from "./LevelCompleteScreen";
import HeartDisplay from "./HeartDisplay";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { shortAWords } from "../../lib/shortAWords";

const LEVEL_NUM = 24;
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

function buildLastLetterRound(wordNames) {
  const words = wordNames.map(findWord);
  const topCards = words.map((w, i) => ({
    ...w,
    targetLetter: w.word[w.word.length - 1],
    id: `card-${i}-${w.word}`,
  }));
  const letters = topCards.map((c) => ({ letter: c.targetLetter, topCardId: c.id }));
  let shuffled = shuffleArr(letters);
  let tries = 0;
  while (tries < 20 && shuffled.some((l, i) => l.topCardId === topCards[i].id)) {
    shuffled = shuffleArr(letters);
    tries++;
  }
  return { topCards, bottomLetters: shuffled };
}

const ROUND_SEQUENCE = [
  { words: ["gap", "wax", "tan"] },
  { words: ["tax", "dam", "bag"] },
  { words: ["tap", "tag", "gas"] },
  { words: ["ham", "mad", "pat"] },
  { words: ["can", "map", "mat"] },
];
const TOTAL_ROUNDS = ROUND_SEQUENCE.length;

function markComplete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][24] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function Level24({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const onMistake = useCallback(() => setMistakes((m) => m + 1), []);

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

  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;
  const drawLineRound = useMemo(
    () => buildLastLetterRound(ROUND_SEQUENCE[roundIndex].words),
    [roundIndex] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4, padding: "calc(env(safe-area-inset-top, 0px) + 8px) 16px 8px", borderBottom: "1.5px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.75)", backdropFilter: "blur(10px)" }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }}><p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1E293B" }}>{lang === "zh" ? "第 24 关" : "Level 24"}</p></div>
        <HeartDisplay mistakes={mistakes} size={54} />
      </div>
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
            <DrawLineBoard key={`drawline-${roundIndex}`} round={drawLineRound} onRoundComplete={advance} lang={lang} onMistake={onMistake} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}