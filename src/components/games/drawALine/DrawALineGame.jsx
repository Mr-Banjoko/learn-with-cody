/**
 * DrawALineGame
 * Manages all rounds internally. Shows 3 words (top) + 3 speaker icons (bottom).
 * Children tap small connector boxes to draw matching lines.
 * Calls onComplete() after all rounds finish.
 */
import { useState, useRef, useLayoutEffect, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playAudio } from "../../../lib/useAudio";
import { getLetterSoundUrl, getLetterGain } from "../../../lib/letterSounds";

const PAIR_COLORS = ["#FF6B6B", "#4ECDC4", "#FFD93D"];

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

/**
 * Build display state for one raw round.
 * top[i].id === i, top[i].correctBottomId === i (since each bottom item has id = its matching top index).
 * bottom is shuffled so columns don't align.
 */
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
        id: i, // bottom.id === the top.id it correctly matches
        letter: entry.targetLetter,
        soundUrl: getLetterSoundUrl(entry.targetLetter),
        gain: getLetterGain(entry.targetLetter),
      }))
    );
    attempts++;
    // Keep re-shuffling if any column happens to stay aligned (bottom[j].id === j)
  } while (attempts < 30 && bottom.some((b, j) => b.id === j));

  return { top, bottom };
}

export default function DrawALineGame({ rounds, onComplete, lang = "en" }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [roundState, setRoundState] = useState(() => buildRoundState(rounds[0]));

  // Selection state: topId or bottomId that's currently "pending"
  const [pendingTop, setPendingTop] = useState(null);
  const [pendingBottom, setPendingBottom] = useState(null);

  // matches: { [topId]: { bottomId, colorIdx } }
  const [matches, setMatches] = useState({});
  const [wrongFlash, setWrongFlash] = useState(false);

  // Refs for connector boxes → used to compute SVG line coordinates
  const topBoxRefs = useRef({});
  const bottomBoxRefs = useRef({});
  const containerRef = useRef(null);
  const [lines, setLines] = useState([]);

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
      setWrongFlash(false);
    }
  }, [roundIndex, rounds, onComplete]);

  // Watch for all 3 matches complete
  useEffect(() => {
    if (
      Object.keys(matches).length > 0 &&
      Object.keys(matches).length === roundState.top.length
    ) {
      const t = setTimeout(advanceRound, 950);
      return () => clearTimeout(t);
    }
  }, [matches, roundState.top.length, advanceRound]);

  const isTopMatched = (topId) => topId in matches;
  const isBottomMatched = (bottomId) =>
    Object.values(matches).some((m) => m.bottomId === bottomId);

  const tryMatch = useCallback((topId, bottomId) => {
    // bottom item's id is the topId it correctly matches
    const isCorrect = bottomId === topId;
    if (isCorrect) {
      const colorIdx = Object.keys(matches).length;
      setMatches((prev) => ({ ...prev, [topId]: { bottomId, colorIdx } }));
      setPendingTop(null);
      setPendingBottom(null);
    } else {
      setWrongFlash(true);
      setTimeout(() => {
        setWrongFlash(false);
        setPendingTop(null);
        setPendingBottom(null);
      }, 480);
    }
  }, [matches]);

  const handleTopBox = useCallback((topId) => {
    if (isTopMatched(topId)) return;
    if (pendingBottom !== null) {
      tryMatch(topId, pendingBottom);
    } else {
      setPendingTop((prev) => (prev === topId ? null : topId));
    }
  }, [isTopMatched, pendingBottom, tryMatch]);

  const handleBottomBox = useCallback((bottomId) => {
    if (isBottomMatched(bottomId)) return;
    if (pendingTop !== null) {
      tryMatch(pendingTop, bottomId);
    } else {
      setPendingBottom((prev) => (prev === bottomId ? null : bottomId));
    }
  }, [isBottomMatched, pendingTop, tryMatch]);

  const getTopBoxStyle = (topId) => {
    if (isTopMatched(topId)) {
      const c = PAIR_COLORS[matches[topId].colorIdx % PAIR_COLORS.length];
      return { borderColor: c, background: c + "44", boxShadow: `0 0 0 3px ${c}55` };
    }
    if (pendingTop === topId) return { borderColor: "#4D96FF", background: "#DBEAFE", boxShadow: "0 0 0 3px #4D96FF55" };
    if (wrongFlash && pendingTop === topId) return { borderColor: "#FF6B6B", background: "#FEE2E2" };
    return { borderColor: "#94A3B8", background: "white" };
  };

  const getBottomBoxStyle = (bottomId) => {
    if (isBottomMatched(bottomId)) {
      const matchEntry = Object.values(matches).find((m) => m.bottomId === bottomId);
      const c = PAIR_COLORS[(matchEntry?.colorIdx ?? 0) % PAIR_COLORS.length];
      return { borderColor: c, background: c + "44", boxShadow: `0 0 0 3px ${c}55` };
    }
    if (pendingBottom === bottomId) return { borderColor: "#4D96FF", background: "#DBEAFE", boxShadow: "0 0 0 3px #4D96FF55" };
    if (wrongFlash && pendingBottom === bottomId) return { borderColor: "#FF6B6B", background: "#FEE2E2" };
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
        padding: "20px 14px 24px",
        overflow: "hidden",
      }}
    >
      {/* SVG line overlay */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 5 }}
      >
        {lines.map((l, i) => (
          <g key={i}>
            {/* Soft shadow under line */}
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
          return (
            <div key={item.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              {/* Word pill — tapping plays full word audio */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                onPointerDown={(e) => { e.stopPropagation(); playAudio(item.audio); }}
                style={{
                  width: "100%",
                  padding: "11px 4px",
                  borderRadius: 18,
                  background: matched ? mc + "25" : "white",
                  border: `2.5px solid ${matched ? mc : "#E2E8F0"}`,
                  boxShadow: matched
                    ? `0 4px 18px ${mc}40`
                    : "0 3px 12px rgba(30,58,95,0.09)",
                  fontSize: "clamp(20px, 5.5vw, 28px)",
                  fontWeight: 700,
                  fontFamily: "Fredoka, sans-serif",
                  color: "#1E293B",
                  cursor: "pointer",
                  textAlign: "center",
                  WebkitTapHighlightColor: "transparent",
                  transition: "background 0.18s, border 0.18s",
                  letterSpacing: 1,
                }}
              >
                {item.word}
              </motion.button>

              {/* Top connector box — wrapper provides larger hit area */}
              <div
                onPointerDown={(e) => { e.stopPropagation(); handleTopBox(item.id); }}
                style={{
                  padding: 8,
                  margin: -8,
                  cursor: matched ? "default" : "pointer",
                  touchAction: "manipulation",
                  WebkitTapHighlightColor: "transparent",
                  zIndex: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  ref={(el) => (topBoxRefs.current[item.id] = el)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    border: "2.5px solid",
                    transition: "all 0.16s",
                    pointerEvents: "none",
                    ...getTopBoxStyle(item.id),
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle gap — lines pass through */}
      <div style={{ flex: 1, minHeight: 56 }} />

      {/* ROW 2 — Speakers */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexShrink: 0 }}>
        {bottom.map((item) => {
          const matched = isBottomMatched(item.id);
          const mEntry = Object.values(matches).find((m) => m.bottomId === item.id);
          const mc = mEntry ? PAIR_COLORS[mEntry.colorIdx % PAIR_COLORS.length] : null;
          return (
            <div key={item.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              {/* Bottom connector box — wrapper provides larger hit area */}
              <div
                onPointerDown={(e) => { e.stopPropagation(); handleBottomBox(item.id); }}
                style={{
                  padding: 8,
                  margin: -8,
                  cursor: matched ? "default" : "pointer",
                  touchAction: "manipulation",
                  WebkitTapHighlightColor: "transparent",
                  zIndex: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  ref={(el) => (bottomBoxRefs.current[item.id] = el)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    border: "2.5px solid",
                    transition: "all 0.16s",
                    pointerEvents: "none",
                    ...getBottomBoxStyle(item.id),
                  }}
                />
              </div>

              {/* Speaker button — tapping plays letter sound only */}
              <motion.button
                whileTap={{ scale: 0.90 }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  if (item.soundUrl) playAudio(item.soundUrl, item.gain);
                }}
                style={{
                  width: "100%",
                  padding: "13px 4px",
                  borderRadius: 20,
                  background: matched ? mc + "25" : "white",
                  border: `2.5px solid ${matched ? mc : "#E2E8F0"}`,
                  boxShadow: matched
                    ? `0 4px 18px ${mc}40`
                    : "0 3px 12px rgba(30,58,95,0.09)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                  transition: "background 0.18s, border 0.18s",
                }}
              >
                <SpeakerIcon color={matched ? mc : "#4ECDC4"} size={38} />
              </motion.button>
            </div>
          );
        })}
      </div>

      {/* Wrong-answer gentle flash */}
      <AnimatePresence>
        {wrongFlash && (
          <motion.div
            key="wrongflash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14 }}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(255,107,107,0.09)",
              borderRadius: 24,
              pointerEvents: "none",
              zIndex: 20,
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}