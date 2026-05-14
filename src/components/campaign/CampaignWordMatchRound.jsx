/**
 * CampaignWordMatchRound — single-word Word Match round for campaign levels.
 * Shows the word's image, plays audio, user picks the correct word from 4 text choices.
 * Calls onComplete() on correct, onMistake() on wrong.
 */
import { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2 } from "lucide-react";
import { playAudio } from "../../lib/useAudio";
import { shortAWords } from "../../lib/shortAWords";
import { shortEWords } from "../../lib/shortEWords";
import { shortIWords } from "../../lib/shortIWords";
import { shortOWords } from "../../lib/shortOWords";
import { shortUWords } from "../../lib/shortUWords";

const ALL_WORDS = [...shortAWords, ...shortEWords, ...shortIWords, ...shortOWords, ...shortUWords];

function buildRound(card) {
  const distractors = ALL_WORDS.filter((w) => w.word !== card.word)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  const choices = [...distractors, card].sort(() => Math.random() - 0.5);
  return { card, choices };
}

export default function CampaignWordMatchRound({ card, onComplete, onMistake, lang = "en" }) {
  const [round] = useState(() => buildRound(card));
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [audioLocked, setAudioLocked] = useState(true);
  const autoPlayedRef = useRef(false);

  // Auto-play on mount
  useEffect(() => {
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
      if (card.audio) playAudio(card.audio);
    } else {
      onMistake && onMistake();
    }
    setTimeout(() => {
      setFeedback(null);
      setSelected(null);
      if (correct) onComplete();
    }, correct ? 1400 : 900);
  }, [feedback, audioLocked, round, card, onComplete, onMistake]);

  const color = "#FF6B6B";

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, fontFamily: "Fredoka, sans-serif", position: "relative" }}>
      {audioLocked && <div style={{ position: "fixed", inset: 0, zIndex: 100, pointerEvents: "all" }} />}

      {/* Picture card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={round.card.word}
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.88 }}
          transition={{ type: "spring", stiffness: 280, damping: 20 }}
          style={{ width: "min(280px, calc(100vw - 48px))", background: "white", borderRadius: 28, padding: 12, boxShadow: "0 12px 48px rgba(30,58,95,0.14)", border: `3px solid ${color}44` }}
        >
          <img src={round.card.image} alt="" style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 18, display: "block" }} />
          <button
            onClick={() => { if (!audioLocked && card.audio) playAudio(card.audio); }}
            style={{ marginTop: 10, width: "100%", padding: "10px 0", borderRadius: 16, background: color + "18", border: `2px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", fontFamily: "Fredoka, sans-serif", touchAction: "manipulation" }}
          >
            <Volume2 size={20} color={color} />
          </button>
        </motion.div>
      </AnimatePresence>

      {/* 2×2 word choice grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%", maxWidth: "min(340px, calc(100vw - 32px))" }}>
        {round.choices.map((choice) => {
          const isSelected = selected === choice.word;
          const isCorrect = choice.word === round.card.word;
          let bg = "white", border = "2px solid #A8D0E6", textColor = "#1E3A5F", shadow = "0 4px 12px rgba(30,58,95,0.10)";
          if (isSelected && feedback === "correct") { bg = "#E8FFF6"; border = "3px solid #4ECDC4"; shadow = "0 6px 24px rgba(78,205,196,0.35)"; }
          else if (isSelected && feedback === "wrong") { bg = "#FFF0F0"; border = "3px solid #FF6B6B"; textColor = "#FF6B6B"; }
          else if (!isSelected && feedback === "correct" && isCorrect) { bg = "#E8FFF6"; border = "3px solid #4ECDC4"; }
          return (
            <motion.button
              key={choice.word}
              whileTap={!feedback ? { scale: 0.93 } : {}}
              animate={isSelected && feedback === "wrong" ? { x: [0, -8, 8, -6, 6, 0] } : {}}
              transition={{ duration: 0.4 }}
              onPointerDown={(e) => { e.preventDefault(); handleChoice(choice); }}
              style={{ padding: "16px 8px", borderRadius: 20, background: bg, border, color: textColor, fontSize: 24, fontWeight: 700, fontFamily: "Fredoka, sans-serif", cursor: feedback ? "default" : "pointer", boxShadow: shadow, transition: "background 0.2s, border 0.2s", minHeight: 64, touchAction: "manipulation" }}
            >
              {choice.word}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {feedback === "correct" && (
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} style={{ fontSize: 52 }}>🎉</motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}