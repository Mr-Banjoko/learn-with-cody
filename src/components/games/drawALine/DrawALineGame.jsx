/**
 * DrawALineGame
 * Manages all rounds internally. Shows 3 words (top) + 3 speaker icons (bottom).
 * Children tap small connector boxes to draw matching lines.
 * Calls onComplete() after all rounds finish.
 *
 * LINE ANIMATION:
 * On a correct match the connecting line is drawn (not instant).
 * Direction: top→bottom if Row 1 box was tapped first; bottom→top if Row 2 box was tapped first.
 * Technique: SVG stroke-dasharray / stroke-dashoffset CSS animation.
 *   - fromTop=true  → line defined top-to-bottom (x1,y1=top box), dashoffset shrinks → draws down.
 *   - fromTop=false → line defined bottom-to-top (x1,y1=bottom box), dashoffset shrinks → draws up.
 */
import { useState, useRef, useLayoutEffect, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playAudio, playAudioSequence } from "../../../lib/useAudio";
import { getLetterSoundUrl, getLetterGain } from "../../../lib/letterSounds";

const PAIR_COLORS = ["#C77DFF", "#4ECDC4", "#FFD93D"];
const DRAW_DURATION_MS = 320; // line draw speed — fast but visible

function SpeakerIcon({ color = "#4ECDC4", size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <path d="M18 21h-4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4l8 6V15l-8 6z" fill={color} />
      <path d="M30 20.5a8 8 0 0 1 0 11" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M33.5 17a13 13 0 0 1 0 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
    </svg>
  );
}

