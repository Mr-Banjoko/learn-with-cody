import { shortAWords } from "./shortAWords";
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

// Rounds: each round is a pair of words — only include pairs where BOTH words have images
export const GAME_ROUNDS = {
  "short-a": {
    easy: [
      ["cat", "bat"],
      ["hat", "mat"],
      ["can", "pan"],
      ["map", "tap"],
      ["bag", "tag"],
      ["jam", "ham"],
      ["rat", "sat"],
      ["sad", "mad"],
    ].filter(([a, b]) => WORD_LOOKUP[a] && WORD_LOOKUP[b]),
    difficult: [],
  },
};

export function buildWordData(word) {
  const assets = WORD_LOOKUP[word] || {};
  return {
    word,
    image: assets.image || "",
    audio: assets.audio || "",
    phonemes: word.split("").map((letter) => ({
      letter,
      audio: `${BASE_LETTERS}/${letter}.mp3`,
    })),
  };
}

// Build shuffled pieces from a word pair
// Each piece: { id, wordIndex, sliceIndex, phoneme, letterAudio, image, word }
export function buildRoundPieces(wordDataArr) {
  const pieces = [];
  wordDataArr.forEach((wd, wordIndex) => {
    wd.phonemes.forEach((ph, sliceIndex) => {
      pieces.push({
        id: `${wd.word}-${sliceIndex}-${Date.now()}`,
        wordIndex,
        sliceIndex,
        phoneme: ph.letter,
        letterAudio: ph.audio,
        image: wd.image,
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