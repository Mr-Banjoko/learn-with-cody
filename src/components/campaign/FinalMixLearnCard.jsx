/**
 * FinalMixLearnCard — interactive Learn card for the Final Mixed Campaign.
 * Shows word image, letter tiles, and word text. Audio-first; no quiz.
 * Tapping the image, any letter, or the word label plays audio.
 * Child-facing, large touch targets, Cody-style.
 */
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import { playAudio, playAudioSequence } from "../../lib/useAudio";
import { getLetterSoundUrl, getLetterGain } from "../../lib/letterSounds";

const LETTER_COLORS = ["#FFAFC5", "#A8D8EA", "#FFE57A"];

export default function FinalMixLearnCard({ card, userPhotoUrl, isActive, onNext }) {
  const [bouncingIndex, setBouncingIndex] = useState(null);
  const seqRef = useRef(null);
  const playedRef = useRef(false);

  // Auto-play when card becomes active
  useEffect(() => {
    if (!isActive || playedRef.current) return;
    playedRef.current = true;
    const t = setTimeout(() => {
      if (card.audio) playAudio(card.audio);
    }, 350);
    return () => clearTimeout(t);
  }, [isActive, card.audio]);

  // Reset played guard when card changes
  useEffect(() => {
    playedRef.current = false;
    setBouncingIndex(null);
    return () => {
      if (seqRef.current) { seqRef.current(); seqRef.current = null; }
    };
  }, [card.word]);

  const handleFullPlay = () => {
    if (seqRef.current) { seqRef.current(); seqRef.current = null; }
    const letters = card.word.split("");
    const steps = letters.map((letter, i) => {
      const url = getLetterSoundUrl(letter);
      return url ? { url, gain: getLetterGain(letter), onStart: () => setBouncingIndex(i) } : null;
    }).filter(Boolean);
    if (card.audio) steps.push({ url: card.audio, gain: 1, onStart: () => setBouncingIndex(null) });
    seqRef.current = playAudioSequence(steps, () => {
      seqRef.current = null;
      setBouncingIndex(null);
    });
  };

  const handleLetterTap = (letter) => {
    const url = getLetterSoundUrl(letter);
    if (url) playAudio(url, getLetterGain(letter));
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-evenly",
        padding: "12px 20px 20px",
        fontFamily: "Fredoka, sans-serif",
        gap: 0,
      }}
    >
      {/* Picture */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onPointerDown={(e) => { e.preventDefault(); handleFullPlay(); }}
        style={{
          width: "min(280px, calc(100vw - 48px))",
          aspectRatio: "1/1",
          borderRadius: 28,
          overflow: "hidden",
          border: "4px solid transparent",
          background: "linear-gradient(white, white) padding-box, linear-gradient(135deg, #FF6B6B, #FFD93D, #4ECDC4, #9B59B6) border-box",
          boxShadow: "0 12px 48px rgba(30,58,95,0.14)",
          cursor: "pointer",
          position: "relative",
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
          flexShrink: 0,
        }}
      >
        <img
          src={userPhotoUrl || card.image}
          alt={card.word}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <div style={{
          position: "absolute", bottom: 10, right: 10,
          width: 36, height: 36, borderRadius: 18,
          background: "rgba(255,255,255,0.92)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
        }}>
          <Volume2 size={20} color="#4A90C4" strokeWidth={2} />
        </div>
      </motion.button>

      {/* Letter tiles */}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16 }}>
        {card.word.split("").map((letter, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.88 }}
            animate={bouncingIndex === i ? { y: [0, -18, 0, -8, 0] } : { y: 0 }}
            transition={bouncingIndex === i ? { duration: 0.45 } : {}}
            onPointerDown={(e) => { e.preventDefault(); handleLetterTap(letter); }}
            style={{
              width: "min(90px, 22vw)",
              height: "min(90px, 22vw)",
              borderRadius: 22,
              background: LETTER_COLORS[i % LETTER_COLORS.length],
              border: "3px solid rgba(255,255,255,0.85)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "min(52px, 13vw)",
              fontWeight: 700,
              color: "#1E3A5F",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(0,0,0,0.10)",
              touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
              fontFamily: "Fredoka, sans-serif",
              flexShrink: 0,
            }}
          >
            {letter}
          </motion.button>
        ))}
      </div>

      {/* Word label — tap to play full word */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onPointerDown={(e) => { e.preventDefault(); if (card.audio) playAudio(card.audio); }}
        style={{
          marginTop: 14,
          padding: "12px 40px",
          borderRadius: 99,
          background: "white",
          border: "2.5px solid rgba(168,208,230,0.6)",
          boxShadow: "0 4px 18px rgba(30,58,95,0.10)",
          fontSize: "min(40px, 10vw)",
          fontWeight: 700,
          color: "#1E3A5F",
          fontFamily: "Fredoka, sans-serif",
          cursor: "pointer",
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
          flexShrink: 0,
        }}
      >
        {card.word}
      </motion.button>

      {/* Next button */}
      <motion.button
        whileTap={{ scale: 0.94 }}
        onPointerDown={(e) => { e.preventDefault(); onNext(); }}
        style={{
          marginTop: 18,
          padding: "14px 52px",
          borderRadius: 99,
          background: "linear-gradient(135deg, #4ECDC4, #4D96FF)",
          border: "none",
          color: "white",
          fontSize: 20,
          fontWeight: 700,
          fontFamily: "Fredoka, sans-serif",
          cursor: "pointer",
          boxShadow: "0 6px 24px rgba(78,205,196,0.40)",
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
          flexShrink: 0,
        }}
      >
        Next ›
      </motion.button>
    </motion.div>
  );
}