/**
 * CVCChampionLevel82 — "Mixed Review 5" (final-mix-level-082)
 * Note: "set"/"sot"/"but" have no approved assets — replaced with sob/sun/bud.
 */
import CVCChampionReviewLevel from "./CVCChampionReviewLevel";

const ROUNDS = [
  { type: "word_to_audio", words: ["sit", "sat", "sob", "sun"] },
  { type: "dictation", word: "bag" },
  { type: "identifying", word: "bit", choices: ["bit", "bat", "bet", "bud"] },
  { type: "writev2", word: "map" },
  { type: "drag_v2", word: "rid", distractor: "e" },
  { type: "missing01", word: "fan", distractors: ["e", "o", "u"] },
  { type: "catch", word: "pin", letter: "i", distractors: ["a", "e", "o", "u"] },
  { type: "word_match", word: "lab", choices: ["lab", "lib", "lob", "lub"] },
];

export default function CVCChampionLevel82({ onBack, lang = "en" }) {
  return <CVCChampionReviewLevel levelNum={82} rounds={ROUNDS} onBack={onBack} lang={lang} />;
}