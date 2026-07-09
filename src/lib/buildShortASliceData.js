/**
 * buildShortASliceData(word)
 *
 * Builds a full word-data object with slice URLs for ANY short-a word,
 * including words not listed in shortASlices (e.g. lad, lab, pal, tax).
 * URLs are constructed directly from the GitHub asset base — the same
 * pattern used by shortASlices — so this never silently returns null slices.
 *
 * Use this instead of buildWordData() whenever you need guaranteed slices
 * for short-a words in PicSliceBoard (difficult mode) or CampaignConnectionRound.
 */
import { shortAWords } from "./shortAWords";
import { getLetterSoundUrl } from "./letterSounds";

const SLICE_BASE = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/phonics_app_images/cvc_words/a_slices";
const AUDIO_BASE = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/letter_sound/words/a_words";

export function buildShortASliceData(word) {
  const wordAsset = shortAWords.find((x) => x.word === word);
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