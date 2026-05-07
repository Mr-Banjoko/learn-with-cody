/**
 * letterPaths.js
 *
 * D'Nealian-style cursive SVG paths for all 26 lowercase letters.
 * Cell: 60 wide × 100 tall
 *   top (ascender):  y = 0
 *   midline:         y = 36
 *   baseline:        y = 68
 *   descender:       y = 100
 *
 * Key D'Nealian characteristics:
 *  - All strokes are smooth cubic bezier curves (no straight L segments except crossbars)
 *  - Slight forward slant (~5-10°)
 *  - Each letter ends with a small exit hook/tail to the right at baseline
 *  - x-height letters sit between midline (36) and baseline (68)
 *  - Ascenders rise to ~y=4, descenders fall to ~y=96
 */

export const LETTER_CELL = {
  w: 60,
  h: 100,
  midline: 36,
  baseline: 68,
  descender: 100,
};

export const LETTER_DEFS = {

  // ── a ─────────────────────────────────────────────────────────────────────
  // Stroke 1: CCW oval (start upper-right, sweep left/down/right back up)
  // Stroke 2: retrace right side down to baseline with exit hook
  a: {
    strokes: [
      {
        d: "M 38,44 C 38,36 32,30 26,30 C 18,30 12,37 12,48 C 12,59 18,66 26,66 C 34,66 38,59 38,50",
        start: [38, 44],
      },
      {
        d: "M 38,50 C 38,60 38,66 38,66 C 38,66 40,68 44,68",
        start: [38, 50],
      },
    ],
  },

  // ── b ─────────────────────────────────────────────────────────────────────
  // Stroke 1: tall downstroke from ascender to baseline with exit hook
  // Stroke 2: CW bump — up from baseline, arch right, back to baseline
  b: {
    strokes: [
      {
        d: "M 14,6 C 14,6 14,50 14,66 C 14,66 16,68 20,68",
        start: [14, 6],
      },
      {
        d: "M 14,50 C 14,40 20,32 28,32 C 38,32 44,40 44,50 C 44,60 38,68 28,68 C 20,68 14,62 14,56",
        start: [14, 50],
      },
    ],
  },

  // ── c ─────────────────────────────────────────────────────────────────────
  // Single stroke: open CCW arc starting upper-right, ending mid-right
  c: {
    strokes: [
      {
        d: "M 42,40 C 40,32 34,28 26,28 C 16,28 10,36 10,48 C 10,60 16,68 26,68 C 34,68 40,64 44,58",
        start: [42, 40],
      },
    ],
  },

  // ── d ─────────────────────────────────────────────────────────────────────
  // Stroke 1: CCW oval
  // Stroke 2: tall downstroke from ascender top down to baseline with exit hook
  d: {
    strokes: [
      {
        d: "M 38,44 C 38,36 32,30 24,30 C 14,30 8,37 8,48 C 8,59 14,66 24,66 C 32,66 38,59 38,50",
        start: [38, 44],
      },
      {
        d: "M 40,6 C 40,6 40,66 40,66 C 40,66 42,68 46,68",
        start: [40, 6],
      },
    ],
  },

  // ── e ─────────────────────────────────────────────────────────────────────
  // Single stroke: start mid-left, sweep right across middle, then CCW arc closing at right
  e: {
    strokes: [
      {
        d: "M 12,48 C 12,48 40,48 40,48 C 42,38 36,28 26,28 C 16,28 8,36 8,48 C 8,60 16,68 26,68 C 34,68 42,64 46,58",
        start: [12, 48],
      },
    ],
  },

  // ── f ─────────────────────────────────────────────────────────────────────
  // Stroke 1: start at top-right ascender, curve left over top, sweep down through baseline, curl left at bottom
  // Stroke 2: crossbar at midline
  f: {
    strokes: [
      {
        d: "M 36,8 C 44,8 46,14 42,18 C 38,22 32,22 30,22 C 30,22 30,66 30,66 C 30,66 28,68 24,68",
        start: [36, 8],
      },
      {
        d: "M 16,38 C 16,38 46,38 46,38",
        start: [16, 38],
      },
    ],
  },

  // ── g ─────────────────────────────────────────────────────────────────────
  // Single stroke: CCW oval then descender looping left below baseline
  g: {
    strokes: [
      {
        d: "M 40,44 C 40,36 34,30 26,30 C 16,30 10,37 10,48 C 10,59 16,66 26,66 C 34,66 40,59 40,50 C 40,50 40,80 40,84 C 40,92 34,96 26,92 C 20,90 18,86 18,84",
        start: [40, 44],
      },
    ],
  },

  // ── h ─────────────────────────────────────────────────────────────────────
  // Stroke 1: tall downstroke with exit hook
  // Stroke 2: arch up-right then down to baseline with exit hook
  h: {
    strokes: [
      {
        d: "M 14,6 C 14,6 14,66 14,66 C 14,66 16,68 20,68",
        start: [14, 6],
      },
      {
        d: "M 14,44 C 14,34 20,28 28,30 C 36,32 40,40 40,48 C 40,56 40,66 40,66 C 40,66 42,68 46,68",
        start: [14, 44],
      },
    ],
  },

  // ── i ─────────────────────────────────────────────────────────────────────
  // Stroke 1: short downstroke from midline to baseline with exit hook
  // Stroke 2: dot above midline
  i: {
    strokes: [
      {
        d: "M 26,36 C 26,36 26,66 26,66 C 26,66 28,68 32,68",
        start: [26, 36],
      },
      {
        isDot: true,
        start: [26, 24],
      },
    ],
  },

  // ── j ─────────────────────────────────────────────────────────────────────
  // Stroke 1: downstroke from midline through baseline, descender curls left
  // Stroke 2: dot
  j: {
    strokes: [
      {
        d: "M 30,36 C 30,36 30,78 30,82 C 30,92 22,96 16,90 C 14,88 14,86 14,84",
        start: [30, 36],
      },
      {
        isDot: true,
        start: [30, 24],
      },
    ],
  },

  // ── k ─────────────────────────────────────────────────────────────────────
  // Stroke 1: tall downstroke with exit hook
  // Stroke 2: upper kick (curves in from right to spine), lower kick (curves out to baseline)
  k: {
    strokes: [
      {
        d: "M 14,6 C 14,6 14,66 14,66 C 14,66 16,68 20,68",
        start: [14, 6],
      },
      {
        d: "M 40,30 C 34,34 22,42 14,48 C 22,50 32,58 42,68",
        start: [40, 30],
      },
    ],
  },

  // ── l ─────────────────────────────────────────────────────────────────────
  // Single stroke: tall downstroke with exit hook
  l: {
    strokes: [
      {
        d: "M 28,6 C 28,6 28,66 28,66 C 28,66 30,68 34,68",
        start: [28, 6],
      },
    ],
  },

  // ── m ─────────────────────────────────────────────────────────────────────
  // Stroke 1: first arch — up from baseline, arch right, back down
  // Stroke 2: second arch continuing right, exit hook
  m: {
    strokes: [
      {
        d: "M 8,68 C 8,68 8,44 8,40 C 8,32 14,28 20,30 C 26,32 28,38 28,44 C 28,50 28,68 28,68",
        start: [8, 68],
      },
      {
        d: "M 28,44 C 28,32 34,28 40,30 C 46,32 48,38 48,44 C 48,50 48,66 48,66 C 48,66 50,68 54,68",
        start: [28, 44],
      },
    ],
  },

  // ── n ─────────────────────────────────────────────────────────────────────
  // Stroke 1: downstroke from baseline up to midline
  // Stroke 2: arch over to the right then back down with exit hook
  n: {
    strokes: [
      {
        d: "M 10,68 C 10,68 10,40 10,36",
        start: [10, 68],
      },
      {
        d: "M 10,40 C 10,30 18,26 26,28 C 34,30 38,38 38,46 C 38,54 38,66 38,66 C 38,66 40,68 44,68",
        start: [10, 40],
      },
    ],
  },

  // ── o ─────────────────────────────────────────────────────────────────────
  // Single stroke: full CCW oval, closes at upper-right with small exit
  o: {
    strokes: [
      {
        d: "M 42,46 C 42,36 36,28 28,28 C 18,28 10,36 10,48 C 10,60 18,68 28,68 C 38,68 44,60 44,50 C 44,48 44,46 42,46",
        start: [42, 46],
      },
    ],
  },

  // ── p ─────────────────────────────────────────────────────────────────────
  // Stroke 1: downstroke from midline through baseline to descender
  // Stroke 2: CW bump from spine upward and around
  p: {
    strokes: [
      {
        d: "M 14,36 C 14,36 14,90 14,90",
        start: [14, 36],
      },
      {
        d: "M 14,36 C 14,26 20,22 28,24 C 38,26 42,34 40,46 C 38,56 30,62 20,60 C 16,58 14,54 14,50",
        start: [14, 36],
      },
    ],
  },

  // ── q ─────────────────────────────────────────────────────────────────────
  // Stroke 1: CCW oval
  // Stroke 2: downstroke on right side to descender with small hook
  q: {
    strokes: [
      {
        d: "M 40,44 C 40,36 34,30 26,30 C 16,30 10,37 10,48 C 10,59 16,66 26,66 C 34,66 40,59 40,50",
        start: [40, 44],
      },
      {
        d: "M 40,50 C 40,60 40,82 40,86 C 40,92 36,96 32,94",
        start: [40, 50],
      },
    ],
  },

  // ── r ─────────────────────────────────────────────────────────────────────
  // Stroke 1: upstroke from baseline with exit bump shoulder (no full loop)
  // Stroke 2: curved shoulder right
  r: {
    strokes: [
      {
        d: "M 12,68 C 12,68 12,38 12,36 C 12,36 14,34 16,34",
        start: [12, 68],
      },
      {
        d: "M 12,40 C 16,30 24,28 34,32 C 40,36 42,42 40,48",
        start: [12, 40],
      },
    ],
  },

  // ── s ─────────────────────────────────────────────────────────────────────
  // Single stroke: flowing S-curve
  s: {
    strokes: [
      {
        d: "M 40,36 C 38,28 32,26 24,28 C 16,30 12,36 16,42 C 20,48 32,48 38,54 C 42,60 40,66 32,68 C 24,70 16,66 12,60",
        start: [40, 36],
      },
    ],
  },

  // ── t ─────────────────────────────────────────────────────────────────────
  // Stroke 1: tall downstroke (from near-ascender) with exit hook
  // Stroke 2: crossbar at midline
  t: {
    strokes: [
      {
        d: "M 28,12 C 28,12 28,66 28,66 C 28,66 30,68 34,68",
        start: [28, 12],
      },
      {
        d: "M 14,38 C 14,38 44,38 44,38",
        start: [14, 38],
      },
    ],
  },

  // ── u ─────────────────────────────────────────────────────────────────────
  // Stroke 1: down from midline, curve at bottom, back up to midline
  // Stroke 2: back down to baseline with exit hook
  u: {
    strokes: [
      {
        d: "M 10,36 C 10,52 12,62 18,66 C 24,70 32,68 36,62 C 38,58 38,50 38,44",
        start: [10, 36],
      },
      {
        d: "M 38,44 C 38,44 38,66 38,66 C 38,66 40,68 44,68",
        start: [38, 44],
      },
    ],
  },

  // ── v ─────────────────────────────────────────────────────────────────────
  // Single stroke: curve down-left to bottom, sweep up-right with exit hook
  v: {
    strokes: [
      {
        d: "M 10,36 C 12,50 16,62 24,68 C 28,70 30,70 34,66 C 40,60 46,48 50,36",
        start: [10, 36],
      },
    ],
  },

  // ── w ─────────────────────────────────────────────────────────────────────
  // Single stroke: double-v flowing curve
  w: {
    strokes: [
      {
        d: "M 6,36 C 8,50 10,62 16,68 C 18,70 20,70 22,66 C 26,58 28,48 30,44 C 32,50 34,60 38,66 C 40,70 42,70 44,66 C 48,60 52,48 54,36",
        start: [6, 36],
      },
    ],
  },

  // ── x ─────────────────────────────────────────────────────────────────────
  // Stroke 1: top-left to bottom-right with slight curve
  // Stroke 2: top-right to bottom-left with slight curve
  x: {
    strokes: [
      {
        d: "M 12,36 C 20,44 32,58 44,68",
        start: [12, 36],
      },
      {
        d: "M 44,36 C 36,44 24,58 12,68",
        start: [44, 36],
      },
    ],
  },

  // ── y ─────────────────────────────────────────────────────────────────────
  // Single stroke: V shape then descender looping under baseline to left
  y: {
    strokes: [
      {
        d: "M 10,36 C 14,50 18,60 24,66 C 28,70 30,68 32,64 C 36,56 40,46 46,36 C 40,52 34,66 30,76 C 26,86 20,92 14,88 C 10,86 10,84 10,82",
        start: [10, 36],
      },
    ],
  },

  // ── z ─────────────────────────────────────────────────────────────────────
  // Single stroke: top bar, diagonal down-left, bottom bar with exit hook
  z: {
    strokes: [
      {
        d: "M 12,36 C 12,36 44,36 44,36 C 38,44 24,58 14,68 C 14,68 46,68 48,68",
        start: [12, 36],
      },
    ],
  },
};