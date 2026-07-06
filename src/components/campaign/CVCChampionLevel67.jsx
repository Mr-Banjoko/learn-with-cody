/**
 * CVCChampionLevel67 — "Pack 17 Guided Practice" (final-mix-level-067)
 * R1: drag_v2        — fog (vowel distractor "i")
 * R2: identifying    — gun [gun, gum, gem, get]
 * R3: drawline       — gum / gem / gap (middle letters u/e/a)
 * R4: missing01      — gem (middle, missing "e", choices u/i/o)
 * R5: connection     — fig
 * R6: word_to_audio  — gum [gum, gun, gem, gap]
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import Level1DragV2 from "./Level1DragV2";
import IdentifyingRound from "../games/IdentifyingRound";
import DrawLineBoard from "../games/drawline/DrawLineBoard";
import CampaignMissingSound01Round from "./CampaignMissingSound01Round";
import CampaignConnectionRound from "./CampaignConnectionRound";
import CampaignWordToAudioRound from "./CampaignWordToAudioRound";
import LevelCompleteScreen from "./LevelCompleteScreen";
import { shortAWords } from "../../lib/shortAWords";
import { shortEWords } from "../../lib/shortEWords";
import { shortIWords } from "../../lib/shortIWords";
import { shortOWords } from "../../lib/shortOWords";
import { shortUWords } from "../../lib/shortUWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { useUserPhoto } from "../../lib/useUserPhoto";

const LEVEL_NUM = 67;
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

const DRAW_LINE_WORDS = [
  { word: "gum", letter: "u", positionType: "middle" },
  { word: "gem", letter: "e", positionType: "middle" },
  { word: "gap", letter: "a", positionType: "middle" },
];

function buildDrawLineRound() {
  const topCards = DRAW_LINE_WORDS.map((w, i) => ({
    ...findWord(w.word),
    targetLetter: w.letter,
    positionType: w.positionType,
    id: `card-${i}-${w.word}-${w.letter}`,
  }));
  const bottomLetters = shuffle(topCards.map((c) => ({ letter: c.targetLetter }))).map((b, i) => ({ ...b, botIdx: i }));
  return { topCards, bottomLetters };
}

const ROUND_SEQUENCE = [
  { type: "drag_v2" },
  { type: "identifying" },
  { type: "drawline" },
  { type: "missing01" },
  { type: "connection" },
  { type: "word_to_audio" },
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

export default function CVCChampionLevel67({ onBack, lang = "en" }) {
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
    return { target: findWord("gun"), choices: shuffle([findWord("gun"), findWord("gum"), findWord("gem"), findWord("get")]) };
  }, [roundIndex]); // eslint-disable-line

  const drawLineRound = useMemo(() => (round.type === "drawline" ? buildDrawLineRound() : null), [roundIndex]); // eslint-disable-line
  const { photoUrl: fogPhotoUrl, clearPhoto: clearFogPhoto } = useUserPhoto("fog");

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
            {round.type === "drag_v2" && (
              <Level1DragV2 key={`dv2-${roundIndex}`} card={findWord("fog")} forcedDistractor="i" onComplete={advance} onMistake={onMistake} lang={lang} userPhotoUrl={fogPhotoUrl} onClearPhoto={clearFogPhoto} />
            )}
            {round.type === "identifying" && identifyingRound && (
              <IdentifyingRound key={`id-${roundIndex}`} round={identifyingRound} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "drawline" && drawLineRound && (
              <DrawLineBoard key={`dl-${roundIndex}`} round={drawLineRound} onRoundComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "missing01" && (
              <CampaignMissingSound01Round key={`ms-${roundIndex}`} card={findWord("gem")} forcedMissingPos={1} forcedDistractors={["u", "i", "o"]} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "connection" && (
              <CampaignConnectionRound key={`conn-${roundIndex}`} card={findWord("fig")} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "word_to_audio" && (
              <CampaignWordToAudioRound key={`wta-${roundIndex}`} card={findWord("gum")} overrideChoices={shuffle([findWord("gum"), findWord("gun"), findWord("gem"), findWord("gap")])} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}