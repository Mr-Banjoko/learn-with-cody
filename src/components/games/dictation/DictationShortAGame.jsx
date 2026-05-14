/**
 * DictationShortAGame
 *
 * 6-row layout per round:
 *   Row 1 — Speaker icon (tap to replay word audio)
 *   Row 2 — 3 large empty drop boxes (one per letter)
 *   Rows 3-5 — 12 draggable letter tiles (4 per row)
 *   Row 6 — Submit + Reset buttons
 *
 * Tile drag behavior reused from DragTheLettersGameV2.
 * Submit/reset logic reused from DragTheLettersGameV2.
 * Auto-play word audio at round start; UI locked during playback.
 * Repeated letters are handled by letter-value comparison (not tile-ID).
 * Wrong submit deducts 1 life via onMistake prop.
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Volume2 } from "lucide-react";
import BackArrow from "../../BackArrow";
import { getLetterSoundUrl, getLetterGain } from "../../../lib/letterSounds";
import { playAudio, playAudioSequence } from "../../../lib/useAudio";
import { shortAWords } from "../../../lib/shortAWords";

// ── Constants ─────────────────────────────────────────────────────────────────
const ALL_LETTERS = "abcdefghijklmnoprstw".split("");
const LETTER_COLORS = ["#FFAFC5", "#A8D8EA", "#FFE57A", "#B5EAD7", "#FFDAC1", "#C4B5FD", "#FCA5A5", "#6EE7B7", "#FCD34D", "#93C5FD", "#F9A8D4", "#86EFAC"];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Pick 9 distractor letters not in the word, unique
function getDistractors(word, count = 9) {
  const used = new Set(word.split(""));
  const pool = ALL_LETTERS.filter((l) => !used.has(l));
  const shuffled = shuffle(pool);
  return shuffled.slice(0, count);
}

// Build 12 tiles: 3 correct + 9 distractors, shuffled
function buildRound(card) {
  const letters = card.word.split(""); // exactly 3 letters (CVC)
  const distractors = getDistractors(card.word, 9);

  const tiles = [
    ...letters.map((l, i) => ({ id: `correct-${i}`, letter: l })),
    ...distractors.map((l, i) => ({ id: `distractor-${i}`, letter: l })),
  ];
  return { card, letters, tiles: shuffle(tiles) };
}

// Split 12 tiles into 3 rows of 4
function splitRows(tiles) {
  return [tiles.slice(0, 4), tiles.slice(4, 8), tiles.slice(8, 12)];
}

export default function DictationShortAGame({ onBack, onMistake, lang = "en" }) {
  const words = shortAWords;
  const [roundIndex, setRoundIndex] = useState(0);
  const [round, setRound] = useState(() => buildRound(words[0]));

  // placed[boxIndex] = tile id or null
  const [placed, setPlaced] = useState([null, null, null]);
  const [placedColors, setPlacedColors] = useState({});

  const [submitError, setSubmitError] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [bouncingIndex, setBouncingIndex] = useState(null);
  const [dragState, setDragState] = useState(null);
  // Pulsating hint: set of correct tile ids pulsating after wrong submit
  const [pulsatingIds, setPulsatingIds] = useState(new Set());

  // UI locked during auto-play at round start
  const [audioLocked, setAudioLocked] = useState(true);

  const dropZoneRefs = useRef([]);
  const sequenceRef = useRef(null);
  const isDragging = useRef(false);

  const total = words.length;

  // ── Round setup ────────────────────────────────────────────────────────────
  useEffect(() => {
    const newRound = buildRound(words[roundIndex]);
    setRound(newRound);
    setPlaced([null, null, null]);
    setPlacedColors({});
    setSubmitError(false);
    setCompleting(false);
    setBouncingIndex(null);
    setDragState(null);
    setPulsatingIds(new Set());
    isDragging.current = false;
    if (sequenceRef.current) { sequenceRef.current(); sequenceRef.current = null; }

    // Auto-play word audio, lock UI during playback
    setAudioLocked(true);
    const card = words[roundIndex];
    const t = setTimeout(() => {
      if (card.audio) {
        playAudio(card.audio);
        const unlock = setTimeout(() => setAudioLocked(false), 1400);
        return () => clearTimeout(unlock);
      } else {
        setAudioLocked(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [roundIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Completion sequence ────────────────────────────────────────────────────
  const playCompletion = useCallback((card, letters) => {
    setCompleting(true);
    const letterSteps = letters.map((letter, i) => {
      const url = getLetterSoundUrl(letter);
      return url ? { url, gain: getLetterGain(letter), onStart: () => setBouncingIndex(i) } : null;
    }).filter(Boolean);
    const wordStep = card.audio ? [{ url: card.audio, onStart: () => setBouncingIndex(null) }] : [];
    const steps = [...letterSteps, ...wordStep];

    const cancel = playAudioSequence(steps, () => {
      sequenceRef.current = null;
      setBouncingIndex(null);
      setRoundIndex((prev) => (prev + 1 < words.length ? prev + 1 : 0));
    });
    sequenceRef.current = cancel;
  }, [words]);

  // ── Touch drag (reused from DragTheLettersGameV2) ──────────────────────────
  // Stop pulsating when user starts interacting
  const stopPulsating = useCallback(() => {
    if (pulsatingIds.size > 0) setPulsatingIds(new Set());
  }, [pulsatingIds]);

  const handleTouchStart = useCallback((e, tile) => {
    if (placed.includes(tile.id)) return;
    if (completing || audioLocked) return;
    stopPulsating();
    isDragging.current = false;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setDragState({ id: tile.id, letter: tile.letter, x: cx, y: cy, startX: touch.clientX, startY: touch.clientY, originX: cx, originY: cy });
  }, [placed, completing, audioLocked, stopPulsating]);

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
      // Tap — play letter sound (no drag happened)
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
      if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
          touch.clientY >= rect.top  && touch.clientY <= rect.bottom) {
        hitBox = i;
      }
    });

    if (hitBox !== -1) {
      const tileIdx = round.tiles.findIndex((t) => t.id === dragState.id);
      const tileColor = LETTER_COLORS[tileIdx % LETTER_COLORS.length];
      const newPlaced = [...placed];

      // If box already occupied, displace its tile back (just set to null — tile returns to tray)
      // Then place new tile
      newPlaced[hitBox] = dragState.id;
      setPlacedColors((prev) => ({ ...prev, [hitBox]: tileColor }));
      setPlaced(newPlaced);
    }

    setDragState(null);
    isDragging.current = false;
  }, [dragState, placed, round]);

  // ── Submit (letter-value matching, handles repeated letters) ───────────────
  const handleSubmit = useCallback(() => {
    if (completing || audioLocked) return;
    if (placed.some((p) => p === null)) return;

    const allCorrect = placed.every((tileId, boxIndex) => {
      const tile = round.tiles.find((t) => t.id === tileId);
      // Compare letter CHARACTER, not tile ID — repeated letters are interchangeable
      return tile && tile.letter === round.letters[boxIndex];
    });

    if (allCorrect) {
      setPulsatingIds(new Set());
      playCompletion(round.card, round.letters);
    } else {
      onMistake && onMistake();
      setSubmitError(true);
      // Start pulsating the correct letter tiles as hint
      const correctIds = new Set(round.tiles.filter((t) => t.id.startsWith("correct-")).map((t) => t.id));
      setPulsatingIds(correctIds);
      setTimeout(() => {
        setSubmitError(false);
        setPlaced([null, null, null]);
        setPlacedColors({});
        // Keep pulsating — stops when user interacts
      }, 600);
    }
  }, [completing, audioLocked, placed, round, playCompletion, onMistake]);

  const handleReset = useCallback(() => {
    if (completing) return;
    stopPulsating();
    setPlaced([null, null, null]);
    setPlacedColors({});
  }, [completing, stopPulsating]);

  const handleSpeaker = useCallback(() => {
    if (audioLocked) return;
    if (round.card.audio) playAudio(round.card.audio);
  }, [audioLocked, round]);

  const allFilled = placed.every((p) => p !== null);
  const card = round.card;
  const tileRows = splitRows(round.tiles);

  return (
    <div
      style={{
        display: "flex", flexDirection: "column", height: "100%",
        background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
        fontFamily: "Fredoka, sans-serif", overflow: "hidden",
        touchAction: "none", userSelect: "none",
      }}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4, padding: "calc(env(safe-area-inset-top,0px) + 8px) 16px 8px", borderBottom: "1.5px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.75)", backdropFilter: "blur(10px)" }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1E293B" }}>
            {lang === "zh" ? "🍎 听写 · 短元音 A" : "🍎 Dictation · Short a"}
          </p>
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#94A3B8" }}>{roundIndex + 1}/{total}</span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
        <motion.div animate={{ width: `${(roundIndex / total) * 100}%` }} transition={{ duration: 0.4 }} style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #FF6B6B, #FF9F43)" }} />
      </div>

      {/* Lock overlay during auto-play */}
      {audioLocked && <div style={{ position: "absolute", inset: 0, zIndex: 200, touchAction: "none", pointerEvents: "all" }} />}

      {/* Main 6-row content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", padding: "8px 16px 12px", minHeight: 0, gap: 0 }}>

        {/* ROW 1 — Speaker icon */}
        <motion.div
          whileTap={{ scale: 0.88 }}
          onClick={handleSpeaker}
          style={{
            width: "min(72px, 18vw)", height: "min(72px, 18vw)",
            borderRadius: "50%",
            background: "white",
            border: "3px solid #A8D8EA",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 6px 20px rgba(74,144,196,0.22)",
            cursor: "pointer", touchAction: "manipulation", flexShrink: 0,
            pointerEvents: "auto",
          }}
          aria-label="Play word audio"
        >
          <div style={{ pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Volume2 size={32} color="#4A90C4" strokeWidth={2} />
          </div>
        </motion.div>

        {/* ROW 2 — 3 Drop boxes */}
        <div style={{ display: "flex", gap: "min(14px, 3vw)", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {[0, 1, 2].map((i) => {
            const placedId = placed[i];
            const placedTile = placedId ? round.tiles.find((t) => t.id === placedId) : null;
            const isBouncing = bouncingIndex === i;
            const tileColor = placedColors[i];
            return (
              <motion.div
                key={i}
                ref={(el) => (dropZoneRefs.current[i] = el)}
                animate={
                  submitError ? { x: [0, -10, 10, -8, 8, -4, 4, 0] }
                  : isBouncing ? { y: [0, -16, 0, -8, 0, -4, 0] }
                  : {}
                }
                transition={{ duration: 0.5 }}
                style={{
                  width: "min(88px, 23vw)", height: "min(88px, 23vw)",
                  borderRadius: 22,
                  background: tileColor || "rgba(255,255,255,0.75)",
                  border: `3px solid ${tileColor ? (submitError ? "#FF6B6B" : "rgba(255,255,255,0.85)") : "rgba(74,144,196,0.35)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: tileColor ? "0 4px 18px rgba(0,0,0,0.13)" : "inset 0 2px 8px rgba(0,0,0,0.07)",
                  transition: "background 0.2s, border 0.2s",
                  flexShrink: 0,
                }}
              >
                {placedTile ? (
                  <motion.span
                    key={placedTile.id}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ fontSize: "min(48px, 12vw)", fontWeight: 700, color: "#1E3A5F" }}
                  >
                    {placedTile.letter}
                  </motion.span>
                ) : (
                  <span style={{ fontSize: "min(32px, 8vw)", color: "rgba(74,144,196,0.25)", fontWeight: 700 }}>?</span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* ROWS 3-5 — Letter tiles, 4 per row */}
        <div style={{ display: "flex", flexDirection: "column", gap: "min(10px, 2vw)", alignItems: "center", flexShrink: 0 }}>
          {tileRows.map((row, rowIdx) => (
            <div key={rowIdx} style={{ display: "flex", gap: "min(10px, 2.5vw)", justifyContent: "center" }}>
              {row.map((tile, colIdx) => {
                const globalIdx = rowIdx * 4 + colIdx;
                const isPlaced = placed.includes(tile.id);
                const isDraggingThis = dragState?.id === tile.id;
                const bgColor = LETTER_COLORS[globalIdx % LETTER_COLORS.length];

                const isPulsating = pulsatingIds.has(tile.id) && !isPlaced;

                if (isPlaced) {
                  return (
                    <div key={tile.id} style={{ width: "min(72px, 18vw)", height: "min(72px, 18vw)", visibility: "hidden", flexShrink: 0 }} />
                  );
                }

                return (
                  <motion.div
                    key={tile.id}
                    animate={
                      isDraggingThis
                        ? { scale: 1.08 }
                        : isPulsating
                        ? { scale: [1, 1.12, 1] }
                        : { scale: 1, opacity: 1 }
                    }
                    transition={
                      isPulsating
                        ? { repeat: Infinity, duration: 0.7, ease: "easeInOut" }
                        : {}
                    }
                    onTouchStart={(e) => { e.stopPropagation(); handleTouchStart(e, tile); }}
                    style={{
                      width: "min(72px, 18vw)", height: "min(72px, 18vw)",
                      borderRadius: 18,
                      background: bgColor,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "min(38px, 9.5vw)", fontWeight: 700, color: "#1E3A5F",
                      boxShadow: isPulsating
                        ? `0 0 0 3px #22c55e, 0 4px 16px rgba(34,197,94,0.45)`
                        : "0 4px 12px rgba(0,0,0,0.10)",
                      border: isPulsating ? "3px solid #22c55e" : "3px solid rgba(255,255,255,0.75)",
                      cursor: "grab", touchAction: "none", userSelect: "none",
                      pointerEvents: isDraggingThis ? "none" : "auto",
                      opacity: isDraggingThis ? 0.3 : 1,
                      flexShrink: 0,
                      transition: "box-shadow 0.2s, border 0.2s",
                    }}
                  >
                    {tile.letter}
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>

        {/* ROW 6 — Submit + Reset */}
        <div style={{ display: "flex", gap: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {/* Reset */}
          <button
            onPointerDown={(e) => { e.stopPropagation(); handleReset(); }}
            style={{
              width: 54, height: 54, borderRadius: 27,
              background: "white",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, touchAction: "manipulation",
              opacity: placed.some(Boolean) && !completing ? 1 : 0.35,
            }}
            aria-label="Reset"
          >
            <RotateCcw size={24} color="#A8D0E6" strokeWidth={2.2} />
          </button>

          {/* Submit */}
          {!completing && (
            <motion.button
              whileTap={allFilled ? { scale: 0.93 } : {}}
              onPointerDown={(e) => { e.preventDefault(); handleSubmit(); }}
              disabled={!allFilled}
              style={{
                padding: "14px 44px",
                borderRadius: 999,
                background: allFilled ? "#FF6B6B" : "rgba(255,107,107,0.28)",
                color: allFilled ? "white" : "rgba(255,107,107,0.55)",
                border: "none",
                fontSize: 20, fontWeight: 700,
                fontFamily: "Fredoka, sans-serif",
                cursor: allFilled ? "pointer" : "default",
                boxShadow: allFilled ? "0 4px 0 #cc4444" : "none",
                transition: "background 0.25s, box-shadow 0.25s, color 0.25s",
                touchAction: "manipulation", flexShrink: 0,
              }}
            >
              {lang === "zh" ? "提交 ✓" : "Submit ✓"}
            </motion.button>
          )}
        </div>
      </div>

      {/* Drag ghost */}
      <AnimatePresence>
        {dragState && isDragging.current && (
          <div
            style={{
              position: "fixed",
              left: dragState.x, top: dragState.y,
              transform: "translate(-50%, -50%)",
              zIndex: 9999, pointerEvents: "none",
              width: "min(80px, 20vw)", height: "min(80px, 20vw)", borderRadius: 18,
              background: LETTER_COLORS[round.tiles.findIndex((t) => t.id === dragState.id) % LETTER_COLORS.length],
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