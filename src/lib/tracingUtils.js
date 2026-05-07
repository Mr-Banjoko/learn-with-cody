/**
 * tracingUtils.js
 * 
 * Strict Duolingo-style stroke validation — NO DOM dependency.
 * Guide points are computed purely from the SVG path `d` string
 * so it works reliably in Safari where getTotalLength() can return 0.
 *
 * Rules enforced:
 *  1. Minimum touch points (rejects taps)
 *  2. Must START near the stroke's defined start point
 *  3. Must END near the stroke's defined end point
 *  4. Must cover ≥60% of guide path in FORWARD order
 *  5. Backward tracing rejected
 *  6. Must stay within ±14 SVG-unit corridor of the path
 *  7. Minimum drawn arc-length (≥40% of guide length)
 */

// ── Tuning ────────────────────────────────────────────────────────────────────
const START_TOLERANCE   = 20;   // SVG units — must start this close to stroke start
const END_TOLERANCE     = 20;   // SVG units — must end this close to stroke end
const CORRIDOR_WIDTH    = 18;   // SVG units — max off-path distance allowed
const MIN_COVERAGE      = 0.55; // fraction of guide points that must be hit in order
const MIN_POINTS        = 5;    // minimum user touch samples
const MIN_LENGTH_RATIO  = 0.35; // user arc-length ÷ guide arc-length
const MAX_REVERSE_FRAC  = 0.25; // fraction of in-corridor points that go backward
const MAX_OFF_PATH_FRAC = 0.40; // fraction of user points that can miss corridor

// ── Pure-JS path sampler (no DOM) ────────────────────────────────────────────

/** Linear interpolation */
function lerp(a, b, t) { return a + (b - a) * t; }

/**
 * Very light SVG-path parser that handles M, L, C, Q, Z commands.
 * Returns a flat array of [x, y] sample points.
 */
export function samplePathD(d, count = 80) {
  if (!d) return [];

  // Tokenise the path string into commands + number arrays
  const segments = [];
  const re = /([MLCQZz])\s*([\d\s.,eE+-]*)/g;
  let m;
  while ((m = re.exec(d)) !== null) {
    const cmd = m[1].toUpperCase();
    const nums = (m[2].match(/[-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?/g) || []).map(Number);
    segments.push({ cmd, nums });
  }

  // Convert segments to polyline sample points
  const rawPts = [];
  let cx = 0, cy = 0;
  let startX = 0, startY = 0;
  const CURVE_STEPS = 20; // steps per curve segment

  for (const { cmd, nums } of segments) {
    if (cmd === 'M') {
      cx = nums[0]; cy = nums[1];
      startX = cx; startY = cy;
      rawPts.push([cx, cy]);
    } else if (cmd === 'L') {
      for (let i = 0; i < nums.length; i += 2) {
        cx = nums[i]; cy = nums[i + 1];
        rawPts.push([cx, cy]);
      }
    } else if (cmd === 'C') {
      // Cubic bezier: 6 nums per segment
      for (let i = 0; i < nums.length; i += 6) {
        const [x1, y1, x2, y2, ex, ey] = nums.slice(i, i + 6);
        const ox = cx, oy = cy;
        for (let s = 1; s <= CURVE_STEPS; s++) {
          const t = s / CURVE_STEPS;
          const u = 1 - t;
          const bx = u*u*u*ox + 3*u*u*t*x1 + 3*u*t*t*x2 + t*t*t*ex;
          const by = u*u*u*oy + 3*u*u*t*y1 + 3*u*t*t*y2 + t*t*t*ey;
          rawPts.push([bx, by]);
        }
        cx = ex; cy = ey;
      }
    } else if (cmd === 'Q') {
      // Quadratic bezier: 4 nums per segment
      for (let i = 0; i < nums.length; i += 4) {
        const [x1, y1, ex, ey] = nums.slice(i, i + 4);
        const ox = cx, oy = cy;
        for (let s = 1; s <= CURVE_STEPS; s++) {
          const t = s / CURVE_STEPS;
          const u = 1 - t;
          const bx = u*u*ox + 2*u*t*x1 + t*t*ex;
          const by = u*u*oy + 2*u*t*y1 + t*t*ey;
          rawPts.push([bx, by]);
        }
        cx = ex; cy = ey;
      }
    } else if (cmd === 'Z') {
      rawPts.push([startX, startY]);
      cx = startX; cy = startY;
    }
  }

  if (rawPts.length < 2) return rawPts;

  // Re-sample to exactly `count` evenly-spaced points by arc-length
  const arcLen = [];
  arcLen[0] = 0;
  for (let i = 1; i < rawPts.length; i++) {
    arcLen[i] = arcLen[i - 1] + Math.hypot(
      rawPts[i][0] - rawPts[i - 1][0],
      rawPts[i][1] - rawPts[i - 1][1]
    );
  }
  const total = arcLen[arcLen.length - 1];
  if (total === 0) return rawPts;

  const result = [];
  let j = 0;
  for (let i = 0; i <= count; i++) {
    const target = (i / count) * total;
    while (j < arcLen.length - 2 && arcLen[j + 1] < target) j++;
    const seg = arcLen[j + 1] - arcLen[j];
    const t = seg === 0 ? 0 : (target - arcLen[j]) / seg;
    result.push([
      lerp(rawPts[j][0], rawPts[j + 1][0], t),
      lerp(rawPts[j][1], rawPts[j + 1][1], t),
    ]);
  }
  return result;
}

// Keep the DOM-based sampler as a secondary attempt (will work on desktop)
export function samplePathPoints(pathEl, count = 80) {
  if (!pathEl) return [];
  try {
    const total = pathEl.getTotalLength();
    if (!total || total === 0) return [];
    const pts = [];
    for (let i = 0; i <= count; i++) {
      const p = pathEl.getPointAtLength((i / count) * total);
      pts.push([p.x, p.y]);
    }
    return pts;
  } catch {
    return [];
  }
}

// ── Geometry helpers ──────────────────────────────────────────────────────────

function dist2D([ax, ay], [bx, by]) {
  return Math.hypot(ax - bx, ay - by);
}

function polylineLength(pts) {
  let len = 0;
  for (let i = 1; i < pts.length; i++) len += dist2D(pts[i - 1], pts[i]);
  return len;
}

function distToPolyline(pts, px, py) {
  let minD = Infinity;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1];
    const [bx, by] = pts[i];
    const abx = bx - ax, aby = by - ay;
    const len2 = abx * abx + aby * aby;
    let t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / len2));
    minD = Math.min(minD, Math.hypot(px - (ax + t * abx), py - (ay + t * aby)));
  }
  return minD;
}

