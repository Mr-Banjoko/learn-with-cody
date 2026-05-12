/**
 * LetterSoundConnectionGame
 *
 * 4-row layout per word:
 *   Row 1 — Word letters (display only, C · A · T)
 *   Row 2 — Top connector dots (one per letter, aligned below each letter)
 *   Row 3 — Bottom connector dots (shuffled order)
 *   Row 4 — Picture slices (each slice = one letter, shuffled, tap to hear letter sound)
 *
 * Connection logic reused from DrawLineBoard.
 * Audio logic reused from FlashcardScreen / useAudio.
 * Win: show full word image + auto-play blend sequence → next word.
 */
import { useState, useRef, useCallback, useLayoutEffect, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackArrow from "../BackArrow";
import { shortASlices } from "../../lib/shortASlices";
import { shortESlices } from "../../lib/shortESlices";
import { shortISlices } from "../../lib/shortISlices";
import { shortOSlices } from "../../lib/shortOSlices";
import { shortUSlices } from "../../lib/shortUSlices";
import { buildWordData } from "../../lib/picSliceGameData";

const SLICES_MAP = {
  "short-a": shortASlices,
  "short-e": shortESlices,
  "short-i": shortISlices,
  "short-o": shortOSlices,
  "short-u": shortUSlices,
};
import { getLetterSoundUrl, getLetterGain } from "../../lib/letterSounds";
import { playAudio, playAudioSequence, warmupAudio } from "../../lib/useAudio";
import RainbowLetterBlock from "../RainbowLetterBlock";



// ── Colours (same as DrawLineBoard) ──────────────────────────────────────────
const CARD_COLORS = ["#7EC8E3", "#F4A7C3", "#B39DDB"];
const LETTER_COLORS = ["#FFAFC5", "#A8D8EA", "#FFE57A"];

// ── Shuffle ───────────────────────────────────────────────────────────────────
function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build a shuffled bottom order (indices 0-2) guaranteed not all aligned with top
function buildShuffledOrder() {
  let order = shuffleArr([0, 1, 2]);
  let tries = 0;
  while (tries < 20 && order.every((v, i) => v === i)) {
    order = shuffleArr([0, 1, 2]);
    tries++;
  }
  return order;
}

// ── SVG Lines layer ───────────────────────────────────────────────────────────
function LinesLayer({ matches, connectorRects, containerRect }) {
  if (!containerRect) return null;
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 5, overflow: "visible" }}>
      {matches.map((m, i) => {
        const topR = connectorRects[`top-${m.topIdx}`];
        const botR = connectorRects[`bot-${m.botIdx}`];
        if (!topR || !botR) return null;
        const x1 = topR.left + topR.width / 2 - containerRect.left;
        const y1 = topR.top + topR.height / 2 - containerRect.top;
        const x2 = botR.left + botR.width / 2 - containerRect.left;
        const y2 = botR.top + botR.height / 2 - containerRect.top;
        return (
          <motion.line key={m.topIdx} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={CARD_COLORS[m.topIdx % CARD_COLORS.length]}
            strokeWidth={4} strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
        );
      })}
    </svg>
  );
}

// ── ConnectorDot (same style as DrawLineBoard) ────────────────────────────────
function ConnectorDot({ dotRef, selected, matched, wrong, onTap, color }) {
  return (
    <div
      ref={dotRef}
      onClick={onTap}
      style={{
        width: 28, height: 28, borderRadius: "50%",
        border: wrong ? "3px solid #FF6B6B" : matched ? `3px solid ${color}` : selected ? `3px solid #4A90C4` : "3px solid #CBD5E1",
        background: wrong ? "#FFECEC" : matched ? color : selected ? "#4A90C4" : "white",
        boxShadow: (selected || matched) ? `0 0 0 4px ${color}44` : wrong ? "0 0 0 4px rgba(255,107,107,0.25)" : "0 2px 6px rgba(0,0,0,0.10)",
        cursor: matched ? "default" : "pointer",
        transition: "background 0.18s, border 0.18s",
        flexShrink: 0,
      }}
    />
  );
}

