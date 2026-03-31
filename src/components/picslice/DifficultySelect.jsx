import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { GAME_DATA } from "../../lib/picSliceData";

const LEVELS = [
  { id: "easy", label: "Easy", emoji: "⭐", desc: "2 words per round", color: "#6BCB77", available: true },
  { id: "difficult", label: "Difficult", emoji: "🌟🌟", desc: "More words, harder!", color: "#FF6B6B", available: false },
];

export default function DifficultySelect({ vowelId, onSelect, onBack }) {
  const data = GAME_DATA[vowelId];
  return (
    <div style={{ background: "#D6EEFF", minHeight: "100%", fontFamily: "Fredoka, sans-serif", paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ background: "#A8D0E6", borderBottomLeftRadius: 28, borderBottomRightRadius: 28, padding: "16px 20px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={onBack}
          style={{ width: 40, height: 40, borderRadius: 20, background: "rgba(255,255,255,0.7)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <ArrowLeft size={22} color="#1E3A5F" />
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1E3A5F" }}>{data.emoji} {data.label}</h1>
      </div>

      {/* Difficulty buttons */}
      <div style={{ padding: "32px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: "#4A90C4", marginBottom: 4 }}>🎮 Choose Difficulty</p>
        {LEVELS.map((level, i) => (
          <motion.button
            key={level.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileTap={level.available ? { scale: 0.97 } : {}}
            onClick={() => level.available && onSelect(level.id)}
            style={{
              display: "flex", alignItems: "center", gap: 16,
              padding: "22px 20px", borderRadius: 22,
              background: level.available ? "white" : "rgba(255,255,255,0.5)",
              border: `2px solid ${level.available ? level.color + "50" : "#D0E8F5"}`,
              boxShadow: level.available ? `0 6px 28px ${level.color}22` : "none",
              cursor: level.available ? "pointer" : "not-allowed",
              opacity: level.available ? 1 : 0.6,
              width: "100%", textAlign: "left",
            }}
          >
            <div style={{ fontSize: 36, lineHeight: 1 }}>{level.emoji}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 24, fontWeight: 700, color: "#1E3A5F" }}>{level.label}</p>
              <p style={{ fontSize: 14, color: "#7BACC8", marginTop: 2 }}>{level.desc}</p>
            </div>
            {level.available ? (
              <div style={{ width: 38, height: 38, borderRadius: 19, background: level.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "white", fontSize: 22, lineHeight: 1 }}>›</span>
              </div>
            ) : (
              <span style={{ fontSize: 12, fontWeight: 600, color: "#7BACC8", background: "#EEF6FF", padding: "4px 12px", borderRadius: 99 }}>Soon</span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}