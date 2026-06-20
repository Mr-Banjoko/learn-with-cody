/**
 * ShortILevel24 — Draw-a-Line Block 2
 * R1: wig,win,wit — initial — bottom: t,n,w? (win→n,wig→g, wit→t) final for wit? 
 *   Actually: all initial letters: w,w,w — use final instead
 *   wig(g), win(n), wit(t) — final — bottom: t,g,n → botSlot0=wit(idx2), botSlot1=wig(idx0), botSlot2=win(idx1)
 * R2: pig(p),pit(t),pin(n) — final — bottom: n,p,t → botSlot0=pin(idx2), botSlot1=pig(idx0), botSlot2=pit(idx1)
 * R3: sit(s),sip(s),six(s) — final — s,i,p,t,x: final t,p,x — bottom: x,p,t → botSlot0=six(idx2), botSlot1=sip(idx1), botSlot2=sit(idx0)
 * R4: fig(f),fin(f),fit(f) — final — g,n,t — bottom: t,g,n → botSlot0=fit(idx2), botSlot1=fig(idx0), botSlot2=fin(idx1)
 * R5: rip(r),rid(r),rim(r) — final — p,d,m — bottom: m,p,d → botSlot0=rim(idx2), botSlot1=rip(idx0), botSlot2=rid(idx1)
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import DrawLineBoard from "../games/drawline/DrawLineBoard";
import LevelCompleteScreen from "./LevelCompleteScreen";
import { shortIWords } from "../../lib/shortIWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { useRoundHintAudio, getShortIHintAudioUrl, LOCK_OVERLAY_STYLE } from "../../lib/useRoundHintAudio";

const LEVEL_NUM = 24;
const VOWEL_KEY = "short-i";
const SCORED_ROUNDS = getScoredRounds(VOWEL_KEY, LEVEL_NUM);
const findWord = (w) => shortIWords.find((x) => x.word === w);

const ROUND_DEFS = [
  { positionType: "final", shuffleOrder: [2, 0, 1], words: [
    { word: "wig", targetLetter: "g" },
    { word: "win", targetLetter: "n" },
    { word: "bit", targetLetter: "t" },
  ]},
  { positionType: "final", shuffleOrder: [2, 0, 1], words: [
    { word: "pig", targetLetter: "g" },
    { word: "pin", targetLetter: "n" },
    { word: "pit", targetLetter: "t" },
  ]},
  { positionType: "final", shuffleOrder: [2, 1, 0], words: [
    { word: "sit", targetLetter: "t" },
    { word: "sip", targetLetter: "p" },
    { word: "six", targetLetter: "x" },
  ]},
  { positionType: "final", shuffleOrder: [2, 0, 1], words: [
    { word: "fig", targetLetter: "g" },
    { word: "fin", targetLetter: "n" },
    { word: "fit", targetLetter: "t" },
  ]},
  { positionType: "final", shuffleOrder: [2, 0, 1], words: [
    { word: "rip", targetLetter: "p" },
    { word: "rid", targetLetter: "d" },
    { word: "rim", targetLetter: "m" },
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

export default function ShortILevel24({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const onMistake = useCallback(() => setMistakes((m) => m + 1), []);

  const hintUrl = getShortIHintAudioUrl(LEVEL_NUM, roundIndex, lang);
  const { locked: hintLocked } = useRoundHintAudio({ url: hintUrl });

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
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #F0F8FF 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} lang={lang} vowelKey="short-i" gameType="drawline" />
      {!done && (
        <div style={{ height: 6, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
          <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #6BCB77, #4ECDC4)" }} />
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