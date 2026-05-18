/**
 * Returns the display label for a campaign level.
 * Review takes priority over Learn (e.g. Level 15 → L15-Review).
 */
const REVIEW_LEVELS = new Set([5, 10, 15, 20, 25, 30, 35, 40]);
const LEARN_LEVELS  = new Set([1, 6, 11, 21, 26, 31, 36]);

export function getLevelLabel(levelNum, lang = "en") {
  if (lang === "zh") {
    if (REVIEW_LEVELS.has(levelNum)) return `L${levelNum}-复习`;
    if (LEARN_LEVELS.has(levelNum))  return `L${levelNum}-学习`;
    return `L${levelNum}-练习`;
  }
  if (REVIEW_LEVELS.has(levelNum)) return `L${levelNum}-Review`;
  if (LEARN_LEVELS.has(levelNum))  return `L${levelNum}-Learn`;
  return `L${levelNum}-Practice`;
}