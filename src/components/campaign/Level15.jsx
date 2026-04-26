/**
 * Level 15 — 9-round Mixed Review
 *
 * Round order:
 *  1. Drag the Letters V2     → pat
 *  2. Rearrange Pictures Easy → sat
 *  3. Missing Letter          → ham
 *  4. Identifying             → mad
 *  5. Draw a Line             → pat, ham, dad
 *  6. Missing Letter          → sad
 *  7. Rearrange Pictures Easy → ham
 *  8. Draw a Line             → sad, can, map
 *  9. Drag the Letters V2     → sat
 */
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";
import BackArrow from "../BackArrow";
import Level1DragV2 from "./Level1DragV2";
import PicSliceBoardEasy from "../games/PicSliceBoardEasy";
import IdentifyingRound from "../games/IdentifyingRound";
import DrawLineBoard from "../games/drawline/DrawLineBoard";
import Level15Complete from "./Level15Complete";
import { buildWordData } from "../../lib/picSliceGameData";
import { shortAWords } from "../../lib/shortAWords";
import { shortEWords } from "../../lib/shortEWords";
import { shortIWords } from "../../lib/shortIWords";
import { shortOWords } from "../../lib/shortOWords";
import { shortUWords } from "../../lib/shortUWords";
import { getLetterSoundUrl, getLetterGain } from "../../lib/letterSounds";
import { playAudio, playAudioSequence } from "../../lib/useAudio";

// ── Helpers ──────────────────────────────────────────────────────────────────
const findWord = (w) => shortAWords.find((x) => x.word === w);

const ALL_WORDS = [...shortAWords, ...shortEWords, ...shortIWords, ...shortOWords, ...shortUWords];

function buildIdentifyingRound(targetWord) {
  const target = shortAWords.find((w) => w.word === targetWord);
  const pool = ALL_WORDS.filter((w) => w.word !== targetWord);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const choices = [target, ...shuffled.slice(0, 2)].sort(() => Math.random() - 0.5);
  return { target, choices };
}

function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildFixedDrawLineRound(wordNames) {
  const words = wordNames.map(findWord);
  const topCards = words.map((w, i) => ({
    ...w,
    targetLetter: w.word[0],
    id: `card-${i}-${w.word}`,
  }));
  const letters = topCards.map((c) => ({ letter: c.targetLetter, topCardId: c.id }));
  let shuffledLetters = shuffleArr(letters);
  let tries = 0;
  while (tries < 20 && shuffledLetters.some((l, i) => l.topCardId === topCards[i].id)) {
    shuffledLetters = shuffleArr(letters);
    tries++;
  }
  return { topCards, bottomLetters: shuffledLetters };
}

// ── Round definitions ────────────────────────────────────────────────────────
// type: "drag" | "rearrange" | "missing" | "identifying" | "drawline"
const ROUND_SEQUENCE = [
  { type: "drag",        word: "pat"                    }, // R1
  { type: "rearrange",   word: "sat"                    }, // R2
  { type: "missing",     word: "ham"                    }, // R3
  { type: "identifying", word: "mad"                    }, // R4
  { type: "drawline",    words: ["pat", "ham", "dad"]   }, // R5
  { type: "missing",     word: "sad"                    }, // R6
  { type: "rearrange",   word: "ham"                    }, // R7
  { type: "drawline",    words: ["sad", "can", "map"]   }, // R8
  { type: "drag",        word: "sat"                    }, // R9
];

const TOTAL_ROUNDS = ROUND_SEQUENCE.length;

// ── Missing letter sub-component (inline, single-word, no header/back) ───────
const TOP_COLORS = ["#FFAFC5", "#A8D8EA", "#FFE57A"];

function getDistractors(word) {
  const all = "abcdefghijklmnoprstw".split("");
  const used = new Set(word.split(""));
  const pool = all.filter((l) => !used.has(l)).sort(() => Math.random() - 0.5);
  return pool.slice(0, 2);
}

