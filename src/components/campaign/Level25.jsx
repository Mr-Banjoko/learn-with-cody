/**
 * Level 25 — 6-round mixed
 *
 * Round order:
 *  1. Word to Audio Match → wax, cat, sad
 *  2. Identifying         → wax
 *  3. Drag the Letters V2 → gap
 *  4. Draw a Line         → tan, dam, wax
 *  5. Rearrange (Easy)    → dam
 *  6. Drag the Letters V2 → tan
 */
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackArrow from "../BackArrow";
import Level1DragV2 from "./Level1DragV2";
import DrawLineBoard from "../games/drawline/DrawLineBoard";
import IdentifyingRound from "../games/IdentifyingRound";
import PicSliceBoardEasy from "../games/PicSliceBoardEasy";
import Level25Complete from "./Level25Complete";
import { buildWordData } from "../../lib/picSliceGameData";
import { shortAWords } from "../../lib/shortAWords";
import { shortEWords } from "../../lib/shortEWords";
import { shortIWords } from "../../lib/shortIWords";
import { shortOWords } from "../../lib/shortOWords";
import { shortUWords } from "../../lib/shortUWords";
import { playAudio } from "../../lib/useAudio";

// ── Helpers ──────────────────────────────────────────────────────────────────
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

// ── Word to Audio Match (inline, fixed 3-word set) ───────────────────────────
const PAIR_COLORS = ["#4ECDC4", "#C77DFF", "#FFD93D"];

function SpeakerIcon({ color = "#4ECDC4", size = 38 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <path d="M18 21h-4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4l8 6V15l-8 6z" fill={color} />
      <path d="M30 20.5a8 8 0 0 1 0 11" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M33.5 17a13 13 0 0 1 0 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
    </svg>
  );
}

