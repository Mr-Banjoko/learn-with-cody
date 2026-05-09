import { useRef, useState, useEffect, useCallback } from "react";

// ─── Canvas & line layout ─────────────────────────────────────────────────────
// Canvas: 320 × 420 px (fixed for every letter)
//
// Line positions (normalised = px / 420):
//   TOP   = 0/420   = 0.000  — solid,  top of canvas (no padding above)
//   MID   = 120/420 ≈ 0.286  — dashed, x-height line
//   BASE  = 288/420 ≈ 0.686  — solid,  baseline  (x-height zone = 168px, +40% vs 120px)
//
// Zones (normalised):
//   Tall/ascender zone  0.000 – 0.286   (120px)
//   X-height zone       0.286 – 0.686   (168px)
//   Descender zone      0.686 – 1.000   (132px; only f g j p q y)
//
// Dot for i / j:  y = 60/420 ≈ 0.143  (halfway up ascender zone)
// ─────────────────────────────────────────────────────────────────────────────

const CANVAS_W = 320;
const CANVAS_H = 420;

const T   = 0   / 420; // 0.000 — top solid line (very top of canvas)
const M   = 120 / 420; // 0.286 — middle dashed line
const B   = 288 / 420; // 0.686 — base solid line
const DOT = 60  / 420; // 0.143 — dot for i/j
const D   = 390 / 420; // 0.929 — descender bottom

// ── Manuscript letterforms ────────────────────────────────────────────────────
// All x/y coords are absolute normalised (0–1 of canvas dimensions).
// T≈0.000, M≈0.286, B≈0.686, D≈0.929
// x-height centre ≈ (M+B)/2 ≈ 0.486
// horizontal centre ≈ 0.45

const _cx = 0.45;  // horizontal letter centre
const _hw = 0.22;  // half-width of most round letters

