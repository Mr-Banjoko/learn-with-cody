/**
 * WriteGame — Short a (and future vowel groups)
 * ==============================================
 * Full 2-row layout:
 *   ROW 1 (top):    Picture of the target word. Tap to hear full word audio.
 *   ROW 2 (bottom): Guided finger-writing area (WordWriter).
 *
 * Word progression:
 *   - Uses the existing shortAWords asset set (same images/audio as elsewhere in the app).
 *   - 3-letter CVC words only (all letters must have stroke definitions in letterPaths.js).
 *   - Shuffled so each session feels fresh.
 *   - After each word is completed, advance to the next word.
 *
 * Mobile Safari notes:
 *   - All touch events handled in LetterCanvas (touchstart/move/end + preventDefault).
 *   - No pointer events used.
 *   - Images loaded as <img> tags (not canvas) for Safari compatibility.
 *   - Audio uses the existing warmupAudio/playAudio system (blob URLs, iOS-compatible).
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackArrow from "../BackArrow";
import WordWriter from "./WordWriter";
import { playAudio, warmupAudio } from "../../lib/useAudio";
import { LETTER_DEFS } from "../../lib/letterPaths";

// Words that have ALL letters defined in our stroke system
function isWritable(word) {
  return word.split("").every((l) => !!LETTER_DEFS[l]);
}

// Shuffle helper
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function WriteGame({ wordList, onBack, lang = "en" }) {
  const writableWords = useMemo(() =>
    shuffle(wordList.filter((w) => isWritable(w.word))),
    [wordList]
  );

  const [wordIndex, setWordIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageTapFlash, setImageTapFlash] = useState(false);
  const [writerKey, setWriterKey] = useState(0);

  const currentWord = writableWords[wordIndex] || writableWords[0];

  // Warmup audio for current + next word
  useEffect(() => {
    if (!currentWord) return;
    const urls = writableWords.slice(wordIndex, wordIndex + 3).map((w) => w.audio).filter(Boolean);
    warmupAudio(urls);
  }, [wordIndex, writableWords, currentWord]);

  // Auto-play word audio when word changes
  useEffect(() => {
    if (currentWord?.audio) {
      setTimeout(() => playAudio(currentWord.audio), 400);
    }
    setImageLoaded(false);
  }, [wordIndex, currentWord]);

  const handlePicturePress = useCallback(() => {
    if (currentWord?.audio) {
      playAudio(currentWord.audio);
      setImageTapFlash(true);
      setTimeout(() => setImageTapFlash(false), 300);
    }
  }, [currentWord]);

  const handleWordComplete = useCallback(() => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      const next = (wordIndex + 1) % writableWords.length;
      setWordIndex(next);
      setWriterKey((k) => k + 1);
    }, 2000);
  }, [wordIndex, writableWords.length]);

  if (!currentWord) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#64748B", fontFamily: "Fredoka, sans-serif" }}>
          No writable words available yet.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      fontFamily: "Fredoka, sans-serif",
      background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Header */}
      <div style={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "calc(env(safe-area-inset-top, 0px) + 8px) 16px 8px",
        borderBottom: "1.5px solid rgba(0,0,0,0.06)",
        background: "rgba(255,255,255,0.80)",
        backdropFilter: "blur(10px)",
        zIndex: 10,
      }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1E293B" }}>
            ✏️ Write — Short a
          </p>
        </div>
        {/* Word counter */}
        <div style={{
          background: "#F0F9FF",
          border: "1.5px solid #BAE6FD",
          borderRadius: 99,
          padding: "4px 12px",
          fontSize: 13,
          fontWeight: 700,
          color: "#0369A1",
          flexShrink: 0,
        }}>
          {wordIndex + 1}/{writableWords.length}
        </div>
      </div>

      {/* ── ROW 1: PICTURE ─────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`pic-${wordIndex}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px 20px 12px",
          }}
        >
          {/* Tappable picture card */}
          <motion.div
            onPointerDown={(e) => { e.preventDefault(); handlePicturePress(); }}
            onTouchStart={(e) => { e.preventDefault(); handlePicturePress(); }}
            animate={imageTapFlash ? { scale: 0.94 } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            style={{
              background: "white",
              borderRadius: 28,
              padding: 6,
              boxShadow: imageTapFlash
                ? "0 0 0 4px #4ECDC4AA, 0 8px 32px rgba(78,205,196,0.35)"
                : "0 8px 32px rgba(0,0,0,0.10)",
              border: "2.5px solid rgba(78,205,196,0.3)",
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <img
              src={currentWord.image}
              alt={currentWord.word}
              onLoad={() => setImageLoaded(true)}
              style={{
                width: "min(160px, 38vw)",
                height: "min(160px, 38vw)",
                objectFit: "cover",
                borderRadius: 22,
                display: "block",
                opacity: imageLoaded ? 1 : 0,
                transition: "opacity 0.3s",
              }}
            />
            {/* Speaker hint */}
            <div style={{
              position: "absolute",
              bottom: 10,
              right: 10,
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "rgba(78,205,196,0.85)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}>
              <span style={{ fontSize: 14 }}>🔊</span>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Divider */}
      <div style={{
        height: 1,
        margin: "0 20px",
        background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.08), transparent)",
        flexShrink: 0,
      }} />

      {/* ── ROW 2: WRITING AREA ─────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {showSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
            }}
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.3, 1] }}
              transition={{ duration: 0.7 }}
              style={{ fontSize: 72 }}
            >
              🌟
            </motion.div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#4ECDC4", fontFamily: "Fredoka, sans-serif" }}>
              {currentWord.word}
            </div>
            <div style={{ fontSize: 18, color: "#64748B", fontFamily: "Fredoka, sans-serif" }}>
              You wrote it! ✨
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={`writer-${writerKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            <WordWriter
              key={`ww-${writerKey}`}
              wordData={currentWord}
              onWordComplete={handleWordComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}