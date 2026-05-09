import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LetterTrace from "./LetterTrace";
import BackArrow from "../../../BackArrow";
import { shortAWords } from "../../../../lib/shortAWords";
import { getLetterSoundUrl, getLetterGain } from "../../../../lib/letterSounds";
import { playAudioSequence, preloadAudio, warmupAudio } from "../../../../lib/useAudio";

const WORD_LIST = shortAWords.slice(0, 10);

function getAllAudioUrls() {
  const urls = [];
  WORD_LIST.forEach(w => {
    if (w.audio) urls.push(w.audio);
    w.word.split("").forEach(l => {
      const u = getLetterSoundUrl(l);
      if (u) urls.push(u);
    });
  });
  return [...new Set(urls)];
}

function ProgressBar({ value, max }) {
  return (
    <div style={{ width: "100%", height: 10, background: "rgba(74,144,196,0.18)", borderRadius: 99, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${(value / max) * 100}%`, background: "linear-gradient(90deg,#4ade80,#22c55e)", borderRadius: 99, transition: "width 0.4s ease" }} />
    </div>
  );
}

export default function ShortAGame({ onBack }) {
  const [wordIdx, setWordIdx] = useState(0);
  const [completedLetters, setCompletedLetters] = useState([]); // indices of traced letters
  const [locked, setLocked] = useState(true);   // locks all interaction
  const [wordKey, setWordKey] = useState(0);
  const [audioReady, setAudioReady] = useState(false);
  const [bouncingIdx, setBouncingIdx] = useState(null); // which letter is bouncing during submit

  const wordIdxRef = useRef(0);
  const lockedRef = useRef(true);
  const cancelAudioRef = useRef(null);
  const completedLettersRef = useRef([]);

  useEffect(() => { wordIdxRef.current = wordIdx; }, [wordIdx]);
  useEffect(() => { lockedRef.current = locked; }, [locked]);
  useEffect(() => { completedLettersRef.current = completedLetters; }, [completedLetters]);

  // Warm up ALL audio before gameplay
  useEffect(() => {
    let cancelled = false;
    const urls = getAllAudioUrls();
    preloadAudio(urls).then(() => warmupAudio(urls)).then(() => {
      if (!cancelled) setAudioReady(true);
    });
    return () => { cancelled = true; };
  }, []);

  const cancelAudio = useCallback(() => {
    if (cancelAudioRef.current) {
      cancelAudioRef.current();
      cancelAudioRef.current = null;
    }
  }, []);

  // On audio ready or word change: lock, play word audio, then unlock tracing
  useEffect(() => {
    if (!audioReady) return;
    setLocked(true);
    lockedRef.current = true;
    cancelAudio();

    const wData = WORD_LIST[wordIdxRef.current];
    const cancel = playAudioSequence(
      [{ url: wData.audio, gain: 1 }],
      () => {
        cancelAudioRef.current = null;
        setLocked(false);
        lockedRef.current = false;
      }
    );
    cancelAudioRef.current = cancel;
    return () => cancelAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioReady, wordIdx]);

  const goNextWord = useCallback(() => {
    cancelAudio();
    const next = (wordIdxRef.current + 1) % WORD_LIST.length;
    setWordIdx(next);
    setCompletedLetters([]);
    setBouncingIdx(null);
    setWordKey(k => k + 1);
  }, [cancelAudio]);

  // Called by LetterTrace when a letter is successfully traced
  const handleLetterComplete = useCallback((idx) => {
    if (lockedRef.current) return;
    setCompletedLetters(prev => {
      if (prev.includes(idx)) return prev;
      const next = [...prev, idx];
      completedLettersRef.current = next;
      return next;
    });
  }, []);

  // Submit: lock everything, play bounce+sound per letter then whole word, then advance
  const handleSubmit = useCallback(() => {
    if (lockedRef.current) return;
    const currentWord = WORD_LIST[wordIdxRef.current].word;
    const currentWordData = WORD_LIST[wordIdxRef.current];

    setLocked(true);
    lockedRef.current = true;
    cancelAudio();

    // Build steps with onStart to trigger bounce per letter
    const steps = currentWord.split("").map((l, i) => {
      const url = getLetterSoundUrl(l);
      return url ? { url, gain: getLetterGain(l), onStart: () => setBouncingIdx(i) } : null;
    }).filter(Boolean);

    if (currentWordData.audio) {
      steps.push({ url: currentWordData.audio, gain: 1, onStart: () => setBouncingIdx(null) });
    }

    const cancel = playAudioSequence(steps, () => {
      cancelAudioRef.current = null;
      setBouncingIdx(null);
      goNextWord();
    });
    cancelAudioRef.current = cancel;
  }, [cancelAudio, goNextWord]);

  const wordData = WORD_LIST[wordIdx];
  const word = wordData.word;
  const allTraced = completedLetters.length >= word.length;

  const letterCount = word.length;
  const maxSize = Math.min(160, Math.floor((360 - (letterCount - 1) * 8) / letterCount));
  const tileSize = Math.max(80, maxSize);

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", fontFamily: "Fredoka, sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: "#A8D0E6", borderBottomLeftRadius: 28, borderBottomRightRadius: 28, padding: "10px 20px 16px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1E3A5F", margin: 0 }}>Short A — Trace & Spell</h1>
        </div>
        <div style={{ minWidth: 100 }}>
          <ProgressBar value={wordIdx} max={WORD_LIST.length} />
        </div>
      </div>

      {/* Loading overlay */}
      {!audioReady && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(255,255,255,0.85)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
          <div style={{ width: 40, height: 40, border: "4px solid #A8D0E6", borderTopColor: "#4A90C4", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Body */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 20px 32px", gap: 20, overflowY: "auto" }}>
        {/* Interaction lock overlay */}
        {locked && <div style={{ position: "fixed", inset: 0, zIndex: 100, pointerEvents: "all" }} />}

        {/* Word picture */}
        <AnimatePresence mode="wait">
          <motion.div
            key={wordIdx}
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.93 }}
            transition={{ duration: 0.22 }}
            style={{ position: "relative", width: "100%", maxWidth: 300 }}
          >
            <div style={{ position: "absolute", top: -16, right: -8, width: 130, height: 110, borderRadius: 36, background: "#FFCDD2", zIndex: 0, transform: "rotate(8deg)" }} />
            <div style={{ position: "absolute", bottom: -16, left: -8, width: 110, height: 110, borderRadius: "50%", background: "#FFF59D", zIndex: 0 }} />
            <div
              onPointerDown={(e) => { e.preventDefault(); if (!lockedRef.current) { cancelAudio(); const cancel = playAudioSequence([{ url: wordData.audio, gain: 1 }], () => { cancelAudioRef.current = null; }); cancelAudioRef.current = cancel; } }}
              style={{ position: "relative", zIndex: 1, background: "#f0f8ff", borderRadius: 28, padding: 12, boxShadow: "0 12px 40px rgba(30,58,95,0.15)", cursor: "pointer" }}
            >
              <img src={wordData.image} alt="" style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 18, display: "block" }} />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Letter tiles — all visible, all traceable (not sequential) */}
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
            marginTop: 8,
            padding: "16px 56px",
            borderRadius: 999,
            border: "none",
            fontSize: 22,
            fontWeight: 700,
            fontFamily: "Fredoka, sans-serif",
            cursor: allTraced && !locked ? "pointer" : "default",
            background: allTraced && !locked
              ? "linear-gradient(135deg, #4A90C4, #22c55e)"
              : "#C5DCF0",
            color: allTraced && !locked ? "white" : "#9CB8CC",
            boxShadow: allTraced && !locked ? "0 6px 24px rgba(74,144,196,0.45)" : "none",
            transition: "background 0.3s, color 0.3s, box-shadow 0.3s",
            touchAction: "manipulation",
          }}
        >
          ✓
        </motion.button>
      </div>
    </div>
  );
}