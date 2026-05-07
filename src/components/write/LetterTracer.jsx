/**
 * LetterTracer — renders one letter with its dotted guide paths on a 4-line ruled surface.
 * Handles touch-based stroke tracing with:
 *   - Stroke-order enforcement for multi-stroke letters
 *   - Start-point validation
 *   - Error counting → hint glow after 2 failures
 *   - Fill-in on correct stroke completion
 *   - Letter bounce on full completion
 *
 * Props:
 *   letter       {string}       — single lowercase letter
 *   active       {boolean}      — whether this letter accepts touch input
 *   onComplete   {()=>void}     — called when all strokes are done
 *   width        {number}       — rendered width in px
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { LETTER_DEFS, GUIDE } from "../../lib/letterPaths";

// Viewbox dimensions
const VW = 100;
const VH = 160;

// Tolerance for finger proximity to path points (in viewBox units)
const HIT_TOLERANCE = 18;
// Tolerance for start-point validation
const START_TOLERANCE = 22;
// Minimum points that must be hit to count stroke as traced
const COVERAGE_THRESHOLD = 0.55;
// Errors before hint shows
const HINT_THRESHOLD = 2;

const DOT_COLOR = "#A0AEC0";
const DOT_FILL_COLOR = "#4ECDC4";
const HINT_COLOR = "#FFD93D";
const ACTIVE_STROKE_COLOR = "#4D96FF";
const GUIDE_LINE_COLOR = "rgba(0,0,0,0.12)";
const GUIDE_DASH_COLOR = "rgba(0,0,0,0.18)";

function distance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/** Sample N+1 points evenly along an SVG path element */
function sampleSVGPath(pathEl, n = 24) {
  const len = pathEl.getTotalLength();
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const pt = pathEl.getPointAtLength((i / n) * len);
    pts.push({ x: pt.x, y: pt.y });
  }
  return pts;
}

/** For a dot stroke (single point like 'i' dot), return a cluster of points */
function isDotStroke(pathData) {
  // A "dot" is a path that starts and ends at the same point with no curve
  return /^M\s*[\d.]+,[\d.]+\s*L\s*[\d.]+,[\d.]+$/.test(pathData.trim()) &&
    pathData.split(",").length === 4;
}

