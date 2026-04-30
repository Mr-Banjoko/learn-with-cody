/**
 * Level 27 — 5-round Word Match game
 *
 * Round order:
 *  1. lad  → distractors: lab, lag, lam (similar -ad/-ab/-ag pattern)
 *  2. cab  → distractors: can, cat, cap (same onset c-, short-a)
 *  3. ban  → distractors: can, fan, man (same -an rime)
 *  4. pal  → distractors: pal→ pan, pat, pad (same onset p-, short-a)
 *  5. lab  → distractors: lad, lab→ lap, lam (same onset l-, short-a)
 *
 * Each round shows 1 target image + 4 choices (target + 3 distractors).
 * The WordMatch campaign variant uses a fixed word set per round with
 * similar-looking distractors drawn from shortAWords.
 */
import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2 } from "lucide-react";
import BackArrow from "../BackArrow";
import LevelCompleteScreen from "./LevelCompleteScreen";
import HeartDisplay from "./HeartDisplay";
import { calcStars, saveLevelResult, getScoredRounds } from "../../lib/campaignPerformance";
const LEVEL_NUM = 27;
const SCORED_ROUNDS = getScoredRounds("short-a", LEVEL_NUM);
import { shortAWords } from "../../lib/shortAWords";
import { playAudio } from "../../lib/useAudio";

const findWord = (w) => shortAWords.find((x) => x.word === w);

// Each round: target + exactly 3 distractors (similar spelling)
// Distractor selection rationale:
//   lad  → lab (same l_d→l_b), bag (same -ag suffix close), tap (short-a); we pick lab, lag(not in list so use bag), lad→ use: lab, mad, sad
//   cab  → can, cat, cap — same onset, short-a, one-letter end change
//   ban  → can, fan, man — same -an rime, one-letter onset change
//   pal  → pan, pat, pad — same onset p-, short-a, one-letter end change
//   lab  → lad, lap, mad — same onset l-, short-a or near-identical shape
const ROUND_DEFS = [
  { target: "lad", distractors: ["lab", "mad", "sad"] },   // R1
  { target: "cab", distractors: ["can", "cat", "map"] },   // R2
  { target: "ban", distractors: ["can", "fan", "man"] },   // R3
  { target: "pal", distractors: ["pan", "pat", "bag"] },   // R4
  { target: "lab", distractors: ["lad", "bag", "mad"] },   // R5
];

function buildRound(def) {
  const target = findWord(def.target);
  const distractors = def.distractors.map(findWord).filter(Boolean);
  const choices = [...distractors, target].sort(() => Math.random() - 0.5);
  return { target, choices };
}

function markLevel27Complete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][27] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

function WordMatchRound({ def, onComplete, lang, onMistake }) {
  const [round] = useState(() => buildRound(def));
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const autoPlayedRef = useRef(false);

  useEffect(() => {
    if (!autoPlayedRef.current && round.target.audio) {
      autoPlayedRef.current = true;
      const t = setTimeout(() => playAudio(round.target.audio), 400);
      return () => clearTimeout(t);
    }
  }, [round.target.audio]);

  const handleChoice = useCallback((choice) => {
    if (feedback) return;
    setSelected(choice.word);
    const correct = choice.word === round.target.word;
    setFeedback(correct ? "correct" : "wrong");
    if (correct && round.target.audio) playAudio(round.target.audio);
    if (!correct) { onMistake && onMistake(); }
    setTimeout(() => {
      if (correct) onComplete();
      else { setFeedback(null); setSelected(null); }
    }, correct ? 1200 : 800);
  }, [feedback, round, onComplete]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 16px 20px", gap: 14, overflow: "hidden", minHeight: 0 }}>
      {/* Picture card */}
      <div style={{ background: "white", borderRadius: 24, padding: 12, boxShadow: "0 10px 36px rgba(30,58,95,0.13)", border: "3px solid #A8D0E644", width: "min(260px, calc(100vw - 48px))", flexShrink: 0 }}>
        <img src={round.target.image} alt="" style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 16, display: "block" }} />
        <button onClick={() => round.target.audio && playAudio(round.target.audio)} style={{ marginTop: 8, width: "100%", padding: "8px 0", borderRadius: 14, background: "#A8D0E622", border: "2px solid #A8D0E644", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", fontSize: 15, fontWeight: 700, color: "#1E3A5F", fontFamily: "Fredoka, sans-serif" }}>
          <Volume2 size={18} color="#4A90C4" />
        </button>
      </div>

      {/* 2×2 grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%", maxWidth: "min(320px, calc(100vw - 32px))", flexShrink: 0 }}>
        {round.choices.map((choice) => {
          const isSelected = selected === choice.word;
          const isCorrect = choice.word === round.target.word;
          let bg = "white", border = "2px solid #A8D0E6", textColor = "#1E3A5F", shadow = "0 4px 12px rgba(30,58,95,0.10)";
          if (isSelected && feedback === "correct") { bg = "#E8FFF6"; border = "3px solid #4ECDC4"; shadow = "0 6px 24px rgba(78,205,196,0.35)"; }
          else if (isSelected && feedback === "wrong") { bg = "#FFF0F0"; border = "3px solid #FF6B6B"; textColor = "#FF6B6B"; }
          else if (!isSelected && feedback === "correct" && isCorrect) { bg = "#E8FFF6"; border = "3px solid #4ECDC4"; }
          return (
            <motion.button key={choice.word} whileTap={!feedback ? { scale: 0.93 } : {}} animate={isSelected && feedback === "wrong" ? { x: [0, -8, 8, -6, 6, 0] } : {}} transition={{ duration: 0.4 }} onPointerDown={(e) => { e.preventDefault(); handleChoice(choice); }} style={{ padding: "14px 8px", borderRadius: 18, background: bg, border, color: textColor, fontSize: 22, fontWeight: 700, fontFamily: "Fredoka, sans-serif", cursor: feedback ? "default" : "pointer", boxShadow: shadow, transition: "background 0.2s, border 0.2s", minHeight: 60, touchAction: "manipulation" }}>
              {choice.word}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {feedback === "correct" && (
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} style={{ fontSize: 48 }}>🎉</motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const TOTAL_ROUNDS = ROUND_DEFS.length;

export default function Level27({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const onMistake = useCallback(() => setMistakes((m) => m + 1), []);

  const advance = useCallback(() => {
    const next = roundIndex + 1;
    if (next >= TOTAL_ROUNDS) {
      markLevel27Complete();
      const stars = calcStars(mistakes, SCORED_ROUNDS);
      saveLevelResult("short-a", LEVEL_NUM, stars, mistakes);
      setEarnedStars(stars);
      setDone(true);
    } else setRoundIndex(next);
  }, [roundIndex, mistakes]);

  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4, padding: "calc(env(safe-area-inset-top, 0px) + 8px) 16px 8px", borderBottom: "1.5px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.75)", backdropFilter: "blur(10px)" }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1E293B" }}>{lang === "zh" ? "第 27 关" : "Level 27"}</p>
        </div>
        <HeartDisplay mistakes={mistakes} size={54} />
      </div>

      {!done && (
        <div style={{ height: 6, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
          <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #4ECDC4, #4D96FF)" }} />
        </div>
      )}

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <LevelCompleteScreen levelNum={LEVEL_NUM} stars={earnedStars} mistakes={mistakes} onBack={onBack} lang={lang} />
          </motion.div>
        ) : (
          <motion.div key={`round-${roundIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <WordMatchRound key={roundIndex} def={ROUND_DEFS[roundIndex]} onComplete={advance} lang={lang} onMistake={onMistake} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}