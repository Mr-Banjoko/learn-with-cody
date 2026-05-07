/**
 * Letter path definitions for the tracing game.
 *
 * Each letter definition contains:
 *   strokes: Array of stroke objects. Each stroke:
 *     - pathData: SVG path string (normalized to a 100×160 viewBox)
 *     - startPoint: {x, y} — where the finger must begin (within tolerance)
 *     - samplePoints: array of {x,y} points along the path for hit-testing
 *
 * The 100×160 viewBox uses these guide zones:
 *   topLine   y = 0
 *   midLine   y = 60   (dashed midline / x-height top)
 *   baseLine  y = 110  (writing baseline)
 *   descLine  y = 160  (descender line)
 *
 * All coordinates are relative to this space and will be scaled to fit.
 */

// Helper: sample N evenly-spaced points along an SVG path string
function samplePath(pathData, n = 20) {
  try {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 100 160");
    svg.style.position = "absolute";
    svg.style.visibility = "hidden";
    svg.style.pointerEvents = "none";
    document.body.appendChild(svg);
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    svg.appendChild(path);
    const len = path.getTotalLength();
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const pt = path.getPointAtLength((i / n) * len);
      pts.push({ x: pt.x, y: pt.y });
    }
    document.body.removeChild(svg);
    return pts;
  } catch {
    return [];
  }
}

// Guide y positions (in 100×160 viewBox)
const T = 0;    // top line
const M = 60;   // dashed midline
const B = 110;  // baseline
const D = 160;  // descender line

// Helper to build a letter definition
function letter(strokes) {
  return { strokes };
}

function stroke(pathData, startPoint) {
  return { pathData, startPoint, _rawPath: pathData };
}

/**
 * RAW letter definitions.
 * pathData uses the 100×160 coordinate space.
 * startPoint is where the stroke begins.
 */
