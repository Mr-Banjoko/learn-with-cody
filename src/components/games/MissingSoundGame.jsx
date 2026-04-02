import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play } from "lucide-react";
import { getLetterSoundUrl, getLetterGain } from "../../lib/letterSounds";
import { playAudio, playAudioSequence } from "../../lib/useAudio";

const ALL_LETTERS = "abcdefghijklmnoprstw".split("");
const LETTER_COLORS = ["#FFAFC5", "#A8D8EA", "#FFE57A", "#B5EAD7", "#FFDAC1", "#FFAFC5"];

function getDistractors(word) {
  const used = new Set(word.split(""));
  const pool = ALL_LETTERS.filter((l) => !used.has(l));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildRound(card) {
  const letters = card.word.split("");
  const missingPos = Math.floor(Math.random() * 3);
  const correctLetter = letters[missingPos];
  const distractors = getDistractors(card.word);
  const options = shuffle([
    { id: "correct", letter: correctLetter, isCorrect: true },
    { id: "distractor-0", letter: distractors[0], isCorrect: false },
    { id: "distractor-1", letter: distractors[1], isCorrect: false },
  ]);
  return { card, letters, missingPos, options };
}

export default function MissingSoundGame({ words, title, color, onBack }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [round, setRound] = useState(() => buildRound(words[0]));
  const [placedOption, setPlacedOption] = useState(null);
  const [feedback, setFeedback] = useState(null); // null | 'wrong' | 'completing'
  const [bouncingIndex, setBouncingIndex] = useState(null);
  const [dragState, setDragState] = useState(null);
  const dropZoneRef = useRef(null);
  const sequenceRef = useRef(null);
  const isDragging = useRef(false);

  const total = words.length;

  useEffect(() => {
    setRound(buildRound(words[roundIndex]));
    setPlacedOption(null);
    setFeedback(null);
    setBouncingIndex(null);
    setDragState(null);
    isDragging.current = false;
    if (sequenceRef.current) { sequenceRef.current(); sequenceRef.current = null; }
  }, [roundIndex]);

  const playCompletion = useCallback((card, letters) => {
    setFeedback("completing");
    const steps = letters.map((letter, i) => {
      const url = getLetterSoundUrl(letter);
      return url ? { url, gain: getLetterGain(letter), onStart: () => setBouncingIndex(i) } : null;
    }).filter(Boolean);
    if (card.audio) steps.push({ url: card.audio, onStart: () => setBouncingIndex(null) });

    const cancel = playAudioSequence(steps, () => {
      sequenceRef.current = null;
      setBouncingIndex(null);
      setRoundIndex((prev) => (prev + 1 < words.length ? prev + 1 : 0));
    });
    sequenceRef.current = cancel;
  }, [words]);

  const handleSubmit = useCallback(() => {
    if (!placedOption || feedback === "completing") return;
    if (placedOption.isCorrect) {
      playCompletion(round.card, round.letters);
    } else {
      setFeedback("wrong");
      setTimeout(() => {
        setPlacedOption(null);
        setFeedback(null);
      }, 700);
    }
  }, [placedOption, feedback, round, playCompletion]);

  const handleTouchStart = useCallback((e, option) => {
    if (placedOption?.id === option.id) return;
    isDragging.current = false;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setDragState({
      id: option.id, letter: option.letter, isCorrect: option.isCorrect,
      optionIndex: round.options.findIndex((o) => o.id === option.id),
      x: cx, y: cy, startX: touch.clientX, startY: touch.clientY, originX: cx, originY: cy,
    });
  }, [placedOption, round]);

  const handleTouchMove = useCallback((e) => {
    if (!dragState) return;
    e.preventDefault();
    const touch = e.touches[0];
    const dx = touch.clientX - dragState.startX;
    const dy = touch.clientY - dragState.startY;
    if (!isDragging.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) isDragging.current = true;
    setDragState((prev) => prev ? { ...prev, x: prev.originX + dx, y: prev.originY + dy } : null);
  }, [dragState]);

  const handleTouchEnd = useCallback((e) => {
    if (!dragState) return;
    // tap = silent; drag = check drop zone
    if (!isDragging.current) {
      setDragState(null);
      return;
    }
    const touch = e.changedTouches[0];
    let hitDrop = false;
    if (dropZoneRef.current && !placedOption) {
      const rect = dropZoneRef.current.getBoundingClientRect();
      hitDrop = (
        touch.clientX >= rect.left && touch.clientX <= rect.right &&
        touch.clientY >= rect.top && touch.clientY <= rect.bottom
      );
    }
    if (hitDrop) {
      setPlacedOption({ id: dragState.id, letter: dragState.letter, isCorrect: dragState.isCorrect, optionIndex: dragState.optionIndex });
    }
    setDragState(null);
    isDragging.current = false;
  }, [dragState, placedOption]);

  const handleTopLetterTap = useCallback((letter) => {
    const url = getLetterSoundUrl(letter);
    if (url) playAudio(url, getLetterGain(letter));
  }, []);

  const card = round.card;
  const canSubmit = placedOption && feedback !== "completing";

  return (
    <div
      style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1, background: "#D6EEFF", fontFamily: "Fredoka, sans-serif", overflow: "hidden", touchAction: "none", userSelect: "none" }}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div style={{ background: "#A8D0E6", borderBottomLeftRadius: 28, borderBottomRightRadius: 28, padding: "14px 20px 18px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: 20, background: "rgba(255,255,255,0.7)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ArrowLeft size={22} color="#1E3A5F" />
        </button>
        <div style={{ flex: 1, textAlign: "center", marginRight: 40 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1E3A5F" }}>Missing Sound ❓</h1>
          <p style={{ fontSize: 13, color: "#3A6080" }}>{title} · {roundIndex + 1} / {total}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, background: "rgba(255,255,255,0.5)", margin: "0 24px", borderRadius: 99, flexShrink: 0 }}>
        <div style={{ height: "100%", borderRadius: 99, background: color || "#4A90C4", width: `${(roundIndex / total) * 100}%`, transition: "width 0.4s" }} />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", padding: "12px 20px 16px", minHeight: 0 }}>

        {/* TOP LAYER: 3 large letter boxes */}
        <div style={{ display: "flex", gap: 16, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {round.letters.map((letter, i) => {
            const isMissing = i === round.missingPos;
            const isPlacedHere = isMissing && placedOption !== null;
            const isBouncing = bouncingIndex === i;
            const isWrong = isMissing && feedback === "wrong";
            const boxColor = LETTER_COLORS[i];

            return (
              <motion.div
                key={i}
                ref={isMissing ? dropZoneRef : null}
                animate={
                  isWrong
                    ? { x: [0, -8, 8, -6, 6, 0] }
                    : isBouncing
                    ? { y: [0, -18, 0, -8, 0, -4, 0] }
                    : {}
                }
                transition={{ duration: isWrong ? 0.35 : 0.5 }}
                onClick={!isMissing ? () => handleTopLetterTap(letter) : undefined}
                style={{
                  width: "min(96px, 25vw)", height: "min(96px, 25vw)", borderRadius: 24,
                  background: isPlacedHere
                    ? LETTER_COLORS[placedOption.optionIndex % LETTER_COLORS.length]
                    : isMissing
                    ? "rgba(255,255,255,0.45)"
                    : boxColor,
                  border: isMissing && !isPlacedHere
                    ? "3px dashed rgba(74,144,196,0.5)"
                    : "3px solid rgba(255,255,255,0.75)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: isMissing && !isPlacedHere ? "none" : "0 6px 24px rgba(0,0,0,0.10)",
                  cursor: isMissing ? "default" : "pointer",
                  touchAction: isMissing ? "auto" : "manipulation",
                  transition: "background 0.2s, border 0.2s",
                }}
              >
                {isPlacedHere ? (
                  <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ fontSize: "min(52px, 13vw)", fontWeight: 700, color: "#1E3A5F" }}
                  >
                    {placedOption.letter}
                  </motion.span>
                ) : isMissing ? (
                  <span style={{ fontSize: "min(32px, 8vw)", color: "rgba(74,144,196,0.4)", fontWeight: 700 }}>?</span>
                ) : (
                  <span style={{ fontSize: "min(52px, 13vw)", fontWeight: 700, color: "#1E3A5F" }}>{letter}</span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* MIDDLE LAYER: Play full word button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => card.audio && playAudio(card.audio)}
          style={{
            width: "min(72px, 18vw)", height: "min(72px, 18vw)", borderRadius: "50%",
            background: color || "#4A90C4", border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 6px 28px ${color || "#4A90C4"}55`,
            cursor: "pointer", flexShrink: 0, touchAction: "manipulation",
          }}
        >
          <Play size={28} color="white" fill="white" />
        </motion.button>

        {/* BOTTOM LAYER: 3 answer tiles */}
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexShrink: 0 }}>
          {round.options.map((option, i) => {
            const isPlaced = placedOption?.id === option.id;
            const isDraggingThis = dragState?.id === option.id;
            const bgColor = LETTER_COLORS[i % LETTER_COLORS.length];

            if (isPlaced) {
              return (
                <div
                  key={option.id}
                  style={{ width: "min(86px, 21vw)", height: "min(86px, 21vw)", visibility: "hidden", flexShrink: 0 }}
                />
              );
            }

            return (
              <motion.div
                key={option.id}
                animate={isDraggingThis ? { scale: 1.08 } : { scale: 1, opacity: 1 }}
                onTouchStart={(e) => { e.stopPropagation(); handleTouchStart(e, option); }}
                style={{
                  width: "min(86px, 21vw)", height: "min(86px, 21vw)", borderRadius: 22,
                  background: bgColor, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "min(46px, 11.5vw)", fontWeight: 700, color: "#1E3A5F",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.10)", border: "3px solid rgba(255,255,255,0.7)",
                  cursor: "grab", touchAction: "none", userSelect: "none",
                  pointerEvents: isDraggingThis ? "none" : "auto",
                  opacity: isDraggingThis ? 0.3 : 1,
                }}
              >
                {option.letter}
              </motion.div>
            );
          })}
        </div>

        {/* Submit button */}
        <motion.button
          whileTap={canSubmit ? { scale: 0.95 } : {}}
          onClick={handleSubmit}
          style={{
            padding: "15px 52px", borderRadius: 99, border: "none",
            background: canSubmit ? (color || "#4A90C4") : "rgba(168,208,230,0.4)",
            color: canSubmit ? "white" : "rgba(74,144,196,0.45)",
            fontSize: 20, fontWeight: 700,
            boxShadow: canSubmit ? `0 6px 24px ${color || "#4A90C4"}50` : "none",
            cursor: canSubmit ? "pointer" : "not-allowed",
            transition: "all 0.25s",
            flexShrink: 0, touchAction: "manipulation",
          }}
        >
          {feedback === "wrong" ? "Try Again! 🔄" : feedback === "completing" ? "🎉 Great!" : "Submit ✓"}
        </motion.button>

      </div>

      {/* Drag ghost */}
      <AnimatePresence>
        {dragState && isDragging.current && (
          <div
            style={{
              position: "fixed", left: dragState.x, top: dragState.y,
              transform: "translate(-50%, -50%)", zIndex: 9999, pointerEvents: "none",
              width: "min(92px, 23vw)", height: "min(92px, 23vw)", borderRadius: 22,
              background: LETTER_COLORS[dragState.optionIndex % LETTER_COLORS.length],
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "min(50px, 12.5vw)", fontWeight: 700, color: "#1E3A5F",
              boxShadow: "0 12px 36px rgba(0,0,0,0.25)", border: "3px solid rgba(255,255,255,0.8)",
            }}
          >
            {dragState.letter}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}