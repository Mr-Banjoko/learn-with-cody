/**
 * Level 35 — 9-round Mixed Review
 *
 * R1:  Dictation              — jab
 * R2:  Dictation              — fan
 * R3:  Drag the Letters V2    — nab
 * R4:  Letter-to-Sound Conn.  — man  (repeated-letter fix applied)
 * R5:  Letter Catch           — dab, missing d
 * R6:  Draw-a-Line            — jar(j), ban(n), jam(a) — missing first, last, middle
 * R7:  Identifying (word match)— fan
 * R8:  Identifying (word match)— man
 * R9:  Identifying (word match)— jab
 */
import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import DictationCampaignRound from "./DictationCampaignRound";
import Level1DragV2 from "./Level1DragV2";
import CampaignConnectionRound from "./CampaignConnectionRound";
import CampaignLetterCatchRound from "./CampaignLetterCatchRound";
import DrawLineBoard from "../games/drawline/DrawLineBoard";
import CampaignWordMatchRound from "./CampaignWordMatchRound";
import LevelCompleteScreen from "./LevelCompleteScreen";
import HeartDisplay from "./HeartDisplay";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { buildShortASliceData } from "../../lib/buildShortASliceData";
import { shortAWords } from "../../lib/shortAWords";
import { shortEWords } from "../../lib/shortEWords";
import { shortIWords } from "../../lib/shortIWords";
import { shortOWords } from "../../lib/shortOWords";
import { shortUWords } from "../../lib/shortUWords";

const LEVEL_NUM = 35;
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


/**
 * Draw-a-line round for R6: jar(j), ban(n), jam(a)
 * targetLetter is the MISSING letter for each word:
 *   jar → missing j (first)
 *   ban → missing n (last)
 *   jam → missing a (middle)
 */
function buildR6DrawLineRound() {
  const wordDefs = [
    { word: "jar", targetLetter: "j" },
    { word: "ban", targetLetter: "n" },
    { word: "jam", targetLetter: "a" },
  ];
  const topCards = wordDefs.map((def, i) => ({
    ...findShortA(def.word),
    targetLetter: def.targetLetter,
    id: `card-${i}-${def.word}`,
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
  { type: "dictation",   word: "jab"                      }, // R1
  { type: "dictation",   word: "fan"                      }, // R2
  { type: "drag",        word: "nab"                      }, // R3
  { type: "connection",  word: "man"                      }, // R4
  { type: "catch",       word: "dab", missing: "d"        }, // R5
  { type: "drawline"                                       }, // R6
  { type: "identifying", word: "fan"                      }, // R7
  { type: "identifying", word: "man"                      }, // R8
  { type: "identifying", word: "jab"                      }, // R9
];

const TOTAL_ROUNDS = ROUND_SEQUENCE.length;

function markLevel35Complete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][35] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function Level35({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const onMistake = useCallback(() => setMistakes((m) => m + 1), []);

  const advance = useCallback(() => {
    const next = roundIndex + 1;
    if (next >= TOTAL_ROUNDS) {
      markLevel35Complete();
      const stars = calcStars(mistakes, SCORED_ROUNDS);
      saveLevelResult("short-a", LEVEL_NUM, stars, mistakes);
      setEarnedStars(stars);
      setDone(true);
    } else setRoundIndex(next);
  }, [roundIndex, mistakes]);

  const roundDef = ROUND_SEQUENCE[roundIndex];
  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;

  const dictationCard = useMemo(() => roundDef.type === "dictation" ? findShortA(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const dragCard = useMemo(() => roundDef.type === "drag" ? findShortA(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const connectionCard = useMemo(() => roundDef.type === "connection" ? buildShortASliceData(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const catchCard = useMemo(() => roundDef.type === "catch" ? findShortA(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const drawLineRound = useMemo(() => roundDef.type === "drawline" ? buildR6DrawLineRound() : null, [roundIndex]); // eslint-disable-line
  const wordMatchCard = useMemo(() => roundDef.type === "identifying" ? findShortA(roundDef.word) : null, [roundIndex]); // eslint-disable-line

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} />
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
            {roundDef.type === "dictation" && dictationCard && (
              <DictationCampaignRound key={`dict-${roundIndex}`} card={dictationCard} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {roundDef.type === "drag" && dragCard && (
              <Level1DragV2 key={`drag-${roundIndex}`} card={dragCard} onComplete={advance} lang={lang} onMistake={onMistake} />
            )}
            {roundDef.type === "connection" && connectionCard && (
              <CampaignConnectionRound key={`conn-${roundIndex}`} card={connectionCard} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {roundDef.type === "catch" && catchCard && (
              <CampaignLetterCatchRound key={`catch-${roundIndex}`} word={catchCard.word} missingLetter={roundDef.missing} image={catchCard.image} audio={catchCard.audio} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {roundDef.type === "drawline" && drawLineRound && (
              <DrawLineBoard key={`dl-${roundIndex}`} round={drawLineRound} onRoundComplete={advance} lang={lang} onMistake={onMistake} />
            )}
            {roundDef.type === "identifying" && wordMatchCard && (
              <CampaignWordMatchRound key={`wm-${roundIndex}`} card={wordMatchCard} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}