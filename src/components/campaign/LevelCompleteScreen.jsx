/**
 * LevelCompleteScreen — generic completion/celebration screen.
 *
 * Props:
 *   levelNum  {number}     — level number for display
 *   stars     {0|1|2|3}   — stars earned this attempt
 *   mistakes  {number}     — mistakes made this attempt
 *   onBack    {()=>void}   — navigate back to map
 *   lang      {"en"|"zh"}
 */
import { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import StarRow from "./StarRow";

const STAR_MESSAGES = {
  en: [
    "Keep trying! You can do it! 💪",
    "Good job! Keep going! 🌟",
    "Great work! Almost perfect! 🎉",
    "Amazing! Perfect! 🏆",
  ],
  zh: [
    "继续努力！你能做到！💪",
    "做得好！继续加油！🌟",
    "很棒！几乎完美！🎉",
    "太厉害了！完美！🏆",
  ],
};

const STAR_EMOJI = ["😊", "⭐", "🎉", "🏆"];

export default function LevelCompleteScreen({ levelNum, stars = 3, mistakes = 0, onBack, lang = "en" }) {
  const clampedStars = Math.max(0, Math.min(3, stars));

  useEffect(() => {
    if (clampedStars === 0) return; // no confetti for 0 stars — keep it kind but low-key
    const fire = (ratio, opts) =>
      confetti({ origin: { y: 0.6 }, zIndex: 9999, particleCount: Math.floor(200 * ratio), ...opts });
    const burst = () => {
      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    };
    burst();
    const t1 = setTimeout(burst, 700);
    const t2 = clampedStars === 3 ? setTimeout(burst, 1400) : null;
    return () => {
      clearTimeout(t1);
      if (t2) clearTimeout(t2);
      confetti.reset();
    };
  }, [clampedStars]);

  const messages = STAR_MESSAGES[lang] || STAR_MESSAGES.en;
  const message = messages[clampedStars];
  const emoji = STAR_EMOJI[clampedStars];
  const levelLabel = lang === "zh" ? `第 ${levelNum} 关` : `Level ${levelNum}`;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
        textAlign: "center",
        fontFamily: "Fredoka, sans-serif",
      }}
    >
      {/* Trophy / emoji */}
      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
        style={{ fontSize: 88, lineHeight: 1, marginBottom: 12 }}
      >
        {emoji}
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        style={{ fontSize: 34, fontWeight: 700, color: "#1E293B", margin: "0 0 4px" }}
      >
        {lang === "zh" ? "完成！" : "You did it!"}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38 }}
        style={{ fontSize: 16, color: "#64748B", margin: "0 0 20px", maxWidth: 280 }}
      >
        {levelLabel} {lang === "zh" ? "完成！" : "Complete!"}
      </motion.p>

      {/* Stars */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 220, damping: 16 }}
        style={{ marginBottom: 8 }}
      >
        <StarRow stars={clampedStars} size={52} gap={10} animate />
      </motion.div>

      {/* Message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.75 }}
        style={{ fontSize: 17, color: "#64748B", margin: "0 0 36px", maxWidth: 260 }}
      >
        {message}
      </motion.p>

      {/* Back to Map button */}
      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85 }}
        whileTap={{ scale: 0.95 }}
        onClick={onBack}
        style={{
          padding: "16px 48px",
          borderRadius: 999,
          background: "linear-gradient(135deg, #FF6B6B, #FF9F43)",
          color: "white",
          border: "none",
          fontSize: 20,
          fontWeight: 700,
          fontFamily: "Fredoka, sans-serif",
          cursor: "pointer",
          boxShadow: "0 6px 0 rgba(0,0,0,0.12)",
          touchAction: "manipulation",
        }}
      >
        {lang === "zh" ? "返回地图 🗺️" : "Back to Map 🗺️"}
      </motion.button>
    </div>
  );
}