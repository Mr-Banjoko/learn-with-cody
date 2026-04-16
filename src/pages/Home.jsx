import { motion } from "framer-motion";

const BOX_COLORS = [
  "#4ECDC4",
  "#FF6B6B",
  "#FFD93D",
  "#6BCB77",
  "#A78BFA",
];

export default function Home({ lang = "en" }) {
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

      {/* Box 4 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24, type: "spring", stiffness: 280, damping: 22 }}
        style={{
          flex: "0 0 auto",
          height: 100,
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