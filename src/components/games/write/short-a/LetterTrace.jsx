import { useRef, useState, useEffect, useCallback } from "react";

// ─── Layout constants (normalised 0-1) ───────────────────────────────────────
// TOP  = 0.05  solid line  — top of writing zone / where ascenders start
// MID  = 0.38  dashed line — x-height (top of short-letter body)
// BASE = 0.65  solid line  — baseline
// DESC = 0.95  implicit    — bottom of descender zone
//
// Short letters:  body between MID(0.38) and BASE(0.65)
// Ascenders:      stem starts at TOP(0.05), body top at MID(0.38)
// Descenders:     body in MID–BASE zone, tail reaches down to ~0.90–0.95
// ─────────────────────────────────────────────────────────────────────────────

const T = 0.05;   // top line
const M = 0.38;   // middle dashed line
const B = 0.65;   // baseline

const LETTER_STROKES = {
  // ── SHORT LETTERS (body between M and B) ───────────────────────────────────
  a: [
    // oval: starts at mid-right, goes CCW
    { points: [
      { x: 0.62, y: 0.44 }, { x: 0.52, y: M+0.01 }, { x: 0.40, y: M+0.01 },
      { x: 0.28, y: 0.44 }, { x: 0.24, y: 0.52 }, { x: 0.28, y: 0.59 },
      { x: 0.40, y: B },    { x: 0.52, y: B },    { x: 0.62, y: 0.59 },
    ]},
    // right stem: top to base
    { points: [{ x: 0.62, y: M+0.01 }, { x: 0.62, y: B }] },
  ],

  b: [
    // tall stem: top line down to base
    { points: [{ x: 0.30, y: T }, { x: 0.30, y: B }] },
    // bump: from mid down
    { points: [
      { x: 0.30, y: M+0.05 }, { x: 0.42, y: M+0.01 }, { x: 0.58, y: M+0.04 },
      { x: 0.66, y: 0.48 },   { x: 0.66, y: 0.57 },   { x: 0.58, y: B-0.01 },
      { x: 0.42, y: B },      { x: 0.30, y: B },
    ]},
  ],

  c: [
    { points: [
      { x: 0.66, y: 0.44 }, { x: 0.55, y: M+0.01 }, { x: 0.42, y: M+0.01 },
      { x: 0.30, y: 0.44 }, { x: 0.24, y: 0.52 }, { x: 0.30, y: 0.59 },
      { x: 0.42, y: B },    { x: 0.55, y: B },    { x: 0.66, y: 0.59 },
    ]},
  ],

  d: [
    // oval in x-height zone
    { points: [
      { x: 0.58, y: 0.45 }, { x: 0.48, y: M+0.01 }, { x: 0.36, y: M+0.01 },
      { x: 0.26, y: 0.45 }, { x: 0.22, y: 0.52 }, { x: 0.26, y: 0.59 },
      { x: 0.36, y: B },    { x: 0.48, y: B },    { x: 0.58, y: 0.59 },
    ]},
    // tall stem: top line down to base
    { points: [{ x: 0.62, y: T }, { x: 0.62, y: B }] },
  ],

  e: [
    { points: [
      { x: 0.26, y: 0.52 }, { x: 0.40, y: 0.45 }, { x: 0.56, y: 0.45 },
      { x: 0.66, y: 0.52 }, { x: 0.66, y: 0.59 }, { x: 0.56, y: B-0.01 },
      { x: 0.40, y: B },    { x: 0.26, y: 0.59 }, { x: 0.24, y: 0.52 },
      { x: 0.26, y: 0.44 }, { x: 0.38, y: M+0.01 }, { x: 0.56, y: M+0.01 },
      { x: 0.66, y: 0.44 },
    ]},
  ],

  f: [
    // curved stem: starts at top, curves right at top, descends past base
    { points: [
      { x: 0.62, y: T+0.04 }, { x: 0.52, y: T },    { x: 0.42, y: T+0.02 },
      { x: 0.36, y: T+0.08 }, { x: 0.36, y: B },     { x: 0.36, y: 0.90 },
    ]},
    // crossbar at middle line
    { points: [{ x: 0.18, y: M }, { x: 0.58, y: M }] },
  ],

  g: [
    // oval in x-height zone + descender tail
    { points: [
      { x: 0.65, y: 0.45 }, { x: 0.54, y: M+0.01 }, { x: 0.42, y: M+0.01 },
      { x: 0.30, y: 0.45 }, { x: 0.24, y: 0.52 }, { x: 0.30, y: 0.59 },
      { x: 0.42, y: B },    { x: 0.54, y: B-0.01 }, { x: 0.65, y: 0.58 },
      { x: 0.65, y: M+0.01 },
      { x: 0.65, y: 0.78 }, { x: 0.60, y: 0.88 }, { x: 0.48, y: 0.92 },
      { x: 0.36, y: 0.88 },
    ]},
  ],

  h: [
    // tall stem
    { points: [{ x: 0.28, y: T }, { x: 0.28, y: B }] },
    // arch and right leg — arch rises to middle line
    { points: [
      { x: 0.28, y: M+0.08 }, { x: 0.38, y: M+0.01 }, { x: 0.52, y: M+0.01 },
      { x: 0.64, y: M+0.07 }, { x: 0.68, y: M+0.16 }, { x: 0.68, y: B },
    ]},
  ],

  i: [
    // body: mid to base
    { points: [{ x: 0.44, y: M+0.04 }, { x: 0.44, y: B }] },
    // dot: just above mid line
    { points: [{ x: 0.44, y: M-0.05 }, { x: 0.44, y: M-0.04 }], isDot: true },
  ],

  j: [
    // body: mid, curves below base as descender
    { points: [
      { x: 0.52, y: M+0.04 }, { x: 0.52, y: 0.80 },
      { x: 0.46, y: 0.88 },   { x: 0.36, y: 0.90 }, { x: 0.28, y: 0.86 },
    ]},
    // dot: just above mid line
    { points: [{ x: 0.52, y: M-0.05 }, { x: 0.52, y: M-0.04 }], isDot: true },
  ],

  k: [
    // tall stem
    { points: [{ x: 0.30, y: T }, { x: 0.30, y: B }] },
    // upper diagonal: from mid area down to centre
    { points: [{ x: 0.68, y: M+0.01 }, { x: 0.30, y: 0.52 }] },
    // lower diagonal: from centre down to base
    { points: [{ x: 0.30, y: 0.52 }, { x: 0.68, y: B }] },
  ],

  l: [
    { points: [
      { x: 0.40, y: T }, { x: 0.40, y: B-0.02 },
      { x: 0.46, y: B }, { x: 0.54, y: B },
    ]},
  ],

  m: [
    // left leg
    { points: [{ x: 0.12, y: M+0.04 }, { x: 0.12, y: B }] },
    // first arch
    { points: [
      { x: 0.12, y: M+0.10 }, { x: 0.22, y: M+0.01 }, { x: 0.36, y: M+0.01 },
      { x: 0.46, y: M+0.07 }, { x: 0.50, y: M+0.16 }, { x: 0.50, y: B },
    ]},
    // second arch
    { points: [
      { x: 0.50, y: M+0.10 }, { x: 0.60, y: M+0.01 }, { x: 0.72, y: M+0.01 },
      { x: 0.80, y: M+0.07 }, { x: 0.84, y: M+0.16 }, { x: 0.84, y: B },
    ]},
  ],

  n: [
    // left leg
    { points: [{ x: 0.22, y: M+0.04 }, { x: 0.22, y: B }] },
    // arch and right leg
    { points: [
      { x: 0.22, y: M+0.10 }, { x: 0.32, y: M+0.01 }, { x: 0.46, y: M+0.01 },
      { x: 0.58, y: M+0.07 }, { x: 0.62, y: M+0.16 }, { x: 0.62, y: B },
    ]},
  ],

  o: [
    { points: [
      { x: 0.50, y: M+0.01 }, { x: 0.38, y: M+0.01 }, { x: 0.26, y: 0.45 },
      { x: 0.22, y: 0.52 },   { x: 0.26, y: 0.59 },   { x: 0.38, y: B },
      { x: 0.50, y: B },      { x: 0.62, y: 0.59 },   { x: 0.66, y: 0.52 },
      { x: 0.62, y: 0.45 },   { x: 0.50, y: M+0.01 },
    ]},
  ],

  p: [
    // stem: from mid, descends below base
    { points: [{ x: 0.30, y: M+0.04 }, { x: 0.30, y: 0.90 }] },
    // bump: oval in x-height zone
    { points: [
      { x: 0.30, y: M+0.04 }, { x: 0.44, y: M+0.01 }, { x: 0.58, y: M+0.06 },
      { x: 0.64, y: 0.47 },   { x: 0.64, y: 0.57 },   { x: 0.58, y: B-0.01 },
      { x: 0.44, y: B },      { x: 0.30, y: B-0.03 },
    ]},
  ],

  q: [
    // oval + right stem descending
    { points: [
      { x: 0.62, y: 0.45 }, { x: 0.50, y: M+0.01 }, { x: 0.38, y: M+0.01 },
      { x: 0.26, y: 0.45 }, { x: 0.22, y: 0.52 }, { x: 0.26, y: 0.59 },
      { x: 0.38, y: B },    { x: 0.50, y: B },    { x: 0.62, y: 0.59 },
      { x: 0.62, y: M+0.01 },
    ]},
    // tail: base down to descender
    { points: [{ x: 0.62, y: B }, { x: 0.62, y: 0.90 }] },
  ],

  r: [
    { points: [{ x: 0.26, y: M+0.04 }, { x: 0.26, y: B }] },
    { points: [
      { x: 0.26, y: M+0.10 }, { x: 0.36, y: M+0.01 }, { x: 0.52, y: M+0.01 },
      { x: 0.62, y: M+0.07 },
    ]},
  ],

  s: [
    { points: [
      { x: 0.65, y: 0.43 }, { x: 0.54, y: M+0.01 }, { x: 0.40, y: M+0.01 },
      { x: 0.28, y: 0.43 }, { x: 0.28, y: 0.50 }, { x: 0.40, y: 0.52 },
      { x: 0.52, y: 0.54 }, { x: 0.66, y: 0.58 }, { x: 0.66, y: B-0.03 },
      { x: 0.54, y: B },    { x: 0.40, y: B },    { x: 0.28, y: B-0.04 },
    ]},
  ],

  t: [
    // stem: from top line (not quite the very top) down to base
    { points: [{ x: 0.44, y: T+0.02 }, { x: 0.44, y: B }] },
    // crossbar at middle line
    { points: [{ x: 0.22, y: M }, { x: 0.68, y: M }] },
  ],

  u: [
    { points: [
      { x: 0.28, y: M+0.01 }, { x: 0.28, y: B-0.08 },
      { x: 0.34, y: B-0.02 }, { x: 0.44, y: B }, { x: 0.56, y: B-0.02 },
      { x: 0.62, y: B-0.08 }, { x: 0.62, y: M+0.01 },
    ]},
    { points: [{ x: 0.62, y: M+0.01 }, { x: 0.62, y: B }] },
  ],

  v: [
    { points: [{ x: 0.24, y: M+0.01 }, { x: 0.44, y: B }, { x: 0.66, y: M+0.01 }] },
  ],

  w: [
    { points: [
      { x: 0.12, y: M+0.01 }, { x: 0.26, y: B }, { x: 0.44, y: 0.50 },
      { x: 0.62, y: B },      { x: 0.78, y: M+0.01 },
    ]},
  ],

  x: [
    { points: [{ x: 0.24, y: M+0.01 }, { x: 0.66, y: B }] },
    { points: [{ x: 0.66, y: M+0.01 }, { x: 0.24, y: B }] },
  ],

  y: [
    // left stroke: mid to mid-low
    { points: [{ x: 0.26, y: M+0.01 }, { x: 0.46, y: 0.55 }] },
    // right stroke: mid to mid-low, then curves into descender
    { points: [
      { x: 0.66, y: M+0.01 }, { x: 0.46, y: 0.55 },
      { x: 0.36, y: 0.78 },   { x: 0.28, y: 0.88 },
    ]},
  ],

  z: [
    { points: [
      { x: 0.24, y: M+0.01 }, { x: 0.66, y: M+0.01 },
      { x: 0.24, y: B },      { x: 0.66, y: B },
    ]},
  ],
};

