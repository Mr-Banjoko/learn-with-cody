/**
 * Level 22 — 4-round Word to Audio Match
 *
 * Round order (fixed word sets):
 *  1. gap, tax, can
 *  2. wax, cat, sad
 *  3. tan, dad, jar
 *  4. dam, hat, bag
 */
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackArrow from "../BackArrow";
import Level22Complete from "./Level22Complete";
import { shortAWords } from "../../lib/shortAWords";
import { playAudio } from "../../lib/useAudio";

// ── Fixed round word sets ────────────────────────────────────────────────────
const findWord = (w) => shortAWords.find((x) => x.word === w);

const ROUND_WORDS = [
  ["gap", "tax", "can"],   // R1
  ["wax", "cat", "sad"],   // R2
  ["tan", "dad", "jar"],   // R3
  ["dam", "hat", "bag"],   // R4
];

const TOTAL_ROUNDS = ROUND_WORDS.length;
const PAIR_COLORS = ["#4ECDC4", "#C77DFF", "#FFD93D"];

function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildRound(wordNames) {
  const picked = wordNames.map(findWord).filter(Boolean);
  // Left column: randomised speaker order
  const leftItems = shuffleArr(picked).map((w, i) => ({ ...w, id: `left-${i}-${w.word}` }));
  // Right column: different permutation to avoid same-position alignment
  let rightOrder = shuffleArr(picked);
  let attempts = 0;
  while (attempts < 20 && rightOrder.some((w, i) => w.word === leftItems[i].word)) {
    rightOrder = shuffleArr(picked);
    attempts++;
  }
  const rightItems = rightOrder.map((w, i) => ({ ...w, id: `right-${i}-${w.word}` }));
  return { leftItems, rightItems };
}

function SpeakerIcon({ color = "#4ECDC4", size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <path d="M18 21h-4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4l8 6V15l-8 6z" fill={color} />
      <path d="M30 20.5a8 8 0 0 1 0 11" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M33.5 17a13 13 0 0 1 0 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
    </svg>
  );
}

