import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { buildRoundPieces } from "../../lib/picSliceGameData";
import { tx } from "../../lib/i18n";
import { playAudio } from "../../lib/useAudio";
import { getLetterGain } from "../../lib/letterSounds";

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

export default function PicSliceBoard({ wordPair, onRoundComplete, lang = "en" }) {
  const [state, setState] = useState(() => buildState(wordPair));
  const [dragState, setDragState] = useState(null);
  const isDragging = useRef(false);
  const dropZoneRefs = useRef({});
  const containerRef = useRef(null);

  useEffect(() => {
    setState(buildState(wordPair));
    setDragState(null);
    isDragging.current = false;
  }, [wordPair]);

  useEffect(() => {
    if (state.wordComplete[0] && state.wordComplete[1]) {
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
      // Strict: must belong to THIS word AND correct sound-position
      if (piece.wordIndex === wi && piece.targetSlot === si) {
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
        // Wrong — shake
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

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex", flexDirection: "column",
        height: "100%", flex: 1,
        fontFamily: "Fredoka, sans-serif",
        touchAction: "none", userSelect: "none", WebkitUserSelect: "none",
        overflow: "hidden",
      }}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >

      {/* ── ROW 1: Word labels ─────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 12, padding: "10px 16px 4px", flexShrink: 0 }}>
        {wordPair.map((wd, wi) => (
          <motion.button
            key={wi}
            whileTap={{ scale: 0.93 }}
            onPointerDown={(e) => { e.preventDefault(); wd.audio && playAudio(wd.audio); }}
            style={{
              flex: 1, padding: "10px 8px",
              background: wi === 0 ? "#FFD6E0" : "#D6F0FF",
              border: `3px solid ${wi === 0 ? "#FFB3C6" : "#A8D8F0"}`,
              borderRadius: 18,
              fontSize: "clamp(26px, 7.5vw, 40px)",
              fontWeight: 700, color: "#1E3A5F",
              letterSpacing: 2, textAlign: "center",
              cursor: "pointer",
              fontFamily: "Fredoka, sans-serif",
              boxShadow: "0 4px 16px rgba(30,58,95,0.10)",
            }}
          >
            {wd.word.toLowerCase()}
          </motion.button>
        ))}
      </div>

      {/* ── ROW 2: Drop frames (true squares) ─────────────────────────────── */}
      <div style={{ display: "flex", gap: 12, padding: "6px 16px 0", flexShrink: 0 }}>
        {wordPair.map((wd, wi) => {
          const done = state.wordComplete[wi];
          return (
            <div key={wi} style={{ flex: 1 }}>
              <AnimatePresence mode="wait">
                {done ? (
                  // Completed: reveal full unchopped image
                  <motion.div
                    key="done"
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    style={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      borderRadius: 20,
                      overflow: "hidden",
                      border: "3px solid #4ECDC4",
                      boxShadow: "0 6px 28px rgba(78,205,196,0.4)",
                    }}
                  >
                    <img
                      src={wd.fullImage || wd.image || (wd.slices && wd.slices[0])}
                      alt={wd.word}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  </motion.div>
                ) : (
                  // 3 droppable slots — true square
                  <motion.div
                    key="slots"
                    style={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      display: "flex",
                      borderRadius: 20,
                      overflow: "hidden",
                      border: `3px solid ${wi === 0 ? "#FFB3C6" : "#A8D8F0"}`,
                      background: "rgba(255,255,255,0.75)",
                      boxShadow: "0 4px 16px rgba(30,58,95,0.08)",
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
                          onPointerDown={() => placedPiece && handlePlacedTap(slotKey)}
                          style={{
                            flex: 1,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            borderRight: si < 2 ? `2px dashed ${wi === 0 ? "#FFB3C6" : "#A8D8F0"}` : "none",
                            animation: isRejected ? "psShake 0.4s ease" : "none",
                            position: "relative",
                            overflow: "hidden",
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
                              fontSize: "clamp(11px, 3vw, 17px)",
                              color: wi === 0 ? "#FFB3C6" : "#A8D8F0",
                              fontWeight: 700,
                            }}>
                              {si === 0 ? tx("1st", "ordinal_1", lang) : si === 1 ? tx("2nd", "ordinal_2", lang) : tx("3rd", "ordinal_3", lang)}
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
        padding: "16px 16px 10px",
        display: "flex", flexDirection: "column", justifyContent: "flex-start",
        gap: 10,
        minHeight: 0,
      }}>
        <p style={{
          textAlign: "center", fontSize: 12, color: "#7BACC8",
          fontWeight: 600, margin: "0 0 2px", flexShrink: 0,
        }}>
          {tx("👆 drag a piece · tap to hear its sound", "drag_piece_hint", lang)}
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
          flexShrink: 0,
        }}>
          {state.pieces.map((piece) => {
            const isPlaced = !state.trayIds.includes(piece.id);
            const isDraggingThis = dragState?.piece.id === piece.id;

            if (isPlaced) {
              return <div key={piece.id} style={{ aspectRatio: "1", visibility: "hidden" }} />;
            }

            return (
              <motion.div
                key={piece.id}
                animate={isDraggingThis ? { opacity: 0.25, scale: 1.04 } : { opacity: 1, scale: 1 }}
                onTouchStart={(e) => handleTouchStart(e, piece)}
                style={{
                  aspectRatio: "1",
                  borderRadius: 16,
                  overflow: "hidden",
                  boxShadow: "0 4px 14px rgba(30,58,95,0.14)",
                  border: "3px solid rgba(255,255,255,0.85)",
                  cursor: "grab",
                  touchAction: "none",
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
          width: 90, height: 90,
          borderRadius: 14, overflow: "hidden",
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