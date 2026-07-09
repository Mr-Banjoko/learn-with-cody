/**
 * CVCChampionReviewLevel — shared engine for full-review levels (78–84).
 * Renders a configurable sequence of scored rounds. Round spec shapes:
 *   { type: "word_match",     word, choices: [4 strings, fakes allowed] }
 *   { type: "word_to_audio",  words: [4 real words] }
 *   { type: "missing01",      word, distractors: [3 letters] }
 *   { type: "drag_v2",        word, distractor: letter }
 *   { type: "identifying",    word, choices: [4 real words] }
 *   { type: "dictation",      word }
 *   { type: "writev2",        word }
 *   { type: "connection",     word }
 *   { type: "catch",          word, letter, distractors: [letters] }
 *   { type: "rearrange_easy", words: [1 word] }
 *   { type: "rearrange_hard", words: [2 words] }
 *   { type: "drawline",       words: [3 real words, matched on middle vowel] }
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import CampaignWordMatchRound from "./CampaignWordMatchRound";
import CampaignWordToAudioRound from "./CampaignWordToAudioRound";
import CampaignMissingSound01Round from "./CampaignMissingSound01Round";
import CampaignConnectionRound from "./CampaignConnectionRound";
import CampaignLetterCatchRound from "./CampaignLetterCatchRound";
import DictationCampaignRound from "./DictationCampaignRound";
import WriteV2CampaignRound from "./WriteV2CampaignRound";
import Level1DragV2 from "./Level1DragV2";
import IdentifyingRound from "../games/IdentifyingRound";
import PicSliceBoard from "../games/PicSliceBoard";
import PicSliceBoardEasy from "../games/PicSliceBoardEasy";
import DrawLineBoard from "../games/drawline/DrawLineBoard";
import LevelCompleteScreen from "./LevelCompleteScreen";
import { buildWordData } from "../../lib/picSliceGameData";
import { shortAWords } from "../../lib/shortAWords";
import { shortEWords } from "../../lib/shortEWords";
import { shortIWords } from "../../lib/shortIWords";
import { shortOWords } from "../../lib/shortOWords";
import { shortUWords } from "../../lib/shortUWords";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { useUserPhoto } from "../../lib/useUserPhoto";

const VOWEL_KEY = "cvc-champion";
const ALL_WORDS = [...shortAWords, ...shortEWords, ...shortIWords, ...shortOWords, ...shortUWords];
const findWord = (w) => ALL_WORDS.find((x) => x.word === w);

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Draw-a-line round: 3 word cards with the middle vowel missing, matched to shuffled letter tokens.
function buildDrawlineRound(words) {
  const topCards = words.map((w) => {
    const c = findWord(w);
    return { id: w, word: w, image: c.image, audio: c.audio, targetLetter: w[1], positionType: "middle" };
  });
  const bottomLetters = shuffle(topCards.map((c) => ({ letter: c.targetLetter, topCardId: c.id })))
    .map((l, i) => ({ ...l, botIdx: i }));
  return { topCards, bottomLetters };
}

function markComplete(levelNum) {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data[VOWEL_KEY]) data[VOWEL_KEY] = {};
    data[VOWEL_KEY][levelNum] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function CVCChampionReviewLevel({ levelNum, rounds, onBack, lang = "en" }) {
  const TOTAL_ROUNDS = rounds.length;
  const SCORED_ROUNDS = getScoredRounds(VOWEL_KEY, levelNum);
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const onMistake = useCallback(() => setMistakes((m) => m + 1), []);

  const advance = useCallback(() => {
    const next = roundIndex + 1;
    if (next >= TOTAL_ROUNDS) {
      markComplete(levelNum);
      const stars = calcStars(mistakes, SCORED_ROUNDS);
      saveLevelResult(VOWEL_KEY, levelNum, stars, mistakes);
      setEarnedStars(stars);
      setDone(true);
    } else {
      setRoundIndex(next);
    }
  }, [roundIndex, mistakes, TOTAL_ROUNDS, levelNum, SCORED_ROUNDS]);

  const round = rounds[roundIndex];
  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;

  const dragWord = useMemo(() => rounds.find((r) => r.type === "drag_v2")?.word || "sun", []); // eslint-disable-line
  const { photoUrl, clearPhoto } = useUserPhoto(dragWord);

  const roundData = useMemo(() => {
    if (round.type === "identifying") return { target: findWord(round.word), choices: shuffle(round.choices.map(findWord)) };
    if (round.type === "word_to_audio") return { choices: shuffle(round.words.map(findWord)) };
    if (round.type === "word_match") return { choices: shuffle(round.choices.map((w) => findWord(w) || { word: w })) };
    if (round.type === "rearrange_easy" || round.type === "rearrange_hard") return { wordPair: round.words.map(buildWordData) };
    if (round.type === "drawline") return { drawRound: buildDrawlineRound(round.words) };
    return {};
  }, [roundIndex]); // eslint-disable-line

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFF8 0%, #FFF9E6 60%, #E8F4FF 100%)", overflow: "hidden" }}>
      <LevelHeader levelNum={levelNum} mistakes={mistakes} onBack={onBack} lang={lang} vowelKey={VOWEL_KEY} gameType={round.type} />
      {!done && (
        <div style={{ height: 6, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
          <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #4ECDC4, #44A08D)" }} />
        </div>
      )}
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <LevelCompleteScreen levelNum={levelNum} stars={earnedStars} mistakes={mistakes} onBack={onBack} lang={lang} />
          </motion.div>
        ) : (
          <motion.div key={`round-${roundIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {round.type === "word_match" && (
              <CampaignWordMatchRound key={`wm-${roundIndex}`} card={findWord(round.word)} overrideChoices={roundData.choices} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "word_to_audio" && (
              <CampaignWordToAudioRound key={`wta-${roundIndex}`} card={findWord(round.words[0])} overrideChoices={roundData.choices} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "missing01" && (
              <CampaignMissingSound01Round key={`ms-${roundIndex}`} card={findWord(round.word)} forcedMissingPos={1} forcedDistractors={round.distractors} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "drag_v2" && (
              <Level1DragV2 key={`dv2-${roundIndex}`} card={findWord(round.word)} forcedDistractor={round.distractor} onComplete={advance} onMistake={onMistake} lang={lang} userPhotoUrl={round.word === dragWord ? photoUrl : null} onClearPhoto={clearPhoto} />
            )}
            {round.type === "identifying" && (
              <IdentifyingRound key={`id-${roundIndex}`} round={roundData} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "dictation" && (
              <DictationCampaignRound key={`dict-${roundIndex}`} card={findWord(round.word)} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "writev2" && (
              <WriteV2CampaignRound key={`wv2-${roundIndex}`} card={findWord(round.word)} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "connection" && (
              <CampaignConnectionRound key={`conn-${roundIndex}`} card={findWord(round.word)} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "catch" && (
              <CampaignLetterCatchRound key={`catch-${roundIndex}`} word={round.word} missingLetter={round.letter} image={findWord(round.word).image} audio={findWord(round.word).audio} forcedDistractorLetters={round.distractors} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "rearrange_easy" && (
              <PicSliceBoardEasy key={`re-${roundIndex}`} wordPair={roundData.wordPair} onRoundComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "rearrange_hard" && (
              <PicSliceBoard key={`rh-${roundIndex}`} wordPair={roundData.wordPair} onRoundComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "drawline" && (
              <DrawLineBoard key={`dl-${roundIndex}`} round={roundData.drawRound} onRoundComplete={advance} onMistake={onMistake} lang={lang} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}