import { motion } from "framer-motion";
import { tx } from "../lib/i18n";

const BOX_COLORS = [
  "#4ECDC4", // 1 — teal
  "#FF6B6B", // 2 — coral
  "#FFD93D", // 3 — sunny yellow
  "#6BCB77", // 4 — mint green
  "#A78BFA", // 5 — soft purple
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
      {/* Row 1: Box 1 + Box 2 side by side */}
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
            <span style={{ fontSize: 40, fontWeight: 700, color: "white", opacity: 0.9 }}>{i + 1}</span>
          </motion.div>
        ))}
      </div>

      {/* Row 2: Box 3 — wide */}
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

      {/* Row 3: Box 4 — centered, medium width */}
      <div style={{ display: "flex", justifyContent: "center", flex: "0 0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, type: "spring", stiffness: 280, damping: 22 }}
          style={{
            width: "58%",
            height: 110,
            borderRadius: 22,
            background: BOX_COLORS[3],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 6px 20px ${BOX_COLORS[3]}55`,
          }}
        >
          <span style={{ fontSize: 40, fontWeight: 700, color: "white", opacity: 0.9 }}>4</span>
        </motion.div>
      </div>

      {/* Row 4: Box 5 — large wide */}
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