function lerp(a, b, t) { return a + (b - a) * t; }
function ptDist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

function resample(pts, n) {
  if (pts.length < 2) return pts;
  const totalLen = pts.reduce((acc, p, i) => (i === 0 ? 0 : acc + ptDist(pts[i - 1], p)), 0);
  const step = totalLen / (n - 1);
  const out = [pts[0]];
  let dist = 0, prev = pts[0], pi = 1;
  for (let i = 1; i < n; i++) {
    const target = step * i;
    while (pi < pts.length && dist + ptDist(prev, pts[pi]) < target) {
      dist += ptDist(prev, pts[pi]); prev = pts[pi]; pi++;
    }
    if (pi >= pts.length) { out.push(pts[pts.length - 1]); continue; }
    const rem = target - dist;
    const seg = ptDist(prev, pts[pi]);
    const t = seg === 0 ? 0 : rem / seg;
    out.push({ x: lerp(prev.x, pts[pi].x, t), y: lerp(prev.y, pts[pi].y, t) });
  }
  return out;
}

function scoreStroke(userPts, refPts, canvasW, canvasH) {
  if (!userPts || userPts.length < 2 || !refPts || refPts.length < 2) return false;
  const N = 30;
  const uR = resample(userPts, N);
  const rR = resample(refPts, N);
  if (uR.length < N || rR.length < N) return false;
  const pixelDiag = Math.hypot(canvasW, canvasH);
  const threshold = pixelDiag * 0.18;
  let totalErr = 0;
  for (let i = 0; i < N; i++) {
    totalErr += ptDist(
      { x: uR[i].x * canvasW, y: uR[i].y * canvasH },
      { x: rR[i].x * canvasW, y: rR[i].y * canvasH }
    );
  }
  return (totalErr / N) < threshold;
}

