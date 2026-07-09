/**
 * CVCChampionLevel86 — "Cody Champion Challenge 2" (final-mix-level-086)
 * Note: "mid"/"ben" have no approved assets — replaced with mix/beg.
 */
import CVCChampionReviewLevel from "./CVCChampionReviewLevel";

const ROUNDS = [
  { type: "dictation", word: "jig" },
  { type: "writev2", word: "gem" },
  { type: "drag_v2", word: "rag", distractor: "u" },
  { type: "rearrange_easy", words: ["not"] },
  { type: "rearrange_hard", words: ["lip"] },
  { type: "missing01", word: "fed", distractors: ["a", "i", "u"] },
  { type: "word_to_audio", words: ["mud", "mad", "mix", "mop"] },
  { type: "word_match", word: "top", choices: ["top", "tap", "tip", "tup"] },
  { type: "identifying", word: "bun", choices: ["bun", "bin", "ban", "beg"] },
];

export default function CVCChampionLevel86({ onBack, lang = "en" }) {
  return <CVCChampionReviewLevel levelNum={86} rounds={ROUNDS} onBack={onBack} lang={lang} />;
}