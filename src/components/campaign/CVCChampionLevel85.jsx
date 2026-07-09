/**
 * CVCChampionLevel85 — "Cody Champion Challenge 1" (final-mix-level-085)
 */
import CVCChampionReviewLevel from "./CVCChampionReviewLevel";

const ROUNDS = [
  { type: "drag_v2", word: "dim", distractor: "e" },
  { type: "identifying", word: "pet", choices: ["pet", "pat", "pit", "pot"] },
  { type: "missing01", word: "hug", distractors: ["a", "e", "o"] },
  { type: "word_to_audio", words: ["cab", "cub", "cob", "cod"] },
  { type: "connection", word: "rod" },
  { type: "drawline", words: ["cab", "cub", "cob"] },
  { type: "dictation", word: "win" },
  { type: "word_match", word: "bed", choices: ["bed", "bad", "bod", "bud"] },
  { type: "catch", word: "fox", letter: "o", distractors: ["a", "e", "i", "u"] },
];

export default function CVCChampionLevel85({ onBack, lang = "en" }) {
  return <CVCChampionReviewLevel levelNum={85} rounds={ROUNDS} onBack={onBack} lang={lang} />;
}