/**
 * CVCChampionLevel81 — "Mixed Review 4" (final-mix-level-081)
 * Note: "rig" has no approved assets — replaced with "rib".
 */
import CVCChampionReviewLevel from "./CVCChampionReviewLevel";

const ROUNDS = [
  { type: "missing01", word: "net", distractors: ["a", "i", "o"] },
  { type: "connection", word: "bus" },
  { type: "identifying", word: "rag", choices: ["rag", "rug", "rib", "rob"] },
  { type: "word_to_audio", words: ["pot", "pat", "pet", "pit"] },
  { type: "drag_v2", word: "hen", distractor: "a" },
  { type: "word_match", word: "cub", choices: ["cub", "cab", "ceb", "cob"] },
  { type: "dictation", word: "tip" },
  { type: "rearrange_hard", words: ["wax", "fix"] },
];

export default function CVCChampionLevel81({ onBack, lang = "en" }) {
  return <CVCChampionReviewLevel levelNum={81} rounds={ROUNDS} onBack={onBack} lang={lang} />;
}