/**
 * WriteGame — Short A tracing game
 * - Auto-plays word audio when a new round starts
 * - Tapping the picture replays word audio
 * - On word completion: letter bounce + letter sounds → word audio → advance
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
  const [wordIndex, setWordIndex]       = useState(0);
  const [activeLetterIdx, setActiveLetterIdx] = useState(0);
  const [wordKey, setWordKey]           = useState(0);
  const [blocked, setBlocked]           = useState(false);
  // Which letter index is currently bouncing (-1 = none)
  const [bouncingIdx, setBouncingIdx]   = useState(-1);

  const cancelSeqRef = useRef(null);
  const screenW = typeof window !== "undefined" ? window.innerWidth : 390;
  const scale = getScale(screenW);

  const card    = WORDS[wordIndex];
  const letters = card.word.split("");

  // Play word audio whenever wordKey changes (new round)
  useEffect(() => {
    if (card.audio) {
      playAudio(card.audio);
    }
  }, [wordKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    return () => { cancelSeqRef.current?.(); };
  }, []);

  const handleImageTap = useCallback(() => {
    if (card.audio) playAudio(card.audio);
  }, [card.audio]);

  /**
   * Called when the last letter of the word is successfully traced.
   * Runs the completion sequence:
   *   1. Block UI
   *   2. Bounce letter 0 + play its sound → letter 1 → letter 2
   *   3. Play full word audio
   *   4. Advance to next word
   */
  const runCompletionSequence = useCallback(() => {
    setBlocked(true);

    // Build the audio steps: letter0 sound, letter1 sound, letter2 sound, word audio
    const audioSteps = letters.map((ch, i) => ({
      url: getLetterSoundUrl(ch),
      gain: getLetterGain(ch),
      onStart: (stepIdx) => {
        // Bounce the letter whose sound is playing
        setBouncingIdx(stepIdx);
        // After 600ms stop bounce, prepare for next
        setTimeout(() => setBouncingIdx(-1), 600);
      },
    }));

    // After all letter sounds, play the word
    const cancel = playAudioSequence(audioSteps, () => {
      // Word blend
      if (card.audio) {
        playAudio(card.audio);
      }
      // Advance after a short pause (word audio duration ~800ms)
      setTimeout(() => {
        setBlocked(false);
        setBouncingIdx(-1);
        const next = wordIndex + 1;
        if (next >= WORDS.length) {
          onBack && onBack();
        } else {
          setWordIndex(next);
          setActiveLetterIdx(0);
          setWordKey((k) => k + 1);
        }
      }, 900);
    });

    cancelSeqRef.current = cancel;
  }, [letters, card, wordIndex, onBack]);

  const handleLetterComplete = useCallback((letterIdx) => {
    if (letterIdx < letters.length - 1) {
      setTimeout(() => setActiveLetterIdx(letterIdx + 1), 350);
    } else {
      // Last letter done — run completion sequence
      setTimeout(() => runCompletionSequence(), 200);
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
                // Block pointer events during completion sequence
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