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
  // L1:  6 rounds, 3 phonics(not scored) + 3 drag = 3 scored
  1: 3,
  // L2:  6 rounds, 2 phonics + 2 drag + 2 missing01 = 4 scored
  2: 4,
  // L3:  5 connection rounds = 5 scored
  3: 5,
  // L4:  5 identifying rounds = 5 scored
  4: 5,
  // L5:  6 rounds, 0 phonics: drag×2 + identifying×2 + missing01×1 + connection×1 = 6 scored
  5: 6,
  // L6:  6 rounds, 3 phonics + 3 drag = 3 scored
  6: 3,
  // L7:  6 rounds, 2 phonics + 2 drag + 2 missing01 = 4 scored
  7: 4,
  // L8:  5 connection rounds = 5 scored
  8: 5,
  // L9:  5 catch rounds = 5 scored
  9: 5,
  // L10: 6 rounds, no phonics: catch×1 + connection×1 + drag×1 + identifying×2 + missing01×1 = 6 scored
  10: 6,
  // L11: 6 rounds, 3 phonics + 3 drag = 3 scored
  11: 3,
  // L12: 6 rounds, 2 phonics + 2 drag + 2 missing01 = 4 scored
  12: 4,
  // L13: 5 rearrange_easy rounds = 5 scored
  13: 5,
  // L14: 5 rounds: connection×2 + identifying×3 = 5 scored
  14: 5,
  // L15: 6 rounds: rearrange×1 + catch×1 + connection×1 + identifying×1 + drag×1 + missing01×1 = 6 scored
  15: 6,
  // L16: 6 rounds, 3 phonics + 3 drag = 3 scored
  16: 3,
  // L17: 6 rounds, 2 phonics + 2 drag + 2 missing01 = 4 scored
  17: 4,
  // L18: 5 drawline rounds = 5 scored
  18: 5,
  // L19: 5 rounds: rearrange×2 + identifying×2 + drawline×1 = 5 scored
  19: 5,
  // L20: 6 rounds: drawline×1 + connection×1 + catch×1 + identifying×1 + rearrange×1 + drag×1 = 6 scored
  20: 6,
  // L21: 6 rounds, 3 phonics + 3 drag = 3 scored
  21: 3,
  // L22: 6 rounds, 2 phonics + 2 drag + 2 missing01 = 4 scored
  22: 4,
  // L23: 5 writev2 rounds = 5 scored
  23: 5,
  // L24: 5 rounds: dictation×3 + writev2×2 = 5 scored
  24: 5,
  // L25: 6 rounds: dictation×1 + rearrange×1 + catch×1 + identifying×1 + connection×1 + drawline×1 = 6 scored
  25: 6,
  // L26: 6 rounds, 3 phonics + 3 drag = 3 scored
  26: 3,
  // L27: 6 rounds, 2 phonics + 2 drag + 2 missing01 = 4 scored
  27: 4,
  // L28: 5 rearrange_hard rounds = 5 scored
  28: 5,
  // L29: 5 rounds: writev2×3 + dictation×2 = 5 scored
  29: 5,
  // L30: 6 rounds: drag + missing01 + catch + connection + identifying + rearrange_hard = 6 scored
  30: 6,
  // L31: 6 rounds, 3 phonics + 3 drag = 3 scored
  31: 3,
  // L32: 6 rounds, 2 phonics + 2 drag + 2 missing01 = 4 scored
  32: 4,
  // L33: 5 word_match rounds = 5 scored
  33: 5,
  // L34: 5 rounds: writev2×2 + word_match×2 + missing01×1 = 5 scored
  34: 5,
  // L35: 6 rounds: dictation×1 + drag×1 + connection×1 + catch×1 + word_match×1 + identifying×1 = 6 scored
  35: 6,
  // L36: 6 rounds, 3 phonics + 3 drag = 3 scored
  36: 3,
  // L37: 6 rounds, 3 phonics + 3 drag = 3 scored
  37: 3,
  // L38: 6 word_to_audio rounds = 6 scored
  38: 6,
  // L39: 6 rounds: dictation×2 + identifying×2 + word_match×2 = 6 scored
  39: 6,
  // L40: 8 rounds, no phonics = 8 scored
  40: 8,
  // L41: 8 rounds, no phonics = 8 scored
  41: 8,
};

// ── Short E scored rounds ─────────────────────────────────────────────────────
export const SHORT_E_SCORED_ROUNDS = {
  1:  3,  // 3 drag = 3 scored
  2:  6,  // drag×1 + missing01×4 = 5 scored (phonics not scored → 1 drag + 4 missing = 5, but R1 drag too) → 5
  3:  3,  // 3 drag = 3 scored
  4:  5,  // connection×3 + identifying×2 = 5 scored
  5:  5,  // missing01×2 + drag×1 + connection×1 + identifying×1 = 5 scored
  6:  3,  // 3 drag = 3 scored
  7:  3,  // 3 drag = 3 scored
  8:  5,  // catch×3 + rearrange_easy×2 = 5 scored
  9:  1,  // 1 drawline round = 1 scored
  10: 1,  // 1 drawline round = 1 scored
  11: 1,  // 1 drag = 1 scored (5 phonics not scored)
  12: 5,  // 5 writev2 = 5 scored
  13: 5,  // dictation×3 + writev2×2 = 5 scored
  14: 5,  // drawline×1 + catch×1 + rearrange_easy×1 + identifying×1 + missing01×1 = 5 scored
  15: 1,  // 1 drag = 1 scored (5 phonics not scored)
  16: 5,  // 5 rearrange_hard = 5 scored
  17: 5,  // dictation×2 + writev2×3 = 5 scored
  18: 5,  // 5 word_match = 5 scored
  19: 5,  // 5 word_to_audio = 5 scored
  20: 5,  // missing01×1 + catch×1 + drawline×1 + dictation×1 + rearrange_hard×1 = 5 scored
  21: 5,  // writev2×1 + word_match×1 + word_to_audio×1 + connection×1 + identifying×1 = 5 scored
  22: 6,  // all 6 rounds scored
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
  if (vowelKey === "short-e") {
    return SHORT_E_SCORED_ROUNDS[levelNum] ?? 5;
  }
  return 5; // safe fallback for future vowels
}