import { motion } from "framer-motion";
import { tx } from "../lib/i18n";

const SAVED_KEY = "cody_placement_result";

function getPlacementData() {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY)); } catch { return null; }
}

const BADGE_COLORS = {
  "Sound Explorer": "#4ECDC4",
  "Word Builder": "#FFD93D",
  "Reading Star": "#C77DFF",
};
const BADGE_EMOJI = {
  "Sound Explorer": "🌱",
  "Word Builder": "🏗️",
  "Reading Star": "⭐",
};

const BOX_COLORS = [
  "#4ECDC4", // 1 — teal
  "#FF6B6B", // 2 — coral
  "#FFD93D", // 3 — sunny yellow
  "#6BCB77", // 4 — mint green
  "#A78BFA", // 5 — soft purple
];

export default function Home({ onNavigate, lang = "en" }) {
  const placement = getPlacementData();

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
        {/* Box 1 */}
        <motion.div
          key={0}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0, type: "spring", stiffness: 280, damping: 22 }}
          style={{
            flex: 1, height: 130, borderRadius: 22,
            background: BOX_COLORS[0],
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 6px 20px ${BOX_COLORS[0]}55`,
          }}
        >
          <span style={{ fontSize: 40, fontWeight: 700, color: "white", opacity: 0.9 }}>1</span>
        </motion.div>

        {/* Box 2 — Cody's Sound Adventure */}
        <motion.div
          key={1}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, type: "spring", stiffness: 280, damping: 22 }}
          onClick={() => onNavigate && onNavigate("checkin")}
          style={{
            flex: 1, height: 130, borderRadius: 22,
            background: placement
              ? `linear-gradient(135deg, ${BADGE_COLORS[placement.childBadgeName] || BOX_COLORS[1]}, ${BOX_COLORS[1]})`
              : "linear-gradient(135deg, #FF8C69, #FF6B6B)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            boxShadow: `0 6px 20px ${BOX_COLORS[1]}55`,
            cursor: "pointer", position: "relative", overflow: "hidden",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {placement ? (
            <>
              <span style={{ fontSize: 38 }}>{BADGE_EMOJI[placement.childBadgeName] || "🌟"}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "white", opacity: 0.9, marginTop: 4 }}>
                {placement.childBadgeName}
              </span>
            </>
          ) : (
            <>
              <span style={{ fontSize: 32 }}>🦊</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "white", opacity: 0.9, marginTop: 4, textAlign: "center", padding: "0 6px" }}>
                {lang === "zh" ? "声音冒险" : "Sound Adventure"}
              </span>
            </>
          )}
          {/* Sparkle dot */}
          {!placement && (
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
              style={{
                position: "absolute", top: 10, right: 12,
                width: 10, height: 10, borderRadius: 5,
                background: "rgba(255,255,255,0.9)",
              }}
            />
          )}
        </motion.div>
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