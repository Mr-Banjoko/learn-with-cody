import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { getLetterSoundUrl, getLetterGain } from "../../lib/letterSounds";
import { playAudio, playAudioSequence } from "../../lib/useAudio";

const ALL_LETTERS = "abcdefghijklmnoprstw".split("");
// Match Learn Phonics word-box color palette for visual consistency
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

export default function DragTheLettersGame({ words, title, color, onBack }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [round, setRound] = useState(() => buildRound(words[0]));
  const [placed, setPlaced] = useState([null, null, null]);
  const [placedColors, setPlacedColors] = useState({});
  const [shake, setShake] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [bouncingIndex, setBouncingIndex] = useState(null);
  const [dragState, setDragState] = useState(null);
  const dropZoneRefs = useRef([]);
  const sequenceRef = useRef(null);
  const isDragging = useRef(false);

  const total = words.length;

  useEffect(() => {
    const newRound = buildRound(words[roundIndex]);
    setRound(newRound);
    setPlaced([null, null, null]);
    setPlacedColors({});
    setShake(null);
    setCompleting(false);
    setBouncingIndex(null);
    setDragState(null);
    isDragging.current = false;
    if (sequenceRef.current) { sequenceRef.current(); sequenceRef.current = null; }
  }, [roundIndex]);

  const playCompletion = useCallback((card, letters) => {
    setCompleting(true);
    // Each letter step bounces its box via onStart; word step clears the bounce
    const letterSteps = letters.map((letter, i) => {
      const url = getLetterSoundUrl(letter);
      return url
        ? { url, gain: getLetterGain(letter), onStart: () => setBouncingIndex(i) }
        : null;
    }).filter(Boolean);
    const wordStep = card.audio
      ? [{ url: card.audio, onStart: () => setBouncingIndex(null) }]
      : [];
    const steps = [...letterSteps, ...wordStep];

    const cancel = playAudioSequence(steps, () => {
      sequenceRef.current = null;
      setBouncingIndex(null);
      setRoundIndex((prev) => (prev + 1 < words.length ? prev + 1 : 0));
    });
    sequenceRef.current = cancel;
  }, [words]);

  const handleTouchStart = useCallback((e, option) => {
    if (placed.includes(option.id)) return;
    isDragging.current = false;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setDragState({
      id: option.id, letter: option.letter, correctPos: option.correctPos,
      x: cx, y: cy, startX: touch.clientX, startY: touch.clientY, originX: cx, originY: cy,
    });
  }, [placed]);

  const handleTouchMove = useCallback((e) => {
    if (!dragState) return;
    e.preventDefault();
    const touch = e.touches[0];
    const dx = touch.clientX - dragState.startX;
    const dy = touch.clientY - dragState.startY;
    if (!isDragging.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      isDragging.current = true;
    }
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
      if (
        touch.clientX >= rect.left && touch.clientX <= rect.right &&
        touch.clientY >= rect.top && touch.clientY <= rect.bottom
      ) {
        hitBox = i;
      }
    });

    if (hitBox !== -1 && placed[hitBox] === null && dragState.correctPos === hitBox) {
      // Preserve the tile's original color
      const optIdx = round.options.findIndex((o) => o.id === dragState.id);
      const tileColor = LETTER_COLORS[optIdx % LETTER_COLORS.length];
      const newPlaced = [...placed];
      newPlaced[hitBox] = dragState.id;
      setPlacedColors((prev) => ({ ...prev, [hitBox]: tileColor }));
      setPlaced(newPlaced);
      setDragState(null);
      isDragging.current = false;
      if (newPlaced.every((p) => p !== null)) {
        setTimeout(() => playCompletion(round.card, round.letters), 300);
      }
    } else {
      if (hitBox !== -1) setShake(hitBox);
      setTimeout(() => setShake(null), 500);
      setDragState(null);
      isDragging.current = false;
    }
  }, [dragState, placed, round, playCompletion]);

  const handleLetterTap = useCallback((option) => {
    if (placed.includes(option.id)) return;
    const url = getLetterSoundUrl(option.letter);
    if (url) playAudio(url, getLetterGain(option.letter));
  }, [placed]);

  const progress = placed.filter(Boolean).length;
  const card = round.card;

  return (
    <div
      style={{
        display: "flex", flexDirection: "column", height: "100%", flex: 1,
        background: "#D6EEFF", fontFamily: "Fredoka, sans-serif", overflow: "hidden",
        touchAction: "none", userSelect: "none",
      }}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div style={{ background: "#A8D0E6", borderBottomLeftRadius: 28, borderBottomRightRadius: 28, padding: "14px 20px 18px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: 20, background: "rgba(255,255,255,0.7)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ArrowLeft size={22} color="#1E3A5F" />
        </button>
        <div style={{ flex: 1, textAlign: "center", marginRight: 40 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1E3A5F" }}>Drag the Letters ✋</h1>
          <p style={{ fontSize: 13, color: "#3A6080" }}>{title} · {roundIndex + 1} / {total}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, background: "rgba(255,255,255,0.5)", margin: "0 24px", borderRadius: 99, flexShrink: 0 }}>
        <div style={{ height: "100%", borderRadius: 99, background: color || "#4A90C4", width: `${(roundIndex / total) * 100}%`, transition: "width 0.4s" }} />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", padding: "10px 20px 14px", minHeight: 0 }}>

        {/* Picture */}
        <motion.div
          key={roundIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          onClick={() => card.audio && playAudio(card.audio)}
          style={{
            background: "white", borderRadius: 28, padding: 10,
            boxShadow: "0 10px 40px rgba(30,58,95,0.15)",
            cursor: card.audio ? "pointer" : "default",
            touchAction: "manipulation", flexShrink: 0,
          }}
        >
          <img
            src={card.image}
            alt={card.word}
            style={{ width: "min(260px, 56vw)", height: "min(260px, 56vw)", objectFit: "cover", borderRadius: 20, display: "block" }}
          />
        </motion.div>

        {/* Drop boxes */}
        <div style={{ display: "flex", gap: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {round.letters.map((correctLetter, i) => {
            const placedId = placed[i];
            const placedOption = placedId ? round.options.find((o) => o.id === placedId) : null;
            const isShaking = shake === i;
            const isBouncing = bouncingIndex === i;
            const tileColor = placedColors[i];

            return (
              <motion.div
                key={i}
                ref={(el) => (dropZoneRefs.current[i] = el)}
                animate={
                  isShaking
                    ? { x: [0, -8, 8, -6, 6, 0] }
                    : isBouncing
                    ? { y: [0, -16, 0, -8, 0, -4, 0] }
                    : {}
                }
                transition={{ duration: isShaking ? 0.35 : 0.5 }}
                style={{
                  width: "min(76px, 20vw)", height: "min(76px, 20vw)", borderRadius: 18,
                  background: tileColor || "rgba(255,255,255,0.7)",
                  border: `3px solid ${tileColor ? "rgba(255,255,255,0.85)" : isShaking ? "#FF6B6B" : "rgba(74,144,196,0.4)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: tileColor ? "0 4px 16px rgba(0,0,0,0.12)" : "inset 0 2px 8px rgba(0,0,0,0.06)",
                  transition: "background 0.2s, border 0.2s",
                }}
              >
                {placedOption ? (
                  <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ fontSize: "min(40px, 10vw)", fontWeight: 700, color: "#1E3A5F" }}
                  >
                    {placedOption.letter}
                  </motion.span>
                ) : (
                  <span style={{ fontSize: "min(22px, 5vw)", color: "rgba(74,144,196,0.3)", fontWeight: 700 }}>
                    {i + 1}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Instruction */}
        <p style={{ fontSize: 15, color: "#4A90C4", fontWeight: 600, textAlign: "center", flexShrink: 0 }}>
          {completing ? "🎉 Great job! Listen..." : progress === 0 ? "Drag the letters to spell the word!" : `${progress} of ${round.letters.length} placed`}
        </p>

        {/* Letter tiles — placed tiles become invisible spacers (no ghost left behind) */}
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", flexShrink: 0, paddingBottom: 4 }}>
          {round.options.map((option, i) => {
            const isPlaced = placed.includes(option.id);
            const isDraggingThis = dragState?.id === option.id;
            const bgColor = LETTER_COLORS[i % LETTER_COLORS.length];

            if (isPlaced) {
              return (
                <div
                  key={option.id}
                  style={{ width: "min(74px, 18vw)", height: "min(74px, 18vw)", visibility: "hidden", flexShrink: 0 }}
                />
              );
            }

            return (
              <motion.div
                key={option.id}
                animate={isDraggingThis ? { scale: 1.1 } : { scale: 1, opacity: 1 }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  handleTouchStart(e, option);
                }}
                onClick={() => handleLetterTap(option)}
                style={{
                  width: "min(74px, 18vw)", height: "min(74px, 18vw)", borderRadius: 18,
                  background: bgColor,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "min(40px, 10vw)", fontWeight: 700, color: "#1E3A5F",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
                  border: "3px solid rgba(255,255,255,0.7)",
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
      </div>

      {/* Dragging ghost — follows finger */}
      <AnimatePresence>
        {dragState && isDragging.current && (
          <div
            style={{
              position: "fixed",
              left: dragState.x, top: dragState.y,
              transform: "translate(-50%, -50%)",
              zIndex: 9999, pointerEvents: "none",
              width: "min(80px, 20vw)", height: "min(80px, 20vw)", borderRadius: 18,
              background: LETTER_COLORS[round.options.findIndex((o) => o.id === dragState.id) % LETTER_COLORS.length],
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "min(44px, 11vw)", fontWeight: 700, color: "#1E3A5F",
              boxShadow: "0 12px 36px rgba(0,0,0,0.25)",
              border: "3px solid rgba(255,255,255,0.8)",
            }}
          >
            {dragState.letter}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}