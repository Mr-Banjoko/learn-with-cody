import { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

export default function LevelCelebration({ onBack, lang = "en" }) {
  useEffect(() => {
    // Big confetti burst
    const fire = (opts) =>
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, ...opts });

    fire({ colors: ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#C77DFF"] });
    setTimeout(() => fire({ angle: 60, colors: ["#4ECDC4", "#FF9F43", "#FFAFC5"] }), 300);
    setTimeout(() => fire({ angle: 120, colors: ["#FFD93D", "#6BCB77", "#FF6B6B"] }), 600);
    setTimeout(() => fire({ particleCount: 120, spread: 120, colors: ["#4ECDC4", "#C77DFF", "#FF6B6B", "#FFD93D"] }), 1000);
  }, []);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      background: "linear-gradient(160deg, #E8FFFE 0%, #FFF9E6 60%, #F5F0FF 100%)",
      fontFamily: "Fredoka, sans-serif",
      alignItems: "center",
      justifyContent: "center",
      gap: 24,
      padding: "32px 28px",
      boxSizing: "border-box",
      textAlign: "center",
    }}>
      {/* Trophy + stars */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.1 }}
        style={{ fontSize: 96, lineHeight: 1, filter: "drop-shadow(0 8px 24px rgba(255,180,0,0.4))" }}
      >
        🏆
      </motion.div>

      {/* Floating stars */}
      {["⭐", "🌟", "✨", "⭐", "🌟"].map((star, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20, scale: 0 }}
          animate={{ opacity: 1, y: [0, -12, 0], scale: 1 }}
          transition={{ delay: 0.3 + i * 0.1, y: { repeat: Infinity, duration: 2 + i * 0.3, ease: "easeInOut" } }}
          style={{
            position: "absolute",
            fontSize: 28,
            top: `${12 + (i % 3) * 10}%`,
            left: i < 3 ? `${8 + i * 12}%` : `${60 + (i - 3) * 14}%`,
            pointerEvents: "none",
          }}
        >
          {star}
        </motion.div>
      ))}

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 260, damping: 20 }}
      >
        <div style={{
          fontSize: 36,
          fontWeight: 800,
          color: "#FF6B6B",
          textShadow: "0 2px 8px rgba(255,107,107,0.25)",
          marginBottom: 6,
        }}>
          {lang === "zh" ? "太棒了！🎉" : "Amazing! 🎉"}
        </div>
        <div style={{
          fontSize: 20,
          fontWeight: 600,
          color: "#4A90C4",
        }}>
          {lang === "zh" ? "你完成了第 1 关！" : "You finished Level 1!"}
        </div>
      </motion.div>

      {/* Word recap pills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}
      >
        {["cat", "dad", "rat", "hat", "bat"].map((w, i) => (
          <motion.div
            key={w}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7 + i * 0.08, type: "spring", stiffness: 320, damping: 18 }}
            style={{
              padding: "8px 18px",
              borderRadius: 999,
              background: ["#FFD3B6", "#A8E6CF", "#A8D8EA", "#FFAFC5", "#FFE5A0"][i],
              fontSize: 20,
              fontWeight: 700,
              color: "#1E3A5F",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            {w}
          </motion.div>
        ))}
      </motion.div>

      {/* Done button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.1, type: "spring", stiffness: 260, damping: 18 }}
        whileTap={{ scale: 0.94 }}
        onClick={onBack}
        style={{
          marginTop: 8,
          padding: "16px 52px",
          borderRadius: 999,
          background: "linear-gradient(135deg, #6BCB77, #4ECDC4)",
          color: "white",
          border: "none",
          cursor: "pointer",
          fontSize: 22,
          fontWeight: 700,
          fontFamily: "Fredoka, sans-serif",
          boxShadow: "0 6px 0 #3aaa58, 0 10px 28px rgba(107,203,119,0.45)",
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {lang === "zh" ? "完成 🎉" : "Done! 🎉"}
      </motion.button>
    </div>
  );
}