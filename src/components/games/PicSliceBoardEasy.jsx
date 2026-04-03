import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { buildRoundPieces } from "../../lib/picSliceGameData";
import { playAudio, playAudioSequence } from "../../lib/useAudio";
import { getLetterGain } from "../../lib/letterSounds";

function buildState(wordArr) {
  const pieces = buildRoundPieces(wordArr);
  return {
    pieces,
    trayIds: pieces.map((p) => p.id),
    placed: {},
    wordComplete: false,
    rejectedSlot: null,
  };
}

export default function PicSliceBoardEasy({ wordPair, onRoundComplete }) {
  // wordPair is an array of 1 word object
  const wd = wordPair[0];
  const [state, setState] = useState(() => buildState(wordPair));
  const [dragState, setDragState] = useState(null);
  const [playingSequence, setPlayingSequence] = useState(false);
  const isDragging = useRef(false);
  const dropZoneRefs = useRef({});

  useEffect(() => {
    setState(buildState(wordPair));
    setDragState(null);
    setPlayingSequence(false);
    isDragging.current = false;
  }, [wordPair]);

  // After word is complete: play phoneme sequence then advance
  useEffect(() => {
    if (!state.wordComplete || playingSequence) return;
    setPlayingSequence(true);

    // Build ordered phoneme audio urls (slot 0, 1, 2 = first, middle, last sound)
    const orderedPhonemes = [0, 1, 2].map((slot) => {
      const piece = state.pieces.find((p) => p.wordIndex === 0 && p.targetSlot === slot);
      return piece ? { url: piece.letterAudio, gain: getLetterGain(piece.phoneme) } : null;
    }).filter(Boolean);

    const steps = [
      ...orderedPhonemes.map((p) => ({ url: p.url, gain: p.gain })),
      { url: wd.audio, gain: 1 },
    ];

    // Play phoneme sequence then advance
    playAudioSequence(steps, () => {
      setTimeout(onRoundComplete, 300);
    });
  }, [state.wordComplete]);

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
        const wordComplete = [0, 1, 2].every((slotIdx) => {
          const k = `0-${slotIdx}`;
          return k === hitKey ? true : !!newPlaced[k];
        });
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

  const trayPieces = state.pieces.filter((p) => state.trayIds.includes(p.id));

  return (
    <div
      style={{
        display: "flex", flexDirection: "column",
        flex: 1, height: "100%",
        fontFamily: "Fredoka, sans-serif",
        touchAction: "none", userSelect: "none", WebkitUserSelect: "none",
        overflow: "hidden",
        padding: "0 16px",
        gap: 0,
      }}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >

      {/* ── WORD LABEL ─────────────────────────────────────────────────────── */}
      <motion.button
        whileTap={{ scale: 0.93 }}
        onClick={() => wd.audio && playAudio(wd.audio)}
        style={{
          width: "100%",
          padding: "12px 8px",
          background: "#FFD6E0",
          border: "3px solid #FFB3C6",
          borderRadius: 20,
          fontSize: "clamp(32px, 10vw, 52px)",
          fontWeight: 700, color: "#1E3A5F",
          letterSpacing: 3, textAlign: "center",
          cursor: "pointer",
          fontFamily: "Fredoka, sans-serif",
          boxShadow: "0 4px 18px rgba(30,58,95,0.11)",
          flexShrink: 0,
          margin: "4px 0 10px",
        }}
      >
        {wd.word.toLowerCase()}
      </motion.button>

      {/* ── DROP BOX ───────────────────────────────────────────────────────── */}
      <div style={{ flexShrink: 0, marginBottom: 10 }}>
        <AnimatePresence mode="wait">
          {state.wordComplete ? (
            <motion.div
              key="done"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              style={{
                width: "100%", aspectRatio: "1 / 1",
                borderRadius: 24, overflow: "hidden",
                border: "3px solid #4ECDC4",
                boxShadow: "0 6px 28px rgba(78,205,196,0.40)",
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
                borderRadius: 24, overflow: "hidden",
                border: "3px solid #FFB3C6",
                background: "rgba(255,255,255,0.80)",
                boxShadow: "0 4px 16px rgba(30,58,95,0.08)",
              }}
            >
              {[0, 1, 2].map((si) => {
                const slotKey = `0-${si}`;
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
                      borderRight: si < 2 ? "2.5px dashed #FFB3C6" : "none",
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
                        fontSize: "clamp(13px, 3.5vw, 20px)",
                        color: "#FFB3C6", fontWeight: 700,
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

      {/* ── HINT TEXT ──────────────────────────────────────────────────────── */}
      <p style={{
        textAlign: "center", fontSize: 12, color: "#7BACC8",
        fontWeight: 600, margin: "0 0 8px", flexShrink: 0,
      }}>
        👆 drag a piece · tap to hear its sound
      </p>

      {/* ── SLICE TRAY: 3 slices in a row ──────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 12, flexShrink: 0,
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
                borderRadius: 18, overflow: "hidden",
                boxShadow: "0 4px 16px rgba(30,58,95,0.15)",
                border: "3px solid rgba(255,255,255,0.9)",
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

      {/* ── Drag ghost ─────────────────────────────────────────────────────── */}
      {dragState && isDragging.current && (
        <div style={{
          position: "fixed",
          left: dragState.x, top: dragState.y,
          transform: "translate(-50%, -50%)",
          zIndex: 9999, pointerEvents: "none",
          width: 88, height: 88,
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