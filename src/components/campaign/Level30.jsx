/**
 * Level 30 — 6-round mixed review
 *
 * Round order:
 *  1. Word Match         → cab
 *  2. Identifying        → pal
 *  3. Drag the Letters V2 → ban
 *  4. Draw a Line        → lab, mad, bat
 *  5. Rearrange → Easy   → lad
 *  6. Drag the Letters V2 → cab
 */
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2 } from "lucide-react";
import BackArrow from "../BackArrow";
import Level1DragV2 from "./Level1DragV2";
import PicSliceBoardEasy from "../games/PicSliceBoardEasy";
import IdentifyingRound from "../games/IdentifyingRound";
import DrawLineBoard from "../games/drawline/DrawLineBoard";
import LevelCompleteScreen from "./LevelCompleteScreen";
import HeartDisplay from "./HeartDisplay";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
const LEVEL_NUM = 30;
const SCORED_ROUNDS = getScoredRounds("short-a", LEVEL_NUM);
import { buildWordData } from "../../lib/picSliceGameData";
import { shortAWords } from "../../lib/shortAWords";
import { shortEWords } from "../../lib/shortEWords";
import { shortIWords } from "../../lib/shortIWords";
import { shortOWords } from "../../lib/shortOWords";
import { shortUWords } from "../../lib/shortUWords";
import { playAudio } from "../../lib/useAudio";

const findWord = (w) => shortAWords.find((x) => x.word === w);
const ALL_WORDS = [...shortAWords, ...shortEWords, ...shortIWords, ...shortOWords, ...shortUWords];

function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildIdentifyingRound(targetWord) {
  const target = shortAWords.find((w) => w.word === targetWord);
  const pool = ALL_WORDS.filter((w) => w.word !== targetWord);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const choices = [target, ...shuffled.slice(0, 2)].sort(() => Math.random() - 0.5);
  return { target, choices };
}

function buildFixedDrawLineRound(wordNames) {
  const words = wordNames.map(findWord);
  const topCards = words.map((w, i) => ({ ...w, targetLetter: w.word[0], id: `card-${i}-${w.word}` }));
  const letters = topCards.map((c) => ({ letter: c.targetLetter, topCardId: c.id }));
  let shuffledLetters = shuffleArr(letters);
  let tries = 0;
  while (tries < 20 && shuffledLetters.some((l, i) => l.topCardId === topCards[i].id)) {
    shuffledLetters = shuffleArr(letters);
    tries++;
  }
  return { topCards, bottomLetters: shuffledLetters };
}

