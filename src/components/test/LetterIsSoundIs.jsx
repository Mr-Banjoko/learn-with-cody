import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackArrow from "../BackArrow";

const ALL_LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

// Same palette as DragTheLettersGame
const LETTER_COLORS = ["#FFAFC5", "#A8D8EA", "#FFE57A", "#B5EAD7", "#FFDAC1", "#FFAFC5"];
const SPEAKER_COLORS = ["#4ECDC4", "#FF6B6B", "#4D96FF"];

function SpeakerIcon({ color = "white", size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <path d="M18 21h-4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4l8 6V15l-8 6z" fill={color} />
      <path d="M30 20.5a8 8 0 0 1 0 11" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M33.5 17a13 13 0 0 1 0 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
    </svg>
  );
}

function buildRound() {
  const situation = Math.random() < 0.5 ? 1 : 2;
  const letter = ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)];
  const pool = ALL_LETTERS.filter((l) => l !== letter);
  const distractors = pool.sort(() => Math.random() - 0.5).slice(0, 2);
  // choices[0] is always the correct one (shuffled below)
  const choices = [letter, ...distractors].sort(() => Math.random() - 0.5);
  return { situation, letter, choices };
}

// Placeholder for future audio — called on tap/select, not on drag
function triggerSoundReady(identifier) {
  // Future: map identifier to audio file and play
  // e.g. playLetterName(identifier) or playLetterSound(identifier)
  // No-op for now — no error thrown
}