function smoothPathCatmull(ctx, pts, w, h) {
  if (pts.length < 2) return;
  const p = pts.map(pt => ({ x: pt.x * w, y: pt.y * h }));
  ctx.moveTo(p[0].x, p[0].y);
  if (p.length === 2) { ctx.lineTo(p[1].x, p[1].y); return; }
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[Math.max(i - 1, 0)];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[Math.min(i + 2, p.length - 1)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }
}

function drawDottedStroke(ctx, pts, w, h, alpha = 1) {
  if (pts.length < 2) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = "#7BACC8";
  ctx.lineWidth = 3;
  ctx.setLineDash([6, 8]);
  ctx.lineCap = "round";
  ctx.beginPath();
  smoothPathCatmull(ctx, pts, w, h);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawSolidStroke(ctx, pts, w, h, color = "#ffffff", lineWidth = 10) {
  if (pts.length < 2) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  smoothPathCatmull(ctx, pts, w, h);
  ctx.stroke();
  ctx.restore();
}

function drawActiveStroke(ctx, pts, w, h) {
  if (pts.length < 2) return;
  ctx.save();
  ctx.strokeStyle = "rgba(255, 80, 180, 0.25)";
  ctx.lineWidth = 18;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.setLineDash([]);
  ctx.beginPath();
  smoothPathCatmull(ctx, pts, w, h);
  ctx.stroke();
  ctx.strokeStyle = "#ff50b4";
  ctx.lineWidth = 5;
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  smoothPathCatmull(ctx, pts, w, h);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function getAngle(from, to, w, h) {
  return Math.atan2((to.y - from.y) * h, (to.x - from.x) * w);
}

function drawArrowhead(ctx, x, y, angle, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(size, 0);
  ctx.lineTo(-size, -size * 0.6);
  ctx.lineTo(-size, size * 0.6);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

// Both arrowheads: pink, 50% smaller (7 and 5.5 instead of 14 and 11)
function drawStartArrowhead(ctx, pts, w, h) {
  if (pts.length < 2) return;
  const angle = getAngle(pts[0], pts[1], w, h);
  drawArrowhead(ctx, pts[0].x * w, pts[0].y * h, angle, 7, "#ff50b4");
}

function drawEndArrowhead(ctx, pts, w, h) {
  if (pts.length < 2) return;
  const last = pts[pts.length - 1];
  const prev = pts[pts.length - 2];
  const angle = getAngle(prev, last, w, h);
  drawArrowhead(ctx, last.x * w, last.y * h, angle, 5.5, "#ff50b4");
}

function drawDot(ctx, pt, w, h) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(pt.x * w, pt.y * h, 8, 0, Math.PI * 2);
  ctx.fillStyle = "#1E3A5F";
  ctx.fill();
  ctx.restore();
}

export default function LetterTrace({ letter = "a", onComplete, locked = false, size = 320 }) {
  const canvasRef = useRef(null);

  const [currentStroke, setCurrentStroke] = useState(0);
  const [completedStrokes, setCompletedStrokes] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [userPoints, setUserPoints] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [done, setDone] = useState(false);
  const [shake, setShake] = useState(false);

  const strokes = LETTER_STROKES[letter.toLowerCase()] || [];
  // Uniform canvas — same width and height for every letter
  const SIZE = size;

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    // Background
    ctx.fillStyle = "#f0f8ff";
    ctx.fillRect(0, 0, W, H);

    // ── 3 horizontal guide lines (black, clearly visible) ──────────────────
    const topY  = H * T;   // 0.05 — solid top line
    const midY  = H * M;   // 0.38 — dashed middle line
    const baseY = H * B;   // 0.65 — solid base line

    ctx.save();
    ctx.lineWidth = 1.5;

    // Top solid line
    ctx.strokeStyle = "rgba(0,0,0,0.55)";
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(0, topY); ctx.lineTo(W, topY); ctx.stroke();

    // Base solid line
    ctx.beginPath(); ctx.moveTo(0, baseY); ctx.lineTo(W, baseY); ctx.stroke();

    // Middle dashed line
    ctx.strokeStyle = "rgba(0,0,0,0.40)";
    ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(W, midY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    // ────────────────────────────────────────────────────────────────────────

    strokes.forEach((stroke, idx) => {
      if (completedStrokes.includes(idx)) return;
      if (stroke.isDot) { drawDot(ctx, stroke.points[0], W, H); return; }
      if (idx === currentStroke) {
        drawActiveStroke(ctx, stroke.points, W, H);
        drawStartArrowhead(ctx, stroke.points, W, H);
        drawEndArrowhead(ctx, stroke.points, W, H);
      } else {
        drawDottedStroke(ctx, stroke.points, W, H, 0.3);
      }
    });
    completedStrokes.forEach((idx) => {
      const stroke = strokes[idx];
      if (!stroke) return;
      if (stroke.isDot) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(stroke.points[0].x * W, stroke.points[0].y * H, 6, 0, Math.PI * 2);
        ctx.fillStyle = "#1E3A5F";
        ctx.fill();
        ctx.restore();
        return;
      }
      drawSolidStroke(ctx, stroke.points, W, H, "#1E3A5F", 10);
    });
    if (isDrawing && userPoints.length > 1) drawSolidStroke(ctx, userPoints, W, H, "#4A90C4", 10);

    if (feedback === "correct") {
      ctx.save(); ctx.fillStyle = "rgba(34,197,94,0.18)"; ctx.fillRect(0, 0, W, H); ctx.restore();
    } else if (feedback === "wrong") {
      ctx.save(); ctx.fillStyle = "rgba(239,68,68,0.18)"; ctx.fillRect(0, 0, W, H); ctx.restore();
    }
  }, [strokes, currentStroke, completedStrokes, isDrawing, userPoints, feedback, done, locked]);

  useEffect(() => {
    let frame;
    const loop = () => { render(); frame = requestAnimationFrame(loop); };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [render]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: ((clientX - rect.left) * scaleX) / canvas.width, y: ((clientY - rect.top) * scaleY) / canvas.height };
  };

  const handleStart = (e) => {
    e.preventDefault();
    if (done || locked) return;
    const pos = getPos(e, canvasRef.current);
    setIsDrawing(true);
    setUserPoints([pos]);
    setFeedback(null);
  };

  const handleMove = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const pos = getPos(e, canvasRef.current);
    setUserPoints((prev) => [...prev, pos]);
  };

  const handleEnd = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const stroke = strokes[currentStroke];
    if (!stroke) return;
    if (stroke.isDot) {
      const tap = userPoints[0];
      const dotPt = stroke.points[0];
      const dist = ptDist({ x: tap.x * canvas.width, y: tap.y * canvas.height }, { x: dotPt.x * canvas.width, y: dotPt.y * canvas.height });
      if (dist < canvas.width * 0.12) advanceStroke(); else triggerWrong();
      return;
    }
    if (userPoints.length < 3) { triggerWrong(); setUserPoints([]); return; }
    const ok = scoreStroke(userPoints, stroke.points, canvas.width, canvas.height);
    if (ok) advanceStroke(); else triggerWrong();
    setUserPoints([]);
  };

  const advanceStroke = () => {
    setFeedback("correct");
    const next = currentStroke + 1;
    setCompletedStrokes((prev) => [...prev, currentStroke]);
    setTimeout(() => {
      setFeedback(null);
      if (next >= strokes.length) { setDone(true); onComplete && onComplete(letter); }
      else setCurrentStroke(next);
    }, 400);
  };

  const triggerWrong = () => {
    setFeedback("wrong");
    setShake(true);
    setTimeout(() => { setFeedback(null); setShake(false); }, 600);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, userSelect: "none" }}>
      {/* Canvas */}
      <div style={{
        borderRadius: 16, overflow: "hidden",
        boxShadow: "0 6px 28px rgba(30,58,95,0.14)",
        border: "2.5px solid rgba(168,208,230,0.6)",
        transform: shake ? "translateX(-6px)" : "translateX(0)",
        transition: "transform 0.1s",
        animation: shake ? "shake 0.4s" : "none",
        opacity: locked ? 0.7 : 1,
        pointerEvents: locked ? "none" : "auto",
      }}>
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          style={{ display: "block", touchAction: "none", cursor: locked ? "default" : "crosshair", width: SIZE, height: SIZE }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />
      </div>

      {/* Feedback */}
      <div style={{ height: 24, fontSize: 16, fontWeight: 700, fontFamily: "Fredoka, sans-serif" }}>
        {done
          ? <span style={{ color: "#22c55e" }}>✓ Great job!</span>
          : feedback === "wrong"
          ? <span style={{ color: "#ef4444" }}>Try again! 💪</span>
          : null}
      </div>

      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}`}</style>
    </div>
  );
}