const BASE_IMG = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/phonics_app_images/cvc_words/a_vowel";
const BASE_WORDS_A = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/audio-feature/letter_sound/words/a_words";
const BASE_LETTERS = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/audio-feature/letter_sound/letter_sounds";

// Navigation: 5 vowel groups
export const VOWEL_GROUPS = [
  { id: "short-a", label: "Short a", emoji: "🍎", available: true },
  { id: "short-e", label: "Short e", emoji: "🥚", available: false },
  { id: "short-i", label: "Short i", emoji: "🐟", available: false },
  { id: "short-o", label: "Short o", emoji: "🐙", available: false },
  { id: "short-u", label: "Short u", emoji: "☂️", available: false },
];

// Rounds: each round is a pair of words
// Scalable: add short-e, short-i etc. later
export const GAME_ROUNDS = {
  "short-a": {
    easy: [
      ["cat", "fat"],
      ["bat", "hat"],
      ["can", "pan"],
      ["map", "tap"],
      ["bag", "rag"],
      ["jam", "ham"],
      ["rat", "mat"],
      ["sad", "dad"],
    ],
    difficult: [], // TBD
  },
};

function getImageBase(vowelId) {
  // Extend for other vowels later
  return BASE_IMG;
}

function getWordAudioBase(vowelId) {
  if (vowelId === "short-a") return BASE_WORDS_A;
  return BASE_WORDS_A; // fallback — extend later
}

export function buildWordData(word, vowelId = "short-a") {
  return {
    word,
    image: `${getImageBase(vowelId)}/${word}.webp`,
    audio: `${getWordAudioBase(vowelId)}/${word}.mp3`,
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
        id: `${wd.word}-${sliceIndex}`,
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