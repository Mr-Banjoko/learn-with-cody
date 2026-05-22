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
  makeWord("gig"),
  makeWord("hid"),
  makeWord("hip"),
  makeWord("hit"),
  makeWord("jig"),
  makeWord("kid"),
  makeWord("kit"),
  makeWord("lid"),
  makeWord("lip"),
  makeWord("mix"),
  makeWord("fix"),
  makeWord("net"),
  makeWord("peg"),
  makeWord("pen"),
  makeWord("pig"),
  makeWord("pin"),
  makeWord("pit"),
  makeWord("rib"),
  makeWord("rid"),
  makeWord("rim"),
  makeWord("rip"),
  makeWord("sip"),
  makeWord("sit"),
  makeWord("six"),
  makeWord("tin"),
  makeWord("tip"),
  makeWord("wig"),
  makeWord("win"),
  makeWord("zip"),
];