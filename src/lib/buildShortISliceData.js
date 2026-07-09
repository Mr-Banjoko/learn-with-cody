/**
 * buildShortISliceData(word)
 *
 * Builds a full word-data object with slice URLs for any short-i word.
 * Mirrors the pattern of buildShortASliceData / buildShortOSliceData.
 */
import { shortIWords } from "./shortIWords";
import { getLetterSoundUrl } from "./letterSounds";

const SLICE_BASE = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/phonics_app_images/cvc_words/i_slices";
const AUDIO_BASE = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/letter_sound/words/i_words";

export function buildShortISliceData(word) {
  const wordAsset = shortIWords.find((x) => x.word === word);
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