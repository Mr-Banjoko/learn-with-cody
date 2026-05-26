import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { buildRoundPieces } from "../../lib/picSliceGameData";
import { tx } from "../../lib/i18n";
import { playAudio, playAudioSequence } from "../../lib/useAudio";
import { getLetterSoundUrl, getLetterGain } from "../../lib/letterSounds";
import { useTryAgainSound } from "../../lib/useTryAgainSound";

function LetterBlocks({ word, activeLetterIndex, color }) {
  const letters = word.toLowerCase().split("");
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", alignItems: "center" }}>
      {letters.map((letter, i) => {
        const isActive = activeLetterIndex === i;
        return (
          <motion.div
            key={i}
            animate={isActive ? { y: [0, -14, 0, -7, 0] } : { y: 0 }}
            transition={isActive ? { duration: 0.45 } : {}}
            style={{
              width: "min(75px, 19vw)",
              height: "min(75px, 19vw)",
              borderRadius: 14,
              background: color,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "min(43px, 11vw)",
              fontWeight: 700, color: "#1E3A5F",
              boxShadow: isActive
                ? "0 6px 18px rgba(30,58,95,0.22)"
                : "0 3px 10px rgba(30,58,95,0.12)",
              border: "2.5px solid rgba(255,255,255,0.8)",
              transition: "box-shadow 0.15s",
            }}
          >
            {letter}
          </motion.div>
        );
      })}
    </div>
  );
}

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
 * onLetterStart(i) is called when each letter sound begins.
 * onWordStart is called when the full word sound begins.
 */
function buildCompletionSequence(wordData, onLetterStart, onWordStart) {
  const letters = wordData.word.toLowerCase().split("");
  const steps = letters.map((letter, i) => {
    const url = getLetterSoundUrl(letter);
    return url ? { url, gain: getLetterGain(letter), onStart: () => onLetterStart && onLetterStart(i) } : null;
  }).filter(Boolean);
  if (wordData.audio) {
    steps.push({ url: wordData.audio, gain: 1, onStart: () => onWordStart && onWordStart() });
  }
  return steps;
}

/**
 * traySwapCount — number of pieces to swap between the two word trays (0 = no swap).
 * When > 0, some pieces from word-0 appear in word-1's tray row and vice versa,
 * making it harder to identify which slice belongs where.
 * The swap is purely visual / positional in the tray — correctness logic is unchanged.
 */
