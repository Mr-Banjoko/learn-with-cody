import { motion } from "framer-motion";
import LetterCatchGame from "./LetterCatchGame";
import BackArrow from "../BackArrow";
import { shortIWords } from "../../lib/shortIWords";
import { useState } from "react";
import { tx } from "../../lib/i18n";

const DIFF_LABELS = {
  easy: { zh: "简单", descZh: "慢慢来 — 非常适合初学者！" },
  moderate: { zh: "中等", descZh: "快一点 — 睁大眼睛看！" },
  difficult: { zh: "困难", descZh: "超级快 — 你能全部接住吗？" },
};

const DIFFICULTIES = [
  {
    id: "easy",
    label: "Easy",
    emoji: "🌱",
    color: "#6BCB77",
    bg: "#F0FFF4",
    fallSpeed: 1.9,
    desc: "Nice and slow — perfect for beginners!",
  },
  {
    id: "moderate",
    label: "Moderate",
    emoji: "⚡",
    color: "#FFD93D",
    bg: "#FFFDE7",
    fallSpeed: 3.38,
    desc: "A little faster — keep your eyes open!",
  },
  {
    id: "difficult",
    label: "Difficult",
    emoji: "🔥",
    color: "#FF6B6B",
    bg: "#FFF0F0",
    fallSpeed: 7.6,
    desc: "Super fast — can you catch them all?",
  },
];

export default function ShortIDifficulty({ onBack, lang = "en" }) {
  const [selected, setSelected] = useState(null);

  if (selected) {
    const diff = DIFFICULTIES.find((d) => d.id === selected);
    return (
      <LetterCatchGame
        words={shortIWords}
        title={`Short i — ${diff.label}`}
        color={diff.color}
        fallSpeed={diff.fallSpeed}
        onBack={() => setSelected(null)}
        lang={lang}
      />
    );
  }

  return (
    <div className="min-h-full pb-32" style={{ background: "#D6EEFF", fontFamily: "Fredoka, sans-serif" }}>
      <div style={{ background: "#A8D0E6", borderBottomLeftRadius: 28, borderBottomRightRadius: 28, padding: "10px 20px 16px", display: "flex", alignItems: "center", gap: 8 }}>
        <BackArrow onPress={onBack} />
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1E3A5F" }}>Short i 🐟</h1>
          <p style={{ fontSize: 13, color: "#3A6080" }}>{tx("Pick a speed!", "pick_a_speed", lang)}</p>
        </div>
      </div>

      <div className="px-4 pt-6 flex flex-col gap-4">
        {DIFFICULTIES.map((diff, i) => (
          <motion.button
            key={diff.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelected(diff.id)}
            style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", borderRadius: 22, background: "white", border: `2.5px solid ${diff.color}55`, boxShadow: `0 6px 24px ${diff.color}22`, cursor: "pointer", width: "100%", textAlign: "left" }}
          >
            <div style={{ width: 60, height: 60, borderRadius: 18, background: diff.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, flexShrink: 0 }}>
              {diff.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 22, fontWeight: 700, color: "#1E3A5F", margin: 0 }}>{lang === "zh" ? DIFF_LABELS[diff.id]?.zh : diff.label}</p>
              <p style={{ fontSize: 13, color: "#7BACC8", margin: "2px 0 0" }}>{lang === "zh" ? DIFF_LABELS[diff.id]?.descZh : diff.desc}</p>
            </div>
            <div style={{ width: 34, height: 34, borderRadius: 17, background: diff.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ color: "white", fontSize: 20, lineHeight: 1 }}>›</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}