/**
 * Campaign Performance System
 * ─────────────────────────────
 * Centralized logic for:
 *  - Star formula (round-scaled, mistake-based)
 *  - Best-star persistence (localStorage, offline-first)
 *  - Scored-round counting per level
 *
 * STAR FORMULA:
 *   Let t3 = max(1, round(scoredRounds * 0.2))
 *       t2 = max(2, round(scoredRounds * 0.4))
 *       t1 = max(3, round(scoredRounds * 0.6))
 *   Ensure monotonic: t2 > t1 never happens (they're already ascending by design).
 *   3 stars if mistakes <= t3
 *   2 stars if mistakes <= t2
 *   1 star  if mistakes <= t1
 *   0 stars otherwise
 */

// ── Star calculation ─────────────────────────────────────────────────────────

/**
 * Calculate stars earned for an attempt.
 * @param {number} mistakes   - total validated wrong answers
 * @param {number} scoredRounds - total playable/scored rounds (not passive steps)
 * @returns {0|1|2|3}
 */
export function calcStars(mistakes, scoredRounds) {
  if (scoredRounds <= 0) return mistakes === 0 ? 3 : 0;
  const t3 = Math.max(1, Math.round(scoredRounds * 0.2));
  const t2 = Math.max(2, Math.round(scoredRounds * 0.4));
  const t1 = Math.max(3, Math.round(scoredRounds * 0.6));
  if (mistakes <= t3) return 3;
  if (mistakes <= t2) return 2;
  if (mistakes <= t1) return 1;
  return 0;
}

// ── Persistence ──────────────────────────────────────────────────────────────

const PERF_KEY = "campaign_performance";

/**
 * Load all saved performance data.
 * Shape: { "short-a": { 1: { bestStars: 3, lastMistakes: 0, lastStars: 3 }, ... } }
 */
function loadPerf() {
  try {
    return JSON.parse(localStorage.getItem(PERF_KEY) || "{}");
  } catch {
    return {};
  }
}

/**
 * Save performance data back.
 */
function savePerf(data) {
  try {
    localStorage.setItem(PERF_KEY, JSON.stringify(data));
  } catch {}
}

/**
 * Get the best star result ever saved for a level.
 * @param {string} vowelKey  e.g. "short-a"
 * @param {number} levelNum
 * @returns {0|1|2|3}
 */
export function getBestStars(vowelKey, levelNum) {
  const data = loadPerf();
  return data?.[vowelKey]?.[levelNum]?.bestStars ?? 0;
}

/**
 * Save a level attempt result, updating bestStars only if new result is better.
 * @param {string} vowelKey
 * @param {number} levelNum
 * @param {number} stars       - stars earned this attempt
 * @param {number} mistakes    - mistakes this attempt
 */
export function saveLevelResult(vowelKey, levelNum, stars, mistakes) {
  const data = loadPerf();
  if (!data[vowelKey]) data[vowelKey] = {};
  const prev = data[vowelKey][levelNum] || { bestStars: 0 };
  data[vowelKey][levelNum] = {
    bestStars: Math.max(prev.bestStars || 0, stars),
    lastStars: stars,
    lastMistakes: mistakes,
    lastPlayedAt: new Date().toISOString(),
  };
  savePerf(data);
}

// ── Scored round config per level ────────────────────────────────────────────
// Only SCORED rounds count — not passive phonics/listen steps.
// "phonics" and "listen" steps cannot be answered wrong → not scored.
// All game types: drag, rearrange, identifying, missing, drawline, wordmatch,
//                 picslice (hard), rearrange (difficult) → scored.
//
// Maps levelNum → scoredRounds count for "short-a" campaign.
// Add new levels here as they're implemented.

export const SHORT_A_SCORED_ROUNDS = {
  // Level  1: 11 rounds total — 5 drag (scored) + 6 phonics (not scored) = 5 scored
  1: 5,
  // Level  2: alternating phonics+rearrange for 5 words = 5 rearrange scored
  2: 5,
  // Level  3: alternating phonics+rearrange for 5 words = 5 rearrange scored
  3: 5,
  // Level  4: 5 identifying rounds only (phonics not scored)
  4: 5,
  // Level  5: 5 identifying
  5: 5,
  // Level  6: 10 rounds, 5 phonics + 5 drag = 5 scored
  6: 5,
  // Level  7: similar 10-round structure
  7: 5,
  // Level  8: 10 rounds, drag-heavy
  8: 5,
  // Level  9: identifying rounds
  9: 5,
  // Level 10: review mix
  10: 7,
  // Level 11: 10 rounds alternating phonics+rearrange = 5 scored
  11: 5,
  // Level 12: alternating phonics+rearrange
  12: 5,
  // Level 13: mix
  13: 5,
  // Level 14: mix
  14: 5,
  // Level 15: 9-round review mix
  15: 7,
  // Level 16: 10 rounds alternating phonics+drag = 5 scored
  16: 5,
  // Level 17: drag+identifying = 10 scored (no phonics)
  17: 10,
  // Level 18: rearrange+identifying mix
  18: 8,
  // Level 19: mix
  19: 8,
  // Level 20: 10-round review (drag×2, rearrange×1, missing×2, identifying×4, drawline×1) = 10 scored
  20: 10,
  // Level 21: 10 rounds alternating phonics+rearrange = 5 scored
  21: 5,
  // Level 22: alternating phonics+rearrange
  22: 5,
  // Level 23: alternating phonics+rearrange
  23: 5,
  // Level 24: rearrange+identifying mix
  24: 8,
  // Level 25: mix
  25: 8,
  // Level 26: 10 rounds alternating phonics+missing = 5 scored
  26: 5,
  // Level 27: 5 word-match rounds (all scored)
  27: 5,
  // Level 28: alternating phonics+rearrange = 5 scored
  28: 5,
  // Level 29: alternating phonics+rearrange = 5 scored
  29: 5,
  // Level 30: 6-round mixed = 6 scored
  30: 6,
  // Level 31: 10 rounds alternating phonics+drag = 5 scored
  31: 5,
  // Level 32: 5-round rearrange difficult = 5 scored
  32: 5,
  // Level 33: 5-round missing = 5 scored
  33: 5,
  // Level 34: rearrange+identifying mix = 8 scored
  34: 8,
  // Level 35: 10-round review = 10 scored
  35: 10,
  // Levels 36–40 (final block of Short A campaign)
  36: 6, 37: 6, 38: 6, 39: 6, 40: 8,
};

/**
 * Get scored round count for a level.
 * @param {string} vowelKey
 * @param {number} levelNum
 * @returns {number}
 */
export function getScoredRounds(vowelKey, levelNum) {
  if (vowelKey === "short-a") {
    return SHORT_A_SCORED_ROUNDS[levelNum] ?? 5;
  }
  return 5; // safe fallback for future vowels
}