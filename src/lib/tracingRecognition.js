/**
 * tracingRecognition.js
 *
 * Checkpoint + corridor validation for children's letter tracing.
 * No DOM dependency — uses the pure-JS samplePathD from letterPaths logic.
 *
 * Validation model (see spec image):
 *   progress      = reachedCheckpoints / totalCheckpoints  ≥ REQUIRED_CHECKPOINT_RATIO
 *   offPathRatio  = offPathSamples     / totalSamples      ≤ MAX_OFF_PATH_RATIO
 *   tracePoints                                            ≥ MIN_TRACE_POINTS
 */

// ── Default config ─────────────────────────────────────────────────────────────
export const DEFAULT_CONFIG = {
  START_TOLERANCE:            22,   // SVG units — how close to stroke start to begin
  CHECKPOINT_TOLERANCE:       20,   // SVG units — radius around each checkpoint
  CORRIDOR_TOLERANCE:         26,   // SVG units — max off-path distance allowed
  REQUIRED_CHECKPOINT_RATIO:  0.78, // fraction of checkpoints that must be hit
  MAX_OFF_PATH_RATIO:         0.35, // fraction of samples allowed outside corridor
  MIN_TRACE_POINTS:           4,    // minimum pointer samples to be a valid trace
  DOT_TOLERANCE:              24,   // SVG units — tap radius for dot strokes (i, j)
  CHECKPOINT_COUNT:           12,   // number of checkpoints to generate per stroke
  CHECKPOINT_LOOKAHEAD:       2,    // how many ahead checkpoints to check at once
};

// ── Geometry helpers ───────────────────────────────────────────────────────────

/** Euclidean distance between two [x, y] points */
export function distance(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

/** Nearest distance from a point to any segment of the guide polyline */
export function nearestDistanceToGuide(point, guidePoints) {
  const [px, py] = point;
  let minD = Infinity;
  for (let i = 1; i < guidePoints.length; i++) {
    const [ax, ay] = guidePoints[i - 1];
    const [bx, by] = guidePoints[i];
    const abx = bx - ax, aby = by - ay;
    const len2 = abx * abx + aby * aby;
    const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / len2));
    minD = Math.min(minD, Math.hypot(px - (ax + t * abx), py - (ay + t * aby)));
  }
  return minD;
}

// ── Pure-JS path sampler (no DOM / getTotalLength) ────────────────────────────

function lerp(a, b, t) { return a + (b - a) * t; }

/**
 * Sample a SVG path `d` string into `count` evenly-spaced [x,y] points.
 * Handles M, L, C, Q, Z commands.
 */
export function samplePathD(d, count = 80) {
  if (!d) return [];

  const segments = [];
  const re = /([MLCQZz])\s*([\d\s.,eE+-]*)/g;
  let m;
  while ((m = re.exec(d)) !== null) {
    const cmd = m[1].toUpperCase();
    const nums = (m[2].match(/[-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?/g) || []).map(Number);
    segments.push({ cmd, nums });
  }

  const rawPts = [];
  let cx = 0, cy = 0, startX = 0, startY = 0;
  const STEPS = 20;

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
      for (let i = 0; i < nums.length; i += 6) {
        const [x1, y1, x2, y2, ex, ey] = nums.slice(i, i + 6);
        const ox = cx, oy = cy;
        for (let s = 1; s <= STEPS; s++) {
          const t = s / STEPS, u = 1 - t;
          rawPts.push([
            u*u*u*ox + 3*u*u*t*x1 + 3*u*t*t*x2 + t*t*t*ex,
            u*u*u*oy + 3*u*u*t*y1 + 3*u*t*t*y2 + t*t*t*ey,
          ]);
        }
        cx = ex; cy = ey;
      }
    } else if (cmd === 'Q') {
      for (let i = 0; i < nums.length; i += 4) {
        const [x1, y1, ex, ey] = nums.slice(i, i + 4);
        const ox = cx, oy = cy;
        for (let s = 1; s <= STEPS; s++) {
          const t = s / STEPS, u = 1 - t;
          rawPts.push([u*u*ox + 2*u*t*x1 + t*t*ex, u*u*oy + 2*u*t*y1 + t*t*ey]);
        }
        cx = ex; cy = ey;
      }
    } else if (cmd === 'Z') {
      rawPts.push([startX, startY]);
      cx = startX; cy = startY;
    }
  }

  if (rawPts.length < 2) return rawPts;

  // Re-sample to exactly `count` arc-length-evenly-spaced points
  const arcLen = [0];
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
    result.push([lerp(rawPts[j][0], rawPts[j + 1][0], t), lerp(rawPts[j][1], rawPts[j + 1][1], t)]);
  }
  return result;
}

// ── Checkpoint builder ────────────────────────────────────────────────────────

