/**
 * LETTER STROKE PATH DEFINITIONS
 * ================================
 * Research-backed guided handwriting system.
 *
 * Design principles (sourced from LetterSchool, Writing Wizard, Duolingo Trace):
 *  1. Each letter is defined as ordered STROKES.
 *  2. Each stroke has ordered WAYPOINTS (x, y) in a normalized 100x100 grid.
 *  3. A child's touch is validated by PROXIMITY (distance formula) + DIRECTION ORDER.
 *  4. Tolerance is deliberately wide (preschool-friendly: ~22% of letter width).
 *  5. When enough waypoints are hit in sequence, the IDEAL SVG STROKE animates in ("snap-to-perfect").
 *  6. The child never sees their own messy path — only the clean stroke reveals progressively.
 *
 * Coordinate system: 0,0 = top-left of a 100x100 bounding box.
 * Letters are simple lowercase print/manuscript forms (ball-and-stick style).
 *
 * Stroke types encoded as SVG path data (relative to 100x100 box):
 *   M = moveto, L = lineto, C = cubic bezier, A = arc
 *
 * Each stroke also carries a `startHint` arrow direction for the animated guide arrow.
 */

// ── Helper: Generate evenly-spaced waypoints along a quadratic bezier ──────────
function bezierWaypoints(p0, p1, p2, steps = 8) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t ** 2 * p2[0];
    const y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t ** 2 * p2[1];
    pts.push([x, y]);
  }
  return pts;
}

// ── Helper: Line waypoints ─────────────────────────────────────────────────────
function lineWaypoints(x0, y0, x1, y1, steps = 6) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    pts.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t]);
  }
  return pts;
}

// ── Helper: Circle arc waypoints (startAngle/endAngle in degrees) ──────────────
function arcWaypoints(cx, cy, rx, ry, startDeg, endDeg, steps = 12, clockwise = true) {
  const pts = [];
  const s = startDeg * (Math.PI / 180);
  const e = endDeg * (Math.PI / 180);
  const range = clockwise ? (e > s ? e - s : e - s + 2 * Math.PI) : (s > e ? s - e : s - e + 2 * Math.PI);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = clockwise ? s + range * t : s - range * t;
    pts.push([cx + rx * Math.cos(angle), cy + ry * Math.sin(angle)]);
  }
  return pts;
}

/**
 * LETTER DEFINITIONS
 * Each letter has an array of strokes.
 * Each stroke: { path: SVG-path-string, waypoints: [[x,y],...], startHint: "down"|"right"|"curve-left"|... }
 *
 * The SVG viewBox is 0 0 100 120 (taller to accommodate descenders/ascenders).
 * Letters sit in the 10–90 x range, 15–105 y range (leaving room for guide lines).
 */

