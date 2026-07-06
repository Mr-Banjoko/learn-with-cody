/**
 * CampaignWordToAudioRound — matches the standalone "Word to Audio Match" game
 * in the Test Zone: speaker tiles on the left, word labels on the right.
 * The child taps a speaker to hear the word, then taps the matching word label.
 * Round completes once all pairs are matched.
 */
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playAudio } from "../../lib/useAudio";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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

const PAIR_COLORS = ["#4ECDC4", "#C77DFF", "#FFD93D", "#FF9F43"];

function buildRound(words) {
  const leftItems = shuffle(words).map((w, i) => ({ ...w, id: `left-${i}-${w.word}` }));
  let rightOrder = shuffle(words);
  let attempts = 0;
  while (attempts < 20 && rightOrder.some((w, i) => w.word === leftItems[i].word)) {
    rightOrder = shuffle(words);
    attempts++;
  }
  const rightItems = rightOrder.map((w, i) => ({ ...w, id: `right-${i}-${w.word}` }));
  return { leftItems, rightItems };
}

export default function CampaignWordToAudioRound({ card, overrideChoices, onComplete, onMistake, lang = "en" }) {
  const words = overrideChoices || [card];
  const [round] = useState(() => buildRound(words));
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [wrongFlash, setWrongFlash] = useState(false);

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
      if (newMatched.length === words.length) {
        setTimeout(() => onComplete(), 700);
      }
    } else {
      onMistake && onMistake();
      setWrongFlash(true);
      setTimeout(() => {
        setWrongFlash(false);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 500);
    }
  }, [selectedLeft, selectedRight]); // eslint-disable-line

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
    <div style={{ flex: 1, display: "flex", flexDirection: "column", fontFamily: "Fredoka, sans-serif", overflow: "hidden" }}>
      <div style={{ flexShrink: 0, textAlign: "center", padding: "10px 24px 4px" }}>
        <p style={{ fontSize: 15, color: "#7BACC8", margin: 0, fontWeight: 600 }}>
          {lang === "zh" ? "点击喇叭，然后配对单词" : "Tap a speaker, then match the word"}
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key="round"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 18, padding: "8px 20px calc(28px + env(safe-area-inset-bottom, 0px))", minHeight: 0 }}
        >
          {round.leftItems.map((leftItem, rowIdx) => {
            const rightItem = round.rightItems[rowIdx];
            const isLeftMatched = matchedPairs.includes(leftItem.word);
            const isRightMatched = matchedPairs.includes(rightItem.word);
            const isLeftSelected = selectedLeft === leftItem.id;
            const isRightSelected = selectedRight === rightItem.id;
            const matchColor = getMatchColor(leftItem.word);
            const rightMatchColor = getMatchColor(rightItem.word);

            return (
              <div key={rowIdx} style={{ display: "flex", gap: 16, alignItems: "stretch" }}>
                <motion.button
                  onClick={() => handleLeftTap(leftItem)}
                  whileTap={!isLeftMatched ? { scale: 0.93 } : {}}
                  animate={wrongFlash && isLeftSelected ? { x: [0, -7, 7, -5, 5, 0] } : { x: 0 }}
                  transition={{ duration: 0.38 }}
                  style={{
                    flex: 1, height: 96, borderRadius: 22,
                    border: isLeftMatched ? `3px solid ${matchColor}` : isLeftSelected ? "3.5px solid #4ECDC4" : "2.5px solid rgba(168,208,230,0.35)",
                    background: isLeftMatched ? `${matchColor}18` : isLeftSelected ? "rgba(78,205,196,0.12)" : "white",
                    boxShadow: isLeftMatched ? `0 4px 18px ${matchColor}44` : isLeftSelected ? "0 6px 24px rgba(78,205,196,0.28), 0 0 0 5px rgba(78,205,196,0.14)" : "0 4px 16px rgba(30,58,95,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: isLeftMatched ? "default" : "pointer",
                    opacity: isLeftMatched ? 0.52 : 1,
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  {isLeftMatched ? <span style={{ fontSize: 30 }}>✓</span> : <SpeakerIcon color={isLeftSelected ? "#4ECDC4" : "#A8D0E6"} size={34} />}
                </motion.button>

                <motion.button
                  onClick={() => handleRightTap(rightItem)}
                  whileTap={!isRightMatched ? { scale: 0.96 } : {}}
                  animate={wrongFlash && isRightSelected ? { x: [0, -7, 7, -5, 5, 0] } : { x: 0 }}
                  transition={{ duration: 0.38 }}
                  style={{
                    flex: 1, height: 96, borderRadius: 22,
                    border: isRightMatched ? `3px solid ${rightMatchColor}` : isRightSelected ? "3.5px solid #4D96FF" : "2.5px solid rgba(168,208,230,0.35)",
                    background: isRightMatched ? `${rightMatchColor}18` : isRightSelected ? "rgba(77,150,255,0.1)" : "white",
                    boxShadow: isRightMatched ? `0 4px 18px ${rightMatchColor}44` : isRightSelected ? "0 6px 24px rgba(77,150,255,0.28), 0 0 0 5px rgba(77,150,255,0.12)" : "0 4px 16px rgba(30,58,95,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: isRightMatched ? "default" : "pointer",
                    opacity: isRightMatched ? 0.52 : 1,
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <span style={{ fontSize: 30, fontWeight: 700, color: isRightMatched ? rightMatchColor : isRightSelected ? "#4D96FF" : "#1E3A5F", fontFamily: "Fredoka, sans-serif", letterSpacing: "-0.5px" }}>
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