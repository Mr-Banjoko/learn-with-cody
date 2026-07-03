/**
 * CVCChampionLevel28 — "Pack 7 Intensive Practice" (final-mix-level-028)
 * R1: dictation      — ham
 * R2: writev2        — hop
 * R3: word_match     — hem [hem, ham, him, hom]
 * R4: rearrange_easy — hip
 * R5: drag_v2        — hut (vowel distractor "a")
 * R6: missing01      — hot (middle, missing "o", choices a/u/i/e)
 * R7: catch          — hit (missing letter "i", distractors a/e/o/u)
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import DictationCampaignRound from "./DictationCampaignRound";
import WriteV2CampaignRound from "./WriteV2CampaignRound";
import CampaignWordMatchRound from "./CampaignWordMatchRound";
import PicSliceBoardEasy from "../games/PicSliceBoardEasy";
import Level1DragV2 from "./Level1DragV2";
import CampaignMissingSound01Round from "./CampaignMissingSound01Round";
import CampaignLetterCatchRound from "./CampaignLetterCatchRound";
import LevelCompleteScreen from "./LevelCompleteScreen";
import { buildWordData } from "../../lib/picSliceGameData";
import { shortAWords } from "../../lib/shortAWords";
import { shortEWords } from "../../lib/shortEWords";
import { shortIWords } from "../../lib/shortIWords";
import { shortOWords } from "../../lib/shortOWords";
import { shortUWords } from "../../lib/shortUWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { useUserPhoto } from "../../lib/useUserPhoto";

const LEVEL_NUM = 28;
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

const ROUND_SEQUENCE = [
  { type: "dictation" },
  { type: "writev2" },
  { type: "word_match" },
  { type: "rearrange_easy" },
  { type: "drag_v2" },
  { type: "missing01" },
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

export default function CVCChampionLevel28({ onBack, lang = "en" }) {
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
  const rearrangeWordPair = useMemo(() => (round.type === "rearrange_easy" ? [buildWordData("hip")] : null), [roundIndex]); // eslint-disable-line
  const { photoUrl: hutPhotoUrl, clearPhoto: clearHutPhoto } = useUserPhoto("hut");

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
            {round.type === "dictation" && (
              <DictationCampaignRound key={`dict-${roundIndex}`} card={findWord("ham")} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "writev2" && (
              <WriteV2CampaignRound key={`wv2-${roundIndex}`} card={findWord("hop")} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "word_match" && (
              <CampaignWordMatchRound key={`wm-${roundIndex}`} card={findWord("hem")} overrideChoices={shuffle([findWord("hem"), findWord("ham"), { word: "him" }, { word: "hom" }])} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "rearrange_easy" && rearrangeWordPair && (
              <PicSliceBoardEasy key={`re-${roundIndex}`} wordPair={rearrangeWordPair} onRoundComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "drag_v2" && (
              <Level1DragV2 key={`dv2-${roundIndex}`} card={findWord("hut")} forcedDistractor="a" onComplete={advance} onMistake={onMistake} lang={lang} userPhotoUrl={hutPhotoUrl} onClearPhoto={clearHutPhoto} />
            )}
            {round.type === "missing01" && (
              <CampaignMissingSound01Round key={`ms-${roundIndex}`} card={findWord("hot")} forcedMissingPos={1} forcedDistractors={["a", "u", "i", "e"]} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "catch" && (
              <CampaignLetterCatchRound key={`catch-${roundIndex}`} word="hit" missingLetter="i" image={findWord("hit").image} audio={findWord("hit").audio} forcedDistractorLetters={["a", "e", "o", "u"]} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}