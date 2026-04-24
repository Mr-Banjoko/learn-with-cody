/**
 * Draw a Line Game — round data
 *
 * Each round has 3 entries: { word, audio, targetLetter }
 * targetLetter is the ONE letter sound the bottom speaker icon represents.
 *
 * CONFLICT-FREE GUARANTEE:
 * In every round, each targetLetter appears in its own word but NOT in the other two words.
 * This ensures a unique one-to-one mapping — no ambiguity possible.
 *
 * Bottom-row order is randomized at runtime by the game component, not here.
 */

const WORD_AUDIO = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/audio-feature/letter_sound/words/a_words";

export const shortARounds = [
  // Round 1
  [
    { word: "bat",  audio: `${WORD_AUDIO}/bat.mp3`,  targetLetter: "b" },
    { word: "cat",  audio: `${WORD_AUDIO}/cat.mp3`,  targetLetter: "c" },
    { word: "jam",  audio: `${WORD_AUDIO}/jam.mp3`,  targetLetter: "j" },
  ],
  // Round 2
  [
    { word: "map",  audio: `${WORD_AUDIO}/map.mp3`,  targetLetter: "m" },
    { word: "rat",  audio: `${WORD_AUDIO}/rat.mp3`,  targetLetter: "r" },
    { word: "fan",  audio: `${WORD_AUDIO}/fan.mp3`,  targetLetter: "f" },
  ],
  // Round 3
  [
    { word: "gas",  audio: `${WORD_AUDIO}/gas.mp3`,  targetLetter: "g" },
    { word: "hat",  audio: `${WORD_AUDIO}/hat.mp3`,  targetLetter: "h" },
    { word: "pan",  audio: `${WORD_AUDIO}/pan.mp3`,  targetLetter: "p" },
  ],
  // Round 4
  [
    { word: "sad",  audio: `${WORD_AUDIO}/sad.mp3`,  targetLetter: "s" },
    { word: "tag",  audio: `${WORD_AUDIO}/tag.mp3`,  targetLetter: "t" },
    { word: "wax",  audio: `${WORD_AUDIO}/wax.mp3`,  targetLetter: "w" },
  ],
  // Round 5
  [
    { word: "dam",  audio: `${WORD_AUDIO}/dam.mp3`,  targetLetter: "d" },
    { word: "lab",  audio: `${WORD_AUDIO}/lab.mp3`,  targetLetter: "l" },
    { word: "nap",  audio: `${WORD_AUDIO}/nap.mp3`,  targetLetter: "n" },
  ],
];

// Placeholder stubs for other vowels — ready to populate later
export const shortERounds = [];
export const shortIRounds = [];
export const shortORounds = [];
export const shortURounds = [];