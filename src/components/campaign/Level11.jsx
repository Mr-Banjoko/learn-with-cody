/**
 * Level 11 — 10-round sequence:
 *  Odd rounds  (1,3,5,7,9): Learn Phonics (Level1Phonics)
 *  Even rounds (2,4,6,8,10): drag-the-missing-sound 0.1 (CampaignMissingSound01Round)
 *
 * Words (order): sad, sat, pat, mad, ham
 *
 * Round map:
 *  1. sad — phonics
 *  2. sad — missing sound 0.1
 *  3. sat — phonics
 *  4. sat — missing sound 0.1
 *  5. pat — phonics
 *  6. pat — missing sound 0.1
 *  7. mad — phonics
 *  8. mad — missing sound 0.1
 *  9. ham — phonics
 * 10. ham — missing sound 0.1 → marks level complete
 */
import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import Level1Phonics from "./Level1Phonics";
import LevelCompleteScreen from "./LevelCompleteScreen";
import HeartDisplay from "./HeartDisplay";
import CampaignMissingSound01Round from "./CampaignMissingSound01Round";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { shortAWords } from "../../lib/shortAWords";

const LEVEL_NUM = 11;
const SCORED_ROUNDS = getScoredRounds("short-a", LEVEL_NUM);

const findWord = (w) => shortAWords.find((x) => x.word === w);

const ROUNDS = [
  { type: "phonics",  card: findWord("sad")                    }, // 1
  { type: "missing",  card: findWord("sad"), missingPos: 0     }, // 2  — missing: s (pos 0)
  { type: "phonics",  card: findWord("sat")                    }, // 3
  { type: "missing",  card: findWord("sat"), missingPos: 1     }, // 4  — missing: a (pos 1)
  { type: "phonics",  card: findWord("pat")                    }, // 5
  { type: "missing",  card: findWord("pat"), missingPos: 2     }, // 6  — missing: t (pos 2)
  { type: "phonics",  card: findWord("mad")                    }, // 7
  { type: "missing",  card: findWord("mad"), missingPos: 2     }, // 8  — missing: d (pos 2)
  { type: "phonics",  card: findWord("ham")                    }, // 9
  { type: "missing",  card: findWord("ham"), missingPos: 0     }, // 10 — missing: h (pos 0)
];

const TOTAL_ROUNDS = ROUNDS.length;

function markLevel11Complete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][11] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function Level11({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [direction, setDirection] = useState(1);
  const [mistakes, setMistakes] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const onMistake = useCallback(() => setMistakes((m) => m + 1), []);

  const advance = () => {
    setDirection(1);
    const nextIndex = roundIndex + 1;
    if (nextIndex >= TOTAL_ROUNDS) {
      markLevel11Complete();
      const stars = calcStars(mistakes, SCORED_ROUNDS);
      saveLevelResult("short-a", LEVEL_NUM, stars, mistakes);
      setEarnedStars(stars);
      setDone(true);
    } else {
      setRoundIndex(nextIndex);
    }
  };

  const round = ROUNDS[roundIndex];
  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;

  return (
    <div
      style={{
        display: "flex", flexDirection: "column", height: "100%",
        fontFamily: "Fredoka, sans-serif",
        background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
        overflow: "hidden",
      }}
    >
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} lang={lang} gameType={ROUNDS[roundIndex]?.type} />

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
          <motion.div key={`round-${roundIndex}`} initial={{ opacity: 0, x: direction * 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: direction * -40 }} transition={{ duration: 0.22 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {round.type === "phonics" ? (
              <Level1Phonics card={round.card} onNext={advance} lang={lang} isFirstCard={false} />
            ) : (
              <CampaignMissingSound01Round
                key={`missing-${roundIndex}`}
                card={round.card}
                forcedMissingPos={round.missingPos}
                onComplete={advance}
                onMistake={onMistake}
                lang={lang}
                levelNum={LEVEL_NUM}
                roundIndex={roundIndex}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}