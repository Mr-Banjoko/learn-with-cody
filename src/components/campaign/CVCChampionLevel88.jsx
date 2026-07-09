/**
 * CVCChampionLevel88 — "Final Cody CVC Champion Level" (final-mix-level-088)
 * 10 rounds ending with the multi-step final mixed challenge.
 */
import CVCChampionReviewLevel from "./CVCChampionReviewLevel";

const ROUNDS = [
  { type: "one_letter_3_sounds", speakers: ["a", "e", "i"], letter: "i" },
  { type: "word_to_audio", words: ["map", "mop", "mug", "met"] },
  { type: "dictation", word: "hen" },
  { type: "identifying", word: "dog", choices: ["dog", "dig", "dad", "den"] },
  { type: "drag_v2", word: "cup", distractor: "a" },
  { type: "writev2", word: "rib" },
  { type: "rearrange_hard", words: ["wet"] },
  { type: "missing01", word: "jot", distractors: ["e", "i", "u"] },
  { type: "word_match", word: "bug", choices: ["bug", "beg", "big", "bog"] },
  { type: "final_challenge", words: ["cat", "bed", "pig", "dog", "sun"] },
];

export default function CVCChampionLevel88({ onBack, lang = "en" }) {
  return <CVCChampionReviewLevel levelNum={88} rounds={ROUNDS} onBack={onBack} lang={lang} />;
}