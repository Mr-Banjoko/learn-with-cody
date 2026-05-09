import { useRef, useState, useEffect, useCallback } from "react";

const LETTER_STROKES = {
  a: [
    // stroke 1: C shape (open on the right)
    {
      points: [
        { x: 0.62, y: 0.34 }, { x: 0.52, y: 0.28 }, { x: 0.40, y: 0.28 },
        { x: 0.28, y: 0.34 }, { x: 0.22, y: 0.46 }, { x: 0.22, y: 0.58 },
        { x: 0.28, y: 0.68 }, { x: 0.40, y: 0.72 }, { x: 0.52, y: 0.72 },
        { x: 0.62, y: 0.66 },
      ],
    },
    // stroke 2: straight vertical line on the right
    {
      points: [
        { x: 0.62, y: 0.28 }, { x: 0.62, y: 0.72 },
      ],
    },
  ],
  b: [
    { points: [{ x: 0.30, y: 0.15 }, { x: 0.30, y: 0.72 }] },
    {
      points: [
        { x: 0.30, y: 0.38 }, { x: 0.42, y: 0.30 }, { x: 0.58, y: 0.32 },
        { x: 0.65, y: 0.44 }, { x: 0.65, y: 0.58 }, { x: 0.58, y: 0.68 },
        { x: 0.42, y: 0.72 }, { x: 0.30, y: 0.72 },
      ],
    },
  ],
  c: [
    {
      points: [
        { x: 0.65, y: 0.34 }, { x: 0.55, y: 0.28 }, { x: 0.42, y: 0.28 },
        { x: 0.30, y: 0.34 }, { x: 0.24, y: 0.46 }, { x: 0.24, y: 0.58 },
        { x: 0.30, y: 0.68 }, { x: 0.42, y: 0.72 }, { x: 0.55, y: 0.72 },
        { x: 0.65, y: 0.66 },
      ],
    },
  ],
  d: [
    {
      points: [
        { x: 0.58, y: 0.38 }, { x: 0.48, y: 0.30 }, { x: 0.36, y: 0.30 },
        { x: 0.26, y: 0.38 }, { x: 0.22, y: 0.50 }, { x: 0.26, y: 0.62 },
        { x: 0.36, y: 0.70 }, { x: 0.48, y: 0.72 }, { x: 0.58, y: 0.68 },
      ],
    },
    { points: [{ x: 0.62, y: 0.15 }, { x: 0.62, y: 0.72 }] },
  ],
  e: [
    {
      points: [
        { x: 0.28, y: 0.50 }, { x: 0.40, y: 0.44 }, { x: 0.55, y: 0.44 },
        { x: 0.65, y: 0.50 }, { x: 0.65, y: 0.60 }, { x: 0.55, y: 0.70 },
        { x: 0.40, y: 0.72 }, { x: 0.28, y: 0.66 }, { x: 0.24, y: 0.54 },
        { x: 0.28, y: 0.42 }, { x: 0.38, y: 0.30 }, { x: 0.55, y: 0.28 },
        { x: 0.65, y: 0.34 },
      ],
    },
  ],
  f: [
    {
      points: [
        { x: 0.62, y: 0.20 }, { x: 0.52, y: 0.14 }, { x: 0.42, y: 0.14 },
        { x: 0.36, y: 0.20 }, { x: 0.36, y: 0.72 },
      ],
    },
    { points: [{ x: 0.22, y: 0.38 }, { x: 0.58, y: 0.38 }] },
  ],
  g: [
    {
      points: [
        { x: 0.65, y: 0.36 }, { x: 0.55, y: 0.28 }, { x: 0.42, y: 0.28 },
        { x: 0.30, y: 0.34 }, { x: 0.24, y: 0.46 }, { x: 0.24, y: 0.58 },
        { x: 0.30, y: 0.68 }, { x: 0.42, y: 0.72 }, { x: 0.55, y: 0.68 },
        { x: 0.65, y: 0.58 }, { x: 0.65, y: 0.28 },
        { x: 0.65, y: 0.80 }, { x: 0.60, y: 0.88 }, { x: 0.48, y: 0.90 },
        { x: 0.36, y: 0.86 },
      ],
    },
  ],
  h: [
    { points: [{ x: 0.28, y: 0.15 }, { x: 0.28, y: 0.72 }] },
    {
      points: [
        { x: 0.28, y: 0.44 }, { x: 0.38, y: 0.32 }, { x: 0.52, y: 0.28 },
        { x: 0.64, y: 0.32 }, { x: 0.68, y: 0.44 }, { x: 0.68, y: 0.72 },
      ],
    },
  ],
  i: [
    { points: [{ x: 0.44, y: 0.38 }, { x: 0.44, y: 0.72 }] },
    { points: [{ x: 0.44, y: 0.24 }, { x: 0.44, y: 0.26 }], isDot: true },
  ],
  j: [
    {
      points: [
        { x: 0.52, y: 0.38 }, { x: 0.52, y: 0.78 },
        { x: 0.46, y: 0.86 }, { x: 0.36, y: 0.88 }, { x: 0.28, y: 0.84 },
      ],
    },
    { points: [{ x: 0.52, y: 0.24 }, { x: 0.52, y: 0.26 }], isDot: true },
  ],
  k: [
    { points: [{ x: 0.30, y: 0.15 }, { x: 0.30, y: 0.72 }] },
    { points: [{ x: 0.68, y: 0.28 }, { x: 0.30, y: 0.50 }, { x: 0.68, y: 0.72 }] },
  ],
  l: [
    {
      points: [
        { x: 0.40, y: 0.15 }, { x: 0.40, y: 0.68 },
        { x: 0.46, y: 0.72 }, { x: 0.54, y: 0.72 },
      ],
    },
  ],
  m: [
    { points: [{ x: 0.18, y: 0.38 }, { x: 0.18, y: 0.72 }] },
    {
      points: [
        { x: 0.18, y: 0.44 }, { x: 0.26, y: 0.32 }, { x: 0.38, y: 0.28 },
        { x: 0.48, y: 0.32 }, { x: 0.52, y: 0.44 }, { x: 0.52, y: 0.72 },
      ],
    },
    {
      points: [
        { x: 0.52, y: 0.44 }, { x: 0.60, y: 0.32 }, { x: 0.72, y: 0.28 },
        { x: 0.80, y: 0.32 }, { x: 0.82, y: 0.44 }, { x: 0.82, y: 0.72 },
      ],
    },
  ],
  n: [
    { points: [{ x: 0.22, y: 0.38 }, { x: 0.22, y: 0.72 }] },
    {
      points: [
        { x: 0.22, y: 0.44 }, { x: 0.32, y: 0.30 }, { x: 0.46, y: 0.28 },
        { x: 0.58, y: 0.32 }, { x: 0.62, y: 0.44 }, { x: 0.62, y: 0.72 },
      ],
    },
  ],
  o: [
    {
      points: [
        { x: 0.50, y: 0.28 }, { x: 0.38, y: 0.28 }, { x: 0.26, y: 0.36 },
        { x: 0.22, y: 0.50 }, { x: 0.26, y: 0.64 }, { x: 0.38, y: 0.72 },
        { x: 0.50, y: 0.72 }, { x: 0.62, y: 0.64 }, { x: 0.66, y: 0.50 },
        { x: 0.62, y: 0.36 }, { x: 0.50, y: 0.28 },
      ],
    },
  ],
  p: [
    { points: [{ x: 0.30, y: 0.28 }, { x: 0.30, y: 0.88 }] },
    {
      points: [
        { x: 0.30, y: 0.28 }, { x: 0.44, y: 0.24 }, { x: 0.58, y: 0.28 },
        { x: 0.64, y: 0.38 }, { x: 0.64, y: 0.52 }, { x: 0.58, y: 0.62 },
        { x: 0.44, y: 0.66 }, { x: 0.30, y: 0.62 },
      ],
    },
  ],
  q: [
    {
      points: [
        { x: 0.62, y: 0.38 }, { x: 0.50, y: 0.28 }, { x: 0.38, y: 0.28 },
        { x: 0.26, y: 0.36 }, { x: 0.22, y: 0.50 }, { x: 0.26, y: 0.64 },
        { x: 0.38, y: 0.72 }, { x: 0.50, y: 0.72 }, { x: 0.62, y: 0.64 },
        { x: 0.62, y: 0.28 },
      ],
    },
    { points: [{ x: 0.62, y: 0.72 }, { x: 0.62, y: 0.88 }] },
  ],
  r: [
    { points: [{ x: 0.26, y: 0.38 }, { x: 0.26, y: 0.72 }] },
    {
      points: [
        { x: 0.26, y: 0.44 }, { x: 0.36, y: 0.32 }, { x: 0.50, y: 0.28 },
        { x: 0.60, y: 0.32 },
      ],
    },
  ],
  s: [
    {
      points: [
        { x: 0.64, y: 0.34 }, { x: 0.54, y: 0.28 }, { x: 0.40, y: 0.28 },
        { x: 0.28, y: 0.34 }, { x: 0.28, y: 0.44 }, { x: 0.38, y: 0.50 },
        { x: 0.52, y: 0.54 }, { x: 0.64, y: 0.60 }, { x: 0.64, y: 0.68 },
        { x: 0.52, y: 0.72 }, { x: 0.38, y: 0.72 }, { x: 0.28, y: 0.68 },
      ],
    },
  ],
  t: [
    { points: [{ x: 0.44, y: 0.18 }, { x: 0.44, y: 0.72 }] },
    { points: [{ x: 0.24, y: 0.38 }, { x: 0.66, y: 0.38 }] },
  ],
  u: [
    {
      points: [
        { x: 0.28, y: 0.28 }, { x: 0.28, y: 0.60 },
        { x: 0.34, y: 0.70 }, { x: 0.44, y: 0.72 }, { x: 0.56, y: 0.70 },
        { x: 0.62, y: 0.60 }, { x: 0.62, y: 0.28 },
      ],
    },
    { points: [{ x: 0.62, y: 0.28 }, { x: 0.62, y: 0.72 }] },
  ],
  v: [
    { points: [{ x: 0.24, y: 0.28 }, { x: 0.44, y: 0.72 }, { x: 0.66, y: 0.28 }] },
  ],
  w: [
    {
      points: [
        { x: 0.14, y: 0.28 }, { x: 0.28, y: 0.72 }, { x: 0.44, y: 0.44 },
        { x: 0.60, y: 0.72 }, { x: 0.74, y: 0.28 },
      ],
    },
  ],
  x: [
    { points: [{ x: 0.24, y: 0.28 }, { x: 0.66, y: 0.72 }] },
    { points: [{ x: 0.66, y: 0.28 }, { x: 0.24, y: 0.72 }] },
  ],
  y: [
    { points: [{ x: 0.26, y: 0.28 }, { x: 0.46, y: 0.60 }] },
    {
      points: [
        { x: 0.66, y: 0.28 }, { x: 0.46, y: 0.60 },
        { x: 0.36, y: 0.80 }, { x: 0.28, y: 0.88 },
      ],
    },
  ],
  z: [
    {
      points: [
        { x: 0.24, y: 0.28 }, { x: 0.66, y: 0.28 },
        { x: 0.24, y: 0.72 }, { x: 0.66, y: 0.72 },
      ],
    },
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
  ctx.strokeStyle = "#aaaaaa";
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

function drawArrow(ctx, pt, direction, w, h) {
  const x = pt.x * w, y = pt.y * h, r = 18;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = "#38bdf8";
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${r}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const arrows = { right: "→", left: "←", down: "↓", up: "↑", "down-right": "↘", "down-left": "↙" };
  ctx.fillText(arrows[direction] || "→", x, y);
  ctx.restore();
}

function drawHintDots(ctx, pts, w, h) {
  // Draw the first 3 evenly-spaced hint dots along the stroke in pink
  if (pts.length < 2) return;
  const resampled = [];
  const totalLen = pts.reduce((acc, p, i) => (i === 0 ? 0 : acc + Math.hypot(pts[i-1].x - p.x, pts[i-1].y - p.y)), 0);
  const step = totalLen / 4; // 3 dots at 1/4, 2/4, 3/4 along the path
  let dist = 0, pi = 1, prev = pts[0];
  for (let d = 1; d <= 3; d++) {
    const target = step * d;
    while (pi < pts.length && dist + Math.hypot(prev.x - pts[pi].x, prev.y - pts[pi].y) < target) {
      dist += Math.hypot(prev.x - pts[pi].x, prev.y - pts[pi].y);
      prev = pts[pi]; pi++;
    }
    if (pi >= pts.length) { resampled.push(pts[pts.length - 1]); continue; }
    const rem = target - dist;
    const seg = Math.hypot(prev.x - pts[pi].x, prev.y - pts[pi].y);
    const t = seg === 0 ? 0 : rem / seg;
    resampled.push({ x: prev.x + (pts[pi].x - prev.x) * t, y: prev.y + (pts[pi].y - prev.y) * t });
  }
  resampled.forEach(pt => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(pt.x * w, pt.y * h, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#f472b6";
    ctx.fill();
    ctx.restore();
  });
}

function drawDot(ctx, pt, w, h) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(pt.x * w, pt.y * h, 8, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();
}

function getStrokeDirection(pts) {
  if (pts.length < 2) return "right";
  const dx = pts[pts.length - 1].x - pts[0].x;
  const dy = pts[pts.length - 1].y - pts[0].y;
  if (Math.abs(dx) > Math.abs(dy) * 1.5) return dx > 0 ? "right" : "left";
  if (Math.abs(dy) > Math.abs(dx) * 1.5) return dy > 0 ? "down" : "up";
  if (dx > 0 && dy > 0) return "down-right";
  if (dx < 0 && dy > 0) return "down-left";
  return "right";
}

export default function LetterTrace({ letter = "a", onComplete }) {
  const canvasRef = useRef(null);

  const [currentStroke, setCurrentStroke] = useState(0);
  const [completedStrokes, setCompletedStrokes] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [userPoints, setUserPoints] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [done, setDone] = useState(false);
  const [shake, setShake] = useState(false);

  const strokes = LETTER_STROKES[letter.toLowerCase()] || [];
  const SIZE = 320;

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, H * 0.65); ctx.lineTo(W, H * 0.65); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    strokes.forEach((stroke, idx) => {
      if (completedStrokes.includes(idx)) return;
      if (stroke.isDot) { drawDot(ctx, stroke.points[0], W, H); return; }
      drawDottedStroke(ctx, stroke.points, W, H, idx === currentStroke ? 1 : 0.4);
    });
    completedStrokes.forEach((idx) => {
      const stroke = strokes[idx];
      if (!stroke) return;
      if (stroke.isDot) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(stroke.points[0].x * W, stroke.points[0].y * H, 6, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.restore();
        return;
      }
      drawSolidStroke(ctx, stroke.points, W, H, "#ffffff", 10);
    });
    if (isDrawing && userPoints.length > 1) drawSolidStroke(ctx, userPoints, W, H, "#38bdf8", 10);
    if (!done && currentStroke < strokes.length) {
      const stroke = strokes[currentStroke];
      if (!stroke.isDot) {
        drawHintDots(ctx, stroke.points, W, H);
        drawArrow(ctx, stroke.points[0], getStrokeDirection(stroke.points), W, H);
      }
    }
    if (feedback === "correct") {
      ctx.save(); ctx.fillStyle = "rgba(34,197,94,0.18)"; ctx.fillRect(0, 0, W, H); ctx.restore();
    } else if (feedback === "wrong") {
      ctx.save(); ctx.fillStyle = "rgba(239,68,68,0.18)"; ctx.fillRect(0, 0, W, H); ctx.restore();
    }
  }, [strokes, currentStroke, completedStrokes, isDrawing, userPoints, feedback, done]);

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
    if (done) return;
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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, userSelect: "none" }}>
      <div style={{ fontSize: 48, fontFamily: "'Noto Serif', serif", color: "#ffffff", letterSpacing: 2 }}>
        {letter.toLowerCase()}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {strokes.map((_, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: completedStrokes.includes(i) ? "#22c55e" : i === currentStroke ? "#38bdf8" : "#334155", transition: "background 0.3s" }} />
        ))}
      </div>
      <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.5)", transform: shake ? "translateX(-6px)" : "translateX(0)", transition: "transform 0.1s", animation: shake ? "shake 0.4s" : "none" }}>
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          style={{ display: "block", touchAction: "none", cursor: "crosshair", width: SIZE, height: SIZE }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />
      </div>
      <div style={{ height: 32, fontSize: 20, fontWeight: "bold" }}>
        {done ? <span style={{ color: "#22c55e" }}>✓ Excellent!</span> : feedback === "wrong" ? <span style={{ color: "#ef4444" }}>Try again!</span> : null}
      </div>
      {!done && <div style={{ color: "#94a3b8", fontSize: 14 }}>Stroke {currentStroke + 1} of {strokes.length}</div>}
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}`}</style>
    </div>
  );
}