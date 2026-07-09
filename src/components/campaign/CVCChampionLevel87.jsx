/**
 * CVCChampionLevel87 — "Cody Champion Challenge 3" (final-mix-level-087)
 * Note: "set"/"sot" have no approved assets — replaced with sob/sub.
 */
import CVCChampionReviewLevel from "./CVCChampionReviewLevel";

const ROUNDS = [
  { type: "word_to_audio", words: ["sat", "sit", "sob", "sub"] },
  { type: "dictation", word: "vet" },
  { type: "identifying", word: "pug", choices: ["pug", "pig", "peg", "pop"] },
  { type: "drag_v2", word: "men", distractor: "a" },
  { type: "writev2", word: "box" },
  { type: "rearrange_hard", words: ["sun", "sob"] },
  { type: "catch", word: "tip", letter: "i", distractors: ["a", "e", "o", "u"] },
  { type: "missing01", word: "ham", distractors: ["e", "i", "o"] },
  { type: "word_match", word: "cot", choices: ["cot", "cat", "cet", "cut"] },
];

export default function CVCChampionLevel87({ onBack, lang = "en" }) {
  return <CVCChampionReviewLevel levelNum={87} rounds={ROUNDS} onBack={onBack} lang={lang} />;
}