export default function LetterIsSoundIs({ onBack, lang = "en" }) {
  const [round, setRound] = useState(() => buildRound());
  const [placedIdx, setPlacedIdx] = useState(null); // index into choices[]
  const [showNext, setShowNext] = useState(false);
  const [wrongShake, setWrongShake] = useState(false);
  const [dragState, setDragState] = useState(null);

  const dropZoneRef = useRef(null);
  const isDragging = useRef(false);
  const shakeTimeout = useRef(null);

  const { situation, letter, choices } = round;

  // ── Touch drag handlers ────────────────────────────────────────────────────

  const handleTouchStart = useCallback((e, choiceIdx) => {
    if (placedIdx === choiceIdx || showNext) return;
    isDragging.current = false;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setDragState({
      choiceIdx,
      x: cx, y: cy,
      startX: touch.clientX, startY: touch.clientY,
      originX: cx, originY: cy,
    });
  }, [placedIdx, showNext]);

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
      // Pure tap — select + sound-ready, no drag
      triggerSoundReady(choices[dragState.choiceIdx]);
      setPlacedIdx((prev) => prev === dragState.choiceIdx ? null : dragState.choiceIdx);
      setDragState(null);
      return;
    }

    // Drag ended — check if over drop zone
    const touch = e.changedTouches[0];
    const ref = dropZoneRef.current;
    let hit = false;
    if (ref) {
      const rect = ref.getBoundingClientRect();
      hit =
        touch.clientX >= rect.left && touch.clientX <= rect.right &&
        touch.clientY >= rect.top && touch.clientY <= rect.bottom;
    }

    if (hit) {
      // No auto-verify — just snap in
      setPlacedIdx(dragState.choiceIdx);
    }
    // Drag ends silently regardless — no sound on drag
    setDragState(null);
    isDragging.current = false;
  }, [dragState, choices]);

  // ── Box tap (remove placed item) ──────────────────────────────────────────
  const handleBoxTap = useCallback(() => {
    if (showNext) return;
    setPlacedIdx(null);
  }, [showNext]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    if (placedIdx === null || showNext) return;
    // Correctness logic to be added later
    setShowNext(true);
  }, [placedIdx, showNext]);

  const handleNext = useCallback(() => {
    setRound(buildRound());
    setPlacedIdx(null);
    setShowNext(false);
    setWrongShake(false);
    setDragState(null);
    isDragging.current = false;
  }, []);

  const placedChoice = placedIdx !== null ? choices[placedIdx] : null;
  const placedColor = placedIdx !== null ? LETTER_COLORS[placedIdx % LETTER_COLORS.length] : null;
  const placedSpeakerColor = placedIdx !== null ? SPEAKER_COLORS[placedIdx % SPEAKER_COLORS.length] : null;

  // Shared box style
  const boxBase = {
    width: 110,
    height: 110,
    borderRadius: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "3px solid rgba(74,144,196,0.35)",
    boxShadow: "0 6px 24px rgba(30,58,95,0.10)",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: "Fredoka, sans-serif",
        background: "#D6EEFF",
        overflow: "hidden",
        position: "relative",
        touchAction: "none",
        userSelect: "none",
      }}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Back arrow */}
      <div style={{ padding: "12px 16px 0", flexShrink: 0 }}>
        <BackArrow onPress={onBack} />
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 32px",
          gap: 28,
        }}
      >
        {/* Row 1: letter is */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <span style={{ fontSize: 30, fontWeight: 700, color: "#1E3A5F", minWidth: 130, flexShrink: 0 }}>
            letter is
          </span>

          {situation === 1 ? (
            /* Situation 1: empty target box for letter */
            <div
              ref={dropZoneRef}
              onClick={placedChoice ? handleBoxTap : undefined}
              style={{
                ...boxBase,
                background: placedChoice ? (placedColor || "white") : "rgba(255,255,255,0.55)",
                cursor: placedChoice ? "pointer" : "default",
                border: `3px solid rgba(74,144,196,${placedChoice ? "0.5" : "0.35"})`,
              }}
            >
              {placedChoice && (
                <motion.span
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{ fontSize: 62, fontWeight: 700, color: "#1E3A5F", lineHeight: 1, fontFamily: "Fredoka, sans-serif" }}
                >
                  {placedChoice}
                </motion.span>
              )}
            </div>
          ) : (
            /* Situation 2: filled letter box */
            <div style={{ ...boxBase, background: "white" }}>
              <span style={{ fontSize: 62, fontWeight: 700, color: "#1E3A5F", lineHeight: 1, fontFamily: "Fredoka, sans-serif" }}>
                {letter}
              </span>
            </div>
          )}
        </div>

        {/* Row 2: sound is */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <span style={{ fontSize: 30, fontWeight: 700, color: "#1E3A5F", minWidth: 130, flexShrink: 0 }}>
            sound is
          </span>

          {situation === 2 ? (
            /* Situation 2: empty target box for speaker */
            <div
              ref={dropZoneRef}
              onClick={placedChoice ? handleBoxTap : undefined}
              style={{
                ...boxBase,
                background: placedChoice ? (placedSpeakerColor + "22") : "rgba(255,255,255,0.55)",
                cursor: placedChoice ? "pointer" : "default",
                border: `3px solid rgba(74,144,196,${placedChoice ? "0.5" : "0.35"})`,
              }}
            >
              {placedChoice && (
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                  <SpeakerIcon color={placedSpeakerColor} size={52} />
                </motion.div>
              )}
            </div>
          ) : (
            /* Situation 1: filled sound box with speaker */
            <div style={{ ...boxBase, background: "white" }}>
              <SpeakerIcon color="#4A90C4" size={52} />
            </div>
          )}
        </div>

        {/* Row 3: draggable choices */}
        <motion.div
          animate={wrongShake ? { x: [0, -10, 10, -8, 8, 0] } : { x: 0 }}
          transition={{ duration: 0.45 }}
          style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 8 }}
        >
          {choices.map((choice, idx) => {
            const isPlaced = placedIdx === idx;
            const isDraggingThis = dragState?.choiceIdx === idx;
            const bgColor = situation === 1 ? LETTER_COLORS[idx % LETTER_COLORS.length] : SPEAKER_COLORS[idx % SPEAKER_COLORS.length];

            if (isPlaced) {
              return (
                <div
                  key={idx}
                  style={{ width: 100, height: 100, visibility: "hidden", flexShrink: 0 }}
                />
              );
            }

            return (
              <motion.div
                key={idx}
                animate={isDraggingThis ? { scale: 1.08, opacity: 0.3 } : { scale: 1, opacity: 1 }}
                onTouchStart={(e) => { e.stopPropagation(); handleTouchStart(e, idx); }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 24,
                  background: bgColor,
                  border: "3px solid rgba(255,255,255,0.7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "grab",
                  touchAction: "none",
                  userSelect: "none",
                  pointerEvents: isDraggingThis ? "none" : "auto",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                  flexShrink: 0,
                }}
              >
                {situation === 1 ? (
                  <span style={{ fontSize: 52, fontWeight: 700, color: "#1E3A5F", fontFamily: "Fredoka, sans-serif", lineHeight: 1 }}>
                    {choice}
                  </span>
                ) : (
                  <SpeakerIcon color="white" size={48} />
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Submit */}
      <div style={{ flexShrink: 0, display: "flex", justifyContent: "center", padding: "0 24px 20px" }}>
        <motion.button
          onClick={handleSubmit}
          whileTap={placedIdx !== null && !showNext ? { scale: 0.95 } : {}}
          style={{
            background: placedIdx !== null && !showNext ? "linear-gradient(135deg, #4ECDC4, #44A08D)" : "#D1D5DB",
            color: placedIdx !== null && !showNext ? "white" : "#9CA3AF",
            border: "none",
            borderRadius: 999,
            padding: "16px 56px",
            fontSize: 22,
            fontWeight: 700,
            cursor: placedIdx !== null && !showNext ? "pointer" : "not-allowed",
            fontFamily: "Fredoka, sans-serif",
            boxShadow: placedIdx !== null && !showNext ? "0 8px 28px rgba(78,205,196,0.4)" : "none",
            transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          submit ✓
        </motion.button>
      </div>

      {/* Next — bottom right */}
      <div style={{ flexShrink: 0, display: "flex", justifyContent: "flex-end", paddingRight: 28, paddingBottom: "calc(28px + env(safe-area-inset-bottom, 0px))", minHeight: 72, alignItems: "flex-end" }}>
        <AnimatePresence>
          {showNext && (
            <motion.button
              initial={{ opacity: 0, scale: 0.7, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ type: "spring", stiffness: 350, damping: 22 }}
              onClick={handleNext}
              whileTap={{ scale: 0.93 }}
              style={{
                background: "linear-gradient(135deg, #6BCB77, #44A08D)",
                color: "white",
                border: "none",
                borderRadius: 999,
                padding: "16px 32px",
                fontSize: 22,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "Fredoka, sans-serif",
                boxShadow: "0 8px 28px rgba(107,203,119,0.45)",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              next →
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Drag ghost — follows finger */}
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
              width: 108,
              height: 108,
              borderRadius: 24,
              background: situation === 1
                ? LETTER_COLORS[dragState.choiceIdx % LETTER_COLORS.length]
                : SPEAKER_COLORS[dragState.choiceIdx % SPEAKER_COLORS.length],
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 12px 36px rgba(0,0,0,0.25)",
              border: "3px solid rgba(255,255,255,0.8)",
            }}
          >
            {situation === 1 ? (
              <span style={{ fontSize: 56, fontWeight: 700, color: "#1E3A5F", fontFamily: "Fredoka, sans-serif", lineHeight: 1 }}>
                {choices[dragState.choiceIdx]}
              </span>
            ) : (
              <SpeakerIcon color="white" size={52} />
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}