import { shortAWords } from "./shortAWords";
import { shortEWords } from "./shortEWords";
import { shortIWords } from "./shortIWords";
import { shortOWords } from "./shortOWords";
import { shortUWords } from "./shortUWords";
import { shortASlices } from "./shortASlices";
import { shortESlices } from "./shortESlices";
import { shortISlices } from "./shortISlices";
import { shortOSlices } from "./shortOSlices";
import { shortUSlices } from "./shortUSlices";

const BASE_LETTERS = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/audio-feature/letter_sound/letter_sounds";

// Full-image lookup (for the reveal after all 3 slices placed)
const WORD_LOOKUP = {};
[...shortAWords, ...shortEWords, ...shortIWords, ...shortOWords, ...shortUWords].forEach((w) => {
  WORD_LOOKUP[w.word] = { image: w.image, audio: w.audio };
});

// Slice asset lookup across all vowel groups
const SLICE_LOOKUP = Object.fromEntries(
  [...shortASlices, ...shortESlices, ...shortISlices, ...shortOSlices, ...shortUSlices].map((w) => [w.word, w])
);

// Navigation: all 5 vowel groups now available
export const VOWEL_GROUPS = [
  { id: "short-a", label: "Short a", emoji: "🍎", available: true },
  { id: "short-e", label: "Short e", emoji: "🥚", available: true },
  { id: "short-i", label: "Short i", emoji: "🐟", available: true },
  { id: "short-o", label: "Short o", emoji: "🐙", available: true },
  { id: "short-u", label: "Short u", emoji: "☂️", available: true },
];

// 5 rounds per vowel group (2 words each)
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
  "short-e": {
    easy: [
      ["bed", "beg"],
      ["bet", "den"],
      ["fed", "gem"],
      ["get", "hem"],
      ["hen", "jet"],
    ],
    difficult: [],
  },
  "short-i": {
    easy: [
      ["bib", "big"],
      ["bin", "bit"],
      ["dig", "dim"],
      ["dip", "fig"],
      ["fin", "fit"],
    ],
    difficult: [],
  },
  "short-o": {
    easy: [
      ["bog", "box"],
      ["cob", "cod"],
      ["cog", "cop"],
      ["cot", "dog"],
      ["fog", "fox"],
    ],
    difficult: [],
  },
  "short-u": {
    easy: [
      ["bud", "bug"],
      ["bun", "bus"],
      ["cub", "cup"],
      ["fun", "gum"],
      ["gun", "hug"],
    ],
    difficult: [],
  },
};

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

  // Fallback: full-image word (no slices)
  const assets = WORD_LOOKUP[word] || {};
  return {
    word,
    image: assets.image || "",
    fullImage: assets.image || "",
    audio: assets.audio || "",
    slices: null,
    phonemes: word.split("").map((letter) => ({
      letter,
      audio: `${BASE_LETTERS}/${letter}.mp3`,
      sliceSrc: null,
    })),
  };
}

function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build shuffled pieces for a word pair.
// Sound assignment is RANDOMIZED within each word: visual slice index ≠ fixed phoneme.
// Each piece carries: wordIndex (strict ownership) + targetSlot (correct sound-position slot).
export function buildRoundPieces(wordDataArr) {
  const pieces = [];
  wordDataArr.forEach((wd, wordIndex) => {
    // Randomly assign which visual slice carries which phoneme
    const phonemeOrder = shuffleArr([0, 1, 2]);
    for (let visualIdx = 0; visualIdx < 3; visualIdx++) {
      const phonemeIdx = phonemeOrder[visualIdx];
      const ph = wd.phonemes[phonemeIdx];
      pieces.push({
        id: `${wd.word}-v${visualIdx}-${Date.now()}-${Math.random()}`,
        wordIndex,
        word: wd.word,
        targetSlot: phonemeIdx,     // which slot in THIS word's box it must go to
        phoneme: ph.letter,
        letterAudio: ph.audio,
        sliceSrc: wd.slices ? wd.slices[visualIdx] : null,
        image: wd.image || null,
      });
    }
  });
  return shuffleArr(pieces);
}