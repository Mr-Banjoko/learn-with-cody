/**
 * Level1DragV2 — campaign wrapper using V2 drag-the-letters logic.
 * V2 difference: letters snap into any box; a Submit button checks correctness.
 * Calls onComplete() after the completion audio sequence finishes.
 */
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, RefreshCw } from "lucide-react";
import { getLetterSoundUrl, getLetterGain } from "../../lib/letterSounds";
import { playAudio, playAudioSequence } from "../../lib/useAudio";
import { useCorrectSound } from "../../lib/useCorrectSound";
import { useTryAgainSound } from "../../lib/useTryAgainSound";
import { useTemplateLetters } from "../../lib/templateTheme";

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

function buildRound(card, forcedDistractor) {
  const letters = card.word.split("");
  const distractor = forcedDistractor || getDistractor(card.word);
  const options = shuffle([
    ...letters.map((l, i) => ({ id: `correct-${i}`, letter: l, correctPos: i })),
    { id: "distractor", letter: distractor, correctPos: -1 },
  ]);
  return { card, letters, options };
}

export default function Level1DragV2({ card, onComplete, lang = "en", onMistake, dragGuideStep = -1, onDragGuideAdvance, userPhotoUrl, onClearPhoto, forcedDistractor }) {
  const [round] = useState(() => buildRound(card, forcedDistractor));
  const [placed, setPlaced] = useState(Array(card.word.length).fill(null));
  const [placedColors, setPlacedColors] = useState({});
  const [completing, setCompleting] = useState(false);
  const [bouncingIndex, setBouncingIndex] = useState(null);
  const [submitError, setSubmitError] = useState(false);
  const [dragState, setDragState] = useState(null);
  const dropZoneRefs = useRef([]);
  const sequenceRef = useRef(null);
  const isDragging = useRef(false);
  const { play: playCorrect } = useCorrectSound();
  const { play: playTryAgain } = useTryAgainSound();
  const tTheme = useTemplateLetters();
  const letterColors = tTheme?.colors || LETTER_COLORS;
  const letterText = tTheme?.textColor || "#1E3A5F";

  const playCompletion = useCallback(() => {
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
      const tileColor = letterColors[optIdx % letterColors.length];
      const newPlaced = [...placed];
      newPlaced[hitBox] = dragState.id;
      setPlacedColors((prev) => ({ ...prev, [hitBox]: tileColor }));
      setPlaced(newPlaced);
      // Advance guide when a letter lands in the currently guided box
      if (onDragGuideAdvance && hitBox === dragGuideStep) {
        onDragGuideAdvance();
      }
    }
    setDragState(null);
    isDragging.current = false;
  }, [dragState, placed, round]);

  const handleSubmit = useCallback(() => {
    if (completing) return;
    if (placed.some((p) => p === null)) return;
    const allCorrect = placed.every((optionId, boxIndex) => {
      const opt = round.options.find((o) => o.id === optionId);
      return opt && opt.letter === round.letters[boxIndex];
    });
    if (allCorrect) {
      setCompleting(true);
      playCorrect(() => {
        setTimeout(() => playCompletion(), 10);
      });
    } else {
      playTryAgain();
      setSubmitError(true);
      onMistake && onMistake();
      setTimeout(() => {
        setSubmitError(false);
        setPlaced(Array(card.word.length).fill(null));
        setPlacedColors({});
      }, 600);
    }
  }, [completing, placed, round, card, playCompletion, playCorrect, playTryAgain]);

  const allFilled = placed.every((p) => p !== null);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", fontFamily: "Fredoka, sans-serif", touchAction: "none", userSelect: "none", position: "relative" }}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {completing && <div style={{ position: "absolute", inset: 0, zIndex: 100, touchAction: "none", pointerEvents: "all" }} />}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", padding: "10px 20px 14px", minHeight: 0 }}>

        <motion.div
          key={round.card.word}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          onPointerDown={(e) => { e.preventDefault(); round.card.audio && playAudio(round.card.audio); }}
          style={{ background: tTheme?.frame?.cardBg || "white", border: tTheme?.frame?.border || "none", borderRadius: 32, padding: 10, boxShadow: tTheme?.frame?.shadow || "0 10px 40px rgba(30,58,95,0.15)", cursor: round.card.audio ? "pointer" : "default", touchAction: "manipulation", flexShrink: 0, position: "relative" }}
        >
          <img
            src={userPhotoUrl || round.card.image}
            alt={round.card.word}
            style={{ width: "min(330px, 68vw)", height: "min(330px, 68vw)", objectFit: "cover", borderRadius: 24, display: "block" }}
          />
          {userPhotoUrl && onClearPhoto && (
            <button
              onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); onClearPhoto(); }}
              style={{ position: "absolute", top: 18, right: 18, width: 36, height: 36, borderRadius: 18, background: "white", boxShadow: "0 2px 10px rgba(0,0,0,0.2)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, touchAction: "manipulation" }}
              aria-label="Reset to original image"
            >
              <RotateCcw size={18} color="#A8D0E6" strokeWidth={2.2} />
            </button>
          )}
        </motion.div>

        <div style={{ display: "flex", gap: 14, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 8 }}>
          {round.letters.map((_, i) => {
            const placedId = placed[i];
            const placedOption = placedId ? round.options.find((o) => o.id === placedId) : null;
            const isBouncing = bouncingIndex === i;
            const tileColor = placedColors[i];
            return (
              <motion.div
                key={i}
                ref={(el) => (dropZoneRefs.current[i] = el)}
                animate={
                  submitError
                    ? { x: [0, -10, 10, -8, 8, -4, 4, 0] }
                    : isBouncing
                    ? { y: [0, -16, 0, -8, 0, -4, 0] }
                    : !tileColor && dragGuideStep === i
                    ? { boxShadow: [
                        "inset 0 2px 8px rgba(0,0,0,0.06), 0 0 0 0px rgba(255,107,107,0)",
                        "inset 0 2px 8px rgba(0,0,0,0.06), 0 0 0 5px rgba(255,107,107,0.65)",
                        "inset 0 2px 8px rgba(0,0,0,0.06), 0 0 0 5px rgba(255,217,61,0.65)",
                        "inset 0 2px 8px rgba(0,0,0,0.06), 0 0 0 5px rgba(78,205,196,0.65)",
                        "inset 0 2px 8px rgba(0,0,0,0.06), 0 0 0 5px rgba(155,89,182,0.65)",
                        "inset 0 2px 8px rgba(0,0,0,0.06), 0 0 0 0px rgba(155,89,182,0)",
                      ] }
                    : {}
                    }
                    transition={!tileColor && dragGuideStep === i ? { duration: 2.2, repeat: Infinity, repeatType: "loop", ease: "easeInOut" } : { duration: 0.5 }}
                    style={{ width: "min(76px, 20vw)", height: "min(76px, 20vw)", borderRadius: 18, background: tileColor || "rgba(255,255,255,0.7)", border: `3px solid ${tileColor ? "rgba(255,255,255,0.85)" : "rgba(74,144,196,0.4)"}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: tileColor ? "0 4px 16px rgba(0,0,0,0.12)" : "inset 0 2px 8px rgba(0,0,0,0.06)", transition: "background 0.2s, border 0.2s" }}
              >
                {placedOption ? (
                  <motion.span key={placedOption.id} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ fontSize: "min(40px, 10vw)", fontWeight: 700, color: letterText }}>
                    {placedOption.letter}
                  </motion.span>
                ) : null}
              </motion.div>
            );
          })}

          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              if (completing) return;
              setPlaced(Array(card.word.length).fill(null));
              setPlacedColors({});
            }}
            style={{
              width: 48, height: 48, borderRadius: 24,
              background: "white",
              boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, touchAction: "manipulation",
              opacity: placed.some(Boolean) && !completing ? 1 : 0.35,
            }}
            aria-label="Reset letters"
          >
            <RotateCcw size={22} color="#A8D0E6" strokeWidth={2.2} />
          </button>
        </div>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", flexShrink: 0, paddingBottom: 4 }}>
          {round.options.map((option, i) => {
            const isPlaced = placed.includes(option.id);
            const isDraggingThis = dragState?.id === option.id;
            const bgColor = letterColors[i % letterColors.length];
            // Pulse this tile if it's the correct letter for the current guide step
            const isGuidedTile = !isPlaced && !isDraggingThis && dragGuideStep >= 0 && option.correctPos === dragGuideStep;
            if (isPlaced) return <div key={option.id} style={{ width: "min(74px, 18vw)", height: "min(74px, 18vw)", visibility: "hidden", flexShrink: 0 }} />;
            return (
              <motion.div
                key={option.id}
                animate={
                  isDraggingThis
                    ? { scale: 1.1 }
                    : isGuidedTile
                    ? { boxShadow: [
                        "0 4px 12px rgba(0,0,0,0.10), 0 0 0 0px rgba(255,107,107,0)",
                        "0 4px 12px rgba(0,0,0,0.10), 0 0 0 7px rgba(255,107,107,0.7)",
                        "0 4px 12px rgba(0,0,0,0.10), 0 0 0 7px rgba(255,217,61,0.7)",
                        "0 4px 12px rgba(0,0,0,0.10), 0 0 0 7px rgba(78,205,196,0.7)",
                        "0 4px 12px rgba(0,0,0,0.10), 0 0 0 7px rgba(155,89,182,0.7)",
                        "0 4px 12px rgba(0,0,0,0.10), 0 0 0 0px rgba(155,89,182,0)",
                      ] }
                    : { scale: 1, opacity: 1 }
                }
                transition={isGuidedTile ? { duration: 1.6, repeat: Infinity, repeatType: "loop", ease: "easeInOut" } : {}}
                onTouchStart={(e) => { e.stopPropagation(); handleTouchStart(e, option); }}
                style={{ width: "min(74px, 18vw)", height: "min(74px, 18vw)", borderRadius: 18, background: bgColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "min(40px, 10vw)", fontWeight: 700, color: letterText, boxShadow: "0 4px 12px rgba(0,0,0,0.10)", border: isGuidedTile ? "3px solid rgba(255,255,255,0.95)" : "3px solid rgba(255,255,255,0.7)", cursor: "grab", touchAction: "none", userSelect: "none", pointerEvents: isDraggingThis ? "none" : "auto", opacity: isDraggingThis ? 0.3 : 1 }}
              >
                {option.letter}
              </motion.div>
            );
          })}
        </div>

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

      <AnimatePresence>
        {dragState && isDragging.current && (
          <div style={{ position: "fixed", left: dragState.x, top: dragState.y, transform: "translate(-50%, -50%)", zIndex: 9999, pointerEvents: "none", width: "min(80px, 20vw)", height: "min(80px, 20vw)", borderRadius: 18, background: letterColors[round.options.findIndex((o) => o.id === dragState.id) % letterColors.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: "min(44px, 11vw)", fontWeight: 700, color: letterText, boxShadow: "0 12px 36px rgba(0,0,0,0.25)", border: "3px solid rgba(255,255,255,0.8)" }}>
            {dragState.letter}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}