function buildMissingRound(card) {
  const letters = card.word.split("");
  const missingPos = Math.floor(Math.random() * 3);
  const distractors = getDistractors(card.word);
  const ts = Date.now();
  const options = shuffleArr([
    { id: `correct-${ts}`, letter: letters[missingPos], isCorrect: true },
    { id: `d0-${ts}`, letter: distractors[0], isCorrect: false },
    { id: `d1-${ts}`, letter: distractors[1], isCorrect: false },
  ]);
  return { card, letters, missingPos, options };
}

function MissingLetterRound({ card, onComplete, lang = "en" }) {
  const [round] = useState(() => buildMissingRound(card));
  const [placedOption, setPlacedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [bouncingIndex, setBouncingIndex] = useState(null);
  const [dragState, setDragState] = useState(null);
  const [isActiveDrag, setIsActiveDrag] = useState(false);
  const dropZoneRef = useRef(null);
  const sequenceRef = useRef(null);
  const isDragging = useRef(false);
  const dragStateRef = useRef(null);
  const placedOptionRef = useRef(null);
  const accentColor = "#4A90C4";

  useEffect(() => {
    return () => { if (sequenceRef.current) { sequenceRef.current(); sequenceRef.current = null; } };
  }, []);

  const syncSetPlaced = useCallback((val) => {
    placedOptionRef.current = val;
    setPlacedOption(val);
  }, []);

  const playCompletion = useCallback(() => {
    setFeedback("completing");
    const steps = round.letters.map((letter, i) => {
      const url = getLetterSoundUrl(letter);
      return url ? { url, gain: getLetterGain(letter), onStart: () => setBouncingIndex(i) } : null;
    }).filter(Boolean);
    if (round.card.audio) steps.push({ url: round.card.audio, onStart: () => setBouncingIndex(null) });
    const cancel = playAudioSequence(steps, () => {
      sequenceRef.current = null;
      setBouncingIndex(null);
      onComplete();
    });
    sequenceRef.current = cancel;
  }, [round, onComplete]);

  const handleSubmit = useCallback(() => {
    const placed = placedOptionRef.current;
    if (!placed || feedback === "completing") return;
    if (placed.isCorrect) {
      playCompletion();
    } else {
      setFeedback("wrong");
      setTimeout(() => { syncSetPlaced(null); setFeedback(null); }, 700);
    }
  }, [feedback, playCompletion, syncSetPlaced]);

  const handleTouchStart = useCallback((e, option) => {
    if (placedOptionRef.current?.id === option.id) return;
    e.stopPropagation();
    isDragging.current = false;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const ds = { id: option.id, letter: option.letter, isCorrect: option.isCorrect, optionIndex: round.options.findIndex((o) => o.id === option.id), x: cx, y: cy, startX: touch.clientX, startY: touch.clientY, originX: cx, originY: cy };
    dragStateRef.current = ds;
    setDragState(ds);
  }, [round.options]);

  const handleTouchMove = useCallback((e) => {
    if (!dragStateRef.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    const prev = dragStateRef.current;
    const dx = touch.clientX - prev.startX;
    const dy = touch.clientY - prev.startY;
    if (!isDragging.current && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) { isDragging.current = true; setIsActiveDrag(true); }
    const updated = { ...prev, x: prev.originX + dx, y: prev.originY + dy };
    dragStateRef.current = updated;
    setDragState(updated);
  }, []);

  const handleTouchEnd = useCallback((e) => {
    const ds = dragStateRef.current;
    if (!ds) return;
    if (isDragging.current) {
      const touch = e.changedTouches[0];
      if (dropZoneRef.current && !placedOptionRef.current) {
        const rect = dropZoneRef.current.getBoundingClientRect();
        const hit = (touch.clientX >= rect.left && touch.clientX <= rect.right && touch.clientY >= rect.top && touch.clientY <= rect.bottom);
        if (hit) syncSetPlaced({ id: ds.id, letter: ds.letter, isCorrect: ds.isCorrect, optionIndex: ds.optionIndex });
      }
    }
    dragStateRef.current = null;
    setDragState(null);
    setIsActiveDrag(false);
    isDragging.current = false;
  }, [syncSetPlaced]);

  const canSubmit = placedOption !== null && feedback !== "completing";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", padding: "10px 20px 14px", minHeight: 0, touchAction: "none", userSelect: "none" }} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      {/* Top letter boxes */}
      <div style={{ background: "rgba(255,255,255,0.55)", borderRadius: 32, padding: "18px 22px", boxShadow: "0 8px 32px rgba(30,58,95,0.10)", border: "2px solid rgba(255,255,255,0.85)", display: "flex", gap: "min(20px, 4vw)", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {round.letters.map((letter, i) => {
          const isMissing = i === round.missingPos;
          const isPlacedHere = isMissing && placedOption !== null;
          const isBouncing = bouncingIndex === i;
          const isWrong = isMissing && feedback === "wrong";
          return (
            <motion.div key={i} ref={isMissing ? dropZoneRef : null}
              animate={isWrong ? { x: [0, -10, 10, -7, 7, 0] } : isBouncing ? { y: [0, -20, 0, -10, 0, -4, 0] } : {}}
              transition={{ duration: isWrong ? 0.38 : 0.5 }}
              onPointerDown={!isMissing ? (e) => { e.preventDefault(); const url = getLetterSoundUrl(letter); if (url) playAudio(url, getLetterGain(letter)); } : undefined}
              style={{ width: "min(108px, 27vw)", height: "min(108px, 27vw)", borderRadius: 26, background: isPlacedHere ? TOP_COLORS[placedOption.optionIndex % TOP_COLORS.length] : isMissing ? "rgba(255,255,255,0.5)" : TOP_COLORS[i], border: isMissing && !isPlacedHere ? `3px dashed ${accentColor}60` : "3px solid rgba(255,255,255,0.85)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: isMissing && !isPlacedHere ? "none" : "0 6px 20px rgba(0,0,0,0.10)", cursor: isMissing ? "default" : "pointer", touchAction: "manipulation", transition: "background 0.2s, border 0.2s", flexShrink: 0 }}
            >
              {isPlacedHere ? (
                <motion.span key={`placed-${placedOption.id}`} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 350, damping: 22 }} style={{ fontSize: "min(58px, 14.5vw)", fontWeight: 700, color: "#1E3A5F" }}>{placedOption.letter}</motion.span>
              ) : isMissing ? (
                <span style={{ fontSize: "min(34px, 8.5vw)", color: `${accentColor}60`, fontWeight: 700 }}>?</span>
              ) : (
                <span style={{ fontSize: "min(58px, 14.5vw)", fontWeight: 700, color: "#1E3A5F" }}>{letter}</span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Play word button */}
      <motion.button whileTap={{ scale: 0.88 }} onPointerDown={(e) => { e.preventDefault(); round.card.audio && playAudio(round.card.audio); }} style={{ width: "min(64px, 16vw)", height: "min(64px, 16vw)", borderRadius: "50%", background: accentColor, border: "none", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 24px ${accentColor}55`, cursor: "pointer", touchAction: "manipulation", flexShrink: 0 }}>
        <Play size={26} color="white" fill="white" />
      </motion.button>

      {/* Answer tiles */}
      <div style={{ display: "flex", gap: "min(16px, 4vw)", justifyContent: "center", flexShrink: 0 }}>
        {round.options.map((option) => {
          const isPlaced = placedOption?.id === option.id;
          const isDraggingThis = dragState?.id === option.id;
          if (isPlaced) return <div key={option.id} style={{ width: "min(74px, 19vw)", height: "min(74px, 19vw)", visibility: "hidden", flexShrink: 0 }} />;
          return (
            <motion.div key={option.id} animate={isDraggingThis ? { scale: 1.06, opacity: 0.3 } : { scale: 1, opacity: 1 }} onTouchStart={(e) => handleTouchStart(e, option)} style={{ width: "min(74px, 19vw)", height: "min(74px, 19vw)", borderRadius: 20, background: "white", border: "2.5px solid rgba(168,208,230,0.55)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "min(38px, 9.5vw)", fontWeight: 700, color: "#1E3A5F", boxShadow: "0 3px 12px rgba(30,58,95,0.08)", cursor: "grab", touchAction: "none", userSelect: "none", pointerEvents: isDraggingThis ? "none" : "auto", flexShrink: 0 }}>
              {option.letter}
            </motion.div>
          );
        })}
      </div>

      {/* Submit */}
      <motion.button whileTap={canSubmit ? { scale: 0.95 } : {}} onClick={handleSubmit} style={{ padding: "14px 52px", borderRadius: 99, border: "none", background: canSubmit ? accentColor : "rgba(168,208,230,0.35)", color: canSubmit ? "white" : "rgba(74,144,196,0.4)", fontSize: 20, fontWeight: 700, boxShadow: canSubmit ? `0 6px 24px ${accentColor}50` : "none", cursor: canSubmit ? "pointer" : "not-allowed", transition: "all 0.25s", flexShrink: 0, touchAction: "manipulation" }}>✓</motion.button>

      {/* Drag ghost */}
      <AnimatePresence>
        {dragState && isActiveDrag && (
          <div style={{ position: "fixed", left: dragState.x, top: dragState.y, transform: "translate(-50%, -50%)", zIndex: 9999, pointerEvents: "none", width: "min(78px, 20vw)", height: "min(78px, 20vw)", borderRadius: 20, background: "white", border: "2.5px solid rgba(168,208,230,0.7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "min(40px, 10vw)", fontWeight: 700, color: "#1E3A5F", boxShadow: "0 14px 40px rgba(30,58,95,0.22)" }}>
            {dragState.letter}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Level 15 shell ────────────────────────────────────────────────────────────
function markLevel15Complete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][15] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function Level15({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);

  const advance = useCallback(() => {
    const next = roundIndex + 1;
    if (next >= TOTAL_ROUNDS) {
      markLevel15Complete();
      setDone(true);
    } else {
      setRoundIndex(next);
    }
  }, [roundIndex]);

  const roundDef = ROUND_SEQUENCE[roundIndex];
  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;

  // Build stable data per round
  const dragCard = useMemo(() => {
    if (!roundDef || roundDef.type !== "drag") return null;
    return findWord(roundDef.word);
  }, [roundIndex]);

  const rearrangeWordPair = useMemo(() => {
    if (!roundDef || roundDef.type !== "rearrange") return null;
    return [buildWordData(roundDef.word)];
  }, [roundIndex]);

  const identifyingRound = useMemo(() => {
    if (!roundDef || roundDef.type !== "identifying") return null;
    return buildIdentifyingRound(roundDef.word);
  }, [roundIndex]);

  const drawLineRound = useMemo(() => {
    if (!roundDef || roundDef.type !== "drawline") return null;
    return buildFixedDrawLineRound(roundDef.words);
  }, [roundIndex]);

  const missingCard = useMemo(() => {
    if (!roundDef || roundDef.type !== "missing") return null;
    return findWord(roundDef.word);
  }, [roundIndex]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4, padding: "calc(env(safe-area-inset-top, 0px) + 8px) 16px 8px", borderBottom: "1.5px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.75)", backdropFilter: "blur(10px)" }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1E293B" }}>
            {lang === "zh" ? "第 15 关 — 复习" : "Level 15 — Review"}
          </p>
        </div>
        <span style={{ fontSize: 13, color: "#64748B", fontWeight: 600, marginRight: 4 }}>
          {roundIndex + 1}/{TOTAL_ROUNDS}
        </span>
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
            <Level15Complete onBack={onBack} lang={lang} />
          </motion.div>
        ) : (
          <motion.div key={`round-${roundIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {roundDef.type === "drag" && dragCard && (
              <Level1DragV2 key={`drag-${roundIndex}`} card={dragCard} onComplete={advance} lang={lang} />
            )}
            {roundDef.type === "rearrange" && rearrangeWordPair && (
              <PicSliceBoardEasy key={`rearrange-${roundIndex}`} wordPair={rearrangeWordPair} onRoundComplete={advance} lang={lang} />
            )}
            {roundDef.type === "missing" && missingCard && (
              <MissingLetterRound key={`missing-${roundIndex}`} card={missingCard} onComplete={advance} lang={lang} />
            )}
            {roundDef.type === "identifying" && identifyingRound && (
              <IdentifyingRound key={`identifying-${roundIndex}`} round={identifyingRound} onComplete={advance} lang={lang} />
            )}
            {roundDef.type === "drawline" && drawLineRound && (
              <DrawLineBoard key={`drawline-${roundIndex}`} round={drawLineRound} onRoundComplete={advance} lang={lang} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}