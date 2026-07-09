/**
 * StreakCard — homepage box 1: Duolingo-style flame + current streak number.
 * Tapping it opens the monthly activity calendar overlay.
 */
import { motion } from "framer-motion";
import { getCurrentStreak } from "../../lib/activityStreak";

export default function StreakCard({ onOpen, lang = "en" }) {
  const streak = getCurrentStreak();
  const lit = streak > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      whileTap={{ scale: 0.96 }}
      onClick={onOpen}
      style={{
        flex: 1,
        height: 130,
        borderRadius: 22,
        background: lit
          ? "linear-gradient(150deg, #FF9F43 0%, #FF6B6B 100%)"
          : "linear-gradient(150deg, #B8C4CE 0%, #94A3B8 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        boxShadow: lit ? "0 6px 20px rgba(255,120,80,0.40)" : "0 6px 20px rgba(148,163,184,0.35)",
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <motion.span
        animate={lit ? { scale: [1, 1.12, 1], rotate: [0, -4, 4, 0] } : {}}
        transition={{ repeat: Infinity, duration: 1.8 }}
        style={{ fontSize: 38, lineHeight: 1, filter: lit ? "none" : "grayscale(1)" }}
      >
        🔥
      </motion.span>
      <span style={{ fontSize: 32, fontWeight: 700, color: "white", lineHeight: 1.1, textShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
        {streak}
      </span>
      <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
        {lang === "zh" ? "天连胜" : streak === 1 ? "day streak" : "day streak"}
      </span>
    </motion.div>
  );
}