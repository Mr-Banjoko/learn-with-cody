import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { buildRoundPieces } from "../../lib/picSliceGameData";
import { tx } from "../../lib/i18n";
import { playAudio, playAudioSequence } from "../../lib/useAudio";
import { getLetterSoundUrl, getLetterGain } from "../../lib/letterSounds";
import { useTryAgainSound } from "../../lib/useTryAgainSound";

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

/**
 * Build the audio sequence steps for a completed word:
 *   letter[0] → letter[1] → letter[2] → full word
 */
function buildCompletionSequence(wordData) {
  const letters = wordData.word.toLowerCase().split("");
  const steps = letters.map((letter) => {
    const url = getLetterSoundUrl(letter);
    return url ? { url, gain: getLetterGain(letter) } : null;
  }).filter(Boolean);
  if (wordData.audio) {
    steps.push({ url: wordData.audio, gain: 1 });
  }
  return steps;
}

export default function PicSliceBoard({ wordPair, onRoundComplete, lang = "en", onMistake }) {
  const { play: playTryAgain } = useTryAgainSound();
  const [state, setState] = useState(() => buildState(wordPair));
  const [dragState, setDragState] = useState(null);

  // ── Completion / playback state ──────────────────────────────────────────
  // `playbackLocked` — when true, ALL user interaction is blocked
  const [playbackLocked, setPlaybackLocked] = useState(false);
  // Which word index is currently playing its sequence (for visual highlight)
  const [playingWordIdx, setPlayingWordIdx] = useState(null);
  // Track which word indices have had their completion sequence played
  const completionSequenceDone = useRef([false, false]);
  // Queue of word indices awaiting their completion sequence
  const completionQueue = useRef([]);
  // Is the sequence runner currently active?
  const runningSequence = useRef(false);
  // Cancel fn for any in-progress audio sequence
  const cancelSequence = useRef(null);

  const isDragging = useRef(false);
  const dropZoneRefs = useRef({});
  const containerRef = useRef(null);

  // ── Reset on new word pair ───────────────────────────────────────────────
  useEffect(() => {
    // Cancel any active sequence
    if (cancelSequence.current) {
      cancelSequence.current();
      cancelSequence.current = null;
    }
    setState(buildState(wordPair));
    setDragState(null);
    setPlaybackLocked(false);
    setPlayingWordIdx(null);
    completionSequenceDone.current = [false, false];
    completionQueue.current = [];
    runningSequence.current = false;
    isDragging.current = false;
  }, [wordPair]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cancelSequence.current) {
        cancelSequence.current();
        cancelSequence.current = null;
      }
    };
  }, []);

  // ── Sequence runner ──────────────────────────────────────────────────────
  /**
   * Drains the completionQueue one entry at a time.
   * For each entry:
   *   1. Lock UI
   *   2. Play letter sequence → full word
   *   3. Mark that word's sequence done
   *   4. If more in queue, repeat
   *   5. If queue empty:
   *      - Unlock UI
   *      - If both sequences done, trigger onRoundComplete
   */
  const runNextInQueue = useCallback(() => {
    if (completionQueue.current.length === 0) {
      runningSequence.current = false;
      setPlaybackLocked(false);
      setPlayingWordIdx(null);
      // Check if both words are done → advance round
      if (completionSequenceDone.current[0] && completionSequenceDone.current[1]) {
        setTimeout(onRoundComplete, 300);
      }
      return;
    }

    runningSequence.current = true;
    const wi = completionQueue.current.shift();
    setPlaybackLocked(true);
    setPlayingWordIdx(wi);

    const steps = buildCompletionSequence(wordPair[wi]);

    if (steps.length === 0) {
      // No audio available — mark done and move on
      completionSequenceDone.current[wi] = true;
      runNextInQueue();
      return;
    }

    const cancel = playAudioSequence(steps, () => {
      // Sequence finished cleanly
      cancelSequence.current = null;
      completionSequenceDone.current[wi] = true;
      runNextInQueue();
    });
    cancelSequence.current = cancel;
  }, [wordPair, onRoundComplete]);

  // ── Called when a word box becomes complete ──────────────────────────────
  const onWordCompleted = useCallback((wi) => {
    // Prevent duplicate enqueuing
    if (completionSequenceDone.current[wi]) return;
    if (completionQueue.current.includes(wi)) return;

    completionQueue.current.push(wi);

    // If not already running, start immediately
    if (!runningSequence.current) {
      runNextInQueue();
    }
    // If already running, the queue will drain naturally
  }, [runNextInQueue]);

  // ── Touch handlers ───────────────────────────────────────────────────────
  const handleTouchStart = useCallback((e, piece) => {
    if (playbackLocked) return;                        // 🔒 LOCK
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
  }, [playbackLocked, state.trayIds]);

  const handleTouchMove = useCallback((e) => {
    if (playbackLocked) return;                        // 🔒 LOCK
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
  }, [playbackLocked, dragState]);

  const handleTouchEnd = useCallback((e) => {
    if (playbackLocked) {                              // 🔒 LOCK
      setDragState(null);
      isDragging.current = false;
      return;
    }
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
      const wordData = wordPair[wi];
      const requiredPhoneme = wordData?.phonemes?.[si]?.letter;
      const isCorrect = piece.wordIndex === wi && piece.phoneme === requiredPhoneme;
      if (isCorrect) {
        const newPlaced = { ...state.placed, [hitKey]: piece.id };
        const newTrayIds = state.trayIds.filter((id) => id !== piece.id);
        const wordComplete = [0, 1].map((wordIdx) =>
          [0, 1, 2].every((slotIdx) => {
            const k = `${wordIdx}-${slotIdx}`;
            return k === hitKey ? true : !!newPlaced[k];
          })
        );

        setState((prev) => ({ ...prev, placed: newPlaced, trayIds: newTrayIds, wordComplete }));

        // Check which word(s) just became complete
        wordComplete.forEach((done, idx) => {
          if (done && !state.wordComplete[idx]) {
            onWordCompleted(idx);
          }
        });
      } else {
        playTryAgain();
        setState((prev) => ({ ...prev, rejectedSlot: hitKey }));
        onMistake && onMistake();
        setTimeout(() => setState((prev) => ({ ...prev, rejectedSlot: null })), 500);
      }
    }

    setDragState(null);
    isDragging.current = false;
  }, [playbackLocked, dragState, state, wordPair, onWordCompleted, onMistake, playTryAgain]);

  const handlePlacedTap = useCallback((slotKey) => {
    if (playbackLocked) return;                        // 🔒 LOCK
    const pid = state.placed[slotKey];
    if (!pid) return;
    const piece = state.pieces.find((p) => p.id === pid);
    if (piece) playAudio(piece.letterAudio, getLetterGain(piece.phoneme));
  }, [playbackLocked, state]);

  const handleWordLabelTap = useCallback((wd) => {
    if (playbackLocked) return;                        // 🔒 LOCK
    wd.audio && playAudio(wd.audio);
  }, [playbackLocked]);

  const handleReset = useCallback((wi) => {
    if (playbackLocked) return;                        // 🔒 LOCK
    // Cannot reset a completed word
    if (state.wordComplete[wi]) return;
    setState((prev) => {
      const returnedIds = [];
      const newPlaced = { ...prev.placed };
      [0, 1, 2].forEach((si) => {
        const k = `${wi}-${si}`;
        if (newPlaced[k]) { returnedIds.push(newPlaced[k]); delete newPlaced[k]; }
      });
      const newWordComplete = [...prev.wordComplete];
      newWordComplete[wi] = false;
      return {
        ...prev,
        placed: newPlaced,
        trayIds: [...prev.trayIds, ...returnedIds],
        wordComplete: newWordComplete,
      };
    });
  }, [playbackLocked, state.wordComplete]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      style={{
        display: "flex", flexDirection: "column",
        height: "100%", flex: 1,
        fontFamily: "Fredoka, sans-serif",
        touchAction: "none", userSelect: "none", WebkitUserSelect: "none",
        overflow: "hidden",
        position: "relative",
      }}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >

      {/* ── Full-screen interaction blocker during playback ─────────────────── */}
      {playbackLocked && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 500,
            touchAction: "none",
            pointerEvents: "all",
            // Transparent — purely captures / blocks all touch/click events
            background: "transparent",
          }}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => { e.stopPropagation(); e.preventDefault(); }}
          onTouchEnd={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {/* ── ROW 1: Word labels ─────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 12, padding: "10px 16px 4px", flexShrink: 0 }}>
        {wordPair.map((wd, wi) => {
          const isPlaying = playingWordIdx === wi;
          return (
            <motion.button
              key={wi}
              whileTap={playbackLocked ? {} : { scale: 0.93 }}
              onPointerDown={(e) => { e.preventDefault(); handleWordLabelTap(wd); }}
              animate={isPlaying ? { scale: [1, 1.06, 1.06, 1], boxShadow: ["0 4px 16px rgba(30,58,95,0.10)", "0 0 0 4px rgba(78,205,196,0.55)", "0 0 0 4px rgba(78,205,196,0.55)", "0 4px 16px rgba(30,58,95,0.10)"] } : {}}
              transition={isPlaying ? { duration: 0.5, repeat: Infinity, repeatType: "loop" } : {}}
              style={{
                flex: 1, padding: "10px 8px",
                background: wi === 0 ? "#FFD6E0" : "#D6F0FF",
                border: isPlaying
                  ? "3px solid #4ECDC4"
                  : `3px solid ${wi === 0 ? "#FFB3C6" : "#A8D8F0"}`,
                borderRadius: 18,
                fontSize: "clamp(26px, 7.5vw, 40px)",
                fontWeight: 700, color: "#1E3A5F",
                letterSpacing: 2, textAlign: "center",
                cursor: playbackLocked ? "default" : "pointer",
                fontFamily: "Fredoka, sans-serif",
                boxShadow: "0 4px 16px rgba(30,58,95,0.10)",
                transition: "border 0.2s",
              }}
            >
              {wd.word.toLowerCase()}
            </motion.button>
          );
        })}
      </div>

      {/* ── ROW 2: Drop frames ─────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 12, padding: "6px 16px 0", flexShrink: 0 }}>
        {wordPair.map((wd, wi) => {
          const done = state.wordComplete[wi];
          const isPlaying = playingWordIdx === wi;
          return (
            <div key={wi} style={{ flex: 1, position: "relative" }}>
              <AnimatePresence mode="wait">
                {done ? (
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
                      border: `3px solid ${wi === 0 ? "#FFB3C6" : "#A8D8F0"}`,
                      boxShadow: `0 6px 28px ${wi === 0 ? "rgba(255,130,170,0.30)" : "rgba(60,150,240,0.25)"}`,
                      transition: "box-shadow 0.25s",
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
                      width: "100%",
                      aspectRatio: "1 / 1",
                      display: "flex",
                      borderRadius: 20,
                      overflow: "hidden",
                      border: `3px solid ${wi === 0 ? "#FFB3C6" : "#A8D8F0"}`,
                      background: playbackLocked ? "rgba(240,240,240,0.6)" : "rgba(255,255,255,0.75)",
                      boxShadow: "0 4px 16px rgba(30,58,95,0.08)",
                      opacity: playbackLocked ? 0.55 : 1,
                      transition: "opacity 0.2s, background 0.2s",
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
                          onPointerDown={() => !playbackLocked && placedPiece && handlePlacedTap(slotKey)}
                          style={{
                            flex: 1,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            borderRight: si < 2 ? `2px dashed ${wi === 0 ? "#FFB3C6" : "#A8D8F0"}` : "none",
                            animation: isRejected ? "psShake 0.4s ease" : "none",
                            position: "relative",
                            overflow: "hidden",
                            cursor: (playbackLocked || !placedPiece) ? "default" : "pointer",
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

              {/* Reset button */}
              {!done && (
                <button
                  onPointerDown={(e) => { e.stopPropagation(); handleReset(wi); }}
                  style={{
                    position: "absolute", bottom: 6, right: 6,
                    width: 36, height: 36, borderRadius: 18,
                    background: "white",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
                    border: "none", cursor: playbackLocked ? "default" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 10, touchAction: "manipulation",
                    opacity: (playbackLocked || ![0,1,2].some((si) => state.placed[`${wi}-${si}`])) ? 0.25 : 0.85,
                    pointerEvents: playbackLocked ? "none" : "auto",
                  }}
                  aria-label="Reset pieces"
                >
                  <RotateCcw size={18} color="#A8D0E6" strokeWidth={2.2} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ── ROW 3: Slice tray ──────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        padding: "16px 16px 10px",
        display: "flex", flexDirection: "column", justifyContent: "flex-start",
        gap: 10,
        minHeight: 0,
      }}>
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
                animate={isDraggingThis ? { opacity: 0.25, scale: 1.04 } : { opacity: playbackLocked ? 0.4 : 1, scale: 1 }}
                onTouchStart={(e) => !playbackLocked && handleTouchStart(e, piece)}
                style={{
                  aspectRatio: "1",
                  borderRadius: 16,
                  overflow: "hidden",
                  boxShadow: "0 4px 14px rgba(30,58,95,0.14)",
                  border: "3px solid rgba(255,255,255,0.85)",
                  cursor: playbackLocked ? "default" : "grab",
                  touchAction: "none",
                  background: "white",
                  pointerEvents: playbackLocked ? "none" : "auto",
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