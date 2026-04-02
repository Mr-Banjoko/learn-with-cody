// Content manifest — vowel-group-ready, scalable structure
// Populate vowelGroups with real content when ready

export const lessonContent = {
  vowelGroups: [
    {
      id: "short-a",
      label: "Short A",
      emoji: "🍎",
      color: "#FF6B6B",
      available: false,
      words: [],
    },
    {
      id: "short-e",
      label: "Short E",
      emoji: "🥚",
      color: "#FFD93D",
      available: false,
      words: [],
    },
    {
      id: "short-i",
      label: "Short I",
      emoji: "🐛",
      color: "#6BCB77",
      available: false,
      words: [],
    },
    {
      id: "short-o",
      label: "Short O",
      emoji: "🐙",
      color: "#4D96FF",
      available: false,
      words: [],
    },
    {
      id: "short-u",
      label: "Short U",
      emoji: "☂️",
      color: "#C77DFF",
      available: false,
      words: [],
    },
  ],
};

export const activityTypes = [
  {
    id: "tap-sounds",
    label: "Tap Sounds",
    emoji: "🔊",
    description: "Tap each letter and hear its sound",
    color: "#4ECDC4",
    bgColor: "#E8FFFE",
    available: true,
  },
  {
    id: "blend-listen",
    label: "Blend & Listen",
    emoji: "🔗",
    description: "Listen as sounds blend into a word",
    color: "#FFD93D",
    bgColor: "#FFFDE7",
    available: true,
  },
  {
    id: "choose-picture",
    label: "Choose Picture",
    emoji: "🖼️",
    description: "Hear a word and tap the right picture",
    color: "#6BCB77",
    bgColor: "#F0FFF4",
    available: true,
  },
  {
    id: "drag-letters",
    label: "Drag Letters",
    emoji: "✋",
    description: "Drag letters to build the word",
    color: "#4D96FF",
    bgColor: "#EFF6FF",
    available: true,
  },
  {
    id: "spell-word",
    label: "Spell the Word",
    emoji: "✏️",
    description: "See a picture and spell the word",
    color: "#C77DFF",
    bgColor: "#FAF0FF",
    available: true,
  },
];

export const games = [
  {
    id: "pic-slice",
    label: "Rearrange the Pictures",
    emoji: "🖼️",
    description: "Drag picture pieces into the right order",
    available: true,
  },
  {
    id: "word-match",
    label: "Word Match",
    emoji: "🎯",
    description: "Match the word to the picture",
    available: true,
  },
  {
    id: "drag-letters",
    label: "Drag the Letters",
    emoji: "✋",
    description: "Drag letters into the right boxes to spell the word",
    available: true,
  },
  {
    id: "missing-sound",
    label: "Missing Sound",
    emoji: "❓",
    description: "Find the missing letter to complete the word",
    available: true,
  },
  {
    id: "letter-catch",
    label: "Letter Catch",
    emoji: "🧩",
    description: "Catch the right letters to make a word",
    available: false,
  },
  {
    id: "sound-safari",
    label: "Sound Safari",
    emoji: "🦁",
    description: "Find animals whose names start with the sound",
    available: false,
  },
];