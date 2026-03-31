const BASE = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/audio-feature/letter_sound/letter_sounds";

export const letterSoundUrls = Object.fromEntries(
  "abcdefghijklmnopqrstuvwxyz".split("").map((l) => [l, `${BASE}/${l}.mp3`])
);

export function getLetterSoundUrl(letter) {
  return letterSoundUrls[letter.toLowerCase()] || null;
}