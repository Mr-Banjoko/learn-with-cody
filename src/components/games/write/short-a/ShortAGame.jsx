import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LetterTrace from "./LetterTrace";
import BackArrow from "../../../BackArrow";
import { shortAWords } from "../../../../lib/shortAWords";
import { getLetterSoundUrl, getLetterGain } from "../../../../lib/letterSounds";
import { playAudio, playAudioSequence, preloadAudio, warmupAudio } from "../../../../lib/useAudio";

const LETTER_COLORS = ["#FFAFC5", "#A8D8EA", "#FFE57A", "#B5EAD7", "#FFDAC1"];

// Only words that exist in shortAWords
const WORD_LIST = shortAWords.slice(0, 10);

function ProgressBar({ value, max }) {
  return (
    <div style={{ width: "100%", height: 10, background: "rgba(74,144,196,0.18)", borderRadius: 99, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${(value / max) * 100}%`, background: "linear-gradient(90deg,#4ade80,#22c55e)", borderRadius: 99, transition: "width 0.4s ease" }} />
    </div>
  );
}

function CelebrationScreen({ word, onNext }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, padding: "32px 24px" }}
    >
      <motion.div
        animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 0.7 }}
        style={{ fontSize: 72 }}
      >🎉</motion.div>
      <div style={{ fontSize: 30, color: "#22c55e", fontWeight: 700, fontFamily: "Fredoka, sans-serif" }}>Excellent!</div>
      <div style={{ fontSize: 52, fontFamily: "Fredoka, sans-serif", color: "#1E3A5F", fontWeight: 700, letterSpacing: 6 }}>{word}</div>
      <button
        onClick={onNext}
        style={{ marginTop: 8, padding: "16px 52px", background: "#4A90C4", color: "white", border: "none", borderRadius: 18, fontSize: 20, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 20px rgba(74,144,196,0.4)", fontFamily: "Fredoka, sans-serif" }}
      >
        Next Word →
      </button>
    </motion.div>
  );
}

function AllDoneScreen({ onRestart }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, padding: "32px 24px" }}
    >
      <div style={{ fontSize: 80 }}>⭐</div>
      <div style={{ fontSize: 30, color: "#F4B942", fontWeight: 700, fontFamily: "Fredoka, sans-serif" }}>Amazing! All done!</div>
      <div style={{ color: "#7BACC8", fontSize: 17, textAlign: "center", fontFamily: "Fredoka, sans-serif" }}>You traced all the short-a words!</div>
      <button
        onClick={onRestart}
        style={{ marginTop: 8, padding: "16px 52px", background: "#4A90C4", color: "white", border: "none", borderRadius: 18, fontSize: 20, fontWeight: 700, cursor: "pointer", fontFamily: "Fredoka, sans-serif" }}
      >
        Play Again
      </button>
    </motion.div>
  );
}

export default function ShortAGame({ onBack }) {
  const [wordIdx, setWordIdx] = useState(0);
  const [letterIdx, setLetterIdx] = useState(0);
  const [completedLetters, setCompletedLetters] = useState([]);
  const [wordDone, setWordDone] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [locked, setLocked] = useState(true); // locked while audio plays
  const [roundKey, setRoundKey] = useState(0); // forces LetterTrace remount on new letter

  const cancelAudioRef = useRef(null);

  const wordData = WORD_LIST[wordIdx];
  const word = wordData.word;

  // Preload audio on mount
  useEffect(() => {
    const audioUrls = WORD_LIST.map(w => w.audio).filter(Boolean);
    if (audioUrls.length) preloadAudio(audioUrls);
    const letters = [...new Set(WORD_LIST.flatMap(w => w.word.split("")))];
    warmupAudio(letters.map(getLetterSoundUrl).filter(Boolean));
  }, []);

  // On each new round: lock UI, play word audio, then unlock
  useEffect(() => {
    if (wordDone || allDone) return;
    setLocked(true);
    if (cancelAudioRef.current) { cancelAudioRef.current(); cancelAudioRef.current = null; }

    const cancel = playAudioSequence(
      [{ url: wordData.audio, gain: 1 }],
      () => {
        setLocked(false);
        cancelAudioRef.current = null;
      }
    );
    cancelAudioRef.current = cancel;

    return () => { if (cancelAudioRef.current) { cancelAudioRef.current(); cancelAudioRef.current = null; } };
  }, [wordIdx, wordDone, allDone]);

  // When a letter is successfully traced: lock, play letter sound, unlock, advance
  const handleLetterComplete = useCallback(() => {
    const letter = word[letterIdx];
    const url = getLetterSoundUrl(letter);
    const gain = getLetterGain(letter);

    setLocked(true);
    if (cancelAudioRef.current) { cancelAudioRef.current(); cancelAudioRef.current = null; }

    const afterSound = () => {
      cancelAudioRef.current = null;
      const newCompleted = [...completedLetters, letterIdx];
      setCompletedLetters(newCompleted);

      if (letterIdx + 1 >= word.length) {
        // All letters done — play the Learn Phonics sequence: letters then full word
        const letters = word.split("");
        const steps = letters.map((l, i) => {
          const lUrl = getLetterSoundUrl(l);
          if (!lUrl) return null;
          return { url: lUrl, gain: getLetterGain(l) };
        }).filter(Boolean);
        if (wordData.audio) steps.push({ url: wordData.audio, gain: 1 });

        const cancel = playAudioSequence(steps, () => {
          cancelAudioRef.current = null;
          setWordDone(true);
          setLocked(false);
        });
        cancelAudioRef.current = cancel;
      } else {
        setLetterIdx(letterIdx + 1);
        setRoundKey(k => k + 1);
        setLocked(false);
      }
    };

    if (url) {
      const cancel = playAudioSequence([{ url, gain }], afterSound);
      cancelAudioRef.current = cancel;
    } else {
      afterSound();
    }
  }, [word, letterIdx, completedLetters, wordData]);

  const handleNextWord = () => {
    if (cancelAudioRef.current) { cancelAudioRef.current(); cancelAudioRef.current = null; }
    if (wordIdx + 1 >= WORD_LIST.length) {
      setAllDone(true);
    } else {
      setWordIdx(wordIdx + 1);
      setLetterIdx(0);
      setCompletedLetters([]);
      setWordDone(false);
      setRoundKey(k => k + 1);
    }
  };

  const handleRestart = () => {
    if (cancelAudioRef.current) { cancelAudioRef.current(); cancelAudioRef.current = null; }
    setWordIdx(0);
    setLetterIdx(0);
    setCompletedLetters([]);
    setWordDone(false);
    setAllDone(false);
    setRoundKey(k => k + 1);
  };

  const handlePictureTap = () => {
    if (locked) return;
    if (cancelAudioRef.current) { cancelAudioRef.current(); cancelAudioRef.current = null; }
    playAudio(wordData.audio);
  };

  return (
    <div
      style={{
        minHeight: "100%",
        background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
        fontFamily: "Fredoka, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
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

      {/* Body */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 20px 32px", gap: 20, overflowY: "auto" }}>

        {allDone ? (
          <AllDoneScreen onRestart={handleRestart} />
        ) : wordDone ? (
          <CelebrationScreen word={word} onNext={handleNextWord} />
        ) : (
          <>
            {/* Lock overlay hint */}
            {locked && (
              <div style={{ position: "fixed", inset: 0, zIndex: 100, pointerEvents: "all" }} />
            )}

            {/* Word picture — tappable like Learn Phonics */}
            <AnimatePresence mode="wait">
              <motion.div
                key={wordIdx}
                initial={{ opacity: 0, scale: 0.93 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.93 }}
                transition={{ duration: 0.22 }}
                style={{ position: "relative", width: "100%", maxWidth: 300 }}
              >
                {/* Decorative blobs */}
                <div style={{ position: "absolute", top: -16, right: -8, width: 130, height: 110, borderRadius: 36, background: "#FFCDD2", zIndex: 0, transform: "rotate(8deg)" }} />
                <div style={{ position: "absolute", bottom: -16, left: -8, width: 110, height: 110, borderRadius: "50%", background: "#FFF59D", zIndex: 0 }} />

                <div
                  onPointerDown={(e) => { e.preventDefault(); handlePictureTap(); }}
                  style={{
                    position: "relative", zIndex: 1,
                    background: "white", borderRadius: 28, padding: 12,
                    boxShadow: "0 12px 40px rgba(30,58,95,0.15)",
                    cursor: locked ? "default" : "pointer",
                    opacity: locked ? 0.92 : 1,
                    transition: "opacity 0.2s",
                  }}
                >
                  <img
                    src={wordData.image}
                    alt={word}
                    style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 18, display: "block" }}
                  />
                  {/* Speaker icon hint */}
                  {!locked && (
                    <div style={{ position: "absolute", bottom: 20, right: 20, width: 36, height: 36, borderRadius: 18, background: "#4A90C4", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 10px rgba(74,144,196,0.5)" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21" /></svg>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Letter sequence indicator */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              {word.split("").map((ch, i) => {
                const isDone = completedLetters.includes(i);
                const isCurrent = i === letterIdx;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <motion.div
                      animate={isCurrent && !locked ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      style={{
                        width: 64, height: 64, borderRadius: 16,
                        background: isDone ? "#B5EAD7" : isCurrent ? LETTER_COLORS[i % LETTER_COLORS.length] : "rgba(255,255,255,0.7)",
                        border: `3px solid ${isDone ? "#22c55e" : isCurrent ? "#4A90C4" : "rgba(168,208,230,0.4)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 36, fontWeight: 700, color: isDone ? "#22c55e" : isCurrent ? "#1E3A5F" : "#A0B8CC",
                        boxShadow: isCurrent ? "0 4px 16px rgba(74,144,196,0.3)" : "none",
                        transition: "background 0.3s, border 0.3s",
                      }}
                    >
                      {isDone ? "✓" : ch}
                    </motion.div>
                    {i < word.length - 1 && (
                      <span style={{ fontSize: 20, color: "#A8D0E6", fontWeight: 700 }}>→</span>
                    )}
                  </div>
                );
              })}
            </div>


            {/* Tracing canvas */}
            <div style={{ width: "100%", maxWidth: 340, position: "relative" }}>
              <LetterTrace
                key={`${wordIdx}-${letterIdx}-${roundKey}`}
                letter={word[letterIdx]}
                locked={locked}
                onComplete={handleLetterComplete}
              />
            </div>

            {/* Instruction */}
            <div style={{ fontSize: 15, color: "#7BACC8", textAlign: "center", fontFamily: "Fredoka, sans-serif" }}>
              {locked
                ? "🔊 Listen first..."
                : `Trace the letter  "${word[letterIdx]}"  (${letterIdx + 1} of ${word.length})`}
            </div>
          </>
        )}
      </div>
    </div>
  );
}