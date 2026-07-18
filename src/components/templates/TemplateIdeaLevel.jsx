/**
 * TemplateIdeaLevel — template test batch: 1 learn round (cat) + one of every
 * game type used in campaign mode, all Short A words, wrapped in the chosen
 * template theme. TEST ONLY — nothing is saved (no stars, streak or progress).
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TemplateShell from "./TemplateShell";
import CodyArrow from "./CodyArrow";
import { TemplateThemeContext } from "../../lib/templateTheme";
import Level1Phonics from "../campaign/Level1Phonics";
import Level1DragV2 from "../campaign/Level1DragV2";
import CampaignMissingSound01Round from "../campaign/CampaignMissingSound01Round";
import CampaignConnectionRound from "../campaign/CampaignConnectionRound";
import CampaignLetterCatchRound from "../campaign/CampaignLetterCatchRound";
import CampaignWordMatchRound from "../campaign/CampaignWordMatchRound";
import CampaignWordToAudioRound from "../campaign/CampaignWordToAudioRound";
import DictationCampaignRound from "../campaign/DictationCampaignRound";
import WriteV2CampaignRound from "../campaign/WriteV2CampaignRound";
import IdentifyingRound from "../games/IdentifyingRound";
import PicSliceBoard from "../games/PicSliceBoard";
import PicSliceBoardEasy from "../games/PicSliceBoardEasy";
import DrawLineBoard from "../games/drawline/DrawLineBoard";
import { buildWordData } from "../../lib/picSliceGameData";
import { shortAWords } from "../../lib/shortAWords";

const findWord = (w) => shortAWords.find((x) => x.word === w);

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// One of every game type used in campaign mode, on Short A words.
const ROUNDS = [
  { type: "phonics",        word: "cat" },
  { type: "drag_v2",        word: "bat", distractor: "s" },
  { type: "missing01",      word: "hat", missingPos: 0 },
  { type: "connection",     word: "rat" },
  { type: "identifying",    word: "can", choices: ["can", "pan", "jam", "map"] },
  { type: "catch",          word: "cat", letter: "c", distractors: ["b", "s", "t"] },
  { type: "rearrange_easy", words: ["pan"] },
  { type: "rearrange_hard", words: ["mat", "map"] },
  { type: "drawline",       words: ["cat", "bat", "mat"] },
  { type: "word_match",     word: "dad", choices: ["dad", "sad", "mad", "ham"] },
  { type: "word_to_audio",  words: ["cat", "hat", "bat", "rat"] },
  { type: "dictation",      word: "jam" },
  { type: "writev2",        word: "pat" },
];
const TOTAL_ROUNDS = ROUNDS.length;

const TYPE_LABELS = {
  phonics: "Learn", drag_v2: "Drag", missing01: "Missing Sound", connection: "Connect",
  identifying: "Identify", catch: "Catch", rearrange_easy: "Rearrange", rearrange_hard: "Rearrange Hard",
  drawline: "Draw Line", word_match: "Word Match", word_to_audio: "Listen", dictation: "Dictation", writev2: "Write",
};

function buildDrawlineRound(words) {
  const topCards = words.map((w) => {
    const c = findWord(w);
    return { id: w, word: w, image: c.image, audio: c.audio, targetLetter: w[0], positionType: "initial" };
  });
  const bottomLetters = shuffle(topCards.map((c) => ({ letter: c.targetLetter, topCardId: c.id })))
    .map((l, i) => ({ ...l, botIdx: i }));
  return { topCards, bottomLetters };
}

export default function TemplateIdeaLevel({ theme, onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const onMistake = useCallback(() => setMistakes((m) => m + 1), []);

  const advance = useCallback(() => {
    const next = roundIndex + 1;
    if (next >= TOTAL_ROUNDS) setDone(true);
    else setRoundIndex(next);
  }, [roundIndex]);

  const restart = useCallback(() => {
    setRoundIndex(0);
    setMistakes(0);
    setDone(false);
  }, []);

  const round = ROUNDS[roundIndex];
  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;
  const label = `${theme.name} · R${roundIndex + 1}-${TYPE_LABELS[round.type]}`;

  const roundData = useMemo(() => {
    if (round.type === "identifying") return { target: findWord(round.word), choices: shuffle(round.choices.map(findWord)) };
    if (round.type === "word_to_audio") return { choices: shuffle(round.words.map(findWord)) };
    if (round.type === "word_match") return { choices: shuffle(round.choices.map((w) => findWord(w) || { word: w })) };
    if (round.type === "rearrange_easy" || round.type === "rearrange_hard") return { wordPair: round.words.map(buildWordData) };
    if (round.type === "drawline") return { drawRound: buildDrawlineRound(round.words) };
    return {};
  }, [roundIndex]); // eslint-disable-line

  const letterTheme = useMemo(() => ({ colors: theme.letterColors, textColor: theme.letterTextColor, frame: theme.frame }), [theme]);

  return (
    <TemplateThemeContext.Provider value={letterTheme}>
    <TemplateShell theme={theme} label={label} gameType={round.type} mistakes={mistakes} progressPct={done ? null : progressPct} onBack={onBack} lang={lang}>
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 24 }}>
            {/* World mascot celebration */}
            <CodyArrow
              src={theme.arrowImg}
              color={theme.arrowColor || theme.accent}
              animate={{ y: [0, -14, 0], rotate: [0, -4, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.4, repeatDelay: 0.6 }}
              style={{ width: 150, height: 94, objectFit: "contain" }}
            />
            {/* Animated stars */}
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              {[0, 1, 2].map((i) => (
                <motion.svg
                  key={i}
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.25 + i * 0.2, type: "spring", stiffness: 300, damping: 14 }}
                  width="38" height="38" viewBox="0 0 24 24" fill="#FFD93D" stroke="#F5A623" strokeWidth="1.2"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </motion.svg>
              ))}
            </div>
            <p style={{ margin: "6px 0 0", fontSize: 24, fontWeight: 700, color: theme.labelColor, textAlign: "center", lineHeight: 1.2 }}>
              {lang === "zh"
                ? `你探索了${theme.worldNameZh}！`
                : `You explored ${theme.worldName}!`}
            </p>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: theme.labelColor, opacity: 0.7, textAlign: "center" }}>
              {lang === "zh" ? "模板测试完成" : "Template test complete"}
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
              <button onClick={restart} style={{ border: "none", borderRadius: 99, padding: "12px 24px", fontSize: 16, fontWeight: 700, fontFamily: "Fredoka, sans-serif", color: "white", background: theme.accent, cursor: "pointer" }}>
                {lang === "zh" ? "再玩一次" : "Play Again"}
              </button>
              <button onClick={onBack} style={{ border: `2px solid ${theme.accent}`, borderRadius: 99, padding: "12px 24px", fontSize: 16, fontWeight: 700, fontFamily: "Fredoka, sans-serif", color: theme.accent, background: "rgba(255,255,255,0.85)", cursor: "pointer" }}>
                {lang === "zh" ? "返回" : "Back"}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key={`round-${roundIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {round.type === "phonics" && (
              <Level1Phonics card={findWord(round.word)} theme={theme} onNext={advance} lang={lang} isFirstCard={false} />
            )}
            {round.type === "drag_v2" && (
              <Level1DragV2 key={`dv2-${roundIndex}`} card={findWord(round.word)} forcedDistractor={round.distractor} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "missing01" && (
              <CampaignMissingSound01Round key={`ms-${roundIndex}`} card={findWord(round.word)} forcedMissingPos={round.missingPos} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "connection" && (
              <CampaignConnectionRound key={`conn-${roundIndex}`} card={findWord(round.word)} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "identifying" && (
              <IdentifyingRound key={`id-${roundIndex}`} round={roundData} onComplete={advance} onMistake={onMistake} lang={lang} />
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
            {round.type === "word_match" && (
              <CampaignWordMatchRound key={`wm-${roundIndex}`} card={findWord(round.word)} overrideChoices={roundData.choices} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "word_to_audio" && (
              <CampaignWordToAudioRound key={`wta-${roundIndex}`} card={findWord(round.words[0])} overrideChoices={roundData.choices} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "dictation" && (
              <DictationCampaignRound key={`dict-${roundIndex}`} card={findWord(round.word)} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
            {round.type === "writev2" && (
              <WriteV2CampaignRound key={`wv2-${roundIndex}`} card={findWord(round.word)} onComplete={advance} onMistake={onMistake} lang={lang} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </TemplateShell>
    </TemplateThemeContext.Provider>
  );
}