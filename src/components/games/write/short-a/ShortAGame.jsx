import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LetterTrace from "./LetterTrace";
import BackArrow from "../../../BackArrow";
import { shortAWords } from "../../../../lib/shortAWords";
import { getLetterSoundUrl, getLetterGain } from "../../../../lib/letterSounds";
import { playAudio, playAudioSequence, preloadAudio, warmupAudio } from "../../../../lib/useAudio";

const LETTER_COLORS = ["#FFAFC5", "#A8D8EA", "#FFE57A", "#B5EAD7", "#FFDAC1"];
const WORD_LIST = shortAWords.slice(0, 10);

// Collect every audio URL needed for the game
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
  const [letterIdx, setLetterIdx] = useState(0);
  const [completedLetters, setCompletedLetters] = useState([]);
  const [locked, setLocked] = useState(true);
  const [wordKey, setWordKey] = useState(0);
  const [audioReady, setAudioReady] = useState(false);

  // Refs — always hold the latest state values so callbacks never go stale
  const wordIdxRef = useRef(0);
  const letterIdxRef = useRef(0);
  const completedLettersRef = useRef([]);
  const lockedRef = useRef(true);
  const cancelAudioRef = useRef(null);

  // Keep refs in sync with state
  useEffect(() => { wordIdxRef.current = wordIdx; }, [wordIdx]);
  useEffect(() => { letterIdxRef.current = letterIdx; }, [letterIdx]);
  useEffect(() => { completedLettersRef.current = completedLetters; }, [completedLetters]);
  useEffect(() => { lockedRef.current = locked; }, [locked]);

  // ── Step 1: Warm up ALL audio before any gameplay ──────────────────────────
  useEffect(() => {
    let cancelled = false;
    const urls = getAllAudioUrls();
    // Preload into Cache API, then resolve all blobs
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

  // ── Step 2: When audio is ready (or word changes), play word intro then unlock
  useEffect(() => {
    if (!audioReady) return;

    setLocked(true);
    cancelAudio();

    const wData = WORD_LIST[wordIdxRef.current];
    const cancel = playAudioSequence(
      [{ url: wData.audio, gain: 1 }],
      () => {
        cancelAudioRef.current = null;
        setLocked(false);
      }
    );
    cancelAudioRef.current = cancel;

    return () => cancelAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioReady, wordIdx]);

  // ── Advance to next word ───────────────────────────────────────────────────
  const goNextWord = useCallback(() => {
    cancelAudio();
    const next = (wordIdxRef.current + 1) % WORD_LIST.length;
    // Reset state synchronously via functional updaters to avoid batching issues
    setWordIdx(next);
    setLetterIdx(0);
    setCompletedLetters([]);
    setWordKey(k => k + 1);
  }, [cancelAudio]);

  // ── Letter traced successfully ─────────────────────────────────────────────
  // This is called synchronously from touchend in LetterTrace (iOS gesture-safe).
  // We read ALL current values from refs — zero stale closure risk.
  const handleLetterComplete = useCallback((completedIdx) => {
    // Guard: if already locked from a previous call, ignore duplicate fires
    if (lockedRef.current) return;

    const currentWord = WORD_LIST[wordIdxRef.current].word;
    const currentWordData = WORD_LIST[wordIdxRef.current];
    const currentCompleted = completedLettersRef.current;

    // Lock immediately to prevent any re-entry
    setLocked(true);
    lockedRef.current = true;
    cancelAudio();

    const letter = currentWord[completedIdx];
    const url = getLetterSoundUrl(letter);
    const gain = getLetterGain(letter);

    const afterLetterSound = () => {
      cancelAudioRef.current = null;

      const newCompleted = [...currentCompleted, completedIdx];
      setCompletedLetters(newCompleted);
      completedLettersRef.current = newCompleted;

      const allDone = completedIdx + 1 >= currentWord.length;

      if (allDone) {
        // Build full sequence: each letter sound then the whole word
        const steps = currentWord.split("").map(l => {
          const lUrl = getLetterSoundUrl(l);
          return lUrl ? { url: lUrl, gain: getLetterGain(l) } : null;
        }).filter(Boolean);
        if (currentWordData.audio) steps.push({ url: currentWordData.audio, gain: 1 });

        const cancel = playAudioSequence(steps, () => {
          cancelAudioRef.current = null;
          goNextWord();
        });
        cancelAudioRef.current = cancel;
      } else {
        const next = completedIdx + 1;
        setLetterIdx(next);
        letterIdxRef.current = next;
        setLocked(false);
        lockedRef.current = false;
      }
    };

    if (url) {
      const cancel = playAudioSequence([{ url, gain }], afterLetterSound);
      cancelAudioRef.current = cancel;
    } else {
      afterLetterSound();
    }
  }, [cancelAudio, goNextWord]);

  const handlePictureTap = useCallback(() => {
    if (lockedRef.current) return;
    cancelAudio();
    const wData = WORD_LIST[wordIdxRef.current];
    playAudio(wData.audio);
  }, [cancelAudio]);

  const wordData = WORD_LIST[wordIdx];
  const word = wordData.word;

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", fontFamily: "Fredoka, sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: "#A8D0E6", borderBottomLeftRadius: 28, borderBottomRightRadius: 28, padding: "10px 20px 16px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1E3A5F", margin: 0 }}>Short A — Trace & Spell</h1>
          <p style={{ fontSize: 13, color: "#3A6080", margin: 0 }}>Word {wordIdx + 1} of {WORD_LIST.length}</p>
        </div>
        <div style={{ minWidth: 100 }}>
          <ProgressBar value={wordIdx} max={WORD_LIST.length} />
        </div>
      </div>

      {/* Loading overlay while audio warms up */}
      {!audioReady && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(255,255,255,0.85)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
          <div style={{ width: 40, height: 40, border: "4px solid #A8D0E6", borderTopColor: "#4A90C4", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <p style={{ color: "#4A90C4", fontWeight: 600, fontSize: 16 }}>Getting ready…</p>
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
              onPointerDown={(e) => { e.preventDefault(); handlePictureTap(); }}
              style={{ position: "relative", zIndex: 1, background: "white", borderRadius: 28, padding: 12, boxShadow: "0 12px 40px rgba(30,58,95,0.15)", cursor: locked ? "default" : "pointer", opacity: locked ? 0.92 : 1, transition: "opacity 0.2s" }}
            >
              <img src={wordData.image} alt={word} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 18, display: "block" }} />
              {!locked && (
                <div style={{ position: "absolute", bottom: 20, right: 20, width: 36, height: 36, borderRadius: 18, background: "#4A90C4", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 10px rgba(74,144,196,0.5)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21" /></svg>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Letter tiles */}
        {(() => {
          const letterCount = word.length;
          const maxSize = Math.min(160, Math.floor((360 - (letterCount - 1) * 8) / letterCount));
          const tileSize = Math.max(80, maxSize);
          return (
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 8, width: "100%" }}>
              {word.split("").map((ch, i) => {
                const isDone = completedLetters.includes(i);
                const isCurrent = i === letterIdx;
                return (
                  <div key={`${wordKey}-${i}`} style={{ opacity: isDone || isCurrent ? 1 : 0.35, transition: "opacity 0.3s" }}>
                    <LetterTrace
                      key={`${wordKey}-${i}`}
                      letter={ch}
                      size={tileSize}
                      locked={locked || !isCurrent || isDone}
                      onComplete={() => handleLetterComplete(i)}
                    />
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
}