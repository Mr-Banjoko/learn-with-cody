/**
 * Draw a Line Game — data & round-generation logic
 *
 * Each round has 3 top cards (picture+word) and 3 bottom letters.
 * Letters are chosen from a mix of first-letter and last-letter targets.
 * Rounds are validated to have exactly one unique one-to-one solution.
 */
import { shortAWords } from "../../../lib/shortAWords";

// ── Short A word pool ────────────────────────────────────────────────────────
export const SHORT_A_WORDS = shortAWords;

// ── Round-generation helpers ─────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Given 3 words and their chosen target-letter positions,
 * return true if the round has a unique one-to-one solution
 * (no bottom letter matches more than one top card).
 */
function isUnambiguous(words, targets) {
  // targets[i] is "first" | "last"
  const letters = targets.map((t, i) =>
    t === "first" ? words[i].word[0] : words[i].word[words[i].word.length - 1]
  );
  // All 3 bottom letters must be distinct
  return new Set(letters).size === 3;
}

/**
 * Build one round.
 * Returns:
 * {
 *   topCards: [{ word, image, audio, targetLetter, id }],
 *   bottomLetters: [{ letter, topCardId }],  // shuffled
 * }
 * or null if we couldn't find an unambiguous set within attempts.
 */
function buildRound(wordPool) {
  const MAX_ATTEMPTS = 200;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const shuffledPool = shuffle(wordPool);
    const words = shuffledPool.slice(0, 3);

    // Choose target position: first or last, mixed randomly
    const positions = ["first", "last", "first", "last"];
    shuffle(positions);
    const targets = [positions[0], positions[1], positions[2]];

    if (!isUnambiguous(words, targets)) continue;

    const topCards = words.map((w, i) => ({
      ...w,
      targetLetter: targets[i] === "first" ? w.word[0] : w.word[w.word.length - 1],
      id: `card-${i}-${w.word}`,
    }));

    // Shuffle bottom letters so they don't line up with top cards
    const letters = topCards.map((c) => ({ letter: c.targetLetter, topCardId: c.id }));
    let shuffledLetters = shuffle(letters);

    // Make sure no bottom letter is in the same position as its matching top card
    let safetyTries = 0;
    while (
      safetyTries < 20 &&
      shuffledLetters.some((l, i) => l.topCardId === topCards[i].id)
    ) {
      shuffledLetters = shuffle(letters);
      safetyTries++;
    }

    return { topCards, bottomLetters: shuffledLetters };
  }
  return null; // fallback — should never happen with large pool
}

/**
 * Generate N rounds from a word pool. Each round uses fresh 3 words
 * (words can repeat across rounds but not within a round).
 */
export function generateRounds(wordPool, count = 5) {
  const rounds = [];
  for (let i = 0; i < count; i++) {
    const round = buildRound(wordPool);
    if (round) rounds.push(round);
  }
  return rounds;
}

// ── Scaffold data for other vowels (to be filled later) ─────────────────────
export const VOWEL_GROUPS = [
  {
    id: "short-a",
    label: "Short a",
    emoji: "🍎",
    color: "#FF6B6B",
    wordPool: SHORT_A_WORDS,
    available: true,
  },
  {
    id: "short-e",
    label: "Short e",
    emoji: "🥚",
    color: "#FFD93D",
    wordPool: [],
    available: false,
  },
  {
    id: "short-i",
    label: "Short i",
    emoji: "🐛",
    color: "#6BCB77",
    wordPool: [],
    available: false,
  },
  {
    id: "short-o",
    label: "Short o",
    emoji: "🐙",
    color: "#4D96FF",
    wordPool: [],
    available: false,
  },
  {
    id: "short-u",
    label: "Short u",
    emoji: "☂️",
    color: "#C77DFF",
    wordPool: [],
    available: false,
  },
];