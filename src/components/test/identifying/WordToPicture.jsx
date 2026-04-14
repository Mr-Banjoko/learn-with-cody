import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackArrow from "../../BackArrow";
import { playAudio } from "../../../lib/useAudio";
import { tx } from "../../../lib/i18n";
import { shortAWords } from "../../../lib/shortAWords";
import { shortEWords } from "../../../lib/shortEWords";
import { shortIWords } from "../../../lib/shortIWords";
import { shortOWords } from "../../../lib/shortOWords";
import { shortUWords } from "../../../lib/shortUWords";

const ALL_WORDS = [
  ...shortAWords,
  ...shortEWords,
  ...shortIWords,
  ...shortOWords,
  ...shortUWords,
].filter((w) => w.image && w.audio);

const CHOICE_COLORS = [
  { border: "#4ECDC4", shadow: "rgba(78,205,196,0.35)", bg: "#E0FAF8" },
  { border: "#FF6B6B", shadow: "rgba(255,107,107,0.35)", bg: "#FFF0F0" },
  { border: "#FFD93D", shadow: "rgba(255,217,61,0.35)", bg: "#FFFDE7" },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildRound(usedWords = new Set()) {
  const pool = ALL_WORDS.filter((w) => !usedWords.has(w.word));
  const source = pool.length >= 3 ? pool : ALL_WORDS;
  const shuffled = shuffle([...source]);
  const target = shuffled[0];
  const distractors = shuffled.slice(1, 3);
  const choices = shuffle([target, ...distractors]);
  return { target, choices };
}

function SpeakerIcon({ color = "#4ECDC4", size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <path d="M18 21h-4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4l8 6V15l-8 6z" fill={color} />
      <path d="M30 20.5a8 8 0 0 1 0 11" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M33.5 17a13 13 0 0 1 0 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
    </svg>
  );
}

export default function WordToPicture({ onBack, lang = "en", onRoundComplete, hideBackArrow }) {
  const [round, setRound] = useState(() => buildRound());
  const [selected, setSelected] = useState(null);
  const [showNext, setShowNext] = useState(false);
  const [wrongShake, setWrongShake] = useState(false);
  const shakeTimeout = useRef(null);
  const wrongAttempts = useRef(0);
  const usedWords = useRef(new Set());
  const autoAdvanceTimer = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => { playAudio(round.target.audio); }, 180);
    return () => clearTimeout(t);
  }, [round.target.audio]);

  useEffect(() => () => {
    clearTimeout(shakeTimeout.current);
    clearTimeout(autoAdvanceTimer.current);
  }, []);

  const handleWordTap = useCallback(() => { playAudio(round.target.audio); }, [round.target.audio]);

  const handleChoiceTap = useCallback((choice) => {
    if (showNext) return;
    setSelected(choice.word);
    if (wrongShake) setWrongShake(false);
  }, [showNext, wrongShake]);

  const handleSubmit = useCallback(() => {
    if (!selected || showNext) return;
    if (selected === round.target.word) {
      setShowNext(true);
      playAudio(round.target.audio);
      autoAdvanceTimer.current = setTimeout(() => {
        const pts = Math.max(0, 2 - wrongAttempts.current);
        if (onRoundComplete) onRoundComplete(pts);
        wrongAttempts.current = 0;
        usedWords.current.add(round.target.word);
        setRound(buildRound(usedWords.current));
        setSelected(null);
        setShowNext(false);
        setWrongShake(false);
      }, 1400);
    } else {
      wrongAttempts.current++;
      clearTimeout(shakeTimeout.current);
      setWrongShake(true);
      shakeTimeout.current = setTimeout(() => setWrongShake(false), 600);
    }
  }, [selected, round, showNext, onRoundComplete]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden", position: "relative" }}>
      {!hideBackArrow && (<div style={{ padding: "12px 16px 0", flexShrink: 0 }}><BackArrow onPress={onBack} /></div>)}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, padding: hideBackArrow ? "20px 24px 8px" : "16px 24px 8px" }}>
        <AnimatePresence mode="wait">
          <motion.div key={round.target.word} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.1, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} style={{ background: "white", borderRadius: 22, padding: "14px 36px", boxShadow: "0 8px 32px rgba(78,205,196,0.18)", border: "3px solid rgba(78,205,196,0.20)", display: "flex", alignItems: "center", justifyContent: "center", minWidth: 160 }}>
            <span style={{ fontSize: 54, fontWeight: 700, color: "#1E3A5F", lineHeight: 1, fontFamily: "Fredoka, sans-serif" }}>{round.target.word}</span>
          </motion.div>
        </AnimatePresence>
        <motion.button onClick={handleWordTap} whileTap={{ scale: 0.88 }} style={{ width: 52, height: 52, borderRadius: 16, background: "white", border: "2.5px solid rgba(78,205,196,0.35)", boxShadow: "0 4px 14px rgba(78,205,196,0.18)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, WebkitTapHighlightColor: "transparent" }}>
          <SpeakerIcon color="#4ECDC4" size={28} />
        </motion.button>
      </div>
      <motion.div animate={wrongShake ? { x: [0, -10, 10, -8, 8, 0] } : { x: 0 }} transition={{ duration: 0.45 }} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-evenly", padding: "4px 24px 8px", minHeight: 0, gap: 10 }}>
        {round.choices.map((choice, idx) => {
          const colorSet = CHOICE_COLORS[idx % CHOICE_COLORS.length];
          const isSelected = selected === choice.word;
          return (
            <motion.button key={`${round.target.word}-${choice.word}-${idx}`} onClick={() => handleChoiceTap(choice)} whileTap={{ scale: 0.96 }} style={{ flex: 1, borderRadius: 22, background: isSelected ? colorSet.bg : "white", border: isSelected ? `3.5px solid ${colorSet.border}` : `3px solid ${colorSet.border}44`, boxShadow: isSelected ? `0 8px 28px ${colorSet.shadow}` : "0 4px 16px rgba(30,58,95,0.08)", cursor: "pointer", padding: isSelected ? 5 : 6, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.18s, border 0.18s", WebkitTapHighlightColor: "transparent", overflow: "hidden", minHeight: 80 }}>
              <img src={choice.image} alt={choice.word} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 16, display: "block", pointerEvents: "none" }} />
            </motion.button>
          );
        })}
      </motion.div>
      <div style={{ flexShrink: 0, display: "flex", justifyContent: "center", padding: "8px 24px calc(24px + env(safe-area-inset-bottom, 0px))" }}>
        <motion.button onClick={handleSubmit} whileTap={selected && !showNext ? { scale: 0.95 } : {}} style={{ background: selected && !showNext ? "linear-gradient(135deg, #4ECDC4, #44A08D)" : "#D1D5DB", color: selected && !showNext ? "white" : "#9CA3AF", border: "none", borderRadius: 999, padding: "16px 64px", fontSize: 22, fontWeight: 700, cursor: selected && !showNext ? "pointer" : "not-allowed", fontFamily: "Fredoka, sans-serif", boxShadow: selected && !showNext ? "0 8px 28px rgba(78,205,196,0.4)" : "none", transition: "background 0.2s", WebkitTapHighlightColor: "transparent", width: "100%", maxWidth: 340 }}>
          Submit ✓
        </motion.button>
      </div>
    </div>
  );
}
