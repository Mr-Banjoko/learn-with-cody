const SLICE_BASE = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/phonics_app_images/cvc_words/u_slices";
const AUDIO_BASE = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/audio-feature/letter_sound/words/u_words";

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

export const shortUSlices = [
  makeWord("bud"),
  makeWord("bug"),
  makeWord("bun"),
  makeWord("bus"),
  makeWord("cub"),
  makeWord("cup"),
  makeWord("fun"),
  makeWord("gum"),
  makeWord("gun"),
  makeWord("hug"),
];