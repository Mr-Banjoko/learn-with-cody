/**
 * MixedCampaignLevel3 — First Mixed Drag V2
 * R1: drag_v2 — rat  (a) tiles: r,a,t,u  distractor vowel: u
 * R2: drag_v2 — bed  (e) tiles: b,e,d,i  distractor vowel: i
 * R3: drag_v2 — pig  (i) tiles: p,i,g,e  distractor vowel: e
 * R4: drag_v2 — dog  (o) tiles: d,o,g,u  distractor vowel: u
 * R5: drag_v2 — cup  (u) tiles: c,u,p,a  distractor vowel: a
 */
import { useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";
import LevelHeader from "../LevelHeader";
import LevelCompleteScreen from "../LevelCompleteScreen";
import { calcStars, saveLevelResult } from "../../../lib/campaignPerformance";
import { useRoundHintAudio, LOCK_OVERLAY_STYLE } from "../../../lib/useRoundHintAudio";
import { useUserPhoto } from "../../../lib/useUserPhoto";
import { getLetterSoundUrl, getLetterGain } from "../../../lib/letterSounds";
import { playAudio, playAudioSequence } from "../../../lib/useAudio";
import { useCorrectSound } from "../../../lib/useCorrectSound";
import { useTryAgainSound } from "../../../lib/useTryAgainSound";
import { shortAWords } from "../../../lib/shortAWords";
import { shortEWords } from "../../../lib/shortEWords";
import { shortIWords } from "../../../lib/shortIWords";
import { shortOWords } from "../../../lib/shortOWords";
import { shortUWords } from "../../../lib/shortUWords";

const LEVEL_NUM = 3;
const VOWEL_KEY = "mixed";
const SCORED_ROUNDS = 5;

const ALL_WORDS = [...shortAWords, ...shortEWords, ...shortIWords, ...shortOWords, ...shortUWords];
const findCard = (w) => ALL_WORDS.find((x) => x.word === w) || { word: w, audio: null, image: null };

// Hardcoded drag_v2 round definitions
const ROUND_SEQUENCE = [
  { type: "drag_v2", targetWord: "rat",  targetVowel: "a", tiles: ["r","a","t","u"], correctOrder: ["r","a","t"], distractorVowel: "u" },
  { type: "drag_v2", targetWord: "bed",  targetVowel: "e", tiles: ["b","e","d","i"], correctOrder: ["b","e","d"], distractorVowel: "i" },
  { type: "drag_v2", targetWord: "pig",  targetVowel: "i", tiles: ["p","i","g","e"], correctOrder: ["p","i","g"], distractorVowel: "e" },
  { type: "drag_v2", targetWord: "dog",  targetVowel: "o", tiles: ["d","o","g","u"], correctOrder: ["d","o","g"], distractorVowel: "u" },
  { type: "drag_v2", targetWord: "cup",  targetVowel: "u", tiles: ["c","u","p","a"], correctOrder: ["c","u","p"], distractorVowel: "a" },
];
const TOTAL_ROUNDS = ROUND_SEQUENCE.length;

const LETTER_COLORS = ["#FFAFC5", "#A8D8EA", "#FFE57A", "#B5EAD7"];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function DragV2Round({ roundDef, card, onComplete, onMistake, userPhotoUrl, onClearPhoto, lang }) {
  const options = useMemo(() => {
    return shuffle(roundDef.tiles.map((letter, i) => ({ id: `tile-${i}-${letter}`, letter })));
  }, []); // eslint-disable-line

  const [placed, setPlaced] = useState([null, null, null]);
  const [placedColors, setPlacedColors] = useState({});
  const [completing, setCompleting] = useState(false);
  const [bouncingIndex, setBouncingIndex] = useState(null);
  const [submitError, setSubmitError] = useState(false);
  const [dragState, setDragState] = useState(null);
  const dropZoneRefs = useRef([]);
  const sequenceRef = useRef(null);
  const isDragging = useRef(false);
  const { play: playCorrect } = useCorrectSound();
  const { play: playTryAgain } = useTryAgainSound();

  const playCompletion = useCallback(() => {
    const letters = roundDef.correctOrder;
    const letterSteps = letters.map((letter, i) => {
      const url = getLetterSoundUrl(letter);
      return url ? { url, gain: getLetterGain(letter), onStart: () => setBouncingIndex(i) } : null;
    }).filter(Boolean);
    const wordStep = card.audio ? [{ url: card.audio, onStart: () => setBouncingIndex(null) }] : [];
    const steps = [...letterSteps, ...wordStep];
    const cancel = playAudioSequence(steps, () => {
      sequenceRef.current = null;
      setBouncingIndex(null);
      onComplete();
    });
    sequenceRef.current = cancel;
  }, [roundDef, card, onComplete]);

  const handleTouchStart = useCallback((e, option) => {
    if (placed.includes(option.id) || completing) return;
    isDragging.current = false;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setDragState({ id: option.id, letter: option.letter, x: cx, y: cy, startX: touch.clientX, startY: touch.clientY, originX: cx, originY: cy });
  }, [placed, completing]);

  const handleTouchMove = useCallback((e) => {
    if (!dragState) return;
    e.preventDefault();
    const touch = e.touches[0];
    const dx = touch.clientX - dragState.startX;
    const dy = touch.clientY - dragState.startY;
    if (!isDragging.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) isDragging.current = true;
    setDragState((prev) => prev ? { ...prev, x: prev.originX + dx, y: prev.originY + dy } : null);
  }, [dragState]);

  const handleTouchEnd = useCallback((e) => {
    if (!dragState) return;
    if (!isDragging.current) {
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
      if (touch.clientX >= rect.left && touch.clientX <= rect.right && touch.clientY >= rect.top && touch.clientY <= rect.bottom) hitBox = i;
    });
    if (hitBox !== -1 && placed[hitBox] === null) {
      const optIdx = options.findIndex((o) => o.id === dragState.id);
      const tileColor = LETTER_COLORS[optIdx % LETTER_COLORS.length];
      const newPlaced = [...placed];
      newPlaced[hitBox] = dragState.id;
      setPlacedColors((prev) => ({ ...prev, [hitBox]: tileColor }));
      setPlaced(newPlaced);
    }
    setDragState(null);
    isDragging.current = false;
  }, [dragState, placed, options]);

  const handleSubmit = useCallback(() => {
    if (completing || placed.some((p) => p === null)) return;
    const allCorrect = placed.every((optionId, boxIndex) => {
      const opt = options.find((o) => o.id === optionId);
      return opt && opt.letter === roundDef.correctOrder[boxIndex];
    });
    if (allCorrect) {
      setCompleting(true);
      playCorrect(() => setTimeout(() => playCompletion(), 10));
    } else {
      playTryAgain();
      setSubmitError(true);
      onMistake && onMistake();
      setTimeout(() => { setSubmitError(false); setPlaced([null, null, null]); setPlacedColors({}); }, 600);
    }
  }, [completing, placed, options, roundDef, playCompletion, playCorrect, playTryAgain, onMistake]);

  const allFilled = placed.every((p) => p !== null);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", fontFamily: "Fredoka, sans-serif", touchAction: "none", userSelect: "none", position: "relative" }}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {completing && <div style={{ position: "absolute", inset: 0, zIndex: 100, touchAction: "none", pointerEvents: "all" }} />}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", padding: "10px 20px 14px", minHeight: 0 }}>
        <motion.div
          key={roundDef.targetWord}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          onPointerDown={(e) => { e.preventDefault(); card.audio && playAudio(card.audio); }}
          style={{ background: "white", borderRadius: 32, padding: 10, boxShadow: "0 10px 40px rgba(30,58,95,0.15)", cursor: card.audio ? "pointer" : "default", touchAction: "manipulation", flexShrink: 0, position: "relative" }}
        >
          <img src={userPhotoUrl || card.image} alt={card.word} style={{ width: "min(300px, 62vw)", height: "min(300px, 62vw)", objectFit: "cover", borderRadius: 24, display: "block" }} />
          {userPhotoUrl && onClearPhoto && (
            <button onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); onClearPhoto(); }} style={{ position: "absolute", top: 18, right: 18, width: 36, height: 36, borderRadius: 18, background: "white", boxShadow: "0 2px 10px rgba(0,0,0,0.2)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, touchAction: "manipulation" }} aria-label="Reset to original image">
              <RotateCcw size={18} color="#A8D0E6" strokeWidth={2.2} />
            </button>
          )}
        </motion.div>

        <div style={{ display: "flex", gap: 14, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 8 }}>
          {roundDef.correctOrder.map((_, i) => {
            const placedId = placed[i];
            const placedOption = placedId ? options.find((o) => o.id === placedId) : null;
            const isBouncing = bouncingIndex === i;
            const tileColor = placedColors[i];
            return (
              <motion.div
                key={i}
                ref={(el) => (dropZoneRefs.current[i] = el)}
                animate={submitError ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : isBouncing ? { y: [0, -16, 0, -8, 0, -4, 0] } : {}}
                transition={{ duration: 0.5 }}
                style={{ width: "min(76px, 20vw)", height: "min(76px, 20vw)", borderRadius: 18, background: tileColor || "rgba(255,255,255,0.7)", border: `3px solid ${tileColor ? (submitError ? "#FF6B6B" : "rgba(255,255,255,0.85)") : "rgba(74,144,196,0.4)"}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: tileColor ? "0 4px 16px rgba(0,0,0,0.12)" : "inset 0 2px 8px rgba(0,0,0,0.06)", transition: "background 0.2s, border 0.2s" }}
              >
                {placedOption && <motion.span key={placedOption.id} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ fontSize: "min(40px, 10vw)", fontWeight: 700, color: "#1E3A5F" }}>{placedOption.letter}</motion.span>}
              </motion.div>
            );
          })}
          <button
            onPointerDown={(e) => { e.stopPropagation(); if (completing) return; setPlaced([null, null, null]); setPlacedColors({}); }}
            style={{ width: 48, height: 48, borderRadius: 24, background: "white", boxShadow: "0 4px 16px rgba(0,0,0,0.18)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, touchAction: "manipulation", opacity: placed.some(Boolean) && !completing ? 1 : 0.35 }}
            aria-label="Reset letters"
          >
            <RotateCcw size={22} color="#A8D0E6" strokeWidth={2.2} />
          </button>
        </div>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", flexShrink: 0, paddingBottom: 4 }}>
          {options.map((option, i) => {
            const isPlaced = placed.includes(option.id);
            const isDraggingThis = dragState?.id === option.id;
            const bgColor = LETTER_COLORS[i % LETTER_COLORS.length];
            if (isPlaced) return <div key={option.id} style={{ width: "min(74px, 18vw)", height: "min(74px, 18vw)", visibility: "hidden", flexShrink: 0 }} />;
            return (
              <motion.div
                key={option.id}
                animate={isDraggingThis ? { scale: 1.1 } : { scale: 1, opacity: 1 }}
                onTouchStart={(e) => { e.stopPropagation(); handleTouchStart(e, option); }}
                style={{ width: "min(74px, 18vw)", height: "min(74px, 18vw)", borderRadius: 18, background: bgColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "min(40px, 10vw)", fontWeight: 700, color: "#1E3A5F", boxShadow: "0 4px 12px rgba(0,0,0,0.10)", border: "3px solid rgba(255,255,255,0.7)", cursor: "grab", touchAction: "none", userSelect: "none", pointerEvents: isDraggingThis ? "none" : "auto", opacity: isDraggingThis ? 0.3 : 1 }}
              >
                {option.letter}
              </motion.div>
            );
          })}
        </div>

        {!completing && (
          <motion.button
            whileTap={allFilled ? { scale: 0.93 } : {}}
            onClick={handleSubmit}
            disabled={!allFilled}
            style={{ padding: "14px 48px", borderRadius: 999, background: allFilled ? "#4A90C4" : "rgba(74,144,196,0.3)", color: allFilled ? "white" : "rgba(255,255,255,0.6)", border: "none", fontSize: 20, fontWeight: 700, fontFamily: "Fredoka, sans-serif", cursor: allFilled ? "pointer" : "default", boxShadow: allFilled ? "0 4px 0 #2f6a9a" : "none", transition: "background 0.25s, box-shadow 0.25s, color 0.25s", touchAction: "manipulation", flexShrink: 0 }}
          >
            {lang === "zh" ? "提交 ✓" : "Submit ✓"}
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {dragState && isDragging.current && (
          <div style={{ position: "fixed", left: dragState.x, top: dragState.y, transform: "translate(-50%, -50%)", zIndex: 9999, pointerEvents: "none", width: "min(80px, 20vw)", height: "min(80px, 20vw)", borderRadius: 18, background: LETTER_COLORS[options.findIndex((o) => o.id === dragState.id) % LETTER_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: "min(44px, 11vw)", fontWeight: 700, color: "#1E3A5F", boxShadow: "0 12px 36px rgba(0,0,0,0.25)", border: "3px solid rgba(255,255,255,0.8)" }}>
            {dragState.letter}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function markComplete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data[VOWEL_KEY]) data[VOWEL_KEY] = {};
    data[VOWEL_KEY][LEVEL_NUM] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

export default function MixedCampaignLevel3({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const onMistake = useCallback(() => setMistakes((m) => m + 1), []);

  const { locked: hintLocked } = useRoundHintAudio({ url: null });

  const advance = useCallback(() => {
    const next = roundIndex + 1;
    if (next >= TOTAL_ROUNDS) {
      markComplete();
      const stars = calcStars(mistakes, SCORED_ROUNDS);
      saveLevelResult(VOWEL_KEY, LEVEL_NUM, stars, mistakes);
      setEarnedStars(stars);
      setDone(true);
    } else {
      setRoundIndex(next);
    }
  }, [roundIndex, mistakes]);

  const roundDef = ROUND_SEQUENCE[roundIndex];
  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;
  const card = useMemo(() => findCard(roundDef.targetWord), [roundIndex]); // eslint-disable-line
  const { photoUrl: userPhotoUrl, clearPhoto: onClearPhoto } = useUserPhoto(roundDef.targetWord);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFF8 0%, #FFF9E6 60%, #E8F4FF 100%)", overflow: "hidden" }}>
      <LevelHeader levelNum={LEVEL_NUM} mistakes={mistakes} onBack={onBack} lang={lang} vowelKey="mixed" gameType="drag_v2" />
      {!done && (
        <div style={{ height: 6, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
          <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #FF6B6B, #FFD93D, #4ECDC4, #9B5DE5)" }} />
        </div>
      )}
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <LevelCompleteScreen levelNum={LEVEL_NUM} stars={earnedStars} mistakes={mistakes} onBack={onBack} lang={lang} />
          </motion.div>
        ) : (
          <motion.div key={`round-${roundIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <DragV2Round key={`drag-${roundIndex}`} roundDef={roundDef} card={card} onComplete={advance} onMistake={onMistake} userPhotoUrl={userPhotoUrl} onClearPhoto={onClearPhoto} lang={lang} />
            {hintLocked && <div style={LOCK_OVERLAY_STYLE} onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}