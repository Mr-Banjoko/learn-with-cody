/**
 * FinalMixLevel4 — Pack 1 Intensive Practice
 * id: "final-mix-level-004"
 * levelType: "intensive_practice"
 * roundCount: 7
 * availableVowels: ["a", "o", "i"]
 *
 * Round sequence (all hardcoded):
 * 1. dictation    — cat
 * 2. drag_v2      — cot,  distractorVowel "a"
 * 3. missing01    — sit,  missingIndex 1 (vowel "i")
 * 4. word_match   — bat   (choices: bat, pot, sat, bit  — "sat"/"bit" are vowel-trap fakes)
 * 5. writev2      — hit
 * 6. rearrange    — mat
 * 7. catch        — mop,  targetLetter "o", targetLetterIndex 1
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import LevelCompleteScreen from "./LevelCompleteScreen";
import DictationCampaignRound from "./DictationCampaignRound";
import Level1DragV2 from "./Level1DragV2";
import CampaignMissingSound01Round from "./CampaignMissingSound01Round";
import CampaignWordMatchRound from "./CampaignWordMatchRound";
import WriteV2CampaignRound from "./WriteV2CampaignRound";
import PicSliceBoardEasy from "../games/PicSliceBoardEasy";
import CampaignLetterCatchRound from "./CampaignLetterCatchRound";
import { shortAWords } from "../../lib/shortAWords";
import { shortOWords } from "../../lib/shortOWords";
import { shortIWords } from "../../lib/shortIWords";
import { buildWordData } from "../../lib/picSliceGameData";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { useUserPhoto } from "../../lib/useUserPhoto";

const CAMPAIGN_KEY = "final-mix";
const LEVEL_NUM = 4;
const SCORED_ROUNDS = getScoredRounds(CAMPAIGN_KEY, LEVEL_NUM);

const ALL_WORDS = [...shortAWords, ...shortOWords, ...shortIWords];
const fw = (w) => ALL_WORDS.find((x) => x.word === w);

// word_match choices: real words only from Pack 1, vowel-trap fakes allowed in word_match only
const WORD_MATCH_CHOICES = [
  fw("bat"),    // correct
  fw("pot"),    // distractor (real)
  { word: "bot", image: null, audio: null },   // fake vowel-trap
  { word: "bit", image: null, audio: null },   // fake vowel-trap
];

const ROUND_SEQUENCE = [
  { type: "dictation",   word: "cat" },
  { type: "drag_v2",     word: "cot",  distractorVowel: "a" },
  { type: "missing01",   word: "sit",  missingPos: 1 },          // vowel "i"
  { type: "word_match",  word: "bat",  choices: WORD_MATCH_CHOICES },
  { type: "writev2",     word: "hit" },
  { type: "rearrange",   word: "mat" },
  { type: "catch",       word: "mop",  targetLetter: "o", targetLetterIndex: 1 },
];
const TOTAL_ROUNDS = ROUND_SEQUENCE.length;

function markComplete() {
  try {
    const data = JSON.parse(localStorage.getItem("final_mix_progress") || "{}");
    data[LEVEL_NUM] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("final_mix_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function FinalMixLevel4({ onBack, lang = "en" }) {
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
      saveLevelResult(CAMPAIGN_KEY, LEVEL_NUM, stars, mistakes);
      setEarnedStars(stars);
      setDone(true);
    } else {
      setRoundIndex(next);
    }
  }, [roundIndex, mistakes]);

  const roundDef = ROUND_SEQUENCE[roundIndex];
  const { photoUrl: userPhotoUrl, clearPhoto: onClearPhoto } = useUserPhoto(roundDef.word);
  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;

  const dictCard   = useMemo(() => roundDef.type === "dictation"  ? fw(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const dragCard   = useMemo(() => roundDef.type === "drag_v2"    ? fw(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const missCard   = useMemo(() => roundDef.type === "missing01"  ? fw(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const matchCard  = useMemo(() => roundDef.type === "word_match" ? fw(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const writeCard  = useMemo(() => roundDef.type === "writev2"    ? fw(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const rearrangeWordPair = useMemo(() => roundDef.type === "rearrange" ? [buildWordData(roundDef.word)] : null, [roundIndex]); // eslint-disable-line
  const catchCard  = useMemo(() => roundDef.type === "catch"      ? fw(roundDef.word) : null, [roundIndex]); // eslint-disable-line

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      fontFamily: "Fredoka, sans-serif",
      background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
      overflow: "hidden",
    }}>
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} lang={lang} gameType={roundDef?.type} />

      {!done && (
        <div style={{ height: 6, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
          <motion.div
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4 }}
            style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #4ECDC4, #4D96FF)" }}
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

            {roundDef.type === "dictation" && dictCard && (
              <DictationCampaignRound
                key={`dict-${roundIndex}`}
                card={dictCard}
                onComplete={advance}
                onMistake={onMistake}
                lang={lang}
              />
            )}

            {roundDef.type === "drag_v2" && dragCard && (
              <Level1DragV2
                key={`drag-${roundIndex}`}
                card={dragCard}
                onComplete={advance}
                onMistake={onMistake}
                lang={lang}
                userPhotoUrl={userPhotoUrl}
                onClearPhoto={onClearPhoto}
                distractorVowel={roundDef.distractorVowel}
              />
            )}

            {roundDef.type === "missing01" && missCard && (
              <CampaignMissingSound01Round
                key={`miss-${roundIndex}`}
                card={missCard}
                forcedMissingPos={roundDef.missingPos}
                onComplete={advance}
                onMistake={onMistake}
                lang={lang}
              />
            )}

            {roundDef.type === "word_match" && matchCard && (
              <CampaignWordMatchRound
                key={`match-${roundIndex}`}
                card={matchCard}
                overrideChoices={roundDef.choices}
                onComplete={advance}
                onMistake={onMistake}
                lang={lang}
                userPhotoUrl={userPhotoUrl}
                onClearPhoto={onClearPhoto}
              />
            )}

            {roundDef.type === "writev2" && writeCard && (
              <WriteV2CampaignRound
                key={`write-${roundIndex}`}
                card={writeCard}
                onComplete={advance}
                onMistake={onMistake}
                lang={lang}
                userPhotoUrl={userPhotoUrl}
                onClearPhoto={onClearPhoto}
              />
            )}

            {roundDef.type === "rearrange" && rearrangeWordPair && (
              <PicSliceBoardEasy
                key={`rearr-${roundIndex}`}
                wordPair={rearrangeWordPair}
                onRoundComplete={advance}
                onMistake={onMistake}
                lang={lang}
                mistakeGuide={[0, 1, 2]}
              />
            )}

            {roundDef.type === "catch" && catchCard && (
              <CampaignLetterCatchRound
                key={`catch-${roundIndex}`}
                word={catchCard.word}
                missingLetter={roundDef.targetLetter}
                image={userPhotoUrl || catchCard.image}
                audio={catchCard.audio}
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