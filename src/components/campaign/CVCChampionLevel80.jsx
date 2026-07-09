/**
 * CVCChampionLevel80 — "Mixed Review 3" (final-mix-level-080)
 */
import CVCChampionReviewLevel from "./CVCChampionReviewLevel";

const ROUNDS = [
  { type: "writev2", word: "jet" },
  { type: "dictation", word: "win" },
  { type: "drag_v2", word: "rob", distractor: "u" },
  { type: "rearrange_hard", words: ["cup", "cat"] },
  { type: "word_to_audio", words: ["fed", "bed", "fig", "fog"] },
  { type: "missing01", word: "jam", distractors: ["i", "o", "u"] },
  { type: "drawline", words: ["fed", "fin", "fan"] },
  { type: "word_match", word: "hop", choices: ["hop", "hep", "hip", "hup"] },
];

export default function CVCChampionLevel80({ onBack, lang = "en" }) {
  return <CVCChampionReviewLevel levelNum={80} rounds={ROUNDS} onBack={onBack} lang={lang} />;
}