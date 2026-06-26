/**
 * FinalMixLevel5 — Pack 1 Challenge
 * id: "final-mix-level-005"
 * levelType: "cumulative_challenge"
 * roundCount: 7
 * availableVowels: ["a", "o", "i"]
 *
 * Round sequence (all hardcoded):
 * 1. word_to_audio  — cot, mat, sit
 * 2. dictation      — bat
 * 3. identifying    — hit (vs cat, mop)
 * 4. drag_v2        — cat, distractorVowel "o"
 * 5. missing01      — pot, missingIndex 1 (vowel "o")
 * 6. word_match     — sit (choices: sit, sat, set, sot — sat/set/sot are vowel-trap fakes)
 * 7. catch          — mat, targetLetter "a", targetLetterIndex 1
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import LevelCompleteScreen from "./LevelCompleteScreen";
import CampaignWordToAudioRound from "./CampaignWordToAudioRound";
import DictationCampaignRound from "./DictationCampaignRound";
import IdentifyingRound from "../games/IdentifyingRound";
import Level1DragV2 from "./Level1DragV2";
import CampaignMissingSound01Round from "./CampaignMissingSound01Round";
import CampaignWordMatchRound from "./CampaignWordMatchRound";
import CampaignLetterCatchRound from "./CampaignLetterCatchRound";
import { shortAWords } from "../../lib/shortAWords";
import { shortOWords } from "../../lib/shortOWords";
import { shortIWords } from "../../lib/shortIWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { useUserPhoto } from "../../lib/useUserPhoto";

const CAMPAIGN_KEY = "final-mix";
const LEVEL_NUM = 5;
const SCORED_ROUNDS = getScoredRounds(CAMPAIGN_KEY, LEVEL_NUM);

const ALL_WORDS = [...shortAWords, ...shortOWords, ...shortIWords];
const fw = (w) => ALL_WORDS.find((x) => x.word === w);

// word_match for "sit": vowel-trap fakes isolate the short-i vowel
const WORD_MATCH_CHOICES_SIT = [
  fw("sit"),                                              // correct
  { word: "sat", image: null, audio: null },              // fake – short-a trap
  { word: "set", image: null, audio: null },              // fake – short-e trap
  { word: "sot", image: null, audio: null },              // fake – short-o trap
];

const ROUND_SEQUENCE = [
  { type: "word_to_audio", words: ["cot", "mat", "sit"] },
  { type: "dictation",     word: "bat" },
  { type: "identifying",   word: "hit",  distractors: ["cat", "mop"] },
  { type: "drag_v2",       word: "cat",  distractorVowel: "o" },
  { type: "missing01",     word: "pot",  missingPos: 1 },              // vowel "o"
  { type: "word_match",    word: "sit",  choices: WORD_MATCH_CHOICES_SIT },
  { type: "catch",         word: "mat",  targetLetter: "a", targetLetterIndex: 1 },
];
const TOTAL_ROUNDS = ROUND_SEQUENCE.length;

function markComplete() {
  try {
    const data = JSON.parse(localStorage.getItem("final_mix_progress") || "{}");
    data[LEVEL_NUM] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("final_mix_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function FinalMixLevel5({ onBack, lang = "en" }) {
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

  const wta_words     = useMemo(() => roundDef.type === "word_to_audio" ? roundDef.words : null, [roundIndex]); // eslint-disable-line
  const dictCard      = useMemo(() => roundDef.type === "dictation"     ? fw(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const identifyingRound = useMemo(() => {
    if (roundDef.type !== "identifying") return null;
    const target = fw(roundDef.word);
    const choices = [fw(roundDef.distractors[0]), target, fw(roundDef.distractors[1])];
    return { target, choices };
  }, [roundIndex]); // eslint-disable-line
  const dragCard      = useMemo(() => roundDef.type === "drag_v2"       ? fw(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const missCard      = useMemo(() => roundDef.type === "missing01"     ? fw(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const matchCard     = useMemo(() => roundDef.type === "word_match"    ? fw(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const catchCard     = useMemo(() => roundDef.type === "catch"         ? fw(roundDef.word) : null, [roundIndex]); // eslint-disable-line

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

            {roundDef.type === "word_to_audio" && wta_words && (
              <CampaignWordToAudioRound
                key={`wta-${roundIndex}`}
                words={wta_words}
                onComplete={advance}
                onMistake={onMistake}
                lang={lang}
              />
            )}

            {roundDef.type === "dictation" && dictCard && (
              <DictationCampaignRound
                key={`dict-${roundIndex}`}
                card={dictCard}
                onComplete={advance}
                onMistake={onMistake}
                lang={lang}
              />
            )}

            {roundDef.type === "identifying" && identifyingRound && (
              <IdentifyingRound
                key={`id-${roundIndex}`}
                round={identifyingRound}
                onComplete={advance}
                onMistake={onMistake}
                lang={lang}
                userPhotoUrl={userPhotoUrl}
                onClearPhoto={onClearPhoto}
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