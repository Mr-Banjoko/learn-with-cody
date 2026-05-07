/**
 * TracingLetter — strict Duolingo-style stroke validator
 *
 * Rules:
 *  - Must start within 12px of stroke start
 *  - Must end within 14px of stroke end
 *  - Must cover ≥60% of guide path in forward order
 *  - Backward tracing rejected
 *  - Off-path tracing rejected
 *  - Tiny taps rejected (min 8 points)
 *
 * Hint: after 2 fails the full stroke path glows with a direction arrow
 */
import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { LETTER_DEFS, LETTER_CELL } from "../../lib/letterPaths";
import { samplePathPoints, validateTrace } from "../../lib/tracingUtils";

const CELL_W = LETTER_CELL.w;
const CELL_H = LETTER_CELL.h;
const MIDLINE = LETTER_CELL.midline;
const BASELINE = LETTER_CELL.baseline;
const DESCENDER = LETTER_CELL.descender;

const THEME_COLOR = "#4ECDC4";
const HINT_COLOR = "#FFD93D";
const GUIDE_COLOR = "#CCCCCC";
const COMPLETE_COLOR = "#4ECDC4";
const GUIDE_DASH = "5 7";

export default function TracingLetter({ letter, isActive, onComplete, scale = 1 }) {
  const def = LETTER_DEFS[letter];
  const numStrokes = def?.strokes?.length ?? 1;

  const [completedStrokes, setCompletedStrokes] = useState([]);
  const [activeStrokeIdx, setActiveStrokeIdx] = useState(0);
  const [failCounts, setFailCounts] = useState({});
  const [letterDone, setLetterDone] = useState(false);
  const [bouncing, setBouncing] = useState(false);
  const [currentTrace, setCurrentTrace] = useState(null);

  const svgRef = useRef(null);
  const pathRefs = useRef([]);
  const guideCache = useRef({});
  const traceRef = useRef([]);

  const getGuidePoints = useCallback((idx) => {
    if (guideCache.current[idx]) return guideCache.current[idx];
    const el = pathRefs.current[idx];
    if (!el) return [];
    const pts = samplePathPoints(el, 80);
    guideCache.current[idx] = pts;
    return pts;
  }, []);

  const toSVG = useCallback((clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return [0, 0];
    const r = svg.getBoundingClientRect();
    return [
      ((clientX - r.left) / r.width) * CELL_W,
      ((clientY - r.top) / r.height) * CELL_H,
    ];
  }, []);

  const onTouchStart = useCallback((e) => {
    if (!isActive || letterDone) return;
    e.preventDefault();
    const pt = toSVG(e.touches[0].clientX, e.touches[0].clientY);
    traceRef.current = [pt];
    setCurrentTrace([pt]);
  }, [isActive, letterDone, toSVG]);

  const onTouchMove = useCallback((e) => {
    if (!isActive || letterDone || traceRef.current.length === 0) return;
    e.preventDefault();
    const pt = toSVG(e.touches[0].clientX, e.touches[0].clientY);
    traceRef.current.push(pt);
    setCurrentTrace([...traceRef.current]);
  }, [isActive, letterDone, toSVG]);

  const onTouchEnd = useCallback((e) => {
    if (!isActive || letterDone) {
      traceRef.current = [];
      setCurrentTrace(null);
      return;
    }
    e.preventDefault();

    const userPath = [...traceRef.current];
    traceRef.current = [];
    setCurrentTrace(null);

    const stroke = def.strokes[activeStrokeIdx];

    // Dot strokes (i, j) — just needs a tap near the dot
    if (stroke.isDot) {
      const [sx, sy] = userPath[0] || stroke.start;
      if (Math.hypot(sx - stroke.start[0], sy - stroke.start[1]) <= 14) {
        markComplete(activeStrokeIdx);
      } else {
        recordFail(activeStrokeIdx);
      }
      return;
    }

    // Get guide points — if path not mounted yet, fail gracefully
    const guide = getGuidePoints(activeStrokeIdx);
    if (guide.length === 0) {
      recordFail(activeStrokeIdx);
      return;
    }

    const { valid } = validateTrace(userPath, guide);
    if (valid) {
      markComplete(activeStrokeIdx);
    } else {
      recordFail(activeStrokeIdx);
    }
  }, [isActive, letterDone, activeStrokeIdx, def, getGuidePoints]);

  const markComplete = (idx) => {
    setCompletedStrokes((prev) => {
      const next = [...prev, idx];
      if (next.length === numStrokes) {
        setBouncing(true);
        setLetterDone(true);
        setTimeout(() => { setBouncing(false); onComplete?.(); }, 500);
      } else {
        setActiveStrokeIdx(idx + 1);
      }
      return next;
    });
    setFailCounts((prev) => ({ ...prev, [idx]: 0 }));
  };

  const recordFail = (idx) => {
    setFailCounts((prev) => ({ ...prev, [idx]: (prev[idx] || 0) + 1 }));
  };

  if (!def) return null;

  const tracePoints = currentTrace && currentTrace.length > 1
    ? currentTrace.map(([x, y]) => `${x},${y}`).join(" ")
    : null;

  return (
    <motion.div
      animate={bouncing ? { y: [0, -14, 0, -6, 0] } : {}}
      transition={{ duration: 0.45 }}
      style={{ display: "inline-flex" }}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${CELL_W} ${CELL_H}`}
        width={CELL_W * scale}
        height={CELL_H * scale}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: "none", userSelect: "none", display: "block", overflow: "visible" }}
      >
        {/* 4-line ruled guide */}
        <line x1={2} y1={0} x2={CELL_W-2} y2={0} stroke="#D1D5DB" strokeWidth={1} />
        <line x1={2} y1={MIDLINE} x2={CELL_W-2} y2={MIDLINE} stroke="#D1D5DB" strokeWidth={0.8} strokeDasharray="3 3" />
        <line x1={2} y1={BASELINE} x2={CELL_W-2} y2={BASELINE} stroke="#D1D5DB" strokeWidth={1} />
        <line x1={2} y1={DESCENDER} x2={CELL_W-2} y2={DESCENDER} stroke="#E5E7EB" strokeWidth={0.7} strokeDasharray="2 4" />

        {def.strokes.map((stroke, idx) => {
          const done = completedStrokes.includes(idx);
          const locked = idx > activeStrokeIdx;
          const isCurrent = idx === activeStrokeIdx && !done;
          const fails = failCounts[idx] || 0;
          const showHint = fails >= 2 && isCurrent;

          if (stroke.isDot) {
            return (
              <circle key={idx}
                cx={stroke.start[0]} cy={stroke.start[1]}
                r={done ? 6 : 5}
                fill={done ? COMPLETE_COLOR : showHint ? HINT_COLOR : GUIDE_COLOR}
                opacity={locked ? 0.2 : 1}
              >
                {showHint && <animate attributeName="opacity" values="1;0.3;1" dur="0.9s" repeatCount="indefinite" />}
              </circle>
            );
          }

          return (
            <g key={idx}>
              {/* Full-path hint glow — only after 2 fails */}
              {showHint && (
                <path d={stroke.d} fill="none"
                  stroke={HINT_COLOR} strokeWidth={22}
                  strokeLinecap="round" strokeLinejoin="round"
                  opacity={0}
                >
                  <animate attributeName="opacity" values="0;0.5;0;0.5;0" dur="1.8s" repeatCount="indefinite" />
                </path>
              )}

              {/* Guide dotted path */}
              <path
                ref={(el) => (pathRefs.current[idx] = el)}
                d={stroke.d}
                fill="none"
                stroke={done ? COMPLETE_COLOR : locked ? "#E5E7EB" : GUIDE_COLOR}
                strokeWidth={done ? 5 : 3.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={done ? "none" : GUIDE_DASH}
                opacity={done ? 1 : locked ? 0.2 : isActive ? 1 : 0.4}
              />

              {/* Pulsing start dot — shows WHERE to begin */}
              {isCurrent && isActive && (
                <circle cx={stroke.start[0]} cy={stroke.start[1]} r={6}
                  fill={showHint ? HINT_COLOR : THEME_COLOR}
                  opacity={0.95}
                >
                  <animate attributeName="r" values="5;8;5" dur="1.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.95;0.4;0.95" dur="1.2s" repeatCount="indefinite" />
                </circle>
              )}
            </g>
          );
        })}

        {/* Live finger trace */}
        {tracePoints && (
          <polyline points={tracePoints} fill="none"
            stroke={THEME_COLOR} strokeWidth={5}
            strokeLinecap="round" strokeLinejoin="round"
            opacity={0.8}
          />
        )}
      </svg>
    </motion.div>
  );
}