/**
 * PlacementTest — folder 2 on the homepage.
 * A single-level flow that runs 4 sub-tests (23 fixed rounds) gauging the
 * learner's letter-sound level. Uses the campaign template (header +
 * progress bar + completion screen) but WITHOUT hearts or hint buttons.
 *
 * Round types reuse the logic from the Test Zone games, customized with
 * fixed round data and the campaign round interface (onComplete / onMistake).
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PlacementHeader from "./PlacementHeader";
import PlacementLetter3Sounds from "./PlacementLetter3Sounds";
import PlacementSound3Letters from "./PlacementSound3Letters";
import PlacementUpperLower from "./PlacementUpperLower";
import PlacementLetterIsSoundIs from "./PlacementLetterIsSoundIs";
import PlacementResult from "./PlacementResult";
import { PLACEMENT_ROUNDS, PLACEMENT_TOTAL } from "../../lib/placementRounds";
import { calcStars } from "../../lib/campaignPerformance";

const SCORED_ROUNDS = PLACEMENT_TOTAL; // every round is scored

export default function PlacementTest({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [stars, setStars] = useState(0);

  const onMistake = useCallback(() => setMistakes((m) => m + 1), []);

  const advance = useCallback(() => {
    const next = roundIndex + 1;
    if (next >= PLACEMENT_TOTAL) {
      setStars(calcStars(mistakes, SCORED_ROUNDS));
      setDone(true);
    } else {
      setRoundIndex(next);
    }
  }, [roundIndex, mistakes]);

  const current = PLACEMENT_ROUNDS[roundIndex];
  const progressPct = (roundIndex / PLACEMENT_TOTAL) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <PlacementHeader onBack={onBack} lang={lang} />
      {!done && (
        <div style={{ height: 6, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
          <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #4ECDC4, #4D96FF)" }} />
        </div>
      )}
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <PlacementResult stars={stars} onBack={onBack} lang={lang} />
          </motion.div>
        ) : (
          <motion.div key={`round-${roundIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {current.type === "letter3sounds" && (
              <PlacementLetter3Sounds key={`l-${roundIndex}`} round={current.round} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {current.type === "sound3letters" && (
              <PlacementSound3Letters key={`s-${roundIndex}`} round={current.round} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {current.type === "upperlower" && (
              <PlacementUpperLower key={`u-${roundIndex}`} round={current.round} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {current.type === "letterissoundis" && (
              <PlacementLetterIsSoundIs key={`ls-${roundIndex}`} round={current.round} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}