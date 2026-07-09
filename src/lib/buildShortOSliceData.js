/**
 * buildShortOSliceData(word)
 *
 * Builds a full word-data object with slice URLs for any short-o word.
 * Mirrors the pattern of buildShortASliceData but for the o_vowel assets.
 */
import { shortOWords } from "./shortOWords";
import { getLetterSoundUrl } from "./letterSounds";

const SLICE_BASE = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/phonics_app_images/cvc_words/o_slices";
const AUDIO_BASE = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/letter_sound/words/o_words";

export function buildShortOSliceData(word) {
  const wordAsset = shortOWords.find((x) => x.word === word);
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