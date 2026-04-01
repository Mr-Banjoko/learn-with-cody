import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import WordMatchGame from "./WordMatchGame";
import { shortAWords } from "../../lib/shortAWords";

const VOWEL_GROUPS = [
  { id: "short-a", label: "Short a", emoji: "🍎", color: "#FF6B6B", bg: "#FFF0F0", words: shortAWords, available: true },
  { id: "short-e", label: "Short e", emoji: "🥚", color: "#FFD93D", bg: "#FFFDE7", words: [], available: false },
  { id: "short-i", label: "Short i", emoji: "🐟", color: "#6BCB77", bg: "#F0FFF4", words: [], available: false },
  { id: "short-o", label: "Short o", emoji: "🐙", color: "#4D96FF", bg: "#EFF6FF", words: [], available: false },
  { id: "short-u", label: "Short u", emoji: "☂️", color: "#C77DFF", bg: "#FAF0FF", words: [], available: false },
];

export default function WordMatch({ onBack }) {
  const [selected, setSelected] = useState(null);

  if (selected) {
    const group = VOWEL_GROUPS.find((g) => g.id === selected);
    return (
      <WordMatchGame
        words={group.words}
        title={group.label}
        color={group.color}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <div className="min-h-full pb-32" style={{ background: "#D6EEFF", fontFamily: "Fredoka, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#A8D0E6", borderBottomLeftRadius: 28, borderBottomRightRadius: 28, padding: "16px 20px 22px", display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={onBack}
          style={{ width: 40, height: 40, borderRadius: 20, background: "rgba(255,255,255,0.7)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
        >
          <ArrowLeft size={22} color="#1E3A5F" />
        </button>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1E3A5F" }}>Word Match 🎯</h1>
          <p style={{ fontSize: 13, color: "#3A6080" }}>Pick a word group!</p>
        </div>
      </div>

      {/* Vowel folders */}
      <div className="px-4 pt-6 flex flex-col gap-3">
        {VOWEL_GROUPS.map((group, i) => (
          <motion.button
            key={group.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            whileTap={group.available ? { scale: 0.97 } : {}}
            onClick={() => group.available && setSelected(group.id)}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "16px 18px", borderRadius: 20,
              background: group.available ? "white" : "rgba(255,255,255,0.55)",
              border: `2px solid ${group.available ? group.color + "55" : "rgba(168,208,230,0.3)"}`,
              boxShadow: group.available ? `0 6px 24px ${group.color}20` : "none",
              cursor: group.available ? "pointer" : "not-allowed",
              opacity: group.available ? 1 : 0.6, width: "100%", textAlign: "left",
            }}
          >
            <div style={{ width: 52, height: 52, borderRadius: 16, background: group.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>
              {group.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#1E3A5F" }}>{group.label}</p>
              <p style={{ fontSize: 13, color: "#7BACC8" }}>{group.available ? "Tap to play!" : "Coming soon"}</p>
            </div>
            {group.available ? (
              <div style={{ width: 32, height: 32, borderRadius: 16, background: group.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "white", fontSize: 18, lineHeight: 1 }}>›</span>
              </div>
            ) : (
              <span style={{ fontSize: 11, fontWeight: 600, color: "#7BACC8", background: "#EEF6FF", padding: "3px 10px", borderRadius: 99 }}>Soon</span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}