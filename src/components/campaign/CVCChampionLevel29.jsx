/**
 * CVCChampionLevel29 — "Pack 7 Challenge" (final-mix-level-029)
 * R1: identifying    — hip [hip, hop, hat, hem]
 * R2: word_to_audio  — ham [ham, hem, hot, hut]
 * R3: dictation      — hop
 * R4: rearrange_hard — hat + hut
 * R5: drag_v2        — hem (vowel distractor "a")
 * R6: word_match     — hot [hot, hat, hit, het, hut]
 * R7: missing01      — hip (middle, missing "i", choices a/e/o/u)
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import IdentifyingRound from "../games/IdentifyingRound";
import CampaignWordMatchRound from "./CampaignWordMatchRound";
import CampaignWordToAudioRound from "./CampaignWordToAudioRound";
import DictationCampaignRound from "./DictationCampaignRound";
import PicSliceBoard from "../games/PicSliceBoard";
import Level1DragV2 from "./Level1DragV2";
import CampaignMissingSound01Round from "./CampaignMissingSound01Round";
import LevelCompleteScreen from "./LevelCompleteScreen";
import { buildWordData } from "../../lib/picSliceGameData";
import { shortAWords } from "../../lib/shortAWords";
import { shortEWords } from "../../lib/shortEWords";
import { shortIWords } from "../../lib/shortIWords";
import { shortOWords } from "../../lib/shortOWords";
import { shortUWords } from "../../lib/shortUWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { useUserPhoto } from "../../lib/useUserPhoto";

const LEVEL_NUM = 29;
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
  { type: "identifying" },
  { type: "word_to_audio" },
  { type: "dictation" },
  { type: "rearrange_hard" },
  { type: "drag_v2" },
  { type: "word_match" },
  { type: "missing01" },
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

export default function CVCChampionLevel29({ onBack, lang = "en" }) {
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
    return { target: findWord("hip"), choices: shuffle([findWord("hip"), findWord("hop"), findWord("hat"), findWord("hem")]) };
  }, [roundIndex]); // eslint-disable-line

  const rearrangeWordPair = useMemo(() => (round.type === "rearrange_hard" ? [buildWordData("hat"), buildWordData("hut")] : null), [roundIndex]); // eslint-disable-line
  const { photoUrl: hemPhotoUrl, clearPhoto: clearHemPhoto } = useUserPhoto("hem");

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
            {round.type === "identifying" && identifyingRound && (
              <IdentifyingRound key={`id-${roundIndex}`} round={identifyingRound} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "word_to_audio" && (
              <CampaignWordToAudioRound key={`wta-${roundIndex}`} card={findWord("ham")} overrideChoices={[findWord("ham"), findWord("hem"), findWord("hot"), findWord("hut")]} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "dictation" && (
              <DictationCampaignRound key={`dict-${roundIndex}`} card={findWord("hop")} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "rearrange_hard" && rearrangeWordPair && (
              <PicSliceBoard key={`re-${roundIndex}`} wordPair={rearrangeWordPair} onRoundComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "drag_v2" && (
              <Level1DragV2 key={`dv2-${roundIndex}`} card={findWord("hem")} forcedDistractor="a" onComplete={advance} onMistake={onMistake} lang={lang} userPhotoUrl={hemPhotoUrl} onClearPhoto={clearHemPhoto} />
            )}
            {round.type === "word_match" && (
              <CampaignWordMatchRound key={`wm-${roundIndex}`} card={findWord("hot")} overrideChoices={shuffle([findWord("hot"), findWord("hat"), findWord("hit"), findWord("hut")])} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "missing01" && (
              <CampaignMissingSound01Round key={`ms-${roundIndex}`} card={findWord("hip")} forcedMissingPos={1} forcedDistractors={["a", "e", "o", "u"]} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}