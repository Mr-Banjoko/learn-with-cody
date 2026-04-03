import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { buildRoundPieces } from "../../lib/picSliceGameData";
import { playAudio } from "../../lib/useAudio";
import { getLetterGain } from "../../lib/letterSounds";

// Colors for the 4 word columns (pairs: [label bg, label border, box border, slot hint])
const WORD_COLORS = [
  { bg: "#FFD6E0", border: "#FFB3C6", hint: "#FFB3C6" },
  { bg: "#D6F0FF", border: "#A8D8F0", hint: "#A8D8F0" },
  { bg: "#D6FFE4", border: "#A8E8C0", hint: "#A8E8C0" },
  { bg: "#FFF5D6", border: "#FFE088", hint: "#FFE088" },
];

function buildState(wordArr) {
  const pieces = buildRoundPieces(wordArr);
  return {
    pieces,
    trayIds: pieces.map((p) => p.id),
    placed: {},                     // "wi-si" → pieceId
    wordComplete: wordArr.map(() => false),
    rejectedSlot: null,
  };
}

export default function PicSliceBoardDifficult({ wordPair, onRoundComplete }) {
  const [state, setState] = useState(() => buildState(wordPair));
  const [dragState, setDragState] = useState(null);
  const isDragging = useRef(false);
  const dropZoneRefs = useRef({});

  useEffect(() => {
    setState(buildState(wordPair));
    setDragState(null);
    isDragging.current = false;
  }, [wordPair]);

  useEffect(() => {
    if (state.wordComplete.length > 0 && state.wordComplete.every(Boolean)) {
      const t = setTimeout(onRoundComplete, 700);
      return () => clearTimeout(t);
    }
  }, [state.wordComplete, onRoundComplete]);

  // ── Touch handlers ──────────────────────────────────────────────────────────
  const handleTouchStart = useCallback((e, piece) => {
    if (!state.trayIds.includes(piece.id)) return;
    e.stopPropagation();
    isDragging.current = false;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setDragState({ piece, x: cx, y: cy, startX: touch.clientX, startY: touch.clientY, originX: cx, originY: cy });
  }, [state.trayIds]);

  const handleTouchMove = useCallback((e) => {
    if (!dragState) return;
    e.preventDefault();
    const touch = e.touches[0];
    const dx = touch.clientX - dragState.startX;
    const dy = touch.clientY - dragState.startY;
    if (!isDragging.current && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) isDragging.current = true;
    setDragState((prev) => prev ? { ...prev, x: prev.originX + dx, y: prev.originY + dy } : null);
  }, [dragState]);

  const handleTouchEnd = useCallback((e) => {
    if (!dragState) return;

    if (!isDragging.current) {
      playAudio(dragState.piece.letterAudio, getLetterGain(dragState.piece.phoneme));
      setDragState(null);
      return;
    }

    const touch = e.changedTouches[0];
    let hitKey = null;
    Object.entries(dropZoneRefs.current).forEach(([key, ref]) => {
      if (!ref) return;
      const rect = ref.getBoundingClientRect();
      if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
          touch.clientY >= rect.top  && touch.clientY <= rect.bottom) {
        hitKey = key;
      }
    });

    const { piece } = dragState;

    if (hitKey && !state.placed[hitKey]) {
      const [wi, si] = hitKey.split("-").map(Number);
      if (piece.wordIndex === wi && piece.targetSlot === si) {
        const newPlaced = { ...state.placed, [hitKey]: piece.id };
        const newTrayIds = state.trayIds.filter((id) => id !== piece.id);
        const wordComplete = wordPair.map((_, wordIdx) =>
          [0, 1, 2].every((slotIdx) => {
            const k = `${wordIdx}-${slotIdx}`;
            return k === hitKey ? true : !!newPlaced[k];
          })
        );
        setState((prev) => ({ ...prev, placed: newPlaced, trayIds: newTrayIds, wordComplete }));
      } else {
        setState((prev) => ({ ...prev, rejectedSlot: hitKey }));
        setTimeout(() => setState((prev) => ({ ...prev, rejectedSlot: null })), 500);
      }
    }

    setDragState(null);
    isDragging.current = false;
  }, [dragState, state, wordPair]);

  const handlePlacedTap = useCallback((slotKey) => {
    const pid = state.placed[slotKey];
    if (!pid) return;
    const piece = state.pieces.find((p) => p.id === pid);
    if (piece) playAudio(piece.letterAudio, getLetterGain(piece.phoneme));
  }, [state]);

  // ── Compute remaining slices ───────────────────────────────────────────────
  const trayPieces = state.pieces.filter((p) => state.trayIds.includes(p.id));
  // Pad to always show 12 slots (for stable grid)
  const totalSlots = 12;
  const paddedTray = [...trayPieces];
  while (paddedTray.length < totalSlots) paddedTray.push(null);

  return (
    <div
      style={{
        display: "flex", flexDirection: "column",
        flex: 1, height: "100%",
        fontFamily: "Fredoka, sans-serif",
        touchAction: "none", userSelect: "none", WebkitUserSelect: "none",
        overflow: "hidden",
        gap: 0,
      }}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >

      {/* ── WORD LABELS: 2×2 grid ──────────────────────────────────────────── */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: 6, padding: "8px 10px 4px", flexShrink: 0,
      }}>
        {wordPair.map((wd, wi) => {
          const c = WORD_COLORS[wi];
          return (
            <motion.button
              key={wi}
              whileTap={{ scale: 0.93 }}
              onClick={() => wd.audio && playAudio(wd.audio)}
              style={{
                padding: "8px 6px",
                background: c.bg,
                border: `2.5px solid ${c.border}`,
                borderRadius: 14,
                fontSize: "clamp(20px, 5.5vw, 30px)",
                fontWeight: 700, color: "#1E3A5F",
                letterSpacing: 1, textAlign: "center",
                cursor: "pointer",
                fontFamily: "Fredoka, sans-serif",
                boxShadow: "0 3px 10px rgba(30,58,95,0.10)",
              }}
            >
              {wd.word.toLowerCase()}
            </motion.button>
          );
        })}
      </div>

      {/* ── DROP BOXES: 2×2 grid ──────────────────────────────────────────── */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: 6, padding: "0 10px", flexShrink: 0,
      }}>
        {wordPair.map((wd, wi) => {
          const done = state.wordComplete[wi];
          const c = WORD_COLORS[wi];
          return (
            <div key={wi}>
              <AnimatePresence mode="wait">
                {done ? (
                  <motion.div
                    key="done"
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    style={{
                      width: "100%", aspectRatio: "1 / 1",
                      borderRadius: 14, overflow: "hidden",
                      border: "3px solid #4ECDC4",
                      boxShadow: "0 4px 18px rgba(78,205,196,0.35)",
                    }}
                  >
                    <img
                      src={wd.fullImage || wd.image || (wd.slices && wd.slices[0])}
                      alt={wd.word}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="slots"
                    style={{
                      width: "100%", aspectRatio: "1 / 1",
                      display: "flex",
                      borderRadius: 14, overflow: "hidden",
                      border: `2.5px solid ${c.border}`,
                      background: "rgba(255,255,255,0.75)",
                      boxShadow: "0 3px 10px rgba(30,58,95,0.07)",
                    }}
                  >
                    {[0, 1, 2].map((si) => {
                      const slotKey = `${wi}-${si}`;
                      const placedId = state.placed[slotKey];
                      const placedPiece = placedId ? state.pieces.find((p) => p.id === placedId) : null;
                      const isRejected = state.rejectedSlot === slotKey;

                      return (
                        <div
                          key={si}
                          ref={(el) => (dropZoneRefs.current[slotKey] = el)}
                          onClick={() => placedPiece && handlePlacedTap(slotKey)}
                          style={{
                            flex: 1,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            borderRight: si < 2 ? `1.5px dashed ${c.hint}` : "none",
                            animation: isRejected ? "psShake 0.4s ease" : "none",
                            position: "relative", overflow: "hidden",
                            cursor: placedPiece ? "pointer" : "default",
                          }}
                        >
                          {placedPiece ? (
                            <motion.div
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ type: "spring", stiffness: 380, damping: 18 }}
                              style={{ position: "absolute", inset: 0 }}
                            >
                              <img
                                src={placedPiece.sliceSrc}
                                alt=""
                                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                              />
                            </motion.div>
                          ) : (
                            <span style={{
                              fontSize: "clamp(9px, 2.4vw, 13px)",
                              color: c.hint, fontWeight: 700,
                            }}>
                              {si === 0 ? "1st" : si === 1 ? "2nd" : "3rd"}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* ── SLICE TRAY: 3 rows × 4 columns ────────────────────────────────── */}
      <div style={{
        flex: 1, padding: "8px 10px 8px",
        display: "flex", flexDirection: "column",
        justifyContent: "flex-start", gap: 6, minHeight: 0,
      }}>
        <p style={{
          textAlign: "center", fontSize: 11, color: "#7BACC8",
          fontWeight: 600, margin: "0 0 2px", flexShrink: 0,
        }}>
          👆 drag a piece · tap to hear its sound
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 7, flexShrink: 0,
        }}>
          {paddedTray.map((piece, idx) => {
            if (!piece) {
              return <div key={`empty-${idx}`} style={{ aspectRatio: "1", visibility: "hidden" }} />;
            }
            const isDraggingThis = dragState?.piece.id === piece.id;

            return (
              <motion.div
                key={piece.id}
                animate={isDraggingThis ? { opacity: 0.25, scale: 1.04 } : { opacity: 1, scale: 1 }}
                onTouchStart={(e) => handleTouchStart(e, piece)}
                style={{
                  aspectRatio: "1",
                  borderRadius: 12, overflow: "hidden",
                  boxShadow: "0 3px 10px rgba(30,58,95,0.13)",
                  border: "2.5px solid rgba(255,255,255,0.85)",
                  cursor: "grab", touchAction: "none",
                  background: "white",
                }}
              >
                <img
                  src={piece.sliceSrc}
                  alt=""
                  draggable={false}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none" }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Drag ghost ─────────────────────────────────────────────────────── */}
      {dragState && isDragging.current && (
        <div style={{
          position: "fixed",
          left: dragState.x, top: dragState.y,
          transform: "translate(-50%, -50%)",
          zIndex: 9999, pointerEvents: "none",
          width: 72, height: 72,
          borderRadius: 12, overflow: "hidden",
          boxShadow: "0 12px 30px rgba(30,58,95,0.28)",
          border: "2.5px solid #4ECDC4",
        }}>
          <img
            src={dragState.piece.sliceSrc}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
      )}

      <style>{`
        @keyframes psShake {
          0%   { transform: translateX(0); }
          20%  { transform: translateX(-7px); background: rgba(255,100,100,0.18); }
          40%  { transform: translateX(7px); }
          60%  { transform: translateX(-5px); }
          80%  { transform: translateX(5px); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}