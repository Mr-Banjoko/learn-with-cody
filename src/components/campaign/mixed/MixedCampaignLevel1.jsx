/**
 * MixedCampaignLevel1 — Five Vowel Sound Warm-Up
 * R1: letter_to_sound — a
 * R2: letter_to_sound — e
 * R3: letter_to_sound — i
 * R4: letter_to_sound — o
 * R5: letter_to_sound — u
 * R6: word_to_audio   — bed / big / dog / cup
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "../LevelHeader";
import LevelCompleteScreen from "../LevelCompleteScreen";
import CampaignConnectionRound from "../CampaignConnectionRound";
import CampaignWordToAudioRound from "../CampaignWordToAudioRound";
import { calcStars, saveLevelResult } from "../../../lib/campaignPerformance";
import { useRoundHintAudio, LOCK_OVERLAY_STYLE } from "../../../lib/useRoundHintAudio";
import { shortEWords } from "../../../lib/shortEWords";
import { shortIWords } from "../../../lib/shortIWords";
import { shortOWords } from "../../../lib/shortOWords";
import { shortUWords } from "../../../lib/shortUWords";
import { buildShortESliceData } from "../../../lib/buildShortESliceData";
import { buildShortISliceData } from "../../../lib/buildShortISliceData";
import { buildShortOSliceData } from "../../../lib/buildShortOSliceData";
import { buildShortUSliceData } from "../../../lib/buildShortUSliceData";
import { buildShortASliceData } from "../../../lib/buildShortASliceData";

const LEVEL_NUM = 1;
const VOWEL_KEY = "mixed";
const SCORED_ROUNDS = 6;

// letter_to_sound rounds use a single-letter "word" to drive CampaignConnectionRound
// We build a minimal 1-letter card that shows the letter and plays the letter sound
const LETTER_AUDIO_BASE = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/audio-feature/letter_sound/letter_sounds";

function buildLetterCard(letter, sliceBuilder, fullWord) {
  // Use the first word of the vowel group for the slice image context
  const sliceData = sliceBuilder(fullWord);
  const letterIdx = fullWord.indexOf(letter);
  return {
    word: letter,
    audio: `${LETTER_AUDIO_BASE}/${letter}.mp3`,
    image: sliceData.phonemes[letterIdx]?.sliceSrc || sliceData.image || "",
    fullImage: sliceData.phonemes[letterIdx]?.sliceSrc || sliceData.image || "",
    phonemes: [{ letter, audio: `${LETTER_AUDIO_BASE}/${letter}.mp3`, sliceSrc: sliceData.phonemes[letterIdx]?.sliceSrc || "" }],
  };
}

// Pre-build letter cards using mid-vowel slices from representative words
const LETTER_CARDS = {
  a: buildLetterCard("a", buildShortASliceData, "cat"),
  e: buildLetterCard("e", buildShortESliceData, "bed"),
  i: buildLetterCard("i", buildShortISliceData, "pig"),
  o: buildLetterCard("o", buildShortOSliceData, "dog"),
  u: buildLetterCard("u", buildShortUSliceData, "cup"),
};

const ROUND_SEQUENCE = [
  { type: "letter_to_sound", letter: "a" },
  { type: "letter_to_sound", letter: "e" },
  { type: "letter_to_sound", letter: "i" },
  { type: "letter_to_sound", letter: "o" },
  { type: "letter_to_sound", letter: "u" },
  { type: "word_to_audio",   words: ["bed", "big", "dog", "cup"] },
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

  const { locked: hintLocked, suppressAutoPlay } = useRoundHintAudio({ url: null });

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

  const letterCard = useMemo(() => {
    if (roundDef.type !== "letter_to_sound") return null;
    return LETTER_CARDS[roundDef.letter];
  }, [roundIndex]); // eslint-disable-line

  // word_to_audio takes exactly 3 words (the round spec has 4 — we pass the first 3: target + 2 distractors)
  // target: bed, options: big, dog (cup dropped to keep 3 per component contract)
  const wtaWords = useMemo(() => {
    if (roundDef.type !== "word_to_audio") return null;
    return ["bed", "big", "dog"];
  }, [roundIndex]); // eslint-disable-line

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFF8 0%, #FFF9E6 60%, #E8F4FF 100%)", overflow: "hidden" }}>
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} lang={lang} vowelKey="mixed" gameType={roundDef.type} />
      {!done && (
        <div style={{ height: 6, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
          <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #FF6B6B, #FFD93D, #4ECDC4, #9B5DE5)" }} />
        </div>
      )}
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <LevelCompleteScreen levelNum={LEVEL_NUM} stars={earnedStars} mistakes={mistakes} onBack={onBack} lang={lang} />
          </motion.div>
        ) : (
          <motion.div key={`round-${roundIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {roundDef.type === "letter_to_sound" && letterCard && (
              <CampaignConnectionRound key={`lts-${roundIndex}`} card={letterCard} onComplete={advance} lang={lang} onMistake={onMistake} suppressAutoPlay={suppressAutoPlay} />
            )}
            {roundDef.type === "word_to_audio" && wtaWords && (
              <CampaignWordToAudioRound key={`wta-${roundIndex}`} words={wtaWords} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {hintLocked && <div style={LOCK_OVERLAY_STYLE} onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}