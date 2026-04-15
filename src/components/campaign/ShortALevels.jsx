import { useState } from "react";
import { motion } from "framer-motion";
import BackArrow from "../BackArrow";

const TOTAL_LEVELS = 50;
const COLOR = "#FF6B6B";

// Group levels into sets of 5 for visual "worlds"
const WORLD_THEMES = [
  { name: "Meadow", emoji: "🌸", color: "#FF6B6B", bg: "#FFF0EF" },
  { name: "Ocean", emoji: "🌊", color: "#4D96FF", bg: "#EFF6FF" },
  { name: "Forest", emoji: "🌲", color: "#6BCB77", bg: "#F0FFF4" },
  { name: "Desert", emoji: "🌵", color: "#FF9F43", bg: "#FFF5E6" },
  { name: "Sky", emoji: "⭐", color: "#C77DFF", bg: "#F5F0FF" },
  { name: "Castle", emoji: "🏰", color: "#FFD93D", bg: "#FFFDE7" },
  { name: "Cave", emoji: "💎", color: "#4ECDC4", bg: "#E8FAF9" },
  { name: "Volcano", emoji: "🌋", color: "#FF6B6B", bg: "#FFF0EF" },
  { name: "Jungle", emoji: "🦜", color: "#6BCB77", bg: "#F0FFF4" },
  { name: "Summit", emoji: "🏆", color: "#FFD93D", bg: "#FFFDE7" },
];

export default function ShortALevels({ onBack, onSelectLevel, lang = "en" }) {
  const [tappedLevel, setTappedLevel] = useState(null);

  const handleLevelTap = (levelNum) => {
    setTappedLevel(levelNum);
    setTimeout(() => {
      setTappedLevel(null);
      if (onSelectLevel) onSelectLevel(levelNum);
    }, 200);
  };

  // Build worlds: each world = 5 levels
  const worlds = WORLD_THEMES.map((theme, wi) => ({
    ...theme,
    levels: Array.from({ length: 5 }, (_, li) => wi * 5 + li + 1),
  }));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: "Fredoka, sans-serif",
        background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          flexShrink: 0,
          background: `linear-gradient(135deg, ${COLOR}, #FF8C69)`,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          padding: "12px 20px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          boxShadow: `0 6px 24px ${COLOR}44`,
        }}
      >
        <BackArrow onPress={onBack} />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "white", margin: 0, lineHeight: 1.1 }}>
            🍎 {lang === "zh" ? "短元音 a" : "Short a"}
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", margin: "3px 0 0" }}>
            {lang === "zh" ? "50 个关卡 · 开始冒险！" : "50 Levels · Start your adventure!"}
          </p>
        </div>
        <div
          style={{
            background: "rgba(255,255,255,0.25)",
            borderRadius: 14,
            padding: "6px 12px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", margin: 0 }}>Progress</p>
          <p style={{ fontSize: 18, fontWeight: 700, color: "white", margin: 0 }}>0/50</p>
        </div>
      </div>

      {/* Level scroll area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 16px calc(24px + env(safe-area-inset-bottom, 0px))",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {worlds.map((world, wi) => (
          <motion.div
            key={world.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: wi * 0.06, type: "spring", stiffness: 260, damping: 24 }}
          >
            {/* World header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${world.color}, ${world.color}BB)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  boxShadow: `0 4px 12px ${world.color}44`,
                }}
              >
                {world.emoji}
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#1E3A5F", margin: 0 }}>
                  World {wi + 1}: {world.name}
                </p>
                <p style={{ fontSize: 12, color: "#7BACC8", margin: 0 }}>
                  Levels {world.levels[0]}–{world.levels[world.levels.length - 1]}
                </p>
              </div>
              {/* Divider line */}
              <div style={{ flex: 1, height: 2, background: `${world.color}22`, borderRadius: 2 }} />
            </div>

            {/* Level buttons in a row of 5 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 10,
              }}
            >
              {world.levels.map((levelNum) => (
                <motion.button
                  key={levelNum}
                  whileTap={{ scale: 0.88 }}
                  animate={tappedLevel === levelNum ? { scale: [1, 1.15, 1] } : {}}
                  onClick={() => handleLevelTap(levelNum)}
                  style={{
                    aspectRatio: "1",
                    borderRadius: 18,
                    background: tappedLevel === levelNum
                      ? `linear-gradient(135deg, ${world.color}, ${world.color}BB)`
                      : world.bg,
                    border: `2.5px solid ${world.color}44`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: `0 4px 12px ${world.color}22`,
                    fontFamily: "Fredoka, sans-serif",
                    WebkitTapHighlightColor: "transparent",
                    transition: "background 0.15s",
                    padding: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: tappedLevel === levelNum ? "rgba(255,255,255,0.8)" : "#7BACC8",
                      lineHeight: 1,
                    }}
                  >
                    LVL
                  </span>
                  <span
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: tappedLevel === levelNum ? "white" : world.color,
                      lineHeight: 1.1,
                    }}
                  >
                    {levelNum}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Bottom motivational banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{
            background: "linear-gradient(135deg, #FFD93D, #FF9F43)",
            borderRadius: 22,
            padding: "18px 20px",
            textAlign: "center",
            boxShadow: "0 6px 24px rgba(255,159,67,0.3)",
          }}
        >
          <p style={{ fontSize: 22, margin: 0 }}>🌟</p>
          <p style={{ fontSize: 17, fontWeight: 700, color: "white", margin: "4px 0 2px" }}>
            {lang === "zh" ? "你能完成所有 50 关吗？" : "Can you complete all 50 levels?"}
          </p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", margin: 0 }}>
            {lang === "zh" ? "加油！你是最棒的！" : "You've got this, champ!"}
          </p>
        </motion.div>
      </div>
    </div>
  );
}