/** Animated SVG line — draws from (x1,y1) toward (x2,y2) */
function AnimatedLine({ x1, y1, x2, y2, color, id }) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const animName = `draw-line-${id}`;

  return (
    <>
      <style>{`
        @keyframes ${animName} {
          from { stroke-dashoffset: ${len}; }
          to   { stroke-dashoffset: 0; }
        }
      `}</style>
      <g>
        <line
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="rgba(0,0,0,0.12)"
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={len}
          strokeDashoffset={0}
          style={{ animation: `${animName} ${DRAW_DURATION_MS}ms ease-out both` }}
        />
        <line
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={color}
          strokeWidth={4.5}
          strokeLinecap="round"
          strokeDasharray={len}
          strokeDashoffset={0}
          style={{ animation: `${animName} ${DRAW_DURATION_MS}ms ease-out both` }}
        />
      </g>
    </>
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

  // Track which row was selected FIRST for the current pending pair
  const [firstSelectedRow, setFirstSelectedRow] = useState(null);

  // matches: { [topId]: { bottomId, colorIdx, fromTop: bool } }
  const [matches, setMatches] = useState({});

  const [wrongFlash, setWrongFlash] = useState(null);

  const [bouncingBottom, setBouncingBottom] = useState(null);
  const [bouncingTop, setBouncingTop] = useState(null);

  const [revealedLetters, setRevealedLetters] = useState({});
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
    Object.entries(matches).forEach(([topIdStr, { bottomId, colorIdx, fromTop }]) => {
      const tEl = topBoxRefs.current[Number(topIdStr)];
      const bEl = bottomBoxRefs.current[bottomId];
      if (!tEl || !bEl) return;
      const tR = tEl.getBoundingClientRect();
      const bR = bEl.getBoundingClientRect();

      const topX = tR.left + tR.width / 2 - cr.left;
      const topY = tR.bottom - cr.top;
      const botX = bR.left + bR.width / 2 - cr.left;
      const botY = bR.top - cr.top;

      result.push({
        x1: fromTop ? topX : botX,
        y1: fromTop ? topY : botY,
        x2: fromTop ? botX : topX,
        y2: fromTop ? botY : topY,
        color: PAIR_COLORS[colorIdx % PAIR_COLORS.length],
        id: `${topIdStr}-${bottomId}`,
      });
    });
    setLines(result);
  }, [matches]);

  useLayoutEffect(() => { recalcLines(); }, [matches, recalcLines]);

  useEffect(() => {
    window.addEventListener("resize", recalcLines);
    return () => window.removeEventListener("resize", recalcLines);
  }, [recalcLines]);

  const advanceRound = useCallback(() => {
    const next = roundIndex + 1;
    if (next >= rounds.length) {
      onComplete && onComplete();
    } else {
      setRoundIndex(next);
      setRoundState(buildRoundState(rounds[next]));
      setPendingTop(null);
      setPendingBottom(null);
      setFirstSelectedRow(null);
      setMatches({});
      setLines([]);
      setWrongFlash(null);
      setBouncingBottom(null);
      setBouncingTop(null);
      setRevealedLetters({});
      setLocked(false);
    }
  }, [roundIndex, rounds, onComplete]);

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

  useEffect(() => () => { cancelAudioRef.current && cancelAudioRef.current(); }, []);

  const isTopMatched = (topId) => topId in matches;
  const isBottomMatched = (bottomId) =>
    Object.values(matches).some((m) => m.bottomId === bottomId);

  const runSuccessSequence = useCallback((topId, bottomId, bottomItem, topItem) => {
    setRevealedLetters((prev) => ({ ...prev, [bottomId]: bottomItem.letter }));
    setLocked(true);
    setBouncingBottom(bottomId);

    const steps = [];
    if (bottomItem.soundUrl) {
      steps.push({ url: bottomItem.soundUrl, gain: bottomItem.gain });
    }
    if (topItem.audio) {
      steps.push({
        url: topItem.audio,
        onStart: () => {
          setBouncingBottom(null);
          setBouncingTop(topId);
        },
      });
    }

    const cancel = playAudioSequence(steps, () => {
      cancelAudioRef.current = null;
      setBouncingBottom(null);
      setBouncingTop(null);
      setLocked(false);
    });
    cancelAudioRef.current = cancel;
  }, []);

  const tryMatch = useCallback((topId, bottomId, resolvedFromTop) => {
    const isCorrect = bottomId === topId;
    if (isCorrect) {
      const colorIdx = Object.keys(matches).length;
      const bottomItem = roundState.bottom.find((b) => b.id === bottomId);
      const topItem = roundState.top.find((t) => t.id === topId);

      setMatches((prev) => ({ ...prev, [topId]: { bottomId, colorIdx, fromTop: resolvedFromTop } }));
      setPendingTop(null);
      setPendingBottom(null);
      setFirstSelectedRow(null);

      runSuccessSequence(topId, bottomId, bottomItem, topItem, colorIdx);
    } else {
      setWrongFlash({ topId, bottomId });
      setTimeout(() => {
        setWrongFlash(null);
        setPendingTop(null);
        setPendingBottom(null);
        setFirstSelectedRow(null);
      }, 500);
    }
  }, [matches, roundState, runSuccessSequence]);

  const handleTopBox = useCallback((topId) => {
    if (locked || isTopMatched(topId)) return;
    if (pendingBottom !== null) {
      tryMatch(topId, pendingBottom, false);
    } else {
      if (pendingTop !== topId) setFirstSelectedRow("top");
      else setFirstSelectedRow(null);
      setPendingTop((prev) => (prev === topId ? null : topId));
    }
  }, [locked, isTopMatched, pendingBottom, tryMatch, pendingTop]);

  const handleBottomBox = useCallback((bottomId) => {
    if (locked || isBottomMatched(bottomId)) return;
    if (pendingTop !== null) {
      tryMatch(pendingTop, bottomId, true);
    } else {
      if (pendingBottom !== bottomId) setFirstSelectedRow("bottom");
      else setFirstSelectedRow(null);
      setPendingBottom((prev) => (prev === bottomId ? null : bottomId));
    }
  }, [locked, isBottomMatched, pendingTop, tryMatch, pendingBottom]);

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
        paddingTop: "15%",
        paddingBottom: "20%",
        pointerEvents: locked ? "none" : "auto",
      }}
    >
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 5 }}>
        {lines.map((l) => (
          <AnimatedLine
            key={l.id}
            x1={l.x1} y1={l.y1}
            x2={l.x2} y2={l.y2}
            color={l.color}
            id={l.id}
          />
        ))}
      </svg>

      {/* ROW 1 — Words */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexShrink: 0 }}>
        {top.map((item) => {
          const matched = isTopMatched(item.id);
          const mc = matched ? PAIR_COLORS[matches[item.id].colorIdx % PAIR_COLORS.length] : null;
          const isWrong = wrongFlash?.topId === item.id;
          const isBouncing = bouncingTop === item.id;

          return (
            <div key={item.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <motion.button
                whileTap={locked ? {} : { scale: 0.92 }}
                animate={isBouncing
                  ? { y: [0, -14, 0, -8, 0, -4, 0], scale: [1, 1.08, 1, 1.04, 1] }
                  : { y: 0, scale: 1 }
                }
                transition={isBouncing ? { duration: 0.6, ease: "easeOut" } : {}}
                onPointerDown={(e) => { e.stopPropagation(); if (!locked) playAudio(item.audio); }}
                style={{
                  width: "100%", padding: "11px 4px", borderRadius: 18,
                  background: isWrong ? "#FEE2E2" : matched ? mc + "25" : "white",
                  border: `2.5px solid ${isWrong ? "#FF6B6B" : matched ? mc : "#E2E8F0"}`,
                  boxShadow: isWrong
                    ? "0 0 0 3px #FF6B6B55, 0 4px 18px rgba(255,107,107,0.35)"
                    : matched ? `0 4px 18px ${mc}40` : "0 3px 12px rgba(30,58,95,0.09)",
                  fontSize: "clamp(20px, 5.5vw, 28px)", fontWeight: 700,
                  fontFamily: "Fredoka, sans-serif", color: "#1E293B",
                  cursor: "pointer", textAlign: "center",
                  WebkitTapHighlightColor: "transparent",
                  transition: "background 0.18s, border 0.18s, box-shadow 0.18s",
                  letterSpacing: 1,
                }}
              >
                {item.word}
              </motion.button>
              <div
                onPointerDown={(e) => { e.stopPropagation(); handleTopBox(item.id); }}
                style={{ padding: 8, margin: -8, cursor: matched ? "default" : "pointer", touchAction: "manipulation", WebkitTapHighlightColor: "transparent", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <div
                  ref={(el) => (topBoxRefs.current[item.id] = el)}
                  style={{ width: 28, height: 28, borderRadius: 7, border: "2.5px solid", transition: "all 0.16s", pointerEvents: "none", ...getTopBoxStyle(item.id) }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ flex: 1, minHeight: 12 }} />

      {/* ROW 2 — Speakers / Revealed letters */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexShrink: 0 }}>
        {bottom.map((item) => {
          const matched = isBottomMatched(item.id);
          const mEntry = Object.values(matches).find((m) => m.bottomId === item.id);
          const mc = mEntry ? PAIR_COLORS[mEntry.colorIdx % PAIR_COLORS.length] : null;
          const isWrong = wrongFlash?.bottomId === item.id;
          const isBouncing = bouncingBottom === item.id;
          const revealedLetter = revealedLetters[item.id];

          return (
            <div key={item.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div
                onPointerDown={(e) => { e.stopPropagation(); handleBottomBox(item.id); }}
                style={{ padding: 8, margin: -8, cursor: matched ? "default" : "pointer", touchAction: "manipulation", WebkitTapHighlightColor: "transparent", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <div
                  ref={(el) => (bottomBoxRefs.current[item.id] = el)}
                  style={{ width: 28, height: 28, borderRadius: 7, border: "2.5px solid", transition: "all 0.16s", pointerEvents: "none", ...getBottomBoxStyle(item.id) }}
                />
              </div>
              <motion.div
                animate={isBouncing ? { y: [0, -16, 0, -9, 0, -4, 0], scale: [1, 1.15, 1, 1.07, 1] } : { y: 0, scale: 1 }}
                transition={isBouncing ? { duration: 0.55, ease: "easeOut" } : {}}
                style={{ width: "100%" }}
              >
                <AnimatePresence mode="wait">
                  {revealedLetter ? (
                    <motion.div
                      key="letter"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 18 }}
                      style={{
                        width: "100%", padding: "10px 4px", borderRadius: 20,
                        background: mc ? mc + "25" : "white",
                        border: `2.5px solid ${mc || "#E2E8F0"}`,
                        boxShadow: mc ? `0 4px 18px ${mc}40` : "0 3px 12px rgba(30,58,95,0.09)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "clamp(26px, 7vw, 36px)", fontWeight: 700,
                        fontFamily: "Fredoka, sans-serif", color: mc || "#1E293B",
                      }}
                    >
                      {revealedLetter}
                    </motion.div>
                  ) : (
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
                        width: "100%", padding: "13px 4px", borderRadius: 20,
                        background: isWrong ? "#FEE2E2" : "white",
                        border: `2.5px solid ${isWrong ? "#FF6B6B" : "#E2E8F0"}`,
                        boxShadow: isWrong
                          ? "0 0 0 3px #FF6B6B55, 0 4px 18px rgba(255,107,107,0.35)"
                          : "0 3px 12px rgba(30,58,95,0.09)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", WebkitTapHighlightColor: "transparent",
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
