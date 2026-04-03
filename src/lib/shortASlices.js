const SLICE_BASE = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/phonics_app_images/cvc_words/a_slices";
const AUDIO_BASE = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/audio-feature/letter_sound/words/a_words";

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

// The 10 short-a words with pre-sliced assets on main branch
export const shortASlices = [
  makeWord("bag"),
  makeWord("ban"),
  makeWord("bat"),
  makeWord("cab"),
  makeWord("can"),
  makeWord("cat"),
  makeWord("dab"),
  makeWord("dad"),
  makeWord("dam"),
  makeWord("fan"),
];