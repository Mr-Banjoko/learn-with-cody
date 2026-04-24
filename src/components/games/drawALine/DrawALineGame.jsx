/**
 * DrawALineGame
 * Manages all rounds internally. Shows 3 words (top) + 3 speaker icons (bottom).
 * Children tap small connector boxes to draw matching lines.
 * Calls onComplete() after all rounds finish.
 */
import { useState, useRef, useLayoutEffect, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playAudio, playAudioSequence } from "../../../lib/useAudio";
import { getLetterSoundUrl, getLetterGain } from "../../../lib/letterSounds";

const PAIR_COLORS = ["#C77DFF", "#4ECDC4", "#FFD93D"];

function SpeakerIcon({ color = "#4ECDC4", size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <path d="M18 21h-4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4l8 6V15l-8 6z" fill={color} />
      <path d="M30 20.5a8 8 0 0 1 0 11" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M33.5 17a13 13 0 0 1 0 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
    </svg>
  );
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildRoundState(rawRound) {
  const top = rawRound.map((entry, i) => ({
    id: i,
    word: entry.word,
    audio: entry.audio,
    targetLetter: entry.targetLetter,
  }));

  let bottom;
  let attempts = 0;
  do {
    bottom = shuffle(
      rawRound.map((entry, i) => ({
        id: i,
        letter: entry.targetLetter,
        soundUrl: getLetterSoundUrl(entry.targetLetter),
        gain: getLetterGain(entry.targetLetter),
      }))
    );
    attempts++;
  } while (attempts < 30 && bottom.some((b, j) => b.id === j));

  return { top, bottom };
}

export default function DrawALineGame({ rounds, onComplete, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [roundState, setRoundState] = useState(() => buildRoundState(rounds[0]));

  const [pendingTop, setPendingTop] = useState(null);
  const [pendingBottom, setPendingBottom] = useState(null);

  // matches: { [topId]: { bottomId, colorIdx } }
  const [matches, setMatches] = useState({});

  // wrongFlash: { topId, bottomId } | null — both sides glow red together
  const [wrongFlash, setWrongFlash] = useState(null);

  // successAnim: topId currently playing its bounce/audio sequence, or null
  const [successAnim, setSuccessAnim] = useState(null);

  // revealedLetters: { [bottomId]: letter } — shown after speaker disappears
  const [revealedLetters, setRevealedLetters] = useState({});

  // locked: true during the success sequence — blocks all interaction
  const [locked, setLocked] = useState(false);

  const topBoxRefs = useRef({});
  const bottomBoxRefs = useRef({});
  const containerRef = useRef(null);
  const [lines, setLines] = useState([]);
  const cancelAudioRef = useRef(null);

  const recalcLines = useCallback(() => {
    if (!containerRef.current) return;
    const cr = containerRef.current.getBoundingClientRect();
    const result = [];
    Object.entries(matches).forEach(([topIdStr, { bottomId, colorIdx }]) => {
      const tEl = topBoxRefs.current[Number(topIdStr)];
      const bEl = bottomBoxRefs.current[bottomId];
      if (!tEl || !bEl) return;
      const tR = tEl.getBoundingClientRect();
      const bR = bEl.getBoundingClientRect();
      result.push({
        x1: tR.left + tR.width / 2 - cr.left,
        y1: tR.bottom - cr.top,
        x2: bR.left + bR.width / 2 - cr.left,
        y2: bR.top - cr.top,
        color: PAIR_COLORS[colorIdx % PAIR_COLORS.length],
      });
    });
    setLines(result);
  }, [matches]);

  useLayoutEffect(() => { recalcLines(); }, [matches, recalcLines]);

  useEffect(() => {
    window.addEventListener("resize", recalcLines);
    return () => window.removeEventListener("resize", recalcLines);
  }, [recalcLines]);

  // Advance to next round or call onComplete
  const advanceRound = useCallback(() => {
    const next = roundIndex + 1;
    if (next >= rounds.length) {
      onComplete && onComplete();
    } else {
      setRoundIndex(next);
      setRoundState(buildRoundState(rounds[next]));
      setPendingTop(null);
      setPendingBottom(null);
      setMatches({});
      setLines([]);
      setWrongFlash(null);
      setSuccessAnim(null);
      setRevealedLetters({});
      setLocked(false);
    }
  }, [roundIndex, rounds, onComplete]);

  // Watch for all 3 matches complete — wait until no sequence is running
  useEffect(() => {
    if (
      !locked &&
      Object.keys(matches).length > 0 &&
      Object.keys(matches).length === roundState.top.length
    ) {
      const t = setTimeout(advanceRound, 700);
      return () => clearTimeout(t);
    }
  }, [matches, locked, roundState.top.length, advanceRound]);

  // Clean up audio sequence on unmount
  useEffect(() => () => { cancelAudioRef.current && cancelAudioRef.current(); }, []);

  const isTopMatched = (topId) => topId in matches;
  const isBottomMatched = (bottomId) =>
    Object.values(matches).some((m) => m.bottomId === bottomId);

  /**
   * Run the success sequence for a newly-matched pair:
   * 1. Reveal the letter (speaker disappears)
   * 2. Lock UI
   * 3. Bounce letter + play letter sound
   * 4. Bounce word + play word audio
   * 5. Unlock UI
   */
  const runSuccessSequence = useCallback((topId, bottomId, bottomItem, topItem, colorIdx) => {
    // Step 1 — reveal letter immediately
    setRevealedLetters((prev) => ({ ...prev, [bottomId]: bottomItem.letter }));
    // Step 2 — lock UI, start animation on both items
    setLocked(true);
    setSuccessAnim({ topId, bottomId });

    // Step 3+4 — play letter then word audio
    const steps = [];
    if (bottomItem.soundUrl) {
      steps.push({ url: bottomItem.soundUrl, gain: bottomItem.gain });
    }
    if (topItem.audio) {
      steps.push({ url: topItem.audio });
    }

    const cancel = playAudioSequence(steps, () => {
      // Step 5 — unlock
      cancelAudioRef.current = null;
      setSuccessAnim(null);
      setLocked(false);
    });
    cancelAudioRef.current = cancel;
  }, []);

  const tryMatch = useCallback((topId, bottomId) => {
    const isCorrect = bottomId === topId;
    if (isCorrect) {
      const colorIdx = Object.keys(matches).length;
      // Find the bottom item and top item for the sequence
      const bottomItem = roundState.bottom.find((b) => b.id === bottomId);
      const topItem = roundState.top.find((t) => t.id === topId);
      // Register the match
      setMatches((prev) => ({ ...prev, [topId]: { bottomId, colorIdx } }));
      setPendingTop(null);
      setPendingBottom(null);
      // Run the sequence
      runSuccessSequence(topId, bottomId, bottomItem, topItem, colorIdx);
    } else {
      // Both sides glow red simultaneously
      setWrongFlash({ topId, bottomId });
      setTimeout(() => {
        setWrongFlash(null);
        setPendingTop(null);
        setPendingBottom(null);
      }, 500);
    }
  }, [matches, roundState, runSuccessSequence]);

  const handleTopBox = useCallback((topId) => {
    if (locked || isTopMatched(topId)) return;
    if (pendingBottom !== null) {
      tryMatch(topId, pendingBottom);
    } else {
      setPendingTop((prev) => (prev === topId ? null : topId));
    }
  }, [locked, isTopMatched, pendingBottom, tryMatch]);

  const handleBottomBox = useCallback((bottomId) => {
    if (locked || isBottomMatched(bottomId)) return;
    if (pendingTop !== null) {
      tryMatch(pendingTop, bottomId);
    } else {
      setPendingBottom((prev) => (prev === bottomId ? null : bottomId));
    }
  }, [locked, isBottomMatched, pendingTop, tryMatch]);

  const getTopBoxStyle = (topId) => {
    if (isTopMatched(topId)) {
      const c = PAIR_COLORS[matches[topId].colorIdx % PAIR_COLORS.length];
      return { borderColor: c, background: c + "44", boxShadow: `0 0 0 3px ${c}55` };
    }
    if (wrongFlash?.topId === topId) return { borderColor: "#FF6B6B", background: "#FEE2E2", boxShadow: "0 0 0 3px #FF6B6B55" };
    if (pendingTop === topId) return { borderColor: "#4D96FF", background: "#DBEAFE", boxShadow: "0 0 0 3px #4D96FF55" };
    return { borderColor: "#94A3B8", background: "white" };
  };

  const getBottomBoxStyle = (bottomId) => {
    if (isBottomMatched(bottomId)) {
      const matchEntry = Object.values(matches).find((m) => m.bottomId === bottomId);
      const c = PAIR_COLORS[(matchEntry?.colorIdx ?? 0) % PAIR_COLORS.length];
      return { borderColor: c, background: c + "44", boxShadow: `0 0 0 3px ${c}55` };
    }
    if (wrongFlash?.bottomId === bottomId) return { borderColor: "#FF6B6B", background: "#FEE2E2", boxShadow: "0 0 0 3px #FF6B6B55" };
    if (pendingBottom === bottomId) return { borderColor: "#4D96FF", background: "#DBEAFE", boxShadow: "0 0 0 3px #4D96FF55" };
    return { borderColor: "#94A3B8", background: "white" };
  };

  const { top, bottom } = roundState;

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        padding: "10px 14px 12px",
        overflow: "hidden",
        // pointer-events off on outer div when locked; individual matched items still work via zIndex
        pointerEvents: locked ? "none" : "auto",
      }}
    >
      {/* SVG line overlay */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 5 }}>
        {lines.map((l, i) => (
          <g key={i}>
            <line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              stroke="rgba(0,0,0,0.12)" strokeWidth={7} strokeLinecap="round" />
            <line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              stroke={l.color} strokeWidth={4.5} strokeLinecap="round" />
          </g>
        ))}
      </svg>

      {/* ROW 1 — Words */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexShrink: 0 }}>
        {top.map((item) => {
          const matched = isTopMatched(item.id);
          const mc = matched ? PAIR_COLORS[matches[item.id].colorIdx % PAIR_COLORS.length] : null;
          const isWrong = wrongFlash?.topId === item.id;
          const isBouncing = successAnim?.topId === item.id;

          return (
            <div key={item.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              {/* Word pill */}
              <motion.button
                whileTap={locked ? {} : { scale: 0.92 }}
                animate={isBouncing
                  ? { y: [0, -14, 0, -8, 0, -4, 0], scale: [1, 1.08, 1, 1.04, 1] }
                  : { y: 0, scale: 1 }
                }
                transition={isBouncing ? { duration: 0.6, ease: "easeOut" } : {}}
                onPointerDown={(e) => { e.stopPropagation(); if (!locked) playAudio(item.audio); }}
                style={{
                  width: "100%",
                  padding: "11px 4px",
                  borderRadius: 18,
                  background: isWrong ? "#FEE2E2" : matched ? mc + "25" : "white",
                  border: `2.5px solid ${isWrong ? "#FF6B6B" : matched ? mc : "#E2E8F0"}`,
                  boxShadow: isWrong
                    ? "0 0 0 3px #FF6B6B55, 0 4px 18px rgba(255,107,107,0.35)"
                    : matched
                    ? `0 4px 18px ${mc}40`
                    : "0 3px 12px rgba(30,58,95,0.09)",
                  fontSize: "clamp(20px, 5.5vw, 28px)",
                  fontWeight: 700,
                  fontFamily: "Fredoka, sans-serif",
                  color: "#1E293B",
                  cursor: "pointer",
                  textAlign: "center",
                  WebkitTapHighlightColor: "transparent",
                  transition: "background 0.18s, border 0.18s, box-shadow 0.18s",
                  letterSpacing: 1,
                }}
              >
                {item.word}
              </motion.button>

              {/* Top connector box */}
              <div
                onPointerDown={(e) => { e.stopPropagation(); handleTopBox(item.id); }}
                style={{
                  padding: 8, margin: -8, cursor: matched ? "default" : "pointer",
                  touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                  zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <div
                  ref={(el) => (topBoxRefs.current[item.id] = el)}
                  style={{
                    width: 28, height: 28, borderRadius: 7, border: "2.5px solid",
                    transition: "all 0.16s", pointerEvents: "none",
                    ...getTopBoxStyle(item.id),
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle gap — lines pass through */}
      <div style={{ flex: 1, minHeight: 12 }} />

      {/* ROW 2 — Speakers / Revealed letters */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexShrink: 0 }}>
        {bottom.map((item) => {
          const matched = isBottomMatched(item.id);
          const mEntry = Object.values(matches).find((m) => m.bottomId === item.id);
          const mc = mEntry ? PAIR_COLORS[mEntry.colorIdx % PAIR_COLORS.length] : null;
          const isWrong = wrongFlash?.bottomId === item.id;
          const isBouncing = successAnim?.bottomId === item.id;
          const revealedLetter = revealedLetters[item.id];

          return (
            <div key={item.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              {/* Bottom connector box */}
              <div
                onPointerDown={(e) => { e.stopPropagation(); handleBottomBox(item.id); }}
                style={{
                  padding: 8, margin: -8, cursor: matched ? "default" : "pointer",
                  touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                  zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <div
                  ref={(el) => (bottomBoxRefs.current[item.id] = el)}
                  style={{
                    width: 28, height: 28, borderRadius: 7, border: "2.5px solid",
                    transition: "all 0.16s", pointerEvents: "none",
                    ...getBottomBoxStyle(item.id),
                  }}
                />
              </div>

              {/* Speaker → revealed letter after correct match */}
              <motion.div
                animate={isBouncing
                  ? { y: [0, -16, 0, -9, 0, -4, 0], scale: [1, 1.15, 1, 1.07, 1] }
                  : { y: 0, scale: 1 }
                }
                transition={isBouncing ? { duration: 0.55, ease: "easeOut" } : {}}
                style={{ width: "100%" }}
              >
                <AnimatePresence mode="wait">
                  {revealedLetter ? (
                    /* Letter tile — replaces speaker after match */
                    <motion.div
                      key="letter"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 18 }}
                      style={{
                        width: "100%",
                        padding: "10px 4px",
                        borderRadius: 20,
                        background: mc ? mc + "25" : "white",
                        border: `2.5px solid ${mc || "#E2E8F0"}`,
                        boxShadow: mc ? `0 4px 18px ${mc}40` : "0 3px 12px rgba(30,58,95,0.09)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "clamp(26px, 7vw, 36px)",
                        fontWeight: 700,
                        fontFamily: "Fredoka, sans-serif",
                        color: mc || "#1E293B",
                      }}
                    >
                      {revealedLetter}
                    </motion.div>
                  ) : (
                    /* Speaker button */
                    <motion.button
                      key="speaker"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      transition={{ duration: 0.15 }}
                      whileTap={locked ? {} : { scale: 0.90 }}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        if (!locked && item.soundUrl) playAudio(item.soundUrl, item.gain);
                      }}
                      style={{
                        width: "100%",
                        padding: "13px 4px",
                        borderRadius: 20,
                        background: isWrong ? "#FEE2E2" : "white",
                        border: `2.5px solid ${isWrong ? "#FF6B6B" : "#E2E8F0"}`,
                        boxShadow: isWrong
                          ? "0 0 0 3px #FF6B6B55, 0 4px 18px rgba(255,107,107,0.35)"
                          : "0 3px 12px rgba(30,58,95,0.09)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        WebkitTapHighlightColor: "transparent",
                        transition: "background 0.18s, border 0.18s, box-shadow 0.18s",
                      }}
                    >
                      <SpeakerIcon color={isWrong ? "#FF6B6B" : "#4ECDC4"} size={38} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}