const LETTER_STROKES = {

  // ── a : single-storey — full oval then right stem ─────────────────────────
  a: [
    { points: [
      { x: 0.63, y: 0.37 }, { x: 0.55, y: 0.30 }, { x: 0.44, y: 0.29 },
      { x: 0.33, y: 0.32 }, { x: 0.25, y: 0.40 }, { x: 0.23, y: 0.49 },
      { x: 0.25, y: 0.58 }, { x: 0.33, y: 0.65 }, { x: 0.44, y: 0.68 },
      { x: 0.55, y: 0.65 }, { x: 0.63, y: 0.58 }, { x: 0.65, y: 0.49 },
    ] },
    { points: [
      { x: 0.65, y: 0.32 }, { x: 0.65, y: 0.68 },
    ] },
  ],

  // ── b : tall stem, bump right ─────────────────────────────────────────────
  b: [
    { points: [
      { x: 0.27, y: 0.00 }, { x: 0.27, y: 0.68 },
    ] },
    { points: [
      { x: 0.27, y: 0.30 }, { x: 0.38, y: 0.28 }, { x: 0.52, y: 0.31 },
      { x: 0.63, y: 0.41 }, { x: 0.66, y: 0.49 }, { x: 0.63, y: 0.59 },
      { x: 0.52, y: 0.67 }, { x: 0.38, y: 0.68 }, { x: 0.27, y: 0.66 },
    ] },
  ],

  // ── c : open arc ──────────────────────────────────────────────────────────
  c: [
    { points: [
      { x: 0.66, y: 0.36 }, { x: 0.57, y: 0.29 }, { x: 0.45, y: 0.28 },
      { x: 0.33, y: 0.32 }, { x: 0.25, y: 0.40 }, { x: 0.23, y: 0.49 },
      { x: 0.25, y: 0.59 }, { x: 0.33, y: 0.66 }, { x: 0.45, y: 0.69 },
      { x: 0.58, y: 0.66 }, { x: 0.66, y: 0.59 },
    ] },
  ],

  // ── d : oval then tall stem on right ──────────────────────────────────────
  d: [
    { points: [
      { x: 0.61, y: 0.37 }, { x: 0.52, y: 0.29 }, { x: 0.41, y: 0.28 },
      { x: 0.30, y: 0.32 }, { x: 0.23, y: 0.40 }, { x: 0.21, y: 0.49 },
      { x: 0.23, y: 0.59 }, { x: 0.30, y: 0.66 }, { x: 0.41, y: 0.68 },
      { x: 0.52, y: 0.65 }, { x: 0.62, y: 0.58 },
    ] },
    { points: [
      { x: 0.64, y: 0.00 }, { x: 0.64, y: 0.68 },
    ] },
  ],

  // ── e : midbar then wrap around ───────────────────────────────────────────
  e: [
    { points: [
      { x: 0.24, y: 0.48 }, { x: 0.37, y: 0.46 }, { x: 0.52, y: 0.46 },
      { x: 0.64, y: 0.48 }, { x: 0.67, y: 0.55 }, { x: 0.63, y: 0.63 },
      { x: 0.51, y: 0.68 }, { x: 0.38, y: 0.68 }, { x: 0.26, y: 0.63 },
      { x: 0.23, y: 0.55 }, { x: 0.25, y: 0.42 }, { x: 0.33, y: 0.30 },
      { x: 0.46, y: 0.28 }, { x: 0.59, y: 0.31 }, { x: 0.66, y: 0.38 },
    ] },
  ],

  // ── f : curved hook top, stem, crossbar ───────────────────────────────────
  f: [
    { points: [
      { x: 0.62, y: 0.04 }, { x: 0.55, y: 0.01 }, { x: 0.48, y: 0.03 },
      { x: 0.42, y: 0.08 }, { x: 0.39, y: 0.16 }, { x: 0.39, y: 0.28 },
      { x: 0.39, y: 0.68 },
    ] },
    { points: [
      { x: 0.22, y: 0.28 }, { x: 0.56, y: 0.28 },
    ] },
  ],

  // ── g : oval then stem curling into descender ─────────────────────────────
  g: [
    { points: [
      { x: 0.63, y: 0.36 }, { x: 0.55, y: 0.29 }, { x: 0.44, y: 0.28 },
      { x: 0.33, y: 0.32 }, { x: 0.25, y: 0.40 }, { x: 0.23, y: 0.49 },
      { x: 0.25, y: 0.59 }, { x: 0.33, y: 0.66 }, { x: 0.44, y: 0.68 },
      { x: 0.55, y: 0.65 }, { x: 0.63, y: 0.57 }, { x: 0.65, y: 0.48 },
    ] },
    { points: [
      { x: 0.65, y: 0.30 }, { x: 0.65, y: 0.72 },
      { x: 0.62, y: 0.82 }, { x: 0.52, y: 0.88 }, { x: 0.40, y: 0.88 },
      { x: 0.29, y: 0.84 },
    ] },
  ],

  // ── h : tall stem, arch right ─────────────────────────────────────────────
  h: [
    { points: [
      { x: 0.27, y: 0.00 }, { x: 0.27, y: 0.68 },
    ] },
    { points: [
      { x: 0.27, y: 0.33 }, { x: 0.37, y: 0.28 }, { x: 0.50, y: 0.28 },
      { x: 0.60, y: 0.34 }, { x: 0.65, y: 0.42 }, { x: 0.65, y: 0.68 },
    ] },
  ],

  // ── i : short stem + dot ──────────────────────────────────────────────────
  i: [
    { points: [{ x: 0.45, y: 0.30 }, { x: 0.45, y: 0.68 }] },
    { points: [{ x: 0.45, y: DOT }, { x: 0.45, y: DOT + 0.005 }], isDot: true },
  ],

  // ── j : short stem curling into descender + dot ───────────────────────────
  j: [
    { points: [
      { x: 0.52, y: 0.30 }, { x: 0.52, y: 0.72 },
      { x: 0.49, y: 0.82 }, { x: 0.40, y: 0.88 }, { x: 0.30, y: 0.85 },
    ] },
    { points: [{ x: 0.52, y: DOT }, { x: 0.52, y: DOT + 0.005 }], isDot: true },
  ],

  // ── k : tall stem, upper arm in, lower arm out ───────────────────────────
  k: [
    { points: [
      { x: 0.27, y: 0.00 }, { x: 0.27, y: 0.68 },
    ] },
    { points: [
      { x: 0.64, y: 0.28 }, { x: 0.50, y: 0.38 }, { x: 0.40, y: 0.45 },
      { x: 0.27, y: 0.48 },
    ] },
    { points: [
      { x: 0.27, y: 0.48 }, { x: 0.42, y: 0.55 }, { x: 0.54, y: 0.61 },
      { x: 0.64, y: 0.68 },
    ] },
  ],

  // ── l : tall stroke with tiny foot ───────────────────────────────────────
  l: [
    { points: [
      { x: 0.44, y: 0.00 }, { x: 0.44, y: 0.66 },
      { x: 0.47, y: 0.68 }, { x: 0.52, y: 0.68 },
    ] },
  ],

  // ── m : stem + two humps ──────────────────────────────────────────────────
  m: [
    { points: [{ x: 0.13, y: 0.28 }, { x: 0.13, y: 0.68 }] },
    { points: [
      { x: 0.13, y: 0.34 }, { x: 0.22, y: 0.28 }, { x: 0.35, y: 0.28 },
      { x: 0.44, y: 0.34 }, { x: 0.47, y: 0.42 }, { x: 0.47, y: 0.68 },
    ] },
    { points: [
      { x: 0.47, y: 0.34 }, { x: 0.56, y: 0.28 }, { x: 0.68, y: 0.28 },
      { x: 0.76, y: 0.34 }, { x: 0.79, y: 0.42 }, { x: 0.79, y: 0.68 },
    ] },
  ],

  // ── n : stem + single hump ────────────────────────────────────────────────
  n: [
    { points: [{ x: 0.24, y: 0.28 }, { x: 0.24, y: 0.68 }] },
    { points: [
      { x: 0.24, y: 0.34 }, { x: 0.34, y: 0.28 }, { x: 0.48, y: 0.28 },
      { x: 0.58, y: 0.34 }, { x: 0.63, y: 0.42 }, { x: 0.63, y: 0.68 },
    ] },
  ],

  // ── o : closed oval ───────────────────────────────────────────────────────
  o: [
    { points: [
      { x: 0.54, y: 0.29 }, { x: 0.44, y: 0.28 }, { x: 0.32, y: 0.32 },
      { x: 0.24, y: 0.40 }, { x: 0.22, y: 0.49 }, { x: 0.24, y: 0.59 },
      { x: 0.32, y: 0.66 }, { x: 0.44, y: 0.68 }, { x: 0.56, y: 0.66 },
      { x: 0.64, y: 0.59 }, { x: 0.66, y: 0.49 }, { x: 0.64, y: 0.39 },
      { x: 0.56, y: 0.31 }, { x: 0.54, y: 0.29 },
    ] },
  ],

  // ── p : stem to descender, bump right ────────────────────────────────────
  p: [
    { points: [{ x: 0.27, y: 0.28 }, { x: 0.27, y: 0.93 }] },
    { points: [
      { x: 0.27, y: 0.30 }, { x: 0.38, y: 0.28 }, { x: 0.52, y: 0.31 },
      { x: 0.63, y: 0.40 }, { x: 0.66, y: 0.49 }, { x: 0.63, y: 0.58 },
      { x: 0.52, y: 0.66 }, { x: 0.38, y: 0.68 }, { x: 0.27, y: 0.66 },
    ] },
  ],

  // ── q : oval, stem to descender ───────────────────────────────────────────
  q: [
    { points: [
      { x: 0.62, y: 0.36 }, { x: 0.54, y: 0.29 }, { x: 0.43, y: 0.28 },
      { x: 0.32, y: 0.32 }, { x: 0.24, y: 0.40 }, { x: 0.22, y: 0.49 },
      { x: 0.24, y: 0.59 }, { x: 0.32, y: 0.66 }, { x: 0.43, y: 0.68 },
      { x: 0.54, y: 0.65 }, { x: 0.63, y: 0.57 },
    ] },
    { points: [{ x: 0.65, y: 0.28 }, { x: 0.65, y: 0.93 }] },
  ],

  // ── r : stem, small shoulder ──────────────────────────────────────────────
  r: [
    { points: [{ x: 0.26, y: 0.28 }, { x: 0.26, y: 0.68 }] },
    { points: [
      { x: 0.26, y: 0.34 }, { x: 0.35, y: 0.28 }, { x: 0.48, y: 0.27 },
      { x: 0.60, y: 0.32 },
    ] },
  ],

  // ── s : double reverse curve ──────────────────────────────────────────────
  s: [
    { points: [
      { x: 0.64, y: 0.34 }, { x: 0.56, y: 0.28 }, { x: 0.44, y: 0.28 },
      { x: 0.33, y: 0.32 }, { x: 0.28, y: 0.39 }, { x: 0.32, y: 0.46 },
      { x: 0.44, y: 0.50 }, { x: 0.56, y: 0.54 }, { x: 0.61, y: 0.61 },
      { x: 0.57, y: 0.67 }, { x: 0.45, y: 0.68 }, { x: 0.33, y: 0.65 },
      { x: 0.26, y: 0.60 },
    ] },
  ],

  // ── t : slightly shorter stem, crossbar ───────────────────────────────────
  t: [
    { points: [
      { x: 0.44, y: 0.06 }, { x: 0.44, y: 0.66 },
      { x: 0.47, y: 0.68 },
    ] },
    { points: [
      { x: 0.22, y: 0.28 }, { x: 0.66, y: 0.28 },
    ] },
  ],

  // ── u : two legs, right leg has stem ──────────────────────────────────────
  u: [
    { points: [
      { x: 0.25, y: 0.28 }, { x: 0.25, y: 0.56 },
      { x: 0.28, y: 0.64 }, { x: 0.37, y: 0.68 }, { x: 0.52, y: 0.68 },
      { x: 0.61, y: 0.64 }, { x: 0.64, y: 0.56 }, { x: 0.64, y: 0.28 },
    ] },
    { points: [{ x: 0.64, y: 0.28 }, { x: 0.64, y: 0.68 }] },
  ],

  // ── v : two diagonals ─────────────────────────────────────────────────────
  v: [
    { points: [{ x: 0.24, y: 0.28 }, { x: 0.44, y: 0.68 }] },
    { points: [{ x: 0.44, y: 0.68 }, { x: 0.66, y: 0.28 }] },
  ],

  // ── w : four diagonals ────────────────────────────────────────────────────
  w: [
    { points: [
      { x: 0.13, y: 0.28 }, { x: 0.26, y: 0.68 }, { x: 0.39, y: 0.50 },
      { x: 0.52, y: 0.68 }, { x: 0.65, y: 0.28 },
    ] },
  ],

  // ── x : two crossing diagonals ────────────────────────────────────────────
  x: [
    { points: [{ x: 0.24, y: 0.28 }, { x: 0.66, y: 0.68 }] },
    { points: [{ x: 0.66, y: 0.28 }, { x: 0.24, y: 0.68 }] },
  ],

  // ── y : upper-left leg, right leg into descender ─────────────────────────
  y: [
    { points: [{ x: 0.25, y: 0.28 }, { x: 0.44, y: 0.52 }] },
    { points: [
      { x: 0.64, y: 0.28 }, { x: 0.44, y: 0.52 }, { x: 0.36, y: 0.65 },
      { x: 0.29, y: 0.80 }, { x: 0.25, y: 0.88 },
    ] },
  ],

  // ── z : top, diagonal, bottom ─────────────────────────────────────────────
  z: [
    { points: [
      { x: 0.24, y: 0.28 }, { x: 0.66, y: 0.28 },
      { x: 0.24, y: 0.68 }, { x: 0.66, y: 0.68 },
    ] },
  ],
};

