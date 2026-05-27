/**
 * ShortOLevel14 — Draw-a-Line Reinforcement (5 hardcoded rounds)
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import DrawLineBoard from "../games/drawline/DrawLineBoard";
import LevelCompleteScreen from "./LevelCompleteScreen";
import { shortOWords } from "../../lib/shortOWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { useRoundHintAudio, getShortOHintAudioUrl, LOCK_OVERLAY_STYLE } from "../../lib/useRoundHintAudio";

const LEVEL_NUM = 14;
const VOWEL_KEY = "short-o";
const SCORED_ROUNDS = getScoredRounds(VOWEL_KEY, LEVEL_NUM);
const findWord = (w) => shortOWords.find((x) => x.word === w);

// Hardcoded. shuffleOrder[botSlot] = topCardIndex whose letter goes there.
const ROUND_DEFS = [
  // R1: sob(_ob), cod(_od), bog(_og) — initial — b,c,s shuffled: b,s,c => botSlot0=sob(s), botSlot1=cod(c)... wait:
  // tokens: s,c,b for words sob,cod,bog. shuffled bottom: b,s,c means:
  // botSlot0→b→bog(idx2), botSlot1→s→sob(idx0), botSlot2→c→cod(idx1)
  { positionType: "initial", shuffleOrder: [2, 0, 1], words: [
    { word: "sob", targetLetter: "s" },
    { word: "cod", targetLetter: "c" },
    { word: "bog", targetLetter: "b" },
  ]},
  // R2: cod(co_), bog(bo_), top(to_) — final — tokens d,g,p shuffled: g,d,p
  // botSlot0→g→bog(idx1), botSlot1→d→cod(idx0), botSlot2→p→top(idx2)
  { positionType: "final", shuffleOrder: [1, 0, 2], words: [
    { word: "cod", targetLetter: "d" },
    { word: "bog", targetLetter: "g" },
    { word: "top", targetLetter: "p" },
  ]},
  // R3: sob(so_), box(bo_), jog(jo_) — final — tokens b,x,g shuffled: x,b,g
  // botSlot0→x→box(idx1), botSlot1→b→sob(idx0), botSlot2→g→jog(idx2) -- wait jog not in this O list check: jog IS in the list
  { positionType: "final", shuffleOrder: [1, 0, 2], words: [
    { word: "sob", targetLetter: "b" },
    { word: "box", targetLetter: "x" },
    { word: "jog", targetLetter: "g" },
  ]},
  // R4: cot(_ot), mop(_op), fox(_ox) — initial — tokens c,m,f shuffled: f,c,m
  // botSlot0→f→fox(idx2), botSlot1→c→cot(idx0), botSlot2→m→mop(idx1)
  { positionType: "initial", shuffleOrder: [2, 0, 1], words: [
    { word: "cot", targetLetter: "c" },
    { word: "mop", targetLetter: "m" },
    { word: "fox", targetLetter: "f" },
  ]},
  // R5: rob(_ob), cod(_od), pot(_ot) — initial — tokens r,c,p shuffled: c,p,r
  // botSlot0→c→cod(idx1), botSlot1→p→pot(idx2), botSlot2→r→rob(idx0)
  { positionType: "initial", shuffleOrder: [1, 2, 0], words: [
    { word: "rob", targetLetter: "r" },
    { word: "cod", targetLetter: "c" },
    { word: "pot", targetLetter: "p" },
  ]},
];
const TOTAL_ROUNDS = ROUND_DEFS.length;

function buildDrawLineRound(def) {
  const topCards = def.words.map((w, i) => ({
    ...findWord(w.word),
    targetLetter: w.targetLetter,
    positionType: def.positionType,
    id: `card-${i}-${w.word}-${w.targetLetter}`,
  }));
  const bottomLetters = def.shuffleOrder.map((topIdx, botSlot) => ({
    letter: topCards[topIdx].targetLetter,
    topCardId: topCards[topIdx].id,
    botIdx: botSlot,
  }));
  return { topCards, bottomLetters };
}

function markComplete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data[VOWEL_KEY]) data[VOWEL_KEY] = {};
    data[VOWEL_KEY][LEVEL_NUM] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function ShortOLevel14({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const onMistake = useCallback(() => setMistakes((m) => m + 1), []);

  const hintUrl = getShortOHintAudioUrl(LEVEL_NUM, roundIndex, lang);
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

  const drawLineRound = useMemo(() => buildDrawLineRound(ROUND_DEFS[roundIndex]), [roundIndex]); // eslint-disable-line
  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #FFF6E8 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} lang={lang} gameType="drawline" />
      {!done && (
        <div style={{ height: 6, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
          <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #FF9F43, #FFD93D)" }} />
        </div>
      )}
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <LevelCompleteScreen levelNum={LEVEL_NUM} stars={earnedStars} mistakes={mistakes} onBack={onBack} lang={lang} />
          </motion.div>
        ) : (
          <motion.div key={`round-${roundIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <DrawLineBoard key={`dl-${roundIndex}`} round={drawLineRound} onRoundComplete={advance} lang={lang} onMistake={onMistake} />
            {hintLocked && <div style={LOCK_OVERLAY_STYLE} onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}