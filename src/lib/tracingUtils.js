/**
 * tracingUtils.js
 * 
 * Strict Duolingo-style stroke validation.
 * 
 * Rules enforced:
 *  1. Must start near the stroke's defined start point
 *  2. Must end near the stroke's defined end point  
 *  3. Must cover at least 60% of the guide path in forward order
 *  4. Must not trace backward (reverse direction rejected)
 *  5. Must stay within corridor (off-path points rejected)
 *  6. Minimum drawn length (taps / tiny scribbles rejected)
 */

// ── Tuning constants ──────────────────────────────────────────────────────────

// How close (in SVG units, within the 60×80 cell) the finger must land to start
const START_TOLERANCE = 12;

// How close the finger must be when lifted to the stroke end
const END_TOLERANCE = 14;

// Max perpendicular distance from the guide path before a point is "off-corridor"
const CORRIDOR_WIDTH = 12;

// Fraction of guide points that must be hit (in order) for success
const MIN_COVERAGE = 0.60;

// Minimum number of recorded touch points (rejects taps)
const MIN_POINTS = 8;

// User's drawn length must be at least this fraction of the guide's arc-length
const MIN_LENGTH_RATIO = 0.40;

// Fraction of mapped points that can go backward before rejection
const MAX_REVERSE_FRACTION = 0.20;

// Fraction of user points that can be outside the corridor before rejection
const MAX_OFF_PATH_FRACTION = 0.35;


// ── Geometry helpers ──────────────────────────────────────────────────────────

function dist2D([ax, ay], [bx, by]) {
  return Math.hypot(ax - bx, ay - by);
}

function polylineLength(pts) {
  let len = 0;
  for (let i = 1; i < pts.length; i++) len += dist2D(pts[i - 1], pts[i]);
  return len;
}

function distPointToSegment([px, py], [ax, ay], [bx, by]) {
  const abx = bx - ax, aby = by - ay;
  const len2 = abx * abx + aby * aby;
  if (len2 === 0) return Math.hypot(px - ax, py - ay);
  let t = ((px - ax) * abx + (py - ay) * aby) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * abx), py - (ay + t * aby));
}

function distToPolyline(guidePoints, px, py) {
  let minD = Infinity;
  for (let i = 1; i < guidePoints.length; i++) {
    const d = distPointToSegment([px, py], guidePoints[i - 1], guidePoints[i]);
    if (d < minD) minD = d;
  }
  return minD;
}

function closestGuideIndex(guidePoints, px, py) {
  let best = Infinity, idx = 0;
  for (let i = 0; i < guidePoints.length; i++) {
    const d = dist2D(guidePoints[i], [px, py]);
    if (d < best) { best = d; idx = i; }
  }
  return idx;
}


// ── Path sampler ──────────────────────────────────────────────────────────────

/**
 * Sample N evenly-spaced points from an SVG <path> DOM element.
 * Returns [[x, y], ...] in the element's local coordinate space.
 */
export function samplePathPoints(pathEl, count = 80) {
  if (!pathEl || typeof pathEl.getTotalLength !== "function") return [];
  const total = pathEl.getTotalLength();
  if (total === 0) return [];
  const pts = [];
  for (let i = 0; i <= count; i++) {
    const p = pathEl.getPointAtLength((i / count) * total);
    pts.push([p.x, p.y]);
  }
  return pts;
}


// ── Main validator ────────────────────────────────────────────────────────────

/**
 * validateTrace(userPath, guidePoints)
 * 
 * @param {[number,number][]} userPath     - raw touch points in SVG coords
 * @param {[number,number][]} guidePoints  - sampled from the SVG <path> element
 * @returns {{ valid: boolean, reason: string }}
 */
export function validateTrace(userPath, guidePoints) {
  if (!userPath || userPath.length < MIN_POINTS) {
    return { valid: false, reason: "too_few_points" };
  }
  if (!guidePoints || guidePoints.length < 2) {
    return { valid: false, reason: "no_guide" };
  }

  const first = userPath[0];
  const last = userPath[userPath.length - 1];
  const gFirst = guidePoints[0];
  const gLast = guidePoints[guidePoints.length - 1];

  // ── 1. Start gate ─────────────────────────────────────────────────────────
  if (dist2D(first, gFirst) > START_TOLERANCE) {
    return { valid: false, reason: "wrong_start" };
  }

  // ── 2. End gate ───────────────────────────────────────────────────────────
  if (dist2D(last, gLast) > END_TOLERANCE) {
    return { valid: false, reason: "wrong_end" };
  }

  // ── 3. Minimum arc-length ─────────────────────────────────────────────────
  const guideLen = polylineLength(guidePoints);
  const userLen = polylineLength(userPath);
  if (userLen < guideLen * MIN_LENGTH_RATIO) {
    return { valid: false, reason: "too_short" };
  }

  // ── 4. Off-path check ─────────────────────────────────────────────────────
  let offPath = 0;
  for (const [px, py] of userPath) {
    if (distToPolyline(guidePoints, px, py) > CORRIDOR_WIDTH) offPath++;
  }
  if (offPath / userPath.length > MAX_OFF_PATH_FRACTION) {
    return { valid: false, reason: "off_path" };
  }

  // ── 5. Forward coverage with backward-travel check ───────────────────────
  const N = guidePoints.length;
  const covered = new Array(N).fill(false);
  let maxIdx = 0;
  let reverseCount = 0;
  let mappedCount = 0;

  for (const [px, py] of userPath) {
    const nearest = closestGuideIndex(guidePoints, px, py);
    const d = dist2D(guidePoints[nearest], [px, py]);
    if (d > CORRIDOR_WIDTH) continue; // outside corridor, skip

    mappedCount++;
    if (nearest >= maxIdx) {
      covered[nearest] = true;
      maxIdx = nearest;
    } else {
      reverseCount++;
    }
  }

  if (mappedCount > 0 && reverseCount / mappedCount > MAX_REVERSE_FRACTION) {
    return { valid: false, reason: "backward" };
  }

  const coverageRatio = covered.filter(Boolean).length / N;
  if (coverageRatio < MIN_COVERAGE) {
    return { valid: false, reason: `low_coverage:${Math.round(coverageRatio * 100)}%` };
  }

  return { valid: true, reason: "ok" };
}