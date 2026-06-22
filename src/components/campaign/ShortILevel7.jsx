/**
 * ShortILevel7 — Practice Batch B
 * R1: drag_v2 — sip
 * R2: catch — hip — p (final)
 * R3: rearrange_hard — fix [pair: fix + fig]
 * R4: dictation — fig
 * R5: word_to_audio — hip — options: hip, hop, hat
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import Level1DragV2 from "./Level1DragV2";
import CampaignLetterCatchRound from "./CampaignLetterCatchRound";
import CampaignWordToAudioRound from "./CampaignWordToAudioRound";
import DictationCampaignRound from "./DictationCampaignRound";
import PicSliceBoard from "../games/PicSliceBoard";
import LevelCompleteScreen from "./LevelCompleteScreen";
import { buildShortISliceData } from "../../lib/buildShortISliceData";
import { shortIWords } from "../../lib/shortIWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { useRoundHintAudio, getShortIHintAudioUrl, LOCK_OVERLAY_STYLE } from "../../lib/useRoundHintAudio";

const LEVEL_NUM = 7;
const VOWEL_KEY = "short-i";
const SCORED_ROUNDS = getScoredRounds(VOWEL_KEY, LEVEL_NUM);
const findWord = (w) => shortIWords.find((x) => x.word === w);

const ROUND_SEQUENCE = [
  { type: "drag_v2",       word: "sip" },
  { type: "catch",         word: "hip", missingLetter: "p" },
  { type: "rearrange_hard", words: ["fix", "fig"] },
  { type: "dictation",     word: "fig" },
  { type: "word_to_audio", words: ["hip", "hop", "hat"] },
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

export default function ShortILevel7({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const onMistake = useCallback(() => setMistakes((m) => m + 1), []);

  const hintUrl = getShortIHintAudioUrl(LEVEL_NUM, roundIndex, lang);
  const r1WordAudio = roundIndex === 0 ? (findWord("sip")?.audio || null) : null;
  const onHintComplete = useCallback((unlock) => {
    if (!r1WordAudio) { unlock(); return; }
    const audio = new Audio(r1WordAudio);
    audio.onended = unlock; audio.onerror = unlock;
    audio.play().catch(unlock);
  }, [r1WordAudio]);

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

  const roundDef = ROUND_SEQUENCE[roundIndex];
  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;
  const card = useMemo(() => roundDef.word ? findWord(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const rearrangeHardPair = useMemo(() => roundDef.type === "rearrange_hard" ? roundDef.words.map(buildShortISliceData) : null, [roundIndex]); // eslint-disable-line
  const traySwapCount = useMemo(() => (roundIndex % 2 === 0) ? 2 : 1, [roundIndex]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #F0F8FF 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} lang={lang} vowelKey="short-i" gameType={roundDef.type} />
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
            {roundDef.type === "drag_v2" && card && <Level1DragV2 key={`drag-${roundIndex}`} card={card} onComplete={advance} lang={lang} onMistake={onMistake} />}
            {roundDef.type === "catch" && card && <CampaignLetterCatchRound key={`catch-${roundIndex}`} word={card.word} missingLetter={roundDef.missingLetter} image={card.image} audio={card.audio} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {roundDef.type === "rearrange_hard" && rearrangeHardPair && <PicSliceBoard key={`hard-${roundIndex}`} wordPair={rearrangeHardPair} onRoundComplete={advance} lang={lang} onMistake={onMistake} traySwapCount={traySwapCount} />}
            {roundDef.type === "dictation" && card && <DictationCampaignRound key={`dict-${roundIndex}`} card={card} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {roundDef.type === "word_to_audio" && <CampaignWordToAudioRound key={`wta-${roundIndex}`} words={roundDef.words} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {hintLocked && <div style={LOCK_OVERLAY_STYLE} onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}