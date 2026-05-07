/**
 * TracingLetter
 * Renders a single letter as a dotted SVG path with:
 *  - 4-line ruled guide (top, dashed midline, baseline, descender)
 *  - Stroke-order enforcement for 2-stroke letters
 *  - Hint glow after 2 failed attempts
 *  - Solid fill on successful strokes
 *  - Touch-only interaction
 *
 * Props:
 *   letter       {string}           — lowercase letter to render
 *   isActive     {boolean}          — whether this letter is the current focus
 *   onComplete   {()=>void}         — called when all strokes done
 *   scale        {number}           — scale factor applied to 60×80 cell
 */
import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LETTER_DEFS, LETTER_CELL } from "../../lib/letterPaths";
import { samplePathD, validateTrace } from "../../lib/tracingUtils";

const CELL_W = LETTER_CELL.w;   // 60
const CELL_H = LETTER_CELL.h;   // 80
const MIDLINE = LETTER_CELL.midline;   // 28
const BASELINE = LETTER_CELL.baseline; // 56
const DESCENDER = LETTER_CELL.descender; // 80

const THEME_COLOR = "#4ECDC4";
const HINT_COLOR = "#FFD93D";
const DOT_COLOR = "#AAAAAA";
const COMPLETE_COLOR = "#4ECDC4";

// Dot dash style for untraced paths
const DOT_DASH = "6 8";
const DOT_SIZE = 5;

function dotsAlongD(d) {
  // We render as a strokeDasharray dashed path to simulate dots
  return d;
}

