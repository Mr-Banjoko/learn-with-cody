/**
 * Draw a Line Game — round data
 * Each entry: { word, image, audio, targetLetter }
 */
const IMG = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/phonics_app_images/cvc_words/a_vowel";
const WORD_AUDIO = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/audio-feature/letter_sound/words/a_words";

export const shortARounds = [
  [
    { word: "bat", image: `${IMG}/bat.webp`, audio: `${WORD_AUDIO}/bat.mp3`, targetLetter: "t" },
    { word: "cat", image: `${IMG}/cat.webp`, audio: `${WORD_AUDIO}/cat.mp3`, targetLetter: "c" },
    { word: "jam", image: `${IMG}/jam.webp`, audio: `${WORD_AUDIO}/jam.mp3`, targetLetter: "m" },
  ],
  [
    { word: "map", image: `${IMG}/map.webp`, audio: `${WORD_AUDIO}/map.mp3`, targetLetter: "p" },
    { word: "rat", image: `${IMG}/rat.webp`, audio: `${WORD_AUDIO}/rat.mp3`, targetLetter: "r" },
    { word: "fan", image: `${IMG}/fan.webp`, audio: `${WORD_AUDIO}/fan.mp3`, targetLetter: "n" },
  ],
  [
    { word: "gas", image: `${IMG}/gas.webp`, audio: `${WORD_AUDIO}/gas.mp3`, targetLetter: "s" },
    { word: "hat", image: `${IMG}/hat.webp`, audio: `${WORD_AUDIO}/hat.mp3`, targetLetter: "h" },
    { word: "pan", image: `${IMG}/pan.webp`, audio: `${WORD_AUDIO}/pan.mp3`, targetLetter: "n" },
  ],
  [
    { word: "sad", image: `${IMG}/sad.webp`, audio: `${WORD_AUDIO}/sad.mp3`, targetLetter: "s" },
    { word: "tag", image: `${IMG}/tag.webp`, audio: `${WORD_AUDIO}/tag.mp3`, targetLetter: "g" },
    { word: "wax", image: `${IMG}/wax.webp`, audio: `${WORD_AUDIO}/wax.mp3`, targetLetter: "w" },
  ],
  [
    { word: "dam", image: `${IMG}/dam.webp`, audio: `${WORD_AUDIO}/dam.mp3`, targetLetter: "m" },
    { word: "lab", image: `${IMG}/lab.webp`, audio: `${WORD_AUDIO}/lab.mp3`, targetLetter: "l" },
    { word: "nap", image: `${IMG}/nap.webp`, audio: `${WORD_AUDIO}/nap.mp3`, targetLetter: "p" },
  ],
];

export const shortERounds = [];
export const shortIRounds = [];
export const shortORounds = [];
export const shortURounds = [];