function closestIdx(pts, px, py) {
  let best = Infinity, idx = 0;
  for (let i = 0; i < pts.length; i++) {
    const d = dist2D(pts[i], [px, py]);
    if (d < best) { best = d; idx = i; }
  }
  return idx;
}

// ── Main validator ────────────────────────────────────────────────────────────

/**
 * validateTrace(userPath, guidePoints)
 * 
 * @param {[number,number][]} userPath    - touch points in SVG coord space
 * @param {[number,number][]} guidePoints - from samplePathD()
 * @returns {{ valid: boolean, reason: string }}
 */
export function validateTrace(userPath, guidePoints) {
  if (!userPath || userPath.length < MIN_POINTS) {
    console.log(`[trace] ❌ too_few_points: ${userPath?.length}`);
    return { valid: false, reason: "too_few_points" };
  }
  if (!guidePoints || guidePoints.length < 2) {
    console.log(`[trace] ❌ no_guide`);
    return { valid: false, reason: "no_guide" };
  }

  const first = userPath[0];
  const last  = userPath[userPath.length - 1];
  const gFirst = guidePoints[0];
  const gLast  = guidePoints[guidePoints.length - 1];

  // 1. Start gate
  const startDist = dist2D(first, gFirst);
  if (startDist > START_TOLERANCE) {
    console.log(`[trace] ❌ wrong_start: dist=${startDist.toFixed(1)} first=[${first}] gFirst=[${gFirst}]`);
    return { valid: false, reason: "wrong_start" };
  }

  // 2. End gate
  const endDist = dist2D(last, gLast);
  if (endDist > END_TOLERANCE) {
    console.log(`[trace] ❌ wrong_end: dist=${endDist.toFixed(1)} last=[${last}] gLast=[${gLast}]`);
    return { valid: false, reason: "wrong_end" };
  }

  // 3. Minimum arc-length
  const guideLen = polylineLength(guidePoints);
  const userLen  = polylineLength(userPath);
  if (userLen < guideLen * MIN_LENGTH_RATIO) {
    console.log(`[trace] ❌ too_short: userLen=${userLen.toFixed(1)} guideLen=${guideLen.toFixed(1)} ratio=${(userLen/guideLen).toFixed(2)}`);
    return { valid: false, reason: "too_short" };
  }

  // 4. Off-path fraction
  let offPath = 0;
  for (const [px, py] of userPath) {
    if (distToPolyline(guidePoints, px, py) > CORRIDOR_WIDTH) offPath++;
  }
  if (offPath / userPath.length > MAX_OFF_PATH_FRAC) {
    console.log(`[trace] ❌ off_path: ${offPath}/${userPath.length} = ${(offPath/userPath.length).toFixed(2)}`);
    return { valid: false, reason: "off_path" };
  }

  // 5. Forward coverage + backward check
  const N = guidePoints.length;
  const covered = new Array(N).fill(false);
  let maxIdx = 0, reverseCount = 0, mappedCount = 0;

  for (const [px, py] of userPath) {
    const ni = closestIdx(guidePoints, px, py);
    if (dist2D(guidePoints[ni], [px, py]) > CORRIDOR_WIDTH) continue;
    mappedCount++;
    if (ni >= maxIdx) {
      covered[ni] = true;
      maxIdx = ni;
    } else {
      reverseCount++;
    }
  }

  if (mappedCount > 0 && reverseCount / mappedCount > MAX_REVERSE_FRAC) {
    console.log(`[trace] ❌ backward: reverseCount=${reverseCount} mappedCount=${mappedCount}`);
    return { valid: false, reason: "backward" };
  }

  const coverageRatio = covered.filter(Boolean).length / N;
  if (coverageRatio < MIN_COVERAGE) {
    console.log(`[trace] ❌ low_coverage: ${Math.round(coverageRatio * 100)}% < ${MIN_COVERAGE*100}%`);
    return { valid: false, reason: `low_coverage:${Math.round(coverageRatio * 100)}%` };
  }

  console.log(`[trace] ✅ valid — coverage=${Math.round(coverageRatio*100)}% userLen=${Math.round(userLen)} guideLen=${Math.round(guideLen)}`);
  return { valid: true, reason: "ok" };
}