export default function TracingLetter({ letter, isActive, onComplete, scale = 1 }) {
  const def = LETTER_DEFS[letter];
  const numStrokes = def?.strokes?.length ?? 1;

  const [completedStrokes, setCompletedStrokes] = useState([]);
  const [activeStrokeIdx, setActiveStrokeIdx] = useState(0);
  const [failCounts, setFailCounts] = useState({});  // strokeIdx -> count
  const [letterDone, setLetterDone] = useState(false);
  const [bouncing, setBouncing] = useState(false);
  const [currentTrace, setCurrentTrace] = useState(null); // [{x,y}] being drawn now

  const svgRef = useRef(null);
  const pathRefs = useRef([]); // refs to SVG <path> elements
  const guidePointsCache = useRef({}); // strokeIdx -> [[x,y]]
  const traceRef = useRef([]); // live touch points in SVG coords

  // Sample guide points from the path `d` string — no DOM needed, works in Safari
  const ensureGuidePoints = useCallback((strokeIdx) => {
    if (guidePointsCache.current[strokeIdx]) return guidePointsCache.current[strokeIdx];
    const stroke = def?.strokes?.[strokeIdx];
    if (!stroke?.d) return [];
    const pts = samplePathD(stroke.d, 80);
    guidePointsCache.current[strokeIdx] = pts;
    return pts;
  }, [def]);

  const toSVGCoords = useCallback((clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return [0, 0];
    const rect = svg.getBoundingClientRect();
    const sx = ((clientX - rect.left) / rect.width) * CELL_W;
    const sy = ((clientY - rect.top) / rect.height) * CELL_H;
    return [sx, sy];
  }, []);

  const handleTouchStart = useCallback((e) => {
    if (!isActive || letterDone) return;
    e.preventDefault();
    const t = e.touches[0];
    const [sx, sy] = toSVGCoords(t.clientX, t.clientY);
    traceRef.current = [[sx, sy]];
    setCurrentTrace([[sx, sy]]);
  }, [isActive, letterDone, toSVGCoords]);

  const handleTouchMove = useCallback((e) => {
    if (!isActive || letterDone || traceRef.current.length === 0) return;
    e.preventDefault();
    const t = e.touches[0];
    const [sx, sy] = toSVGCoords(t.clientX, t.clientY);
    traceRef.current.push([sx, sy]);
    setCurrentTrace([...traceRef.current]);
  }, [isActive, letterDone, toSVGCoords]);

  const handleTouchEnd = useCallback((e) => {
  if (!isActive || letterDone) {
    traceRef.current = [];
    setCurrentTrace(null);
    return;
  }
  e.preventDefault();

  const userPath = traceRef.current;
  traceRef.current = [];
  setCurrentTrace(null);

  const strokeIdx = activeStrokeIdx;
  const stroke = def.strokes[strokeIdx];

  // For dot strokes (i-dot, j-dot) — just a tap near the point
  if (stroke.isDot) {
    const [sx, sy] = userPath[0] || stroke.start;
    const [gx, gy] = stroke.start;
    const dist = Math.hypot(sx - gx, sy - gy);
    if (dist <= 44) {
      markStrokeComplete(strokeIdx);
    } else {
      recordFail(strokeIdx);
    }
    return;
  }

  if (userPath.length < 2) {
    recordFail(strokeIdx);
    return;
  }

    const guidePoints = ensureGuidePoints(strokeIdx);
    if (guidePoints.length === 0) {
      recordFail(strokeIdx);
      return;
    }

    const { valid } = validateTrace(userPath, guidePoints);
    if (valid) {
      markStrokeComplete(strokeIdx);
    } else {
      recordFail(strokeIdx);
    }
  }, [isActive, letterDone, activeStrokeIdx, def, ensureGuidePoints]);

  const markStrokeComplete = (idx) => {
    setCompletedStrokes((prev) => {
      const next = [...prev, idx];
      if (next.length === numStrokes) {
        // All strokes done
        setBouncing(true);
        setLetterDone(true);
        setTimeout(() => {
          setBouncing(false);
          onComplete && onComplete();
        }, 600);
      } else {
        setActiveStrokeIdx(idx + 1);
      }
      return next;
    });
    // Reset fail count for this stroke
    setFailCounts((prev) => ({ ...prev, [idx]: 0 }));
  };

  const recordFail = (idx) => {
    setFailCounts((prev) => ({ ...prev, [idx]: (prev[idx] || 0) + 1 }));
  };

  const showHint = (idx) => (failCounts[idx] || 0) >= 2;

  if (!def) return null;

  const isStrokeDot = (stroke) => {
    return stroke.d === `M ${stroke.start[0]},${stroke.start[1]} L ${stroke.start[0]},${stroke.start[1]}`;
  };

  // Build the trace overlay polyline
  const tracePolyline = currentTrace && currentTrace.length > 1
    ? currentTrace.map(([x, y]) => `${x},${y}`).join(" ")
    : null;

  const viewBox = `0 0 ${CELL_W} ${CELL_H}`;

  return (
    <motion.div
      animate={bouncing ? { y: [0, -14, 0, -6, 0] } : {}}
      transition={{ duration: 0.5 }}
      style={{ display: "inline-flex", flexDirection: "column", alignItems: "center" }}
    >
      <svg
        ref={svgRef}
        viewBox={viewBox}
        width={CELL_W * scale}
        height={CELL_H * scale}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          touchAction: "none",
          userSelect: "none",
          display: "block",
          overflow: "visible",
          cursor: isActive && !letterDone ? "crosshair" : "default",
        }}
      >
        {/* 4-line ruled guide */}
        {/* Top line */}
        <line x1={2} y1={0} x2={CELL_W - 2} y2={0} stroke="#CBD5E1" strokeWidth={1} />
        {/* Dashed midline */}
        <line x1={2} y1={MIDLINE} x2={CELL_W - 2} y2={MIDLINE} stroke="#CBD5E1" strokeWidth={1} strokeDasharray="3 3" />
        {/* Baseline */}
        <line x1={2} y1={BASELINE} x2={CELL_W - 2} y2={BASELINE} stroke="#CBD5E1" strokeWidth={1} />
        {/* Descender line */}
        <line x1={2} y1={DESCENDER} x2={CELL_W - 2} y2={DESCENDER} stroke="#E2E8F0" strokeWidth={0.8} strokeDasharray="2 4" />

        {/* Letter strokes */}
        {def.strokes.map((stroke, idx) => {
          const isCompleted = completedStrokes.includes(idx);
          const isLocked = idx > activeStrokeIdx && !isCompleted;
          const isCurrentStroke = idx === activeStrokeIdx && !isCompleted;
          const hint = showHint(idx) && isCurrentStroke;

          // Dot letters (i-dot, j-dot) rendered as circle
          const isDot = !!stroke.isDot;

          if (isDot) {
            return (
              <circle
                key={idx}
                cx={stroke.start[0]}
                cy={stroke.start[1]}
                r={isCompleted ? 6 : hint ? 8 : 5}
                fill={isCompleted ? COMPLETE_COLOR : hint ? HINT_COLOR : DOT_COLOR}
                opacity={isLocked ? 0.3 : 1}
              >
                {hint && (
                  <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite" />
                )}
              </circle>
            );
          }

          return (
            <g key={idx}>
              {/* Hint glow behind */}
              {hint && (
                <path
                  d={stroke.d}
                  fill="none"
                  stroke={HINT_COLOR}
                  strokeWidth={18}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.5}
                >
                  <animate attributeName="opacity" values="0.5;0.15;0.5" dur="1.2s" repeatCount="indefinite" />
                </path>
              )}

              {/* Dotted guide path — always visible */}
              <path
                d={stroke.d}
                fill="none"
                stroke={isCompleted ? COMPLETE_COLOR : isLocked ? "#D1D5DB" : DOT_COLOR}
                strokeWidth={isCompleted ? 5 : 4}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={isCompleted ? "none" : DOT_DASH}
                opacity={isCompleted ? 0.9 : isLocked ? 0.25 : isActive ? 1 : 0.5}
              />

              {/* Start indicator arrow/circle for active stroke */}
              {isCurrentStroke && isActive && (
                <circle
                  cx={stroke.start[0]}
                  cy={stroke.start[1]}
                  r={7}
                  fill={hint ? HINT_COLOR : "#4ECDC4"}
                  opacity={0.9}
                >
                  <animate attributeName="r" values="6;9;6" dur="1.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.9;0.5;0.9" dur="1.4s" repeatCount="indefinite" />
                </circle>
              )}
            </g>
          );
        })}

        {/* Live trace overlay */}
        {tracePolyline && (
          <polyline
            points={tracePolyline}
            fill="none"
            stroke="#4ECDC4"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.7}
          />
        )}

        {/* Completion checkmark overlay */}
        {letterDone && (
          <motion.text
            x={CELL_W / 2}
            y={MIDLINE - 4}
            textAnchor="middle"
            fontSize={14}
            fill={THEME_COLOR}
            fontWeight="bold"
          >
            ✓
          </motion.text>
        )}
      </svg>
    </motion.div>
  );
}