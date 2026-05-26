/**
 * WriteV2CampaignRound — single-word Write V2 round for campaign levels.
 * Audio auto-plays at mount. Wrong submit deducts 1 life via onMistake.
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";
import LetterTrace from "../games/write/short-a/LetterTrace";
import { getLetterSoundUrl, getLetterGain } from "../../lib/letterSounds";
import { playAudioSequence } from "../../lib/useAudio";
import { useCorrectSound } from "../../lib/useCorrectSound";
import { useTryAgainSound } from "../../lib/useTryAgainSound";

const TILE_SIZE = 76;
const NUM_DISTRACTORS = 1; // 3 correct letters + 1 distractor = 4 cards in one row

function createRound(card, key) {
  const word = card.word.toLowerCase();
  const letters = word.split("");
  const correctCards = letters.map((letter, index) => ({
    id: `correct-${index}-${letter}-${key}`,
    letter, isCorrect: true, correctIndex: index,
  }));
  const blocked = new Set(letters);
  const available = "abcdefghijklmnopqrstuvwxyz".split("").filter((l) => !blocked.has(l));
  const distractors = [...available].sort(() => Math.random() - 0.5).slice(0, NUM_DISTRACTORS).map((letter, index) => ({
    id: `distractor-${index}-${letter}-${key}`,
    letter, isCorrect: false, correctIndex: null,
  }));
  const shuffledCards = [...correctCards, ...distractors].sort(() => Math.random() - 0.5);
  return { correctCards, distractorCards: distractors, shuffledCards };
}

export default function WriteV2CampaignRound({ card, onComplete, onMistake, lang = "en", suppressAutoPlay = false }) {
  const [roundKey, setRoundKey] = useState(0);
  const [round, setRound] = useState(() => createRound(card, 0));
  const [tracedCardIds, setTracedCardIds] = useState(new Set());
  const [phase, setPhase] = useState("tracing");
  const [locked, setLocked] = useState(true);
  const [bouncingCardIdx, setBouncingCardIdx] = useState(null);
  const [successCards, setSuccessCards] = useState(null);
  const [submitError, setSubmitError] = useState(false);
  const [pulsatingCardIds, setPulsatingCardIds] = useState(new Set());

  const lockedRef = useRef(true);
  const cancelAudioRef = useRef(null);
  const { play: playCorrect } = useCorrectSound();
  const { play: playTryAgain } = useTryAgainSound();
  useEffect(() => { lockedRef.current = locked; }, [locked]);

  const cancelAudio = useCallback(() => {
    if (cancelAudioRef.current) { cancelAudioRef.current(); cancelAudioRef.current = null; }
  }, []);

  useEffect(() => {
    if (suppressAutoPlay) {
      setLocked(false);
      lockedRef.current = false;
      return;
    }
    setLocked(true);
    lockedRef.current = true;
    const t = setTimeout(() => {
      if (card.audio) {
        const cancel = playAudioSequence([{ url: card.audio, gain: 1 }], () => {
          cancelAudioRef.current = null;
          setLocked(false);
          lockedRef.current = false;
        });
        cancelAudioRef.current = cancel;
      } else {
        setLocked(false);
        lockedRef.current = false;
      }
    }, 300);
    return () => { clearTimeout(t); cancelAudio(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = useCallback(() => {
    if (locked || phase !== "tracing") return;
    setTracedCardIds(new Set());
    setPulsatingCardIds(new Set());
    setRoundKey((k) => k + 1);
    setSubmitError(false);
  }, [locked, phase]);

  const handleCardComplete = useCallback((cardId) => {
    if (lockedRef.current || phase !== "tracing") return;
    setPulsatingCardIds(new Set());
    setTracedCardIds((prev) => { const next = new Set(prev); next.add(cardId); return next; });
  }, [phase]);

  const handleSubmit = useCallback(() => {
    if (lockedRef.current || phase !== "tracing") return;
    const tracedCards = round.shuffledCards.filter((c) => tracedCardIds.has(c.id));
    const isCorrect = tracedCards.length === round.correctCards.length && tracedCards.every((c) => c.isCorrect);
    if (!isCorrect) {
      playTryAgain();
      onMistake && onMistake();
      setSubmitError(true);
      const correctIds = new Set(round.correctCards.map((c) => c.id));
      setPulsatingCardIds(correctIds);
      setTimeout(() => {
        setSubmitError(false);
        setTracedCardIds(new Set());
        setRoundKey((k) => k + 1);
        setRound(createRound(card, Date.now()));
      setPulsatingCardIds(new Set());
      }, 700);
      return;
    }
    const ordered = round.correctCards.slice().sort((a, b) => a.correctIndex - b.correctIndex);
    setSuccessCards(ordered);
    setPhase("success");
    setLocked(true);
    lockedRef.current = true;
    cancelAudio();
    playCorrect(() => {
      setTimeout(() => {
        const steps = ordered.map((c, i) => {
          const url = getLetterSoundUrl(c.letter);
          return url ? { url, gain: getLetterGain(c.letter), onStart: () => setBouncingCardIdx(i) } : null;
        }).filter(Boolean);
        if (card.audio) steps.push({ url: card.audio, gain: 1, onStart: () => setBouncingCardIdx(null) });
        const cancel = playAudioSequence(steps, () => {
          cancelAudioRef.current = null;
          setBouncingCardIdx(null);
          onComplete();
        });
        cancelAudioRef.current = cancel;
      }, 10);
    });
  }, [phase, round, tracedCardIds, cancelAudio, onComplete, onMistake, card, playTryAgain]);

  const tracedCount = tracedCardIds.size;
  const canSubmit = tracedCount >= round.correctCards.length && phase === "tracing" && !locked && !submitError;
  const displayCards = phase === "success" && successCards ? successCards : round.shuffledCards;

  const playLetterSound = useCallback((letter) => {
    const url = getLetterSoundUrl(letter);
    if (url) playAudioSequence([{ url, gain: getLetterGain(letter) }], () => {});
  }, []);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 16px 32px", gap: 16, overflowY: "auto", position: "relative" }}>
      {(locked || phase === "success") && <div style={{ position: "fixed", inset: 0, zIndex: 100, pointerEvents: "all" }} />}

      {/* Word image */}
      <AnimatePresence mode="wait">
        <motion.div key={card.word} initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }} style={{ position: "relative", width: "100%", maxWidth: 220 }}>
          <div style={{ position: "absolute", top: -12, right: -6, width: 100, height: 85, borderRadius: 28, background: "#FFCDD2", zIndex: 0, transform: "rotate(8deg)" }} />
          <div style={{ position: "absolute", bottom: -12, left: -6, width: 85, height: 85, borderRadius: "50%", background: "#FFF59D", zIndex: 0 }} />
          <div onPointerDown={(e) => { e.preventDefault(); if (!lockedRef.current && card.audio) { cancelAudio(); const cancel = playAudioSequence([{ url: card.audio, gain: 1 }], () => { cancelAudioRef.current = null; }); cancelAudioRef.current = cancel; } }}
            style={{ position: "relative", zIndex: 1, background: "#E8FFFE", borderRadius: 22, padding: 10, boxShadow: "0 10px 32px rgba(30,58,95,0.15)", cursor: "pointer" }}>
            <img src={card.image} alt={card.word} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 14, display: "block" }} />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Card grid — always 4 cards in one row */}
      <AnimatePresence mode="wait">
        <motion.div key={`${roundKey}-${phase}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}
          style={{ display: "flex", flexDirection: "row", gap: 8, justifyContent: "center", width: "100%" }}>
          {displayCards.map((c, i) => {
            const isTraced = tracedCardIds.has(c.id);
            const isBouncing = phase === "success" && bouncingCardIdx === i;
            if (phase === "success") {
              return (
                <motion.div key={c.id} animate={isBouncing ? { y: [0, -18, 0, -10, 0] } : { y: 0 }} transition={isBouncing ? { duration: 0.5 } : {}}
                  style={{ width: TILE_SIZE, height: Math.round(TILE_SIZE * 1.837), borderRadius: 16, background: "#E8FFFE", border: "2.5px solid rgba(168,208,230,0.6)", boxShadow: "0 6px 28px rgba(30,58,95,0.14)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.round(TILE_SIZE * 0.55), fontWeight: 700, color: "#1E3A5F", fontFamily: "Fredoka, sans-serif" }}>
                  {c.letter}
                </motion.div>
              );
            }
            const isPulsating = pulsatingCardIds.has(c.id) && !isTraced;
            return (
              <motion.div key={c.id}
                animate={isPulsating ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                transition={isPulsating ? { repeat: Infinity, duration: 0.7, ease: "easeInOut" } : {}}
                style={{ position: "relative", opacity: isTraced ? 1 : 0.65, transition: "opacity 0.3s", outline: isPulsating ? "3px solid #22c55e" : isTraced ? "3px solid #22c55e" : "none", borderRadius: 18, boxShadow: isPulsating ? "0 0 0 3px #22c55e, 0 4px 16px rgba(34,197,94,0.45)" : "none" }}>
                <LetterTrace letter={c.letter} size={TILE_SIZE} locked={locked || isTraced} transparent={isTraced} onComplete={() => handleCardComplete(c.id)} />
                {/* Tap overlay on traced cards — sits on top so canvas doesn't capture the touch */}
                {isTraced && (
                  <div
                    onPointerDown={(e) => { e.preventDefault(); playLetterSound(c.letter); }}
                    style={{ position: "absolute", inset: 0, borderRadius: 18, cursor: "pointer", touchAction: "manipulation" }}
                  />
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
        <button onPointerDown={(e) => { e.preventDefault(); handleRefresh(); }}
          style={{ width: 48, height: 48, borderRadius: 24, background: "white", boxShadow: "0 4px 16px rgba(0,0,0,0.14)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, touchAction: "manipulation", opacity: tracedCount > 0 && !locked && phase === "tracing" ? 1 : 0.35 }}>
          <RotateCcw size={22} color="#A8D0E6" strokeWidth={2.2} />
        </button>
        <motion.button onPointerDown={(e) => { e.preventDefault(); if (canSubmit) handleSubmit(); }}
          animate={submitError ? { x: [0,-10,10,-8,8,-4,4,0] } : canSubmit ? { scale: [1, 1.04, 1] } : {}}
          transition={submitError ? { duration: 0.5 } : { repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          style={{ padding: "14px 52px", borderRadius: 999, border: "none", fontSize: 22, fontWeight: 700, fontFamily: "Fredoka, sans-serif", cursor: canSubmit ? "pointer" : "default", background: canSubmit ? "linear-gradient(135deg, #4A90C4, #22c55e)" : "#C5DCF0", color: canSubmit ? "white" : "#9CB8CC", boxShadow: canSubmit ? "0 6px 24px rgba(74,144,196,0.45)" : "none", transition: "background 0.3s, color 0.3s", touchAction: "manipulation" }}>
          ✓
        </motion.button>
      </div>
    </div>
  );
}