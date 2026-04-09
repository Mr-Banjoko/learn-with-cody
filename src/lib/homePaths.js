import { shortAWords } from "./shortAWords";

export const HOME_PATHS = {
  "short-a": {
    label: "Short a",
    emoji: "🍎",
    color: "#FF6B6B",
    bgGradient: "linear-gradient(160deg, #FFF5F5 0%, #FFE8E8 100%)",
    pathStroke: "#FF9999",
    nodes: [
      {
        id: "node-1",
        type: "learn",
        emoji: "📖",
        label: "Meet the Words",
        words: shortAWords.slice(0, 8),
        title: "Short a Words",
      },
      {
        id: "node-2",
        type: "wordmatch",
        emoji: "🎯",
        label: "Word Match",
        words: shortAWords.slice(0, 12),
        title: "Short a",
        color: "#FF6B6B",
      },
      {
        id: "node-3",
        type: "learn",
        emoji: "📖",
        label: "More Words",
        words: shortAWords.slice(8, 16),
        title: "Short a Words",
      },
      {
        id: "node-4",
        type: "dragletters",
        emoji: "✋",
        label: "Drag Letters",
        words: shortAWords.slice(0, 8),
        title: "Short a",
        color: "#FF6B6B",
      },
      {
        id: "node-5",
        type: "learn",
        emoji: "🔁",
        label: "Quick Review",
        words: shortAWords.slice(0, 16),
        title: "Short a Words",
      },
      {
        id: "node-6",
        type: "missingsound",
        emoji: "❓",
        label: "Missing Sound",
        words: shortAWords.slice(0, 12),
        title: "Short a",
        color: "#FF6B6B",
      },
      {
        id: "node-7",
        type: "lettercatch",
        emoji: "🎮",
        label: "Letter Catch",
        words: shortAWords.slice(0, 12),
        title: "Short a",
        color: "#FF6B6B",
      },
      {
        id: "node-8",
        type: "dragletters",
        emoji: "✋",
        label: "Drag All Words",
        words: shortAWords,
        title: "Short a",
        color: "#FF6B6B",
      },
      {
        id: "node-9",
        type: "wordmatch",
        emoji: "🏆",
        label: "Mastery Check",
        words: shortAWords,
        title: "Short a",
        color: "#FF6B6B",
      },
    ],
  },
};

export const LEARN_NODE_TYPES = ["learn"];
export const GAME_NODE_TYPES = ["wordmatch", "dragletters", "missingsound", "lettercatch"];