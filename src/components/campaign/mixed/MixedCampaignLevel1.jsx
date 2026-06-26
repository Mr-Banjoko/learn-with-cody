/**
 * MixedCampaignLevel1 — Five Vowel Sound Warm-Up
 * R1: vowel_sound — target: a  (choices from a,e,i,o,u)
 * R2: vowel_sound — target: e  (choices from a,e,i,o,u)
 * R3: vowel_sound — target: i  (choices from a,e,i,o,u)
 * R4: vowel_sound — target: o  (choices from a,e,i,o,u)
 * R5: vowel_sound — target: u  (choices from a,e,i,o,u)
 * R6: word_to_audio — bed / big / dog
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "../LevelHeader";
import LevelCompleteScreen from "../LevelCompleteScreen";
import CampaignVowelSoundRound from "./CampaignVowelSoundRound";
import CampaignWordToAudioRound from "../CampaignWordToAudioRound";
import { calcStars, saveLevelResult } from "../../../lib/campaignPerformance";

const LEVEL_NUM = 1;
const VOWEL_KEY = "mixed";
const SCORED_ROUNDS = 6;

const ROUND_SEQUENCE = [
  { type: "vowel_sound", letter: "a" },
  { type: "vowel_sound", letter: "e" },
  { type: "vowel_sound", letter: "i" },
  { type: "vowel_sound", letter: "o" },
  { type: "vowel_sound", letter: "u" },
  { type: "word_to_audio", words: ["bed", "big", "dog"] },
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

export default function MixedCampaignLevel1({ onBack, lang = "en" }) {
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

  const roundDef = ROUND_SEQUENCE[roundIndex];
  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFF8 0%, #FFF9E6 60%, #E8F4FF 100%)", overflow: "hidden" }}>
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} lang={lang} vowelKey="mixed" gameType={roundDef.type} />
      {!done && (
        <div style={{ height: 6, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
          <motion.div
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4 }}
            style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #FF6B6B, #FFD93D, #4ECDC4, #9B5DE5)" }}
          />
        </div>
      )}
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <LevelCompleteScreen levelNum={LEVEL_NUM} stars={earnedStars} mistakes={mistakes} onBack={onBack} lang={lang} />
          </motion.div>
        ) : (
          <motion.div key={`round-${roundIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {roundDef.type === "vowel_sound" && (
              <CampaignVowelSoundRound
                key={`vs-${roundIndex}`}
                targetLetter={roundDef.letter}
                onComplete={advance}
                onMistake={onMistake}
                lang={lang}
              />
            )}
            {roundDef.type === "word_to_audio" && (
              <CampaignWordToAudioRound
                key={`wta-${roundIndex}`}
                words={roundDef.words}
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