export default function LetterTracer({ letter, active, onComplete, width = 100 }) {
  const def = LETTER_DEFS[letter];
  const numStrokes = def ? def.strokes.length : 0;

  const [completedStrokes, setCompletedStrokes] = useState([]); // indices of completed strokes
  const [activeStrokeIdx, setActiveStrokeIdx] = useState(0);
  const [errors, setErrors] = useState({}); // {strokeIdx: count}
  const [drawing, setDrawing] = useState(false);
  const [drawPoints, setDrawPoints] = useState([]);
  const [bouncing, setBouncing] = useState(false);

  const svgRef = useRef(null);
  const pathRefs = useRef({});
  const sampledPtsRef = useRef({}); // {strokeIdx: [{x,y},...]}

  // Scale factor from viewBox to rendered pixels
  const scale = width / VW;

  // Reset when letter changes
  useEffect(() => {
    setCompletedStrokes([]);
    setActiveStrokeIdx(0);
    setErrors({});
    setDrawing(false);
    setDrawPoints([]);
    setBouncing(false);
    sampledPtsRef.current = {};
  }, [letter]);

  // Pre-sample path points when SVG mounts
  const registerPathRef = useCallback((strokeIdx, el) => {
    pathRefs.current[strokeIdx] = el;
    if (el && !sampledPtsRef.current[strokeIdx]) {
      const pts = sampleSVGPath(el, 28);
      sampledPtsRef.current[strokeIdx] = pts;
    }
  }, []);

  const toViewBox = useCallback((clientX, clientY) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * VW,
      y: ((clientY - rect.top) / rect.height) * VH,
    };
  }, []);

  const handleTouchStart = useCallback((e) => {
    if (!active || completedStrokes.length >= numStrokes) return;
    e.preventDefault();
    const touch = e.touches[0];
    const pt = toViewBox(touch.clientX, touch.clientY);

    const targetStroke = def.strokes[activeStrokeIdx];
    const isDot = isDotStroke(targetStroke.pathData);
    const startPt = targetStroke.startPoint;
    const distToStart = distance(pt, startPt);

    if (!isDot && distToStart > START_TOLERANCE) {
      // Started in the wrong place — count as error
      const newErrors = { ...errors, [activeStrokeIdx]: (errors[activeStrokeIdx] || 0) + 1 };
      setErrors(newErrors);
      return;
    }

    setDrawing(true);
    setDrawPoints([pt]);
  }, [active, activeStrokeIdx, completedStrokes, numStrokes, def, errors, toViewBox]);

  const handleTouchMove = useCallback((e) => {
    if (!drawing) return;
    e.preventDefault();
    const touch = e.touches[0];
    const pt = toViewBox(touch.clientX, touch.clientY);
    setDrawPoints((prev) => [...prev, pt]);
  }, [drawing, toViewBox]);

  const handleTouchEnd = useCallback((e) => {
    if (!drawing) return;
    e.preventDefault();
    setDrawing(false);

    if (drawPoints.length < 3) {
      setDrawPoints([]);
      return;
    }

    const targetStroke = def.strokes[activeStrokeIdx];
    const isDot = isDotStroke(targetStroke.pathData);

    let success = false;

    if (isDot) {
      // For dot strokes, just check proximity to the dot location
      const startPt = targetStroke.startPoint;
      const closest = drawPoints.reduce((best, p) => {
        const d = distance(p, startPt);
        return d < best ? d : best;
      }, Infinity);
      success = closest < HIT_TOLERANCE * 1.5;
    } else {
      // Validate against sampled path points
      const sampledPts = sampledPtsRef.current[activeStrokeIdx] || [];
      if (sampledPts.length === 0) {
        success = true; // fallback
      } else {
        let hitCount = 0;
        for (const sp of sampledPts) {
          const hit = drawPoints.some((dp) => distance(dp, sp) < HIT_TOLERANCE);
          if (hit) hitCount++;
        }
        success = hitCount / sampledPts.length >= COVERAGE_THRESHOLD;
      }
    }

    setDrawPoints([]);

    if (success) {
      const newCompleted = [...completedStrokes, activeStrokeIdx];
      setCompletedStrokes(newCompleted);

      const nextIdx = activeStrokeIdx + 1;
      if (nextIdx >= numStrokes) {
        // All strokes done — bounce and notify
        setBouncing(true);
        setTimeout(() => {
          setBouncing(false);
          onComplete && onComplete();
        }, 600);
      } else {
        setActiveStrokeIdx(nextIdx);
      }
    } else {
      const newErrors = { ...errors, [activeStrokeIdx]: (errors[activeStrokeIdx] || 0) + 1 };
      setErrors(newErrors);
    }
  }, [drawing, drawPoints, activeStrokeIdx, completedStrokes, numStrokes, def, errors, onComplete]);

  if (!def) {
    return <div style={{ width, height: (VH / VW) * width }}>{letter}</div>;
  }

  const height = (VH / VW) * width;
  const isCompleted = completedStrokes.length >= numStrokes;

  // Build dot pattern for a path
  const DottedPath = ({ strokeIdx, pathData, done, isActiveNow, showHint }) => {
    const locked = strokeIdx > activeStrokeIdx && !done;
    const dotColor = done
      ? DOT_FILL_COLOR
      : showHint
      ? HINT_COLOR
      : isActiveNow
      ? DOT_COLOR
      : DOT_COLOR;

    const isDot = isDotStroke(pathData);

    if (isDot) {
      // Render as a circle dot (for i/j dots)
      const sp = def.strokes[strokeIdx].startPoint;
      const r = 5;
      return (
        <circle
          cx={sp.x}
          cy={sp.y}
          r={r}
          fill={done ? DOT_FILL_COLOR : showHint ? HINT_COLOR : "#A0AEC0"}
          opacity={locked ? 0.35 : 1}
          style={showHint ? { filter: "drop-shadow(0 0 4px #FFD93D)" } : {}}
        />
      );
    }

    return (
      <>
        {/* Invisible path for ref/sampling */}
        <path
          ref={(el) => registerPathRef(strokeIdx, el)}
          d={pathData}
          fill="none"
          stroke="none"
        />
        {/* Dotted visual path */}
        <path
          d={pathData}
          fill="none"
          stroke={dotColor}
          strokeWidth={done ? 5 : 4}
          strokeLinecap="round"
          strokeDasharray={done ? "none" : "4 8"}
          opacity={locked ? 0.3 : done ? 0.9 : 1}
          style={showHint ? { filter: "drop-shadow(0 0 5px #FFD93D)", animation: "hintPulse 1s ease-in-out infinite" } : {}}
        />
        {/* Start arrow indicator (small circle at start point) */}
        {isActiveNow && !done && (
          <circle
            cx={def.strokes[strokeIdx].startPoint.x}
            cy={def.strokes[strokeIdx].startPoint.y}
            r={6}
            fill={showHint ? HINT_COLOR : "#4D96FF"}
            opacity={0.85}
          />
        )}
      </>
    );
  };

  // Convert draw points to SVG polyline
  const drawPathStr = drawPoints.length > 1
    ? `M ${drawPoints.map((p) => `${p.x},${p.y}`).join(" L ")}`
    : "";

  return (
    <motion.div
      animate={bouncing ? { y: [0, -12, 0, -6, 0] } : {}}
      transition={{ duration: 0.5 }}
      style={{ position: "relative", width, height, flexShrink: 0 }}
    >
      <style>{`
        @keyframes hintPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VW} ${VH}`}
        width={width}
        height={height}
        style={{
          display: "block",
          touchAction: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
          cursor: active && !isCompleted ? "crosshair" : "default",
          borderRadius: 12,
          background: "rgba(255,255,255,0.7)",
          boxShadow: active && !isCompleted ? "0 0 0 2.5px #4ECDC444" : "none",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* ── Guide lines ── */}
        {/* Top line */}
        <line x1={4} y1={GUIDE.T + 4} x2={VW - 4} y2={GUIDE.T + 4} stroke={GUIDE_LINE_COLOR} strokeWidth={1} />
        {/* Dashed midline */}
        <line x1={4} y1={GUIDE.M} x2={VW - 4} y2={GUIDE.M} stroke={GUIDE_DASH_COLOR} strokeWidth={1} strokeDasharray="3 4" />
        {/* Baseline */}
        <line x1={4} y1={GUIDE.B} x2={VW - 4} y2={GUIDE.B} stroke={GUIDE_LINE_COLOR} strokeWidth={1.2} />
        {/* Descender line */}
        <line x1={4} y1={GUIDE.D - 2} x2={VW - 4} y2={GUIDE.D - 2} stroke={GUIDE_LINE_COLOR} strokeWidth={1} />

        {/* ── Letter strokes (dotted) ── */}
        {def.strokes.map((s, idx) => {
          const done = completedStrokes.includes(idx);
          const isActiveNow = idx === activeStrokeIdx && !done;
          const showHint = isActiveNow && (errors[idx] || 0) >= HINT_THRESHOLD;
          return (
            <DottedPath
              key={idx}
              strokeIdx={idx}
              pathData={s.pathData}
              done={done}
              isActiveNow={isActiveNow}
              showHint={showHint}
            />
          );
        })}

        {/* ── User's live drawing ── */}
        {drawing && drawPathStr && (
          <path
            d={drawPathStr}
            fill="none"
            stroke={ACTIVE_STROKE_COLOR}
            strokeWidth={4.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.7}
          />
        )}
      </svg>

      {/* Completed checkmark overlay */}
      {isCompleted && (
        <div
          style={{
            position: "absolute",
            bottom: 4,
            right: 4,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#4ECDC4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            color: "white",
            fontWeight: 700,
          }}
        >
          ✓
        </div>
      )}
    </motion.div>
  );
}