const BASE = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/audio-feature/letter_sound/letter_sounds";

// Explicit per-letter extension map — use the exact filenames from the repo
const LETTER_EXT = {
  a: "mp3", b: "mp3", c: "mp3", d: "mp3", e: "mp3",
  f: "mp3", g: "mp3", h: "mp3", i: "mp3", j: "mp3",
  k: "mp3", l: "mp3", m: "mp3", n: "mp3", o: "mp3",
  p: "m4a", q: "m4a", r: "mp3", s: "mp3", t: "mp3",
  u: "mp3", v: "mp3", w: "mp3", x: "mp3", y: "mp3",
  z: "mp3",
};

export const letterSoundUrls = Object.fromEntries(
  Object.entries(LETTER_EXT).map(([l, ext]) => [l, `${BASE}/${l}.${ext}`])
);

export function getLetterSoundUrl(letter) {
  return letterSoundUrls[letter.toLowerCase()] || null;
}