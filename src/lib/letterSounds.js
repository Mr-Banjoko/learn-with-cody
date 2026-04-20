const BASE = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/main/letter_sound/letter_sounds";

// Explicit per-letter extension map — use the exact filenames from the repo
const LETTER_EXT = {
  a: "mp3", b: "mp3", c: "mp3", d: "mp3", e: "mp3",
  f: "mp3", g: "mp3", h: "mp3", i: "mp3", j: "mp3",
  k: "mp3", l: "mp3", m: "mp3", n: "mp3", o: "mp3",
  p: "mp3", q: "mp3", r: "mp3", s: "mp3", t: "mp3",
  u: "mp3", v: "mp3", w: "mp3", x: "mp3", y: "mp3",
  z: "mp3",
};

// Letters whose audio files were updated — append a version param to bust all caches
const UPDATED_V2 = new Set(["a", "e", "i", "p", "q", "u"]);

export const letterSoundUrls = Object.fromEntries(
  Object.entries(LETTER_EXT).map(([l, ext]) => {
    const url = `${BASE}/${l}.${ext}`;
    return [l, UPDATED_V2.has(l) ? `${url}?v=2` : url];
  })
);

export function getLetterSoundUrl(letter) {
  return letterSoundUrls[letter.toLowerCase()] || null;
}

// Per-letter gain overrides — boost letters that are noticeably quieter than others
const LETTER_GAIN = {
  p: 3.0,
};

export function getLetterGain(letter) {
  return LETTER_GAIN[letter.toLowerCase()] || 1;
}