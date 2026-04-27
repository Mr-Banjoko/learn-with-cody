/**
 * LetterCanvas
 * ============
 * The core guided-writing component for a SINGLE LETTER.
 *
 * Interaction model (research-backed):
 *  1. Child sees a ghost/guide path (light gray, dashed) showing the letter shape.
 *  2. A pulsing animated dot shows WHERE to start the stroke.
 *  3. Child touches and moves their finger.
 *  4. The app checks the touch path against predefined waypoints (distance formula).
 *  5. When enough waypoints are hit in order (65% threshold), the clean ideal stroke
 *     animates in ("snap-to-perfect") and the child's raw path is hidden.
 *  6. If the child misses badly, a gentle red flash appears and they can retry.
 *
 * Technical notes for Safari mobile:
 *  - Uses touchstart/touchmove/touchend (not pointer events) for max iOS compat.
 *  - All rendering via SVG (no Canvas API) for consistent scaling.
 *  - touch-action: none on the SVG element to prevent scroll interference.
 *  - The SVG viewBox is fixed at the letter definition's viewBox.
 *  - Scale factor is computed from rendered SVG size vs 100-unit grid.
 */
import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LETTER_DEFS, validateStroke, COMPLETION_THRESHOLD } from "../../lib/letterPaths";

const STROKE_COLOR = "#4A90C4";
const GUIDE_COLOR = "#CBD5E1";
const GHOST_STROKE_WIDTH = 8;
const IDEAL_STROKE_WIDTH = 10;
const CHILD_STROKE_WIDTH = 6;

// Animated start-dot: pulses at the beginning of each stroke
function StartDot({ cx, cy, color = STROKE_COLOR }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={10} fill={color} opacity={0.18} />
      <circle cx={cx} cy={cy} r={7} fill={color} opacity={0.9} />
      <circle cx={cx} cy={cy} r={3.5} fill="white" opacity={0.8} />
    </g>
  );
}

// Arrow hint showing swipe direction
function DirectionArrow({ x, y, hint }) {
  const arrowMap = {
    "down":        { dx: 0,   dy: 1  },
    "up":          { dx: 0,   dy: -1 },
    "right":       { dx: 1,   dy: 0  },
    "curve-left":  { dx: -1,  dy: -0.5 },
    "curve-right": { dx: 1,   dy: 0  },
    "down-right":  { dx: 0.7, dy: 0.7 },
    "down-left":   { dx: -0.7,dy: 0.7 },
    "dot":         { dx: 0,   dy: 0  },
  };
  const dir = arrowMap[hint] || { dx: 0, dy: 1 };
  const len = 18;
  const ex = x + dir.dx * len;
  const ey = y + dir.dy * len;
  if (hint === "dot") return null;
  return (
    <g opacity={0.7}>
      <line x1={x} y1={y} x2={ex} y2={ey} stroke={STROKE_COLOR} strokeWidth={3} strokeLinecap="round" />
      <polygon
        points={`${ex},${ey} ${ex - dir.dy * 5 - dir.dx * 7},${ey + dir.dx * 5 - dir.dy * 7} ${ex + dir.dy * 5 - dir.dx * 7},${ey - dir.dx * 5 - dir.dy * 7}`}
        fill={STROKE_COLOR}
      />
    </g>
  );
}