// ── Win Screen ─────────────────────────────────────────────────────────────────
function WinScreen({ card, onDone }) {
  const seqRef = useRef(null);
  const [activeLetterIndex, setActiveLetterIndex] = useState(null);

  useEffect(() => {
    const letters = card.word.split("");
    const steps = letters.map((letter, i) => {
      const url = getLetterSoundUrl(letter);
      return url ? { url, gain: getLetterGain(letter), onStart: () => setActiveLetterIndex(i) } : null;
    }).filter(Boolean);
    const wordAudio = card.audio;
    if (wordAudio) steps.push({ url: wordAudio, onStart: () => setActiveLetterIndex(null) });

    const t = setTimeout(() => {
      seqRef.current = playAudioSequence(steps, () => {
        seqRef.current = null;
        setActiveLetterIndex(null);
        setTimeout(onDone, 600);
      });
    }, 400);

    return () => {
      clearTimeout(t);
      if (seqRef.current) { seqRef.current(); seqRef.current = null; }
    };
  }, [card]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 24px", gap: 20 }}
    >
      {/* Full word image — static */}
      <div style={{ background: "white", borderRadius: 28, padding: 16, boxShadow: "0 12px 48px rgba(30,58,95,0.18)", width: "min(364px, calc(100vw - 48px))" }}>
        <img src={card.fullImage || card.image} alt={card.word} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 18, display: "block" }} />
      </div>

      {/* Letters — bounce one by one as sound plays */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {card.word.split("").map((letter, i) => (
          <RainbowLetterBlock key={i} letter={letter} index={i} isActive={activeLetterIndex === i} />
        ))}
      </div>
    </motion.div>
  );
}