function WordAudioRound({ wordNames, onComplete }) {
  const round = useMemo(() => {
    const picked = wordNames.map(findWord).filter(Boolean);
    const leftItems = shuffleArr(picked).map((w, i) => ({ ...w, id: `left-${i}-${w.word}` }));
    let rightOrder = shuffleArr(picked);
    let attempts = 0;
    while (attempts < 20 && rightOrder.some((w, i) => w.word === leftItems[i].word)) {
      rightOrder = shuffleArr(picked);
      attempts++;
    }
    const rightItems = rightOrder.map((w, i) => ({ ...w, id: `right-${i}-${w.word}` }));
    return { leftItems, rightItems };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [wrongFlash, setWrongFlash] = useState(false);
  const wrongTimeout = useRef(null);
  const advanceTimeout = useRef(null);

  useEffect(() => () => { clearTimeout(wrongTimeout.current); clearTimeout(advanceTimeout.current); }, []);

  useEffect(() => {
    if (!selectedLeft || !selectedRight) return;
    const leftWord = round.leftItems.find((it) => it.id === selectedLeft)?.word;
    const rightWord = round.rightItems.find((it) => it.id === selectedRight)?.word;
    if (!leftWord || !rightWord) return;
    if (leftWord === rightWord) {
      const newMatched = [...matchedPairs, leftWord];
      setMatchedPairs(newMatched);
      setSelectedLeft(null);
      setSelectedRight(null);
      const wordObj = round.leftItems.find((it) => it.word === leftWord);
      if (wordObj?.audio) playAudio(wordObj.audio);
      if (newMatched.length === 3) {
        advanceTimeout.current = setTimeout(() => onComplete(), 900);
      }
    } else {
      clearTimeout(wrongTimeout.current);
      setWrongFlash(true);
      wrongTimeout.current = setTimeout(() => { setWrongFlash(false); setSelectedLeft(null); setSelectedRight(null); }, 500);
    }
  }, [selectedLeft, selectedRight]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLeftTap = useCallback((item) => {
    if (matchedPairs.includes(item.word)) return;
    if (item.audio) playAudio(item.audio);
    setSelectedLeft((prev) => (prev === item.id ? null : item.id));
    setSelectedRight(null);
  }, [matchedPairs]);

  const handleRightTap = useCallback((item) => {
    if (matchedPairs.includes(item.word)) return;
    setSelectedRight(item.id);
  }, [matchedPairs]);

  const getMatchColor = (word) => { const idx = matchedPairs.indexOf(word); return idx >= 0 ? PAIR_COLORS[idx % PAIR_COLORS.length] : null; };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ flexShrink: 0, textAlign: "center", padding: "8px 24px 4px" }}>
        <p style={{ fontSize: 15, color: "#7BACC8", margin: 0, fontWeight: 600 }}>Tap a speaker, then match the word</p>
      </div>
      <div style={{ flexShrink: 0, display: "flex", justifyContent: "center", gap: 8, padding: "6px 0 4px" }}>
        {[0, 1, 2].map((i) => (
          <motion.div key={i} animate={{ background: i < matchedPairs.length ? PAIR_COLORS[i] : "rgba(168,208,230,0.4)", scale: i < matchedPairs.length ? 1.2 : 1 }} transition={{ type: "spring", stiffness: 400, damping: 22 }} style={{ width: 11, height: 11, borderRadius: 99 }} />
        ))}
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 16, padding: "8px 20px 28px", minHeight: 0 }}>
        {round.leftItems.map((leftItem, rowIdx) => {
          const rightItem = round.rightItems[rowIdx];
          const leftMatched = matchedPairs.includes(leftItem.word);
          const rightMatched = matchedPairs.includes(rightItem.word);
          const leftSelected = selectedLeft === leftItem.id;
          const rightSelected = selectedRight === rightItem.id;
          const matchColor = getMatchColor(leftItem.word);
          const rightMatchColor = getMatchColor(rightItem.word);
          return (
            <div key={rowIdx} style={{ display: "flex", gap: 16, alignItems: "stretch" }}>
              <motion.button onClick={() => handleLeftTap(leftItem)} whileTap={!leftMatched ? { scale: 0.93 } : {}} animate={wrongFlash && selectedLeft === leftItem.id ? { x: [0,-7,7,-5,5,0] } : { x: 0 }} transition={{ duration: 0.38 }} style={{ flex: 1, height: 110, borderRadius: 22, border: leftMatched ? `3px solid ${matchColor}` : leftSelected ? "3.5px solid #4ECDC4" : "2.5px solid rgba(168,208,230,0.35)", background: leftMatched ? `${matchColor}18` : leftSelected ? "rgba(78,205,196,0.12)" : "white", boxShadow: leftMatched ? `0 4px 18px ${matchColor}44` : leftSelected ? "0 6px 24px rgba(78,205,196,0.28)" : "0 4px 16px rgba(30,58,95,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: leftMatched ? "default" : "pointer", opacity: leftMatched ? 0.52 : 1, transition: "border 0.16s, background 0.16s", WebkitTapHighlightColor: "transparent" }}>
                {leftMatched ? <span style={{ fontSize: 32 }}>✓</span> : <SpeakerIcon color={leftSelected ? "#4ECDC4" : "#A8D0E6"} />}
              </motion.button>
              <motion.button onClick={() => handleRightTap(rightItem)} whileTap={!rightMatched ? { scale: 0.96 } : {}} animate={wrongFlash && selectedRight === rightItem.id ? { x: [0,-7,7,-5,5,0] } : { x: 0 }} transition={{ duration: 0.38 }} style={{ flex: 1, height: 110, borderRadius: 22, border: rightMatched ? `3px solid ${rightMatchColor}` : rightSelected ? "3.5px solid #4D96FF" : "2.5px solid rgba(168,208,230,0.35)", background: rightMatched ? `${rightMatchColor}18` : rightSelected ? "rgba(77,150,255,0.1)" : "white", boxShadow: rightMatched ? `0 4px 18px ${rightMatchColor}44` : rightSelected ? "0 6px 24px rgba(77,150,255,0.28)" : "0 4px 16px rgba(30,58,95,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: rightMatched ? "default" : "pointer", opacity: rightMatched ? 0.52 : 1, transition: "border 0.16s, background 0.16s", WebkitTapHighlightColor: "transparent" }}>
                <span style={{ fontSize: 36, fontWeight: 700, color: rightMatched ? rightMatchColor : rightSelected ? "#4D96FF" : "#1E3A5F", fontFamily: "Fredoka, sans-serif", transition: "color 0.16s" }}>{rightItem.word}</span>
              </motion.button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Round sequence ────────────────────────────────────────────────────────────
const ROUND_SEQUENCE = [
  { type: "wordaudio",   words: ["wax", "cat", "sad"] }, // R1
  { type: "identifying", word: "wax"                  }, // R2
  { type: "drag",        word: "gap"                  }, // R3
  { type: "drawline",    words: ["tan", "dam", "wax"] }, // R4
  { type: "rearrange",   word: "dam"                  }, // R5
  { type: "drag",        word: "tan"                  }, // R6
];

const TOTAL_ROUNDS = ROUND_SEQUENCE.length;

function markLevel25Complete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][25] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

// ── Level 25 shell ────────────────────────────────────────────────────────────
export default function Level25({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);

  const advance = useCallback(() => {
    const next = roundIndex + 1;
    if (next >= TOTAL_ROUNDS) {
      markLevel25Complete();
      setDone(true);
    } else {
      setRoundIndex(next);
    }
  }, [roundIndex]);

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
      {/* Header */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4, padding: "calc(env(safe-area-inset-top, 0px) + 8px) 16px 8px", borderBottom: "1.5px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.75)", backdropFilter: "blur(10px)" }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1E293B" }}>
            {lang === "zh" ? "第 25 关" : "Level 25"}
          </p>
        </div>
        <span style={{ fontSize: 13, color: "#64748B", fontWeight: 600, marginRight: 4 }}>{roundIndex + 1}/{TOTAL_ROUNDS}</span>
      </div>

      {/* Progress bar */}
      {!done && (
        <div style={{ height: 6, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
          <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #4ECDC4, #4D96FF)" }} />
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <Level25Complete onBack={onBack} lang={lang} />
          </motion.div>
        ) : (
          <motion.div key={`round-${roundIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {roundDef.type === "wordaudio" && (
              <WordAudioRound key={`wam-${roundIndex}`} wordNames={roundDef.words} onComplete={advance} />
            )}
            {roundDef.type === "identifying" && identifyingRound && (
              <IdentifyingRound key={`identifying-${roundIndex}`} round={identifyingRound} onComplete={advance} lang={lang} />
            )}
            {roundDef.type === "drag" && dragCard && (
              <Level1DragV2 key={`drag-${roundIndex}`} card={dragCard} onComplete={advance} lang={lang} />
            )}
            {roundDef.type === "drawline" && drawLineRound && (
              <DrawLineBoard key={`drawline-${roundIndex}`} round={drawLineRound} onRoundComplete={advance} lang={lang} />
            )}
            {roundDef.type === "rearrange" && rearrangeWordPair && (
              <PicSliceBoardEasy key={`rearrange-${roundIndex}`} wordPair={rearrangeWordPair} onRoundComplete={advance} lang={lang} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}