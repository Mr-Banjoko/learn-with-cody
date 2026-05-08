/**
 * TracingLetter
 *
 * Renders a single letter as a guided tracing exercise.
 * Uses pointer events (works on touch, mouse, stylus, tablet).
 * Validation via checkpoint + corridor model from tracingRecognition.js.
 *
 * Props:
 *   letter       {string}   — lowercase letter
 *   isActive     {boolean}  — whether this letter accepts input
 *   onComplete   {()=>void} — called when all strokes are done
 *   scale        {number}   — scale applied to 60×100 cell
 *   config       {object}   — optional override for recognition config
 *   bouncing     {boolean}  — external bounce trigger (for completion sequence)
 */

import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { LETTER_DEFS, LETTER_CELL } from "../../lib/letterPaths";
import {
  samplePathD,
  buildCheckpoints,
  createStrokeSession,
  updateStrokeSession,
  finalizeStrokeSession,
  validateDotStroke,
  DEFAULT_CONFIG,
} from "../../lib/tracingRecognition";

// ── Constants ──────────────────────────────────────────────────────────────────
const CELL_W    = LETTER_CELL.w;
const CELL_H    = LETTER_CELL.h;
const MIDLINE   = LETTER_CELL.midline;
const BASELINE  = LETTER_CELL.baseline;
const DESCENDER = LETTER_CELL.descender;

const THEME_COLOR    = "#4ECDC4";
const HINT_COLOR     = "#FFD93D";
const DOT_COLOR      = "#AAAAAA";
const COMPLETE_COLOR = "#4ECDC4";
const DOT_DASH       = "5 6";

const SHOW_CHECKPOINTS = false;

// ── Directional arrow config per letter per stroke ─────────────────────────────
// angle in degrees: 0=right, 90=down, 180=left, 270=up
// -45=up-right(↗), 45=down-right(↘), 135=down-left(↙), -135=up-left(↖)
const ARROW_ANGLES = {
  a:  [225, 90],   // Stroke1: ↙ (c-arc starts upper-right going left-down), Stroke2: ↓
  b:  [90,  135],  // ↓, ↘
  c:  [225],       // ↙
  d:  [225, 90],   // ↙, ↓
  e:  [0],         // → (starts going right across midline)
  f:  [90,  0],    // ↓, →
  g:  [225],       // ↙
  h:  [90,  90],   // ↓, ↓
  i:  [90,  90],   // ↓, ↓ (dot tap)
  j:  [90,  90],   // ↓, ↓ (dot tap)
  k:  [90,  135],  // ↓, ↘
  l:  [90],        // ↓
  m:  [270, 270],  // ↑, ↑
  n:  [270, 270],  // ↑, ↑
  o:  [225],       // ↙
  p:  [90,  135],  // ↓, ↘
  q:  [225, 90],   // ↙, ↓
  r:  [90,  0],    // ↓, →
  s:  [225],       // ↙
  t:  [90,  0],    // ↓, →
  u:  [90,  270],  // ↓, ↑
  v:  [135],       // ↘
  w:  [135],       // ↘
  x:  [135, 225],  // ↘, ↙
  y:  [135],       // ↘
  z:  [0],         // →
};

/**
 * Renders a directional arrow SVG group at (cx, cy) with given angle (degrees).
 * Size matches the old pulsing start circle (~r=7 area).
 */
function DirectionalArrow({ cx, cy, angleDeg, color, hint }) {
  const rad = (angleDeg * Math.PI) / 180;
  const arrowLen = 9;
  const headSize = 5;

  // Arrow tip
  const tx = cx + Math.cos(rad) * arrowLen;
  const ty = cy + Math.sin(rad) * arrowLen;
  // Arrow tail
  const bx = cx - Math.cos(rad) * arrowLen;
  const by = cy - Math.sin(rad) * arrowLen;

  // Arrowhead wings (perpendicular to direction)
  const perp = rad + Math.PI / 2;
  const w1x = tx - Math.cos(rad) * headSize + Math.cos(perp) * (headSize * 0.5);
  const w1y = ty - Math.sin(rad) * headSize + Math.sin(perp) * (headSize * 0.5);
  const w2x = tx - Math.cos(rad) * headSize - Math.cos(perp) * (headSize * 0.5);
  const w2y = ty - Math.sin(rad) * headSize - Math.sin(perp) * (headSize * 0.5);

  const arrowColor = hint ? HINT_COLOR : color;

  return (
    <g>
      {/* Glow background circle (same pulse as old dot) */}
      <circle cx={cx} cy={cy} r={9} fill={arrowColor} opacity={0.25}>
        <animate attributeName="r"       values="7;11;7"     dur="1.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.25;0.08;0.25" dur="1.4s" repeatCount="indefinite" />
      </circle>
      {/* Shaft */}
      <line
        x1={bx} y1={by} x2={tx} y2={ty}
        stroke={arrowColor}
        strokeWidth={2.5}
        strokeLinecap="round"
        opacity={0.95}
      >
        <animate attributeName="opacity" values="0.95;0.5;0.95" dur="1.4s" repeatCount="indefinite" />
      </line>
      {/* Head */}
      <polyline
        points={`${w1x},${w1y} ${tx},${ty} ${w2x},${w2y}`}
        fill="none"
        stroke={arrowColor}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.95}
      >
        <animate attributeName="opacity" values="0.95;0.5;0.95" dur="1.4s" repeatCount="indefinite" />
      </polyline>
    </g>
  );
}

