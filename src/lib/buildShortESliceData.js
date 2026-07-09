/**
 * buildShortESliceData(word)
 * Builds a full word-data object with slice URLs for any short-e word.
 * Mirrors buildShortASliceData / buildShortOSliceData / buildShortISliceData.
 */
import { shortEWords } from "./shortEWords";
import { getLetterSoundUrl } from "./letterSounds";

const SLICE_BASE = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/phonics_app_images/cvc_words/e_slices";
const AUDIO_BASE = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/letter_sound/words/e_words";

export function buildShortESliceData(word) {
  const wordAsset = shortEWords.find((x) => x.word === word);
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