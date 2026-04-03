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

export function buildWordData(word) {
  // Prefer pre-sliced assets if available
  const sliceData = SLICE_LOOKUP[word];
  if (sliceData) {
    return {
      word,
      audio: sliceData.audio,
      slices: sliceData.slices,
      phonemes: word.split("").map((letter, i) => ({
        letter,
        audio: `${BASE_LETTERS}/${letter}.mp3`,
        sliceSrc: sliceData.slices[i],
      })),
    };
  }
  // Fallback to full-image words
  const assets = WORD_LOOKUP[word] || {};
  return {
    word,
    image: assets.image || "",
    audio: assets.audio || "",
    slices: null,
    phonemes: word.split("").map((letter) => ({
      letter,
      audio: `${BASE_LETTERS}/${letter}.mp3`,
      sliceSrc: null,
    })),
  };
}

// Build shuffled pieces from a word pair
// Each piece: { id, wordIndex, sliceIndex, phoneme, letterAudio, sliceSrc, image, word }
export function buildRoundPieces(wordDataArr) {
  const pieces = [];
  wordDataArr.forEach((wd, wordIndex) => {
    wd.phonemes.forEach((ph, sliceIndex) => {
      pieces.push({
        id: `${wd.word}-${sliceIndex}-${Date.now()}-${Math.random()}`,
        wordIndex,
        sliceIndex,
        phoneme: ph.letter,
        letterAudio: ph.audio,
        sliceSrc: ph.sliceSrc,
        image: wd.image || null,
        word: wd.word,
      });
    });
  });
  // Fisher-Yates shuffle
  for (let i = pieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
  }
  return pieces;
}