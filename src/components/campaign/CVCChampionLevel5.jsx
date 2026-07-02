/**
 * CVCChampionLevel5 — "Pack 1 Challenge" (final-mix-level-005)
 * R1: word_to_audio — mop [mop, mat, hit]
 * R2: dictation     — cat
 * R3: identifying   — sit [sit, cot, bat]
 * R4: drag_v2       — pot (vowel distractor "a")
 * R5: missing01     — mat (middle, missing "a", choices a/o/i)
 * R6: word_match    — cot [cot, cat, cit]
 * R7: catch         — bat (distractor letters o/i)
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import CampaignWordMatchRound from "./CampaignWordMatchRound";
import DictationCampaignRound from "./DictationCampaignRound";
import IdentifyingRound from "../games/IdentifyingRound";
import Level1DragV2 from "./Level1DragV2";
import CampaignMissingSound01Round from "./CampaignMissingSound01Round";
import CampaignLetterCatchRound from "./CampaignLetterCatchRound";
import LevelCompleteScreen from "./LevelCompleteScreen";
import { shortAWords } from "../../lib/shortAWords";
import { shortOWords } from "../../lib/shortOWords";
import { shortIWords } from "../../lib/shortIWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";

const LEVEL_NUM = 5;
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

const ROUND_SEQUENCE = [
  { type: "word_to_audio" },
  { type: "dictation" },
  { type: "identifying" },
  { type: "drag_v2" },
  { type: "missing01" },
  { type: "word_match" },
  { type: "catch" },
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

export default function CVCChampionLevel5({ onBack, lang = "en" }) {
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
    return { target: findWord("sit"), choices: shuffle([findWord("sit"), findWord("cot"), findWord("bat")]) };
  }, [roundIndex]); // eslint-disable-line

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
              <CampaignWordMatchRound key={`wta-${roundIndex}`} card={findWord("mop")} overrideChoices={shuffle([findWord("mop"), findWord("map"), { word: "mip" }, { word: "mup" }])} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "dictation" && (
              <DictationCampaignRound key={`dict-${roundIndex}`} card={findWord("cat")} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "identifying" && identifyingRound && (
              <IdentifyingRound key={`id-${roundIndex}`} round={identifyingRound} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "drag_v2" && (
              <Level1DragV2 key={`dv2-${roundIndex}`} card={findWord("pot")} forcedDistractor="a" onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "missing01" && (
              <CampaignMissingSound01Round key={`ms-${roundIndex}`} card={findWord("mat")} forcedMissingPos={1} forcedDistractors={["o", "i"]} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "word_match" && (
              <CampaignWordMatchRound key={`wm-${roundIndex}`} card={findWord("cot")} overrideChoices={shuffle([findWord("cot"), findWord("cat"), { word: "cit" }, { word: "cut" }])} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "catch" && (
              <CampaignLetterCatchRound key={`catch-${roundIndex}`} word="bat" missingLetter="a" image={findWord("bat").image} audio={findWord("bat").audio} forcedDistractorLetters={["o", "i"]} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}