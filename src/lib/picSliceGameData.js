import { shortAWords } from "./shortAWords";
import { shortASlices } from "./shortASlices";
import { shortEWords } from "./shortEWords";
import { shortIWords } from "./shortIWords";
import { shortOWords } from "./shortOWords";
import { shortUWords } from "./shortUWords";

const BASE_LETTERS = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/audio-feature/letter_sound/letter_sounds";

// Build a lookup map from word string → { image, audio } using the real asset URLs
const WORD_LOOKUP = {};
[...shortAWords, ...shortEWords, ...shortIWords, ...shortOWords, ...shortUWords].forEach((w) => {
  WORD_LOOKUP[w.word] = { image: w.image, audio: w.audio };
});

// Navigation: 5 vowel groups
export const VOWEL_GROUPS = [
  { id: "short-a", label: "Short a", emoji: "🍎", available: true },
  { id: "short-e", label: "Short e", emoji: "🥚", available: false },
  { id: "short-i", label: "Short i", emoji: "🐟", available: false },
  { id: "short-o", label: "Short o", emoji: "🐙", available: false },
  { id: "short-u", label: "Short u", emoji: "☂️", available: false },
];

// Lookup for slice-based words
const SLICE_LOOKUP = Object.fromEntries(shortASlices.map(w => [w.word, w]));

// Rounds: each round is a pair of words
export const GAME_ROUNDS = {
  "short-a": {
    easy: [
      ["bag", "bat"],
      ["ban", "can"],
      ["cab", "cat"],
      ["dab", "dad"],
      ["dam", "fan"],
    ],
    difficult: [],
  },
};

function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildWordData(word) {
  const sliceData = SLICE_LOOKUP[word];
  const fullImageAsset = WORD_LOOKUP[word]?.image || "";
  if (sliceData) {
    return {
      word,
      audio: sliceData.audio,
      slices: sliceData.slices,
      fullImage: fullImageAsset,
      phonemes: word.split("").map((letter, i) => ({
        letter,
        audio: `${BASE_LETTERS}/${letter}.mp3`,
        sliceSrc: sliceData.slices[i],
      })),
    };
  }
  // Fallback
  const assets = WORD_LOOKUP[word] || {};
  return {
    word,
    image: assets.image || "",
    fullImage: assets.image || "",
    audio: assets.audio || "",
    slices: null,
    phonemes: word.split("").map((letter, i) => ({
      letter,
      audio: `${BASE_LETTERS}/${letter}.mp3`,
      sliceSrc: null,
    })),
  };
}

// Build shuffled pieces from a word pair.
// Sound assignment is RANDOMIZED within each word so visual slice ≠ fixed phoneme.
// Each piece carries: wordIndex (strict ownership) + targetSlot (correct slot position)
export function buildRoundPieces(wordDataArr) {
  const pieces = [];
  wordDataArr.forEach((wd, wordIndex) => {
    // Random phoneme order: phonemeOrder[visualSliceIdx] = phonemeIdx
    const phonemeOrder = shuffleArr([0, 1, 2]);
    for (let visualIdx = 0; visualIdx < 3; visualIdx++) {
      const phonemeIdx = phonemeOrder[visualIdx];
      const ph = wd.phonemes[phonemeIdx];
      pieces.push({
        id: `${wd.word}-v${visualIdx}-${Date.now()}-${Math.random()}`,
        wordIndex,
        word: wd.word,
        targetSlot: phonemeIdx,   // which slot in THIS word's box it must go to
        phoneme: ph.letter,
        letterAudio: ph.audio,
        sliceSrc: wd.slices ? wd.slices[visualIdx] : null,
        image: wd.image || null,
      });
    }
  });
  return shuffleArr(pieces);
}