// ── Main round component ──────────────────────────────────────────────────────
function ConnectionRound({ card, onComplete }) {
  const letters = card.word.split(""); // e.g. ['c','a','t']
  // shuffledOrder[botSlot] = letterIndex (which letter belongs at this bottom slot)
  const [shuffledOrder] = useState(() => buildShuffledOrder());
  // Build a stable shuffled mapping of botSlot → original phoneme index
  // card.phonemes[i].sliceSrc gives the correct slice image for letter i

  // selected: "top-N" | "bot-N" | null
  const [selected, setSelected] = useState(null);
  // matches: [{topIdx, botIdx}] — topIdx = letter index, botIdx = shuffled slot
  const [matches, setMatches] = useState([]);
  const [wrongFeedback, setWrongFeedback] = useState(null); // {topIdx, botIdx}
  const [locked, setLocked] = useState(false);
  const [won, setWon] = useState(false);

  const connectorRefs = useRef({});
  const [connectorRects, setConnectorRects] = useState({});
  const containerRef = useRef(null);
  const [containerRect, setContainerRect] = useState(null);

  const matchedTopIdxs = new Set(matches.map((m) => m.topIdx));
  const matchedBotIdxs = new Set(matches.map((m) => m.botIdx));

  const measureAll = useCallback(() => {
    const rects = {};
    for (const [key, el] of Object.entries(connectorRefs.current)) {
      if (el) rects[key] = el.getBoundingClientRect();
    }
    setConnectorRects(rects);
    if (containerRef.current) setContainerRect(containerRef.current.getBoundingClientRect());
  }, []);

  useLayoutEffect(() => { measureAll(); }, [matches, measureAll]);
  useEffect(() => {
    window.addEventListener("resize", measureAll);
    return () => window.removeEventListener("resize", measureAll);
  }, [measureAll]);

  const setRef = (key) => (el) => { connectorRefs.current[key] = el; };

  const triggerWrong = useCallback((topIdx, botIdx) => {
    setWrongFeedback({ topIdx, botIdx });
    setTimeout(() => { setWrongFeedback(null); setSelected(null); }, 700);
  }, []);

  const triggerMatch = useCallback((topIdx, botIdx) => {
    setSelected(null);
    setLocked(true);
    const letter = letters[topIdx];
    const letterUrl = getLetterSoundUrl(letter);
    if (letterUrl) playAudio(letterUrl, getLetterGain(letter));

    const newMatches = [...matches, { topIdx, botIdx }];
    setMatches(newMatches);

    setTimeout(() => {
      setLocked(false);
      if (newMatches.length === 3) {
        setWon(true);
        setTimeout(onComplete, 200);
      }
    }, 800);
  }, [matches, letters, onComplete]);

  const handleTopDot = useCallback((topIdx) => {
    if (locked || matchedTopIdxs.has(topIdx)) return;
    if (selected === null) { setSelected(`top-${topIdx}`); return; }
    if (selected.startsWith("top-")) { setSelected(`top-${topIdx}`); return; }
    // selected is a bot
    const botIdx = parseInt(selected.replace("bot-", ""), 10);
    // botIdx slot → which letter it belongs to
    const correctLetterIdx = shuffledOrder[botIdx];
    if (correctLetterIdx === topIdx) {
      triggerMatch(topIdx, botIdx);
    } else {
      triggerWrong(topIdx, botIdx);
    }
  }, [locked, selected, matchedTopIdxs, shuffledOrder, triggerMatch, triggerWrong]);

  const handleBotDot = useCallback((botIdx) => {
    if (locked || matchedBotIdxs.has(botIdx)) return;
    if (selected === null) { setSelected(`bot-${botIdx}`); return; }
    if (selected.startsWith("bot-")) { setSelected(`bot-${botIdx}`); return; }
    // selected is a top
    const topIdx = parseInt(selected.replace("top-", ""), 10);
    const correctLetterIdx = shuffledOrder[botIdx];
    if (correctLetterIdx === topIdx) {
      triggerMatch(topIdx, botIdx);
    } else {
      triggerWrong(topIdx, botIdx);
    }
  }, [locked, selected, matchedBotIdxs, shuffledOrder, triggerMatch, triggerWrong]);

  const handleSliceTap = useCallback((botIdx) => {
    // botIdx slot → letter index
    const letterIdx = shuffledOrder[botIdx];
    const letter = letters[letterIdx];
    const url = getLetterSoundUrl(letter);
    if (url) playAudio(url, getLetterGain(letter));
  }, [shuffledOrder, letters]);

  if (won) return null;

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", padding: "8px 16px 16px", minHeight: 0, userSelect: "none" }}
    >
      <LinesLayer matches={matches} connectorRects={connectorRects} containerRect={containerRect} />

      {/* ── ROW 1: Letters ── */}
      <div style={{ display: "flex", justifyContent: "center", gap: 12, width: "100%", zIndex: 10, transform: "translateY(20px)" }}>
        {letters.map((letter, i) => (
          <div key={i} style={{ flex: 1, maxWidth: 100, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            {/* Letter tile */}
            <div style={{ width: "100%", height: "min(80px, 22vw)", borderRadius: 20, background: LETTER_COLORS[i], display: "flex", alignItems: "center", justifyContent: "center", fontSize: "min(44px, 12vw)", fontWeight: 700, color: "#1E3A5F", boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}>
              {letter}
            </div>

            {/* ── ROW 2: Top connector dot ── */}
            <ConnectorDot
              dotRef={setRef(`top-${i}`)}
              selected={selected === `top-${i}`}
              matched={matchedTopIdxs.has(i)}
              wrong={wrongFeedback?.topIdx === i}
              onTap={() => handleTopDot(i)}
              color={CARD_COLORS[i]}
            />
          </div>
        ))}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1, minHeight: 16 }} />

      {/* ── ROW 3 + ROW 4: Bottom dots + slices (shuffled) ── */}
      <div style={{ display: "flex", justifyContent: "center", gap: 12, width: "100%", zIndex: 10, transform: "translateY(-25%)" }}>
        {[0, 1, 2].map((botSlot) => {
          const letterIdx = shuffledOrder[botSlot]; // which letter this slot represents
          const isMatched = matchedBotIdxs.has(botSlot);
          const isSelectedBot = selected === `bot-${botSlot}`;
          const isWrongBot = wrongFeedback?.botIdx === botSlot;
          // Find match color: same color as the top letter this was matched with
          const matchedTopIdx = isMatched ? matches.find((m) => m.botIdx === botSlot)?.topIdx : null;
          const dotColor = matchedTopIdx != null ? CARD_COLORS[matchedTopIdx] : CARD_COLORS[letterIdx];

          return (
            <div key={botSlot} style={{ flex: 1, maxWidth: 100, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              {/* Row 3 — Bottom connector dot */}
              <ConnectorDot
                dotRef={setRef(`bot-${botSlot}`)}
                selected={isSelectedBot}
                matched={isMatched}
                wrong={isWrongBot}
                onTap={() => handleBotDot(botSlot)}
                color={dotColor}
              />

              {/* Row 4 — Picture slice (tap to hear letter sound) */}
              <motion.div
                animate={isWrongBot ? { x: [0, -8, 8, -6, 6, 0] } : {}}
                transition={{ duration: 0.4 }}
                onPointerDown={(e) => { e.preventDefault(); handleSliceTap(botSlot); }}
                style={{
                  width: "100%",
                  aspectRatio: "1/2",
                  borderRadius: 18,
                  overflow: "hidden",
                  border: isMatched ? `2.5px solid ${dotColor}` : isWrongBot ? "2.5px solid #FF6B6B" : "2.5px solid rgba(168,208,230,0.5)",
                  boxShadow: isMatched ? `0 0 0 4px ${dotColor}44` : isWrongBot ? "0 0 0 4px rgba(255,107,107,0.2)" : "0 4px 14px rgba(0,0,0,0.09)",
                  cursor: "pointer",
                  background: "#f8f8f8",
                  transition: "border 0.18s, box-shadow 0.18s",
                  WebkitTapHighlightColor: "transparent",
                  position: "relative",
                  touchAction: "manipulation",
                }}
              >
                <img
                  src={card.phonemes?.[letterIdx]?.sliceSrc || ""}
                  alt={letters[letterIdx]}
                  draggable={false}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                />
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Level shell ───────────────────────────────────────────────────────────────
export default function LetterSoundConnectionGame({ group, onBack, lang = "en" }) {
  const slices = SLICES_MAP[group.id] || shortASlices;
  const words = slices.map((s) => buildWordData(s.word));
  const [wordIndex, setWordIndex] = useState(0);
  const [showWin, setShowWin] = useState(false);
  const [roundKey, setRoundKey] = useState(0);

  const card = words[wordIndex];

  // Preload audio assets
  useEffect(() => {
    const letterSet = new Set(words.flatMap((w) => w.word.split("")));
    const letterUrls = [...letterSet].map(getLetterSoundUrl).filter(Boolean);
    warmupAudio([...letterUrls, ...words.map((w) => w.audio).filter(Boolean)]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRoundComplete = useCallback(() => {
    setShowWin(true);
  }, []);

  const handleWinDone = useCallback(() => {
    setShowWin(false);
    const next = wordIndex + 1;
    if (next < words.length) {
      setWordIndex(next);
      setRoundKey((k) => k + 1);
    } else {
      // All words done — loop back
      setWordIndex(0);
      setRoundKey((k) => k + 1);
    }
  }, [wordIndex, words.length]);

  const progressPct = ((wordIndex) / words.length) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Fredoka, sans-serif", background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4, padding: "calc(env(safe-area-inset-top, 0px) + 8px) 16px 8px", borderBottom: "1.5px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.75)", backdropFilter: "blur(10px)" }}>
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1E293B" }}>
            {lang === "zh" ? `字母音连线 · ${group.label}` : `Letter to Sound · ${group.label}`}
          </p>
        </div>
        <span style={{ fontSize: 15, fontWeight: 600, color: "#94A3B8" }}>{wordIndex + 1}/{words.length}</span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, background: "rgba(0,0,0,0.06)", flexShrink: 0 }}>
        <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #4ECDC4, #4D96FF)" }} />
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {showWin ? (
          <motion.div key="win" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <WinScreen card={card} onDone={handleWinDone} />
          </motion.div>
        ) : (
          <motion.div key={`round-${roundKey}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <ConnectionRound key={roundKey} card={card} onComplete={handleRoundComplete} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}