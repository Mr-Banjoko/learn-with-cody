import { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

export default function Level21Complete({ onBack, lang = "en" }) {
  useEffect(() => {
    const fire = (r, opts) => confetti({ origin: { y: 0.6 }, zIndex: 9999, particleCount: Math.floor(200 * r), ...opts });
    const burst = () => {
      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2,  { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1,  { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1,  { spread: 120, startVelocity: 45 });
    };
    burst();
    const t1 = setTimeout(burst, 700);
    const t2 = setTimeout(burst, 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); confetti.reset(); };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, alignItems: "center", justifyContent: "center", padding: "32px 24px", textAlign: "center", fontFamily: "Fredoka, sans-serif" }}>
      <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }} style={{ fontSize: 90, lineHeight: 1, marginBottom: 16 }}>🏆</motion.div>
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ fontSize: 36, fontWeight: 700, color: "#1E293B", margin: "0 0 8px" }}>
        {lang === "zh" ? "你做到了！" : "You did it!"}
      </motion.h1>
      <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} style={{ fontSize: 20, color: "#64748B", margin: "0 0 32px", maxWidth: 280 }}>
        {lang === "zh" ? "第 21 关完成！真棒！🎉" : "Level 21 Complete! Amazing work! 🎉"}
      </motion.p>
      <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.55, type: "spring", stiffness: 220, damping: 16 }} style={{ display: "flex", gap: 12, marginBottom: 40 }}>
        {[0, 1, 2].map((i) => (
          <motion.span key={i} animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1.6, delay: i * 0.2 }} style={{ fontSize: 44 }}>⭐</motion.span>
        ))}
      </motion.div>
      <motion.button initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} whileTap={{ scale: 0.95 }} onClick={onBack} style={{ padding: "16px 48px", borderRadius: 999, background: "linear-gradient(135deg, #FF6B6B, #FF9F43)", color: "white", border: "none", fontSize: 20, fontWeight: 700, fontFamily: "Fredoka, sans-serif", cursor: "pointer", boxShadow: "0 6px 0 rgba(0,0,0,0.12)", touchAction: "manipulation" }}>
        {lang === "zh" ? "返回地图 🗺️" : "Back to Map 🗺️"}
      </motion.button>
    </div>
  );
}