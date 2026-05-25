/**
 * Level 18 — Visual Match Intro (drawline) — 5 rounds, all drawline
 * R1: gas(S-FINAL), jar(J-INITIAL), tag(G-FINAL)        [first appearance — audio guide]
 * R2: tap(T-INITIAL), bag(A-MEDIAL), rat(R-INITIAL)
 * R3: can(N-FINAL), mat(M-INITIAL), sad(D-FINAL)
 * R4: hat(A-MEDIAL), pan(P-INITIAL), pat(T-FINAL)
 * R5: bag(B-INITIAL), tag(A-MEDIAL), jar(A-MEDIAL)
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import DrawLineBoard from "../games/drawline/DrawLineBoard";
import LevelCompleteScreen from "./LevelCompleteScreen";
import { shortAWords } from "../../lib/shortAWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { useRoundHintAudio, getHintAudioUrl, LOCK_OVERLAY_STYLE } from "../../lib/useRoundHintAudio";

const LEVEL_NUM = 18;
const SCORED_ROUNDS = getScoredRounds("short-a", LEVEL_NUM);
const findWord = (w) => shortAWords.find((x) => x.word === w);

/**
 * Hardcoded drawline round definitions — ALL INITIAL or ALL FINAL per round.
 * Each entry: { positionType, words: [{ word, targetLetter }] }
 * bottomLetters order is fixed (no shuffling) and matches the spec exactly.
 */
// Each round has a hardcoded fixed shuffle: botSlot[i] maps to topCards[shuffleOrder[i]]
// Orders are never identity [0,1,2] so bottom tokens are never directly below their top card.
const ROUND_DEFS = [
  // R1 ALL INITIAL — tokens: G, J, T — shuffle: [1,2,0]
  { positionType: "initial", shuffleOrder: [1,2,0], words: [
    { word: "gas", targetLetter: "g" },
    { word: "jar", targetLetter: "j" },
    { word: "tag", targetLetter: "t" },
  ]},
  // R2 ALL FINAL — tokens: P, G, T — shuffle: [2,0,1]
  { positionType: "final", shuffleOrder: [2,0,1], words: [
    { word: "tap", targetLetter: "p" },
    { word: "bag", targetLetter: "g" },
    { word: "rat", targetLetter: "t" },
  ]},
  // R3 ALL FINAL — tokens: N, T, D — shuffle: [1,2,0]
  { positionType: "final", shuffleOrder: [1,2,0], words: [
    { word: "can", targetLetter: "n" },
    { word: "mat", targetLetter: "t" },
    { word: "sad", targetLetter: "d" },
  ]},
  // R4 ALL INITIAL — tokens: H, P, P — shuffle: [2,0,1]
  { positionType: "initial", shuffleOrder: [2,0,1], words: [
    { word: "hat", targetLetter: "h" },
    { word: "pan", targetLetter: "p" },
    { word: "pat", targetLetter: "p" },
  ]},
  // R5 ALL FINAL — tokens: G, G, R — shuffle: [1,2,0]
  { positionType: "final", shuffleOrder: [1,2,0], words: [
    { word: "bag", targetLetter: "g" },
    { word: "tag", targetLetter: "g" },
    { word: "jar", targetLetter: "r" },
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
  // Apply fixed shuffle: bottomLetters[slot] = topCards[shuffleOrder[slot]]
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
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][LEVEL_NUM] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function Level18({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const onMistake = useCallback(() => setMistakes((m) => m + 1), []);

  // R1 (index 0): drawline first appearance — audio guide, then unlock (no single word audio for drawline)
  const hintUrl = getHintAudioUrl(LEVEL_NUM, roundIndex, lang);
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
      saveLevelResult("short-a", LEVEL_NUM, stars, mistakes);
      setEarnedStars(stars);
      setDone(true);
    } else {
      setRoundIndex(next);
    }
  }, [roundIndex, mistakes]);

  const drawLineRound = useMemo(() => buildDrawLineRound(ROUND_DEFS[roundIndex]), [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps
  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} lang={lang} gameType="drawline" />
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
            <DrawLineBoard key={`dl-${roundIndex}`} round={drawLineRound} onRoundComplete={advance} lang={lang} onMistake={onMistake} />
            {hintLocked && <div style={LOCK_OVERLAY_STYLE} onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}