/**
 * Level 41 — Mastery and Graduation — 8 rounds
 * R1: word_to_audio  — cat, choices: cat, bat, hat
 * R2: identifying    — jam
 * R3: drag           — sad
 * R4: drawline       — bag(G-FINAL), dam(M-FINAL), rag(G-FINAL) — ALL FINAL
 * R5: writev2        — dam
 * R6: dictation      — lab
 * R7: rearrange_hard — fan + fat
 * R8: word_match     — nap
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import CampaignWordToAudioRound from "./CampaignWordToAudioRound";
import IdentifyingRound from "../games/IdentifyingRound";
import Level1DragV2 from "./Level1DragV2";
import DrawLineBoard from "../games/drawline/DrawLineBoard";
import WriteV2CampaignRound from "./WriteV2CampaignRound";
import DictationCampaignRound from "./DictationCampaignRound";
import PicSliceBoard from "../games/PicSliceBoard";
import CampaignWordMatchRound from "./CampaignWordMatchRound";
import LevelCompleteScreen from "./LevelCompleteScreen";
import { buildShortASliceData } from "../../lib/buildShortASliceData";
import { shortAWords } from "../../lib/shortAWords";
import { shortEWords } from "../../lib/shortEWords";
import { shortIWords } from "../../lib/shortIWords";
import { shortOWords } from "../../lib/shortOWords";
import { shortUWords } from "../../lib/shortUWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";

const LEVEL_NUM = 41;
const SCORED_ROUNDS = getScoredRounds("short-a", LEVEL_NUM);
const ALL_WORDS = [...shortAWords, ...shortEWords, ...shortIWords, ...shortOWords, ...shortUWords];
const findWord = (w) => shortAWords.find((x) => x.word === w);

// R4 drawline — ALL FINAL — tokens: G, M, G
// bag and rag both missing G (independent tokens); dam missing M
const R4_DRAW_DEF = {
  positionType: "final",
  words: [
    { word: "bag", targetLetter: "g" },
    { word: "dam", targetLetter: "m" },
    { word: "rag", targetLetter: "g" },
  ],
};

// R1 hardcoded word_to_audio choices
const R1_WORDS = ["cat", "bat", "hat"];

const ROUND_SEQUENCE = [
  { type: "word_to_audio",  words: R1_WORDS },
  { type: "identifying",    word: "jam" },
  { type: "drag",           word: "sad" },
  { type: "drawline" },
  { type: "writev2",        word: "dam" },
  { type: "dictation",      word: "lab" },
  { type: "rearrange_hard", words: ["fan", "fat"] },
  { type: "word_match",     word: "nap" },
];
const TOTAL_ROUNDS = ROUND_SEQUENCE.length;

function buildIdentifyingRound(word) {
  const target = findWord(word);
  const pool = ALL_WORDS.filter((w) => w.word !== word);
  const choices = [target, ...[...pool].sort(() => Math.random() - 0.5).slice(0, 2)].sort(() => Math.random() - 0.5);
  return { target, choices };
}

function buildDrawLineRound(def) {
  const topCards = def.words.map((w, i) => ({
    ...findWord(w.word),
    targetLetter: w.targetLetter,
    positionType: def.positionType,
    id: `card-${i}-${w.word}-${w.targetLetter}`,
  }));
  // Shuffled token order: m(dam), g(rag), g(bag) — no token sits below its own word
  const tokenOrder = [1, 2, 0];
  const bottomLetters = tokenOrder.map((ci, botIdx) => ({
    letter: topCards[ci].targetLetter,
    topCardId: topCards[ci].id,
    botIdx,
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

export default function Level41({ onBack, lang = "en" }) {
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
  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;
  const identifyingRound = useMemo(() => roundDef.type === "identifying" ? buildIdentifyingRound(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const dragCard = useMemo(() => roundDef.type === "drag" ? findWord(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const drawLineRound = useMemo(() => roundDef.type === "drawline" ? buildDrawLineRound(R4_DRAW_DEF) : null, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps
  const writev2Card = useMemo(() => roundDef.type === "writev2" ? findWord(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const dictCard = useMemo(() => roundDef.type === "dictation" ? findWord(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const rearrangeHard = useMemo(() => roundDef.type === "rearrange_hard" ? roundDef.words.map(buildShortASliceData) : null, [roundIndex]); // eslint-disable-line
  const wordMatchCard = useMemo(() => roundDef.type === "word_match" ? findWord(roundDef.word) : null, [roundIndex]); // eslint-disable-line

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} lang={lang} gameType={roundDef?.type} />
      {!done && (
        <div style={{ height: 6, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
          <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #FFD700, #FF6B6B)" }} />
        </div>
      )}
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <LevelCompleteScreen levelNum={LEVEL_NUM} stars={earnedStars} mistakes={mistakes} onBack={onBack} lang={lang} />
          </motion.div>
        ) : (
          <motion.div key={`round-${roundIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {roundDef.type === "word_to_audio" && <CampaignWordToAudioRound key={`audio-${roundIndex}`} words={roundDef.words} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {roundDef.type === "identifying" && identifyingRound && <IdentifyingRound key={`id-${roundIndex}`} round={identifyingRound} onComplete={advance} lang={lang} onMistake={onMistake} />}
            {roundDef.type === "drag" && dragCard && <Level1DragV2 key={`drag-${roundIndex}`} card={dragCard} onComplete={advance} lang={lang} onMistake={onMistake} />}
            {roundDef.type === "drawline" && drawLineRound && <DrawLineBoard key={`dl-${roundIndex}`} round={drawLineRound} onRoundComplete={advance} lang={lang} onMistake={onMistake} />}
            {roundDef.type === "writev2" && writev2Card && <WriteV2CampaignRound key={`writev2-${roundIndex}`} card={writev2Card} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {roundDef.type === "dictation" && dictCard && <DictationCampaignRound key={`dict-${roundIndex}`} card={dictCard} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {roundDef.type === "rearrange_hard" && rearrangeHard && <PicSliceBoard key={`hard-${roundIndex}`} wordPair={rearrangeHard} onRoundComplete={advance} lang={lang} onMistake={onMistake} />}
            {roundDef.type === "word_match" && wordMatchCard && <CampaignWordMatchRound key={`wm-${roundIndex}`} card={wordMatchCard} onComplete={advance} onMistake={onMistake} lang={lang} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}