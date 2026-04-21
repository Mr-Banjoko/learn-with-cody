import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackArrow from "../BackArrow";
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

export default function DragTheLettersGameV2({ words, title, color, onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [round, setRound] = useState(() => buildRound(words[0]));

  // placed[i] = option.id that is in box i, or null
  const [placed, setPlaced] = useState([null, null, null]);
  const [placedColors, setPlacedColors] = useState({});

  // shake: box index that should shake, or "tiles" to shake all tiles back
  const [shake, setShake] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [bouncingIndex, setBouncingIndex] = useState(null);
  const [dragState, setDragState] = useState(null);

  // submitError: triggers the reset animation
  const [submitError, setSubmitError] = useState(false);

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
    setSubmitError(false);
    isDragging.current = false;
    if (sequenceRef.current) { sequenceRef.current(); sequenceRef.current = null; }
  }, [roundIndex]);

  const playCompletion = useCallback((card, letters) => {
    setCompleting(true);
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

  // ── Touch drag handlers ────────────────────────────────────────────────
  const handleTouchStart = useCallback((e, option) => {
    // Don't allow dragging a tile that's already in a box
    if (placed.includes(option.id)) return;
    if (completing) return;
    isDragging.current = false;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setDragState({
      id: option.id, letter: option.letter, correctPos: option.correctPos,
      x: cx, y: cy, startX: touch.clientX, startY: touch.clientY, originX: cx, originY: cy,
    });
  }, [placed, completing]);

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
      // Tap — just play sound
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

    if (hitBox !== -1 && placed[hitBox] === null) {
      // V2: snap into any box whether correct or not
      const optIdx = round.options.findIndex((o) => o.id === dragState.id);
      const tileColor = LETTER_COLORS[optIdx % LETTER_COLORS.length];
      const newPlaced = [...placed];
      newPlaced[hitBox] = dragState.id;
      setPlacedColors((prev) => ({ ...prev, [hitBox]: tileColor }));
      setPlaced(newPlaced);
    }
    // If no valid box hit, tile returns to tray (no action needed — state unchanged)

    setDragState(null);
    isDragging.current = false;
  }, [dragState, placed, round]);

  // ── Submit handler ─────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    if (completing) return;

    // All 3 boxes must be filled
    if (placed.some((p) => p === null)) return;

    // Check all 3 boxes are correct
    const allCorrect = placed.every((optionId, boxIndex) => {
      const opt = round.options.find((o) => o.id === optionId);
      return opt && opt.correctPos === boxIndex;
    });

    if (allCorrect) {
      playCompletion(round.card, round.letters);
    } else {
      // Shake all boxes, then reset
      setSubmitError(true);
      setTimeout(() => {
        setSubmitError(false);
        setPlaced([null, null, null]);
        setPlacedColors({});
      }, 600);
    }
  }, [completing, placed, round, playCompletion]);

  const progress = placed.filter(Boolean).length;
  const allFilled = placed.every((p) => p !== null);
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
      <div style={{ background: "#A8D0E6", borderBottomLeftRadius: 28, borderBottomRightRadius: 28, padding: "10px 20px 14px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1, textAlign: "center", marginRight: 40 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1E3A5F" }}>{lang === "zh" ? "拖拽字母 V2 ✋" : "Drag the Letters V2 ✋"}</h1>
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
          onPointerDown={(e) => { e.preventDefault(); card.audio && playAudio(card.audio); }}
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
            const isShaking = submitError;

            return (
              <motion.div
                key={i}
                ref={(el) => (dropZoneRefs.current[i] = el)}
                animate={
                  isShaking
                    ? { x: [0, -10, 10, -8, 8, -4, 4, 0] }
                    : isBouncing
                    ? { y: [0, -16, 0, -8, 0, -4, 0] }
                    : {}
                }
                transition={{ duration: isShaking ? 0.5 : 0.5 }}
                style={{
                  width: "min(76px, 20vw)", height: "min(76px, 20vw)", borderRadius: 18,
                  background: tileColor || "rgba(255,255,255,0.7)",
                  border: `3px solid ${tileColor ? (submitError ? "#FF6B6B" : "rgba(255,255,255,0.85)") : "rgba(74,144,196,0.4)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: tileColor ? "0 4px 16px rgba(0,0,0,0.12)" : "inset 0 2px 8px rgba(0,0,0,0.06)",
                  transition: "background 0.2s, border 0.2s",
                }}
              >
                {placedOption ? (
                  <motion.span
                    key={placedOption.id}
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

        {/* Status text */}
        <p style={{ fontSize: 15, color: "#4A90C4", fontWeight: 600, textAlign: "center", flexShrink: 0 }}>
          {completing
            ? (lang === "zh" ? "🎉 好极了！听一听……" : "🎉 Great job! Listen...")
            : submitError
            ? (lang === "zh" ? "❌ 再试一次！" : "❌ Try again!")
            : allFilled
            ? (lang === "zh" ? "准备好了！点击提交！" : "Ready! Hit Submit!")
            : progress === 0
            ? (lang === "zh" ? "拖动字母来拼写单词！" : "Drag letters to spell the word!")
            : (lang === "zh" ? `已放置 ${progress} 个，共 ${round.letters.length} 个` : `${progress} of ${round.letters.length} placed`)}
        </p>

        {/* Letter tiles */}
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

        {/* Submit button */}
        {!completing && (
          <motion.button
            whileTap={allFilled ? { scale: 0.93 } : {}}
            onClick={handleSubmit}
            disabled={!allFilled}
            style={{
              padding: "14px 48px",
              borderRadius: 999,
              background: allFilled ? "#4A90C4" : "rgba(74,144,196,0.3)",
              color: allFilled ? "white" : "rgba(255,255,255,0.6)",
              border: "none",
              fontSize: 20,
              fontWeight: 700,
              fontFamily: "Fredoka, sans-serif",
              cursor: allFilled ? "pointer" : "default",
              boxShadow: allFilled ? "0 4px 0 #2f6a9a" : "none",
              transition: "background 0.25s, box-shadow 0.25s, color 0.25s",
              touchAction: "manipulation",
              flexShrink: 0,
            }}
          >
            {lang === "zh" ? "提交 ✓" : "Submit ✓"}
          </motion.button>
        )}
      </div>

      {/* Dragging ghost */}
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