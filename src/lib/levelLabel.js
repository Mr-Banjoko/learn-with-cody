/**
 * levelLabel — SINGLE SOURCE OF TRUTH for Learn / Practice / Review tags
 * across every campaign mode (Short A, E, I, O, U and CVC Champion).
 *
 * TAG DEFINITIONS
 *  - learn:    the level introduces NEW words — it contains passive phonics
 *              or flashcard rounds where words are taught for the first time.
 *  - practice: the level practices the words just learnt — scored games on
 *              that word set (drag, missing sound, identifying, write, draw,
 *              catch, match, dictation, …) with no new words introduced.
 *  - review:   a mixed checkpoint that reviews everything learnt so far —
 *              all-scored mixed-game levels, boss levels and final levels.
 *
 * The sets below are derived from each level's round structure, documented
 * in SHORT_*_SCORED_ROUNDS in campaignPerformance.js (phonics/flashcard
 * rounds = teaching new words = learn).
 *
 * Used by:
 *  - level-map screens: getLevelTag() + TAG_STYLES (badge above each node)
 *  - getLevelLabel(): in-level header label, e.g. "L15-Review"
 */

// ── Short A (41 levels) ───────────────────────────────────────────────────────
// Repeating 5-level blocks: two phonics-teaching levels (3 phonics + 3 drag,
// then 2 phonics + 2 drag + 2 missing01) → two practice levels → one mixed
// review. L36–L37 both teach (3 phonics each); L40–L41 are the final
// all-scored (8 rounds, no phonics) review levels.
const SHORT_A = {
  learn:  new Set([1, 2, 6, 7, 11, 12, 16, 17, 21, 22, 26, 27, 31, 32, 36, 37]),
  review: new Set([5, 10, 15, 20, 25, 30, 35, 40, 41]),
};

// ── Short E (24 levels) ───────────────────────────────────────────────────────
// Word batches taught in pairs (L1–2, L5–6, L10–11, L14–15). L4/9/13 are
// mid-campaign mixed reviews; L17–19 are all-scored review checkpoints
// (9 scored rounds each, see SHORT_E_SCORED_ROUNDS); L24 is the final review.
// L3/7/8/12/16 and the activity levels L20 (draw), L21 (catch), L22 (match),
// L23 (write) all practice previously-learnt words.
const SHORT_E = {
  learn:  new Set([1, 2, 5, 6, 10, 11, 14, 15]),
  review: new Set([4, 9, 13, 17, 18, 19, 24]),
};

// ── Short I (38 levels) ───────────────────────────────────────────────────────
// New-word levels: L1, L5, L9–10, L14–15, L21–22 and the extension batch
// L32–35. Mixed reviews: L4, L7, L12, L20, L27 and L31 (the original final
// review). Everything else — including the draw (L13/24), write
// (L17/18/25/26/37/38), listen (L19), match (L29) and catch (L30) activity
// levels — practices words already learnt.
const SHORT_I = {
  learn:  new Set([1, 5, 9, 10, 14, 15, 21, 22, 32, 33, 34, 35]),
  review: new Set([4, 7, 12, 20, 27, 31]),
};

// ── Short O (20 levels) ───────────────────────────────────────────────────────
// Learn levels open each word batch with phonics rounds (see
// SHORT_O_SCORED_ROUNDS: "phonics not scored"). Reviews are the all-scored
// mixed checkpoints (L4/8/11/15 with 8–9 scored rounds, L20 final).
const SHORT_O = {
  learn:  new Set([1, 5, 9, 12, 16]),
  review: new Set([4, 8, 11, 15, 20]),
};

// ── Short U (20 levels) ───────────────────────────────────────────────────────
// Alternating structure: every odd level L1–L15 teaches new words
// (2–3 phonics + drag rounds, see SHORT_U_SCORED_ROUNDS), the following even
// level practices them with mixed games. L17 (draw), L18 (audio) and
// L19 (build) practice the full word set; L20 is the final mixed review.
const SHORT_U = {
  learn:  new Set([1, 3, 5, 7, 9, 11, 13, 15]),
  review: new Set([20]),
};

// ── CVC Champion (88 levels) ──────────────────────────────────────────────────
// Repeating 4-level cycles: flashcard-only learn level (L2/6/10/…/74, plus
// the L1 intro) → two mixed practice levels → review. L78–L84 are full-review
// levels, L85–L88 are the final champion challenge reviews.
const CVC_CHAMPION = {
  learn:  new Set([1, 2, 6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62, 66, 70, 74]),
  review: new Set([5, 9, 13, 17, 21, 25, 29, 33, 37, 41, 45, 49, 53, 57, 61, 65, 69, 73, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88]),
};

const TAG_SETS = {
  "short-a": SHORT_A,
  "short-e": SHORT_E,
  "short-i": SHORT_I,
  "short-o": SHORT_O,
  "short-u": SHORT_U,
  "cvc-champion": CVC_CHAMPION,
};

/**
 * Get the tag for a level: "learn" | "practice" | "review".
 * Review takes priority over Learn.
 */
export function getLevelTag(vowelKey, levelNum) {
  const sets = TAG_SETS[vowelKey] || SHORT_A;
  if (sets.review.has(levelNum)) return "review";
  if (sets.learn.has(levelNum)) return "learn";
  return "practice";
}

/** Shared badge styles for the level-map screens. */
export const TAG_STYLES = {
  learn:    { bg: "#D1FAE5", color: "#065F46", label: "Learn" },
  practice: { bg: "#DBEAFE", color: "#1E40AF", label: "Practice" },
  review:   { bg: "#FEF3C7", color: "#92400E", label: "Review" },
};

/**
 * Returns the display label for a campaign level header (e.g. "L15-Review").
 */
export function getLevelLabel(levelNum, lang = "en", vowelKey = "short-a") {
  const isZh = lang === "zh";
  const tag = getLevelTag(vowelKey, levelNum);
  const labels = {
    review:   isZh ? "复习" : "Review",
    learn:    isZh ? "学习" : "Learn",
    practice: isZh ? "练习" : "Practice",
  };
  return `L${levelNum}-${labels[tag]}`;
}