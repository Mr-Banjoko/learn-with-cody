/**
 * CampaignWordToAudioRound — fixed-word Word-to-Audio match round for campaign levels.
 * Accepts exactly 3 word strings (first = target, rest = distractors).
 * Calls onComplete() when all 3 pairs are matched, onMistake() on each wrong attempt.
 * Audio auto-plays the first speaker at mount; UI locked until then.
 */
import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playAudio } from "../../lib/useAudio";
import { useTryAgainSound } from "../../lib/useTryAgainSound";
import { useCorrectSound } from "../../lib/useCorrectSound";
import { shortAWords } from "../../lib/shortAWords";
import { shortEWords } from "../../lib/shortEWords";
import { shortIWords } from "../../lib/shortIWords";
import { shortOWords } from "../../lib/shortOWords";
import { shortUWords } from "../../lib/shortUWords";

const ALL_WORDS = [...shortAWords, ...shortEWords, ...shortIWords, ...shortOWords, ...shortUWords];

const RAINBOW_BORDER = "linear-gradient(white, white) padding-box, linear-gradient(135deg, #FF6B6B, #FFD93D, #4ECDC4, #9B59B6) border-box";

function findCard(word) {
  return ALL_WORDS.find((w) => w.word === word) || { word, audio: null, image: null };
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function SpeakerIcon({ color = "#4ECDC4", size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <path d="M18 21h-4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4l8 6V15l-8 6z" fill={color} />
      <path d="M30 20.5a8 8 0 0 1 0 11" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M33.5 17a13 13 0 0 1 0 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
    </svg>
  );
}

export default function CampaignWordToAudioRound({ words, onComplete, onMistake, lang = "en" }) {
  // words = [targetWord, distractor1, distractor2]
  const cards = words.map(findCard);

  const [leftItems] = useState(() => {
    const picked = shuffle(cards).map((w, i) => ({ ...w, id: `left-${i}-${w.word}` }));
    return picked;
  });
  const [rightItems] = useState(() => {
    let rightOrder = shuffle(cards);
    let attempts = 0;
    while (attempts < 20 && rightOrder.some((w, i) => w.word === leftItems[i]?.word)) {
      rightOrder = shuffle(cards);
      attempts++;
    }
    return rightOrder.map((w, i) => ({ ...w, id: `right-${i}-${w.word}` }));
  });

  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [completing, setCompleting] = useState(false);
  const wrongTimeout = useRef(null);
  const advanceTimeout = useRef(null);
  const processingRef = useRef(false);
  const { play: playTryAgain } = useTryAgainSound();
  const { play: playCorrect } = useCorrectSound();

  useEffect(() => {
    return () => { clearTimeout(wrongTimeout.current); clearTimeout(advanceTimeout.current); };
  }, []);

  // Check match when both selected
  useEffect(() => {
    if (!selectedLeft || !selectedRight) return;
    if (processingRef.current) return;
    processingRef.current = true;

    const leftWord = leftItems.find((it) => it.id === selectedLeft)?.word;
    const rightWord = rightItems.find((it) => it.id === selectedRight)?.word;
    if (leftWord && rightWord) {
      if (leftWord === rightWord) {
        const newMatched = [...matchedPairs, leftWord];
        setMatchedPairs(newMatched);
        setSelectedLeft(null);
        setSelectedRight(null);
        processingRef.current = false;
        playCorrect();
        if (newMatched.length === 3) {
          setCompleting(true);
          advanceTimeout.current = setTimeout(() => onComplete(), 900);
        }
      } else {
        playTryAgain();
        onMistake && onMistake();
        clearTimeout(wrongTimeout.current);
        setWrongFlash(true);
        wrongTimeout.current = setTimeout(() => {
          setWrongFlash(false);
          setSelectedLeft(null);
          setSelectedRight(null);
          processingRef.current = false;
        }, 600);
      }
    } else {
      processingRef.current = false;
    }
  }, [selectedLeft, selectedRight]); // eslint-disable-line

  const handleLeftTap = useCallback((item) => {
    if (completing || matchedPairs.includes(item.word) || processingRef.current) return;
    if (item.audio) playAudio(item.audio);
    setSelectedLeft((prev) => (prev === item.id ? null : item.id));
    setSelectedRight(null);
  }, [completing, matchedPairs]);

  const handleRightTap = useCallback((item) => {
    if (completing || matchedPairs.includes(item.word) || processingRef.current) return;
    setSelectedRight(item.id);
  }, [completing, matchedPairs]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", fontFamily: "Fredoka, sans-serif", overflow: "hidden", position: "relative" }}>
      {completing && <div style={{ position: "absolute", inset: 0, zIndex: 100, touchAction: "none", pointerEvents: "all" }} />}

      {/* Progress dots */}
      <div style={{ flexShrink: 0, display: "flex", justifyContent: "center", gap: 8, padding: "8px 0 4px" }}>
        {[0, 1, 2].map((i) => (
          <motion.div key={i}
            animate={{ background: i < matchedPairs.length ? "#A8D0E6" : "rgba(168,208,230,0.35)", scale: i < matchedPairs.length ? 1.2 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            style={{ width: 11, height: 11, borderRadius: 99 }}
          />
        ))}
      </div>

      {/* 2-column grid */}
      <AnimatePresence mode="wait">
        <motion.div key={leftItems.map((i) => i.word).join("-")}
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 18, padding: "8px 20px 28px", minHeight: 0 }}
        >
          {leftItems.map((leftItem, rowIdx) => {
            const rightItem = rightItems[rowIdx];
            const leftMatched = matchedPairs.includes(leftItem.word);
            const rightMatched = matchedPairs.includes(rightItem.word);
            const leftSelected = !leftMatched && selectedLeft === leftItem.id;
            const rightSelected = !rightMatched && selectedRight === rightItem.id;

            // Speaker button style
            const leftBg = leftSelected ? RAINBOW_BORDER : "white";
            const leftBorder = leftSelected ? "4px solid transparent" : leftMatched ? "2.5px solid rgba(168,208,230,0.3)" : "2.5px solid rgba(168,208,230,0.35)";
            const leftShadow = leftSelected ? "0 6px 28px rgba(155,89,182,0.22), 0 4px 16px rgba(78,205,196,0.22)" : "0 4px 16px rgba(30,58,95,0.08)";

            // Word button style
            const rightBg = rightMatched ? "white" : rightSelected ? RAINBOW_BORDER : "white";
            const rightBorder = rightMatched ? "2.5px solid rgba(168,208,230,0.3)" : rightSelected ? "4px solid transparent" : "2.5px solid rgba(168,208,230,0.35)";
            const rightShadow = rightSelected ? "0 6px 28px rgba(155,89,182,0.22), 0 4px 16px rgba(78,205,196,0.22)" : "0 4px 16px rgba(30,58,95,0.08)";

            return (
              <div key={rowIdx} style={{ display: "flex", gap: 16, alignItems: "stretch" }}>
                {/* Left: Speaker */}
                <motion.button onClick={() => handleLeftTap(leftItem)} whileTap={!leftMatched ? { scale: 0.93 } : {}}
                  animate={wrongFlash && selectedLeft === leftItem.id ? { x: [0, -7, 7, -5, 5, 0] } : { x: 0 }}
                  transition={{ duration: 0.38 }}
                  style={{ flex: 1, height: 120, borderRadius: 22, border: leftBorder, background: leftBg, boxShadow: leftShadow, display: "flex", alignItems: "center", justifyContent: "center", cursor: leftMatched ? "default" : "pointer", opacity: leftMatched ? 0.45 : 1, transition: "opacity 0.3s", WebkitTapHighlightColor: "transparent" }}
                >
                  <SpeakerIcon color={leftSelected ? "#9B59B6" : "#A8D0E6"} size={40} />
                </motion.button>

                {/* Right: Word label */}
                <motion.button onClick={() => handleRightTap(rightItem)} whileTap={!rightMatched ? { scale: 0.96 } : {}}
                  animate={wrongFlash && selectedRight === rightItem.id ? { x: [0, -7, 7, -5, 5, 0] } : { x: 0 }}
                  transition={{ duration: 0.38 }}
                  style={{ flex: 1, height: 120, borderRadius: 22, border: rightBorder, background: rightBg, boxShadow: rightShadow, display: "flex", alignItems: "center", justifyContent: "center", cursor: rightMatched ? "default" : "pointer", opacity: rightMatched ? 0.45 : 1, transition: "opacity 0.3s", WebkitTapHighlightColor: "transparent" }}
                >
                  <span style={{ fontSize: 38, fontWeight: 700, color: rightSelected ? "#9B59B6" : "#1E3A5F", fontFamily: "Fredoka, sans-serif", transition: "color 0.16s" }}>
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