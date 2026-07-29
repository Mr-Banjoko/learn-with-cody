/**
 * Placement Test round data — fixed (not random).
 * 4 sub-tests gauging a learner's letter-sound level.
 *
 * Round shapes per type:
 *  - letter3sounds : { target, choices[3] }      (see a letter, pick its sound)
 *  - sound3letters : { target, choices[3] }      (hear a sound, pick the letter)
 *  - upperlower    : { base, displayed, correct, choices[3] } (upper shown, pick lower)
 *  - letterissoundis : { situation, letter, choices[3] }
 *       situation 1 = letter missing (sound given) → drag the LETTER
 *       situation 2 = sound missing (letter given) → drag the SOUND
 *       correctIdx = choices.indexOf(letter)
 */
export const PLACEMENT_ROUNDS = [
  // ── Test 1: 1 letter · 3 sounds ───────────────────────────────────────────
  { type: "letter3sounds", round: { target: "b", choices: ["d", "b", "p"] } },
  { type: "letter3sounds", round: { target: "o", choices: ["e", "f", "o"] } },
  { type: "letter3sounds", round: { target: "c", choices: ["c", "x", "s"] } },
  { type: "letter3sounds", round: { target: "s", choices: ["x", "s", "c"] } },
  { type: "letter3sounds", round: { target: "m", choices: ["n", "m", "l"] } },

  // ── Test 2: 1 sound · 3 letters ───────────────────────────────────────────
  { type: "sound3letters", round: { target: "d", choices: ["g", "b", "d"] } },
  { type: "sound3letters", round: { target: "p", choices: ["q", "p", "b"] } },
  { type: "sound3letters", round: { target: "f", choices: ["x", "t", "f"] } },
  { type: "sound3letters", round: { target: "i", choices: ["i", "a", "e"] } },
  { type: "sound3letters", round: { target: "e", choices: ["i", "e", "o"] } },

  // ── Test 3: Upper & Lower ──────────────────────────────────────────────────
  { type: "upperlower", round: { base: "q", displayed: "Q", correct: "q", choices: ["q", "p", "b"] } },
  { type: "upperlower", round: { base: "a", displayed: "A", correct: "a", choices: ["e", "a", "j"] } },
  { type: "upperlower", round: { base: "g", displayed: "G", correct: "g", choices: ["c", "z", "g"] } },
  { type: "upperlower", round: { base: "h", displayed: "H", correct: "h", choices: ["i", "h", "m"] } },
  { type: "upperlower", round: { base: "e", displayed: "E", correct: "e", choices: ["e", "m", "h"] } },
  { type: "upperlower", round: { base: "n", displayed: "N", correct: "n", choices: ["m", "n", "s"] } },

  // ── Test 4 (v1): looking for the SOUND — letter given (situation 2) ────────
  { type: "letterissoundis", round: { situation: 2, letter: "z", choices: ["s", "z", "f"] } },
  { type: "letterissoundis", round: { situation: 2, letter: "v", choices: ["w", "z", "v"] } },
  { type: "letterissoundis", round: { situation: 2, letter: "w", choices: ["w", "u", "n"] } },

  // ── Test 4 (v2): looking for the LETTER — sound given (situation 1) ─────────
  { type: "letterissoundis", round: { situation: 1, letter: "q", choices: ["b", "q", "p"] } },
  { type: "letterissoundis", round: { situation: 1, letter: "x", choices: ["x", "s", "c"] } },
  { type: "letterissoundis", round: { situation: 1, letter: "j", choices: ["i", "j", "l"] } },
  { type: "letterissoundis", round: { situation: 1, letter: "r", choices: ["u", "n", "r"] } },
];

export const PLACEMENT_TOTAL = PLACEMENT_ROUNDS.length;