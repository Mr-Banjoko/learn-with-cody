/**
 * FinalMixLevel2 — Learn Pack 1
 * id: "final-mix-level-002"
 * levelType: "learn"
 * 8 word cards: cat, cot, sit, bat, pot, hit, mat, mop
 * Pure discovery — no quiz, no penalty.
 * Picture, letters, and word label are all interactive (audio).
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import FinalMixLearnCard from "./FinalMixLearnCard";
import LevelCompleteScreen from "./LevelCompleteScreen";
import { shortAWords } from "../../lib/shortAWords";
import { shortOWords } from "../../lib/shortOWords";
import { shortIWords } from "../../lib/shortIWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { useUserPhoto } from "../../lib/useUserPhoto";

const CAMPAIGN_KEY = "final-mix";
const LEVEL_NUM = 2;
const SCORED_ROUNDS = getScoredRounds(CAMPAIGN_KEY, LEVEL_NUM);

const ALL_WORDS = [...shortAWords, ...shortOWords, ...shortIWords];
const findWord = (w) => ALL_WORDS.find((x) => x.word === w);

// Hardcoded Pack 1 learn sequence
const CARDS = [
  findWord("cat"),
  findWord("cot"),
  findWord("sit"),
  findWord("bat"),
  findWord("pot"),
  findWord("hit"),
  findWord("mat"),
  findWord("mop"),
];

const TOTAL_CARDS = CARDS.length;

function markComplete() {
  try {
    const data = JSON.parse(localStorage.getItem("final_mix_progress") || "{}");
    data[LEVEL_NUM] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("final_mix_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function FinalMixLevel2({ onBack, lang = "en" }) {
  const [cardIndex, setCardIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [earnedStars, setEarnedStars] = useState(3); // Learn levels always award 3 stars

  const advance = useCallback(() => {
    const next = cardIndex + 1;
    if (next >= TOTAL_CARDS) {
      markComplete();
      saveLevelResult(CAMPAIGN_KEY, LEVEL_NUM, 3, 0);
      setEarnedStars(3);
      setDone(true);
    } else {
      setCardIndex(next);
    }
  }, [cardIndex]);

  const card = CARDS[cardIndex];
  const { photoUrl: userPhotoUrl } = useUserPhoto(card?.word);
  const progressPct = (cardIndex / TOTAL_CARDS) * 100;

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      fontFamily: "Fredoka, sans-serif",
      background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
      overflow: "hidden",
    }}>
      <LevelHeader levelNum={LEVEL_NUM} mistakes={0} onBack={onBack} lang={lang} gameType="learn" />

      {!done && (
        <div style={{ height: 6, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
          <motion.div
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4 }}
            style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #4ECDC4, #4D96FF)" }}
          />
        </div>
      )}

      {/* Card counter */}
      {!done && (
        <div style={{ flexShrink: 0, display: "flex", justifyContent: "center", gap: 6, padding: "6px 0 2px" }}>
          {CARDS.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                background: i < cardIndex ? "#4ECDC4" : i === cardIndex ? "#4D96FF" : "rgba(168,208,230,0.4)",
                scale: i === cardIndex ? 1.3 : 1,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              style={{ width: 10, height: 10, borderRadius: 99 }}
            />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            <LevelCompleteScreen levelNum={LEVEL_NUM} stars={earnedStars} mistakes={0} onBack={onBack} lang={lang} />
          </motion.div>
        ) : (
          <motion.div
            key={`card-${cardIndex}`}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.22 }}
            style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            {card && (
              <FinalMixLearnCard
                card={card}
                userPhotoUrl={userPhotoUrl}
                isActive={true}
                onNext={advance}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}