// ── Inline Word Match (single-round, fixed distractors) ─────────────────────
function WordMatchRound({ targetWord, distractorWords, onComplete }) {
  const target = useMemo(() => findWord(targetWord), [targetWord]);
  const round = useMemo(() => {
    const distractors = distractorWords.map(findWord).filter(Boolean);
    const choices = [...distractors, target].sort(() => Math.random() - 0.5);
    return { target, choices };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const autoPlayedRef = useRef(false);

  useEffect(() => {
    if (!autoPlayedRef.current && round.target.audio) {
      autoPlayedRef.current = true;
      const t = setTimeout(() => playAudio(round.target.audio), 400);
      return () => clearTimeout(t);
    }
  }, [round.target.audio]);

  const handleChoice = useCallback((choice) => {
    if (feedback) return;
    setSelected(choice.word);
    const correct = choice.word === round.target.word;
    setFeedback(correct ? "correct" : "wrong");
    if (correct && round.target.audio) playAudio(round.target.audio);
    setTimeout(() => {
      if (correct) onComplete();
      else { setFeedback(null); setSelected(null); }
    }, correct ? 1200 : 800);
  }, [feedback, round, onComplete]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 16px 20px", gap: 14, overflow: "hidden", minHeight: 0 }}>
      <div style={{ background: "white", borderRadius: 24, padding: 12, boxShadow: "0 10px 36px rgba(30,58,95,0.13)", border: "3px solid #A8D0E644", width: "min(260px, calc(100vw - 48px))", flexShrink: 0 }}>
        <img src={round.target.image} alt="" style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 16, display: "block" }} />
        <button onClick={() => round.target.audio && playAudio(round.target.audio)} style={{ marginTop: 8, width: "100%", padding: "8px 0", borderRadius: 14, background: "#A8D0E622", border: "2px solid #A8D0E644", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", fontSize: 15, fontWeight: 700, color: "#1E3A5F", fontFamily: "Fredoka, sans-serif" }}>
          <Volume2 size={18} color="#4A90C4" />
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%", maxWidth: "min(320px, calc(100vw - 32px))", flexShrink: 0 }}>
        {round.choices.map((choice) => {
          const isSelected = selected === choice.word;
          const isCorrect = choice.word === round.target.word;
          let bg = "white", border = "2px solid #A8D0E6", textColor = "#1E3A5F", shadow = "0 4px 12px rgba(30,58,95,0.10)";
          if (isSelected && feedback === "correct") { bg = "#E8FFF6"; border = "3px solid #4ECDC4"; shadow = "0 6px 24px rgba(78,205,196,0.35)"; }
          else if (isSelected && feedback === "wrong") { bg = "#FFF0F0"; border = "3px solid #FF6B6B"; textColor = "#FF6B6B"; }
          else if (!isSelected && feedback === "correct" && isCorrect) { bg = "#E8FFF6"; border = "3px solid #4ECDC4"; }
          return (
            <motion.button key={choice.word} whileTap={!feedback ? { scale: 0.93 } : {}} animate={isSelected && feedback === "wrong" ? { x: [0,-8,8,-6,6,0] } : {}} transition={{ duration: 0.4 }} onPointerDown={(e) => { e.preventDefault(); handleChoice(choice); }} style={{ padding: "14px 8px", borderRadius: 18, background: bg, border, color: textColor, fontSize: 22, fontWeight: 700, fontFamily: "Fredoka, sans-serif", cursor: feedback ? "default" : "pointer", boxShadow: shadow, transition: "background 0.2s, border 0.2s", minHeight: 60, touchAction: "manipulation" }}>
              {choice.word}
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence>
        {feedback === "correct" && (
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} style={{ fontSize: 48 }}>🎉</motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Round sequence ─────────────────────────────────────────────────────────
const ROUND_SEQUENCE = [
  { type: "wordmatch",   word: "cab",                distractors: ["can", "cat", "map"] },
  { type: "identifying", word: "pal"                                                      },
  { type: "drag",        word: "ban"                                                      },
  { type: "drawline",    words: ["lab", "mad", "bat"]                                     },
  { type: "rearrange",   word: "lad"                                                      },
  { type: "drag",        word: "cab"                                                      },
];

const TOTAL_ROUNDS = ROUND_SEQUENCE.length;

function markLevel30Complete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][30] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function Level30({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const onMistake = useCallback(() => setMistakes((m) => m + 1), []);

  const advance = useCallback(() => {
    const next = roundIndex + 1;
    if (next >= TOTAL_ROUNDS) {
      markLevel30Complete();
      const stars = calcStars(mistakes, SCORED_ROUNDS);
      saveLevelResult("short-a", LEVEL_NUM, stars, mistakes);
      setEarnedStars(stars);
      setDone(true);
    } else setRoundIndex(next);
  }, [roundIndex, mistakes]);

  const roundDef = ROUND_SEQUENCE[roundIndex];
  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;

  const dragCard = useMemo(() => {
    if (!roundDef || roundDef.type !== "drag") return null;
    return findWord(roundDef.word);
  }, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const identifyingRound = useMemo(() => {
    if (!roundDef || roundDef.type !== "identifying") return null;
    return buildIdentifyingRound(roundDef.word);
  }, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const drawLineRound = useMemo(() => {
    if (!roundDef || roundDef.type !== "drawline") return null;
    return buildFixedDrawLineRound(roundDef.words);
  }, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const rearrangeWordPair = useMemo(() => {
    if (!roundDef || roundDef.type !== "rearrange") return null;
    return [buildWordData(roundDef.word)];
  }, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4, padding: "calc(env(safe-area-inset-top, 0px) + 8px) 16px 8px", borderBottom: "1.5px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.75)", backdropFilter: "blur(10px)" }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1E293B" }}>{lang === "zh" ? "第 30 关 — 复习" : "Level 30 — Review"}</p>
        </div>
        <span style={{ fontSize: 13, color: "#64748B", fontWeight: 600, marginRight: 4 }}>{roundIndex + 1}/{TOTAL_ROUNDS}</span>
      </div>
      {!done && (
        <div style={{ height: 6, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
          <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #4ECDC4, #4D96FF)" }} />
        </div>
      )}
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <LevelCompleteScreen levelNum={LEVEL_NUM} stars={earnedStars} mistakes={mistakes} onBack={onBack} lang={lang} />
          </motion.div>
        ) : (
          <motion.div key={`round-${roundIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {roundDef.type === "wordmatch" && (
              <WordMatchRound key={`wm-${roundIndex}`} targetWord={roundDef.word} distractorWords={roundDef.distractors} onComplete={advance} />
            )}
            {roundDef.type === "identifying" && identifyingRound && (
              <IdentifyingRound key={`id-${roundIndex}`} round={identifyingRound} onComplete={advance} lang={lang} />
            )}
            {roundDef.type === "drag" && dragCard && (
              <Level1DragV2 key={`drag-${roundIndex}`} card={dragCard} onComplete={advance} lang={lang} onMistake={onMistake} />
            )}
            {roundDef.type === "drawline" && drawLineRound && (
              <DrawLineBoard key={`dl-${roundIndex}`} round={drawLineRound} onRoundComplete={advance} lang={lang} />
            )}
            {roundDef.type === "rearrange" && rearrangeWordPair && (
              <PicSliceBoardEasy key={`easy-${roundIndex}`} wordPair={rearrangeWordPair} onRoundComplete={advance} lang={lang} onMistake={onMistake} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}