export const LETTER_DEFS = {

  // ── Single-stroke letters ─────────────────────────────────────────────────

  a: letter([
    // CCW oval from upper-right, close at baseline-right, then tail down-right
    stroke(
      `M 72,72 C 72,62 64,60 55,60 C 38,60 28,72 28,85 C 28,100 38,110 55,110 C 65,110 72,104 72,98 L 72,72 L 72,110 L 82,110`,
      { x: 72, y: 72 }
    ),
  ]),

  c: letter([
    // CCW open arc, start upper-right, end lower-right
    stroke(
      `M 74,68 C 72,61 65,60 58,60 C 42,60 30,72 30,85 C 30,98 42,110 58,110 C 65,110 72,108 74,102`,
      { x: 74, y: 68 }
    ),
  ]),

  e: letter([
    // Horizontal mid-stroke then CCW arc upward and around, ending open lower-right
    stroke(
      `M 34,82 L 70,82 C 70,82 70,60 52,60 C 34,60 28,72 28,85 C 28,100 38,110 54,110 C 64,110 70,106 74,100`,
      { x: 34, y: 82 }
    ),
  ]),

  g: letter([
    // CCW oval (like a body), then tail descends below baseline curving left
    stroke(
      `M 72,72 C 72,62 64,60 55,60 C 38,60 28,72 28,85 C 28,100 38,110 55,110 C 65,110 72,104 72,98 L 72,72 L 72,120 C 72,140 60,150 46,148`,
      { x: 72, y: 72 }
    ),
  ]),

  l: letter([
    // Tall vertical downstroke from top, small rightward hook at baseline
    stroke(
      `M 50,5 L 50,106 C 50,109 53,112 58,112`,
      { x: 50, y: 5 }
    ),
  ]),

  o: letter([
    // Full CCW closed oval
    stroke(
      `M 64,68 C 64,62 57,60 50,60 C 36,60 26,71 26,85 C 26,99 36,110 50,110 C 64,110 74,99 74,85 C 74,71 64,68 64,68 Z`,
      { x: 64, y: 68 }
    ),
  ]),

  s: letter([
    // Top arc curving left-down, then reverses right-down, ending lower-left
    stroke(
      `M 70,68 C 68,61 60,60 54,60 C 42,60 34,67 34,76 C 34,86 44,90 54,93 C 64,96 72,101 72,108 C 72,115 64,112 56,112 C 46,112 36,108 30,102`,
      { x: 70, y: 68 }
    ),
  ]),

  v: letter([
    // Diagonal downstroke to bottom center, then diagonal upstroke to right
    stroke(
      `M 26,62 L 50,110 L 74,62`,
      { x: 26, y: 62 }
    ),
  ]),

  w: letter([
    // Two connected v-shapes: down-up-down-up
    stroke(
      `M 18,62 L 34,110 L 50,78 L 66,110 L 82,62`,
      { x: 18, y: 62 }
    ),
  ]),

  y: letter([
    // Diagonal downstroke to center, then from upper-right diagonally down continuing below baseline curving left
    stroke(
      `M 26,62 L 50,90 M 74,62 L 50,90 L 44,130 C 40,148 28,150 20,145`,
      { x: 26, y: 62 }
    ),
  ]),

  z: letter([
    // Horizontal right, diagonal down-left, horizontal right
    stroke(
      `M 28,62 L 72,62 L 28,110 L 72,110`,
      { x: 28, y: 62 }
    ),
  ]),

  // ── Two-stroke letters ────────────────────────────────────────────────────

  b: letter([
    // Stroke 1: tall vertical downstroke from above midline to baseline
    stroke(
      `M 36,5 L 36,110`,
      { x: 36, y: 5 }
    ),
    // Stroke 2: clockwise bowl from midpoint of stroke1 curving right, closing at baseline
    stroke(
      `M 36,60 C 36,60 72,62 72,85 C 72,100 60,110 48,110 C 36,110 36,110 36,110`,
      { x: 36, y: 60 }
    ),
  ]),

  d: letter([
    // Stroke 1: CCW oval (like 'a' body)
    stroke(
      `M 64,72 C 64,62 56,60 47,60 C 30,60 22,72 22,85 C 22,100 30,110 47,110 C 58,110 64,104 64,98 L 64,72`,
      { x: 64, y: 72 }
    ),
    // Stroke 2: tall vertical downstroke from above midline, attached right of oval
    stroke(
      `M 64,5 L 64,110`,
      { x: 64, y: 5 }
    ),
  ]),

  f: letter([
    // Stroke 1: tall curved downstroke, curving right at top, descending to baseline with small left hook
    stroke(
      `M 62,5 C 76,5 78,15 72,25 L 50,112 C 48,116 44,118 40,116`,
      { x: 62, y: 5 }
    ),
    // Stroke 2: horizontal crossbar at midline, left to right across stroke1
    stroke(
      `M 32,62 L 68,62`,
      { x: 32, y: 62 }
    ),
  ]),

  i: letter([
    // Stroke 1: short vertical downstroke from midline to baseline, small right hook
    stroke(
      `M 50,62 L 50,106 C 50,109 54,112 58,112`,
      { x: 50, y: 62 }
    ),
    // Stroke 2: dot above midline
    stroke(
      `M 50,48 L 50,48`,
      { x: 50, y: 48 }
    ),
  ]),

  j: letter([
    // Stroke 1: vertical downstroke from midline, curving left below baseline
    stroke(
      `M 54,62 L 54,120 C 54,140 40,148 28,142`,
      { x: 54, y: 62 }
    ),
    // Stroke 2: dot above midline
    stroke(
      `M 54,48 L 54,48`,
      { x: 54, y: 48 }
    ),
  ]),

  k: letter([
    // Stroke 1: tall vertical downstroke from above midline to baseline
    stroke(
      `M 32,5 L 32,110`,
      { x: 32, y: 5 }
    ),
    // Stroke 2: upper diagonal from midpoint going up-right, then lower diagonal going down-right
    stroke(
      `M 32,75 L 68,60 M 32,75 L 68,110`,
      { x: 32, y: 75 }
    ),
  ]),

  m: letter([
    // Stroke 1: first arch — vertical upstroke from baseline arching over and back down
    stroke(
      `M 22,110 L 22,70 C 22,60 32,60 38,65 L 38,110`,
      { x: 22, y: 110 }
    ),
    // Stroke 2: second arch — arching over and back down to baseline, small right hook
    stroke(
      `M 38,70 C 38,60 50,60 54,65 L 54,106 C 54,109 58,112 62,112`,
      { x: 38, y: 70 }
    ),
  ]),

  n: letter([
    // Stroke 1: single arch left side
    stroke(
      `M 26,110 L 26,70 C 26,60 38,60 44,65 L 44,110`,
      { x: 26, y: 110 }
    ),
    // Stroke 2: second arch, ending with small right hook
    stroke(
      `M 44,70 C 44,60 56,60 62,65 L 62,106 C 62,109 66,112 70,112`,
      { x: 44, y: 70 }
    ),
  ]),

  p: letter([
    // Stroke 1: vertical downstroke from midline descending below baseline
    stroke(
      `M 34,62 L 34,155`,
      { x: 34, y: 62 }
    ),
    // Stroke 2: clockwise bowl on right side, between midline and baseline
    stroke(
      `M 34,62 C 34,62 72,64 72,85 C 72,100 60,110 48,110 C 36,110 34,110 34,110`,
      { x: 34, y: 62 }
    ),
  ]),

  q: letter([
    // Stroke 1: CCW oval (like 'a' body)
    stroke(
      `M 66,72 C 66,62 58,60 49,60 C 32,60 22,72 22,85 C 22,100 32,110 49,110 C 60,110 66,104 66,98 L 66,72`,
      { x: 66, y: 72 }
    ),
    // Stroke 2: vertical downstroke on right of oval, descending below baseline
    stroke(
      `M 66,62 L 66,155`,
      { x: 66, y: 62 }
    ),
  ]),

  r: letter([
    // Stroke 1: short vertical upstroke from baseline to midline
    stroke(
      `M 30,110 L 30,62`,
      { x: 30, y: 110 }
    ),
    // Stroke 2: short diagonal shoulder from top of stroke1 curving right
    stroke(
      `M 30,62 C 30,62 42,58 60,68`,
      { x: 30, y: 62 }
    ),
  ]),

  t: letter([
    // Stroke 1: tall vertical downstroke from above midline, small right hook at baseline
    stroke(
      `M 50,8 L 50,106 C 50,109 54,112 58,112`,
      { x: 50, y: 8 }
    ),
    // Stroke 2: horizontal crossbar at midline
    stroke(
      `M 28,62 L 72,62`,
      { x: 28, y: 62 }
    ),
  ]),

  u: letter([
    // Stroke 1: curved downstroke from midline, curving along the baseline
    stroke(
      `M 30,62 L 30,96 C 30,106 38,112 50,112`,
      { x: 30, y: 62 }
    ),
    // Stroke 2: upstroke from baseline back up to midline on right, small right hook
    stroke(
      `M 50,112 C 62,112 70,106 70,96 L 70,62 L 70,62`,
      { x: 50, y: 112 }
    ),
  ]),

  x: letter([
    // Stroke 1: diagonal upper-left to lower-right
    stroke(
      `M 28,62 L 72,110`,
      { x: 28, y: 62 }
    ),
    // Stroke 2: diagonal upper-right to lower-left
    stroke(
      `M 72,62 L 28,110`,
      { x: 72, y: 62 }
    ),
  ]),
};

/**
 * Get the sample points for a path string (call this in-browser for hit testing).
 * Returns array of {x, y} in the 100×160 coordinate space.
 */
export function getSamplePoints(pathData, n = 24) {
  return samplePath(pathData, n);
}

/**
 * Guide line y-positions exported for rendering
 */
export const GUIDE = { T, M, B, D };

// LETTER_CELL exported for any legacy imports
export const LETTER_CELL = { W: 100, H: 160 };