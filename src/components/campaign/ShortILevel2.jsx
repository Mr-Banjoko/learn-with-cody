/**
 * ShortILevel2 — Intro Batch A continued (dig, dip) + letter_to_sound + connection
 * R1: phonics — dig
 * R2: missing01 — dig — missing: initial (d) pos 0
 * R3: phonics — dip
 * R4: missing01 — dip — missing: final (p) pos 2
 * R5: letter_to_sound — i (connection round using big)
 * R6: catch — big — b (initial)
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import Level1Phonics from "./Level1Phonics";
import CampaignMissingSound01Round from "./CampaignMissingSound01Round";
import CampaignConnectionRound from "./CampaignConnectionRound";
import CampaignLetterCatchRound from "./CampaignLetterCatchRound";
import LevelCompleteScreen from "./LevelCompleteScreen";
import { buildShortISliceData } from "../../lib/buildShortISliceData";
import { shortIWords } from "../../lib/shortIWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { useRoundHintAudio, getShortIHintAudioUrl, LOCK_OVERLAY_STYLE } from "../../lib/useRoundHintAudio";

const LEVEL_NUM = 2;
const VOWEL_KEY = "short-i";
const SCORED_ROUNDS = getScoredRounds(VOWEL_KEY, LEVEL_NUM);
const findWord = (w) => shortIWords.find((x) => x.word === w);

const ROUNDS = [
  { type: "phonics",          word: "dig" },
  { type: "missing01",        word: "dig", missingPos: 0 },
  { type: "phonics",          word: "dip" },
  { type: "missing01",        word: "dip", missingPos: 2 },
  { type: "letter_to_sound",  word: "big" },
  { type: "catch",            word: "big",  missingLetter: "b" },
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

export default function ShortILevel2({ onBack, lang = "en" }) {
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

  const round = ROUNDS[roundIndex];
  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;
  const card = useMemo(() => findWord(round.word), [roundIndex]); // eslint-disable-line
  const connectionCard = useMemo(() => round.type === "letter_to_sound" ? buildShortISliceData(round.word) : null, [roundIndex]); // eslint-disable-line

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #F0F8FF 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} lang={lang} vowelKey="short-i" gameType={round.type} />
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
            {round.type === "phonics" && card && <Level1Phonics card={card} onNext={advance} lang={lang} isFirstCard={false} />}
            {round.type === "missing01" && card && <CampaignMissingSound01Round key={`miss-${roundIndex}`} card={card} forcedMissingPos={round.missingPos} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {round.type === "letter_to_sound" && connectionCard && <CampaignConnectionRound key={`conn-${roundIndex}`} card={connectionCard} onComplete={advance} lang={lang} onMistake={onMistake} />}
            {round.type === "catch" && card && <CampaignLetterCatchRound key={`catch-${roundIndex}`} word={card.word} missingLetter={round.missingLetter} image={card.image} audio={card.audio} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {hintLocked && <div style={LOCK_OVERLAY_STYLE} onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}