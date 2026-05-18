/**
 * Level 40 — 8-round Mixed Review (FINAL LEVEL)
 */
import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import PicSliceBoardEasy from "../games/PicSliceBoardEasy";
import PicSliceBoard from "../games/PicSliceBoard";
import WriteV2CampaignRound from "./WriteV2CampaignRound";
import DictationCampaignRound from "./DictationCampaignRound";
import CampaignWordMatchRound from "./CampaignWordMatchRound";
import CampaignLetterCatchRound from "./CampaignLetterCatchRound";
import CampaignMissingSound01Round from "./CampaignMissingSound01Round";
import CampaignWordToAudioRound from "./CampaignWordToAudioRound";
import LevelCompleteScreen from "./LevelCompleteScreen";
import HeartDisplay from "./HeartDisplay";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { buildShortASliceData } from "../../lib/buildShortASliceData";
import { shortAWords } from "../../lib/shortAWords";
import { shortEWords } from "../../lib/shortEWords";
import { shortIWords } from "../../lib/shortIWords";
import { shortOWords } from "../../lib/shortOWords";
import { shortUWords } from "../../lib/shortUWords";

const LEVEL_NUM = 40;
const SCORED_ROUNDS = getScoredRounds("short-a", LEVEL_NUM);
const ALL_WORDS = [...shortAWords, ...shortEWords, ...shortIWords, ...shortOWords, ...shortUWords];
const findShortA = (w) => shortAWords.find((x) => x.word === w);

const FAT_DISTRACTORS = ["bat", "mat", "sat"].map((d) => ALL_WORDS.find((w) => w.word === d) || { word: d, audio: null, image: null });

const ROUND_SEQUENCE = [
  { type: "rearrange_easy",   word: "sap"                          },
  { type: "writev2",          word: "rag"                          },
  { type: "dictation",        word: "nap"                          },
  { type: "wordmatch",        word: "fat"                          },
  { type: "rearrange_hard",   words: ["ran", "tan"]                },
  { type: "catch",            word: "man", missing: "m"            },
  { type: "missing",          word: "sap", forcedMissingPos: 2     },
  { type: "wordaudio",        words: ["ram", "man", "ban"]         },
];
const TOTAL_ROUNDS = ROUND_SEQUENCE.length;

function markComplete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][40] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function Level40({ onBack, lang = "en" }) {
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
    } else setRoundIndex(next);
  }, [roundIndex, mistakes]);

  const roundDef = ROUND_SEQUENCE[roundIndex];
  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;

  const rearrangeEasyData = useMemo(() => roundDef.type === "rearrange_easy" ? [buildShortASliceData(roundDef.word)] : null, [roundIndex]); // eslint-disable-line
  const writev2Card = useMemo(() => roundDef.type === "writev2" ? findShortA(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const dictCard = useMemo(() => roundDef.type === "dictation" ? findShortA(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const wordMatchCard = useMemo(() => roundDef.type === "wordmatch" ? findShortA(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const rearrangeHardData = useMemo(() => roundDef.type === "rearrange_hard" ? roundDef.words.map(buildShortASliceData) : null, [roundIndex]); // eslint-disable-line
  const catchCard = useMemo(() => roundDef.type === "catch" ? findShortA(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const missingCard = useMemo(() => roundDef.type === "missing" ? findShortA(roundDef.word) : null, [roundIndex]); // eslint-disable-line

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} lang={lang} gameType={ROUND_SEQUENCE[roundIndex]?.type} />
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
            {roundDef.type === "rearrange_easy" && rearrangeEasyData && <PicSliceBoardEasy key={`easy-${roundIndex}`} wordPair={rearrangeEasyData} onRoundComplete={advance} lang={lang} onMistake={onMistake} />}
            {roundDef.type === "writev2" && writev2Card && <WriteV2CampaignRound key={`writev2-${roundIndex}`} card={writev2Card} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {roundDef.type === "dictation" && dictCard && <DictationCampaignRound key={`dict-${roundIndex}`} card={dictCard} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {roundDef.type === "wordmatch" && wordMatchCard && <CampaignWordMatchRound key={`wm-${roundIndex}`} card={wordMatchCard} overrideChoices={[...FAT_DISTRACTORS, wordMatchCard].sort(() => Math.random() - 0.5)} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {roundDef.type === "rearrange_hard" && rearrangeHardData && <PicSliceBoard key={`hard-${roundIndex}`} wordPair={rearrangeHardData} onRoundComplete={advance} lang={lang} onMistake={onMistake} />}
            {roundDef.type === "catch" && catchCard && <CampaignLetterCatchRound key={`catch-${roundIndex}`} word={catchCard.word} missingLetter={roundDef.missing} image={catchCard.image} audio={catchCard.audio} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {roundDef.type === "missing" && missingCard && <CampaignMissingSound01Round key={`missing-${roundIndex}`} card={missingCard} forcedMissingPos={roundDef.forcedMissingPos} onComplete={advance} onMistake={onMistake} lang={lang} />}
            {roundDef.type === "wordaudio" && <CampaignWordToAudioRound key={`audio-${roundIndex}`} words={roundDef.words} onComplete={advance} onMistake={onMistake} lang={lang} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}