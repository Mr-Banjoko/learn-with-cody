/**
 * letterPaths.js
 * 
 * SVG path definitions for all 26 lowercase letters.
 * Each letter is defined within a 60×80 coordinate space:
 *   - top line:       y=0   (ascender top)
 *   - dashed midline: y=28
 *   - baseline:       y=56
 *   - descender line: y=80
 * 
 * Single-stroke letters: one path segment
 * Two-stroke letters: array of two path segments with stroke order
 * 
 * Each stroke: { d: SVGPathString, start: [x,y] }
 * start = the expected starting point for validation
 */

// Helper: sample points along a cubic/quadratic bezier path for validation
// We define guide points directly per letter for simplicity

export const LETTER_CELL = { w: 60, h: 80, midline: 28, baseline: 56, descender: 80 };

// All paths normalized to 60w x 80h cell
// Single-stroke = strokes array with 1 item
// Two-stroke = strokes array with 2 items (order enforced)

export const LETTER_DEFS = {
  a: {
    strokes: [
      {
        // CCW oval from upper-right, closes at baseline, then tail down-right
        d: "M 42,20 C 42,12 34,8 28,8 C 16,8 8,16 8,28 C 8,42 16,52 28,52 C 38,52 44,44 44,36 C 44,28 42,20 42,20 L 44,56",
        start: [42, 20],
      }
    ]
  },

  b: {
    strokes: [
      { d: "M 16,0 L 16,56", start: [16, 0] },
      { d: "M 16,28 C 16,28 40,28 40,42 C 40,52 32,56 24,56 C 16,56 16,56 16,56", start: [16, 28] },
    ]
  },

  c: {
    strokes: [
      {
        d: "M 44,16 C 40,8 32,4 24,4 C 12,4 4,14 4,28 C 4,42 12,52 24,52 C 32,52 40,48 44,40",
        start: [44, 16],
      }
    ]
  },

  d: {
    strokes: [
      {
        // CCW oval (like 'a' body)
        d: "M 36,20 C 36,12 30,8 24,8 C 14,8 8,16 8,28 C 8,42 14,52 24,52 C 32,52 36,44 36,36 C 36,28 36,20 36,20",
        start: [36, 20],
      },
      { d: "M 36,0 L 36,56", start: [36, 0] },
    ]
  },

  e: {
    strokes: [
      {
        // Horizontal mid stroke then CCW arc
        d: "M 10,30 L 44,30 C 44,30 44,10 28,10 C 14,10 6,18 6,30 C 6,44 14,54 28,54 C 36,54 42,50 46,44",
        start: [10, 30],
      }
    ]
  },

  f: {
    strokes: [
      {
        // Tall curved downstroke with hook at bottom
        d: "M 36,4 C 44,4 44,12 36,14 L 28,14 L 28,52 C 28,54 26,56 24,56",
        start: [36, 4],
      },
      { d: "M 12,28 L 44,28", start: [12, 28] },
    ]
  },

  g: {
    strokes: [
      {
        // CCW oval then descender curving left
        d: "M 42,20 C 42,12 34,8 28,8 C 16,8 8,16 8,28 C 8,42 16,52 28,52 C 38,52 44,44 44,36 L 44,68 C 44,76 36,80 28,78",
        start: [42, 20],
      }
    ]
  },

  h: {
    strokes: [
      { d: "M 12,0 L 12,56", start: [12, 0] },
      { d: "M 12,28 C 12,20 20,16 28,18 C 36,20 40,26 40,34 L 40,56", start: [12, 28] },
    ]
  },

  i: {
    strokes: [
      { d: "M 28,28 L 28,52 C 28,54 30,56 32,56", start: [28, 28] },
      { d: "M28,18L28,18", start: [28, 18], isDot: true },
    ]
  },

  j: {
    strokes: [
      { d: "M 32,28 L 32,64 C 32,74 24,78 16,74", start: [32, 28] },
      { d: "M32,18L32,18", start: [32, 18], isDot: true },
    ]
  },

  k: {
    strokes: [
      { d: "M 12,0 L 12,56", start: [12, 0] },
      { d: "M 12,32 L 40,12 M 12,32 L 40,56", start: [40, 12] },
    ]
  },

  l: {
    strokes: [
      { d: "M 28,0 L 28,52 C 28,54 30,56 34,56", start: [28, 0] }
    ]
  },

  m: {
    strokes: [
      {
        // Left arch
        d: "M 8,56 L 8,36 C 8,24 16,20 22,22 C 28,24 28,32 28,36 L 28,56",
        start: [8, 56],
      },
      {
        // Right arch
        d: "M 28,36 C 28,24 36,20 42,22 C 48,24 50,32 50,36 L 50,56 C 50,57 52,56 52,56",
        start: [28, 36],
      },
    ]
  },

  n: {
    strokes: [
      {
        d: "M 8,56 L 8,36 C 8,24 16,20 22,22 C 28,24 28,32 28,36 L 28,56",
        start: [8, 56],
      },
      {
        d: "M 28,36 C 28,24 36,20 42,22 C 48,24 48,32 48,36 L 48,56 C 48,57 50,56 50,56",
        start: [28, 36],
      },
    ]
  },

  o: {
    strokes: [
      {
        // Full CCW oval
        d: "M 42,28 C 42,14 34,6 28,6 C 16,6 8,16 8,28 C 8,42 16,52 28,52 C 40,52 44,42 44,34 C 44,30 42,28 42,28",
        start: [42, 28],
      }
    ]
  },

  p: {
    strokes: [
      { d: "M 12,28 L 12,76", start: [12, 28] },
      { d: "M 12,28 C 12,18 20,14 28,16 C 38,18 40,28 38,38 C 36,48 28,54 20,50 C 14,46 12,40 12,36", start: [12, 28] },
    ]
  },

  q: {
    strokes: [
      {
        d: "M 42,20 C 42,12 34,8 28,8 C 16,8 8,16 8,28 C 8,42 16,52 28,52 C 40,52 44,42 44,34 C 44,26 42,20 42,20",
        start: [42, 20],
      },
      { d: "M 44,36 L 44,76", start: [44, 36] },
    ]
  },

  r: {
    strokes: [
      { d: "M 10,56 L 10,28", start: [10, 56] },
      { d: "M 10,28 C 14,20 22,18 32,22 C 38,24 40,28 38,32", start: [10, 28] },
    ]
  },

  s: {
    strokes: [
      {
        d: "M 42,16 C 38,8 28,6 20,10 C 12,14 10,22 16,28 C 22,34 36,34 40,40 C 44,46 40,54 30,56 C 20,58 10,54 8,46",
        start: [42, 16],
      }
    ]
  },

  t: {
    strokes: [
      { d: "M 28,8 L 28,52 C 28,54 30,56 34,56", start: [28, 8] },
      { d: "M 12,28 L 44,28", start: [12, 28] },
    ]
  },

  u: {
    strokes: [
      { d: "M 10,28 L 10,44 C 10,52 16,56 24,54 C 32,52 36,44 36,36", start: [10, 28] },
      { d: "M 36,36 L 36,28 C 36,28 38,56 40,56", start: [36, 36] },
    ]
  },

  v: {
    strokes: [
      {
        d: "M 8,14 L 28,52 L 50,14",
        start: [8, 14],
      }
    ]
  },

  w: {
    strokes: [
      {
        d: "M 4,14 L 16,52 L 28,28 L 40,52 L 52,14",
        start: [4, 14],
      }
    ]
  },

  x: {
    strokes: [
      { d: "M 10,14 L 46,52", start: [10, 14] },
      { d: "M 46,14 L 10,52", start: [46, 14] },
    ]
  },

  y: {
    strokes: [
      {
        d: "M 8,14 L 28,42 L 48,14 M 28,42 L 20,68 C 16,76 10,78 6,74",
        start: [8, 14],
      }
    ]
  },

  z: {
    strokes: [
      {
        d: "M 8,14 L 48,14 L 8,52 L 48,52",
        start: [8, 14],
      }
    ]
  },
};