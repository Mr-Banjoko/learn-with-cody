import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackArrow from "../BackArrow";
import { playAudio } from "../../lib/useAudio";
import { shortAWords } from "../../lib/shortAWords";
import { shortEWords } from "../../lib/shortEWords";
import { shortIWords } from "../../lib/shortIWords";
import { shortOWords } from "../../lib/shortOWords";
import { shortUWords } from "../../lib/shortUWords";
import { tx } from "../../lib/i18n";

const ALL_WORDS = [
  ...shortAWords,
  ...shortEWords,
  ...shortIWords,
  ...shortOWords,
  ...shortUWords,
];

// Shuffle array in place (Fisher-Yates)
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build a round: pick 3 unique words, shuffle right column so they never align positionally with left
function buildRound(usedWords = []) {
  const pool = ALL_WORDS.filter((w) => !usedWords.includes(w.word));
  const source = pool.length >= 3 ? pool : ALL_WORDS;
  const picked = shuffle(source).slice(0, 3);

  // Left column: speaker items (shuffled order)
  const leftItems = shuffle(picked).map((w, i) => ({ ...w, id: `left-${i}-${w.word}` }));

  // Right column: word labels — must be a different permutation from left
  let rightOrder = shuffle(picked);
  // Guarantee no same-position match between left and right columns
  let attempts = 0;
  while (attempts < 20 && rightOrder.some((w, i) => w.word === leftItems[i].word)) {
    rightOrder = shuffle(picked);
    attempts++;
  }
  const rightItems = rightOrder.map((w, i) => ({ ...w, id: `right-${i}-${w.word}` }));

  return { leftItems, rightItems, picked };
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

const PAIR_COLORS = ["#4ECDC4", "#C77DFF", "#FFD93D"];

export default function WordToAudioMatch({ onBack, lang = "en", onRoundComplete, hideBackArrow }) {
  const [round, setRound] = useState(() => buildRound());
  const [usedWords, setUsedWords] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);   // word id of selected speaker
  const [selectedRight, setSelectedRight] = useState(null); // word id of selected word label
  const [matchedPairs, setMatchedPairs] = useState([]);     // array of matched word strings
  const [wrongFlash, setWrongFlash] = useState(false);
  const wrongTimeout = useRef(null);
  const advanceTimeout = useRef(null);
  const wrongAttempts = useRef(0);

  // Clean up timeouts on unmount
  useEffect(() => () => {
    clearTimeout(wrongTimeout.current);
    clearTimeout(advanceTimeout.current);
  }, []);

  // When both left and right are selected, check match
  useEffect(() => {
    if (!selectedLeft || !selectedRight) return;

    const leftWord = round.leftItems.find((it) => it.id === selectedLeft)?.word;
    const rightWord = round.rightItems.find((it) => it.id === selectedRight)?.word;

    if (leftWord && rightWord) {
      if (leftWord === rightWord) {
        // Correct match
        const newMatched = [...matchedPairs, leftWord];
        setMatchedPairs(newMatched);
        setSelectedLeft(null);
        setSelectedRight(null);

        // Play audio on correct match
        const wordObj = round.leftItems.find((it) => it.word === leftWord);
        if (wordObj?.audio) playAudio(wordObj.audio);

        // Auto-advance when all 3 matched
        if (newMatched.length === 3) {
          advanceTimeout.current = setTimeout(() => {
            const nextUsed = [...usedWords, ...round.picked.map((w) => w.word)].slice(-30);
            if (onRoundComplete) onRoundComplete(Math.max(0, 3 - wrongAttempts.current));
            wrongAttempts.current = 0;
            setUsedWords(nextUsed);
            setRound(buildRound(nextUsed));
            setMatchedPairs([]);
            setSelectedLeft(null);
            setSelectedRight(null);
          }, 900);
        }
      } else {
        // Wrong match — gentle flash and reset
        wrongAttempts.current++;
        clearTimeout(wrongTimeout.current);
        setWrongFlash(true);
        wrongTimeout.current = setTimeout(() => {
          setWrongFlash(false);
          setSelectedLeft(null);
          setSelectedRight(null);
        }, 500);
      }
    }
  }, [selectedLeft, selectedRight]);

  const handleLeftTap = useCallback((item) => {
    const isMatched = matchedPairs.includes(item.word);
    if (isMatched) return;
    // Play audio immediately on tap
    if (item.audio) playAudio(item.audio);
    setSelectedLeft((prev) => (prev === item.id ? null : item.id));
    setSelectedRight(null);
  }, [matchedPairs]);

  const handleRightTap = useCallback((item) => {
    const isMatched = matchedPairs.includes(item.word);
    if (isMatched) return;
    setSelectedRight(item.id);
  }, [matchedPairs]);

  const getLeftState = (item) => {
    if (matchedPairs.includes(item.word)) return "matched";
    if (selectedLeft === item.id) return "selected";
    return "idle";
  };

  const getRightState = (item) => {
    if (matchedPairs.includes(item.word)) return "matched";
    if (selectedRight === item.id) return "selected";
    return "idle";
  };

  // Color index based on position in matched list
  const getMatchColor = (word) => {
    const idx = matchedPairs.indexOf(word);
    return idx >= 0 ? PAIR_COLORS[idx % PAIR_COLORS.length] : null;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: "Fredoka, sans-serif",
        background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Back arrow */}
      {!hideBackArrow && (
        <div style={{ padding: "12px 16px 0", flexShrink: 0 }}>
          <BackArrow onPress={onBack} />
        </div>
      )}

      {/* Title area */}
      <div
        style={{
          flexShrink: 0,
          textAlign: "center",
          padding: "10px 24px 4px",
        }}
      >
        <p style={{ fontSize: 15, color: "#7BACC8", margin: 0, fontWeight: 600 }}>
          {tx("Tap a speaker, then match the word", "audio_match_hint", lang)}
        </p>
      </div>

      {/* Progress dots */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          justifyContent: "center",
          gap: 8,
          padding: "8px 0 4px",
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              background: i < matchedPairs.length ? PAIR_COLORS[i] : "rgba(168,208,230,0.4)",
              scale: i < matchedPairs.length ? 1.2 : 1,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            style={{
              width: 11,
              height: 11,
              borderRadius: 99,
            }}
          />
        ))}
      </div>

      {/* 2-column matching grid — 3 rows */}
      <AnimatePresence mode="wait">
        <motion.div
          key={round.leftItems.map((i) => i.word).join("-")}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 14,
            padding: "8px 20px calc(28px + env(safe-area-inset-bottom, 0px))",
            minHeight: 0,
          }}
        >
          {round.leftItems.map((leftItem, rowIdx) => {
            const rightItem = round.rightItems[rowIdx];
            const leftState = getLeftState(leftItem);
            const rightState = getRightState(rightItem);
            const matchColor = getMatchColor(leftItem.word);
            const rightMatchColor = getMatchColor(rightItem.word);

            return (
              <div
                key={rowIdx}
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Left: Speaker tile */}
                <motion.button
                  onClick={() => handleLeftTap(leftItem)}
                  whileTap={leftState !== "matched" ? { scale: 0.93 } : {}}
                  animate={
                    wrongFlash && selectedLeft === leftItem.id
                      ? { x: [0, -7, 7, -5, 5, 0] }
                      : { x: 0 }
                  }
                  transition={{ duration: 0.38 }}
                  style={{
                    flex: "0 0 96px",
                    height: 96,
                    borderRadius: 22,
                    border:
                      leftState === "matched"
                        ? `3px solid ${matchColor}`
                        : leftState === "selected"
                        ? "3.5px solid #4ECDC4"
                        : "2.5px solid rgba(168,208,230,0.35)",
                    background:
                      leftState === "matched"
                        ? `${matchColor}18`
                        : leftState === "selected"
                        ? "rgba(78,205,196,0.12)"
                        : "white",
                    boxShadow:
                      leftState === "matched"
                        ? `0 4px 18px ${matchColor}44`
                        : leftState === "selected"
                        ? "0 6px 24px rgba(78,205,196,0.28), 0 0 0 5px rgba(78,205,196,0.14)"
                        : "0 4px 16px rgba(30,58,95,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: leftState === "matched" ? "default" : "pointer",
                    opacity: leftState === "matched" ? 0.52 : 1,
                    transition: "border 0.16s, background 0.16s, box-shadow 0.16s, opacity 0.3s",
                    WebkitTapHighlightColor: "transparent",
                    position: "relative",
                  }}
                >
                  {leftState === "matched" ? (
                    <span style={{ fontSize: 28 }}>✓</span>
                  ) : (
                    <SpeakerIcon
                      color={leftState === "selected" ? "#4ECDC4" : "#A8D0E6"}
                      size={32}
                    />
                  )}
                </motion.button>

                {/* Right: Word label tile */}
                <motion.button
                  onClick={() => handleRightTap(rightItem)}
                  whileTap={rightState !== "matched" ? { scale: 0.96 } : {}}
                  animate={
                    wrongFlash && selectedRight === rightItem.id
                      ? { x: [0, -7, 7, -5, 5, 0] }
                      : { x: 0 }
                  }
                  transition={{ duration: 0.38 }}
                  style={{
                    flex: "0 0 96px",
                    width: "100%",
                    maxWidth: "none",
                    height: 96,
                    borderRadius: 22,
                    border:
                      rightState === "matched"
                        ? `3px solid ${rightMatchColor}`
                        : rightState === "selected"
                        ? "3.5px solid #4D96FF"
                        : "2.5px solid rgba(168,208,230,0.35)",
                    background:
                      rightState === "matched"
                        ? `${rightMatchColor}18`
                        : rightState === "selected"
                        ? "rgba(77,150,255,0.1)"
                        : "white",
                    boxShadow:
                      rightState === "matched"
                        ? `0 4px 18px ${rightMatchColor}44`
                        : rightState === "selected"
                        ? "0 6px 24px rgba(77,150,255,0.28), 0 0 0 5px rgba(77,150,255,0.12)"
                        : "0 4px 16px rgba(30,58,95,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: rightState === "matched" ? "default" : "pointer",
                    opacity: rightState === "matched" ? 0.52 : 1,
                    transition: "border 0.16s, background 0.16s, box-shadow 0.16s, opacity 0.3s",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <span
                    style={{
                      fontSize: 34,
                      fontWeight: 700,
                      color:
                        rightState === "matched"
                          ? rightMatchColor
                          : rightState === "selected"
                          ? "#4D96FF"
                          : "#1E3A5F",
                      fontFamily: "Fredoka, sans-serif",
                      letterSpacing: "-0.5px",
                      transition: "color 0.16s",
                    }}
                  >
                    {rightItem.word}
                  </span>
                </motion.button>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}