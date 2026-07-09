/**
 * CVCChampionLevel84 — "Mixed Review 7" (final-mix-level-084)
 */
import CVCChampionReviewLevel from "./CVCChampionReviewLevel";

const ROUNDS = [
  { type: "word_to_audio", words: ["kid", "keg", "cod", "cab"] },
  { type: "dictation", word: "mug" },
  { type: "identifying", word: "red", choices: ["red", "rid", "rod", "rat"] },
  { type: "writev2", word: "tax" },
  { type: "rearrange_hard", words: ["sub", "mug"] },
  { type: "drag_v2", word: "pen", distractor: "i" },
  { type: "missing01", word: "hop", distractors: ["a", "e", "i"] },
  { type: "word_match", word: "tap", choices: ["tap", "tip", "top", "tup"] },
];

export default function CVCChampionLevel84({ onBack, lang = "en" }) {
  return <CVCChampionReviewLevel levelNum={84} rounds={ROUNDS} onBack={onBack} lang={lang} />;
}