export default function PicSliceBoard({ wordPair, onRoundComplete, lang = "en", onMistake, traySwapCount = 0 }) {
  const { play: playTryAgain } = useTryAgainSound();
  const [state, setState] = useState(() => buildState(wordPair));
  const [dragState, setDragState] = useState(null);

  // ── Completion / playback state ──────────────────────────────────────────
  // `playbackLocked` — when true, ALL user interaction is blocked
  const [playbackLocked, setPlaybackLocked] = useState(false);
  // Which word index is currently playing its sequence (for visual highlight)
  const [playingWordIdx, setPlayingWordIdx] = useState(null);
  // Active letter index per word during bounce animation: { 0: letterIdx, 1: letterIdx }
  const [activeLetterIndex, setActiveLetterIndex] = useState({});
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
    setActiveLetterIndex({});

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

    const steps = buildCompletionSequence(
      wordPair[wi],
      (letterIdx) => setActiveLetterIndex((prev) => ({ ...prev, [wi]: letterIdx })),
      () => setActiveLetterIndex((prev) => ({ ...prev, [wi]: null })),
    );

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
      setActiveLetterIndex((prev) => ({ ...prev, [wi]: null }));
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

  // ── Tray swap: build per-word display lists with some pieces interchanged ──
  // We only swap pieces that are still in the tray (not yet placed).
  // The swap is stable per render (based on piece IDs) so it doesn't flicker.
  const trayDisplayPieces = (() => {
    if (traySwapCount <= 0 || wordPair.length < 2) {
      return {
        0: state.pieces.filter((p) => p.wordIndex === 0),
        1: state.pieces.filter((p) => p.wordIndex === 1),
      };
    }
    const w0 = state.pieces.filter((p) => p.wordIndex === 0);
    const w1 = state.pieces.filter((p) => p.wordIndex === 1);
    const count = Math.min(traySwapCount, w0.length, w1.length);
    // Use fixed indices (0, 1) so the swap is deterministic and stable
    const swapIndices = [0, 1].slice(0, count);
    const d0 = [...w0];
    const d1 = [...w1];
    swapIndices.forEach((idx) => {
      if (d0[idx] && d1[idx]) {
        const tmp = d0[idx];
        d0[idx] = d1[idx];
        d1[idx] = tmp;
      }
    });
    return { 0: d0, 1: d1 };
  })();

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

      {/* ── Two word sections stacked vertically ──────────────────────────── */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-evenly",
        padding: "8px 14px 8px",
        gap: 10,
        minHeight: 0,
        overflow: "hidden",
      }}>
        {wordPair.map((wd, wi) => {
          const done = state.wordComplete[wi];
          const color = wi === 0 ? "#FFB3C6" : "#A8D8F0";
          const shadow = wi === 0 ? "rgba(255,130,170,0.30)" : "rgba(60,150,240,0.25)";
          // Pieces for this word's tray (may include swapped pieces from the other word)
          const wordPieces = trayDisplayPieces[wi];

          return (
            <div key={wi} style={{ flex: 1, display: "flex", flexDirection: "row", gap: 10, minHeight: 0 }}>

              {/* Left column: label + drop box */}
              <div style={{ flex: "0 0 65%", display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>

                {/* Letter blocks / word label */}
                <div
                  style={{ display: "flex", justifyContent: "flex-start", paddingLeft: 2, cursor: playbackLocked ? "default" : "pointer" }}
                  onPointerDown={(e) => { e.preventDefault(); handleWordLabelTap(wd); }}
                >
                  <LetterBlocks word={wd.word} activeLetterIndex={activeLetterIndex[wi] ?? null} color={color} />
                </div>

                {/* Drop box */}
                <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
                  <AnimatePresence mode="wait">
                    {done ? (
                      <motion.div
                        key="done"
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 18 }}
                        style={{
                          width: "100%", aspectRatio: "1 / 1",
                          borderRadius: 18, overflow: "hidden",
                          border: `3px solid ${color}`,
                          boxShadow: `0 6px 28px ${shadow}`,
                          display: "block",
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
                          display: "flex", flexDirection: "row",
                          borderRadius: 18, overflow: "hidden",
                          border: `3px solid ${color}`,
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
                                borderRight: si < 2 ? `2px dashed ${color}` : "none",
                                animation: isRejected ? "psShake 0.4s ease" : "none",
                                position: "relative", overflow: "hidden",
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
                                  <img src={placedPiece.sliceSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                                </motion.div>
                              ) : (
                                <span style={{ fontSize: "clamp(10px, 2.5vw, 14px)", color, fontWeight: 700 }}>
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
                        position: "absolute", bottom: 4, right: 4,
                        width: 30, height: 30, borderRadius: 15,
                        background: "white", boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
                        border: "none", cursor: playbackLocked ? "default" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        zIndex: 10, touchAction: "manipulation",
                        opacity: (playbackLocked || ![0,1,2].some((si) => state.placed[`${wi}-${si}`])) ? 0.25 : 0.85,
                        pointerEvents: playbackLocked ? "none" : "auto",
                      }}
                    >
                      <RotateCcw size={15} color="#A8D0E6" strokeWidth={2.2} />
                    </button>
                  )}
                </div>

              </div>{/* end left column */}

              {/* Tray pieces — right column, 90% of section height */}
              <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "flex-start" }}>
              <div style={{
                display: "flex", flexDirection: "column",
                gap: 6, width: "100%", height: "90%",
              }}>
                  {wordPieces.map((piece) => {
                    const isPlaced = !state.trayIds.includes(piece.id);
                    const isDraggingThis = dragState?.piece.id === piece.id;
                    if (isPlaced) {
                      return <div key={piece.id} style={{ flex: 1, minHeight: 0, visibility: "hidden" }} />;
                    }
                    return (
                      <motion.div
                        key={piece.id}
                        animate={isDraggingThis ? { opacity: 0.25, scale: 1.04 } : { opacity: playbackLocked ? 0.4 : 1, scale: 1 }}
                        onTouchStart={(e) => !playbackLocked && handleTouchStart(e, piece)}
                        style={{
                          flex: 1, minHeight: 0,
                          borderRadius: 12, overflow: "hidden",
                          boxShadow: "0 4px 14px rgba(30,58,95,0.14)",
                          border: "none",
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
              </div>{/* end tray outer wrapper */}

            </div>
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
          width: 90, height: 90,
          borderRadius: 14, overflow: "hidden",
          boxShadow: "0 16px 40px rgba(30,58,95,0.30)",
          border: "none",
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