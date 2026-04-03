const SLICE_BASE = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/phonics_app_images/cvc_words/i_slices";
const AUDIO_BASE = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/audio-feature/letter_sound/words/i_words";

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

export const shortISlices = [
  makeWord("bib"),
  makeWord("big"),
  makeWord("bin"),
  makeWord("bit"),
  makeWord("dig"),
  makeWord("dim"),
  makeWord("dip"),
  makeWord("fig"),
  makeWord("fin"),
  makeWord("fit"),
];