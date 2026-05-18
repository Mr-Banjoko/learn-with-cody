/**
 * CampaignWriteRound
 *
 * Single-word write/trace round for campaign levels.
 * Audio auto-plays at mount, UI locked during playback.
 * No heart deduction (tracing is not right/wrong in the write game).
 * Calls onComplete() after submit audio sequence finishes.
 *
 * Props:
 *   card      — shortAWords entry (has .word, .image, .audio)
 *   onComplete — called after win sequence
 *   lang       — "en" | "zh"
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LetterTrace from "../games/write/short-a/LetterTrace";
import { getLetterSoundUrl, getLetterGain } from "../../lib/letterSounds";
import { playAudio, playAudioSequence } from "../../lib/useAudio";

export default function CampaignWriteRound({ card, onComplete, lang = "en", suppressAutoPlay = false }) {
  const word = card.word;
  const [completedLetters, setCompletedLetters] = useState([]);
  const [locked, setLocked] = useState(true);
  const [wordKey] = useState(0);
  const [bouncingIdx, setBouncingIdx] = useState(null);

  const lockedRef = useRef(true);
  const cancelAudioRef = useRef(null);
  const completedLettersRef = useRef([]);

  useEffect(() => { lockedRef.current = locked; }, [locked]);
  useEffect(() => { completedLettersRef.current = completedLetters; }, [completedLetters]);

  const cancelAudio = useCallback(() => {
    if (cancelAudioRef.current) { cancelAudioRef.current(); cancelAudioRef.current = null; }
  }, []);

  // Auto-play word audio at mount, then unlock tracing
  // suppressAutoPlay: skip this when hint audio will play word audio via onHintComplete
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

  const handleLetterComplete = useCallback((idx) => {
    if (lockedRef.current) return;
    setCompletedLetters((prev) => {
      if (prev.includes(idx)) return prev;
      const next = [...prev, idx];
      completedLettersRef.current = next;
      return next;
    });
  }, []);

  const handleSubmit = useCallback(() => {
    if (lockedRef.current) return;
    setLocked(true);
    lockedRef.current = true;
    cancelAudio();

    const steps = word.split("").map((l, i) => {
      const url = getLetterSoundUrl(l);
      return url ? { url, gain: getLetterGain(l), onStart: () => setBouncingIdx(i) } : null;
    }).filter(Boolean);

    if (card.audio) steps.push({ url: card.audio, gain: 1, onStart: () => setBouncingIdx(null) });

    const cancel = playAudioSequence(steps, () => {
      cancelAudioRef.current = null;
      setBouncingIdx(null);
      onComplete();
    });
    cancelAudioRef.current = cancel;
  }, [word, card, cancelAudio, onComplete]);

  const allTraced = completedLetters.length >= word.length;
  const letterCount = word.length;
  const maxSize = Math.min(160, Math.floor((360 - (letterCount - 1) * 8) / letterCount));
  const tileSize = Math.max(80, maxSize);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 20px 32px", gap: 20, overflowY: "auto", position: "relative" }}>
      {/* Lock overlay */}
      {locked && <div style={{ position: "fixed", inset: 0, zIndex: 100, pointerEvents: "all" }} />}

      {/* Word image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={card.word}
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.93 }}
          transition={{ duration: 0.22 }}
          style={{ position: "relative", width: "100%", maxWidth: 300 }}
        >
          <div style={{ position: "absolute", top: -16, right: -8, width: 130, height: 110, borderRadius: 36, background: "#FFCDD2", zIndex: 0, transform: "rotate(8deg)" }} />
          <div style={{ position: "absolute", bottom: -16, left: -8, width: 110, height: 110, borderRadius: "50%", background: "#FFF59D", zIndex: 0 }} />
          <div
            onPointerDown={(e) => { e.preventDefault(); if (!lockedRef.current && card.audio) playAudio(card.audio); }}
            style={{ position: "relative", zIndex: 1, background: "#E8FFFE", borderRadius: 28, padding: 12, boxShadow: "0 12px 40px rgba(30,58,95,0.15)", cursor: "pointer" }}
          >
            <img src={card.image} alt={card.word} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 18, display: "block" }} />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Letter trace tiles */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 8, width: "100%" }}>
        {word.split("").map((ch, i) => {
          const isDone = completedLetters.includes(i);
          const isBouncing = bouncingIdx === i;
          return (
            <motion.div
              key={`${wordKey}-${i}`}
              animate={isBouncing ? { y: [0, -18, 0, -10, 0] } : { y: 0 }}
              transition={isBouncing ? { duration: 0.5, ease: "easeInOut" } : {}}
              style={{ opacity: isDone ? 1 : 0.6, transition: "opacity 0.3s" }}
            >
              <LetterTrace
                letter={ch}
                size={tileSize}
                locked={locked || isDone}
                onComplete={() => handleLetterComplete(i)}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Submit button */}
      <motion.button
        onPointerDown={(e) => { e.preventDefault(); if (allTraced && !locked) handleSubmit(); }}
        animate={allTraced && !locked ? { scale: [1, 1.04, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        style={{
          marginTop: 8, padding: "16px 56px", borderRadius: 999, border: "none",
          fontSize: 22, fontWeight: 700, fontFamily: "Fredoka, sans-serif",
          cursor: allTraced && !locked ? "pointer" : "default",
          background: allTraced && !locked ? "linear-gradient(135deg, #4A90C4, #22c55e)" : "#C5DCF0",
          color: allTraced && !locked ? "white" : "#9CB8CC",
          boxShadow: allTraced && !locked ? "0 6px 24px rgba(74,144,196,0.45)" : "none",
          transition: "background 0.3s, color 0.3s, box-shadow 0.3s",
          touchAction: "manipulation",
        }}
      >
        ✓
      </motion.button>
    </div>
  );
}