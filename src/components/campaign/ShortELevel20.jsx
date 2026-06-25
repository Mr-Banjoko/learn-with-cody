/**
 * ShortELevel20 — Draw-a-Line Catch-up + WriteV2 Batch
 * R1: drawline — {den, hen, men} initial: d, h, m
 * R2: drawline — {pen, ten, hen} initial: p, t, h
 * R3: writev2 — bed
 * R4: writev2 — red
 * R5: writev2 — fed
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import DrawLineBoard from "../games/drawline/DrawLineBoard";
import WriteV2CampaignRound from "./WriteV2CampaignRound";
import LevelCompleteScreen from "./LevelCompleteScreen";
import { shortEWords } from "../../lib/shortEWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { useRoundHintAudio, getShortEHintAudioUrl, LOCK_OVERLAY_STYLE } from "../../lib/useRoundHintAudio";
import { useUserPhoto } from "../../lib/useUserPhoto";

const LEVEL_NUM = 20;
const VOWEL_KEY = "short-e";
const SCORED_ROUNDS = getScoredRounds(VOWEL_KEY, LEVEL_NUM);
const findWord = (w) => shortEWords.find((x) => x.word === w);

const DRAW_DEFS = [
  { words: [{ word: "den", letter: "d" }, { word: "hen", letter: "h" }, { word: "men", letter: "m" }], shuffleOrder: [2, 0, 1] },
  { words: [{ word: "pen", letter: "p" }, { word: "ten", letter: "t" }, { word: "hen", letter: "h" }], shuffleOrder: [1, 2, 0] },
];

const ROUND_SEQUENCE = [
  { type: "drawline", defIdx: 0 },
  { type: "drawline", defIdx: 1 },
  { type: "writev2", word: "bed" },
  { type: "writev2", word: "red" },
  { type: "writev2", word: "fed" },
];
const TOTAL_ROUNDS = ROUND_SEQUENCE.length;

function buildDrawLineRound(def) {
  const topCards = def.words.map((w, i) => ({
    ...findWord(w.word),
    targetLetter: w.letter,
    positionType: "initial",
    id: `card-${i}-${w.word}`,
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

export default function ShortELevel20({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const onMistake = useCallback(() => setMistakes((m) => m + 1), []);

  const hintUrl = getShortEHintAudioUrl(LEVEL_NUM, roundIndex, lang);
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

  const roundDef = ROUND_SEQUENCE[roundIndex];
  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;
  const drawLineRound = useMemo(() => roundDef.type === "drawline" ? buildDrawLineRound(DRAW_DEFS[roundDef.defIdx]) : null, [roundIndex]); // eslint-disable-line
  const card = useMemo(() => roundDef.word ? findWord(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const { photoUrl: userPhotoUrl, clearPhoto: onClearPhoto } = useUserPhoto(roundDef.word);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFF8 0%, #FFF9E6 60%, #E8F4FF 100%)", overflow: "hidden" }}>
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} lang={lang} vowelKey="short-e" gameType={roundDef.type} />
      {!done && (
        <div style={{ height: 6, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
          <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #4ECDC4, #44A08D)" }} />
        </div>
      )}
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <LevelCompleteScreen levelNum={LEVEL_NUM} stars={earnedStars} mistakes={mistakes} onBack={onBack} lang={lang} />
          </motion.div>
        ) : (
          <motion.div key={`round-${roundIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {roundDef.type === "drawline" && drawLineRound && <DrawLineBoard key={`dl-${roundIndex}`} round={drawLineRound} onRoundComplete={advance} lang={lang} onMistake={onMistake} />}
            {roundDef.type === "writev2" && card && <WriteV2CampaignRound key={`writev2-${roundIndex}`} card={card} onComplete={advance} onMistake={onMistake} lang={lang} userPhotoUrl={userPhotoUrl} onClearPhoto={onClearPhoto} />}
            {hintLocked && <div style={LOCK_OVERLAY_STYLE} onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}