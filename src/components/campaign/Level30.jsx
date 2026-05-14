/**
 * Level 30 — 9-round mixed review
 *
 * R1: Drag-the-Letters V2      — pal
 * R2: Missing Sound 0.1        — lab
 * R3: Letter Catch             — lad, missing l
 * R4: Letter-to-Sound Connection — cab (repeated-letter fix applied)
 * R5: Identifying              — cab
 * R6: Identifying              — sad
 * R7: Identifying              — bat
 * R8: Draw-a-Line              — mad(d), pal(l), ham(m) — last letter missing
 * R9: Rearrange Difficult mode — ban, lab
 */
import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackArrow from "../BackArrow";
import Level1DragV2 from "./Level1DragV2";
import CampaignMissingSound01Round from "./CampaignMissingSound01Round";
import CampaignLetterCatchRound from "./CampaignLetterCatchRound";
import CampaignConnectionRound from "./CampaignConnectionRound";
import IdentifyingRound from "../games/IdentifyingRound";
import DrawLineBoard from "../games/drawline/DrawLineBoard";
import PicSliceBoard from "../games/PicSliceBoard";
import LevelCompleteScreen from "./LevelCompleteScreen";
import HeartDisplay from "./HeartDisplay";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { buildWordData } from "../../lib/picSliceGameData";
import { buildShortASliceData } from "../../lib/buildShortASliceData";
import { shortAWords } from "../../lib/shortAWords";
import { shortEWords } from "../../lib/shortEWords";
import { shortIWords } from "../../lib/shortIWords";
import { shortOWords } from "../../lib/shortOWords";
import { shortUWords } from "../../lib/shortUWords";

const LEVEL_NUM = 30;
const SCORED_ROUNDS = getScoredRounds("short-a", LEVEL_NUM);
const findShortA = (w) => shortAWords.find((x) => x.word === w);
const ALL_WORDS = [...shortAWords, ...shortEWords, ...shortIWords, ...shortOWords, ...shortUWords];

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

// Draw-a-line: missing letter is the LAST letter of each word
function buildLastLetterDrawLineRound(wordNames) {
  const words = wordNames.map(findShortA);
  const topCards = words.map((w, i) => ({
    ...w,
    targetLetter: w.word[w.word.length - 1],
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
  { type: "drag",        word: "pal"                       },
  { type: "missing",     word: "lab"                       },
  { type: "catch",       word: "lad",  missing: "l"        },
  { type: "connection",  word: "cab"                       },
  { type: "identifying", word: "cab"                       },
  { type: "identifying", word: "sad"                       },
  { type: "identifying", word: "bat"                       },
  { type: "drawline",    words: ["mad", "pal", "ham"]      },
  { type: "rearrange",   words: ["ban", "lab"]             },
];
const TOTAL_ROUNDS = ROUND_SEQUENCE.length;

function markComplete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][30] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function Level30({ onBack, lang = "en" }) {
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

  const dragCard = useMemo(() => roundDef.type === "drag" ? findShortA(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const missingCard = useMemo(() => roundDef.type === "missing" ? findShortA(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const catchCard = useMemo(() => roundDef.type === "catch" ? findShortA(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const connectionCard = useMemo(() => roundDef.type === "connection" ? buildWordData(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const identifyingRound = useMemo(() => roundDef.type === "identifying" ? buildIdentifyingRound(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const drawLineRound = useMemo(() => roundDef.type === "drawline" ? buildLastLetterDrawLineRound(roundDef.words) : null, [roundIndex]); // eslint-disable-line
  const rearrangeWordPair = useMemo(() => roundDef.type === "rearrange" ? roundDef.words.map(buildShortASliceData) : null, [roundIndex]); // eslint-disable-line

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4, padding: "calc(env(safe-area-inset-top, 0px) + 8px) 16px 8px", borderBottom: "1.5px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.75)", backdropFilter: "blur(10px)" }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }}><p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1E293B" }}>{lang === "zh" ? "第 30 关 — 复习" : "Level 30 — Review"}</p></div>
        <HeartDisplay mistakes={mistakes} size={54} />
      </div>
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
            {roundDef.type === "drag" && dragCard && (
              <Level1DragV2 key={`drag-${roundIndex}`} card={dragCard} onComplete={advance} lang={lang} onMistake={onMistake} />
            )}
            {roundDef.type === "missing" && missingCard && (
              <CampaignMissingSound01Round key={`missing-${roundIndex}`} card={missingCard} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {roundDef.type === "catch" && catchCard && (
              <CampaignLetterCatchRound key={`catch-${roundIndex}`} word={catchCard.word} missingLetter={roundDef.missing} image={catchCard.image} audio={catchCard.audio} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {roundDef.type === "connection" && connectionCard && (
              <CampaignConnectionRound key={`conn-${roundIndex}`} card={connectionCard} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {roundDef.type === "identifying" && identifyingRound && (
              <IdentifyingRound key={`id-${roundIndex}`} round={identifyingRound} onComplete={advance} lang={lang} onMistake={onMistake} />
            )}
            {roundDef.type === "drawline" && drawLineRound && (
              <DrawLineBoard key={`dl-${roundIndex}`} round={drawLineRound} onRoundComplete={advance} lang={lang} onMistake={onMistake} />
            )}
            {roundDef.type === "rearrange" && rearrangeWordPair && (
              <PicSliceBoard key={`rearrange-${roundIndex}`} wordPair={rearrangeWordPair} onRoundComplete={advance} lang={lang} onMistake={onMistake} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}