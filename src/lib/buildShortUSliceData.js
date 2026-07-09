/**
 * buildShortUSliceData(word)
 * Builds a full word-data object with slice URLs for any short-u word.
 * Mirrors buildShortESliceData / buildShortOSliceData / buildShortISliceData.
 */
import { shortUWords } from "./shortUWords";
import { getLetterSoundUrl } from "./letterSounds";

const SLICE_BASE = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/phonics_app_images/cvc_words/u_slices";
const AUDIO_BASE = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/letter_sound/words/u_words";

export function buildShortUSliceData(word) {
  const wordAsset = shortUWords.find((x) => x.word === word);
  const slices = [
    `${SLICE_BASE}/${word}/${word}_slice_1.webp`,
    `${SLICE_BASE}/${word}/${word}_slice_2.webp`,
    `${SLICE_BASE}/${word}/${word}_slice_3.webp`,
  ];
  return {
    word,
    audio: wordAsset?.audio || `${AUDIO_BASE}/${word}.mp3`,
    fullImage: wordAsset?.image || "",
    image: wordAsset?.image || "",
    slices,
    phonemes: word.split("").map((letter, i) => ({
      letter,
      audio: getLetterSoundUrl(letter),
      sliceSrc: slices[i],
    })),
  };
}