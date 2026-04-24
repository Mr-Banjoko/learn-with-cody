/**
 * Level1DragV2 — campaign wrapper using V2 drag-the-letters logic.
 * V2 difference: letters snap into any box; a Submit button checks correctness.
 * Calls onComplete() after the completion audio sequence finishes.
 */
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getLetterSoundUrl, getLetterGain } from "../../lib/letterSounds";
import { playAudio, playAudioSequence } from "../../lib/useAudio";

const ALL_LETTERS = "abcdefghijklmnoprstw".split("");
const LETTER_COLORS = ["#FFAFC5", "#A8D8EA", "#FFE57A", "#B5EAD7", "#FFDAC1", "#FFAFC5"];

function getDistractor(word) {
  const used = new Set(word.split(""));
  const pool = ALL_LETTERS.filter((l) => !used.has(l));
  return pool[Math.floor(Math.random() * pool.length)];
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
  const distractor = getDistractor(card.word);
  const options = shuffle([
    ...letters.map((l, i) => ({ id: `correct-${i}`, letter: l, correctPos: i })),
    { id: "distractor", letter: distractor, correctPos: -1 },
  ]);
  return { card, letters, options };
}

export default function Level1DragV2({ card, onComplete, lang = "en" }) {
  const [round] = useState(() => buildRound(card));
  const [placed, setPlaced] = useState(Array(card.word.length).fill(null));
  const [placedColors, setPlacedColors] = useState({});
  const [completing, setCompleting] = useState(false);
  const [bouncingIndex, setBouncingIndex] = useState(null);
  const [submitError, setSubmitError] = useState(false);
  const [dragState, setDragState] = useState(null);
  const dropZoneRefs = useRef([]);
  const sequenceRef = useRef(null);
  const isDragging = useRef(false);

  const playCompletion = useCallback(() => {
    setCompleting(true);
    const letterSteps = round.letters.map((letter, i) => {
      const url = getLetterSoundUrl(letter);
      return url ? { url, gain: getLetterGain(letter), onStart: () => setBouncingIndex(i) } : null;
    }).filter(Boolean);
    const wordStep = round.card.audio
      ? [{ url: round.card.audio, onStart: () => setBouncingIndex(null) }]
      : [];
    const steps = [...letterSteps, ...wordStep];
    const cancel = playAudioSequence(steps, () => {
      sequenceRef.current = null;
      setBouncingIndex(null);
      onComplete();
    });
    sequenceRef.current = cancel;
  }, [round, onComplete]);

  const handleTouchStart = useCallback((e, option) => {
    if (placed.includes(option.id) || completing) return;
    isDragging.current = false;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setDragState({ id: option.id, letter: option.letter, correctPos: option.correctPos, x: cx, y: cy, startX: touch.clientX, startY: touch.clientY, originX: cx, originY: cy });
  }, [placed, completing]);

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
    if (!isDragging.current) {
      const url = getLetterSoundUrl(dragState.letter);
      if (url) playAudio(url, getLetterGain(dragState.letter));
      setDragState(null);
      return;
    }
    const touch = e.changedTouches[0];
    let hitBox = -1;
    dropZoneRefs.current.forEach((ref, i) => {
      if (!ref) return;
      const rect = ref.getBoundingClientRect();
      if (touch.clientX >= rect.left && touch.clientX <= rect.right && touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        hitBox = i;
      }
    });
    if (hitBox !== -1 && placed[hitBox] === null) {
      const optIdx = round.options.findIndex((o) => o.id === dragState.id);
      const tileColor = LETTER_COLORS[optIdx % LETTER_COLORS.length];
      const newPlaced = [...placed];
      newPlaced[hitBox] = dragState.id;
      setPlacedColors((prev) => ({ ...prev, [hitBox]: tileColor }));
      setPlaced(newPlaced);
    }
    setDragState(null);
    isDragging.current = false;
  }, [dragState, placed, round]);

  const handleSubmit = useCallback(() => {
    if (completing) return;
    if (placed.some((p) => p === null)) return;
    // Validate by letter value, not tile-instance ID, so duplicate letters
    // (e.g. both 'd' tiles in "dad") are interchangeable across matching slots.
    const allCorrect = placed.every((optionId, boxIndex) => {
      const opt = round.options.find((o) => o.id === optionId);
      return opt && opt.letter === round.letters[boxIndex];
    });
    if (allCorrect) {
      playCompletion();
    } else {
      setSubmitError(true);
      setTimeout(() => {
        setSubmitError(false);
        setPlaced(Array(card.word.length).fill(null));
        setPlacedColors({});
      }, 600);
    }
  }, [completing, placed, round, card, playCompletion]);

  const allFilled = placed.every((p) => p !== null);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", fontFamily: "Fredoka, sans-serif", touchAction: "none", userSelect: "none" }}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", padding: "10px 20px 14px", minHeight: 0 }}>

        {/* Picture */}
        <motion.div
          key={round.card.word}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          onPointerDown={(e) => { e.preventDefault(); round.card.audio && playAudio(round.card.audio); }}
          style={{ background: "white", borderRadius: 28, padding: 10, boxShadow: "0 10px 40px rgba(30,58,95,0.15)", cursor: round.card.audio ? "pointer" : "default", touchAction: "manipulation", flexShrink: 0 }}
        >
          <img
            src={round.card.image}
            alt={round.card.word}
            style={{ width: "min(220px, 48vw)", height: "min(220px, 48vw)", objectFit: "cover", borderRadius: 20, display: "block" }}
          />
        </motion.div>

        {/* Drop boxes */}
        <div style={{ display: "flex", gap: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {round.letters.map((_, i) => {
            const placedId = placed[i];
            const placedOption = placedId ? round.options.find((o) => o.id === placedId) : null;
            const isBouncing = bouncingIndex === i;
            const tileColor = placedColors[i];
            return (
              <motion.div
                key={i}
                ref={(el) => (dropZoneRefs.current[i] = el)}
                animate={submitError ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : isBouncing ? { y: [0, -16, 0, -8, 0, -4, 0] } : {}}
                transition={{ duration: 0.5 }}
                style={{ width: "min(76px, 20vw)", height: "min(76px, 20vw)", borderRadius: 18, background: tileColor || "rgba(255,255,255,0.7)", border: `3px solid ${tileColor ? (submitError ? "#FF6B6B" : "rgba(255,255,255,0.85)") : "rgba(74,144,196,0.4)"}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: tileColor ? "0 4px 16px rgba(0,0,0,0.12)" : "inset 0 2px 8px rgba(0,0,0,0.06)", transition: "background 0.2s, border 0.2s" }}
              >
                {placedOption ? (
                  <motion.span key={placedOption.id} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ fontSize: "min(40px, 10vw)", fontWeight: 700, color: "#1E3A5F" }}>
                    {placedOption.letter}
                  </motion.span>
                ) : null}
              </motion.div>
            );
          })}
        </div>

        {/* Letter tiles */}
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", flexShrink: 0, paddingBottom: 4 }}>
          {round.options.map((option, i) => {
            const isPlaced = placed.includes(option.id);
            const isDraggingThis = dragState?.id === option.id;
            const bgColor = LETTER_COLORS[i % LETTER_COLORS.length];
            if (isPlaced) return <div key={option.id} style={{ width: "min(74px, 18vw)", height: "min(74px, 18vw)", visibility: "hidden", flexShrink: 0 }} />;
            return (
              <motion.div
                key={option.id}
                animate={isDraggingThis ? { scale: 1.1 } : { scale: 1, opacity: 1 }}
                onTouchStart={(e) => { e.stopPropagation(); handleTouchStart(e, option); }}
                style={{ width: "min(74px, 18vw)", height: "min(74px, 18vw)", borderRadius: 18, background: bgColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "min(40px, 10vw)", fontWeight: 700, color: "#1E3A5F", boxShadow: "0 4px 12px rgba(0,0,0,0.10)", border: "3px solid rgba(255,255,255,0.7)", cursor: "grab", touchAction: "none", userSelect: "none", pointerEvents: isDraggingThis ? "none" : "auto", opacity: isDraggingThis ? 0.3 : 1 }}
              >
                {option.letter}
              </motion.div>
            );
          })}
        </div>

        {/* Submit button */}
        {!completing && (
          <motion.button
            whileTap={allFilled ? { scale: 0.93 } : {}}
            onClick={handleSubmit}
            disabled={!allFilled}
            style={{ padding: "14px 48px", borderRadius: 999, background: allFilled ? "#4A90C4" : "rgba(74,144,196,0.3)", color: allFilled ? "white" : "rgba(255,255,255,0.6)", border: "none", fontSize: 20, fontWeight: 700, fontFamily: "Fredoka, sans-serif", cursor: allFilled ? "pointer" : "default", boxShadow: allFilled ? "0 4px 0 #2f6a9a" : "none", transition: "background 0.25s, box-shadow 0.25s, color 0.25s", touchAction: "manipulation", flexShrink: 0 }}
          >
            {lang === "zh" ? "提交 ✓" : "Submit ✓"}
          </motion.button>
        )}
      </div>

      {/* Drag ghost */}
      <AnimatePresence>
        {dragState && isDragging.current && (
          <div style={{ position: "fixed", left: dragState.x, top: dragState.y, transform: "translate(-50%, -50%)", zIndex: 9999, pointerEvents: "none", width: "min(80px, 20vw)", height: "min(80px, 20vw)", borderRadius: 18, background: LETTER_COLORS[round.options.findIndex((o) => o.id === dragState.id) % LETTER_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: "min(44px, 11vw)", fontWeight: 700, color: "#1E3A5F", boxShadow: "0 12px 36px rgba(0,0,0,0.25)", border: "3px solid rgba(255,255,255,0.8)" }}>
            {dragState.letter}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}