export const LETTER_DEFS = {
  // ── a ─────────────────────────────────────────────────────────────────────
  // Ball-and-stick lowercase a:
  //   Stroke 1: Circle (counter-clockwise from ~2 o'clock), then
  //   Stroke 2: Vertical stick down on the right
  a: {
    viewBox: "0 0 100 120",
    // Guide lines positions (as % of 120)
    baselineY: 90,
    midlineY: 45,
    strokes: [
      {
        // Oval: start at right-middle, go up and around counter-clockwise
        path: "M 68,67 A 22,22 0 1 0 68,68 Z M 68,68 L 68,92",
        // We break into 2 SVG paths for animation
        svgStrokes: [
          { d: "M 68,67 A 22,22 0 1 0 68.1,67", fill: "none" },
          { d: "M 68,67 L 68,92", fill: "none" },
        ],
        waypoints: [
          ...arcWaypoints(46, 67, 22, 22, -20, 200, 12, false),
          ...lineWaypoints(68, 67, 68, 92, 5),
        ],
        startHint: "up",
        instruction: "Make a circle, then go down",
      },
    ],
  },

  // ── b ─────────────────────────────────────────────────────────────────────
  // Stroke 1: tall vertical line down
  // Stroke 2: bump to the right (circle on lower right)
  b: {
    viewBox: "0 0 100 120",
    baselineY: 90,
    midlineY: 45,
    strokes: [
      {
        svgStrokes: [{ d: "M 30,18 L 30,92", fill: "none" }],
        waypoints: lineWaypoints(30, 18, 30, 92, 8),
        startHint: "down",
        instruction: "Go down",
      },
      {
        svgStrokes: [{ d: "M 30,67 A 21,21 0 1 1 30,68", fill: "none" }],
        waypoints: arcWaypoints(51, 67, 21, 21, 180, 540, 12, true),
        startHint: "curve-right",
        instruction: "Make a bump",
      },
    ],
  },

  // ── c ─────────────────────────────────────────────────────────────────────
  // Single stroke: open arc from upper-right, sweeping counter-clockwise
  c: {
    viewBox: "0 0 100 120",
    baselineY: 90,
    midlineY: 45,
    strokes: [
      {
        svgStrokes: [{ d: "M 72,52 A 24,22 0 1 0 72,84", fill: "none" }],
        waypoints: arcWaypoints(48, 67, 24, 22, -30, 210, 14, false),
        startHint: "curve-left",
        instruction: "Curve around",
      },
    ],
  },

  // ── d ─────────────────────────────────────────────────────────────────────
  // Stroke 1: circle on the left (like c, but closed)
  // Stroke 2: tall vertical line up-right side
  d: {
    viewBox: "0 0 100 120",
    baselineY: 90,
    midlineY: 45,
    strokes: [
      {
        svgStrokes: [{ d: "M 63,67 A 21,22 0 1 0 63,68", fill: "none" }],
        waypoints: arcWaypoints(42, 67, 21, 22, 0, 360, 12, false),
        startHint: "up",
        instruction: "Make a circle",
      },
      {
        svgStrokes: [{ d: "M 63,18 L 63,92", fill: "none" }],
        waypoints: lineWaypoints(63, 18, 63, 92, 8),
        startHint: "down",
        instruction: "Go down",
      },
    ],
  },

  // ── e ─────────────────────────────────────────────────────────────────────
  // Single stroke: horizontal line right, then arc counter-clockwise
  e: {
    viewBox: "0 0 100 120",
    baselineY: 90,
    midlineY: 45,
    strokes: [
      {
        svgStrokes: [{ d: "M 26,67 L 70,67 A 22,22 0 1 1 27,62", fill: "none" }],
        waypoints: [
          ...lineWaypoints(26, 67, 70, 67, 5),
          ...arcWaypoints(48, 67, 22, 22, 0, -200, 10, false),
        ],
        startHint: "right",
        instruction: "Go right then curve around",
      },
    ],
  },

  // ── f ─────────────────────────────────────────────────────────────────────
  // Stroke 1: curve at top, go down
  // Stroke 2: horizontal cross bar
  f: {
    viewBox: "0 0 100 120",
    baselineY: 90,
    midlineY: 45,
    strokes: [
      {
        svgStrokes: [{ d: "M 60,22 Q 46,15 42,30 L 42,92", fill: "none" }],
        waypoints: [
          ...bezierWaypoints([60, 22], [46, 15], [42, 30], 6),
          ...lineWaypoints(42, 30, 42, 92, 7),
        ],
        startHint: "down",
        instruction: "Curve then go down",
      },
      {
        svgStrokes: [{ d: "M 28,55 L 58,55", fill: "none" }],
        waypoints: lineWaypoints(28, 55, 58, 55, 5),
        startHint: "right",
        instruction: "Cross",
      },
    ],
  },

  // ── g ─────────────────────────────────────────────────────────────────────
  // Stroke 1: circle
  // Stroke 2: vertical down then curve left (descender)
  g: {
    viewBox: "0 0 100 130",
    baselineY: 90,
    midlineY: 45,
    strokes: [
      {
        svgStrokes: [{ d: "M 65,67 A 21,21 0 1 0 65,68", fill: "none" }],
        waypoints: arcWaypoints(44, 67, 21, 21, 0, 360, 12, false),
        startHint: "up",
        instruction: "Make a circle",
      },
      {
        svgStrokes: [{ d: "M 65,67 L 65,100 Q 65,115 44,115 Q 30,115 28,105", fill: "none" }],
        waypoints: [
          ...lineWaypoints(65, 67, 65, 100, 5),
          ...bezierWaypoints([65, 100], [65, 115], [44, 115], 4),
          [30, 110],
        ],
        startHint: "down",
        instruction: "Go down and curve",
      },
    ],
  },

  // ── h ─────────────────────────────────────────────────────────────────────
  // Stroke 1: tall line down
  // Stroke 2: arch right and down
  h: {
    viewBox: "0 0 100 120",
    baselineY: 90,
    midlineY: 45,
    strokes: [
      {
        svgStrokes: [{ d: "M 28,18 L 28,92", fill: "none" }],
        waypoints: lineWaypoints(28, 18, 28, 92, 8),
        startHint: "down",
        instruction: "Go down",
      },
      {
        svgStrokes: [{ d: "M 28,58 Q 28,42 48,42 Q 68,42 68,58 L 68,92", fill: "none" }],
        waypoints: [
          [28, 58],
          ...bezierWaypoints([28, 58], [28, 42], [48, 42], 5),
          ...bezierWaypoints([48, 42], [68, 42], [68, 58], 5),
          ...lineWaypoints(68, 58, 68, 92, 5),
        ],
        startHint: "curve-right",
        instruction: "Arch and go down",
      },
    ],
  },

  // ── i ─────────────────────────────────────────────────────────────────────
  // Stroke 1: dot (short tap up top)
  // Stroke 2: short vertical line
  i: {
    viewBox: "0 0 100 120",
    baselineY: 90,
    midlineY: 45,
    strokes: [
      {
        svgStrokes: [{ d: "M 50,32 L 50,34", fill: "none" }],
        waypoints: [[50, 33]],
        startHint: "dot",
        instruction: "Dot",
      },
      {
        svgStrokes: [{ d: "M 50,46 L 50,92", fill: "none" }],
        waypoints: lineWaypoints(50, 46, 50, 92, 6),
        startHint: "down",
        instruction: "Go down",
      },
    ],
  },

  // ── j ─────────────────────────────────────────────────────────────────────
  j: {
    viewBox: "0 0 100 130",
    baselineY: 90,
    midlineY: 45,
    strokes: [
      {
        svgStrokes: [{ d: "M 58,32 L 58,34", fill: "none" }],
        waypoints: [[58, 33]],
        startHint: "dot",
        instruction: "Dot",
      },
      {
        svgStrokes: [{ d: "M 58,46 L 58,105 Q 58,118 44,118 Q 32,118 30,108", fill: "none" }],
        waypoints: [
          ...lineWaypoints(58, 46, 58, 105, 7),
          ...bezierWaypoints([58, 105], [58, 118], [44, 118], 4),
          [32, 110],
        ],
        startHint: "down",
        instruction: "Go down and curve",
      },
    ],
  },

  // ── k ─────────────────────────────────────────────────────────────────────
  k: {
    viewBox: "0 0 100 120",
    baselineY: 90,
    midlineY: 45,
    strokes: [
      {
        svgStrokes: [{ d: "M 28,18 L 28,92", fill: "none" }],
        waypoints: lineWaypoints(28, 18, 28, 92, 8),
        startHint: "down",
        instruction: "Go down",
      },
      {
        svgStrokes: [{ d: "M 68,42 L 28,67 L 68,92", fill: "none" }],
        waypoints: [
          ...lineWaypoints(68, 42, 28, 67, 5),
          ...lineWaypoints(28, 67, 68, 92, 5),
        ],
        startHint: "down-left",
        instruction: "Kick in and out",
      },
    ],
  },

  // ── l ─────────────────────────────────────────────────────────────────────
  l: {
    viewBox: "0 0 100 120",
    baselineY: 90,
    midlineY: 45,
    strokes: [
      {
        svgStrokes: [{ d: "M 50,18 L 50,92", fill: "none" }],
        waypoints: lineWaypoints(50, 18, 50, 92, 8),
        startHint: "down",
        instruction: "Go down",
      },
    ],
  },

  // ── m ─────────────────────────────────────────────────────────────────────
  m: {
    viewBox: "0 0 100 120",
    baselineY: 90,
    midlineY: 45,
    strokes: [
      {
        svgStrokes: [{ d: "M 18,92 L 18,46 Q 18,36 32,36 Q 46,36 46,46 Q 46,36 60,36 Q 74,36 74,46 L 74,92", fill: "none" }],
        waypoints: [
          ...lineWaypoints(18, 92, 18, 46, 4),
          [25, 38], [32, 36], [39, 36],
          [46, 36], [53, 36], [60, 36],
          [67, 38], [74, 46],
          ...lineWaypoints(74, 46, 74, 92, 4),
        ],
        startHint: "up",
        instruction: "Up, arch, arch, down",
      },
    ],
  },

  // ── n ─────────────────────────────────────────────────────────────────────
  n: {
    viewBox: "0 0 100 120",
    baselineY: 90,
    midlineY: 45,
    strokes: [
      {
        svgStrokes: [{ d: "M 22,92 L 22,42 Q 22,32 42,32 Q 62,32 62,42 L 62,92", fill: "none" }],
        waypoints: [
          ...lineWaypoints(22, 92, 22, 42, 4),
          [22, 36], [32, 32], [42, 32], [52, 32], [62, 36],
          ...lineWaypoints(62, 42, 62, 92, 4),
        ],
        startHint: "up",
        instruction: "Up, arch, down",
      },
    ],
  },

  // ── o ─────────────────────────────────────────────────────────────────────
  o: {
    viewBox: "0 0 100 120",
    baselineY: 90,
    midlineY: 45,
    strokes: [
      {
        svgStrokes: [{ d: "M 50,45 A 22,22 0 1 0 50,45.1", fill: "none" }],
        waypoints: arcWaypoints(50, 67, 22, 22, -90, 270, 14, false),
        startHint: "curve-left",
        instruction: "Make a circle",
      },
    ],
  },

  // ── p ─────────────────────────────────────────────────────────────────────
  p: {
    viewBox: "0 0 100 130",
    baselineY: 90,
    midlineY: 45,
    strokes: [
      {
        svgStrokes: [{ d: "M 28,42 L 28,115", fill: "none" }],
        waypoints: lineWaypoints(28, 42, 28, 115, 8),
        startHint: "down",
        instruction: "Go down",
      },
      {
        svgStrokes: [{ d: "M 28,67 A 20,22 0 1 1 28,68", fill: "none" }],
        waypoints: arcWaypoints(48, 67, 20, 22, 180, 540, 12, true),
        startHint: "curve-right",
        instruction: "Make a bump",
      },
    ],
  },

  // ── q ─────────────────────────────────────────────────────────────────────
  q: {
    viewBox: "0 0 100 130",
    baselineY: 90,
    midlineY: 45,
    strokes: [
      {
        svgStrokes: [{ d: "M 63,67 A 21,22 0 1 0 63,68", fill: "none" }],
        waypoints: arcWaypoints(42, 67, 21, 22, 0, 360, 12, false),
        startHint: "up",
        instruction: "Make a circle",
      },
      {
        svgStrokes: [{ d: "M 63,42 L 63,115", fill: "none" }],
        waypoints: lineWaypoints(63, 42, 63, 115, 8),
        startHint: "down",
        instruction: "Go down",
      },
    ],
  },

  // ── r ─────────────────────────────────────────────────────────────────────
  r: {
    viewBox: "0 0 100 120",
    baselineY: 90,
    midlineY: 45,
    strokes: [
      {
        svgStrokes: [{ d: "M 26,92 L 26,42 Q 28,32 42,32 Q 52,32 54,40", fill: "none" }],
        waypoints: [
          ...lineWaypoints(26, 92, 26, 42, 5),
          [26, 36], [34, 32], [42, 32], [50, 34], [54, 40],
        ],
        startHint: "up",
        instruction: "Up and bump",
      },
    ],
  },

  // ── s ─────────────────────────────────────────────────────────────────────
  s: {
    viewBox: "0 0 100 120",
    baselineY: 90,
    midlineY: 45,
    strokes: [
      {
        svgStrokes: [{ d: "M 68,48 Q 68,34 50,34 Q 28,34 28,54 Q 28,67 50,67 Q 72,67 72,80 Q 72,92 50,92 Q 32,92 28,80", fill: "none" }],
        waypoints: [
          [68, 48], [68, 38], [58, 34], [50, 34], [36, 34], [28, 42], [28, 54],
          [28, 62], [38, 67], [50, 67], [62, 67], [72, 74], [72, 80],
          [72, 88], [62, 92], [50, 92], [38, 92], [28, 88], [28, 80],
        ],
        startHint: "curve-left",
        instruction: "Curve around twice",
      },
    ],
  },

  // ── t ─────────────────────────────────────────────────────────────────────
  t: {
    viewBox: "0 0 100 120",
    baselineY: 90,
    midlineY: 45,
    strokes: [
      {
        svgStrokes: [{ d: "M 50,18 L 50,92", fill: "none" }],
        waypoints: lineWaypoints(50, 18, 50, 92, 8),
        startHint: "down",
        instruction: "Go down",
      },
      {
        svgStrokes: [{ d: "M 28,38 L 72,38", fill: "none" }],
        waypoints: lineWaypoints(28, 38, 72, 38, 5),
        startHint: "right",
        instruction: "Cross",
      },
    ],
  },

  // ── u ─────────────────────────────────────────────────────────────────────
  u: {
    viewBox: "0 0 100 120",
    baselineY: 90,
    midlineY: 45,
    strokes: [
      {
        svgStrokes: [{ d: "M 24,42 L 24,78 Q 24,92 50,92 Q 76,92 76,78 L 76,42", fill: "none" }],
        waypoints: [
          ...lineWaypoints(24, 42, 24, 78, 5),
          [24, 86], [36, 92], [50, 92], [64, 92], [76, 86],
          ...lineWaypoints(76, 78, 76, 42, 5),
        ],
        startHint: "down",
        instruction: "Down, curve, up",
      },
    ],
  },

  // ── v ─────────────────────────────────────────────────────────────────────
  v: {
    viewBox: "0 0 100 120",
    baselineY: 90,
    midlineY: 45,
    strokes: [
      {
        svgStrokes: [{ d: "M 20,42 L 50,92 L 80,42", fill: "none" }],
        waypoints: [
          ...lineWaypoints(20, 42, 50, 92, 6),
          ...lineWaypoints(50, 92, 80, 42, 6),
        ],
        startHint: "down-right",
        instruction: "Down and up",
      },
    ],
  },

  // ── w ─────────────────────────────────────────────────────────────────────
  w: {
    viewBox: "0 0 100 120",
    baselineY: 90,
    midlineY: 45,
    strokes: [
      {
        svgStrokes: [{ d: "M 14,42 L 30,92 L 50,62 L 70,92 L 86,42", fill: "none" }],
        waypoints: [
          ...lineWaypoints(14, 42, 30, 92, 4),
          ...lineWaypoints(30, 92, 50, 62, 4),
          ...lineWaypoints(50, 62, 70, 92, 4),
          ...lineWaypoints(70, 92, 86, 42, 4),
        ],
        startHint: "down-right",
        instruction: "Down, up, down, up",
      },
    ],
  },

  // ── x ─────────────────────────────────────────────────────────────────────
  x: {
    viewBox: "0 0 100 120",
    baselineY: 90,
    midlineY: 45,
    strokes: [
      {
        svgStrokes: [{ d: "M 22,42 L 78,92", fill: "none" }],
        waypoints: lineWaypoints(22, 42, 78, 92, 6),
        startHint: "down-right",
        instruction: "Diagonal",
      },
      {
        svgStrokes: [{ d: "M 78,42 L 22,92", fill: "none" }],
        waypoints: lineWaypoints(78, 42, 22, 92, 6),
        startHint: "down-left",
        instruction: "Cross",
      },
    ],
  },

  // ── y ─────────────────────────────────────────────────────────────────────
  y: {
    viewBox: "0 0 100 130",
    baselineY: 90,
    midlineY: 45,
    strokes: [
      {
        svgStrokes: [{ d: "M 22,42 L 50,75", fill: "none" }],
        waypoints: lineWaypoints(22, 42, 50, 75, 5),
        startHint: "down-right",
        instruction: "Diagonal down",
      },
      {
        svgStrokes: [{ d: "M 78,42 L 50,75 L 38,115", fill: "none" }],
        waypoints: [
          ...lineWaypoints(78, 42, 50, 75, 5),
          ...lineWaypoints(50, 75, 38, 115, 5),
        ],
        startHint: "down-left",
        instruction: "Down and curve",
      },
    ],
  },

  // ── z ─────────────────────────────────────────────────────────────────────
  z: {
    viewBox: "0 0 100 120",
    baselineY: 90,
    midlineY: 45,
    strokes: [
      {
        svgStrokes: [{ d: "M 22,42 L 78,42 L 22,92 L 78,92", fill: "none" }],
        waypoints: [
          ...lineWaypoints(22, 42, 78, 42, 4),
          ...lineWaypoints(78, 42, 22, 92, 5),
          ...lineWaypoints(22, 92, 78, 92, 4),
        ],
        startHint: "right",
        instruction: "Right, diagonal, right",
      },
    ],
  },
};

