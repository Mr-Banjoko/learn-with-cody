/**
 * CVCChampionLevel11 — "Pack 3 Guided Practice" (final-mix-level-011)
 * R1: missing01     — cub (middle, missing "u", choices u/a/o/i)
 * R2: word_to_audio — cab [cab, cub, cob, cop]
 * R3: letter_to_sound_connection — kid
 * R4: drag_v2       — cob (vowel distractor "u")
 * R5: drawline      — cab/cob/cub (middle vowels a/o/u, shuffled)
 * R6: identifying   — keg [keg, kid, cab, cop]
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import CampaignMissingSound01Round from "./CampaignMissingSound01Round";
import CampaignWordMatchRound from "./CampaignWordMatchRound";
import CampaignConnectionRound from "./CampaignConnectionRound";
import Level1DragV2 from "./Level1DragV2";
import DrawLineBoard from "../games/drawline/DrawLineBoard";
import IdentifyingRound from "../games/IdentifyingRound";
import LevelCompleteScreen from "./LevelCompleteScreen";
import { shortAWords } from "../../lib/shortAWords";
import { shortEWords } from "../../lib/shortEWords";
import { shortIWords } from "../../lib/shortIWords";
import { shortOWords } from "../../lib/shortOWords";
import { shortUWords } from "../../lib/shortUWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";

const LEVEL_NUM = 11;
const VOWEL_KEY = "cvc-champion";
const SCORED_ROUNDS = getScoredRounds(VOWEL_KEY, LEVEL_NUM);
const ALL_WORDS = [...shortAWords, ...shortEWords, ...shortIWords, ...shortOWords, ...shortUWords];
const findWord = (w) => ALL_WORDS.find((x) => x.word === w);

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// R5 draw-a-line — middle-vowel matching (3 words, 3 distinct vowels)
const DRAW_LINE_WORDS = [
  { word: "cab", vowel: "a" },
  { word: "cob", vowel: "o" },
  { word: "cub", vowel: "u" },
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
  { type: "missing01" },
  { type: "word_to_audio" },
  { type: "connection" },
  { type: "drag_v2" },
  { type: "drawline" },
  { type: "identifying" },
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

export default function CVCChampionLevel11({ onBack, lang = "en" }) {
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
    return { target: findWord("keg"), choices: shuffle([findWord("keg"), findWord("kid"), findWord("cab"), findWord("cop")]) };
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
            {round.type === "missing01" && (
              <CampaignMissingSound01Round key={`ms-${roundIndex}`} card={findWord("cub")} forcedMissingPos={1} forcedDistractors={["a", "o", "i"]} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "word_to_audio" && (
              <CampaignWordMatchRound key={`wta-${roundIndex}`} card={findWord("cab")} overrideChoices={shuffle([findWord("cab"), findWord("cub"), findWord("cob"), findWord("cop")])} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "connection" && (
              <CampaignConnectionRound key={`conn-${roundIndex}`} card={findWord("kid")} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "drag_v2" && (
              <Level1DragV2 key={`dv2-${roundIndex}`} card={findWord("cob")} forcedDistractor="u" onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "drawline" && drawLineRound && (
              <DrawLineBoard key={`dl-${roundIndex}`} round={drawLineRound} onRoundComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "identifying" && identifyingRound && (
              <IdentifyingRound key={`id-${roundIndex}`} round={identifyingRound} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}