// ── Single matching round component ─────────────────────────────────────────
function WordAudioRound({ wordNames, onComplete }) {
  const round = useMemo(() => buildRound(wordNames), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [wrongFlash, setWrongFlash] = useState(false);
  const wrongTimeout = useRef(null);
  const advanceTimeout = useRef(null);

  useEffect(() => () => {
    clearTimeout(wrongTimeout.current);
    clearTimeout(advanceTimeout.current);
  }, []);

  useEffect(() => {
    if (!selectedLeft || !selectedRight) return;
    const leftWord = round.leftItems.find((it) => it.id === selectedLeft)?.word;
    const rightWord = round.rightItems.find((it) => it.id === selectedRight)?.word;
    if (!leftWord || !rightWord) return;

    if (leftWord === rightWord) {
      const newMatched = [...matchedPairs, leftWord];
      setMatchedPairs(newMatched);
      setSelectedLeft(null);
      setSelectedRight(null);
      const wordObj = round.leftItems.find((it) => it.word === leftWord);
      if (wordObj?.audio) playAudio(wordObj.audio);
      if (newMatched.length === 3) {
        advanceTimeout.current = setTimeout(() => onComplete(), 900);
      }
    } else {
      clearTimeout(wrongTimeout.current);
      setWrongFlash(true);
      wrongTimeout.current = setTimeout(() => {
        setWrongFlash(false);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 500);
    }
  }, [selectedLeft, selectedRight]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLeftTap = useCallback((item) => {
    if (matchedPairs.includes(item.word)) return;
    if (item.audio) playAudio(item.audio);
    setSelectedLeft((prev) => (prev === item.id ? null : item.id));
    setSelectedRight(null);
  }, [matchedPairs]);

  const handleRightTap = useCallback((item) => {
    if (matchedPairs.includes(item.word)) return;
    setSelectedRight(item.id);
  }, [matchedPairs]);

  const getMatchColor = (word) => {
    const idx = matchedPairs.indexOf(word);
    return idx >= 0 ? PAIR_COLORS[idx % PAIR_COLORS.length] : null;
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Hint */}
      <div style={{ flexShrink: 0, textAlign: "center", padding: "8px 24px 4px" }}>
        <p style={{ fontSize: 15, color: "#7BACC8", margin: 0, fontWeight: 600 }}>
          Tap a speaker, then match the word
        </p>
      </div>

      {/* Progress dots */}
      <div style={{ flexShrink: 0, display: "flex", justifyContent: "center", gap: 8, padding: "6px 0 4px" }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ background: i < matchedPairs.length ? PAIR_COLORS[i] : "rgba(168,208,230,0.4)", scale: i < matchedPairs.length ? 1.2 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            style={{ width: 11, height: 11, borderRadius: 99 }}
          />
        ))}
      </div>

      {/* 2-column grid */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 16, padding: "8px 20px 28px", minHeight: 0 }}>
        {round.leftItems.map((leftItem, rowIdx) => {
          const rightItem = round.rightItems[rowIdx];
          const leftMatched = matchedPairs.includes(leftItem.word);
          const rightMatched = matchedPairs.includes(rightItem.word);
          const leftSelected = selectedLeft === leftItem.id;
          const rightSelected = selectedRight === rightItem.id;
          const matchColor = getMatchColor(leftItem.word);
          const rightMatchColor = getMatchColor(rightItem.word);

          return (
            <div key={rowIdx} style={{ display: "flex", gap: 16, alignItems: "stretch" }}>
              {/* Speaker tile */}
              <motion.button
                onClick={() => handleLeftTap(leftItem)}
                whileTap={!leftMatched ? { scale: 0.93 } : {}}
                animate={wrongFlash && selectedLeft === leftItem.id ? { x: [0, -7, 7, -5, 5, 0] } : { x: 0 }}
                transition={{ duration: 0.38 }}
                style={{
                  flex: 1, height: 110, borderRadius: 22,
                  border: leftMatched ? `3px solid ${matchColor}` : leftSelected ? "3.5px solid #4ECDC4" : "2.5px solid rgba(168,208,230,0.35)",
                  background: leftMatched ? `${matchColor}18` : leftSelected ? "rgba(78,205,196,0.12)" : "white",
                  boxShadow: leftMatched ? `0 4px 18px ${matchColor}44` : leftSelected ? "0 6px 24px rgba(78,205,196,0.28)" : "0 4px 16px rgba(30,58,95,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: leftMatched ? "default" : "pointer", opacity: leftMatched ? 0.52 : 1,
                  transition: "border 0.16s, background 0.16s, box-shadow 0.16s, opacity 0.3s",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {leftMatched ? <span style={{ fontSize: 32 }}>✓</span> : <SpeakerIcon color={leftSelected ? "#4ECDC4" : "#A8D0E6"} size={38} />}
              </motion.button>

              {/* Word label tile */}
              <motion.button
                onClick={() => handleRightTap(rightItem)}
                whileTap={!rightMatched ? { scale: 0.96 } : {}}
                animate={wrongFlash && selectedRight === rightItem.id ? { x: [0, -7, 7, -5, 5, 0] } : { x: 0 }}
                transition={{ duration: 0.38 }}
                style={{
                  flex: 1, height: 110, borderRadius: 22,
                  border: rightMatched ? `3px solid ${rightMatchColor}` : rightSelected ? "3.5px solid #4D96FF" : "2.5px solid rgba(168,208,230,0.35)",
                  background: rightMatched ? `${rightMatchColor}18` : rightSelected ? "rgba(77,150,255,0.1)" : "white",
                  boxShadow: rightMatched ? `0 4px 18px ${rightMatchColor}44` : rightSelected ? "0 6px 24px rgba(77,150,255,0.28)" : "0 4px 16px rgba(30,58,95,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: rightMatched ? "default" : "pointer", opacity: rightMatched ? 0.52 : 1,
                  transition: "border 0.16s, background 0.16s, box-shadow 0.16s, opacity 0.3s",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <span style={{ fontSize: 36, fontWeight: 700, color: rightMatched ? rightMatchColor : rightSelected ? "#4D96FF" : "#1E3A5F", fontFamily: "Fredoka, sans-serif", transition: "color 0.16s" }}>
                  {rightItem.word}
                </span>
              </motion.button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Persistence ──────────────────────────────────────────────────────────────
function markLevel22Complete() {
  try {
    const data = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
    if (!data["short-a"]) data["short-a"] = {};
    data["short-a"][22] = { completed: true, completedAt: new Date().toISOString() };
    localStorage.setItem("campaign_progress", JSON.stringify(data));
  } catch (_) {}
}

// ── Level 22 shell ───────────────────────────────────────────────────────────
export default function Level22({ onBack, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [done, setDone] = useState(false);

  const advance = useCallback(() => {
    const next = roundIndex + 1;
    if (next >= TOTAL_ROUNDS) {
      markLevel22Complete();
      setDone(true);
    } else {
      setRoundIndex(next);
    }
  }, [roundIndex]);

  const progressPct = (roundIndex / TOTAL_ROUNDS) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4, padding: "calc(env(safe-area-inset-top, 0px) + 8px) 16px 8px", borderBottom: "1.5px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.75)", backdropFilter: "blur(10px)" }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1E293B" }}>
            {lang === "zh" ? "第 22 关" : "Level 22"}
          </p>
        </div>
        <span style={{ fontSize: 13, color: "#64748B", fontWeight: 600, marginRight: 4 }}>{roundIndex + 1}/{TOTAL_ROUNDS}</span>
      </div>

      {/* Progress bar */}
      {!done && (
        <div style={{ height: 6, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
          <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #4ECDC4, #4D96FF)" }} />
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <Level22Complete onBack={onBack} lang={lang} />
          </motion.div>
        ) : (
          <motion.div key={`round-${roundIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <WordAudioRound
              key={`wam-${roundIndex}`}
              wordNames={ROUND_WORDS[roundIndex]}
              onComplete={advance}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}