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



export default function ShortAGame({ onBack }) {
  const [wordIdx, setWordIdx] = useState(0);
  const [letterIdx, setLetterIdx] = useState(0);
  const [completedLetters, setCompletedLetters] = useState([]);
  const [locked, setLocked] = useState(true);
  const [wordKey, setWordKey] = useState(0);

  const cancelAudioRef = useRef(null);

  // Refs to always hold the latest values — avoids stale closures in callbacks
  const wordIdxRef = useRef(wordIdx);
  const completedLettersRef = useRef(completedLetters);
  const lockedRef = useRef(locked);

  useEffect(() => { wordIdxRef.current = wordIdx; }, [wordIdx]);
  useEffect(() => { completedLettersRef.current = completedLetters; }, [completedLetters]);
  useEffect(() => { lockedRef.current = locked; }, [locked]);

  const wordData = WORD_LIST[wordIdx];
  const word = wordData.word;

  // Preload audio on mount
  useEffect(() => {
    const audioUrls = WORD_LIST.map(w => w.audio).filter(Boolean);
    if (audioUrls.length) preloadAudio(audioUrls);
    const letters = [...new Set(WORD_LIST.flatMap(w => w.word.split("")))];
    warmupAudio(letters.map(getLetterSoundUrl).filter(Boolean));
  }, []);

  const cancelAudio = useCallback(() => {
    if (cancelAudioRef.current) { cancelAudioRef.current(); cancelAudioRef.current = null; }
  }, []);

  // On each new word: lock UI, play word audio, then unlock
  useEffect(() => {
    setLocked(true);
    cancelAudio();

    const currentWordData = WORD_LIST[wordIdx];
    const cancel = playAudioSequence(
      [{ url: currentWordData.audio, gain: 1 }],
      () => { setLocked(false); cancelAudioRef.current = null; }
    );
    cancelAudioRef.current = cancel;

    return () => cancelAudio();
  }, [wordIdx]);

  // Advance to next word — uses ref so never stale
  const goNextWord = useCallback(() => {
    cancelAudio();
    const next = (wordIdxRef.current + 1) % WORD_LIST.length;
    setWordIdx(next);
    setLetterIdx(0);
    setCompletedLetters([]);
    setWordKey(k => k + 1);
  }, [cancelAudio]);

  // When a letter is successfully traced — fired synchronously from touchend (iOS safe)
  const handleLetterComplete = useCallback((completedIdx) => {
    // Read latest values from refs to avoid stale closure issues
    const currentWord = WORD_LIST[wordIdxRef.current].word;
    const currentWordData = WORD_LIST[wordIdxRef.current];
    const currentCompleted = completedLettersRef.current;

    const letter = currentWord[completedIdx];
    const url = getLetterSoundUrl(letter);
    const gain = getLetterGain(letter);

    setLocked(true);
    cancelAudio();

    const afterLetterSound = () => {
      cancelAudioRef.current = null;
      const newCompleted = [...currentCompleted, completedIdx];
      setCompletedLetters(newCompleted);

      if (completedIdx + 1 >= currentWord.length) {
        // All letters done — play letter sounds then full word, then advance
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
        setLetterIdx(completedIdx + 1);
        setLocked(false);
      }
    };

    if (url) {
      const cancel = playAudioSequence([{ url, gain }], afterLetterSound);
      cancelAudioRef.current = cancel;
    } else {
      afterLetterSound();
    }
  }, [cancelAudio, goNextWord]);

  const handlePictureTap = () => {
    if (locked) return;
    if (cancelAudioRef.current) { cancelAudioRef.current(); cancelAudioRef.current = null; }
    playAudio(wordData.audio);
  };

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

      {/* Body */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 20px 32px", gap: 20, overflowY: "auto" }}>
        {/* Lock overlay */}
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

        {/* All letters shown at once — only current one is interactive */}
        {(() => {
          // Fit all letters side-by-side: max canvas size per letter based on word length
          const letterCount = word.length;
          // Available width ~360px, gap 8px between letters
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