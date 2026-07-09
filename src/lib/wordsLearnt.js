/**
 * wordsLearnt — counts how many words a student has learnt.
 *
 * LOGIC
 * Every level records its completion in localStorage "campaign_progress"
 * ({ vowelKey: { levelNum: { completed: true } } }). When a LEARN level is
 * completed, the number of NEW words it teaches (its phonics/flashcard
 * rounds) is added to the total.
 *
 * The per-level counts below were taken from each learn level's actual
 * round data (words taught in phonics rounds):
 *
 * - Short A: batches of 5 words — first learn level teaches 3, second 2
 *   (L1: cat/dad/rat, L2: hat/bat, …); L36 & L37 teach 3 each. Total 41.
 * - Short E: L1 bed/fed, L2 red/wed, L5 bet/get/jet, L6 met/net/pet,
 *   L10 den/hen/men, L11 pen/ten, L14 beg/leg/peg, L15 keg/gem/hem. Total 21.
 * - Short I: L32 (sit/tin/tip) only counts 1 — tin & tip were already
 *   taught in L14/L15. L34 teaches 4 (rim/six/fin/zip). Total 32 unique.
 * - Short O: each learn level teaches 5 (e.g. L1 mom/dog/hot/top/pop). Total 25.
 * - Short U: L1–L13 (odd) teach 3 each, L15 teaches 2. Total 23.
 * - CVC Champion: its learn packs RE-TEACH words from the vowel campaigns
 *   (e.g. L2: cat, cot, sit…), so they add no new words — excluded to
 *   avoid double-counting.
 */

const WORDS_PER_LEARN_LEVEL = {
  "short-a": { 1: 3, 2: 2, 6: 3, 7: 2, 11: 3, 12: 2, 16: 3, 17: 2, 21: 3, 22: 2, 26: 3, 27: 2, 31: 3, 32: 2, 36: 3, 37: 3 },
  "short-e": { 1: 2, 2: 2, 5: 3, 6: 3, 10: 3, 11: 2, 14: 3, 15: 3 },
  "short-i": { 1: 3, 5: 3, 9: 3, 10: 2, 14: 3, 15: 2, 21: 3, 22: 2, 32: 1, 33: 3, 34: 4, 35: 3 },
  "short-o": { 1: 5, 5: 5, 9: 5, 12: 5, 16: 5 },
  "short-u": { 1: 3, 3: 3, 5: 3, 7: 3, 9: 3, 11: 3, 13: 3, 15: 2 },
};

/** Total words teachable across all campaigns. */
export const TOTAL_WORDS = Object.values(WORDS_PER_LEARN_LEVEL)
  .reduce((sum, levels) => sum + Object.values(levels).reduce((a, b) => a + b, 0), 0);

/**
 * Words learnt so far = sum of word counts of every COMPLETED learn level.
 * Returns { learnt, total }.
 */
export function getWordsLearnt() {
  let progress = {};
  try {
    progress = JSON.parse(localStorage.getItem("campaign_progress") || "{}");
  } catch {}

  let learnt = 0;
  for (const [vowelKey, levels] of Object.entries(WORDS_PER_LEARN_LEVEL)) {
    for (const [levelNum, count] of Object.entries(levels)) {
      if (progress?.[vowelKey]?.[levelNum]?.completed) learnt += count;
    }
  }
  return { learnt, total: TOTAL_WORDS };
}