// ─── Utility functions ────────────────────────────────────────────────────────

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

function drawSolidStroke(ctx, pts, w, h, color = "#ffffff", lineWidth = 7) {
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
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
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

function drawStartArrowhead(ctx, pts, w, h) {
  if (pts.length < 2) return;
  const angle = getAngle(pts[0], pts[1], w, h);
  drawArrowhead(ctx, pts[0].x * w, pts[0].y * h, angle, 7, "#1a1a1a");
}

function drawEndArrowhead(ctx, pts, w, h) {
  if (pts.length < 2) return;
  const last = pts[pts.length - 1];
  const prev = pts[pts.length - 2];
  const angle = getAngle(prev, last, w, h);
  drawArrowhead(ctx, last.x * w, last.y * h, angle, 5.5, "#1a1a1a");
}

function drawDot(ctx, pt, w, h) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(pt.x * w, pt.y * h, 8, 0, Math.PI * 2);
  ctx.fillStyle = "#1E3A5F";
  ctx.fill();
  ctx.restore();
}

// ─── Component ────────────────────────────────────────────────────────────────

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

  // Canvas is always 320 wide; height scales proportionally from 320×420 base
  const W = size;
  const H = Math.round(size * (CANVAS_H / CANVAS_W) * 1.4);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#E8FFFE";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ── Guide lines ─────────────────────────────────────────────────────────
    const topY  = canvas.height * T;
    const midY  = canvas.height * M;
    const baseY = canvas.height * B;

    ctx.save();

    // Top solid line (at y=0, drawn at lineWidth/2 = 1px so it's fully visible)
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(0, 1); ctx.lineTo(canvas.width, 1); ctx.stroke();

    // Base solid line
    ctx.beginPath(); ctx.moveTo(0, baseY); ctx.lineTo(canvas.width, baseY); ctx.stroke();

    // Middle dashed line
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 6]);
    ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(canvas.width, midY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    // ────────────────────────────────────────────────────────────────────────

    strokes.forEach((stroke, idx) => {
      if (completedStrokes.includes(idx)) return;
      if (stroke.isDot) { drawDot(ctx, stroke.points[0], canvas.width, canvas.height); return; }
      if (idx === currentStroke) {
        drawActiveStroke(ctx, stroke.points, canvas.width, canvas.height);
        drawStartArrowhead(ctx, stroke.points, canvas.width, canvas.height);
        drawEndArrowhead(ctx, stroke.points, canvas.width, canvas.height);
      } else {
        drawDottedStroke(ctx, stroke.points, canvas.width, canvas.height, 0.3);
      }
    });

    completedStrokes.forEach((idx) => {
      const stroke = strokes[idx];
      if (!stroke) return;
      if (stroke.isDot) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(stroke.points[0].x * canvas.width, stroke.points[0].y * canvas.height, 6, 0, Math.PI * 2);
        ctx.fillStyle = "#1E3A5F";
        ctx.fill();
        ctx.restore();
        return;
      }
      drawSolidStroke(ctx, stroke.points, canvas.width, canvas.height, "#1E3A5F", 7);
    });

    if (isDrawing && userPoints.length > 1) {
      drawSolidStroke(ctx, userPoints, canvas.width, canvas.height, "#4A90C4", 7);
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
    setIsDrawing(true);
    setUserPoints([getPos(e, canvasRef.current)]);
    setFeedback(null);
  };

  const handleMove = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    setUserPoints((prev) => [...prev, getPos(e, canvasRef.current)]);
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
    const next = currentStroke + 1;
    setCompletedStrokes((prev) => [...prev, currentStroke]);
    if (next >= strokes.length) {
      setDone(true);
      // Call onComplete synchronously — must stay in the touch gesture call stack for iOS Safari
      onComplete && onComplete(letter);
    } else {
      setCurrentStroke(next);
    }
  };

  const triggerWrong = () => {
    // No visual feedback for wrong strokes — silently reset
    setUserPoints([]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, userSelect: "none" }}>
      <div style={{
        borderRadius: 16, overflow: "hidden",
        boxShadow: "0 6px 28px rgba(30,58,95,0.14)",
        border: "2.5px solid rgba(168,208,230,0.6)",
        transform: "translateX(0)",
        opacity: locked ? 0.7 : 1,
        pointerEvents: locked ? "none" : "auto",
      }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{ display: "block", touchAction: "none", cursor: locked ? "default" : "crosshair", width: W, height: H }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />
      </div>


    </div>
  );
}