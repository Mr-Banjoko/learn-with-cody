import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { buildRoundPieces } from "../../lib/picSliceGameData";
import { playAudio, playAudioSequence } from "../../lib/useAudio";
import { getLetterGain } from "../../lib/letterSounds";
import { useTryAgainSound } from "../../lib/useTryAgainSound";

function LetterBlocks({ word, activeLetterIndex, color }) {
  const letters = word.toLowerCase().split("");
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center" }}>
      {letters.map((letter, i) => {
        const isActive = activeLetterIndex === i;
        return (
          <motion.div
            key={i}
            animate={isActive ? { y: [0, -20, 0, -10, 0] } : { y: 0 }}
            transition={isActive ? { duration: 0.45 } : {}}
            style={{
              width: "min(104px, 26vw)",
              height: "min(104px, 26vw)",
              borderRadius: 18,
              background: color,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "min(60px, 15vw)",
              fontWeight: 700, color: "#1E3A5F",
              boxShadow: isActive ? "0 8px 24px rgba(30,58,95,0.28)" : "0 4px 14px rgba(30,58,95,0.14)",
              border: "3px solid rgba(255,255,255,0.85)",
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

// Round color palette — one theme chosen randomly per round
const ROUND_PALETTES = [
  { bg: "#FFD6E0", border: "#FFB3C6", shadow: "rgba(255,130,170,0.30)" },  // pink
  { bg: "#FFF3CC", border: "#FFD966", shadow: "rgba(255,200,50,0.28)"  },  // yellow
  { bg: "#D6F5E3", border: "#7ADBA2", shadow: "rgba(50,190,110,0.25)"  },  // green
  { bg: "#D6ECFF", border: "#7BBEF5", shadow: "rgba(60,150,240,0.25)"  },  // blue
  { bg: "#EDE0FF", border: "#C49CF5", shadow: "rgba(150,80,240,0.22)"  },  // purple
  { bg: "#FFE5D0", border: "#FFB07A", shadow: "rgba(255,140,60,0.25)"  },  // orange-red
];

function pickPalette() {
  return ROUND_PALETTES[Math.floor(Math.random() * ROUND_PALETTES.length)];
}

function buildState(wordArr, orderedAudio = false) {
  const pieces = buildRoundPieces(wordArr, orderedAudio);
  return {
    pieces,
    trayIds: pieces.map((p) => p.id),
    placed: {},
    wordComplete: false,
    rejectedSlot: null,
  };
}

// Simple child-friendly padlock SVG icon
function PadlockIcon({ size = 28 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      style={{ pointerEvents: "none" }}
    >
      {/* shackle */}
      <path
        d="M11 16V12a7 7 0 0 1 14 0v4"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* body */}
      <rect x="7" y="16" width="22" height="14" rx="4" fill="white" fillOpacity="0.92" />
      {/* keyhole circle */}
      <circle cx="18" cy="23" r="3" fill="#64748B" />
      {/* keyhole stem */}
      <rect x="16.5" y="23" width="3" height="3.5" rx="1" fill="#64748B" />
    </svg>
  );
}

// mistakeGuide: optional array of slot indices in "hint order" e.g. [0, 1, 2]
// When provided, after a mistake the component pulsates the tray piece for the
// next un-filled slot (and the word label). After that slot is correctly filled,
// it advances to the next slot in the guide sequence automatically.
export default function PicSliceBoardEasy({ wordPair, onRoundComplete, lang = "en", onMistake, orderedAudio = false, suppressAutoPlay = false, mistakeGuide = null }) {
  const wd = wordPair[0];

  const palette = useMemo(() => pickPalette(), [wordPair]);

  const [state, setState] = useState(() => buildState(wordPair, orderedAudio));
  const [dragState, setDragState] = useState(null);
  const [playingSequence, setPlayingSequence] = useState(false);
  const [activeLetterIndex, setActiveLetterIndex] = useState(null);
  // IDs of tray pieces that should currently be pulsating (hint glow)
  const [pulsatingIds, setPulsatingIds] = useState(new Set());
  // The slot index whose drop-box label should pulsate (null = none)
  const [wordPulsating, setWordPulsating] = useState(null);
  // Which slot index we are currently guiding toward (index into mistakeGuide array)
  const guideSlotRef = useRef(0);
  const pulseCancelRef = useRef(null);

  // ── LISTEN-FIRST LOCK STATE ──────────────────────────────────────────────
  // Set of piece IDs that have been tapped (listened to). All 3 must be in
  // this set before any dragging is permitted.
  const [listenedIds, setListenedIds] = useState(new Set());
  const allListened = listenedIds.size >= 3;

  const { play: playTryAgain } = useTryAgainSound();
  const isDragging = useRef(false);
  const dropZoneRefs = useRef({});
  const autoPlayRef = useRef(null);
  const cancelSequenceRef = useRef(null);

  // ── MISTAKE GUIDE HELPER ──────────────────────────────────────────────────
  // Finds the tray piece that corresponds to targetSlot == slotIdx for word 0
  const findGuidepiece = useCallback((pieces, trayIds, slotIdx) => {
    return pieces.find((p) => p.wordIndex === 0 && p.targetSlot === slotIdx && trayIds.includes(p.id));
  }, []);

  const triggerPulse = useCallback((pieces, trayIds) => {
    if (!mistakeGuide) return;

    const slotIdx = mistakeGuide[guideSlotRef.current];
    if (slotIdx === undefined) return;

    const gp = findGuidepiece(pieces, trayIds, slotIdx);
    if (!gp) return;

    // Pulsate tray piece + the matching drop slot — no timeout, stays until slot is filled
    setPulsatingIds(new Set([gp.id]));
    setWordPulsating(slotIdx); // store the slot index so the drop box slot label knows
  }, [mistakeGuide, findGuidepiece]);

  // ── RESET on new word ────────────────────────────────────────────────────
  useEffect(() => {
    setState(buildState(wordPair, orderedAudio));
    setDragState(null);
    setPlayingSequence(false);
    setActiveLetterIndex(null);
    setListenedIds(new Set());   // ← reset locks every round
    setPulsatingIds(new Set());
    setWordPulsating(null);
    guideSlotRef.current = 0;
    if (pulseCancelRef.current) { clearTimeout(pulseCancelRef.current); pulseCancelRef.current = null; }
    isDragging.current = false;
    // Cancel any in-flight completion sequence from the previous round
    if (cancelSequenceRef.current) { cancelSequenceRef.current(); cancelSequenceRef.current = null; }

    // Auto-play the word after a short settle delay (skip if suppressAutoPlay is true)
    clearTimeout(autoPlayRef.current);
    if (!suppressAutoPlay) {
      autoPlayRef.current = setTimeout(() => {
        if (wd.audio) playAudio(wd.audio);
      }, 380);
    }

    return () => clearTimeout(autoPlayRef.current);
  }, [wordPair]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── After word complete: play phoneme sequence then advance ───────────────
  useEffect(() => {
    if (!state.wordComplete || playingSequence) return;
    setPlayingSequence(true);

    const orderedPhonemes = [0, 1, 2].map((slot) => {
      const piece = state.pieces.find((p) => p.wordIndex === 0 && p.targetSlot === slot);
      return piece ? { url: piece.letterAudio, gain: getLetterGain(piece.phoneme), slot } : null;
    }).filter(Boolean);

    const steps = [
      ...orderedPhonemes.map((p, i) => ({ url: p.url, gain: p.gain, onStart: () => setActiveLetterIndex(i) })),
      { url: wd.audio, gain: 1, onStart: () => setActiveLetterIndex(null) },
    ];

    const advanceTimer = { id: null };
    cancelSequenceRef.current = playAudioSequence(steps, () => {
      advanceTimer.id = setTimeout(onRoundComplete, 10);
    });

    return () => {
      if (cancelSequenceRef.current) cancelSequenceRef.current();
      clearTimeout(advanceTimer.id);
    };
  }, [state.wordComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── TOUCH HANDLERS ───────────────────────────────────────────────────────

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
      // Only start dragging if ALL slices have been listened to
      if (allListened) {
        isDragging.current = true;
      }
      // If not all listened, silently absorb the move (no drag ghost)
    }
    if (allListened) {
      setDragState((prev) => prev ? { ...prev, x: prev.originX + dx, y: prev.originY + dy } : null);
    }
  }, [dragState, allListened]);

  const handleTouchEnd = useCallback((e) => {
    if (!dragState) return;

    if (!isDragging.current) {
      // ── TAP: play letter sound and mark as listened ──────────────────────
      const { piece } = dragState;
      playAudio(piece.letterAudio, getLetterGain(piece.phoneme));
      setListenedIds((prev) => {
        const next = new Set(prev);
        next.add(piece.id);
        return next;
      });
      setDragState(null);
      return;
    }

    // ── DRAG DROP (only reachable if allListened was true) ───────────────
    const touch = e.changedTouches[0];
    let hitKey = null;
    Object.entries(dropZoneRefs.current).forEach(([key, ref]) => {
      if (!ref) return;
      const rect = ref.getBoundingClientRect();
      if (
        touch.clientX >= rect.left && touch.clientX <= rect.right &&
        touch.clientY >= rect.top  && touch.clientY <= rect.bottom
      ) {
        hitKey = key;
      }
    });

    const { piece } = dragState;

    if (hitKey && !state.placed[hitKey]) {
      const [wi, si] = hitKey.split("-").map(Number);
      // Semantic correctness: piece must belong to this word AND its phoneme must
      // match the required phoneme at slot si — not a strict tile-instance check.
      // This makes duplicate-phoneme slices (e.g. both 'd' slices in "dad")
      // interchangeable across any valid slot that requires that phoneme.
      const wordData = wordPair[wi];
      const requiredPhoneme = wordData?.phonemes?.[si]?.letter;
      const isCorrect = piece.wordIndex === wi && piece.phoneme === requiredPhoneme;
      if (isCorrect) {
        playAudio("https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/letter_sound/feedback/match-end.mp3");
        const newPlaced = { ...state.placed, [hitKey]: piece.id };
        const newTrayIds = state.trayIds.filter((id) => id !== piece.id);
        const wordComplete = [0, 1, 2].every((slotIdx) => {
          const k = `0-${slotIdx}`;
          return k === hitKey ? true : !!newPlaced[k];
        });
        setState((prev) => ({ ...prev, placed: newPlaced, trayIds: newTrayIds, wordComplete }));

        // If mistakeGuide active and this slot matches current guide slot, advance guide
        if (mistakeGuide && pulsatingIds.size > 0) {
          const currentGuideSlot = mistakeGuide[guideSlotRef.current];
          if (currentGuideSlot === si) {
            setPulsatingIds(new Set());
            setWordPulsating(null);
            guideSlotRef.current += 1;
            // Auto-pulse next guide slot after a short settle delay
            const nextSlot = mistakeGuide[guideSlotRef.current];
            if (nextSlot !== undefined) {
              const snapPieces = state.pieces;
              const snapTrayIds = newTrayIds;
              setTimeout(() => {
                const gp = snapPieces.find((p) => p.wordIndex === 0 && p.targetSlot === nextSlot && snapTrayIds.includes(p.id));
                if (gp) {
                  setPulsatingIds(new Set([gp.id]));
                  setWordPulsating(nextSlot);
                }
              }, 400);
            }
          }
        }
      } else {
        playTryAgain();
        setState((prev) => ({ ...prev, rejectedSlot: hitKey }));
        onMistake && onMistake();
        setTimeout(() => setState((prev) => ({ ...prev, rejectedSlot: null })), 500);
        // Trigger hint pulse on mistake
        triggerPulse(state.pieces, state.trayIds);
      }
    }

    setDragState(null);
    isDragging.current = false;
  }, [dragState, state, onMistake]);

  const handlePlacedTap = useCallback((slotKey) => {
    const pid = state.placed[slotKey];
    if (!pid) return;
    const piece = state.pieces.find((p) => p.id === pid);
    if (piece) playAudio(piece.letterAudio, getLetterGain(piece.phoneme));
  }, [state]);

  const handleReset = useCallback(() => {
    setState((prev) => {
      const returnedIds = [];
      const newPlaced = { ...prev.placed };
      [0, 1, 2].forEach((si) => {
        const k = `0-${si}`;
        if (newPlaced[k]) { returnedIds.push(newPlaced[k]); delete newPlaced[k]; }
      });
      return {
        ...prev,
        placed: newPlaced,
        trayIds: [...prev.trayIds, ...returnedIds],
        wordComplete: false,
      };
    });
  }, []);

  const { bg, border, shadow } = palette;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-evenly",
        flex: 1,
        height: "100%",
        fontFamily: "Fredoka, sans-serif",
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        overflow: "hidden",
        padding: "6px 20px 10px",
        position: "relative",
      }}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {playingSequence && <div style={{ position: "absolute", inset: 0, zIndex: 100, touchAction: "none", pointerEvents: "all" }} />}

      {/* ── WORD LABEL ─────────────────────────────────────────────────────── */}
      {playingSequence ? (
        <div style={{ width: "100%", maxWidth: 300, padding: "10px 16px", flexShrink: 0, display: "flex", justifyContent: "center" }}>
          <LetterBlocks word={wd.word} activeLetterIndex={activeLetterIndex} color={bg} />
        </div>
      ) : (
        <motion.button
          whileTap={{ scale: 0.93 }}
          onPointerDown={(e) => { e.preventDefault(); wd.audio && playAudio(wd.audio); }}
          style={{
            width: "100%",
            maxWidth: 300,
            padding: "10px 16px",
            background: bg,
            border: `2.5px solid ${border}`,
            borderRadius: 18,
            fontSize: "clamp(26px, 7.5vw, 38px)",
            fontWeight: 700,
            color: "#1E3A5F",
            letterSpacing: 4,
            textAlign: "center",
            cursor: "pointer",
            fontFamily: "Fredoka, sans-serif",
            boxShadow: `0 3px 14px ${shadow}`,
            flexShrink: 0,
          }}
        >
          {wd.word.toLowerCase()}
        </motion.button>
      )}

      {/* ── DROP BOX ───────────────────────────────────────────────────────── */}
      <div style={{ flexShrink: 0, width: "100%", maxWidth: 280, position: "relative" }}>
        <AnimatePresence mode="wait">
          {state.wordComplete ? (
            <motion.div
              key="done"
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              style={{
                width: "100%",
                aspectRatio: "1 / 1",
                borderRadius: 22,
                overflow: "hidden",
                border: `2.5px solid ${border}`,
                boxShadow: `0 4px 18px ${shadow}`,
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
                borderRadius: 22,
                overflow: "hidden",
                border: `2.5px solid ${border}`,
                background: "rgba(255,255,255,0.82)",
                boxShadow: `0 4px 18px ${shadow}`,
              }}
            >
              {[0, 1, 2].map((si) => {
                const slotKey = `0-${si}`;
                const placedId = state.placed[slotKey];
                const placedPiece = placedId ? state.pieces.find((p) => p.id === placedId) : null;
                const isRejected = state.rejectedSlot === slotKey;
                const isSlotPulsating = wordPulsating === si;

                return (
                  <div
                    key={si}
                    ref={(el) => (dropZoneRefs.current[slotKey] = el)}
                    onPointerDown={() => placedPiece && handlePlacedTap(slotKey)}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRight: si < 2 ? `2px dashed ${border}` : "none",
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
                          src={placedPiece.sliceSrc || placedPiece.image || wd.fullImage || wd.image}
                          alt=""
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                      </motion.div>
                    ) : (
                      <>
                        {isSlotPulsating && (
                          <motion.div
                            animate={{ opacity: [0, 0.45, 0] }}
                            transition={{ duration: 1.8, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
                            style={{
                              position: "absolute",
                              inset: 0,
                              background: "linear-gradient(135deg, #FF6B6B, #FFD93D, #4ECDC4, #9B59B6)",
                              pointerEvents: "none",
                            }}
                          />
                        )}
                        <span style={{ fontSize: 13, fontWeight: 600, color: border, opacity: 0.7, userSelect: "none", position: "relative" }}>
                          {si === 0 ? "1st" : si === 1 ? "2nd" : "3rd"}
                        </span>
                      </>
                    )}
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reset button — bottom-right of the drop box */}
        {!state.wordComplete && (
          <button
            onPointerDown={(e) => { e.stopPropagation(); handleReset(); }}
            style={{
              position: "absolute", bottom: 6, right: 6,
              width: 36, height: 36, borderRadius: 18,
              background: "white",
              boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 10, touchAction: "manipulation",
              opacity: [0,1,2].some((si) => state.placed[`0-${si}`]) ? 1 : 0.35,
            }}
            aria-label="Reset pieces"
          >
            <RotateCcw size={18} color="#A8D0E6" strokeWidth={2.2} />
          </button>
        )}
      </div>

      {/* ── SLICE TRAY ─────────────────────────────────────────────────────── */}


      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 10,
        width: "100%",
        maxWidth: 300,
        flexShrink: 0,
      }}>
        {state.pieces.map((piece) => {
          const isPlaced = !state.trayIds.includes(piece.id);
          const isDraggingThis = dragState?.piece.id === piece.id;
          const isListened = listenedIds.has(piece.id);
          const locked = !allListened; // dragging locked until all 3 tapped

          if (isPlaced) {
            return <div key={piece.id} style={{ aspectRatio: "2 / 3", visibility: "hidden" }} />;
          }

          const isPulsating = pulsatingIds.has(piece.id);
          return (
            <motion.div
              key={piece.id}
              animate={
                isDraggingThis
                  ? { opacity: 0.22, scale: 1.04 }
                  : isPulsating
                  ? { boxShadow: [
                      "0 4px 14px rgba(30,58,95,0.14), 0 0 0 0px rgba(255,107,107,0)",
                      "0 4px 14px rgba(30,58,95,0.14), 0 0 0 7px rgba(255,107,107,0.55)",
                      "0 4px 14px rgba(30,58,95,0.14), 0 0 0 7px rgba(255,217,61,0.55)",
                      "0 4px 14px rgba(30,58,95,0.14), 0 0 0 7px rgba(78,205,196,0.55)",
                      "0 4px 14px rgba(30,58,95,0.14), 0 0 0 7px rgba(155,89,182,0.55)",
                      "0 4px 14px rgba(30,58,95,0.14), 0 0 0 0px rgba(155,89,182,0)",
                    ] }
                  : { opacity: 1, scale: 1 }
              }
              transition={isPulsating ? { duration: 2.2, repeat: Infinity, repeatType: "loop", ease: "easeInOut" } : {}}
              onTouchStart={(e) => handleTouchStart(e, piece)}
              style={{
                aspectRatio: "2 / 3",
                borderRadius: 16,
                overflow: "hidden",
                border: `2.5px solid ${border}`,
                boxShadow: `0 4px 14px ${shadow}`,
                background: bg,
                cursor: locked ? "pointer" : "grab",
                touchAction: "none",
                position: "relative",
              }}
            >
              <img
                src={piece.sliceSrc || piece.image || wd.fullImage || wd.image}
                alt=""
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  pointerEvents: "none",
                  // Dim locked slices slightly to signal they need attention
                  filter: locked && !isListened ? "brightness(0.72)" : "none",
                  transition: "filter 0.25s",
                }}
              />

              {/* Padlock overlay — visible until this slice has been tapped */}
              <AnimatePresence>
                {!isListened && (
                  <motion.div
                    key="lock"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ type: "spring", stiffness: 340, damping: 20 }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      pointerEvents: "none",
                    }}
                  >
                    {/* semi-transparent dark pill behind the lock */}
                    <div style={{
                      background: "rgba(30,58,95,0.55)",
                      borderRadius: 50,
                      width: 44,
                      height: 44,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <PadlockIcon size={26} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* ── Drag ghost — only shown when actually dragging (requires allListened) ── */}
      {dragState && isDragging.current && allListened && (
        <div style={{
          position: "fixed",
          left: dragState.x,
          top: dragState.y,
          transform: "translate(-50%, -50%)",
          zIndex: 9999,
          pointerEvents: "none",
          width: 60,
          height: 90,
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: "0 14px 36px rgba(30,58,95,0.28)",
          border: "3px solid #4ECDC4",
        }}>
          <img
            src={dragState.piece.sliceSrc || dragState.piece.image || wd.fullImage || wd.image}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
      )}

      <style>{`
        @keyframes psShake {
          0%   { transform: translateX(0); }
          20%  { transform: translateX(-7px); background: rgba(255,100,100,0.15); }
          40%  { transform: translateX(7px); }
          60%  { transform: translateX(-5px); }
          80%  { transform: translateX(5px); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}