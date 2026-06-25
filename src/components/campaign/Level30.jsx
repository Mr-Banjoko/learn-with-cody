/**
 * Level 30 — Review A–F
 * R1: drag           — tax
 * R2: missing01      — cab | B (FINAL, pos 2)
 * R3: catch          — hat | H (INITIAL)
 * R4: connection     — pal
 * R5: identifying    — bag
 * R6: rearrange_hard — sad + lab
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import Level1DragV2 from "./Level1DragV2";
import CampaignMissingSound01Round from "./CampaignMissingSound01Round";
import CampaignLetterCatchRound from "./CampaignLetterCatchRound";
import CampaignConnectionRound from "./CampaignConnectionRound";
import IdentifyingRound from "../games/IdentifyingRound";
import PicSliceBoard from "../games/PicSliceBoard";
import LevelCompleteScreen from "./LevelCompleteScreen";
import { buildWordData } from "../../lib/picSliceGameData";
import { buildShortASliceData } from "../../lib/buildShortASliceData";
import { shortAWords } from "../../lib/shortAWords";
import { shortEWords } from "../../lib/shortEWords";
import { shortIWords } from "../../lib/shortIWords";
import { shortOWords } from "../../lib/shortOWords";
import { shortUWords } from "../../lib/shortUWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { useUserPhoto } from "../../lib/useUserPhoto";

const LEVEL_NUM = 30;
const SCORED_ROUNDS = getScoredRounds("short-a", LEVEL_NUM);
const ALL_WORDS = [...shortAWords, ...shortEWords, ...shortIWords, ...shortOWords, ...shortUWords];
const findWord = (w) => shortAWords.find((x) => x.word === w);

const ROUND_SEQUENCE = [
  { type: "drag",           word: "tax" },
  { type: "missing01",      word: "cab", missingPos: 2 },       // B FINAL
  { type: "catch",          word: "hat", missingLetter: "h" },  // H INITIAL
  { type: "connection",     word: "pal" },
  { type: "identifying",    word: "bag" },
  { type: "rearrange_hard", words: ["sad", "lab"] },
];
const TOTAL_ROUNDS = ROUND_SEQUENCE.length;

function buildIdentifyingRound(word) {
  const target = findWord(word);
  const pool = ALL_WORDS.filter((w) => w.word !== word);
  const choices = [target, ...[...pool].sort(() => Math.random() - 0.5).slice(0, 2)].sort(() => Math.random() - 0.5);
  return { target, choices };
}

function markComplete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][LEVEL_NUM] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function Level30({ onBack, lang = "en" }) {
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

  const roundDef = ROUND_SEQUENCE[roundIndex];
  const { photoUrl: userPhotoUrl, clearPhoto: onClearPhoto } = useUserPhoto(roundDef.word);
  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;
  const dragCard = useMemo(() => roundDef.type === "drag" ? findWord(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const missingCard = useMemo(() => roundDef.type === "missing01" ? findWord(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const catchCard = useMemo(() => roundDef.type === "catch" ? findWord(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const connectionCard = useMemo(() => roundDef.type === "connection" ? buildWordData(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const identifyingRound = useMemo(() => roundDef.type === "identifying" ? buildIdentifyingRound(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const rearrangeHardPair = useMemo(() => roundDef.type === "rearrange_hard" ? roundDef.words.map(buildShortASliceData) : null, [roundIndex]); // eslint-disable-line

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} lang={lang} gameType={roundDef?.type} />
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
            {roundDef.type === "drag" && dragCard && <Level1DragV2 key={`drag-${roundIndex}`} card={dragCard} onComplete={advance} lang={lang} onMistake={onMistake} userPhotoUrl={userPhotoUrl} onClearPhoto={onClearPhoto} />}
            {roundDef.type === "missing01" && missingCard && <CampaignMissingSound01Round key={`miss-${roundIndex}`} card={missingCard} forcedMissingPos={roundDef.missingPos} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {roundDef.type === "catch" && catchCard && <CampaignLetterCatchRound key={`catch-${roundIndex}`} word={catchCard.word} missingLetter={roundDef.missingLetter} image={catchCard.image} audio={catchCard.audio} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {roundDef.type === "connection" && connectionCard && <CampaignConnectionRound key={`conn-${roundIndex}`} card={connectionCard} onComplete={advance} lang={lang} onMistake={onMistake} />}
            {roundDef.type === "identifying" && identifyingRound && <IdentifyingRound key={`id-${roundIndex}`} round={identifyingRound} onComplete={advance} lang={lang} onMistake={onMistake} userPhotoUrl={userPhotoUrl} onClearPhoto={onClearPhoto} />}
            {roundDef.type === "rearrange_hard" && rearrangeHardPair && <PicSliceBoard key={`hard-${roundIndex}`} wordPair={rearrangeHardPair} onRoundComplete={advance} lang={lang} onMistake={onMistake} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}