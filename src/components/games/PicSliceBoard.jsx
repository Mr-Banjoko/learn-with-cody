import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { buildRoundPieces } from "../../lib/picSliceGameData";
import { playAudio } from "../../lib/useAudio";
import { getLetterGain } from "../../lib/letterSounds";

// ─── Single pre-sliced image ──────────────────────────────────────────────────
function SliceImg({ src, size, borderRadius = 12 }) {
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      style={{
        width: size, height: size, borderRadius,
        objectFit: "cover", display: "block",
        pointerEvents: "none", userSelect: "none",
        WebkitUserSelect: "none",
      }}
    />
  );
}

// ─── Build initial state ──────────────────────────────────────────────────────
function buildState(wordPair) {
  const pieces = buildRoundPieces(wordPair);
  return {
    pieces,
    trayIds: pieces.map((p) => p.id),
    placed: {},           // "wi-si" → pieceId
    wordComplete: [false, false],
    rejectedSlot: null,
  };
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PicSliceBoard({ wordPair, onRoundComplete }) {
  const [state, setState] = useState(() => buildState(wordPair));
  const [dragState, setDragState] = useState(null);
  const isDragging = useRef(false);
  const dropZoneRefs = useRef({}); // key: "wi-si"
  const containerRef = useRef(null);

  // Reset on new round
  useEffect(() => {
    setState(buildState(wordPair));
    setDragState(null);
    isDragging.current = false;
  }, [wordPair]);

  // Fire completion
  useEffect(() => {
    if (state.wordComplete[0] && state.wordComplete[1]) {
      const t = setTimeout(onRoundComplete, 600);
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
    setDragState({
      piece,
      x: cx, y: cy,
      startX: touch.clientX, startY: touch.clientY,
      originX: cx, originY: cy,
    });
  }, [state.trayIds]);

  const handleTouchMove = useCallback((e) => {
    if (!dragState) return;
    e.preventDefault();
    const touch = e.touches[0];
    const dx = touch.clientX - dragState.startX;
    const dy = touch.clientY - dragState.startY;
    if (!isDragging.current && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
      isDragging.current = true;
    }
    setDragState((prev) =>
      prev ? { ...prev, x: prev.originX + dx, y: prev.originY + dy } : null
    );
  }, [dragState]);

  const handleTouchEnd = useCallback((e) => {
    if (!dragState) return;

    // Tap without drag → play letter sound
    if (!isDragging.current) {
      const { piece } = dragState;
      playAudio(piece.letterAudio, getLetterGain(piece.phoneme));
      setDragState(null);
      return;
    }

    const touch = e.changedTouches[0];
    let hitKey = null;

    Object.entries(dropZoneRefs.current).forEach(([key, ref]) => {
      if (!ref) return;
      const rect = ref.getBoundingClientRect();
      if (
        touch.clientX >= rect.left && touch.clientX <= rect.right &&
        touch.clientY >= rect.top && touch.clientY <= rect.bottom
      ) {
        hitKey = key;
      }
    });

    const { piece } = dragState;

    if (hitKey && !state.placed[hitKey]) {
      const [wi, si] = hitKey.split("-").map(Number);
      const requiredPhoneme = wordPair[wi].phonemes[si].letter;

      if (piece.phoneme === requiredPhoneme) {
        // ✅ Correct
        const newPlaced = { ...state.placed, [hitKey]: piece.id };
        const newTrayIds = state.trayIds.filter((id) => id !== piece.id);
        const wordComplete = [0, 1].map((wordIdx) =>
          [0, 1, 2].every((slotIdx) => {
            const k = `${wordIdx}-${slotIdx}`;
            return k === hitKey ? true : !!newPlaced[k];
          })
        );
        setState((prev) => ({ ...prev, placed: newPlaced, trayIds: newTrayIds, wordComplete }));
      } else {
        // ❌ Wrong — shake
        setState((prev) => ({ ...prev, rejectedSlot: hitKey }));
        setTimeout(() => setState((prev) => ({ ...prev, rejectedSlot: null })), 500);
      }
    }

    setDragState(null);
    isDragging.current = false;
  }, [dragState, state, wordPair]);

  // ── Tap on placed slice → play letter sound ─────────────────────────────────
  const handlePlacedTap = useCallback((slotKey) => {
    const pid = state.placed[slotKey];
    if (!pid) return;
    const piece = state.pieces.find((p) => p.id === pid);
    if (piece) playAudio(piece.letterAudio, getLetterGain(piece.phoneme));
  }, [state]);

  // ── Sizing (responsive) ─────────────────────────────────────────────────────
  // Use CSS clamp so it adapts iPhone → iPad without overflow
  const SLOT_SIZE = "clamp(52px, 13vw, 90px)";
  const TRAY_SIZE = "clamp(88px, 27vw, 130px)";

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex", flexDirection: "column",
        height: "100%", flex: 1,
        fontFamily: "Fredoka, sans-serif",
        touchAction: "none", userSelect: "none", WebkitUserSelect: "none",
        overflow: "hidden",
        gap: 0,
      }}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >

      {/* ── ROW 1: Word labels ─────────────────────────────────────────────── */}
      <div style={{
        display: "flex", gap: 12,
        padding: "12px 16px 4px",
        flexShrink: 0,
      }}>
        {wordPair.map((wd, wi) => (
          <motion.button
            key={wi}
            whileTap={{ scale: 0.93 }}
            onClick={() => wd.audio && playAudio(wd.audio)}
            style={{
              flex: 1, padding: "10px 8px",
              background: wi === 0 ? "#FFD6E0" : "#D6F0FF",
              border: `3px solid ${wi === 0 ? "#FFB3C6" : "#A8D8F0"}`,
              borderRadius: 18,
              fontSize: "clamp(28px, 8vw, 42px)",
              fontWeight: 700, color: "#1E3A5F",
              letterSpacing: 2,
              textAlign: "center",
              cursor: "pointer",
              fontFamily: "Fredoka, sans-serif",
              boxShadow: "0 4px 16px rgba(30,58,95,0.10)",
            }}
          >
            {wd.word.toLowerCase()}
          </motion.button>
        ))}
      </div>

      {/* ── ROW 2: Drop frames ─────────────────────────────────────────────── */}
      <div style={{
        display: "flex", gap: 12,
        padding: "8px 16px",
        flexShrink: 0,
      }}>
        {wordPair.map((wd, wi) => {
          const done = state.wordComplete[wi];
          return (
            <div key={wi} style={{ flex: 1 }}>
              <AnimatePresence mode="wait">
                {done ? (
                  /* Completed: show 3 slices side by side */
                  <motion.div
                    key="done"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 280, damping: 18 }}
                    style={{
                      display: "flex",
                      borderRadius: 20,
                      overflow: "hidden",
                      border: "3px solid #4ECDC4",
                      boxShadow: "0 6px 24px rgba(78,205,196,0.35)",
                      aspectRatio: "3 / 1",
                    }}
                  >
                    {wd.slices
                      ? wd.slices.map((src, si) => (
                          <img key={si} src={src} alt="" style={{ flex: 1, minWidth: 0, objectFit: "cover", display: "block" }} />
                        ))
                      : <img src={wd.image} alt={wd.word} style={{ width: "100%", objectFit: "cover" }} />
                    }
                  </motion.div>
                ) : (
                  /* 3 droppable slots */
                  <motion.div
                    key="slots"
                    style={{
                      display: "flex",
                      borderRadius: 20,
                      overflow: "hidden",
                      border: `3px solid ${wi === 0 ? "#FFB3C6" : "#A8D8F0"}`,
                      background: "rgba(255,255,255,0.75)",
                      boxShadow: "0 4px 16px rgba(30,58,95,0.08)",
                      aspectRatio: "3 / 1",
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
                            borderRight: si < 2 ? `2px dashed ${wi === 0 ? "#FFB3C6" : "#A8D8F0"}` : "none",
                            animation: isRejected ? "psShake 0.4s ease" : "none",
                            position: "relative",
                            cursor: placedPiece ? "pointer" : "default",
                            overflow: "hidden",
                          }}
                        >
                          {placedPiece ? (
                            <motion.div
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ type: "spring", stiffness: 380, damping: 18 }}
                              style={{ width: "100%", height: "100%" }}
                            >
                              <img
                                src={placedPiece.sliceSrc}
                                alt=""
                                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                              />
                            </motion.div>
                          ) : (
                            <span style={{
                              fontSize: "clamp(11px, 2.8vw, 16px)",
                              color: wi === 0 ? "#FFB3C6" : "#A8D8F0",
                              fontWeight: 700,
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

      {/* ── ROW 3: Slice tray (2 rows × 3) ────────────────────────────────── */}
      <div style={{
        flex: 1,
        padding: "8px 16px 12px",
        display: "flex", flexDirection: "column", justifyContent: "center",
        gap: 10,
        minHeight: 0,
      }}>
        <p style={{
          textAlign: "center", fontSize: 13, color: "#7BACC8",
          fontWeight: 600, margin: "0 0 4px",
        }}>
          👆 drag a piece · tap to hear its sound
        </p>

        {/* Grid: 3 columns × 2 rows */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
        }}>
          {/* Reserve 6 spots — placed pieces become invisible spacers */}
          {state.pieces.map((piece) => {
            const isPlaced = !state.trayIds.includes(piece.id);
            const isDraggingThis = dragState?.piece.id === piece.id;

            if (isPlaced) {
              return (
                <div key={piece.id} style={{ aspectRatio: "1", visibility: "hidden" }} />
              );
            }

            return (
              <motion.div
                key={piece.id}
                animate={isDraggingThis ? { opacity: 0.3, scale: 1.05 } : { opacity: 1, scale: 1 }}
                onTouchStart={(e) => handleTouchStart(e, piece)}
                style={{
                  aspectRatio: "1",
                  borderRadius: 16,
                  overflow: "hidden",
                  boxShadow: "0 4px 14px rgba(30,58,95,0.14)",
                  border: "3px solid rgba(255,255,255,0.8)",
                  cursor: "grab",
                  touchAction: "none",
                  flexShrink: 0,
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
          width: 96, height: 96,
          borderRadius: 16, overflow: "hidden",
          boxShadow: "0 16px 40px rgba(30,58,95,0.30)",
          border: "3px solid #4ECDC4",
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