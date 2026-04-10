import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";
import BackArrow from "../BackArrow";
import { getLetterSoundUrl, getLetterGain } from "../../lib/letterSounds";
import { playAudio, playAudioSequence } from "../../lib/useAudio";

// ─── Colors for the TOP row boxes only ───────────────────────────────────────
const TOP_COLORS = ["#FFAFC5", "#A8D8EA", "#FFE57A"];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getDistractors(word) {
  const all = "abcdefghijklmnoprstw".split("");
  const used = new Set(word.split(""));
  const pool = all.filter((l) => !used.has(l)).sort(() => Math.random() - 0.5);
  return pool.slice(0, 2);
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
  const distractors = getDistractors(card.word);
  // Use round-unique IDs so React never confuses tiles across rounds
  const ts = Date.now();
  const options = shuffle([
    { id: `correct-${ts}`, letter: letters[missingPos], isCorrect: true },
    { id: `d0-${ts}`, letter: distractors[0], isCorrect: false },
    { id: `d1-${ts}`, letter: distractors[1], isCorrect: false },
  ]);
  return { card, letters, missingPos, options };
}

// ─────────────────────────────────────────────────────────────────────────────
// MissingSoundRound
// Mounted fresh every round via key={roundIndex} from the parent.
// All interaction state is local — nothing stale ever survives a round change.
// ─────────────────────────────────────────────────────────────────────────────
function MissingSoundRound({ round, color, onComplete, lang = "en" }) {
  const accentColor = color || "#4A90C4";

  // ── Interaction state — all fresh on every mount ──
  const [placedOption, setPlacedOption] = useState(null);
  const [feedback, setFeedback] = useState(null); // null | 'wrong' | 'completing'
  const [bouncingIndex, setBouncingIndex] = useState(null);
  const [dragState, setDragState] = useState(null);
  const [isActiveDrag, setIsActiveDrag] = useState(false);

  // ── Refs — fresh per mount, never stale ──
  const dropZoneRef = useRef(null);
  const sequenceRef = useRef(null);
  const isDragging = useRef(false);
  const dragStateRef = useRef(null);
  const placedOptionRef = useRef(null);

  // Cancel any in-flight audio on unmount
  useEffect(() => {
    return () => {
      if (sequenceRef.current) { sequenceRef.current(); sequenceRef.current = null; }
    };
  }, []);

  const syncSetPlaced = useCallback((val) => {
    placedOptionRef.current = val;
    setPlacedOption(val);
  }, []);

  // ── Completion: play letter1 → letter2 → letter3 → word, then advance ──
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
      onComplete(); // parent increments roundIndex → this component unmounts → fresh round
    });
    sequenceRef.current = cancel;
  }, [round, onComplete]);

  // ── Submit ──
  const handleSubmit = useCallback(() => {
    const placed = placedOptionRef.current;
    if (!placed || feedback === "completing") return;
    if (placed.isCorrect) {
      playCompletion();
    } else {
      setFeedback("wrong");
      setTimeout(() => {
        syncSetPlaced(null);
        setFeedback(null);
      }, 700);
    }
  }, [feedback, playCompletion, syncSetPlaced]);

  // ── Touch: start ──
  const handleTouchStart = useCallback((e, option) => {
    // If this tile is already sitting in the slot, don't start a new drag
    if (placedOptionRef.current?.id === option.id) return;
    e.stopPropagation();
    isDragging.current = false;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const ds = {
      id: option.id,
      letter: option.letter,
      isCorrect: option.isCorrect,
      optionIndex: round.options.findIndex((o) => o.id === option.id),
      x: cx, y: cy,
      startX: touch.clientX, startY: touch.clientY,
      originX: cx, originY: cy,
    };
    dragStateRef.current = ds;
    setDragState(ds);
  }, [round.options]);

  // ── Touch: move ──
  const handleTouchMove = useCallback((e) => {
    if (!dragStateRef.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    const prev = dragStateRef.current;
    const dx = touch.clientX - prev.startX;
    const dy = touch.clientY - prev.startY;
    if (!isDragging.current && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
      isDragging.current = true;
      setIsActiveDrag(true);
    }
    const updated = { ...prev, x: prev.originX + dx, y: prev.originY + dy };
    dragStateRef.current = updated;
    setDragState(updated);
  }, []);

  // ── Touch: end ──
  const handleTouchEnd = useCallback((e) => {
    const ds = dragStateRef.current;
    if (!ds) return;

    if (isDragging.current) {
      const touch = e.changedTouches[0];
      // Only snap if slot is empty
      if (dropZoneRef.current && !placedOptionRef.current) {
        const rect = dropZoneRef.current.getBoundingClientRect();
        const hit = (
          touch.clientX >= rect.left && touch.clientX <= rect.right &&
          touch.clientY >= rect.top  && touch.clientY <= rect.bottom
        );
        if (hit) {
          syncSetPlaced({
            id: ds.id,
            letter: ds.letter,
            isCorrect: ds.isCorrect,
            optionIndex: ds.optionIndex,
          });
        }
      }
    }
    // Always clean up drag state
    dragStateRef.current = null;
    setDragState(null);
    setIsActiveDrag(false);
    isDragging.current = false;
  }, [syncSetPlaced]);

  // ── Top-letter tap (plays phoneme) ──
  const handleTopLetterTap = useCallback((letter) => {
    const url = getLetterSoundUrl(letter);
    if (url) playAudio(url, getLetterGain(letter));
  }, []);

  const canSubmit = placedOption !== null && feedback !== "completing";

  return (
    <div
      style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "space-evenly",
        padding: "10px 20px 14px", minHeight: 0,
        touchAction: "none", userSelect: "none",
      }}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── TOP LAYER: shared frame + 3 letter boxes ── */}
      <div style={{
        background: "rgba(255,255,255,0.55)",
        borderRadius: 32,
        padding: "18px 22px",
        boxShadow: "0 8px 32px rgba(30,58,95,0.10)",
        border: "2px solid rgba(255,255,255,0.85)",
        display: "flex",
        gap: "min(20px, 4vw)",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        {round.letters.map((letter, i) => {
          const isMissing = i === round.missingPos;
          const isPlacedHere = isMissing && placedOption !== null;
          const isBouncing = bouncingIndex === i;
          const isWrong = isMissing && feedback === "wrong";

          return (
            <motion.div
              key={i}
              ref={isMissing ? dropZoneRef : null}
              animate={
                isWrong
                  ? { x: [0, -10, 10, -7, 7, 0] }
                  : isBouncing
                  ? { y: [0, -20, 0, -10, 0, -4, 0] }
                  : {}
              }
              transition={{ duration: isWrong ? 0.38 : 0.5 }}
              onPointerDown={!isMissing ? (e) => { e.preventDefault(); handleTopLetterTap(letter); } : undefined}
              style={{
                width: "min(108px, 27vw)",
                height: "min(108px, 27vw)",
                borderRadius: 26,
                background: isPlacedHere
                  ? TOP_COLORS[placedOption.optionIndex % TOP_COLORS.length]
                  : isMissing
                  ? "rgba(255,255,255,0.5)"
                  : TOP_COLORS[i],
                border: isMissing && !isPlacedHere
                  ? `3px dashed ${accentColor}60`
                  : "3px solid rgba(255,255,255,0.85)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: isMissing && !isPlacedHere ? "none" : "0 6px 20px rgba(0,0,0,0.10)",
                cursor: isMissing ? "default" : "pointer",
                touchAction: "manipulation",
                transition: "background 0.2s, border 0.2s",
                flexShrink: 0,
              }}
            >
              {isPlacedHere ? (
                <motion.span
                  key={`placed-${placedOption.id}`}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 350, damping: 22 }}
                  style={{ fontSize: "min(58px, 14.5vw)", fontWeight: 700, color: "#1E3A5F" }}
                >
                  {placedOption.letter}
                </motion.span>
              ) : isMissing ? (
                <span style={{ fontSize: "min(34px, 8.5vw)", color: `${accentColor}60`, fontWeight: 700 }}>?</span>
              ) : (
                <span style={{ fontSize: "min(58px, 14.5vw)", fontWeight: 700, color: "#1E3A5F" }}>{letter}</span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ── MIDDLE: Play full word ── */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onPointerDown={(e) => { e.preventDefault(); round.card.audio && playAudio(round.card.audio); }}
          style={{
            width: "min(64px, 16vw)", height: "min(64px, 16vw)", borderRadius: "50%",
            background: accentColor, border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 6px 24px ${accentColor}55`,
            cursor: "pointer", touchAction: "manipulation",
          }}
        >
          <Play size={26} color="white" fill="white" />
        </motion.button>
        <span style={{ fontSize: 11, color: "#7BACC8", fontWeight: 600, letterSpacing: "0.03em" }}>{lang === "zh" ? "听单词" : "hear the word"}</span>
      </div>

      {/* ── BOTTOM: answer tiles ── */}
      <div style={{ display: "flex", gap: "min(16px, 4vw)", justifyContent: "center", flexShrink: 0 }}>
        {round.options.map((option) => {
          const isPlaced = placedOption?.id === option.id;
          const isDraggingThis = dragState?.id === option.id;

          // Invisible spacer holds the layout while tile is in the slot
          if (isPlaced) {
            return (
              <div
                key={option.id}
                style={{ width: "min(74px, 19vw)", height: "min(74px, 19vw)", visibility: "hidden", flexShrink: 0 }}
              />
            );
          }

          return (
            <motion.div
              key={option.id}
              animate={isDraggingThis ? { scale: 1.06, opacity: 0.3 } : { scale: 1, opacity: 1 }}
              onTouchStart={(e) => handleTouchStart(e, option)}
              style={{
                width: "min(74px, 19vw)",
                height: "min(74px, 19vw)",
                borderRadius: 20,
                background: "white",
                border: "2.5px solid rgba(168,208,230,0.55)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "min(38px, 9.5vw)", fontWeight: 700, color: "#1E3A5F",
                boxShadow: "0 3px 12px rgba(30,58,95,0.08)",
                cursor: "grab", touchAction: "none", userSelect: "none",
                pointerEvents: isDraggingThis ? "none" : "auto",
                flexShrink: 0,
              }}
            >
              {option.letter}
            </motion.div>
          );
        })}
      </div>

      {/* ── Submit ── */}
      <motion.button
        whileTap={canSubmit ? { scale: 0.95 } : {}}
        onClick={handleSubmit}
        style={{
          padding: "14px 52px", borderRadius: 99, border: "none",
          background: canSubmit ? accentColor : "rgba(168,208,230,0.35)",
          color: canSubmit ? "white" : "rgba(74,144,196,0.4)",
          fontSize: 20, fontWeight: 700,
          boxShadow: canSubmit ? `0 6px 24px ${accentColor}50` : "none",
          cursor: canSubmit ? "pointer" : "not-allowed",
          transition: "all 0.25s",
          flexShrink: 0, touchAction: "manipulation",
        }}
      >
        {feedback === "wrong"
          ? (lang === "zh" ? "再试一次！🔄" : "Try Again! 🔄")
          : feedback === "completing"
          ? (lang === "zh" ? "🎉 太好了！" : "🎉 Great!")
          : (lang === "zh" ? "提交 ✓" : "Submit ✓")}
      </motion.button>

      {/* ── Drag ghost ── */}
      <AnimatePresence>
        {dragState && isActiveDrag && (
          <div
            style={{
              position: "fixed",
              left: dragState.x, top: dragState.y,
              transform: "translate(-50%, -50%)",
              zIndex: 9999, pointerEvents: "none",
              width: "min(78px, 20vw)", height: "min(78px, 20vw)", borderRadius: 20,
              background: "white",
              border: "2.5px solid rgba(168,208,230,0.7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "min(40px, 10vw)", fontWeight: 700, color: "#1E3A5F",
              boxShadow: "0 14px 40px rgba(30,58,95,0.22)",
            }}
          >
            {dragState.letter}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MissingSoundGame — manages round cycling and renders the shell
// ─────────────────────────────────────────────────────────────────────────────
export default function MissingSoundGame({ words, title, color, onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const total = words.length;
  const accentColor = color || "#4A90C4";

  // Build the round object. Using useMemo so it's stable per roundIndex.
  const round = useMemo(() => buildRound(words[roundIndex]), [roundIndex, words]);

  const handleComplete = useCallback(() => {
    setRoundIndex((prev) => (prev + 1 < words.length ? prev + 1 : 0));
  }, [words.length]);

  return (
    <div
      style={{
        display: "flex", flexDirection: "column", height: "100%", flex: 1,
        background: "#D6EEFF", fontFamily: "Fredoka, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* ── Header ── */}
      <div style={{
        background: "#A8D0E6", borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
        padding: "10px 20px 14px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
      }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1, textAlign: "center", marginRight: 40 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1E3A5F" }}>{lang === "zh" ? "缺失的音 ❓" : "Missing Sound ❓"}</h1>
          <p style={{ fontSize: 13, color: "#3A6080" }}>{title} · {roundIndex + 1} / {total}</p>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div style={{ height: 6, background: "rgba(255,255,255,0.5)", margin: "0 24px", borderRadius: 99, flexShrink: 0 }}>
        <div style={{ height: "100%", borderRadius: 99, background: accentColor, width: `${(roundIndex / total) * 100}%`, transition: "width 0.4s" }} />
      </div>

      {/*
        KEY ARCHITECTURAL FIX:
        key={roundIndex} forces MissingSoundRound to fully unmount and remount
        on every round change. This guarantees:
          - all state is fresh (placedOption, feedback, dragState, etc.)
          - all refs are fresh (dropZoneRef, dragStateRef, placedOptionRef)
          - all DOM nodes are new (no stale event targets)
          - no stale closures from the previous round survive
        This is the idiomatic React solution for per-round game interactions.
      */}
      <MissingSoundRound
        key={roundIndex}
        round={round}
        color={color}
        onComplete={handleComplete}
        lang={lang}
      />
    </div>
  );
}