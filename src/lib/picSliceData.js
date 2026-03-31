import { shortAWords } from "./shortAWords";

const wm = Object.fromEntries(shortAWords.map(w => [w.word, w]));
const pair = (a, b) => [wm[a], wm[b]].filter(Boolean);

export const GAME_DATA = {
  "short-a": {
    label: "Short a",
    emoji: "🍎",
    color: "#FF6B6B",
    easy: [
      pair("cat", "fat"),
      pair("bat", "hat"),
      pair("can", "pan"),
      pair("jam", "map"),
      pair("mat", "sat"),
      pair("mad", "sad"),
      pair("ham", "ram"),
      pair("fan", "man"),
      pair("bag", "tag"),
      pair("tap", "nap"),
    ].filter(r => r.length === 2),
    difficult: [],
  },
  "short-e": { label: "Short e", emoji: "🥚", color: "#FFD93D", easy: [], difficult: [] },
  "short-i": { label: "Short i", emoji: "🐟", color: "#6BCB77", easy: [], difficult: [] },
  "short-o": { label: "Short o", emoji: "🐙", color: "#4D96FF", easy: [], difficult: [] },
  "short-u": { label: "Short u", emoji: "☂️", color: "#C77DFF", easy: [], difficult: [] },
};