/**
 * CVCChampionLevel78 — "Mixed Review 1" (final-mix-level-078)
 * Note: "cut"/"bad"/"bid" have no approved assets — replaced with cub/bat–big/bud.
 */
import CVCChampionReviewLevel from "./CVCChampionReviewLevel";

const ROUNDS = [
  { type: "drawline", words: ["cat", "cot", "cub"] },
  { type: "identifying", word: "bed", choices: ["bed", "bat", "big", "bud"] },
  { type: "missing01", word: "pig", distractors: ["a", "e", "u"] },
  { type: "drag_v2", word: "sun", distractor: "a" },
  { type: "word_to_audio", words: ["cat", "cot", "cub", "kit"] },
  { type: "connection", word: "red" },
  { type: "writev2", word: "mug" },
  { type: "word_match", word: "pin", choices: ["pin", "pan", "pon", "pun"] },
];

export default function CVCChampionLevel78({ onBack, lang = "en" }) {
  return <CVCChampionReviewLevel levelNum={78} rounds={ROUNDS} onBack={onBack} lang={lang} />;
}