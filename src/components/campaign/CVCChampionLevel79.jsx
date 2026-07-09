/**
 * CVCChampionLevel79 — "Mixed Review 2" (final-mix-level-079)
 * Note: "ton" has no approved assets — replaced with "top".
 */
import CVCChampionReviewLevel from "./CVCChampionReviewLevel";

const ROUNDS = [
  { type: "dictation", word: "dog" },
  { type: "word_to_audio", words: ["ten", "tin", "tan", "top"] },
  { type: "word_match", word: "bug", choices: ["bug", "bag", "beg", "bog"] },
  { type: "missing01", word: "hat", distractors: ["i", "o", "u"] },
  { type: "rearrange_easy", words: ["fox"] },
  { type: "drag_v2", word: "lip", distractor: "e" },
  { type: "identifying", word: "gum", choices: ["gum", "gem", "gap", "gig"] },
  { type: "catch", word: "mat", letter: "a", distractors: ["e", "i", "o", "u"] },
];

export default function CVCChampionLevel79({ onBack, lang = "en" }) {
  return <CVCChampionReviewLevel levelNum={79} rounds={ROUNDS} onBack={onBack} lang={lang} />;
}