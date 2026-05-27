import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";
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

const TILE_SIZE = 96;

export default function ShortAGame({ onBack }) {
  const [wordIdx, setWordIdx] = useState(0);
  const [completedLetters, setCompletedLetters] = useState([]); // indices of traced letters
  const [locked, setLocked] = useState(true);   // locks all interaction
  const [wordKey, setWordKey] = useState(0);
  const [audioReady, setAudioReady] = useState(false);
  const [bouncingIdx, setBouncingIdx] = useState(null); // which letter is bouncing during submit
  const [phase, setPhase] = useState("tracing"); // "tracing" | "success"

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
    setPhase("tracing");
    setWordKey(k => k + 1);
  }, [cancelAudio]);

  const handleRefresh = useCallback(() => {
    if (locked || phase !== "tracing") return;
    setCompletedLetters([]);
    setWordKey(k => k + 1);
  }, [locked, phase]);

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

  // Submit: show success state, play bounce+sound per letter then whole word, then advance
  const handleSubmit = useCallback(() => {
    if (lockedRef.current) return;
    const currentWord = WORD_LIST[wordIdxRef.current].word;
    const currentWordData = WORD_LIST[wordIdxRef.current];

    setPhase("success");
    setLocked(true);
    lockedRef.current = true;
    cancelAudio();

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
  const canSubmit = allTraced && !locked && phase === "tracing";

  const playLetterSound = useCallback((letter) => {
    const url = getLetterSoundUrl(letter);
    if (url) playAudioSequence([{ url, gain: getLetterGain(letter) }], () => {});
  }, []);

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
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 16px 32px", gap: 24, overflowY: "auto", position: "relative" }}>
        {(locked || phase === "success") && <div style={{ position: "fixed", inset: 0, zIndex: 100, pointerEvents: "all" }} />}

        {/* Word picture — rainbow border */}
        <AnimatePresence mode="wait">
          <motion.div key={wordIdx} initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }} style={{ position: "relative", width: "100%", maxWidth: 330 }}>
            <div style={{ position: "absolute", top: -12, right: -6, width: 100, height: 85, borderRadius: 28, background: "#FFCDD2", zIndex: 0, transform: "rotate(8deg)" }} />
            <div style={{ position: "absolute", bottom: -12, left: -6, width: 85, height: 85, borderRadius: "50%", background: "#FFF59D", zIndex: 0 }} />
            <div
              onPointerDown={(e) => { e.preventDefault(); if (!lockedRef.current) { cancelAudio(); const cancel = playAudioSequence([{ url: wordData.audio, gain: 1 }], () => { cancelAudioRef.current = null; }); cancelAudioRef.current = cancel; } }}
              style={{ position: "relative", zIndex: 1, borderRadius: 22, padding: 10, boxShadow: "0 10px 32px rgba(30,58,95,0.15)", cursor: "pointer", border: "4px solid transparent", background: "linear-gradient(white, white) padding-box, linear-gradient(135deg, #FF6B6B, #FFD93D, #4ECDC4, #9B59B6) border-box" }}
            >
              <img src={wordData.image} alt={word} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 14, display: "block" }} />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Letter tiles */}
        <AnimatePresence mode="wait">
          <motion.div key={`${wordKey}-${phase}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}
            style={{ display: "flex", flexDirection: "row", gap: 10, justifyContent: "center", width: "100%" }}>
            {word.split("").map((ch, i) => {
              const isTraced = completedLetters.includes(i);
              const isBouncing = phase === "success" && bouncingIdx === i;
              if (phase === "success") {
                return (
                  <motion.div key={`${wordKey}-${i}`} animate={isBouncing ? { y: [0, -18, 0, -10, 0] } : { y: 0 }} transition={isBouncing ? { duration: 0.5 } : {}} style={{ borderRadius: 18 }}>
                    <div style={{ borderRadius: 18, overflow: "hidden", border: "4px solid transparent", background: "linear-gradient(white, white) padding-box, linear-gradient(135deg, #FF6B6B, #FFD93D, #4ECDC4, #9B59B6) border-box", boxShadow: "0 8px 32px rgba(155,89,182,0.25), 0 4px 18px rgba(78,205,196,0.3)" }}>
                      <LetterTrace letter={ch} size={TILE_SIZE} locked={true} transparent={true} forceCompleted={true} onComplete={() => {}} />
                    </div>
                  </motion.div>
                );
              }
              return (
                <motion.div key={`${wordKey}-${i}`} onPointerDown={() => playLetterSound(ch)}
                  style={{ opacity: isTraced ? 1 : 0.75, transition: "opacity 0.3s", borderRadius: 18, cursor: "pointer", touchAction: "manipulation" }}>
                  <div style={{ borderRadius: 18, overflow: "hidden", border: "4px solid transparent", background: isTraced ? "linear-gradient(white, white) padding-box, linear-gradient(135deg, #FF6B6B, #FFD93D, #4ECDC4, #9B59B6) border-box" : "transparent", boxShadow: isTraced ? "0 8px 32px rgba(155,89,182,0.25), 0 4px 18px rgba(78,205,196,0.3)" : "none", transition: "background 0.2s, box-shadow 0.2s" }}>
                    <LetterTrace letter={ch} size={TILE_SIZE} locked={locked || isTraced} transparent={true} onComplete={() => handleLetterComplete(i)} />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
          <button onPointerDown={(e) => { e.preventDefault(); handleRefresh(); }}
            style={{ width: 48, height: 48, borderRadius: 24, background: "white", boxShadow: "0 4px 16px rgba(0,0,0,0.14)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, touchAction: "manipulation", opacity: completedLetters.length > 0 && !locked && phase === "tracing" ? 1 : 0.35 }}>
            <RotateCcw size={22} color="#A8D0E6" strokeWidth={2.2} />
          </button>
          <motion.button
            onPointerDown={(e) => { e.preventDefault(); if (canSubmit) handleSubmit(); }}
            animate={canSubmit ? { scale: [1, 1.04, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            style={{ padding: "14px 52px", borderRadius: 999, border: "none", fontSize: 22, fontWeight: 700, fontFamily: "Fredoka, sans-serif", cursor: canSubmit ? "pointer" : "default", background: canSubmit ? "linear-gradient(135deg, #4A90C4, #22c55e)" : "#C5DCF0", color: canSubmit ? "white" : "#9CB8CC", boxShadow: canSubmit ? "0 6px 24px rgba(74,144,196,0.45)" : "none", transition: "background 0.3s, color 0.3s", touchAction: "manipulation" }}>
            ✓
          </motion.button>
        </div>
      </div>
    </div>
  );
}