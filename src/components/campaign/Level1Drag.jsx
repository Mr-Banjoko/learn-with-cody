/**
 * Level1Drag — wraps DragTheLettersGame for a single fixed word.
 * Calls onComplete() automatically when the word is spelled correctly.
 * No back button, no word cycling — single-word, single-attempt.
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

export default function Level1Drag({ card, onComplete, lang = "en" }) {
  const [round] = useState(() => buildRound(card));
  const [placed, setPlaced] = useState(Array(card.word.length).fill(null));
  const [placedColors, setPlacedColors] = useState({});
  const [shake, setShake] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [bouncingIndex, setBouncingIndex] = useState(null);
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
    if (placed.includes(option.id)) return;
    isDragging.current = false;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setDragState({ id: option.id, letter: option.letter, correctPos: option.correctPos, x: cx, y: cy, startX: touch.clientX, startY: touch.clientY, originX: cx, originY: cy });
  }, [placed]);

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
    if (hitBox !== -1 && placed[hitBox] === null && dragState.correctPos === hitBox) {
      const optIdx = round.options.findIndex((o) => o.id === dragState.id);
      const tileColor = LETTER_COLORS[optIdx % LETTER_COLORS.length];
      const newPlaced = [...placed];
      newPlaced[hitBox] = dragState.id;
      setPlacedColors((prev) => ({ ...prev, [hitBox]: tileColor }));
      setPlaced(newPlaced);
      setDragState(null);
      isDragging.current = false;
      if (newPlaced.every((p) => p !== null)) {
        setTimeout(() => playCompletion(), 300);
      }
    } else {
      if (hitBox !== -1) setShake(hitBox);
      setTimeout(() => setShake(null), 500);
      setDragState(null);
      isDragging.current = false;
    }
  }, [dragState, placed, round, playCompletion]);

  const progress = placed.filter(Boolean).length;

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
            style={{ width: "min(240px, 52vw)", height: "min(240px, 52vw)", objectFit: "cover", borderRadius: 20, display: "block" }}
          />
        </motion.div>

        {/* Drop boxes */}
        <div style={{ display: "flex", gap: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {round.letters.map((_, i) => {
            const placedId = placed[i];
            const placedOption = placedId ? round.options.find((o) => o.id === placedId) : null;
            const isShaking = shake === i;
            const isBouncing = bouncingIndex === i;
            const tileColor = placedColors[i];
            return (
              <motion.div
                key={i}
                ref={(el) => (dropZoneRefs.current[i] = el)}
                animate={isShaking ? { x: [0, -8, 8, -6, 6, 0] } : isBouncing ? { y: [0, -16, 0, -8, 0, -4, 0] } : {}}
                transition={{ duration: isShaking ? 0.35 : 0.5 }}
                style={{ width: "min(76px, 20vw)", height: "min(76px, 20vw)", borderRadius: 18, background: tileColor || "rgba(255,255,255,0.7)", border: `3px solid ${tileColor ? "rgba(255,255,255,0.85)" : isShaking ? "#FF6B6B" : "rgba(74,144,196,0.4)"}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: tileColor ? "0 4px 16px rgba(0,0,0,0.12)" : "inset 0 2px 8px rgba(0,0,0,0.06)", transition: "background 0.2s, border 0.2s" }}
              >
                {placedOption ? (
                  <motion.span initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ fontSize: "min(40px, 10vw)", fontWeight: 700, color: "#1E3A5F" }}>
                    {placedOption.letter}
                  </motion.span>
                ) : (
                  <span style={{ fontSize: "min(22px, 5vw)", color: "rgba(74,144,196,0.3)", fontWeight: 700 }}>{i + 1}</span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Status */}
        <p style={{ fontSize: 15, color: "#4A90C4", fontWeight: 600, textAlign: "center", flexShrink: 0 }}>
          {completing
            ? (lang === "zh" ? "🎉 好极了！听一听……" : "🎉 Great job! Listen...")
            : progress === 0
            ? (lang === "zh" ? "拖动字母来拼写单词！" : "Drag the letters to spell the word!")
            : (lang === "zh" ? `已放置 ${progress} 个，共 ${round.letters.length} 个` : `${progress} of ${round.letters.length} placed`)}
        </p>

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
      </div>

      {/* Drag ghost */}
      <AnimatePresence>
        {dragState && isDragging.current && (
          <div
            style={{ position: "fixed", left: dragState.x, top: dragState.y, transform: "translate(-50%, -50%)", zIndex: 9999, pointerEvents: "none", width: "min(80px, 20vw)", height: "min(80px, 20vw)", borderRadius: 18, background: LETTER_COLORS[round.options.findIndex((o) => o.id === dragState.id) % LETTER_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: "min(44px, 11vw)", fontWeight: 700, color: "#1E3A5F", boxShadow: "0 12px 36px rgba(0,0,0,0.25)", border: "3px solid rgba(255,255,255,0.8)" }}
          >
            {dragState.letter}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}