/**
 * STROKE VALIDATION ENGINE
 * ========================
 * Given the child's touch path and the target waypoints,
 * compute what fraction of waypoints have been hit in order.
 *
 * Rules (research-backed for preschool tolerance):
 *  - Tolerance radius: 22 units in the 100-unit grid (≈ 22% of letter width)
 *  - Waypoints must be hit in ORDER (direction-aware)
 *  - Once a waypoint is hit, we advance to the next
 *  - We never go backwards (direction validation)
 *  - Progress = hitCount / totalWaypoints
 *  - Threshold for "stroke complete": 65% of waypoints hit
 */
export const WAYPOINT_TOLERANCE = 22;
export const COMPLETION_THRESHOLD = 0.65;

export function validateStroke(touchPoints, waypoints, scale) {
  if (!touchPoints.length || !waypoints.length) return { progress: 0, hitCount: 0 };

  const tol = WAYPOINT_TOLERANCE * scale;
  let hitCount = 0;
  let waypointIdx = 0;

  for (const tp of touchPoints) {
    if (waypointIdx >= waypoints.length) break;
    const [wx, wy] = waypoints[waypointIdx];
    const dx = tp.x - wx * scale;
    const dy = tp.y - wy * scale;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= tol) {
      hitCount++;
      waypointIdx++;
    }
  }

  return {
    progress: hitCount / waypoints.length,
    hitCount,
    complete: hitCount / waypoints.length >= COMPLETION_THRESHOLD,
  };
}