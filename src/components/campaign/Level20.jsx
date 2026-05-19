/**
 * Level 20 — 9-round Mixed Review
 *
 * Round order:
 *  1. Identifying              → tag
 *  2. Write                    → bag
 *  3. Letter-to-Sound Connection → gas
 *  4. Letter Catch             → tap, missing: t
 *  5. Drag the Letters V2      → jar
 *  6. Draw a Line              → can (c), mad (m), sad (s)
 *  7. Rearrange Easy           → bag
 *  8. Missing Sound 0.1        → tap
 *  9. Write                    → tag
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import Level1DragV2 from "./Level1DragV2";
import PicSliceBoardEasy from "../games/PicSliceBoardEasy";
import IdentifyingRound from "../games/IdentifyingRound";
import DrawLineBoard from "../games/drawline/DrawLineBoard";
import CampaignConnectionRound from "./CampaignConnectionRound";
import CampaignLetterCatchRound from "./CampaignLetterCatchRound";
import CampaignMissingSound01Round from "./CampaignMissingSound01Round";
import CampaignWriteRound from "./CampaignWriteRound";
import LevelCompleteScreen from "./LevelCompleteScreen";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { buildWordData } from "../../lib/picSliceGameData";
import { shortAWords } from "../../lib/shortAWords";
import { shortEWords } from "../../lib/shortEWords";
import { shortIWords } from "../../lib/shortIWords";
import { shortOWords } from "../../lib/shortOWords";
import { shortUWords } from "../../lib/shortUWords";

const LEVEL_NUM = 20;
const SCORED_ROUNDS = getScoredRounds("short-a", LEVEL_NUM);

const findWord = (w) => shortAWords.find((x) => x.word === w);
const ALL_WORDS = [...shortAWords, ...shortEWords, ...shortIWords, ...shortOWords, ...shortUWords];

function buildIdentifyingRound(targetWord) {
  const target = shortAWords.find((w) => w.word === targetWord);
  const pool = ALL_WORDS.filter((w) => w.word !== targetWord);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const choices = [target, ...shuffled.slice(0, 2)].sort(() => Math.random() - 0.5);
  return { target, choices };
}

function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildFixedDrawLineRound(wordNames) {
  const words = wordNames.map(findWord);
  const topCards = words.map((w, i) => ({
    ...w,
    targetLetter: w.word[0],
    id: `card-${i}-${w.word}`,
  }));
  const letters = topCards.map((c) => ({ letter: c.targetLetter, topCardId: c.id }));
  let shuffledLetters = shuffleArr(letters);
  let tries = 0;
  while (tries < 20 && shuffledLetters.some((l, i) => l.topCardId === topCards[i].id)) {
    shuffledLetters = shuffleArr(letters);
    tries++;
  }
  return { topCards, bottomLetters: shuffledLetters };
}

const ROUND_SEQUENCE = [
  { type: "identifying", word: "tag"                          }, // R1
  { type: "write",       word: "bag"                          }, // R2
  { type: "connection",  word: "gas"                          }, // R3
  { type: "catch",       word: "tap", missingLetter: "t"      }, // R4
  { type: "drag",        word: "jar"                          }, // R5
  { type: "drawline",    words: ["can", "mad", "sad"]         }, // R6
  { type: "rearrange",   word: "bag"                          }, // R7
  { type: "missing",     word: "tap"                          }, // R8
  { type: "write",       word: "tag"                          }, // R9
];

const TOTAL_ROUNDS = ROUND_SEQUENCE.length;

function markLevel20Complete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][20] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function Level20({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const onMistake = useCallback(() => setMistakes((m) => m + 1), []);

  const advance = useCallback(() => {
    const next = roundIndex + 1;
    if (next >= TOTAL_ROUNDS) {
      markLevel20Complete();
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

  const identifyingRound = useMemo(() => {
    if (!roundDef || roundDef.type !== "identifying") return null;
    return buildIdentifyingRound(roundDef.word);
  }, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const writeCard = useMemo(() => {
    if (!roundDef || roundDef.type !== "write") return null;
    return findWord(roundDef.word);
  }, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const connectionCard = useMemo(() => {
    if (!roundDef || roundDef.type !== "connection") return null;
    return buildWordData(roundDef.word);
  }, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const catchWordData = useMemo(() => {
    if (!roundDef || roundDef.type !== "catch") return null;
    return findWord(roundDef.word);
  }, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const dragCard = useMemo(() => {
    if (!roundDef || roundDef.type !== "drag") return null;
    return findWord(roundDef.word);
  }, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const drawLineRound = useMemo(() => {
    if (!roundDef || roundDef.type !== "drawline") return null;
    return buildFixedDrawLineRound(roundDef.words);
  }, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const rearrangeWordPair = useMemo(() => {
    if (!roundDef || roundDef.type !== "rearrange") return null;
    return [buildWordData(roundDef.word)];
  }, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const missingCard = useMemo(() => {
    if (!roundDef || roundDef.type !== "missing") return null;
    return findWord(roundDef.word);
  }, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} lang={lang} gameType={ROUND_SEQUENCE[roundIndex]?.type} />

      {/* Progress bar */}
      {!done && (
        <div style={{ height: 6, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
          <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #4ECDC4, #4D96FF)" }} />
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <LevelCompleteScreen levelNum={LEVEL_NUM} stars={earnedStars} mistakes={mistakes} onBack={onBack} lang={lang} />
          </motion.div>
        ) : (
          <motion.div key={`round-${roundIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {roundDef.type === "identifying" && identifyingRound && (
              <IdentifyingRound
                key={`identifying-${roundIndex}`}
                round={identifyingRound}
                onComplete={advance}
                lang={lang}
                onMistake={onMistake}
              />
            )}
            {roundDef.type === "write" && writeCard && (
              <CampaignWriteRound
                key={`write-${roundIndex}`}
                card={writeCard}
                onComplete={advance}
                lang={lang}
              />
            )}
            {roundDef.type === "connection" && connectionCard && (
              <CampaignConnectionRound
                key={`connection-${roundIndex}`}
                card={connectionCard}
                onComplete={advance}
                onMistake={onMistake}
                lang={lang}
              />
            )}
            {roundDef.type === "catch" && catchWordData && (
              <CampaignLetterCatchRound
                key={`catch-${roundIndex}`}
                word={roundDef.word}
                missingLetter={roundDef.missingLetter}
                image={catchWordData.image}
                audio={catchWordData.audio}
                onComplete={advance}
                onMistake={onMistake}
                lang={lang}
              />
            )}
            {roundDef.type === "drag" && dragCard && (
              <Level1DragV2
                key={`drag-${roundIndex}`}
                card={dragCard}
                onComplete={advance}
                lang={lang}
                onMistake={onMistake}
              />
            )}
            {roundDef.type === "drawline" && drawLineRound && (
              <DrawLineBoard
                key={`drawline-${roundIndex}`}
                round={drawLineRound}
                onRoundComplete={advance}
                lang={lang}
                onMistake={onMistake}
              />
            )}
            {roundDef.type === "rearrange" && rearrangeWordPair && (
              <PicSliceBoardEasy
                key={`rearrange-${roundIndex}`}
                wordPair={rearrangeWordPair}
                onRoundComplete={advance}
                lang={lang}
                onMistake={onMistake}
              />
            )}
            {roundDef.type === "missing" && missingCard && (
              <CampaignMissingSound01Round
                key={`missing-${roundIndex}`}
                card={missingCard}
                onComplete={advance}
                onMistake={onMistake}
                lang={lang}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}