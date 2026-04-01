import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { getLetterSoundUrl, getLetterGain } from "../../lib/letterSounds";
import { playAudio, playAudioSequence } from "../../lib/useAudio";

const ALL_LETTERS = "abcdefghijklmnoprstw".split("");
const LETTER_COLORS = ["#FF6B6B", "#4D96FF", "#6BCB77", "#FFD93D", "#C77DFF", "#FF9F43"];

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
  const [placed, setPlaced] = useState([null, null, null]); // letter id placed in each box
  const [shake, setShake] = useState(null); // box index that shook
  const [completing, setCompleting] = useState(false);
  const [dragState, setDragState] = useState(null); // { id, letter, x, y, startX, startY, originX, originY }
  const dropZoneRefs = useRef([]);
  const sequenceRef = useRef(null);
  const isDragging = useRef(false);

  const total = words.length;

  // Reset on new round
  useEffect(() => {
    const newRound = buildRound(words[roundIndex]);
    setRound(newRound);
    setPlaced([null, null, null]);
    setShake(null);
    setCompleting(false);
    setDragState(null);
    isDragging.current = false;
    if (sequenceRef.current) { sequenceRef.current(); sequenceRef.current = null; }
  }, [roundIndex]);

  const playCompletion = useCallback((card, letters) => {
    setCompleting(true);
    const steps = letters.map((letter) => {
      const url = getLetterSoundUrl(letter);
      return url ? { url, gain: getLetterGain(letter) } : null;
    }).filter(Boolean);
    if (card.audio) steps.push({ url: card.audio });

    const cancel = playAudioSequence(steps, () => {
      sequenceRef.current = null;
      setRoundIndex((prev) => (prev + 1 < words.length ? prev + 1 : 0));
    });
    sequenceRef.current = cancel;
  }, [words]);

  // Touch handlers
  const handleTouchStart = useCallback((e, option) => {
    // Check if this letter is already placed
    if (placed.includes(option.id)) return;

    isDragging.current = false;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    setDragState({
      id: option.id,
      letter: option.letter,
      correctPos: option.correctPos,
      x: cx,
      y: cy,
      startX: touch.clientX,
      startY: touch.clientY,
      originX: cx,
      originY: cy,
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
      // It was a tap — play sound
      const url = getLetterSoundUrl(dragState.letter);
      if (url) playAudio(url, getLetterGain(dragState.letter));
      setDragState(null);
      return;
    }

    // Find which drop zone was hit
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
      // Correct!
      const newPlaced = [...placed];
      newPlaced[hitBox] = dragState.id;
      setPlaced(newPlaced);
      setDragState(null);
      isDragging.current = false;

      // Check completion
      if (newPlaced.every((p) => p !== null)) {
        setTimeout(() => playCompletion(round.card, round.letters), 300);
      }
    } else {
      // Wrong box or wrong letter — reject with shake
      if (hitBox !== -1) setShake(hitBox);
      setTimeout(() => setShake(null), 500);
      setDragState(null);
      isDragging.current = false;
    }
  }, [dragState, placed, round, playCompletion]);

  // Tap on letter tile (not dragging) 
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
        touchAction: "none",
        userSelect: "none",
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
        <div style={{ height: "100%", borderRadius: 99, background: color || "#4A90C4", width: `${((roundIndex) / total) * 100}%`, transition: "width 0.4s" }} />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", padding: "12px 20px 16px", minHeight: 0 }}>

        {/* Picture */}
        <motion.div
          key={roundIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          onClick={() => card.audio && playAudio(card.audio)}
          style={{
            background: "white",
            borderRadius: 28,
            padding: 10,
            boxShadow: "0 10px 40px rgba(30,58,95,0.15)",
            cursor: card.audio ? "pointer" : "default",
            touchAction: "manipulation",
            flexShrink: 0,
          }}
        >
          <img
            src={card.image}
            alt={card.word}
            style={{ width: "min(200px, 42vw)", height: "min(200px, 42vw)", objectFit: "cover", borderRadius: 20, display: "block" }}
          />
          {/* Tap hint */}
          <div style={{ textAlign: "center", marginTop: 6, fontSize: 12, color: "#7BACC8" }}>
            🔊 Tap to hear
          </div>
        </motion.div>

        {/* Drop boxes */}
        <div style={{ display: "flex", gap: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {round.letters.map((correctLetter, i) => {
            const placedId = placed[i];
            const placedOption = placedId ? round.options.find((o) => o.id === placedId) : null;
            const isShaking = shake === i;

            return (
              <motion.div
                key={i}
                ref={(el) => (dropZoneRefs.current[i] = el)}
                animate={isShaking ? { x: [0, -8, 8, -6, 6, 0] } : {}}
                transition={{ duration: 0.35 }}
                style={{
                  width: "min(76px, 20vw)",
                  height: "min(76px, 20vw)",
                  borderRadius: 18,
                  background: placedOption ? "#B5EAD7" : "rgba(255,255,255,0.7)",
                  border: `3px solid ${placedOption ? "#4ECDC4" : isShaking ? "#FF6B6B" : "rgba(74,144,196,0.4)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: placedOption ? "0 4px 16px rgba(78,205,196,0.3)" : "inset 0 2px 8px rgba(0,0,0,0.06)",
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

        {/* Letter tiles */}
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", flexShrink: 0, paddingBottom: 4 }}>
          {round.options.map((option, i) => {
            const isPlaced = placed.includes(option.id);
            const isDraggingThis = dragState?.id === option.id;
            const bgColor = LETTER_COLORS[i % LETTER_COLORS.length];

            return (
              <motion.div
                key={option.id}
                animate={isPlaced ? { scale: 0.85, opacity: 0.3 } : isDraggingThis ? { scale: 1.1 } : { scale: 1, opacity: 1 }}
                onTouchStart={(e) => {
                  if (!isPlaced) {
                    e.stopPropagation();
                    handleTouchStart(e, option);
                  }
                }}
                onClick={() => !isPlaced && handleLetterTap(option)}
                style={{
                  width: "min(74px, 18vw)",
                  height: "min(74px, 18vw)",
                  borderRadius: 18,
                  background: isPlaced ? "#E0EAF5" : bgColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "min(40px, 10vw)",
                  fontWeight: 700,
                  color: isPlaced ? "#aaa" : "#1E3A5F",
                  boxShadow: isPlaced ? "none" : `0 6px 18px ${bgColor}66`,
                  border: `3px solid ${isPlaced ? "transparent" : "rgba(255,255,255,0.6)"}`,
                  cursor: isPlaced ? "default" : "grab",
                  touchAction: "none",
                  userSelect: "none",
                  // Visibility: hidden instead of display:none so ref still works
                  pointerEvents: isDraggingThis ? "none" : "auto",
                  opacity: isDraggingThis ? 0.3 : isPlaced ? 0.3 : 1,
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
              left: dragState.x,
              top: dragState.y,
              transform: "translate(-50%, -50%)",
              zIndex: 9999,
              pointerEvents: "none",
              width: "min(80px, 20vw)",
              height: "min(80px, 20vw)",
              borderRadius: 18,
              background: LETTER_COLORS[round.options.findIndex((o) => o.id === dragState.id) % LETTER_COLORS.length],
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "min(44px, 11vw)",
              fontWeight: 700,
              color: "#1E3A5F",
              boxShadow: "0 12px 36px rgba(0,0,0,0.25)",
              border: "3px solid rgba(255,255,255,0.8)",
            }}
          >
            {dragState.letter}
          </div>
        )}
      </AnimatePresence>

      {/* Completion overlay */}
      <AnimatePresence>
        {completing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(214,238,255,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
              pointerEvents: "none",
            }}
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: [0.5, 1.2, 1] }}
              transition={{ duration: 0.4 }}
              style={{ fontSize: 80, textAlign: "center" }}
            >
              🌟
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}