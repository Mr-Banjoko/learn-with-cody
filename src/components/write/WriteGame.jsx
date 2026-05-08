/**
 * WriteGame — Short A tracing game
 * - Auto-plays word audio when a new round starts
 * - Tapping the picture replays word audio
 * - On word completion: letter bounce + letter sounds → word blend → advance
 */
import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackArrow from "../BackArrow";
import TracingLetter from "./TracingLetter";
import { shortAWords } from "../../lib/shortAWords";
import { playAudio, playAudioSequence } from "../../lib/useAudio";
import { getLetterSoundUrl, getLetterGain } from "../../lib/letterSounds";

const WORDS = shortAWords;

function getScale(screenW) {
  const available = Math.min(screenW * 0.88, 360);
  const perLetter = (available - 32) / 3;
  return Math.min(perLetter / 60, 1.7);
}

export default function WriteGame({ onBack, lang = "en" }) {
  const [wordIndex, setWordIndex]             = useState(0);
  const [activeLetterIdx, setActiveLetterIdx] = useState(0);
  const [wordKey, setWordKey]                 = useState(0);
  const [blocked, setBlocked]                 = useState(false);
  const [bouncingIdx, setBouncingIdx]         = useState(-1);

  const cancelSeqRef  = useRef(null);
  const wordIndexRef  = useRef(0); // always in sync with wordIndex for closures
  const screenW = typeof window !== "undefined" ? window.innerWidth : 390;
  const scale = getScale(screenW);

  const card    = WORDS[wordIndex];
  const letters = card.word.split("");

  // Keep ref in sync
  wordIndexRef.current = wordIndex;

  // Auto-play word audio whenever wordKey changes (covers every round including first)
  // We store the audio URL in a ref so the effect always sees the current value
  const audioUrlRef = useRef(card.audio);
  audioUrlRef.current = card.audio;

  useEffect(() => {
    // Small delay so the card transition animation starts first
    const t = setTimeout(() => {
      if (audioUrlRef.current) playAudio(audioUrlRef.current);
    }, 150);
    return () => clearTimeout(t);
  }, [wordKey]);

  // Cleanup sequence on unmount
  useEffect(() => {
    return () => { cancelSeqRef.current?.(); };
  }, []);

  const handleImageTap = useCallback(() => {
    if (card.audio) playAudio(card.audio);
  }, [card.audio]);

  /**
   * Completion sequence after all 3 letters are traced:
   *  1. Block UI
   *  2. Play each letter sound (bounce matching letter while playing)
   *  3. Play blended word audio as the FINAL step in the same sequence
   *  4. Advance to next word
   */
  const runCompletionSequence = useCallback((currentLetters, currentCard, currentWordIndex) => {
    setBlocked(true);

    // Build all steps including word audio as the last step in the sequence
    // This guarantees word audio always plays — it's not a separate call that can race
    const steps = [
      ...currentLetters.map((ch, i) => ({
        url: getLetterSoundUrl(ch),
        gain: getLetterGain(ch),
        onStart: () => {
          setBouncingIdx(i);
          setTimeout(() => setBouncingIdx(-1), 600);
        },
      })),
      // Word blend as final sequence step
      {
        url: currentCard.audio,
        gain: 1,
        onStart: () => {
          // no bounce during word blend
          setBouncingIdx(-1);
        },
      },
    ];

    const cancel = playAudioSequence(steps, () => {
      // All audio done — advance
      const next = currentWordIndex + 1;
      if (next >= WORDS.length) {
        onBack && onBack();
      } else {
        setBlocked(false);
        setBouncingIdx(-1);
        setWordIndex(next);
        setActiveLetterIdx(0);
        setWordKey((k) => k + 1);
      }
    });

    cancelSeqRef.current = cancel;
  }, [onBack]);

  const handleLetterComplete = useCallback((letterIdx) => {
    if (letterIdx < letters.length - 1) {
      setTimeout(() => setActiveLetterIdx(letterIdx + 1), 350);
    } else {
      // Capture current values at the moment of completion — avoids stale closure
      const currentLetters = WORDS[wordIndexRef.current].word.split("");
      const currentCard    = WORDS[wordIndexRef.current];
      const currentIdx     = wordIndexRef.current;
      setTimeout(() => runCompletionSequence(currentLetters, currentCard, currentIdx), 200);
    }
  }, [letters.length, runCompletionSequence]);

  const progressPct = (wordIndex / WORDS.length) * 100;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: "Fredoka, sans-serif",
        background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "calc(env(safe-area-inset-top, 0px) + 8px) 16px 8px",
          borderBottom: "1.5px solid rgba(0,0,0,0.06)",
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(10px)",
        }}
      >
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 14, color: "#94A3B8", fontWeight: 600 }}>
          {wordIndex + 1}/{WORDS.length}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 5, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
        <motion.div
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.4 }}
          style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #4ECDC4, #C77DFF)" }}
        />
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: "12px 16px 20px",
          overflowY: "auto",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={wordKey}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.3 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, width: "100%" }}
          >
            {/* Word picture — tappable to replay audio */}
            <div
              onClick={handleImageTap}
              style={{
                background: "white",
                borderRadius: 24,
                padding: 10,
                boxShadow: "0 8px 32px rgba(30,58,95,0.12)",
                flexShrink: 0,
                cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <img
                src={card.image}
                alt={card.word}
                style={{
                  width: "min(220px, 52vw)",
                  height: "min(220px, 52vw)",
                  objectFit: "cover",
                  borderRadius: 16,
                  display: "block",
                  pointerEvents: "none",
                }}
              />
            </div>

            {/* Tracing area */}
            <div
              style={{
                background: "transparent",
                borderRadius: 20,
                border: "2px solid rgba(78,205,196,0.2)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                maxWidth: 380,
                pointerEvents: blocked ? "none" : "auto",
              }}
            >
              {letters.map((letter, i) => (
                <TracingLetter
                  key={`${wordKey}-${i}`}
                  letter={letter}
                  isActive={!blocked && i === activeLetterIdx}
                  onComplete={() => handleLetterComplete(i)}
                  scale={scale}
                  bouncing={bouncingIdx === i}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}