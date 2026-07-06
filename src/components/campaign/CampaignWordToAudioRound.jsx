/**
 * CampaignWordToAudioRound — single-word "word to audio" round for campaign levels.
 * Unlike CampaignWordMatchRound (which shows a picture), this round shows ONLY a
 * speaker button — the child must listen to the audio and pick the matching word
 * from the text choices. No picture crutch, matching the standalone Word to Audio
 * Match game in the Games tab.
 */
import { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playAudio } from "../../lib/useAudio";
import { useCorrectSound } from "../../lib/useCorrectSound";
import { useTryAgainSound } from "../../lib/useTryAgainSound";

function SpeakerIcon({ color = "#4ECDC4", size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <path d="M18 21h-4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4l8 6V15l-8 6z" fill={color} />
      <path d="M30 20.5a8 8 0 0 1 0 11" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M33.5 17a13 13 0 0 1 0 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
    </svg>
  );
}

const RAINBOW_BORDER = "4px solid transparent";
const RAINBOW_BG = "linear-gradient(white, white) padding-box, linear-gradient(135deg, #FF6B6B, #FFD93D, #4ECDC4, #9B59B6) border-box";

export default function CampaignWordToAudioRound({ card, overrideChoices, onComplete, onMistake, lang = "en", suppressAutoPlay = false }) {
  const [choices] = useState(() => overrideChoices || [card]);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [audioLocked, setAudioLocked] = useState(true);
  const autoPlayedRef = useRef(false);
  const { play: playCorrect } = useCorrectSound();
  const { play: playTryAgain } = useTryAgainSound();

  useEffect(() => {
    if (suppressAutoPlay) {
      setAudioLocked(false);
      return;
    }
    if (autoPlayedRef.current) return;
    autoPlayedRef.current = true;
    const t = setTimeout(() => {
      if (card.audio) playAudio(card.audio);
      const u = setTimeout(() => setAudioLocked(false), 1400);
      return () => clearTimeout(u);
    }, 300);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line

  const handleReplay = useCallback(() => {
    if (audioLocked || feedback) return;
    if (card.audio) playAudio(card.audio);
  }, [audioLocked, feedback, card]);

  const handleChoice = useCallback((choice) => {
    if (feedback || audioLocked) return;
    setSelected(choice.word);
    const correct = choice.word === card.word;
    setFeedback(correct ? "correct" : "wrong");
    if (correct) {
      playCorrect(() => {
        setFeedback(null);
        setSelected(null);
        onComplete();
      });
    } else {
      playTryAgain();
      onMistake && onMistake();
      setTimeout(() => {
        setFeedback(null);
        setSelected(null);
      }, 900);
    }
  }, [feedback, audioLocked, card, onComplete, onMistake, playCorrect, playTryAgain]);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 28, fontFamily: "Fredoka, sans-serif", position: "relative" }}>
      {(audioLocked || feedback === "correct") && <div style={{ position: "fixed", inset: 0, zIndex: 100, pointerEvents: "all" }} />}

      {/* Big speaker button — no picture, forces listening */}
      <AnimatePresence mode="wait">
        <motion.button
          key={card.word}
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.88 }}
          transition={{ type: "spring", stiffness: 280, damping: 20 }}
          whileTap={{ scale: 0.93 }}
          onClick={handleReplay}
          style={{ width: 140, height: 140, borderRadius: "50%", background: "white", border: "3px solid #A8D8EA", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 32px rgba(74,144,196,0.28)", cursor: "pointer", touchAction: "manipulation" }}
        >
          <SpeakerIcon color="#4A90C4" size={56} />
        </motion.button>
      </AnimatePresence>

      {/* 2×2 word choice grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, width: "100%", maxWidth: "min(360px, calc(100vw - 32px))" }}>
        {choices.map((choice) => {
          const isSelected = selected === choice.word;
          const isCorrect = choice.word === card.word;
          const showRainbow = feedback === "correct" && (isSelected || isCorrect);

          return (
            <motion.button
              key={choice.word}
              whileTap={!feedback ? { scale: 0.93 } : {}}
              animate={isSelected && feedback === "wrong" ? { x: [0, -8, 8, -6, 6, 0] } : {}}
              transition={{ duration: 0.4 }}
              onPointerDown={(e) => { e.preventDefault(); handleChoice(choice); }}
              style={{
                padding: "20px 8px",
                borderRadius: 20,
                background: showRainbow ? RAINBOW_BG : "white",
                border: showRainbow ? RAINBOW_BORDER : "2px solid #A8D0E6",
                color: "#1E3A5F",
                fontSize: 28,
                fontWeight: 700,
                fontFamily: "Fredoka, sans-serif",
                cursor: feedback ? "default" : "pointer",
                boxShadow: showRainbow
                  ? "0 8px 32px rgba(155,89,182,0.25), 0 4px 18px rgba(78,205,196,0.3)"
                  : "0 4px 12px rgba(30,58,95,0.10)",
                transition: "background 0.2s, border 0.2s, box-shadow 0.2s",
                minHeight: 72,
                touchAction: "manipulation",
              }}
            >
              {choice.word}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}