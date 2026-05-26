/**
 * CampaignWordMatchRound — single-word Word Match round for campaign levels.
 * Shows the word's image, plays audio, user picks the correct word from 4 text choices.
 * Calls onComplete() on correct, onMistake() on wrong.
 */
import { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2 } from "lucide-react";
import { playAudio } from "../../lib/useAudio";
import { useCorrectSound } from "../../lib/useCorrectSound";
import { useTryAgainSound } from "../../lib/useTryAgainSound";
import { shortAWords } from "../../lib/shortAWords";
import { shortEWords } from "../../lib/shortEWords";
import { shortIWords } from "../../lib/shortIWords";
import { shortOWords } from "../../lib/shortOWords";
import { shortUWords } from "../../lib/shortUWords";

const ALL_WORDS = [...shortAWords, ...shortEWords, ...shortIWords, ...shortOWords, ...shortUWords];

function buildRound(card, overrideChoices) {
  if (overrideChoices) return { card, choices: overrideChoices };
  const distractors = ALL_WORDS.filter((w) => w.word !== card.word)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  const choices = [...distractors, card].sort(() => Math.random() - 0.5);
  return { card, choices };
}

// Rainbow border matching IdentifyingRound style
const RAINBOW_BORDER = "4px solid transparent";
const RAINBOW_BG = "linear-gradient(white, white) padding-box, linear-gradient(135deg, #FF6B6B, #FFD93D, #4ECDC4, #9B59B6) border-box";

export default function CampaignWordMatchRound({ card, overrideChoices, onComplete, onMistake, lang = "en", suppressAutoPlay = false }) {
  const [round] = useState(() => buildRound(card, overrideChoices));
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [audioLocked, setAudioLocked] = useState(true);
  const autoPlayedRef = useRef(false);
  const { play: playCorrect } = useCorrectSound();
  const { play: playTryAgain } = useTryAgainSound();

  // Auto-play on mount (suppressed on Round 1 when hint audio handles sequencing)
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

  const handleChoice = useCallback((choice) => {
    if (feedback || audioLocked) return;
    setSelected(choice.word);
    const correct = choice.word === round.card.word;
    setFeedback(correct ? "correct" : "wrong");
    if (correct) {
      playCorrect(() => {
        if (card.audio) playAudio(card.audio);
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
  }, [feedback, audioLocked, round, card, onComplete, onMistake, playTryAgain]);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 24, fontFamily: "Fredoka, sans-serif", position: "relative" }}>
      {(audioLocked || feedback === "correct") && <div style={{ position: "fixed", inset: 0, zIndex: 100, pointerEvents: "all" }} />}

      {/* Picture card — no colored border */}
      <AnimatePresence mode="wait">
        <motion.div
          key={round.card.word}
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.88 }}
          transition={{ type: "spring", stiffness: 280, damping: 20 }}
          style={{ width: "min(280px, calc(100vw - 48px))", background: "white", borderRadius: 28, padding: 12, boxShadow: "0 12px 48px rgba(30,58,95,0.14)", border: "2px solid #E8E8E8" }}
        >
          <img src={round.card.image} alt="" style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 18, display: "block" }} />
          <button
            onClick={() => { if (!audioLocked && card.audio) playAudio(card.audio); }}
            style={{ marginTop: 10, width: "100%", padding: "10px 0", borderRadius: 16, background: "#F0F0F0", border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", fontFamily: "Fredoka, sans-serif", touchAction: "manipulation" }}
          >
            <Volume2 size={20} color="#888" />
          </button>
        </motion.div>
      </AnimatePresence>

      {/* 2×2 word choice grid — bigger font, more spacing */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, width: "100%", maxWidth: "min(360px, calc(100vw - 32px))" }}>
        {round.choices.map((choice) => {
          const isSelected = selected === choice.word;
          const isCorrect = choice.word === round.card.word;
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