/**
 * Pick `desiredCount` evenly-spaced checkpoints from the guide polyline.
 * Returns array of [x, y].
 */
export function buildCheckpoints(guidePoints, desiredCount = DEFAULT_CONFIG.CHECKPOINT_COUNT) {
  if (guidePoints.length === 0) return [];
  if (guidePoints.length <= desiredCount) return [...guidePoints];

  const result = [];
  const step = (guidePoints.length - 1) / (desiredCount - 1);
  for (let i = 0; i < desiredCount; i++) {
    const idx = Math.round(i * step);
    result.push(guidePoints[Math.min(idx, guidePoints.length - 1)]);
  }
  return result;
}

// ── Stroke session ────────────────────────────────────────────────────────────

/**
 * Create a new session object for tracking one stroke attempt.
 * @param {object} stroke       — stroke definition from LETTER_DEFS
 * @param {[number,number][]} guidePoints — from samplePathD
 * @param {object} config       — merged with DEFAULT_CONFIG
 */
export function createStrokeSession(stroke, guidePoints, config = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const checkpoints = buildCheckpoints(guidePoints, cfg.CHECKPOINT_COUNT);
  return {
    stroke,
    guidePoints,
    checkpoints,
    config: cfg,
    // mutable state
    trace: [],              // all pointer points so far
    checkpointIndex: 0,     // next checkpoint to reach
    reachedCount: 0,        // how many checkpoints passed
    offPathSamples: 0,      // samples outside corridor
    totalSamples: 0,
    started: false,
  };
}

/**
 * Feed one new SVG-coordinate point into the session.
 * Call this on every pointerMove sample.
 * @returns updated session (mutated in place for performance, returns same ref)
 */
export function updateStrokeSession(session, point) {
  const { guidePoints, checkpoints, config } = session;
  const { CORRIDOR_TOLERANCE, CHECKPOINT_TOLERANCE, CHECKPOINT_LOOKAHEAD } = config;

  session.trace.push(point);
  session.totalSamples++;

  // Off-path check against full guide polyline
  const d = nearestDistanceToGuide(point, guidePoints);
  if (d > CORRIDOR_TOLERANCE) {
    session.offPathSamples++;
  }

  // Advance checkpoints — check current and a small lookahead window
  const lookahead = CHECKPOINT_LOOKAHEAD;
  for (let offset = 0; offset <= lookahead; offset++) {
    const idx = session.checkpointIndex + offset;
    if (idx >= checkpoints.length) break;
    if (distance(point, checkpoints[idx]) <= CHECKPOINT_TOLERANCE) {
      // Advance through all checkpoints up to this one
      const newIdx = idx + 1;
      session.reachedCount += newIdx - session.checkpointIndex;
      session.checkpointIndex = newIdx;
      break;
    }
  }

  return session;
}

/**
 * Evaluate the session at pointer-up and return a result.
 * @returns {{ valid: boolean, reason: string, checkpointProgress: number, offPathRatio: number }}
 */
export function finalizeStrokeSession(session) {
  const { checkpoints, config, trace, reachedCount, offPathSamples, totalSamples } = session;
  const { REQUIRED_CHECKPOINT_RATIO, MAX_OFF_PATH_RATIO, MIN_TRACE_POINTS } = config;

  const totalCheckpoints = checkpoints.length;
  const checkpointProgress = totalCheckpoints > 0 ? reachedCount / totalCheckpoints : 0;
  const offPathRatio = totalSamples > 0 ? offPathSamples / totalSamples : 0;
  const enoughPoints = trace.length >= MIN_TRACE_POINTS;

  // Dev logging
  console.log(
    `[trace] checkpointProgress=${(checkpointProgress * 100).toFixed(0)}%`,
    `offPathRatio=${(offPathRatio * 100).toFixed(0)}%`,
    `tracePoints=${trace.length}`
  );

  if (!enoughPoints) {
    return { valid: false, reason: "too_few_points", checkpointProgress, offPathRatio };
  }
  if (offPathRatio > MAX_OFF_PATH_RATIO) {
    return { valid: false, reason: "off_path", checkpointProgress, offPathRatio };
  }
  if (checkpointProgress < REQUIRED_CHECKPOINT_RATIO) {
    return { valid: false, reason: "low_coverage", checkpointProgress, offPathRatio };
  }

  return { valid: true, reason: "ok", checkpointProgress, offPathRatio };
}

/**
 * Validate a dot stroke (i-dot, j-dot) from a single tap point.
 */
export function validateDotStroke(point, dotCenter, tolerance = DEFAULT_CONFIG.DOT_TOLERANCE) {
  const d = distance(point, dotCenter);
  console.log(`[dot] dist=${d.toFixed(1)} tolerance=${tolerance}`);
  return d <= tolerance;
}