import { motion } from "framer-motion";

const BOX_COLORS = [
  "#4ECDC4",
  "#FF6B6B",
  "#FFD93D",
  "#6BCB77",
  "#A78BFA",
];

export default function Home({ onNavigate, lang = "en" }) {
  return (
    <div
      style={{
        fontFamily: "Fredoka, sans-serif",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "16px 16px calc(16px + env(safe-area-inset-bottom, 0px)) 16px",
        gap: 14,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Row 1: boxes 1 & 2 */}
      <div style={{ display: "flex", gap: 14, flex: "0 0 auto" }}>
        {[0, 1].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 280, damping: 22 }}
            style={{
              flex: 1,
              height: 130,
              borderRadius: 22,
              background: BOX_COLORS[i],
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 6px 20px ${BOX_COLORS[i]}55`,
            }}
          >
            <span style={{ fontSize: 40, fontWeight: 700, color: "white", opacity: 0.9 }}>
              {i + 1}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Box 3 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16, type: "spring", stiffness: 280, damping: 22 }}
        style={{
          flex: "0 0 auto",
          height: 100,
          borderRadius: 22,
          background: BOX_COLORS[2],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 6px 20px ${BOX_COLORS[2]}55`,
        }}
      >
        <span style={{ fontSize: 40, fontWeight: 700, color: "white", opacity: 0.9 }}>3</span>
      </motion.div>

      {/* Box 4 — Campaign Mode entry */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24, type: "spring", stiffness: 280, damping: 22 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onNavigate?.("campaign")}
        style={{
          flex: "0 0 auto",
          height: 110,
          borderRadius: 22,
          background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 22px",
          boxShadow: "0 8px 28px rgba(15,52,96,0.5)",
          cursor: "pointer",
          WebkitTapHighlightColor: "transparent",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Shimmer ring */}
        <motion.div
          animate={{ scale: [1, 1.6, 1], opacity: [0.18, 0, 0.18] }}
          transition={{ repeat: Infinity, duration: 2.4 }}
          style={{
            position: "absolute",
            width: 90,
            height: 90,
            borderRadius: 45,
            border: "3px solid rgba(255,255,255,0.35)",
            right: 24,
            pointerEvents: "none",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 2, zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22 }}>🗺️</span>
            <span style={{ fontSize: 21, fontWeight: 700, color: "white" }}>
              {lang === "zh" ? "学习征程" : "Campaign"}
            </span>
          </div>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.60)", marginLeft: 30 }}>
            {lang === "zh" ? "选择元音，开始冒险！" : "Pick a vowel, start your quest!"}
          </span>
          {/* Star progress dots */}
          <div style={{ display: "flex", gap: 5, marginTop: 4, marginLeft: 30 }}>
            {["⭐", "🌟", "✨"].map((s, i) => (
              <motion.span
                key={i}
                animate={{ y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 1.6, delay: i * 0.2 }}
                style={{ fontSize: 13 }}
              >
                {s}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Trophy icon right side */}
        <motion.div
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3, repeatDelay: 1.5 }}
          style={{ fontSize: 42, zIndex: 1, flexShrink: 0 }}
        >
          🏆
        </motion.div>
      </motion.div>

      {/* Box 5 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32, type: "spring", stiffness: 280, damping: 22 }}
        style={{
          flex: 1,
          minHeight: 130,
          borderRadius: 22,
          background: BOX_COLORS[4],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 6px 20px ${BOX_COLORS[4]}55`,
        }}
      >
        <span style={{ fontSize: 40, fontWeight: 700, color: "white", opacity: 0.9 }}>5</span>
      </motion.div>
    </div>
  );
}