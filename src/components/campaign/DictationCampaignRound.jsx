/**
 * DictationCampaignRound — single-word dictation round for campaign levels.
 * Audio auto-plays at mount. Wrong submit: deducts 1 life + correct tiles pulsate.
 * Pulsating stops when user taps or drags any tile.
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Volume2 } from "lucide-react";
import { getLetterSoundUrl, getLetterGain } from "../../lib/letterSounds";
import { playAudio, playAudioSequence } from "../../lib/useAudio";
import { useTryAgainSound } from "../../lib/useTryAgainSound";
import { useCorrectSound } from "../../lib/useCorrectSound";

const ALL_LETTERS = "abcdefghijklmnoprstw".split("");
const LETTER_COLORS = ["#FFAFC5","#A8D8EA","#FFE57A","#B5EAD7","#FFDAC1","#C4B5FD","#FCA5A5","#6EE7B7","#FCD34D","#93C5FD","#F9A8D4","#86EFAC"];

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
  const used = new Set(letters);
  const pool = ALL_LETTERS.filter((l) => !used.has(l));
  const distractors = shuffle(pool).slice(0, 9);
  const tiles = shuffle([
    ...letters.map((l, i) => ({ id: `correct-${i}`, letter: l, isCorrect: true })),
    ...distractors.map((l, i) => ({ id: `distractor-${i}`, letter: l, isCorrect: false })),
  ]);
  return { card, letters, tiles };
}

function splitRows(tiles) {
  return [tiles.slice(0, 4), tiles.slice(4, 8), tiles.slice(8, 12)];
}

export default function DictationCampaignRound({ card, onComplete, onMistake, lang = "en", suppressAutoPlay = false }) {
  const [round] = useState(() => buildRound(card));
  const [placed, setPlaced] = useState([null, null, null]);
  const [placedColors, setPlacedColors] = useState({});
  const [submitError, setSubmitError] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [bouncingIndex, setBouncingIndex] = useState(null);
  const [dragState, setDragState] = useState(null);
  const [audioLocked, setAudioLocked] = useState(true);
  const [pulsatingIds, setPulsatingIds] = useState(new Set());

  const dropZoneRefs = useRef([]);
  const sequenceRef = useRef(null);
  const isDragging = useRef(false);
  const [isActiveDrag, setIsActiveDrag] = useState(false);
  const { play: playTryAgain } = useTryAgainSound();

  useEffect(() => {
    if (suppressAutoPlay) {
      setAudioLocked(false);
      return;
    }
    setAudioLocked(true);
    const t = setTimeout(() => {
      if (card.audio) {
        playAudio(card.audio);
        const u = setTimeout(() => setAudioLocked(false), 1400);
        return () => clearTimeout(u);
      } else {
        setAudioLocked(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const playCompletion = useCallback(() => {
    setCompleting(true);
    const steps = round.letters.map((letter, i) => {
      const url = getLetterSoundUrl(letter);
      return url ? { url, gain: getLetterGain(letter), onStart: () => setBouncingIndex(i) } : null;
    }).filter(Boolean);
    if (card.audio) steps.push({ url: card.audio, onStart: () => setBouncingIndex(null) });
    const cancel = playAudioSequence(steps, () => {
      sequenceRef.current = null;
      setBouncingIndex(null);
      onComplete();
    });
    sequenceRef.current = cancel;
  }, [round, card, onComplete]);

  const handleTouchStart = useCallback((e, tile) => {
    if (placed.includes(tile.id) || completing || audioLocked) return;
    isDragging.current = false;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setDragState({ id: tile.id, letter: tile.letter, x: cx, y: cy, startX: touch.clientX, startY: touch.clientY, originX: cx, originY: cy });
  }, [placed, completing, audioLocked]);

  const handleTouchMove = useCallback((e) => {
    if (!dragState) return;
    e.preventDefault();
    const touch = e.touches[0];
    const dx = touch.clientX - dragState.startX;
    const dy = touch.clientY - dragState.startY;
    if (!isDragging.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      isDragging.current = true;
      setIsActiveDrag(true);
    }
    setDragState((prev) => prev ? { ...prev, x: prev.originX + dx, y: prev.originY + dy } : null);
  }, [dragState]);

  const handleTouchEnd = useCallback((e) => {
    if (!dragState) return;
    if (!isDragging.current) {
      const url = getLetterSoundUrl(dragState.letter);
      if (url) playAudio(url, getLetterGain(dragState.letter));
      setDragState(null);
      setIsActiveDrag(false);
      return;
    }
    const touch = e.changedTouches[0];
    let hitBox = -1;
    dropZoneRefs.current.forEach((ref, i) => {
      if (!ref) return;
      const rect = ref.getBoundingClientRect();
      if (touch.clientX >= rect.left && touch.clientX <= rect.right && touch.clientY >= rect.top && touch.clientY <= rect.bottom) hitBox = i;
    });
    if (hitBox !== -1) {
      const tileIdx = round.tiles.findIndex((t) => t.id === dragState.id);
      const tileColor = LETTER_COLORS[tileIdx % LETTER_COLORS.length];
      const newPlaced = [...placed];
      newPlaced[hitBox] = dragState.id;
      setPlacedColors((prev) => ({ ...prev, [hitBox]: tileColor }));
      setPlaced(newPlaced);
      // Remove only this tile from pulsating when placed
      setPulsatingIds((prev) => { const next = new Set(prev); next.delete(dragState.id); return next; });
    }
    setDragState(null);
    isDragging.current = false;
    setIsActiveDrag(false);
  }, [dragState, placed, round]);

  const handleSubmit = useCallback(() => {
    if (completing || audioLocked || placed.some((p) => p === null)) return;
    const allCorrect = placed.every((tileId, boxIndex) => {
      const tile = round.tiles.find((t) => t.id === tileId);
      return tile && tile.letter === round.letters[boxIndex];
    });
    if (allCorrect) {
      setPulsatingIds(new Set());
      playCompletion();
    } else {
      playTryAgain();
      onMistake && onMistake();
      setSubmitError(true);
      const correctIds = new Set(round.tiles.filter((t) => t.isCorrect).map((t) => t.id));
      setPulsatingIds(correctIds);
      setTimeout(() => {
        setSubmitError(false);
        setPlaced([null, null, null]);
        setPlacedColors({});
      }, 600);
    }
  }, [completing, audioLocked, placed, round, playCompletion, onMistake, playTryAgain]);

  const handleReset = useCallback(() => {
    if (completing) return;
    setPlaced([null, null, null]);
    setPlacedColors({});
  }, [completing]);

  const allFilled = placed.every((p) => p !== null);
  const tileRows = splitRows(round.tiles);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", fontFamily: "Fredoka, sans-serif", touchAction: "none", userSelect: "none", position: "relative" }}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {(audioLocked || completing) && <div style={{ position: "absolute", inset: 0, zIndex: 200, touchAction: "none", pointerEvents: "all" }} />}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", padding: "8px 16px 12px", minHeight: 0 }}>

        {/* Speaker */}
        <motion.div whileTap={{ scale: 0.88 }} onClick={() => { if (!audioLocked && card.audio) playAudio(card.audio); }}
          style={{ width: "min(72px,18vw)", height: "min(72px,18vw)", borderRadius: "50%", background: "white", border: "3px solid #A8D8EA", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(74,144,196,0.22)", cursor: "pointer", touchAction: "manipulation", flexShrink: 0 }}>
          <Volume2 size={32} color="#4A90C4" strokeWidth={2} />
        </motion.div>

        {/* Drop boxes */}
        <div style={{ display: "flex", gap: "min(14px,3vw)", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {[0, 1, 2].map((i) => {
            const placedTile = placed[i] ? round.tiles.find((t) => t.id === placed[i]) : null;
            const tileColor = placedColors[i];
            return (
              <motion.div key={i} ref={(el) => (dropZoneRefs.current[i] = el)}
                animate={submitError ? { x: [0,-10,10,-8,8,-4,4,0] } : bouncingIndex === i ? { y: [0,-16,0,-8,0,-4,0] } : {}}
                transition={{ duration: 0.5 }}
                style={{ width: "min(88px,23vw)", height: "min(88px,23vw)", borderRadius: 22, background: tileColor || "rgba(255,255,255,0.75)", border: `3px solid ${tileColor ? "rgba(255,255,255,0.85)" : "rgba(74,144,196,0.35)"}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: tileColor ? "0 4px 18px rgba(0,0,0,0.13)" : "inset 0 2px 8px rgba(0,0,0,0.07)", flexShrink: 0 }}>
                {placedTile
                  ? <motion.span key={placedTile.id} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ fontSize: "min(48px,12vw)", fontWeight: 700, color: "#1E3A5F" }}>{placedTile.letter}</motion.span>
                  : <span style={{ fontSize: "min(32px,8vw)", color: "rgba(74,144,196,0.25)", fontWeight: 700 }}>?</span>}
              </motion.div>
            );
          })}
        </div>

        {/* Tile rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: "min(10px,2vw)", alignItems: "center", flexShrink: 0 }}>
          {tileRows.map((row, rowIdx) => (
            <div key={rowIdx} style={{ display: "flex", gap: "min(10px,2.5vw)", justifyContent: "center" }}>
              {row.map((tile, colIdx) => {
                const globalIdx = rowIdx * 4 + colIdx;
                const isPlaced = placed.includes(tile.id);
                const isDraggingThis = dragState?.id === tile.id;
                const isPulsating = pulsatingIds.has(tile.id) && !isPlaced;
                const bgColor = LETTER_COLORS[globalIdx % LETTER_COLORS.length];
                if (isPlaced) return <div key={tile.id} style={{ width: "min(72px,18vw)", height: "min(72px,18vw)", visibility: "hidden", flexShrink: 0 }} />;
                return (
                  <motion.div key={tile.id}
                    animate={isDraggingThis ? { scale: 1.08 } : isPulsating ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                    transition={isPulsating ? { repeat: Infinity, duration: 0.7, ease: "easeInOut" } : {}}
                    onTouchStart={(e) => { e.stopPropagation(); handleTouchStart(e, tile); }}
                    style={{ width: "min(72px,18vw)", height: "min(72px,18vw)", borderRadius: 18, background: bgColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "min(38px,9.5vw)", fontWeight: 700, color: "#1E3A5F", boxShadow: "0 4px 12px rgba(0,0,0,0.10)", border: "3px solid rgba(255,255,255,0.75)", cursor: "grab", touchAction: "none", userSelect: "none", pointerEvents: isDraggingThis ? "none" : "auto", opacity: isDraggingThis ? 0.3 : 1, flexShrink: 0 }}>
                    {tile.letter}
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Submit + Reset */}
        <div style={{ display: "flex", gap: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <button onPointerDown={(e) => { e.stopPropagation(); handleReset(); }}
            style={{ width: 54, height: 54, borderRadius: 27, background: "white", boxShadow: "0 4px 16px rgba(0,0,0,0.15)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, touchAction: "manipulation", opacity: placed.some(Boolean) && !completing ? 1 : 0.35 }}>
            <RotateCcw size={24} color="#A8D0E6" strokeWidth={2.2} />
          </button>
          {!completing && (
            <motion.button whileTap={allFilled ? { scale: 0.93 } : {}} onPointerDown={(e) => { e.preventDefault(); handleSubmit(); }} disabled={!allFilled}
              style={{ padding: "14px 44px", borderRadius: 999, background: allFilled ? "#FF6B6B" : "rgba(255,107,107,0.28)", color: allFilled ? "white" : "rgba(255,107,107,0.55)", border: "none", fontSize: 20, fontWeight: 700, fontFamily: "Fredoka, sans-serif", cursor: allFilled ? "pointer" : "default", boxShadow: allFilled ? "0 4px 0 #cc4444" : "none", transition: "background 0.25s, color 0.25s", touchAction: "manipulation", flexShrink: 0 }}>
              {lang === "zh" ? "提交 ✓" : "Submit ✓"}
            </motion.button>
          )}
        </div>
      </div>

      {/* Drag ghost */}
      <AnimatePresence>
        {dragState && isActiveDrag && (
          <div style={{ position: "fixed", left: dragState.x, top: dragState.y, transform: "translate(-50%,-50%)", zIndex: 9999, pointerEvents: "none", width: "min(80px,20vw)", height: "min(80px,20vw)", borderRadius: 18, background: LETTER_COLORS[round.tiles.findIndex((t) => t.id === dragState.id) % LETTER_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: "min(44px,11vw)", fontWeight: 700, color: "#1E3A5F", boxShadow: "0 12px 36px rgba(0,0,0,0.25)", border: "3px solid rgba(255,255,255,0.8)" }}>
            {dragState.letter}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}