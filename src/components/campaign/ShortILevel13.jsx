/**
 * ShortILevel13 — Draw-a-Line Block 1
 * R1: big, dig, jig — initial — bottom: j, b, d (shuffleOrder[0]=jig→idx2, [1]=big→idx0, [2]=dig→idx1)
 * R2: bit, fit, hit — initial — bottom: h, f, b (shuffleOrder[0]=hit→idx2, [1]=fit→idx1, [2]=bit→idx0)
 * R3: hip, lip, rip — initial — bottom: r, l, h (shuffleOrder[0]=rip→idx2, [1]=lip→idx1, [2]=hip→idx0)
 * R4: lid, hid, dim — initial — bottom: d, h, l (shuffleOrder[0]=dim→idx2, [1]=hid→idx1, [2]=lid→idx0)
 * R5: pin, pig, pit — final — bottom: t, g, n (shuffleOrder[0]=pit→idx2, [1]=pig→idx1, [2]=pin→idx0)
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import DrawLineBoard from "../games/drawline/DrawLineBoard";
import LevelCompleteScreen from "./LevelCompleteScreen";
import { shortIWords } from "../../lib/shortIWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { useRoundHintAudio, getShortIHintAudioUrl, LOCK_OVERLAY_STYLE } from "../../lib/useRoundHintAudio";

const LEVEL_NUM = 13;
const VOWEL_KEY = "short-i";
const SCORED_ROUNDS = getScoredRounds(VOWEL_KEY, LEVEL_NUM);
const findWord = (w) => shortIWords.find((x) => x.word === w);

const ROUND_DEFS = [
  // R1: big(b), dig(d), kid(k) — initial — bottom: k,b,d → botSlot0=kid(idx2), botSlot1=big(idx0), botSlot2=dig(idx1)
  { positionType: "initial", shuffleOrder: [2, 0, 1], words: [
    { word: "big", targetLetter: "b" },
    { word: "dig", targetLetter: "d" },
    { word: "kid", targetLetter: "k" },
  ]},
  // R2: bit(b), fit(f), hit(h) — initial — bottom: h,f,b → botSlot0=hit(idx2), botSlot1=fit(idx1), botSlot2=bit(idx0)
  { positionType: "initial", shuffleOrder: [2, 1, 0], words: [
    { word: "bit", targetLetter: "b" },
    { word: "fit", targetLetter: "f" },
    { word: "hit", targetLetter: "h" },
  ]},
  // R3: hip(h), lip(l), rip(r) — initial — bottom: r,l,h → botSlot0=rip(idx2), botSlot1=lip(idx1), botSlot2=hip(idx0)
  { positionType: "initial", shuffleOrder: [2, 1, 0], words: [
    { word: "hip", targetLetter: "h" },
    { word: "lip", targetLetter: "l" },
    { word: "rip", targetLetter: "r" },
  ]},
  // R4: lid(l), hid(h), did(d) — initial — bottom: d,h,l → botSlot0=did(idx2→"did" 3rd word), wait: did is not in shortIWords directly
  // lid(idx0), hid(idx1), did(idx2) — bottom: d,h,l → botSlot0→l→lid(idx0)? Let me recalc:
  // tokens: l(lid), h(hid), d(did). Shuffled bottom: d,h,l
  // botSlot0→d→did(idx2), botSlot1→h→hid(idx1), botSlot2→l→lid(idx0)
  { positionType: "initial", shuffleOrder: [2, 1, 0], words: [
    { word: "lid", targetLetter: "l" },
    { word: "hid", targetLetter: "h" },
    { word: "dim", targetLetter: "d" },
  ]},
  // R5: hid(d), rib(b), hip(p) — final — bottom: p,b,d → botSlot0=hip(idx2), botSlot1=rib(idx1), botSlot2=hid(idx0)
  { positionType: "final", shuffleOrder: [2, 1, 0], words: [
    { word: "hid", targetLetter: "d" },
    { word: "rib", targetLetter: "b" },
    { word: "hip", targetLetter: "p" },
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

export default function ShortILevel13({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const onMistake = useCallback(() => setMistakes((m) => m + 1), []);

  const hintUrl = getShortIHintAudioUrl(LEVEL_NUM, roundIndex, lang);
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