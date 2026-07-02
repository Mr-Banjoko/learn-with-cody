/**
 * Returns the display label for a campaign level.
 * Review takes priority over Learn (e.g. Level 15 → L15-Review).
 * Pass vowelKey to use that vowel's tag definitions.
 */

// Short A tag sets
const SHORT_A_REVIEW = new Set([5, 10, 15, 20, 25, 30, 35, 40]);
const SHORT_A_LEARN  = new Set([1, 6, 11, 21, 26, 31, 36]);

// Short O tag sets (from LEVEL_TAGS in ShortOLevels)
const SHORT_O_LEARN  = new Set([1, 5, 9, 12, 16]);
const SHORT_O_REVIEW = new Set([4, 8, 11, 15, 20]);

// CVC Champion tag sets
const CVC_CHAMPION_LEARN  = new Set([1, 2, 6, 10]);
const CVC_CHAMPION_REVIEW = new Set([5, 9, 13]);

function getTag(levelNum, learnSet, reviewSet) {
  if (reviewSet.has(levelNum)) return "review";
  if (learnSet.has(levelNum))  return "learn";
  return "practice";
}

export function getLevelLabel(levelNum, lang = "en", vowelKey = "short-a") {
  const isZh = lang === "zh";
  let tag;
  if (vowelKey === "short-o") {
    tag = getTag(levelNum, SHORT_O_LEARN, SHORT_O_REVIEW);
  } else if (vowelKey === "cvc-champion") {
    tag = getTag(levelNum, CVC_CHAMPION_LEARN, CVC_CHAMPION_REVIEW);
  } else {
    tag = getTag(levelNum, SHORT_A_LEARN, SHORT_A_REVIEW);
  }
  const labels = {
    review:   isZh ? "复习" : "Review",
    learn:    isZh ? "学习" : "Learn",
    practice: isZh ? "练习" : "Practice",
  };
  return `L${levelNum}-${labels[tag]}`;
}