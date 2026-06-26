/**
 * MixedCampaignLevel5 — First Mixed Spelling Check
 * R1: missing01 — can   display: c_n  missingIndex: 1  missingLetter: a  choices: a,e,i,o,u
 * R2: missing01 — pen   display: p_n  missingIndex: 1  missingLetter: e  choices: a,e,i,o,u
 * R3: missing01 — pin   display: p_n  missingIndex: 1  missingLetter: i  choices: a,e,i,o,u
 * R4: missing01 — pot   display: p_t  missingIndex: 1  missingLetter: o  choices: a,e,i,o,u
 * R5: missing01 — pup   display: p_p  missingIndex: 1  missingLetter: u  choices: a,e,i,o,u
 * R6: dictation — bed   tiles: b,e,d,a,i  correctOrder: b,e,d
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "../LevelHeader";
import LevelCompleteScreen from "../LevelCompleteScreen";
import CampaignMissingSound01Round from "../CampaignMissingSound01Round";
import DictationCampaignRound from "../DictationCampaignRound";
import { calcStars, saveLevelResult } from "../../../lib/campaignPerformance";
import { useRoundHintAudio, LOCK_OVERLAY_STYLE } from "../../../lib/useRoundHintAudio";
import { shortAWords } from "../../../lib/shortAWords";
import { shortEWords } from "../../../lib/shortEWords";
import { shortIWords } from "../../../lib/shortIWords";
import { shortOWords } from "../../../lib/shortOWords";
import { shortUWords } from "../../../lib/shortUWords";

const LEVEL_NUM = 5;
const VOWEL_KEY = "mixed";
const SCORED_ROUNDS = 6;

const ALL_WORDS = [...shortAWords, ...shortEWords, ...shortIWords, ...shortOWords, ...shortUWords];
const findCard = (w) => ALL_WORDS.find((x) => x.word === w) || { word: w, audio: null, image: null };

const ROUND_SEQUENCE = [
  { type: "missing01", word: "can", missingPos: 1 },
  { type: "missing01", word: "pen", missingPos: 1 },
  { type: "missing01", word: "pin", missingPos: 1 },
  { type: "missing01", word: "pot", missingPos: 1 },
  { type: "missing01", word: "pup", missingPos: 1 },
  { type: "dictation", word: "bed" },
];
const TOTAL_ROUNDS = ROUND_SEQUENCE.length;

function markComplete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data[VOWEL_KEY]) data[VOWEL_KEY] = {};
    data[VOWEL_KEY][LEVEL_NUM] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function MixedCampaignLevel5({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const onMistake = useCallback(() => setMistakes((m) => m + 1), []);

  const { locked: hintLocked, suppressAutoPlay } = useRoundHintAudio({ url: null });

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
  const card = useMemo(() => findCard(roundDef.word), [roundIndex]); // eslint-disable-line

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFF8 0%, #FFF9E6 60%, #E8F4FF 100%)", overflow: "hidden" }}>
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} lang={lang} vowelKey="mixed" gameType={roundDef.type} />
      {!done && (
        <div style={{ height: 6, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
          <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #FF6B6B, #FFD93D, #4ECDC4, #9B5DE5)" }} />
        </div>
      )}
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <LevelCompleteScreen levelNum={LEVEL_NUM} stars={earnedStars} mistakes={mistakes} onBack={onBack} lang={lang} />
          </motion.div>
        ) : (
          <motion.div key={`round-${roundIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {roundDef.type === "missing01" && card && (
              <CampaignMissingSound01Round key={`miss-${roundIndex}`} card={card} forcedMissingPos={roundDef.missingPos} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {roundDef.type === "dictation" && card && (
              <DictationCampaignRound key={`dict-${roundIndex}`} card={card} onComplete={advance} onMistake={onMistake} lang={lang} suppressAutoPlay={suppressAutoPlay} />
            )}
            {hintLocked && <div style={LOCK_OVERLAY_STYLE} onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}