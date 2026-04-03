const SLICE_BASE = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/phonics_app_images/cvc_words/o_slices";
const AUDIO_BASE = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/audio-feature/letter_sound/words/o_words";

function makeWord(word) {
  return {
    word,
    audio: `${AUDIO_BASE}/${word}.mp3`,
    slices: [
      `${SLICE_BASE}/${word}/${word}_slice_1.webp`,
      `${SLICE_BASE}/${word}/${word}_slice_2.webp`,
      `${SLICE_BASE}/${word}/${word}_slice_3.webp`,
    ],
  };
}

export const shortOSlices = [
  makeWord("bog"),
  makeWord("box"),
  makeWord("cob"),
  makeWord("cod"),
  makeWord("cog"),
  makeWord("cop"),
  makeWord("cot"),
  makeWord("dog"),
  makeWord("fog"),
  makeWord("fox"),
];