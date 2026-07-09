/**
 * CVCChampionLevel83 — "Mixed Review 6" (final-mix-level-083)
 * Note: "wit"/"wot" have no approved assets — replaced with win/wig.
 */
import CVCChampionReviewLevel from "./CVCChampionReviewLevel";

const ROUNDS = [
  { type: "identifying", word: "wet", choices: ["wet", "win", "wig", "wax"] },
  { type: "word_to_audio", words: ["fog", "fig", "fed", "fun"] },
  { type: "connection", word: "nut" },
  { type: "drawline", words: ["wet", "win", "wax"] },
  { type: "drag_v2", word: "jog", distractor: "u" },
  { type: "missing01", word: "pup", distractors: ["a", "e", "o"] },
  { type: "dictation", word: "leg" },
  { type: "word_match", word: "cot", choices: ["cot", "cat", "cit", "cut"] },
];

export default function CVCChampionLevel83({ onBack, lang = "en" }) {
  return <CVCChampionReviewLevel levelNum={83} rounds={ROUNDS} onBack={onBack} lang={lang} />;
}