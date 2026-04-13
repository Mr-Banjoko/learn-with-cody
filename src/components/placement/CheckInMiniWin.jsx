import { useEffect } from "react";
import { motion } from "framer-motion";

const GAME_NAMES_EN = ["Upper & Lower", "Letter Sounds", "Sound Match", "Letter + Sound"];
const GAME_NAMES_ZH = ["大小写", "字母发音", "声音配对", "字母+声音"];
const CHEER_EMOJIS = ["🌟", "🎉", "✨", "🏆"];

export default function CheckInMiniWin({ gameIdx, onContinue, lang = "en" }) {
  useEffect(() => {
    const t = setTimeout(onContinue, 1800);
    return () => clearTimeout(t);
  }, [onContinue]);

  return (
    <div
      style={{
        display: "flex", flexDirection: "column", height: "100%",
        fontFamily: "Fredoka, sans-serif",
        background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
        alignItems: "center", justifyContent: "center", overflow: "hidden",
      }}
    >
      {/* Floating stars background */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0, x: (i % 2 === 0 ? -1 : 1) * (30 + i * 18), y: (i < 4 ? -1 : 1) * (20 + i * 15) }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.3, 0.5], y: [(i < 4 ? -1 : 1) * (20 + i * 15), (i < 4 ? -1 : 1) * (50 + i * 10)] }}
          transition={{ duration: 1.4, delay: i * 0.08, ease: "easeOut" }}
          style={{
            position: "absolute", fontSize: 28,
            pointerEvents: "none",
          }}
        >
          {["⭐", "✨", "🌟", "💫"][i % 4]}
        </motion.div>
      ))}

      {/* Main celebration */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 18 }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, zIndex: 1 }}
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -8, 8, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 0.7 }}
          style={{ fontSize: 90 }}
        >
          {CHEER_EMOJIS[gameIdx] || "🎉"}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ fontSize: 34, fontWeight: 700, color: "#1E3A5F", margin: 0, textAlign: "center" }}
        >
          {lang === "zh" ? "太棒了！" : "Amazing!"}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          style={{ fontSize: 18, color: "#7BACC8", margin: 0, fontWeight: 600 }}
        >
          {lang === "zh" ? GAME_NAMES_ZH[gameIdx] : GAME_NAMES_EN[gameIdx]} ✓
        </motion.p>

        {/* Progress paws */}
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          {[0, 1, 2, 3].map((i) => (
            <motion.span
              key={i}
              initial={{ scale: i <= gameIdx ? 0.5 : 1 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 + i * 0.06, type: "spring", stiffness: 400 }}
              style={{ fontSize: i <= gameIdx ? 28 : 20, opacity: i <= gameIdx ? 1 : 0.25 }}
            >
              🐾
            </motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}