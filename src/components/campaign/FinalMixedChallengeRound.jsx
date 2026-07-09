/**
 * FinalMixedChallengeRound — multi-step final challenge (Level 88, r10).
 * For each target word: hear the word audio → pick the matching picture →
 * pick the correct written word → pick the correct middle vowel.
 * Wrong taps shake + count a mistake; completing all words fires onComplete.
 */
import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2 } from "lucide-react";
import { playAudio } from "../../lib/useAudio";
import { useCorrectSound } from "../../lib/useCorrectSound";
import { useTryAgainSound } from "../../lib/useTryAgainSound";

const VOWELS = ["a", "e", "i", "o", "u"];
const TILE_COLORS = ["#FFAFC5", "#A8D8EA", "#FFE57A", "#B5EAD7", "#FFDAC1"];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const STAGE_PROMPTS = {
  picture: { en: "Tap the matching picture", zh: "点击正确的图片" },
  word: { en: "Tap the correct word", zh: "点击正确的单词" },
  vowel: { en: "Tap the middle sound", zh: "点击中间的音" },
};

export default function FinalMixedChallengeRound({ cards, onComplete, onMistake, lang = "en" }) {
  const [wordIdx, setWordIdx] = useState(0);
  const [stage, setStage] = useState("picture"); // picture → word → vowel
  const [wrongKey, setWrongKey] = useState(null);
  const [locked, setLocked] = useState(false);
  const { play: playCorrect } = useCorrectSound();
  const { play: playTryAgain } = useTryAgainSound();
  const card = cards[wordIdx];

  useEffect(() => {
    const t = setTimeout(() => playAudio(card.audio), 300);
    return () => clearTimeout(t);
  }, [wordIdx]); // eslint-disable-line

  const pictureChoices = useMemo(
    () => shuffle([card, ...shuffle(cards.filter((c) => c.word !== card.word)).slice(0, 3)]),
    [wordIdx] // eslint-disable-line
  );
  const wordChoices = useMemo(
    () => shuffle([card, ...shuffle(cards.filter((c) => c.word !== card.word)).slice(0, 3)]),
    [wordIdx] // eslint-disable-line
  );

  const handlePick = useCallback((isCorrect, key) => {
    if (locked) return;
    if (!isCorrect) {
      playTryAgain();
      onMistake && onMistake();
      setWrongKey(key);
      setTimeout(() => setWrongKey(null), 600);
      return;
    }
    setLocked(true);
    playCorrect(() => {
      setLocked(false);
      if (stage === "picture") { setStage("word"); return; }
      if (stage === "word") { setStage("vowel"); return; }
      // vowel done — next word or finish
      if (wordIdx + 1 >= cards.length) { setLocked(true); onComplete(); }
      else { setWordIdx(wordIdx + 1); setStage("picture"); }
    });
  }, [locked, stage, wordIdx, cards.length, onComplete, onMistake, playCorrect, playTryAgain]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 16px 24px", gap: 14, overflowY: "auto", fontFamily: "Fredoka, sans-serif" }}>
      {/* Progress dots */}
      <div style={{ display: "flex", gap: 8 }}>
        {cards.map((c, i) => (
          <div key={c.word} style={{ width: 12, height: 12, borderRadius: 6, background: i < wordIdx ? "#4ECDC4" : i === wordIdx ? "#FFD93D" : "rgba(0,0,0,0.12)", transition: "background 0.3s" }} />
        ))}
      </div>

      {/* Speaker */}
      <motion.button
        whileTap={{ scale: 0.88 }}
        onPointerDown={(e) => { e.preventDefault(); playAudio(card.audio); }}
        style={{ width: 84, height: 84, borderRadius: "50%", background: "white", border: "3px solid #A8D8EA", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 22px rgba(74,144,196,0.25)", cursor: "pointer", touchAction: "manipulation", flexShrink: 0 }}
        aria-label="Play word"
      >
        <Volume2 size={42} color="#4A90C4" strokeWidth={2} />
      </motion.button>

      <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1E3A5F" }}>
        {STAGE_PROMPTS[stage][lang === "zh" ? "zh" : "en"]}
      </p>

      <AnimatePresence mode="wait">
        <motion.div key={`${wordIdx}-${stage}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }} style={{ width: "100%", maxWidth: 380 }}>
          {stage === "picture" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {pictureChoices.map((c) => (
                <motion.button
                  key={c.word}
                  animate={wrongKey === `pic-${c.word}` ? { x: [0, -8, 8, -6, 6, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  onPointerDown={(e) => { e.preventDefault(); handlePick(c.word === card.word, `pic-${c.word}`); }}
                  style={{ background: "white", border: wrongKey === `pic-${c.word}` ? "3px solid #FF6B6B" : "3px solid rgba(168,208,230,0.6)", borderRadius: 18, padding: 6, cursor: "pointer", boxShadow: "0 4px 14px rgba(30,58,95,0.10)", touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
                >
                  <img src={c.image} alt="" draggable={false} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 12, display: "block", pointerEvents: "none" }} />
                </motion.button>
              ))}
            </div>
          )}

          {stage === "word" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {wordChoices.map((c, i) => (
                <motion.button
                  key={c.word}
                  animate={wrongKey === `word-${c.word}` ? { x: [0, -8, 8, -6, 6, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  onPointerDown={(e) => { e.preventDefault(); handlePick(c.word === card.word, `word-${c.word}`); }}
                  style={{ background: wrongKey === `word-${c.word}` ? "#FFE1E1" : TILE_COLORS[i % TILE_COLORS.length], border: "none", borderRadius: 18, padding: "20px 0", fontSize: 30, fontWeight: 700, color: "#1E3A5F", fontFamily: "Fredoka, sans-serif", cursor: "pointer", boxShadow: "0 4px 14px rgba(30,58,95,0.12)", touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
                >
                  {c.word}
                </motion.button>
              ))}
            </div>
          )}

          {stage === "vowel" && (
            <div>
              {/* word with hidden middle letter */}
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 18 }}>
                {card.word.split("").map((ch, i) => (
                  <div key={i} style={{ width: 62, height: 62, borderRadius: 14, background: i === 1 ? "rgba(168,208,230,0.25)" : "#A8D8EA", border: i === 1 ? "3px dashed #A8D0E6" : "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700, color: i === 1 ? "#A8D0E6" : "#1E3A5F" }}>
                    {i === 1 ? "?" : ch}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                {VOWELS.map((v, i) => (
                  <motion.button
                    key={v}
                    animate={wrongKey === `vowel-${v}` ? { x: [0, -8, 8, -6, 6, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    onPointerDown={(e) => { e.preventDefault(); handlePick(v === card.word[1], `vowel-${v}`); }}
                    style={{ width: 58, height: 58, borderRadius: 16, background: wrongKey === `vowel-${v}` ? "#FFE1E1" : TILE_COLORS[i], border: "none", fontSize: 28, fontWeight: 700, color: "#1E3A5F", fontFamily: "Fredoka, sans-serif", cursor: "pointer", boxShadow: "0 4px 12px rgba(30,58,95,0.12)", touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
                  >
                    {v}
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}