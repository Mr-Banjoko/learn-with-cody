/**
 * FinalMixLevel3 — Pack 1 Guided Practice
 * id: "final-mix-level-003"
 * levelType: "guided_practice"
 * roundCount: 6
 * availableVowels: ["a", "o", "i"]
 *
 * Round sequence (all hardcoded):
 * 1. word_to_audio  — cat, cot, sit
 * 2. identifying    — bat (vs pot, hit)
 * 3. missing01      — mat, missingIndex 1 (vowel "a")
 * 4. drag_v2        — mop, distractorVowel "a"
 * 5. connection     — pot
 * 6. draw-a-line    — cat (initial), sit (final), bat (initial)
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LevelHeader from "./LevelHeader";
import LevelCompleteScreen from "./LevelCompleteScreen";
import CampaignWordToAudioRound from "./CampaignWordToAudioRound";
import IdentifyingRound from "../games/IdentifyingRound";
import CampaignMissingSound01Round from "./CampaignMissingSound01Round";
import Level1DragV2 from "./Level1DragV2";
import CampaignConnectionRound from "./CampaignConnectionRound";
import DrawLineBoard from "../games/drawline/DrawLineBoard";
import { shortAWords } from "../../lib/shortAWords";
import { shortOWords } from "../../lib/shortOWords";
import { shortIWords } from "../../lib/shortIWords";
import { buildWordData } from "../../lib/picSliceGameData";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
import { useUserPhoto } from "../../lib/useUserPhoto";

const CAMPAIGN_KEY = "final-mix";
const LEVEL_NUM = 3;
const SCORED_ROUNDS = getScoredRounds(CAMPAIGN_KEY, LEVEL_NUM);

const ALL_WORDS = [...shortAWords, ...shortOWords, ...shortIWords];
const fw = (w) => ALL_WORDS.find((x) => x.word === w);

// Hardcoded round sequence
const ROUND_SEQUENCE = [
  { type: "word_to_audio", words: ["cat", "cot", "sit"] },
  { type: "identifying",   word: "bat",  distractors: ["pot", "hit"] },
  { type: "missing01",     word: "mat",  missingPos: 1 },              // vowel "a"
  { type: "drag_v2",       word: "mop",  distractorVowel: "a" },
  { type: "connection",    word: "pot" },
  { type: "drawline",      words: [
      { word: "cat", position: "initial" },
      { word: "sit", position: "final"   },
      { word: "bat", position: "initial" },
    ]
  },
];
const TOTAL_ROUNDS = ROUND_SEQUENCE.length;

// Build a hardcoded draw-line round (no randomness — words & positions are fixed above)
function buildDrawLineRound(wordDefs) {
  const topCards = wordDefs.map((def, i) => {
    const card = fw(def.word);
    return {
      ...card,
      targetLetter: def.position === "initial" ? def.word[0] : def.word[def.word.length - 1],
      positionType: def.position,
      id: `dlcard-${i}-${def.word}`,
    };
  });
  // Build bottom letters shuffled so none align with their top card
  const letters = topCards.map((c) => ({ letter: c.targetLetter, topCardId: c.id, botIdx: 0 }));
  // Fixed shuffle: move each one position right (guaranteed non-aligned)
  const bottomLetters = [
    { ...letters[1], botIdx: 0 },
    { ...letters[2], botIdx: 1 },
    { ...letters[0], botIdx: 2 },
  ];
  return { topCards, bottomLetters };
}

function markComplete() {
  try {
    const data = JSON.parse(localStorage.getItem("final_mix_progress") || "{}");
    data[LEVEL_NUM] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("final_mix_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function FinalMixLevel3({ onBack, lang = "en" }) {
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
  const { photoUrl: userPhotoUrl, clearPhoto: onClearPhoto } = useUserPhoto(
    roundDef.word || (roundDef.words && !roundDef.words[0]?.position ? roundDef.words[0] : null)
  );
  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;

  // Pre-build round data
  const wta_cards = useMemo(() => roundDef.type === "word_to_audio" ? roundDef.words : null, [roundIndex]); // eslint-disable-line
  const identifyingRound = useMemo(() => {
    if (roundDef.type !== "identifying") return null;
    const target = fw(roundDef.word);
    const choices = [target, ...roundDef.distractors.map(fw)];
    // Fixed shuffle: target stays in position 0 then rotate
    return { target, choices: [choices[1], choices[0], choices[2]] };
  }, [roundIndex]); // eslint-disable-line
  const missingCard  = useMemo(() => roundDef.type === "missing01"  ? fw(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const dragCard     = useMemo(() => roundDef.type === "drag_v2"    ? fw(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const connCard     = useMemo(() => roundDef.type === "connection"  ? buildWordData(roundDef.word) : null, [roundIndex]); // eslint-disable-line
  const drawLineRound = useMemo(() => roundDef.type === "drawline"  ? buildDrawLineRound(roundDef.words) : null, [roundIndex]); // eslint-disable-line

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

            {roundDef.type === "word_to_audio" && wta_cards && (
              <CampaignWordToAudioRound
                key={`wta-${roundIndex}`}
                words={wta_cards}
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

            {roundDef.type === "missing01" && missingCard && (
              <CampaignMissingSound01Round
                key={`miss-${roundIndex}`}
                card={missingCard}
                forcedMissingPos={roundDef.missingPos}
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
              />
            )}

            {roundDef.type === "connection" && connCard && (
              <CampaignConnectionRound
                key={`conn-${roundIndex}`}
                card={connCard}
                onComplete={advance}
                onMistake={onMistake}
                lang={lang}
              />
            )}

            {roundDef.type === "drawline" && drawLineRound && (
              <div key={`dl-${roundIndex}`} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <DrawLineBoard
                  round={drawLineRound}
                  onRoundComplete={advance}
                  onMistake={onMistake}
                  lang={lang}
                />
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}