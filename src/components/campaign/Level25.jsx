/**
 * Level 25 — 9-round mixed review
 * R1: Rearrange(Easy) wax
 * R2: LetterCatch tan(t)
 * R3: LetterCatch gap(g)
 * R4: LetterCatch dam(d)
 * R5: Identifying tax
 * R6: Connection tan
 * R7: DrawLine wax(w), tax(t), dam(d) — first letter
 * R8: DrawLine gap(p), bag(g), mad(d) — last letter
 * R9: MissingSound01 dam, missing m
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import LevelCompleteScreen from "./LevelCompleteScreen";
import PicSliceBoardEasy from "../games/PicSliceBoardEasy";
import CampaignLetterCatchRound from "./CampaignLetterCatchRound";
import IdentifyingRound from "../games/IdentifyingRound";
import CampaignConnectionRound from "./CampaignConnectionRound";
import DrawLineBoard from "../games/drawline/DrawLineBoard";
import CampaignMissingSound01Round from "./CampaignMissingSound01Round";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { buildWordData } from "../../lib/picSliceGameData";
import { shortAWords } from "../../lib/shortAWords";
import { shortEWords } from "../../lib/shortEWords";
import { shortIWords } from "../../lib/shortIWords";
import { shortOWords } from "../../lib/shortOWords";
import { shortUWords } from "../../lib/shortUWords";

const LEVEL_NUM = 25;
const SCORED_ROUNDS = getScoredRounds("short-a", LEVEL_NUM);
const ALL_WORDS = [...shortAWords, ...shortEWords, ...shortIWords, ...shortOWords, ...shortUWords];
const findShortA = (w) => shortAWords.find((x) => x.word === w);

function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildIdentifyingRound(targetWord) {
  const target = findShortA(targetWord);
  const pool = ALL_WORDS.filter((w) => w.word !== targetWord);
  const choices = [target, ...shuffleArr(pool).slice(0, 2)].sort(() => Math.random() - 0.5);
  return { target, choices };
}

function buildDrawLineRound(wordNames, useLast = false) {
  const words = wordNames.map(findShortA);
  const topCards = words.map((w, i) => ({
    ...w,
    targetLetter: useLast ? w.word[w.word.length - 1] : w.word[0],
    id: `card-${i}-${w.word}`,
  }));
  const letters = topCards.map((c) => ({ letter: c.targetLetter, topCardId: c.id }));
  let shuffled = shuffleArr(letters);
  let tries = 0;
  while (tries < 20 && shuffled.some((l, i) => l.topCardId === topCards[i].id)) {
    shuffled = shuffleArr(letters);
    tries++;
  }
  return { topCards, bottomLetters: shuffled };
}

const ROUND_SEQUENCE = [
  { type: "rearrange",   word: "wax"                         },
  { type: "catch",       word: "tan",  missing: "t"          },
  { type: "catch",       word: "gap",  missing: "g"          },
  { type: "catch",       word: "dam",  missing: "d"          },
  { type: "identifying", word: "tax"                         },
  { type: "connection",  word: "tan"                         },
  { type: "drawline1",   words: ["wax", "tax", "dam"]        }, // first letter
  { type: "drawline2",   words: ["gap", "bag", "mad"]        }, // last letter
  { type: "missing",     word: "dam"                         },
];
const TOTAL_ROUNDS = ROUND_SEQUENCE.length;

function markComplete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][25] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function Level25({ onBack, lang = "en" }) {
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

  const rearrangeWordPair = useMemo(() => roundDef.type === "rearrange" ? [buildWordData(roundDef.word)] : null, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps
  const catchCard = useMemo(() => roundDef.type === "catch" ? findShortA(roundDef.word) : null, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps
  const identifyingRound = useMemo(() => roundDef.type === "identifying" ? buildIdentifyingRound(roundDef.word) : null, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps
  const connectionCard = useMemo(() => roundDef.type === "connection" ? buildWordData(roundDef.word) : null, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps
  const drawLineRound7 = useMemo(() => roundDef.type === "drawline1" ? buildDrawLineRound(roundDef.words, false) : null, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps
  const drawLineRound8 = useMemo(() => roundDef.type === "drawline2" ? buildDrawLineRound(roundDef.words, true) : null, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps
  const missingCard = useMemo(() => roundDef.type === "missing" ? findShortA(roundDef.word) : null, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} lang={lang} gameType={ROUND_SEQUENCE[roundIndex]?.type} />
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
            {roundDef.type === "rearrange" && rearrangeWordPair && (
              <PicSliceBoardEasy key={`rearrange-${roundIndex}`} wordPair={rearrangeWordPair} onRoundComplete={advance} lang={lang} onMistake={onMistake} />
            )}
            {roundDef.type === "catch" && catchCard && (
              <CampaignLetterCatchRound key={`catch-${roundIndex}`} word={catchCard.word} missingLetter={roundDef.missing} image={catchCard.image} audio={catchCard.audio} onComplete={advance} onMistake={onMistake} lang={lang} levelNum={LEVEL_NUM} roundIndex={roundIndex} />
            )}
            {roundDef.type === "identifying" && identifyingRound && (
              <IdentifyingRound key={`identifying-${roundIndex}`} round={identifyingRound} onComplete={advance} lang={lang} onMistake={onMistake} />
            )}
            {roundDef.type === "connection" && connectionCard && (
              <CampaignConnectionRound key={`connection-${roundIndex}`} card={connectionCard} onComplete={advance} onMistake={onMistake} lang={lang} levelNum={LEVEL_NUM} roundIndex={roundIndex} />
            )}
            {roundDef.type === "drawline1" && drawLineRound7 && (
              <DrawLineBoard key={`dl1-${roundIndex}`} round={drawLineRound7} onRoundComplete={advance} lang={lang} onMistake={onMistake} />
            )}
            {roundDef.type === "drawline2" && drawLineRound8 && (
              <DrawLineBoard key={`dl2-${roundIndex}`} round={drawLineRound8} onRoundComplete={advance} lang={lang} onMistake={onMistake} />
            )}
            {roundDef.type === "missing" && missingCard && (
              <CampaignMissingSound01Round key={`missing-${roundIndex}`} card={missingCard} onComplete={advance} onMistake={onMistake} lang={lang} levelNum={LEVEL_NUM} roundIndex={roundIndex} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}