// SVG path that animates its stroke-dashoffset for "reveal" effect
function RevealPath({ d, strokeWidth = IDEAL_STROKE_WIDTH, color = STROKE_COLOR, delay = 0 }) {
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="1 0"
      initial={{ pathLength: 0, opacity: 1 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
    />
  );
}

export default function LetterCanvas({
  letter,
  onLetterComplete,
  onLetterFail,
  isActive = true,
  showGhost = false,
  size = 200, // rendered px size
}) {
  const letterDef = LETTER_DEFS[letter];
  const svgRef = useRef(null);

  // Which stroke we're currently on (0-indexed)
  const [currentStrokeIdx, setCurrentStrokeIdx] = useState(0);
  // Which strokes are completed (show ideal reveal)
  const [completedStrokes, setCompletedStrokes] = useState([]);
  // The child's live touch path for current stroke (SVG coords)
  const [livePath, setLivePath] = useState([]);
  // Wrong feedback flash
  const [wrongFlash, setWrongFlash] = useState(false);
  // Fully complete
  const [allDone, setAllDone] = useState(false);

  const touchPointsRef = useRef([]);
  const isDrawingRef = useRef(false);

  // Parse the viewBox to get grid dimensions
  const vbParts = letterDef?.viewBox?.split(" ").map(Number) || [0, 0, 100, 120];
  const gridW = vbParts[2];
  const gridH = vbParts[3];
  const scale = size / gridW;
  const svgHeight = gridH * scale;

  const resetForNextStroke = useCallback(() => {
    setLivePath([]);
    touchPointsRef.current = [];
    isDrawingRef.current = false;
  }, []);

  const handleStrokeComplete = useCallback((strokeIdx) => {
    const newCompleted = [...completedStrokes, strokeIdx];
    setCompletedStrokes(newCompleted);
    resetForNextStroke();

    const totalStrokes = letterDef?.strokes?.length || 1;
    if (newCompleted.length >= totalStrokes) {
      setAllDone(true);
      setTimeout(() => {
        onLetterComplete && onLetterComplete();
      }, 600);
    } else {
      setCurrentStrokeIdx(strokeIdx + 1);
    }
  }, [completedStrokes, letterDef, resetForNextStroke, onLetterComplete]);

  const getSvgPoint = useCallback((clientX, clientY) => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);

  // Touch handlers (Safari-compatible)
  const handleTouchStart = useCallback((e) => {
    if (!isActive || allDone) return;
    e.preventDefault();
    const touch = e.touches[0];
    const pt = getSvgPoint(touch.clientX, touch.clientY);
    if (!pt) return;
    isDrawingRef.current = true;
    touchPointsRef.current = [pt];
    setLivePath([pt]);
  }, [isActive, allDone, getSvgPoint]);

  const handleTouchMove = useCallback((e) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    const pt = getSvgPoint(touch.clientX, touch.clientY);
    if (!pt) return;
    touchPointsRef.current.push(pt);
    setLivePath([...touchPointsRef.current]);
  }, [getSvgPoint]);

  const handleTouchEnd = useCallback((e) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    isDrawingRef.current = false;

    const stroke = letterDef?.strokes?.[currentStrokeIdx];
    if (!stroke || !stroke.waypoints) return;

    const result = validateStroke(touchPointsRef.current, stroke.waypoints, scale);

    if (result.complete) {
      handleStrokeComplete(currentStrokeIdx);
    } else {
      // Wrong — gentle red flash, then clear
      setWrongFlash(true);
      onLetterFail && onLetterFail();
      setTimeout(() => {
        setWrongFlash(false);
        setLivePath([]);
        touchPointsRef.current = [];
      }, 600);
    }
  }, [currentStrokeIdx, letterDef, scale, handleStrokeComplete]);

  // Mouse fallback (desktop preview)
  const mouseDownRef = useRef(false);
  const handleMouseDown = useCallback((e) => {
    if (!isActive || allDone) return;
    const pt = getSvgPoint(e.clientX, e.clientY);
    if (!pt) return;
    mouseDownRef.current = true;
    touchPointsRef.current = [pt];
    setLivePath([pt]);
  }, [isActive, allDone, getSvgPoint]);

  const handleMouseMove = useCallback((e) => {
    if (!mouseDownRef.current) return;
    const pt = getSvgPoint(e.clientX, e.clientY);
    if (!pt) return;
    touchPointsRef.current.push(pt);
    setLivePath([...touchPointsRef.current]);
  }, [getSvgPoint]);

  const handleMouseUp = useCallback((e) => {
    if (!mouseDownRef.current) return;
    mouseDownRef.current = false;
    handleTouchEnd({ preventDefault: () => {} });
  }, [handleTouchEnd]);

  // Convert live path to SVG polyline points string
  const livePolyline = livePath.map((p) => `${p.x},${p.y}`).join(" ");

  if (!letterDef) return null;

  const currentStroke = letterDef.strokes[currentStrokeIdx];
  // First waypoint of current stroke = start dot position
  const startWp = currentStroke?.waypoints?.[0];
  const startDotX = startWp ? startWp[0] * scale : 50 * scale;
  const startDotY = startWp ? startWp[1] * scale : 50 * scale;

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: svgHeight,
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      <svg
        ref={svgRef}
        width={size}
        height={svgHeight}
        viewBox={`0 0 ${size} ${svgHeight}`}
        style={{
          touchAction: "none",
          cursor: isActive && !allDone ? "crosshair" : "default",
          display: "block",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Baseline and midline guide rules */}
        <line
          x1={0} y1={letterDef.baselineY * scale}
          x2={size} y2={letterDef.baselineY * scale}
          stroke={GUIDE_COLOR} strokeWidth={1.5} strokeDasharray="4,4" opacity={0.5}
        />
        <line
          x1={0} y1={letterDef.midlineY * scale}
          x2={size} y2={letterDef.midlineY * scale}
          stroke={GUIDE_COLOR} strokeWidth={1} strokeDasharray="2,4" opacity={0.35}
        />

        {/* Ghost/guide paths (light, dashed) — show ALL strokes as guide */}
        {showGhost && letterDef.strokes.map((stroke, si) => {
          if (completedStrokes.includes(si)) return null;
          return stroke.svgStrokes.map((s, pi) => (
            <path
              key={`ghost-${si}-${pi}`}
              d={s.d}
              fill="none"
              stroke={GUIDE_COLOR}
              strokeWidth={GHOST_STROKE_WIDTH}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="6,5"
              opacity={0.55}
              // Scale from 100-unit grid to actual px
              transform={`scale(${scale})`}
            />
          ));
        })}

        {/* Completed strokes — ideal reveal animation */}
        {completedStrokes.map((si) => {
          const stroke = letterDef.strokes[si];
          return stroke.svgStrokes.map((s, pi) => (
            <g key={`done-${si}-${pi}`} transform={`scale(${scale})`}>
              <RevealPath
                d={s.d}
                strokeWidth={IDEAL_STROKE_WIDTH / scale}
                color={allDone ? "#4ECDC4" : STROKE_COLOR}
                delay={pi * 0.15}
              />
            </g>
          ));
        })}

        {/* Child's live path (thin, faint — child sees their trace briefly) */}
        {livePath.length > 1 && (
          <polyline
            points={livePolyline}
            fill="none"
            stroke={wrongFlash ? "#FF6B6B" : STROKE_COLOR}
            strokeWidth={CHILD_STROKE_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.35}
          />
        )}

        {/* Wrong feedback: red tint flash on ghost */}
        {wrongFlash && currentStroke && currentStroke.svgStrokes.map((s, pi) => (
          <path
            key={`wrong-${pi}`}
            d={s.d}
            fill="none"
            stroke="#FF6B6B"
            strokeWidth={GHOST_STROKE_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.4}
            transform={`scale(${scale})`}
          />
        ))}

        {/* Start dot + direction arrow for current stroke */}
        {isActive && !allDone && currentStroke && (
          <>
            <StartDot cx={startDotX} cy={startDotY} />
            <DirectionArrow
              x={startDotX}
              y={startDotY}
              hint={currentStroke.startHint}
            />
          </>
        )}

        {/* All-done success glow overlay */}
        {allDone && (
          <circle
            cx={size / 2}
            cy={svgHeight / 2}
            r={size * 0.42}
            fill="#4ECDC418"
            stroke="#4ECDC455"
            strokeWidth={3}
          />
        )}
      </svg>

      {/* Stroke instruction hint (below canvas) */}
      {isActive && !allDone && currentStroke && (
        <div style={{
          position: "absolute",
          bottom: -24,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 12,
          color: "#94A3B8",
          fontFamily: "Fredoka, sans-serif",
          pointerEvents: "none",
        }}>
          {currentStroke.instruction}
        </div>
      )}
    </div>
  );
}