export default function TracingLetter({
  letter,
  isActive,
  onComplete,
  scale = 1,
  config = {},
  bouncing: externalBouncing = false,
}) {
  const def = LETTER_DEFS[letter];
  const numStrokes = def?.strokes?.length ?? 1;
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  const [completedStrokes, setCompletedStrokes]   = useState([]);
  const [activeStrokeIdx, setActiveStrokeIdx]     = useState(0);
  const [failCounts, setFailCounts]               = useState({});
  const [letterDone, setLetterDone]               = useState(false);
  const [internalBouncing, setInternalBouncing]   = useState(false);
  const [currentTrace, setCurrentTrace]           = useState(null);
  const [checkpointIndex, setCheckpointIndex]     = useState(0);

  const svgRef        = useRef(null);
  const sessionRef    = useRef(null);
  const guideCache    = useRef({});
  const checkptsCache = useRef({});

  // External bounce (from WriteGame completion sequence) takes priority
  const isBouncing = externalBouncing || internalBouncing;

  const getGuidePoints = useCallback((strokeIdx) => {
    if (guideCache.current[strokeIdx]) return guideCache.current[strokeIdx];
    const stroke = def?.strokes?.[strokeIdx];
    if (!stroke?.d) return [];
    const pts = samplePathD(stroke.d, 80);
    guideCache.current[strokeIdx] = pts;
    return pts;
  }, [def]);

  const getCheckpoints = useCallback((strokeIdx) => {
    if (checkptsCache.current[strokeIdx]) return checkptsCache.current[strokeIdx];
    const pts = getGuidePoints(strokeIdx);
    const cps = buildCheckpoints(pts, mergedConfig.CHECKPOINT_COUNT);
    checkptsCache.current[strokeIdx] = cps;
    return cps;
  }, [getGuidePoints, mergedConfig.CHECKPOINT_COUNT]);

  const toSVGCoords = useCallback((clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return [0, 0];
    const rect = svg.getBoundingClientRect();
    return [
      ((clientX - rect.left) / rect.width)  * CELL_W,
      ((clientY - rect.top)  / rect.height) * CELL_H,
    ];
  }, []);

  const markStrokeComplete = useCallback((idx) => {
    setFailCounts((prev) => ({ ...prev, [idx]: 0 }));
    setCompletedStrokes((prev) => {
      const next = [...prev, idx];
      if (next.length === numStrokes) {
        setInternalBouncing(true);
        setLetterDone(true);
        setTimeout(() => {
          setInternalBouncing(false);
          onComplete?.();
        }, 600);
      } else {
        setActiveStrokeIdx(idx + 1);
        setCheckpointIndex(0);
      }
      return next;
    });
  }, [numStrokes, onComplete]);

  const recordFail = useCallback((idx) => {
    setFailCounts((prev) => ({ ...prev, [idx]: (prev[idx] || 0) + 1 }));
  }, []);

  const handlePointerDown = useCallback((e) => {
    if (!isActive || letterDone) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);

    const pt = toSVGCoords(e.clientX, e.clientY);
    const strokeIdx = activeStrokeIdx;
    const stroke = def?.strokes?.[strokeIdx];
    if (!stroke) return;

    if (stroke.isDot) {
      sessionRef.current = { isDot: true, strokeIdx, dotCenter: stroke.start };
      return;
    }

    const startDist = Math.hypot(pt[0] - stroke.start[0], pt[1] - stroke.start[1]);
    if (startDist > mergedConfig.START_TOLERANCE) {
      sessionRef.current = { tooFarFromStart: true, strokeIdx };
      return;
    }

    const guidePoints = getGuidePoints(strokeIdx);
    const session = createStrokeSession(stroke, guidePoints, mergedConfig);
    session.started = true;
    updateStrokeSession(session, pt);
    sessionRef.current = session;
    setCurrentTrace([pt]);
    setCheckpointIndex(session.checkpointIndex);
  }, [isActive, letterDone, activeStrokeIdx, def, mergedConfig, getGuidePoints, toSVGCoords]);

  const handlePointerMove = useCallback((e) => {
    if (!isActive || letterDone) return;
    const session = sessionRef.current;
    if (!session || session.isDot || session.tooFarFromStart || !session.started) return;
    e.preventDefault();
    const pt = toSVGCoords(e.clientX, e.clientY);
    updateStrokeSession(session, pt);
    setCurrentTrace([...session.trace]);
    setCheckpointIndex(session.checkpointIndex);
  }, [isActive, letterDone, toSVGCoords]);

  const handlePointerUp = useCallback((e) => {
    if (!isActive || letterDone) return;
    const session = sessionRef.current;
    sessionRef.current = null;
    setCurrentTrace(null);
    if (!session) return;
    const strokeIdx = session.strokeIdx ?? activeStrokeIdx;

    if (session.isDot) {
      const pt = toSVGCoords(e.clientX, e.clientY);
      const ok = validateDotStroke(pt, session.dotCenter, mergedConfig.DOT_TOLERANCE);
      if (ok) markStrokeComplete(strokeIdx);
      else recordFail(strokeIdx);
      return;
    }

    if (session.tooFarFromStart) {
      recordFail(strokeIdx);
      return;
    }

    if (!session.started) return;
    const result = finalizeStrokeSession(session);
    if (result.valid) markStrokeComplete(strokeIdx);
    else recordFail(strokeIdx);
  }, [isActive, letterDone, activeStrokeIdx, mergedConfig, toSVGCoords, markStrokeComplete, recordFail]);

  const showHint = (idx) => (failCounts[idx] || 0) >= 2;

  if (!def) return null;

  const tracePolyline = currentTrace && currentTrace.length > 1
    ? currentTrace.map(([x, y]) => `${x},${y}`).join(" ")
    : null;

  const arrowAngles = ARROW_ANGLES[letter] || [];

  return (
    <motion.div
      animate={isBouncing ? { y: [0, -14, 0, -6, 0] } : { y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ display: "inline-flex", flexDirection: "column", alignItems: "center" }}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${CELL_W} ${CELL_H}`}
        width={CELL_W * scale}
        height={CELL_H * scale}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          touchAction: "none",
          userSelect: "none",
          display: "block",
          overflow: "visible",
          cursor: isActive && !letterDone ? "crosshair" : "default",
        }}
      >
        {/* 4-line ruled guide */}
        <line x1={2} y1={0}         x2={CELL_W-2} y2={0}         stroke="#CBD5E1" strokeWidth={1} />
        <line x1={2} y1={MIDLINE}   x2={CELL_W-2} y2={MIDLINE}   stroke="#CBD5E1" strokeWidth={1} strokeDasharray="3 3" />
        <line x1={2} y1={BASELINE}  x2={CELL_W-2} y2={BASELINE}  stroke="#CBD5E1" strokeWidth={1} />
        <line x1={2} y1={DESCENDER} x2={CELL_W-2} y2={DESCENDER} stroke="#E2E8F0" strokeWidth={0.8} strokeDasharray="2 4" />

        {/* Strokes */}
        {def.strokes.map((stroke, idx) => {
          const isCompleted     = completedStrokes.includes(idx);
          const isLocked        = idx > activeStrokeIdx && !isCompleted;
          const isCurrentStroke = idx === activeStrokeIdx && !isCompleted;
          const hint            = showHint(idx) && isCurrentStroke;
          const isDot           = !!stroke.isDot;

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

          const checkpoints = SHOW_CHECKPOINTS && isCurrentStroke
            ? getCheckpoints(idx)
            : [];

          const angleDeg = arrowAngles[idx] ?? 90;

          return (
            <g key={idx}>
              {/* Hint glow path */}
              {hint && (
                <path
                  d={stroke.d}
                  fill="none"
                  stroke={HINT_COLOR}
                  strokeWidth={20}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.45}
                >
                  <animate attributeName="opacity" values="0.45;0.12;0.45" dur="1.2s" repeatCount="indefinite" />
                </path>
              )}

              {/* Dotted guide path */}
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

              {/* Directional arrow at start position (replaces glowing dot) */}
              {isCurrentStroke && isActive && (
                <DirectionalArrow
                  cx={stroke.start[0]}
                  cy={stroke.start[1]}
                  angleDeg={angleDeg}
                  color={THEME_COLOR}
                  hint={hint}
                />
              )}

              {/* Checkpoint debug dots */}
              {SHOW_CHECKPOINTS && checkpoints.map((cp, ci) => (
                <circle
                  key={ci}
                  cx={cp[0]}
                  cy={cp[1]}
                  r={ci === checkpointIndex ? 4 : 2}
                  fill={ci < checkpointIndex ? "#4ECDC4" : ci === checkpointIndex ? "#FFD93D" : "#94A3B8"}
                  opacity={ci < checkpointIndex ? 0.6 : 0.9}
                >
                  {ci === checkpointIndex && (
                    <animate attributeName="r" values="3;5;3" dur="0.8s" repeatCount="indefinite" />
                  )}
                </circle>
              ))}
            </g>
          );
        })}

        {/* Live trace */}
        {tracePolyline && (
          <polyline
            points={tracePolyline}
            fill="none"
            stroke={THEME_COLOR}
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.75}
          />
        )}
      </svg>
    </motion.div>
  );
}