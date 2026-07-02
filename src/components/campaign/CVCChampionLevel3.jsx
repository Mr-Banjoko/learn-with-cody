/**
 * CVCChampionLevel3 — "Pack 1 Guided Practice" (final-mix-level-003)
 * R1: word_to_audio    — cat  [cat, cot, sit]
 * R2: identifying      — bat  [bat, pot, hit]
 * R3: missing01        — mop  (middle, missing "o", choices o/i/a)
 * R4: drag_v2          — hit  (vowel distractor "a")
 * R5: letter_to_sound  — pot
 * R6: draw-a-line      — mat/mop/sit (middle vowels a/o/i, shuffled)
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import CampaignWordMatchRound from "./CampaignWordMatchRound";
import IdentifyingRound from "../games/IdentifyingRound";
import CampaignMissingSound01Round from "./CampaignMissingSound01Round";
import Level1DragV2 from "./Level1DragV2";
import CampaignConnectionRound from "./CampaignConnectionRound";
import DrawLineBoard from "../games/drawline/DrawLineBoard";
import LevelCompleteScreen from "./LevelCompleteScreen";
import { shortAWords } from "../../lib/shortAWords";
import { shortOWords } from "../../lib/shortOWords";
import { shortIWords } from "../../lib/shortIWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";

const LEVEL_NUM = 3;
const VOWEL_KEY = "cvc-champion";
const SCORED_ROUNDS = getScoredRounds(VOWEL_KEY, LEVEL_NUM);
const ALL_WORDS = [...shortAWords, ...shortOWords, ...shortIWords];
const findWord = (w) => ALL_WORDS.find((x) => x.word === w);

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// R6 draw-a-line — middle-vowel matching (validated: 3 words, 3 distinct vowels)
const DRAW_LINE_WORDS = [
  { word: "mat", vowel: "a" },
  { word: "mop", vowel: "o" },
  { word: "sit", vowel: "i" },
];

function buildDrawLineRound() {
  const topCards = DRAW_LINE_WORDS.map((w, i) => ({
    ...findWord(w.word),
    targetLetter: w.vowel,
    positionType: "middle",
    id: `card-${i}-${w.word}-${w.vowel}`,
  }));
  const bottomLetters = shuffle(topCards.map((c) => ({ letter: c.targetLetter }))).map((b, i) => ({ ...b, botIdx: i }));
  return { topCards, bottomLetters };
}

const ROUND_SEQUENCE = [
  { type: "word_to_audio" },
  { type: "identifying" },
  { type: "missing01" },
  { type: "drag_v2" },
  { type: "connection" },
  { type: "drawline" },
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

export default function CVCChampionLevel3({ onBack, lang = "en" }) {
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
      saveLevelResult(VOWEL_KEY, LEVEL_NUM, stars, mistakes);
      setEarnedStars(stars);
      setDone(true);
    } else {
      setRoundIndex(next);
    }
  }, [roundIndex, mistakes]);

  const round = ROUND_SEQUENCE[roundIndex];
  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;

  const identifyingRound = useMemo(() => {
    if (round.type !== "identifying") return null;
    return { target: findWord("bat"), choices: shuffle([findWord("bat"), findWord("pot"), findWord("hit")]) };
  }, [roundIndex]); // eslint-disable-line

  const drawLineRound = useMemo(() => (round.type === "drawline" ? buildDrawLineRound() : null), [roundIndex]); // eslint-disable-line

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFF8 0%, #FFF9E6 60%, #E8F4FF 100%)", overflow: "hidden" }}>
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} lang={lang} vowelKey={VOWEL_KEY} gameType={round.type} />
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
            {round.type === "word_to_audio" && (
              <CampaignWordMatchRound key={`wta-${roundIndex}`} card={findWord("cat")} overrideChoices={[findWord("cat"), findWord("cot"), findWord("sit")]} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "identifying" && identifyingRound && (
              <IdentifyingRound key={`id-${roundIndex}`} round={identifyingRound} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "missing01" && (
              <CampaignMissingSound01Round key={`ms-${roundIndex}`} card={findWord("mop")} forcedMissingPos={1} forcedDistractors={["i", "a"]} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "drag_v2" && (
              <Level1DragV2 key={`dv2-${roundIndex}`} card={findWord("hit")} forcedDistractor="a" onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "connection" && (
              <CampaignConnectionRound key={`conn-${roundIndex}`} card={findWord("pot")} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "drawline" && drawLineRound && (
              <DrawLineBoard key={`dl-${roundIndex}`} round={drawLineRound} onRoundComplete={advance} onMistake={onMistake} lang={lang} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}