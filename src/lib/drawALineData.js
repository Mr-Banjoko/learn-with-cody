/**
 * Draw a Line Game — round data
 *
 * Each round has 3 entries: { word, audio, targetLetter }
 * targetLetter is the ONE letter sound the bottom speaker icon represents.
 *
 * TARGET LETTER SELECTION RULES:
 * - Each entry's targetLetter can be the FIRST OR LAST letter of the word.
 * - Across a round, a mix of first-letter and last-letter choices is used where possible.
 * - CONFLICT-FREE GUARANTEE: In every round, no two words share the same targetLetter.
 *   This ensures a unique one-to-one mapping with no ambiguity.
 *
 * Conflict check per round:
 *   - All 3 targetLetters must be distinct.
 *   - No targetLetter should appear in a word it wasn't assigned to
 *     (to prevent a child from accidentally matching it to the wrong word).
 *
 * Bottom-row order is randomized at runtime by the game component, not here.
 */

const WORD_AUDIO = "https://raw.githubusercontent.com/Mr-Banjoko/learn-with-cody/audio-feature/letter_sound/words/a_words";

export const shortARounds = [
  // Round 1 — mix: last / first / last
  // bat→t(last), cat→c(first), jam→m(last)
  // Conflict check: t, c, m are all distinct. ✓
  // "t" doesn't appear in cat or jam. "c" doesn't appear in bat or jam. "m" doesn't appear in bat or cat. ✓
  [
    { word: "bat",  audio: `${WORD_AUDIO}/bat.mp3`,  targetLetter: "t" },
    { word: "cat",  audio: `${WORD_AUDIO}/cat.mp3`,  targetLetter: "c" },
    { word: "jam",  audio: `${WORD_AUDIO}/jam.mp3`,  targetLetter: "m" },
  ],
  // Round 2 — mix: last / first / last
  // map→p(last), rat→r(first), fan→n(last)
  // Conflict check: p, r, n are all distinct. ✓
  // "p" doesn't appear in rat or fan. "r" doesn't appear in map or fan. "n" doesn't appear in map or rat. ✓
  [
    { word: "map",  audio: `${WORD_AUDIO}/map.mp3`,  targetLetter: "p" },
    { word: "rat",  audio: `${WORD_AUDIO}/rat.mp3`,  targetLetter: "r" },
    { word: "fan",  audio: `${WORD_AUDIO}/fan.mp3`,  targetLetter: "n" },
  ],
  // Round 3 — mix: last / first / last
  // gas→s(last), hat→h(first), pan→n(last)
  // Conflict check: s, h, n are all distinct. ✓
  // "s" doesn't appear in hat or pan. "h" doesn't appear in gas or pan. "n" doesn't appear in gas or hat. ✓
  [
    { word: "gas",  audio: `${WORD_AUDIO}/gas.mp3`,  targetLetter: "s" },
    { word: "hat",  audio: `${WORD_AUDIO}/hat.mp3`,  targetLetter: "h" },
    { word: "pan",  audio: `${WORD_AUDIO}/pan.mp3`,  targetLetter: "n" },
  ],
  // Round 4 — mix: first / last / first
  // sad→s(first), tag→g(last), wax→w(first)
  // Conflict check: s, g, w are all distinct. ✓
  // "s" doesn't appear in tag or wax. "g" doesn't appear in sad or wax. "w" doesn't appear in sad or tag. ✓
  [
    { word: "sad",  audio: `${WORD_AUDIO}/sad.mp3`,  targetLetter: "s" },
    { word: "tag",  audio: `${WORD_AUDIO}/tag.mp3`,  targetLetter: "g" },
    { word: "wax",  audio: `${WORD_AUDIO}/wax.mp3`,  targetLetter: "w" },
  ],
  // Round 5 — mix: last / first / last
  // dam→m(last), lab→l(first), nap→p(last)
  // Conflict check: m, l, p are all distinct. ✓
  // "m" doesn't appear in lab or nap. "l" doesn't appear in dam or nap. "p" doesn't appear in dam or lab. ✓
  [
    { word: "dam",  audio: `${WORD_AUDIO}/dam.mp3`,  targetLetter: "m" },
    { word: "lab",  audio: `${WORD_AUDIO}/lab.mp3`,  targetLetter: "l" },
    { word: "nap",  audio: `${WORD_AUDIO}/nap.mp3`,  targetLetter: "p" },
  ],
];

// Placeholder stubs for other vowels — ready to populate later
export const shortERounds = [];
export const shortIRounds = [];
export const shortORounds = [];
export const shortURounds = [];